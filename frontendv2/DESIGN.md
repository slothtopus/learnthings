# Midnight Lexicon — Design System

## 1. Vision

A cinematic, archival interface built for focused intellectual work. Dark, editorial, and precise. Tonal depth over structural lines. Every element should feel intentional — like a private library, not a dashboard.

---

## 2. Color

### Surface Hierarchy

Depth is expressed through surface shifts, never heavy borders.

| Token | Hex | Usage |
|---|---|---|
| `surface-container-lowest` | `#0c0e10` | Inputs, code editor background, page overlay base |
| `surface-container-low` | `#191b1d` | Recessed panels |
| `surface-container` | `#1e2022` | Toggle active backgrounds, elevated context |
| `surface-container-high` | `#282a2c` | Cards, list items |
| `surface-container-highest` | `#333537` | Hover states, floating menus, dropdowns |
| `surface` | `#121416` | Main canvas |

### Primary — Electric Sea

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#70d8c8` | CTAs, active states, highlights, links |
| `on-primary` | `#0c0e10` | Text on primary-filled backgrounds |

### Text

| Token | Hex | Usage |
|---|---|---|
| `on-surface` | `#e2e2e5` | Primary content text |
| `on-surface-variant` | `#bcc9c5` | Secondary text, labels, nav |

### Borders

| Token | Usage |
|---|---|
| `border-white/5` | Layout dividers, panel separators (barely visible) |
| `border-outline-variant/10` | Card borders at rest |
| `border-outline-variant/20` | Input borders at rest |
| `border-primary/20` | Card borders on hover |
| `border-primary/40` | Dropdown/popover borders, focused inputs (`/50`) |
| `border-primary/60` | TagInput popover (high emphasis) |

### Page Background

The body uses a radial gradient to give the flat canvas atmospheric depth:

```css
background: radial-gradient(circle at top left, #1c1f22 0%, #0c0e10 100%);
```

---

## 3. Typography

**Font:** Inter (single typeface, varied weight and size)

### Scale

| Role | Classes | Example |
|---|---|---|
| Page title / hero | `text-3xl font-light tracking-wide` | "Flags of the World" |
| Card / section title | `text-xl font-extralight` | Deck names |
| Body | `text-sm font-light` | Field content, descriptions |
| Small body | `text-xs font-light` | Sidebar items, secondary labels |
| Stat / number | `text-2xl font-light text-primary` | Review counts |
| Thin number | `text-base font-thin` | Stat values in deck list |

### Overlines & Labels

The **signature typographic pattern**: tiny, bold, uppercase, wide-tracked text used for section labels, column headers, and category markers.

```
text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50
text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant
```

### Navigation / Breadcrumbs

- **Nav title:** `font-bold tracking-widest uppercase text-sm text-on-surface-variant`
- **Breadcrumb links:** `text-xs font-medium hover:text-primary`
- **Breadcrumb current:** `text-xs font-medium text-on-surface`

---

## 4. Radius

Keep corners sharp and intentional. Avoid the roundness of consumer apps.

| Class | Value | Usage |
|---|---|---|
| `rounded-xs` | custom small | Buttons, toggles, sidebar items, dropdowns, tab rows |
| `rounded-sm` | `0.375rem` | Inputs, tags, chips |
| `rounded-md` | `0.5rem` | Cards (DeckListItem, NoteTypeCard) |

---

## 5. Spacing & Layout

### Page Structure

All standard views use `PageLayout.vue`:
- `AppNav` fixed at `h-15`, `pt-15` offset on main content
- Breadcrumb strip: `px-8 max-w-6xl mx-auto`, separated by `h-px bg-white/5`
- Constrained content: `px-8 max-w-6xl mx-auto w-full`
- Full-height editor views: `fullHeight + constrained=false`, content fills remaining viewport

### Section Separators (within sidebars / panels)

```html
<div class="h-px bg-white/5 mx-3" />
```

### Section Padding

Sidebar sections: `px-3 pt-4 pb-3`  
Section overlines: `px-1 mb-2`

---

## 6. Interactive States

### Hover

- **Ghost row items:** `hover:bg-surface-container`
- **Cards:** bg shifts up one level + `hover:border-primary/20`
- **Icon buttons:** `hover:text-primary`
- **Links / text buttons:** `hover:text-primary`, optional underline

### Active / Selected

- **Sidebar items:** `text-primary bg-primary/10`
- **Toggle options:** `bg-surface-container text-primary`
- **Active row (e.g. dropdown open):** `bg-surface-container`

### Tactile Feedback

All interactive elements use:
```
active:scale-[0.98] transition-all duration-200
```

### Focus (inputs)

```
focus:border-primary/50
```

---

## 7. Components

### AppButton

Variants: `primary` | `secondary` | `ghost`  
Sizes: `sm` (`h-8`) | `md` (`h-10`) | `lg` (`h-12`)  
Always: `rounded-xs font-bold uppercase tracking-widest`  
Primary gets `.btn-glow` (subtle teal box-shadow).

```html
<AppButton size="md">Save</AppButton>
<AppButton size="sm" variant="secondary">Manage</AppButton>
<AppButton size="sm" icon="save">Save All</AppButton>
```

### AppIconButton

Variants: `ghost` (default) | `filled`  
Sizes: `sm` (`p-2`) | `md` (`p-2.5`)  
Ghost: `text-on-surface-variant hover:text-primary`  
Filled: subtle border, `hover:bg-surface-container-highest`

```html
<AppIconButton icon="add" size="sm" />
<AppIconButton icon="settings" variant="filled" />
```

### AppInput

Background: `surface-container-lowest`  
Border: `outline-variant/20` → focus `primary/50`  
Radius: `rounded-sm`  
Supports `icon`, `multiline`, and `sm/md/lg` sizes.

### ViewToggle

Pill-style segmented control with icon + label per option.  
Container: `bg-surface-container-lowest rounded-xs`  
Active: `bg-surface-container text-primary`  
Inactive: `text-on-surface/40 hover:text-on-surface`

### TagInput

Chips: `bg-primary/10 border border-primary/20 text-primary rounded-xs`  
Overflow: counts hidden chips as `+N` in neutral style.  
Popover: `bg-black border-primary/60` with search input and checkmark indicators.

### LinkButton

```
text-[9px] font-bold uppercase tracking-[0.3em] text-primary
```
With optional arrow icon. Used for contextual navigation and soft actions (e.g. Reset).

### Breadcrumb

Links: `text-xs font-medium text-on-surface-variant hover:text-primary`  
Current (last item): `text-on-surface`  
Separator: `chevron_right` icon at `text-xs`

### SidebarCollapsibleItem

Collapsible list item for sidebars. Accepts `icon`, `label`, `actionIcon` (default `more_horiz`), `active` prop.  
Expanded/collapsed state is managed internally.  
Children rendered in an indented, left-bordered region: `ml-3 border-l border-white/5`.  
Action button is revealed on group hover; supports an `#action` slot for custom controls (e.g. dropdown menus).

### Dropdown Menu (shadcn-vue `DropdownMenu`)

Use `DropdownMenuContent` with:
```
class="border-primary/40 rounded-xs"
align="end"
```
Items use default shadcn styling (inherits surface/popover tokens).

### Dialogs / Modals

Use shadcn-vue `Dialog` with `AppDialog` / `FormDialog` wrappers.  
Overlay: semi-transparent dark backdrop.  
Content: `surface-container` background.

---

## 8. Icons

**Library:** Material Symbols Outlined  
**Default variation:** `'FILL' 0, 'wght' 300, 'GRAD' 0`  
Always add `leading-none` when used inline inside flex containers.

| Context | Class |
|---|---|
| In buttons / labels | `text-sm` |
| Standalone icon buttons | `text-xl` |
| Inline with body text | `text-base` |
| Large decorative | `text-lg` or `text-2xl` |

Filled variant for emphasis: `font-variation-settings: 'FILL' 1`

---

## 9. Animation

| Pattern | Classes |
|---|---|
| Standard transitions | `transition-all duration-200` |
| Color-only transitions | `transition-colors` |
| Opacity reveals (hover actions) | `transition-opacity` |
| Icon rotation (chevrons, dropdowns) | `transition-transform duration-200` |
| Animated height collapse | `CollapseTransition.vue` (JS hooks, `0.2s ease`) |
| Dropdown open/close | shadcn data-state animate-in/out |

---

## 10. Badges & Chips

**Note type / category badge:**
```html
<span class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
  Anatomy
</span>
```

**Tag chip (in TagInput):**
```html
<span class="bg-primary/10 border border-primary/20 text-primary rounded-xs text-xs px-2 py-0.5">
  Physics
</span>
```

---

## 11. Glass Effects

Used for the nav bar and floating panels requiring atmospheric depth:

```css
/* .glass-card */
background: rgba(30, 32, 34, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

**Nav bar:** `bg-surface-container-lowest/80 backdrop-blur-md border-b border-white/5`

---

## 12. Do's and Don'ts

**Do:**
- Use surface shifts and `border-white/5` for layout separation
- Use `uppercase tracking-widest font-bold` for all overlines, labels, and button text
- Reveal action buttons on group-hover using `opacity-0 group-hover:opacity-100`
- Tint borders with `primary/20–40` to signal focus and interaction
- Use `font-light` or `font-extralight` for content text to contrast with bold labels
- Keep corners sharp (`rounded-xs` / `rounded-sm`)

**Don't:**
- Use heavy borders to divide layout sections
- Use pure white — always use `on-surface` (`#e2e2e5`)
- Use `rounded-xl` or `rounded-full` on UI chrome (reserved for avatars / pills only)
- Mix multiple font families
- Use shadow for layout depth — use surface layering instead
