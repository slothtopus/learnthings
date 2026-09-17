import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import type { AddressInfo } from "node:net";

import { config } from "./config.js";
import { log } from "./log.js";

const base64url = (buf: Buffer) => buf.toString("base64url");

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * Open a URL in the user's default browser. Best effort — if this fails the
 * caller still has the URL and can present it for manual opening.
 */
const openBrowser = (url: string) => {
  const [cmd, args] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  try {
    spawn(cmd, args, { detached: true, stdio: "ignore" }).unref();
    return true;
  } catch (err) {
    log(`could not open a browser: ${(err as Error).message}`);
    return false;
  }
};

const page = (title: string, body: string) =>
  `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
  `<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;` +
  `height:100vh;margin:0;background:#121416;color:#e2e2e5">` +
  `<div style="text-align:center"><h1 style="font-weight:300">${title}</h1>` +
  `<p style="color:#bcc9c5">${body}</p></div>`;

/**
 * In emulator mode there is no real Google to talk to. The Firebase auth
 * emulator accepts a synthesised, unsigned ID token for an IdP sign-in, so we
 * skip the browser entirely. `sub` is derived from the email so that signing in
 * repeatedly maps to the same emulator user.
 */
const emulatorIdToken = (email: string) => {
  const sub = `google-${createHash("sha256").update(email).digest("hex").slice(0, 20)}`;
  return JSON.stringify({ sub, email, email_verified: true });
};

export type GoogleFlow = {
  /** Resolves with the consent URL once the loopback listener is bound. */
  url: Promise<string>;
  /** Resolves with a Google ID token once the user finishes in the browser. */
  idToken: Promise<string>;
  cancel: () => void;
};

/**
 * OAuth 2.0 authorization-code flow with PKCE against a loopback redirect —
 * the standard flow for native and CLI applications. Requires an OAuth client
 * of type "Desktop app" in the same Google Cloud project as Firebase.
 */
export const startGoogleFlow = (): GoogleFlow => {
  if (!config.googleClientId) {
    throw new Error(
      "Google sign-in is not configured. Set LEARNTHINGS_GOOGLE_CLIENT_ID to an OAuth " +
        "client of type 'Desktop app' from the Firebase project's Google Cloud console.",
    );
  }

  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const state = base64url(randomBytes(16));

  let settle: (value: string) => void;
  let fail: (err: Error) => void;
  const idToken = new Promise<string>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });

  const server = createServer();
  let timer: NodeJS.Timeout | undefined;
  const shutdown = () => {
    if (timer) clearTimeout(timer);
    server.close();
  };

  // Captured once while the server is listening. Reading server.address()
  // later is not safe: it returns null after the server is closed, and the
  // token exchange needs the identical redirect_uri that was authorized.
  let redirectUri = "";

  server.on("request", async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (url.pathname !== "/callback") {
      res.writeHead(404).end();
      return;
    }

    const err = url.searchParams.get("error");
    const code = url.searchParams.get("code");
    const returnedState = url.searchParams.get("state");

    const reject = (status: number, title: string, detail: string, thrown: string) => {
      res.writeHead(status, { "Content-Type": "text/html" });
      res.end(page(title, detail));
      shutdown();
      fail(new Error(thrown));
    };

    if (err || !code) {
      reject(400, "Sign-in failed", err ?? "No authorization code was returned.",
        `Google returned: ${err ?? "no authorization code"}`);
      return;
    }
    // Constant-time compare so the expected state cannot be probed by timing.
    const ok =
      returnedState !== null &&
      returnedState.length === state.length &&
      timingSafeEqual(
        new Uint8Array(Buffer.from(returnedState)),
        new Uint8Array(Buffer.from(state)),
      );
    if (!ok) {
      reject(400, "Sign-in failed", "State mismatch — the request may have been tampered with.",
        "OAuth state mismatch");
      return;
    }

    // Exchange before shutting down, so redirectUri is still meaningful and a
    // failure can still be reported on this response.
    try {
      const token = await exchangeCode(code, verifier, redirectUri);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(page("Signed in", "You can close this tab and return to Claude."));
      shutdown();
      settle(token);
    } catch (e) {
      reject(500, "Sign-in failed", "Could not exchange the authorization code.",
        (e as Error).message);
    }
  });

  const url = new Promise<string>((resolve, rejectUrl) => {
    server.once("error", (e) => rejectUrl(e));
    server.once("listening", () => {
      const { port } = server.address() as AddressInfo;
      redirectUri = `http://127.0.0.1:${port}/callback`;
      const params = new URLSearchParams({
        client_id: config.googleClientId!,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        code_challenge: challenge,
        code_challenge_method: "S256",
        state,
        access_type: "offline",
        prompt: "select_account",
      });
      const authUrl = `${GOOGLE_AUTH_URL}?${params}`;

      if (!config.googleNoBrowser) openBrowser(authUrl);
      timer = setTimeout(() => {
        shutdown();
        fail(new Error(`Timed out after ${config.googleTimeoutMs / 1000}s waiting for sign-in.`));
      }, config.googleTimeoutMs);
      resolve(authUrl);
    });
  });

  server.listen(0, "127.0.0.1");

  return { url, idToken, cancel: shutdown };
};

const exchangeCode = async (code: string, verifier: string, redirectUri: string) => {
  const body = new URLSearchParams({
    code,
    client_id: config.googleClientId!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });
  // Desktop clients are still issued a secret; Google documents it as not
  // confidential for installed apps, but the token endpoint expects it.
  if (config.googleClientSecret) {
    body.set("client_secret", config.googleClientSecret);
  }

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    throw new Error(`Google token exchange failed: ${await resp.text()}`);
  }
  const { id_token } = (await resp.json()) as { id_token?: string };
  if (!id_token) throw new Error("Google did not return an ID token");
  return id_token;
};

/** Google ID token for `email`, without a browser. Emulator only. */
export const emulatorGoogleIdToken = (email: string) => emulatorIdToken(email);
