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
| `describe_deck` | Show a deck's note types, their fields, what each field holds, and which fields each card template displays. |
| `create_note` | Add a note to a note type, filling its text fields. Cards are generated automatically. |
| `add_field` | Add a text field to a note type. |
| `delete_field` | Remove a field from a note type, deleting its content from every note. |
| `search_notes` | Find notes whose text contains a phrase. Case-insensitive, across all text fields. |
| `list_notes` | Browse a deck's notes, previewing their first text fields. |
| `get_note` | Show every field of one note, and the cards it produces. |

### Reading notes

`search_notes` scans a deck's notes in memory — `ObjectManager.query` matches exact
values, which is no help for finding a phrase. Matching ignores case and covers every
text field, reporting which field matched and the text around it.

Results are paged: 20 by default, 100 at most. The total is always reported, so a caller
can tell a partial view from a complete one and page with `offset`.

Only text is searchable. Image and audio fields are described rather than returned —
their contents cannot cross this transport, and saying so keeps a model from claiming
otherwise.

The search itself lives in `core` (`core/search.js`), not here, so the web client can
adopt it: its browse view currently does the same job inline, case-sensitively, and with
its field filter unimplemented.

### Changing a note type's fields

Fields belong to the note type, so adding or removing one changes every note of that type.

`add_field` creates **text fields only**, for the same reason `create_note` fills only
those: the other kinds hold a file or generate their own content, so creating one would
leave a field nothing here could fill. A new field does not appear on any card until a
card template is edited to reference it, which this server cannot do.

`delete_field` destroys the field's content on every note. Called without `confirm` it
deletes nothing and reports what would happen instead:

```
Deleting "Back" ({{back}}, text) from "vocab" would:
  - delete its content from 3 of 3 note(s)
  - leave 1 card template(s) rendering it blank: recall

Nothing has been deleted. Re-run with confirm: true to go ahead.
```

That is not a security barrier — a model can set `confirm` itself — but it puts the
consequences in front of the user before anything is lost, which is worth the extra call
for something irreversible.

Deleting the last field of a note type also removes its notes, since a note with no
fields holds nothing worth storing. The dry run says so explicitly.

### Creating notes

`create_note` takes values keyed by field. Every field has two names — a display
name for people, and a **slug** that card templates reference as `{{slug}}` — and the slug
is canonical, though the display name is accepted too. `describe_deck` shows both, along
with each field's description, which is what makes the difference between filling a note
correctly and putting the answer in the prompt field.

Everything is validated before anything is written: unknown fields, non-text fields and
empty values are all rejected with the reason, and nothing partial is left behind. This
matters because a note with no content deletes itself on save.

Only text fields can be set. Image and audio fields are reported as read-only, and
generated audio fields fill themselves from a text field.

Notes are saved locally. Run `sync_decks` again to send them to the server — there is
deliberately no automatic sync.

The server also ships a description of the domain model — decks, note types, fields,
notes, card templates, variants and cards — in its MCP `instructions`, so a model knows
how the pieces fit together without spending a tool call to ask.

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

## Installing as a Claude Desktop extension

The packaged form is an `.mcpb` bundle — a single file you drag onto
**Settings → Extensions**. It carries its own dependencies and uses the Node runtime
Claude Desktop ships, so there is no config file to edit and no Node path to hardcode.
Settings are collected in the UI rather than from `.env`, and the Google client secret is
stored by the OS rather than sitting in a file.

```bash
npm run bundle     # builds, stages a self-contained tree, writes learnthings.mcpb
```

`scripts/bundle.mjs` does the staging. The development layout cannot be packed as-is:
`core` is a `file:` dependency, so npm links it as a symlink, and its `node_modules`
carries build and test tooling. The script instead writes a fresh `package.json` holding
the runtime dependencies of both packages, installs them production-only into a single
hoisted tree, and copies `core/build` in as a real directory. The result is ~31MB packed.

`leveldown`, PouchDB's storage engine, is a native module, but it ships N-API prebuilds
for every platform and those are included, so the bundle is not tied to one machine's
Node build.

## Manual configuration (development)

Editing the config file directly is still useful while working on the server, since it
runs `build/` in place with no packing step.



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

**stdout is reserved.** The stdio transport frames JSON-RPC on stdout, so nothing else may
be written there. core routes its diagnostics through a sink you can replace
(`setLogSink` in `core/utils/log.js`); `src/log.ts` points that at stderr, which Claude
Desktop surfaces in its MCP logs. Writing to stdout anywhere in this server will break the
transport.

**Local databases are CWD-relative.** core's `getOrCreateDB` calls `new PouchDB(name)`
with no prefix, and the Node LevelDB adapter creates a directory per database relative to
the process CWD — which Claude Desktop sets arbitrarily. `ensureDataDir()` therefore
`chdir`s into the data directory once before any database is opened.

Two earlier workarounds have been fixed in core itself and no longer live here: core now
emits fully specified imports, so Node loads it without a resolution hook and this package
uses ordinary `moduleResolution: "NodeNext"`; and core patches PouchDB's attachment
reading for Node's built-in fetch, so replicating attachments works from any Node host.

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
