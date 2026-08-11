# Style guide

The design system, in words. [tokens.css](tokens.css) is the machine-readable
half; this file is the *why*. Both are the source of truth — a component that
disagrees with them is the thing that's wrong.

> The visual direction (brand hue, imagery, voice, personality) is **not decided
> yet**. This file covers only the structural rules that survive any direction.
> Fill in the direction section as it's decided — don't leave the design to
> accumulate by accident.

There is one light token set and **no theming knobs** — no palette / density /
radius / font-size variants, no dark mode. A knob is a decision deferred; make
the decision instead.

## The premium baseline

Precise, quiet UI furniture — exact hairlines, honest alignment, one shadow per
surface, generous whitespace. Restraint in the chrome, personality carried by
content and by a single accent used rarely.

## Color

- **Only `--c-*` tokens.** No raw hex or `rgba()` in component code — not in
  `Btn` palettes, not in `Tag` tones, not in a one-off `boxShadow`.
- **One accent** (`--c-accent`) — the primary CTA and decision moments. Rare by
  design; if everything is accented, nothing is.
- **Semantic states** are `--c-success` / `--c-warn` / `--c-danger`, each with a
  `-soft` background pair. A state color is never a CTA color and vice versa.
- Soft filled action = `--c-soft-bg` + `--c-soft-fg`. Navigation-type actions use
  the `secondary` outline, not a grey fill (grey fill reads too heavy next to
  the accent).
- No colored text on colored backgrounds outside the `-soft` pairs.
- Text over photos / dark scrims uses `--c-on-media` / `--c-on-media-soft`
  (theme-independent, always light). Scrims: `--c-scrim-soft/mid/strong`.
- **Allowed exception:** vendor brand glyphs and buttons that Apple HIG / Google
  Branding mandate verbatim. Never substitute `--c-ink` for a brand black —
  it looks close and fails brand review.

## Contrast

Never use `--c-ink-faint` for readable copy — it fails WCAG AA on `--c-page`.
Secondary text, labels and placeholders are `--c-ink-soft`. `--c-ink-faint` is
decorative only: icons, disabled states, hairline meta.

## Spacing

The 4-px grid, `--s-4 … --s-48`. No off-grid values (`6px`, `14px`, `18px`).
If a gap needs a size the scale doesn't have, the layout is wrong or the scale
needs a step — not an inline number.

## Type

Nine steps, `--t-caption … --t-display`. Inter; weights 400 / 600 / 700 only.
Body is 400; emphasis is 600 on the highlighted span, not a size bump.

## Radii

`--r-sm/md/lg/xl` for surfaces, `--r-pill` for everything pressable.

## Shadow

A single `var(--card-shadow)` per surface. Never stack shadows, never hardcode
`box-shadow`. Sheets use `--shadow-sheet`, glass uses `--shadow-glass`.

## Touch targets

44×44 minimum hit area on standalone tappable elements (iOS HIG / Material).
Header icon-circles are 40 px with a 20 px glyph (~50% of the circle — a smaller
glyph reads as a stray dot), and surrounding padding brings the hit area to ≥44.
Inline ± controls glued to a value column may go to 30; standalone nav may not.

## Components

Live in [ui.jsx](ui.jsx) with strict contracts. Use them.

- `<Btn kind size full icon disabled>` — `kind` ∈ `primary | secondary | ghost |
  soft | canvas | good | danger | onaccent | onmedia`, `size` ∈ `sm | md | lg`
  (heights 32 / 44 / 56). Never style a raw `<button>` outside `Btn`.
- `<Card padded style>` — surface. **Content only, never an input.** A field on a
  card (padding + shadow) is the classic drift bug; inputs need their own shell
  that owns surface · radius · hairline · focus ring and has *no* shadow. When
  the first input lands, extract that shell once and route every field through it.
- `<Chip on>` (selectable) vs `<Tag tone>` (non-interactive label).
- `<Slot id label h>` — image placeholder, deterministic per `id`.
- `<Toggle on onChange>`, `<SectionHead title sub action>`, `<StatusFiller/>`.

## Icons

Lucide via CDN, through the `I = {...}` map and `ico(name, size)` in
[ui.jsx](ui.jsx). To add one: find the PascalCase name at
<https://lucide.dev/icons>, add one line to `I`.

Don't write inline `<svg>`, don't use emoji as iconography, don't scale with
`transform: scale()` (pass a size instead). The same Lucide names map to
`flutter_lucide` in snake_case (`MapPin` → `LucideIcons.mapPin`).

## Flutter portability

This canvas is a specification for a Flutter app, not a website. Check every
screen against this list — a web-only trick found at build time is a redesign,
found here it's a five-minute edit.

**Don't design with these.** They have no clean Flutter equivalent:

- **Inset shadows.** Flutter's `BoxShadow` has no inset. `--shadow-glass` carries
  one; anything else that wants an inner glow must be a border or a gradient.
- **Percentage and viewport sizes** (`85%`, `100vh`, `calc()` mixing units). Use
  fixed sizes, flex weights, or `Expanded`-shaped thinking.
- **`filter: brightness()` as a state.** Hover / press is `overlayColor` in
  Flutter — design the pressed state as an actual color, not a filter.
- **Text effects with no counterpart:** `text-shadow` stacks, `background-clip:
  text`, CSS masks.
- **Heavy `backdrop-filter`.** It exists (`BackdropFilter`) but costs real frames
  on a tablet; one glass surface on screen, not five.

**Design so these stay easy:**

- Every value comes from a token — the token file becomes `tokens.dart` more or
  less mechanically. A one-off inline number becomes a magic number in Dart.
- Pressables keep fixed heights (32 / 44 / 56) and `--r-pill`; they map straight
  onto `ButtonStyle`.
- Layout is flex: rows, columns, gaps. No CSS Grid areas, no `position: sticky`.

**Expect to re-tune by eye, not by number** (the value is right, the rendering
differs): shadow blur (CSS blur and Flutter's `blurRadius` are different
quantities), text vertical rhythm (`line-height` vs Flutter's `height` handles
leading differently), and large corner radii (no iOS squircle out of the box).
Fix these once in the Flutter theme, not per widget.

## Two layouts, one system

The POS is a **portrait** tablet on a counter stand, used at arm's length all
shift, often one-handed while the other hand takes payment: bigger targets,
nothing that needs precision. Portrait is a tall column, not a wide desk — the
menu grid and the running order stack vertically (order anchored at the bottom,
where the thumb is), rather than sitting side by side. The Manager is a phone
used occasionally and deliberately: standard mobile ergonomics.

**Same tokens and same atoms in both** — the tablet gets more room, not a second
design language.

## Direction — TBD

Brand source: <https://pluginpromotions.com/>.

- Brand hue:
- Imagery:
- Voice & copy:
- Signature moments:
