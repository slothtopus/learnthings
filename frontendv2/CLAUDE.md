# CLAUDE.md — frontendv2

This is the v2 frontend for **learnthings**, a flashcard/spaced-repetition learning app. Built with Vue 3, TypeScript, Tailwind CSS v4, and shadcn-vue.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Language | TypeScript 5.9 (strict mode) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + PostCSS |
| Routing | Vue Router 5 (lazy-loaded routes) |
| UI primitives | reka-ui (Popover, Dialog, DropdownMenu) via shadcn-vue |
| Icons | Material Symbols Outlined (variable font) |
| Utilities | clsx, tailwind-merge, class-variance-authority, @vueuse/core |
| Code editor | CodeMirror 6 (HTML + CSS language support) |

---

## Project Structure

```
src/
├── views/
│   ├── mockups/    # Static design mockups — reference only, do not add logic here
│   └── *.vue       # Real functional views (built out against the live data layer)
├── components/
│   ├── ui/         # shadcn-vue base primitives (Button, Dialog, DropdownMenu, etc.)
│   └── *.vue       # App-level components
├── router/
│   └── index.ts    # All route definitions
├── lib/
│   └── utils.ts    # cn() helper (clsx + tailwind-merge)
├── assets/         # Images, SVGs
├── App.vue         # Root — just <RouterView />
├── main.ts         # App entry point
└── style.css       # CSS custom properties (design tokens) + global styles
```

---

## Routes

### Mockup routes (`/mockups/*`)

Static design references. All live under the `/mockups` parent route, components in `src/views/mockups/`. Use these as the visual specification when building real views — do not add data-fetching or business logic here.

| Path | Component | Purpose |
|---|---|---|
| `/mockups/library` | DeckLibraryView | Browse folders and decks |
| `/mockups/deck/:id` | DeckSummaryView | Deck overview, note types, scheduler |
| `/mockups/test` | TestView | Component playground |
| `/mockups/note/:id` | NoteEditorView | Edit card fields |
| `/mockups/notes` | BrowseNotesView | Search and filter all notes |
| `/mockups/review/start` | StartReviewView | Review session preparation |
| `/mockups/template/edit` | CardTemplateEditorView | HTML/CSS template editor |

### Functional routes

Real views go directly in `src/views/` as they are built out against the live data layer.

All routes use lazy loading: `component: () => import('@/views/FooView.vue')`.

---

## Component Conventions

- **SFC with `<script setup>`** — always. No Options API.
- **Props:** typed with `defineProps<{ ... }>()`, not `withDefaults` unless defaults are needed.
- **Emits:** typed with `defineEmits<{ eventName: [payload] }>()`.
- **File naming:** PascalCase for components (`AppButton.vue`), camelCase for composables.
- **No subdirectories** inside `components/` except `ui/` for shadcn primitives.

### Core App Components

| Component | Purpose |
|---|---|
| `AppButton` | Primary button. Variants: `primary` / `secondary` / `ghost`. Sizes: `sm` / `md` / `lg`. Accepts `icon` prop (Material Symbol name). |
| `AppIconButton` | Icon-only button. Variants: `ghost` / `filled`. Sizes: `sm` / `md`. |
| `AppInput` | Text input / textarea. Supports `icon`, `multiline`, `sm/md/lg` sizes. |
| `AppNav` | Fixed top navbar. Height `h-15`. Uses `.glass-card` style. |
| `AppDialog` | Modal wrapper with animated backdrop, header/footer slots. |
| `FormDialog` | `AppDialog` specialisation with submit/cancel flow. |
| `PageLayout` | Master layout: wraps `AppNav` + breadcrumbs + constrained `max-w-6xl` content. |
| `ViewToggle` | Segmented control (pill). Icon + label per option. |
| `TagInput` | Multi-select dropdown with overflow counting, search, custom tags. |
| `SelectDropdown` | Single-select with popover and checkmark indicators. |
| `CodeEditor` | CodeMirror wrapper for HTML/CSS editing. |
| `Breadcrumb` | Navigation chain with `chevron_right` separators. |
| `SidebarCollapsibleItem` | Collapsible sidebar row with icon, label, action slot. |
| `CollapseTransition` | JS-hooks animated height collapse (0.2s ease). |

Always use `PageLayout` for standard views. Use `fullHeight` + `constrained=false` for full-viewport editor views like `CardTemplateEditorView`.

---

## Design System

The app has a thorough design specification in [DESIGN.md](DESIGN.md). Key rules:

### Colors

Dark-only. Surface hierarchy expresses depth — no heavy borders.

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
| Height collapse | `CollapseTransition.vue` |

### Glass Effect (nav, floating panels)

```css
background: rgba(30, 32, 34, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

Or Tailwind: `bg-surface-container-lowest/80 backdrop-blur-md border-b border-white/5`

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

## State & Data

- Local `ref()` / `computed()` for component state. No global store (Pinia not yet added).
- No API/HTTP layer yet — components use hardcoded mock data.
- Parent–child communication: `v-model` and typed emits.
- Route params used for entity IDs (e.g. `/deck/:id`).

---

## Important Don'ts

- Don't use `rounded-xl` / `rounded-full` on UI chrome.
- Don't use pure white — use `text-on-surface` (`#e2e2e5`).
- Don't use box-shadow for depth — use surface layering instead.
- Don't use multiple font families.
- Don't use heavy borders for layout separation — use `bg-white/5` lines.
- Don't add Pinia/global state without discussion.
- Don't split view and component concerns — views go in `views/`, reusable components in `components/`.
- Don't add data-fetching or business logic to mockup views in `views/mockups/` — they are static design references only.
- When building a real view, use the corresponding mockup as the visual spec, then create a new file directly in `views/`.
