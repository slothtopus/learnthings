import { homedir } from "node:os";
import { join } from "node:path";

const env = (key: string) => {
  const v = process.env[key];
  return v === undefined || v.trim() === "" ? undefined : v.trim();
};

const bool = (key: string) => env(key)?.toLowerCase() === "true";

/**
 * The Firebase web API key. This is the same public key the browser client
 * ships with (frontendv2/src/lib/firebase.ts) — it is not a secret, it only
 * identifies the Firebase project. Overridable for other environments.
 */
const DEFAULT_FIREBASE_API_KEY = "AIzaSyADN3neFvxJd8TMHvpLGfwukHOufUOeCHU";

const DEFAULT_EMULATOR_HOST = "http://localhost:9099";

const stateDir = env("LEARNTHINGS_STATE_DIR") ?? join(homedir(), ".learnthings-mcp");

/**
 * When the auth emulator is in play, Firebase's REST endpoints are served
 * under the emulator host with the production hostname as a path prefix.
 */
const emulatorHost = bool("LEARNTHINGS_USE_AUTH_EMULATOR")
  ? (env("LEARNTHINGS_AUTH_EMULATOR_HOST") ?? DEFAULT_EMULATOR_HOST).replace(/\/+$/, "")
  : undefined;

export const config = {
  /** The proxy in front of CouchDB (backend/proxy), not CouchDB itself. */
  couchHost: (env("LEARNTHINGS_COUCH_HOST") ?? "http://localhost:3000").replace(/\/+$/, ""),

  firebaseApiKey: env("LEARNTHINGS_FIREBASE_API_KEY") ?? DEFAULT_FIREBASE_API_KEY,
  emulatorHost,
  usingEmulator: emulatorHost !== undefined,

  /** Optional non-interactive credentials, so a session can start already signed in. */
  email: env("LEARNTHINGS_EMAIL"),
  password: env("LEARNTHINGS_PASSWORD"),

  /**
   * OAuth client of type "Desktop app" from the same Google Cloud project as
   * Firebase. Required for real Google sign-in; unused against the emulator,
   * which accepts a synthesised token instead.
   */
  googleClientId: env("LEARNTHINGS_GOOGLE_CLIENT_ID"),
  googleClientSecret: env("LEARNTHINGS_GOOGLE_CLIENT_SECRET"),
  /** How long to wait for the user to finish in the browser. */
  googleTimeoutMs: Number(env("LEARNTHINGS_GOOGLE_TIMEOUT_MS") ?? 120_000),
  /** Skip launching a browser (headless hosts, SSH); the URL is reported instead. */
  googleNoBrowser: bool("LEARNTHINGS_GOOGLE_NO_BROWSER"),

  stateDir,
  /** Refresh token cache. Written 0600. */
  authFile: join(stateDir, "auth.json"),
  /** LevelDB directories for the local PouchDB replicas live here. */
  dataDir: env("LEARNTHINGS_DATA_DIR") ?? join(stateDir, "data"),

  identityBaseUrl: emulatorHost
    ? `${emulatorHost}/identitytoolkit.googleapis.com/v1`
    : "https://identitytoolkit.googleapis.com/v1",
  secureTokenBaseUrl: emulatorHost
    ? `${emulatorHost}/securetoken.googleapis.com/v1`
    : "https://securetoken.googleapis.com/v1",
} as const;

export type Config = typeof config;
