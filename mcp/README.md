# learnthings-mcp

A local [MCP](https://modelcontextprotocol.io) server that exposes learnthings decks to
Claude Desktop. It authenticates as a real user against the learnthings backend and keeps
a local PouchDB replica of that user's decks, driven by the same `core` package the web
client uses.

Current scope: **authenticate** and **sync decks**. Deck manipulation tools build on top
of the loaded `Deck` objects.

## Tools

| Tool | Purpose |
|---|---|
| `login` | Sign in with email + password. Caches the session; normally needed once. |
| `login_with_google` | Sign in with a Google account via the browser. Required for Google-created accounts, which have no password. |
| `auth_status` | Who is signed in, which backend, where local data lives. |
| `logout` | Clear the session and delete cached credentials. |
| `sync_decks` | Reconcile decks between the server and the local copy, both directions, then load them. One-shot by default. |
| `list_decks` | List locally loaded decks with note type, note and card counts. Local reads only. |

### Sync model

`sync_decks` reconciles in **both directions**, exactly as the web client does on login:

- decks found only on the server get a local database
- decks found only locally get a database created on the server
- everything discovered is then replicated both ways

It is a **single pass that leaves nothing running**. Local decks stay exactly as they are
until you run it again, so a work session never races a background replication. Re-running
`sync_decks` *is* the resync — and unlike a dedicated resync command it also picks up decks
created on either side in the meantime.

```
sync_decks        reconcile + replicate, once
  ...work...
sync_decks        push it back up, pull anything new, once
```

Anything still dirty in memory is persisted before a re-sync, so in-flight work is not
lost when the databases are reopened.

Pass `live: true` for core's original behaviour instead: continuous replication per deck
for the life of the server process. Live mode keeps the local *database* current but does
not refresh already-loaded in-memory decks — only `sync_decks` reloads those.

## Setup

```bash
cd mcp
npm install
npm run build
```

`core` must be built first (`cd ../core && npm run build`) — this package consumes
`core/build`.

## Claude Desktop configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "learnthings": {
      "command": "node",
      "args": ["/absolute/path/to/learnthings/mcp/build/index.js"],
      "env": {
        "LEARNTHINGS_COUCH_HOST": "http://localhost:3000",
        "LEARNTHINGS_USE_AUTH_EMULATOR": "true"
      }
    }
  }
}
```

Restart Claude Desktop afterwards. Then ask it to run `login`, followed by `sync_decks`.

### Google sign-in

Accounts created through Google sign-in have no password, so `login` cannot authenticate
them — `login_with_google` is the way in.

The browser flow is the standard native-app pattern: the server binds a loopback listener
on `127.0.0.1`, opens Google's consent screen, receives the authorization code back on the
loopback redirect (authorization code + PKCE), then exchanges the resulting **Google** ID
token for a **Firebase** one via `accounts:signInWithIdp`. From there everything is
identical to password sign-in — the proxy only ever verifies a Firebase token and reads
the `couchId` claim, so it neither knows nor cares which provider was used.

The refresh token is cached like any other session, so the browser trip happens once, not
once per server start.

**Against the emulator no browser and no OAuth client are needed** — the auth emulator
accepts a synthesised Google token, so pass the identity to simulate:

```
login_with_google { "email": "someone@example.test" }
```

> **Emulator and real Google do not mix.** A real Google sign-in yields a *production*
> Firebase token, and `backend/docker-compose.override.yml` points the local proxy at the
> auth emulator (`FIREBASE_AUTH_EMULATOR_HOST`), which cannot verify one. So real Google
> sign-in needs a backend running against real Firebase — i.e. staging, not the local
> stack. Conversely, with the emulator on, `login_with_google` never contacts Google at
> all and signs you in as a simulated identity.

**For real Google** you need an OAuth client of type **Desktop app**, created in the same
Google Cloud project as Firebase (`learnthings-app`):
*APIs & Services → Credentials → Create credentials → OAuth client ID → Desktop app*.
Then set `LEARNTHINGS_GOOGLE_CLIENT_ID` (and `LEARNTHINGS_GOOGLE_CLIENT_SECRET`, which
Google issues for desktop clients and its token endpoint expects — for installed apps it
is documented as not confidential). These can go in `mcp/.env`, which is gitignored; see
`.env.example`. Real environment variables take precedence over that file, so a launcher's
`env` block still wins. The tool call blocks while you complete the flow; if
the browser fails to open, the consent URL is returned in the error and logged to stderr.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `LEARNTHINGS_COUCH_HOST` | `http://localhost:3000` | The **proxy** in front of CouchDB (`backend/proxy`), not CouchDB itself. |
| `LEARNTHINGS_USE_AUTH_EMULATOR` | `false` | Point Firebase Auth at the local emulator. |
| `LEARNTHINGS_AUTH_EMULATOR_HOST` | `http://localhost:9099` | Emulator address when the above is `true`. |
| `LEARNTHINGS_FIREBASE_API_KEY` | project web key | Override for a different Firebase project. |
| `LEARNTHINGS_EMAIL` / `LEARNTHINGS_PASSWORD` | — | Optional: sign in at startup without calling `login`. |
| `LEARNTHINGS_GOOGLE_CLIENT_ID` | — | OAuth "Desktop app" client id. Required for real Google sign-in; unused against the emulator. |
| `LEARNTHINGS_GOOGLE_CLIENT_SECRET` | — | Secret issued alongside that client. |
| `LEARNTHINGS_GOOGLE_TIMEOUT_MS` | `120000` | How long to wait for the browser flow. |
| `LEARNTHINGS_GOOGLE_NO_BROWSER` | `false` | Report the consent URL instead of launching a browser (headless/SSH). |
| `LEARNTHINGS_STATE_DIR` | `~/.learnthings-mcp` | Session cache + data root. |
| `LEARNTHINGS_DATA_DIR` | `<state>/data` | Local PouchDB (LevelDB) directories. |

To target staging instead, set `LEARNTHINGS_COUCH_HOST` to the staging host and leave the
emulator off (see `frontendv2/.env.staging`).

## How it works

Authentication mirrors the web client: Firebase sign-in — by password or by Google —
yields an ID token carrying a `couchId` custom claim, which is the identity CouchDB
database names are keyed on. Requests reach CouchDB through `backend/proxy`, which verifies the token and derives
the user server-side. A new account is provisioned via `POST /auth/provision` on first
sign-in, exactly as `frontendv2/src/lib/auth.ts` does.

Sign-in uses Firebase's REST API rather than the `firebase` SDK: the SDK's Node build has
no persistence, so refresh tokens would need managing by hand regardless. The refresh
token is cached at `~/.learnthings-mcp/auth.json` (mode `0600`) so restarts do not require
re-entering a password.

`sync_decks` calls `PouchDeckRegistry.discover()`, which returns the union of local and
remote deck ids and registers a local database for anything found only on the server.
Each deck is then replicated — creating the remote database if it existed only locally —
and rehydrated through an `ObjectManager` registered with the same object classes as the
web client.

## Implementation notes

Three things about this environment are worth knowing before changing the server.

**stdout is reserved.** The stdio transport frames JSON-RPC on stdout, and `core` logs
freely with `console.log` (56 call sites). `src/log.ts` pins every console channel to
stderr, and `src/index.ts` installs that redirect *before* dynamically importing anything
that pulls in core. Writing to stdout anywhere in this server will break the transport.

**core's emitted JS is not directly loadable by Node.** It is compiled with
`moduleResolution: "node"`, so its output contains extensionless relative imports
(`from "./PouchDB"`). Vite resolves these, which is why frontendv2 works, but Node's ESM
loader throws `ERR_MODULE_NOT_FOUND`. `src/resolver.ts` is a resolution hook that retries
failed relative specifiers with `.js` and `/index.js`. It only runs after normal
resolution fails, so it cannot shadow a correct resolution.

The same mismatch affects types, which is why `tsconfig.json` uses `moduleResolution:
"Bundler"` — under NodeNext, core's base classes fail to resolve and every *inherited*
member silently disappears from the type.

> The durable fix for both is to make `core` emit fully specified imports (add `.js` to
> its relative imports and build with NodeNext). That is ~104 imports across 23 files and
> would need frontendv2 re-verified, so it is deliberately not done here. Once it is, this
> resolver hook and the `Bundler` setting can both go away.
>
> The fetch shim is a different matter: it belongs wherever `core` is used from Node, and
> should move into `core` if anything else grows a Node entry point.

**PouchDB cannot read attachments from Node's built-in fetch.** PouchDB 9.0.0 chooses how
to read an attachment body with `if ('buffer' in response)` — the node-fetch v2 API. Node
18+ ships undici, whose `Response` has no `.buffer()`, so PouchDB takes the browser branch,
produces a `Blob`, and hands it to `binaryMd5`, which calls Node's crypto and throws
`ERR_INVALID_ARG_TYPE`. The rejection escapes the replication promise, so the sync hangs
rather than failing. `src/fetch-compat.ts` restores a lazy `.buffer()` on fetch responses,
which puts PouchDB back on the Node branch. Only decks carrying attachments hit this; the
browser client is unaffected, since there a Blob is correct. 9.0.0 is the latest release,
so there is no upstream fix to take yet.

**Local databases are CWD-relative.** core's `getOrCreateDB` calls `new PouchDB(name)`
with no prefix, and the Node LevelDB adapter creates a directory per database relative to
the process CWD — which Claude Desktop sets arbitrarily. `ensureDataDir()` therefore
`chdir`s into the data directory once before any database is opened.

## Known limitations

- In `live: true` mode, in-memory decks are not refreshed as replication arrives.
- Loading a deck runs `createMissingCards()`, so a deck can come back from the server and
  immediately hold unsaved cards. They are persisted on the next `sync_decks`, which is
  also when they reach the server.
- `login_with_google` blocks the tool call while the browser flow completes. Set
  `LEARNTHINGS_GOOGLE_NO_BROWSER=true` on a headless host to have the URL reported instead
  of launching a browser.
- If your MCP client enforces a tool timeout shorter than `LEARNTHINGS_GOOGLE_TIMEOUT_MS`,
  lower that variable.
- Deleting a deck is not handled here; `sync_decks` only ever adds and reconciles.
- Decks are loaded into memory on sync. Very large collections have not been profiled.
- Attachments are replicated by PouchDB but no tool surfaces them yet.
