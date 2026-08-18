# CLAUDE.md — frontendv2

This is the v2 frontend for **learnthings**, a flashcard/spaced-repetition learning app. Built with Vue 3, TypeScript, Tailwind CSS v4, and shadcn-vue.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Language | TypeScript 5.9 (strict mode) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | Vue Router 5 (lazy-loaded routes) |
| UI primitives | reka-ui (Popover, DropdownMenu, Tooltip) via shadcn-vue |
| Icons | Material Symbols Outlined (variable font) |
| Utilities | clsx, tailwind-merge, class-variance-authority, @vueuse/core, lodash-es, luxon |
| Code editor | CodeMirror 6 (HTML + CSS language support) |
| Data layer | `core` (local workspace package, `file:../core`) over PouchDB/CouchDB |
| Auth | Firebase Auth |

---

## Project Structure

```
src/
├── views/          # One component per route, lazy-loaded
├── components/
│   ├── common/     # Shared components used across features
│   ├── ui/         # shadcn-vue primitives (dropdown-menu, popover, tooltip)
│   ├── browse-notes/
│   ├── deck-summary/
│   ├── library/
│   ├── note-editor/
│   ├── renderer/   # Card rendering + widget system
│   ├── review/
│   └── template-editor/
├── composables/    # Reactive data access, auth, dialogs
├── lib/            # Non-reactive services, Firebase, object manager, helpers
├── router/
│   └── index.ts    # Route definitions + auth/loading guards
├── assets/
├── App.vue         # TooltipProvider > RouterView + DialogHost; boots auth + registry
├── main.ts
└── style.css       # Design tokens + global styles
```

**Components are grouped by feature.** Anything used by more than one feature — or by a view and a feature — lives in `components/common/`. Feature folders hold components used only within that feature. `components/ui/` is reserved for shadcn-vue primitives; don't hand-edit those unless deliberately customising.

There are no loose files directly in `components/` — every component lives in one of the subfolders above.

---

## Routes

All routes are lazy-loaded (`component: () => import('@/views/FooView.vue')`).

| Path | Name | Component |
|---|---|---|
| `/` | `library` | DeckLibraryView |
| `/deck/:deckId` | `deck-summary` | DeckSummaryView |
| `/deck/:deckId/notes` | `browse-notes` | BrowseNotesView |
| `/deck/:deckId/notetype/:noteTypeId/note/:noteId` | `note-editor` | NoteEditorView |
| `/deck/:deckId/notetype/:noteTypeId/template/:cardTemplateId` | `template-editor` | CardTemplateEditorView |
| `/deck/:deckId/review` | `start-review` | StartReviewView |
| `/deck/:deckId/review/session` | `review-next` | ReviewView |
| `/loading` | `loading` | LoadingScreen |
| `/login` | `login` | LoginView |

### Navigation guards

Two `beforeEach` guards run in order:

1. **Auth + registry gate** — skipped for `login` and `loading`. Redirects to `login` when signed out, or `loading` while the Pouch registry is still hydrating. Both carry a `next` query param.
2. **`addObjectsToRouteMeta`** — resolves `:deckId` / `:noteTypeId` / `:cardTemplateId` / `:noteId` params into real `core` objects and attaches them to `to.meta`. If an id doesn't resolve it logs and routes back.

Components read those resolved objects via `useRouteMetaObjects()` rather than re-querying by id.

---

## State & Data

Data comes from the **`core`** workspace package (`file:../core`) — `Deck`, `NoteType`, `CardTemplate`, `Note` and friends, persisted through `PouchDeckRegistry` against CouchDB.

| Concern | Where |
|---|---|
| Registry lifecycle, deck loading, persistence | `composables/usePouchRegistry.ts` (`usePouchRegistry`, `useDecks`, `usePersistDeck`) |
| Route-resolved entities | `composables/useRouteObjects.ts` (`useRouteMetaObjects`) |
| Derived/frozen views of core objects | `composables/useObjectDetails.ts` (`useDeckDetails`, `useNoteTypeDetails`, `useFreezableComputedRef`) |
| Firebase auth | `composables/useAuth.ts`, `lib/auth.ts`, `lib/firebase.ts` |
| Vue-reactive wrapper around core's ObjectManager | `lib/ReactiveObjectManager.ts` |
| Pluggable services (e.g. TTS) | `lib/services.ts` (`SERVICE_REGISTRY`, `defineService`) |

Config comes from Vite env vars: `VITE_COUCH_HOST`, `VITE_COUCH_USERNAME`, `VITE_COUCH_PASSWORD`, `VITE_MEMORY_ONLY`.

No Pinia — shared state is module-level `ref`s inside composables. Don't add a global store without discussion.

### Dialogs

Dialogs are opened imperatively and awaited, not toggled with local `v-if` state:

- `useFormDialog()` / `useDialogForm()` (`composables/useFormDialog.ts`) — push a form dialog and `await` a `DialogResult<T>` (`{ cancelled: true } | { cancelled: false, data: T }`).
- `useConfirmation()` (`composables/useConfirmationDialog.ts`) — await a yes/no.
- `<DialogHost />` sits in `App.vue` and renders whatever is pending via `<component :is>`.

---

## Component Conventions

- **SFC with `<script setup>`** — always. No Options API.
- **Props:** typed via `defineProps<{ ... }>()`; use `withDefaults` only when defaults are needed.
- **Emits:** typed via `defineEmits<{ eventName: [payload] }>()`.
- **Two-way binding:** `defineModel()` where it fits, otherwise `modelValue` + `update:modelValue`.
- **File naming:** PascalCase for components, camelCase for composables.
- **Imports:** always the `@/` alias (`@/components/common/AppButton.vue`), not deep relative paths.

### Common components (`components/common/`)

| Component | Purpose |
|---|---|
| `AppButton` | Primary button. `variant`: `primary`/`secondary`/`ghost`. `size`: `sm`/`md`/`lg`. Optional `icon`, `iconFilled`, `disabled`. |
| `AppIconButton` | Icon-only button. `variant`: `ghost`/`filled`/`destructive`. `size`: `xs`/`sm`/`md`. Supports `disabled`. |
| `CreateButton` | Call-to-action create button. `size`: `sm`/`lg`. |
| `LinkButton` | Text link styled as a button, optional trailing `arrow`. |
| `StripIconButton` | Compact icon button for row strips. `variant`: `default`/`destructive`. |
| `AppInput` | Text input / textarea. `modelValue` accepts `string \| null`. Supports `icon`, `multiline`, `rows`, `sm`/`md`/`lg`. |
| `SelectDropdown` | Single-select popover with checkmark indicators. |
| `TagInput` | Multi-select dropdown with overflow counting, search, custom tags. |
| `ViewToggle` | Segmented pill control. Icon + label per option. |
| `OptionListItem` | Selectable row with icon, label, description. |
| `AppDialog` | Modal wrapper with animated backdrop, header/footer slots. |
| `FormDialog` | `AppDialog` specialisation with submit/cancel flow. |
| `ConfirmationDialog` | Yes/no dialog behind `useConfirmation()`. |
| `NewNamedObjectDialog` | Shared "name a new thing" form dialog. |
| `DialogHost` | Renders the pending imperative dialog. Mounted once in `App.vue`. |
| `PageLayout` | Master layout: `AppNav` + breadcrumbs + constrained `max-w-6xl` content. Also wires the debug dialog and `UserMenu`. |
| `AppNav` | Fixed top navbar, height `h-15`, `.glass-card` style. Has an `actions` slot. |
| `Breadcrumb` | Navigation chain with `chevron_right` separators. Uses `RouterLink`. |
| `UserMenu` | Account dropdown in the nav. |
| `DeckHeader` | Deck title, description, note/card counts. |
| `CardCountBar` | Scheduler statistics bar. |
| `FSRSSettingsForm` | FSRS parameter form. |
| `SelectSchedulerForm` | Scheduler picker dialog form. |
| `PaginationFooter` | Page-size + page-window pagination controls. |
| `AppTooltip` | reka-ui tooltip wrapper. `side` positioning. |
| `DebugDialog` / `DebugObjectCard` | Dev-only deck object inspector. |

Always use `PageLayout` for standard views. Use `:full-height="true"` + `:constrained="false"` for full-viewport editor views — `CardTemplateEditorView` is the only one today.

### Card rendering (`components/renderer/`)

Card templates are user-authored HTML/CSS compiled and rendered at runtime.

- `CardRenderer` compiles the template and mounts it via `<component :is>`.
- `ShadowDom` isolates card styles from app styles.
- `useCardController` drives card state (reveal, rating, next).
- `widgets/` provides the in-card interactive elements — `RevealButton`, `NextButton`, `RatingButtons`, `TextInput`. Each widget has a `.vue`, an optional `.settings.ts` schema, and a `SettingsForm.vue`. They're registered through `WIDGET_COMPONENTS` in `widgets/useWidgets.ts` and re-exported from `widgets/index.ts`.

To add a widget: create the component, its `.settings.ts`, and its settings form, then register it in `useWidgets.ts`.

---

## Design System

The app has a thorough design specification in [DESIGN.md](DESIGN.md). Key rules:

### Colors

Dark-only. Surface hierarchy expresses depth — no heavy borders. Defined as `--color-*` custom properties in `style.css`.

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#121416` | Main canvas |
| `surface-container-lowest` | `#0c0e10` | Inputs, code editor bg |
| `surface-container-low` | `#191b1d` | Recessed panels |
| `surface-container` | `#1e2022` | Active toggle backgrounds |
| `surface-container-high` | `#282a2c` | Cards, list items |
| `surface-container-highest` | `#333537` | Hover states, floating menus |
| `primary` | `#70d8c8` | CTAs, active states, links (teal) |
| `on-primary` | `#0c0e10` | Text on primary backgrounds |
| `on-surface` | `#e2e2e5` | Primary text |
| `on-surface-variant` | `#bcc9c5` | Secondary text, labels |
| `outline-variant` | `#3d4946` | Borders (used at low opacity) |
| `error` | `#ffb4ab` | Destructive states |

Page body background: `radial-gradient(circle at top left, #1c1f22 0%, #0c0e10 100%)`

### Typography

Single font: **Inter**. Light weights for content, bold+uppercase+tracked for labels.

- Page title: `text-3xl font-light tracking-wide`
- Card/section title: `text-xl font-extralight`
- Body: `text-sm font-light`
- Small body: `text-xs font-light`
- Stats/numbers: `text-2xl font-light text-primary`
- **Overline/label signature pattern:** `text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50`
- Button text: `font-bold uppercase tracking-widest`

### Radius

Keep corners sharp. No `rounded-xl` or `rounded-full` on UI chrome.

- `rounded-xs` — buttons, toggles, dropdowns, sidebar items
- `rounded-sm` — inputs, tags, chips
- `rounded-md` — cards (DeckListItem, NoteTypeCard)

### Interactive States

```
active:scale-[0.98] transition-all duration-200   ← all interactive elements
hover:bg-surface-container                          ← ghost row items
hover:text-primary                                  ← icon buttons, links
focus:border-primary/50                            ← inputs
```

Active/selected: `text-primary bg-primary/10`

### Borders

Use opacity-based borders on `primary` and `white`:
- Layout dividers: `border-white/5`
- Cards at rest: `border-outline-variant/10`
- Inputs at rest: `border-outline-variant/20`
- Inputs focused: `border-primary/50`
- Card hover: `border-primary/20`
- Dropdown/popover: `border-primary/40`

### Icons

Material Symbols Outlined — always `leading-none` in flex containers.

- In buttons/labels: `text-sm`
- Standalone icon buttons: `text-xl`
- Inline with body text: `text-base`
- Filled variant: `font-variation-settings: 'FILL' 1`

Default variation: `'FILL' 0, 'wght' 300, 'GRAD' 0` (set globally in `style.css`).

### Animation

| Pattern | Classes |
|---|---|
| Standard | `transition-all duration-200` |
| Color only | `transition-colors` |
| Opacity reveals (hover) | `transition-opacity opacity-0 group-hover:opacity-100` |
| Chevron rotation | `transition-transform duration-200` |
| Height collapse | `template-editor/CollapseTransition.vue` |

### Utility classes (`style.css`)

| Class | Effect |
|---|---|
| `.glass-card` | `rgba(30,32,34,0.6)` + `blur(12px)` + hairline white border |
| `.glass-card-folder` | Lighter glass for folder rows |
| `.btn-glow` | Teal glow shadow for primary CTAs |

### Badges & Chips

```html
<!-- Note type badge -->
<span class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
  Anatomy
</span>

<!-- Tag chip -->
<span class="bg-primary/10 border border-primary/20 text-primary rounded-xs text-xs px-2 py-0.5">
  Physics
</span>
```

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `vue-tsc -b` then `vite build` |
| `npm run deploy` | Type-check, build in `staging` mode, deploy to Firebase Hosting |
| `npm run lint` | ESLint with `--fix` |
| `npm run format` | Prettier over `src/` |

Type errors fail the build — run `npm run build` (or `npx vue-tsc -b`) before considering work done.

---

## Important Don'ts

- Don't put loose component files directly in `components/` — pick `common/` or a feature folder.
- Don't create a second copy of a component to iterate on it; change the original.
- Don't use `rounded-xl` / `rounded-full` on UI chrome.
- Don't use pure white — use `text-on-surface` (`#e2e2e5`).
- Don't use box-shadow for depth — use surface layering instead (`.btn-glow` is the one deliberate exception).
- Don't use multiple font families.
- Don't use heavy borders for layout separation — use `bg-white/5` lines.
- Don't add Pinia/global state without discussion.
- Don't split view and component concerns — views go in `views/`, reusable components in `components/`.
- Don't query core objects by route id directly — use `useRouteMetaObjects()`.
- Don't manage dialog visibility with ad-hoc local state — use `useFormDialog()` / `useConfirmation()`.
