import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { dirname } from "node:path";

import { config } from "./config.js";
import { log } from "./log.js";
import { startGoogleFlow, emulatorGoogleIdToken } from "./google.js";

type StoredAuth = { refreshToken: string; email?: string };

type TokenClaims = {
  /** CouchDB user id, set as a custom claim by backend/proxy on provisioning. */
  couchId?: string;
  email?: string;
  exp: number;
  user_id?: string;
  sub?: string;
  firebase?: { sign_in_provider?: string };
};

const decodeClaims = (idToken: string): TokenClaims => {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Malformed ID token");
  const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as TokenClaims;
};

/** Firebase returns errors as { error: { message: "INVALID_PASSWORD", ... } }. */
const readError = async (resp: Response) => {
  const body = await resp.text();
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.message ?? parsed?.error ?? body;
  } catch {
    return body || `HTTP ${resp.status}`;
  }
};

const FRIENDLY: Record<string, string> = {
  EMAIL_NOT_FOUND: "No account exists with that email address.",
  INVALID_PASSWORD: "Incorrect password.",
  INVALID_LOGIN_CREDENTIALS: "Incorrect email or password.",
  USER_DISABLED: "That account has been disabled.",
  TOKEN_EXPIRED: "The saved session has expired — sign in again.",
  INVALID_REFRESH_TOKEN: "The saved session is no longer valid — sign in again.",
};

const friendly = (raw: string) => FRIENDLY[raw] ?? raw;

/**
 * Holds the signed-in user for the life of the server process, and caches the
 * refresh token on disk so a restart does not require re-entering a password.
 *
 * Talks to Firebase Auth over REST. The `couchId` custom claim on the ID token
 * is the identity that CouchDB database names are keyed on.
 */
export class AuthSession {
  private idToken?: string;
  private refreshToken?: string;
  private expiresAt = 0;
  private claims?: TokenClaims;

  get signedIn() {
    return this.idToken !== undefined && this.couchId !== undefined;
  }

  get couchId() {
    return this.claims?.couchId;
  }

  get email() {
    return this.claims?.email;
  }

  /** How the current session was established, e.g. "password" or "google.com". */
  get provider() {
    return this.claims?.firebase?.sign_in_provider;
  }

  get expiresAtMs() {
    return this.expiresAt;
  }

  private apply(idToken: string, refreshToken: string, expiresInSeconds: number) {
    this.idToken = idToken;
    this.refreshToken = refreshToken;
    this.expiresAt = Date.now() + expiresInSeconds * 1000;
    this.claims = decodeClaims(idToken);
  }

  async signIn(email: string, password: string) {
    const resp = await fetch(
      `${config.identityBaseUrl}/accounts:signInWithPassword?key=${config.firebaseApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    if (!resp.ok) throw new Error(`Sign-in failed: ${friendly(await readError(resp))}`);

    const { idToken, refreshToken, expiresIn } = (await resp.json()) as {
      idToken: string;
      refreshToken: string;
      expiresIn: string;
    };
    this.apply(idToken, refreshToken, Number(expiresIn));

    // A brand new account has no couchId claim until the proxy provisions it.
    if (this.couchId === undefined) {
      await this.provision();
    }
    await this.save();
    return this.couchId!;
  }

  /**
   * Sign in with Google.
   *
   * Against the emulator this needs no browser and no OAuth client: the
   * emulator accepts a synthesised Google token. Otherwise it runs a loopback
   * authorization-code flow (see google.ts) and trades the resulting Google ID
   * token for a Firebase one.
   *
   * `onPrompt` is called with the consent URL once it is known, so the caller
   * can surface it if the browser did not open.
   */
  async signInWithGoogle(opts: { email?: string; onPrompt?: (url: string) => void } = {}) {
    let googleIdToken: string;

    if (config.usingEmulator) {
      const email = opts.email ?? config.email;
      if (!email) {
        throw new Error(
          "In emulator mode, pass an email to sign in as (there is no real Google to ask).",
        );
      }
      googleIdToken = emulatorGoogleIdToken(email);
      log(`emulator Google sign-in as ${email}`);
    } else {
      const flow = startGoogleFlow();
      // Surface the consent URL before blocking on the browser, so a caller can
      // show it if the browser did not open.
      opts.onPrompt?.(await flow.url);
      googleIdToken = await flow.idToken;
    }

    const resp = await fetch(
      `${config.identityBaseUrl}/accounts:signInWithIdp?key=${config.firebaseApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postBody: new URLSearchParams({
            id_token: googleIdToken,
            providerId: "google.com",
          }).toString(),
          requestUri: "http://localhost",
          returnSecureToken: true,
        }),
      },
    );
    if (!resp.ok) {
      throw new Error(`Google sign-in failed: ${friendly(await readError(resp))}`);
    }

    const { idToken, refreshToken, expiresIn } = (await resp.json()) as {
      idToken: string;
      refreshToken: string;
      expiresIn: string;
    };
    this.apply(idToken, refreshToken, Number(expiresIn));

    if (this.couchId === undefined) {
      await this.provision();
    }
    await this.save();
    return this.couchId!;
  }

  /** Exchange the refresh token for a fresh ID token. */
  private async refresh() {
    if (this.refreshToken === undefined) throw new Error("Not signed in");

    const resp = await fetch(`${config.secureTokenBaseUrl}/token?key=${config.firebaseApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
    });
    if (!resp.ok) throw new Error(`Token refresh failed: ${friendly(await readError(resp))}`);

    const body = (await resp.json()) as {
      id_token: string;
      refresh_token: string;
      expires_in: string;
    };
    this.apply(body.id_token, body.refresh_token, Number(body.expires_in));
    await this.save();
  }

  /**
   * Ask the proxy to create the CouchDB user and attach the couchId claim,
   * then force a refresh so the new claim is present on our token.
   */
  private async provision() {
    log(`provisioning account with ${config.couchHost}`);
    const resp = await fetch(`${config.couchHost}/auth/provision`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.idToken}` },
    });
    if (!resp.ok) {
      const detail = await readError(resp);
      // The commonest cause is a mismatch between which Firebase the token came
      // from and which one the backend verifies against.
      const hint =
        resp.status === 401 && !config.usingEmulator
          ? " — the backend could not verify this token. A real Google sign-in produces a " +
            "production Firebase token, which a backend pointed at the auth emulator " +
            "cannot verify. Point LEARNTHINGS_COUCH_HOST at a backend using real Firebase."
          : "";
      throw new Error(`Provisioning failed: ${detail}${hint}`);
    }
    await this.refresh();
    if (this.couchId === undefined) {
      throw new Error("Provisioning succeeded but no couchId claim was issued");
    }
  }

  /** A valid ID token, refreshed when it is close to expiry. */
  async getIdToken(): Promise<string> {
    if (this.idToken === undefined) throw new Error("Not signed in");
    if (Date.now() > this.expiresAt - 60_000) {
      await this.refresh();
    }
    return this.idToken;
  }

  /** Shape core's PouchDeckRegistry expects. Returns undefined when signed out. */
  tokenGenerator = async (): Promise<string | undefined> => {
    if (this.idToken === undefined) return undefined;
    try {
      return await this.getIdToken();
    } catch (err) {
      log(`tokenGenerator: ${(err as Error).message}`);
      return undefined;
    }
  };

  private async save() {
    if (this.refreshToken === undefined) return;
    const stored: StoredAuth = { refreshToken: this.refreshToken, email: this.email };
    await mkdir(dirname(config.authFile), { recursive: true, mode: 0o700 });
    await writeFile(config.authFile, JSON.stringify(stored, null, 2), { mode: 0o600 });
  }

  async signOut() {
    this.idToken = undefined;
    this.refreshToken = undefined;
    this.claims = undefined;
    this.expiresAt = 0;
    await rm(config.authFile, { force: true });
  }

  /**
   * Best-effort restore at startup: cached refresh token first, then
   * LEARNTHINGS_EMAIL/PASSWORD if they are configured. Never throws —
   * a failure here just means the user needs to call the login tool.
   */
  async restore(): Promise<boolean> {
    try {
      const raw = await readFile(config.authFile, "utf8");
      const { refreshToken } = JSON.parse(raw) as StoredAuth;
      if (refreshToken) {
        this.refreshToken = refreshToken;
        await this.refresh();
        log(`restored session for ${this.email ?? this.couchId}`);
        return true;
      }
    } catch (err) {
      log(`no usable cached session (${(err as Error).message})`);
    }

    if (config.email && config.password) {
      try {
        await this.signIn(config.email, config.password);
        log(`signed in from environment as ${this.email}`);
        return true;
      } catch (err) {
        log(`environment sign-in failed: ${(err as Error).message}`);
      }
    }
    return false;
  }
}

export const auth = new AuthSession();
