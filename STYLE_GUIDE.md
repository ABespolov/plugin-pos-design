# Style guide

The design system, in words. [tokens.css](tokens.css) is the machine-readable
half; this file is the *why*. Both are the source of truth — a component that
disagrees with them is the thing that's wrong.

One light token set, **no theming knobs** — no palette / density / radius /
font-size variants, no dark mode. A knob is a decision deferred; make the
decision instead.

---

## North star — ink slab on warm paper

A warm off-white paper canvas, ink type, white cards held by hairlines — and
**one near-black slab per screen that carries the money**: the running order and
the total on POS, the primary action everywhere. Depth is a border or an
inverted surface, never a shadow.

Cutting through it, rarely: the brand's **electric cyan**, which means one thing
only — *this just changed, right now*. Real-time propagation is the product's
whole promise, so it gets a color no other thing in the system is allowed to use.

This isn't invented. It's the brand's own system, read off pluginpromotions.com:
their background is `#f7f7f5`, their foreground and their **accent** are both
`#0a0a0a` (they chose black as the action color), their surfaces are white and
`#f0efed`, their border is `#e2e2e0`, their muted text is `#6b6b6b`, their fonts
are DM Sans and Instrument Sans, and their logo mark is `#1de6f1`.

### Reference lock

| | |
|---|---|
| **Primary** | The brand's own token system; product-UI density and discipline from shadcn/ui |
| **Preserve** | Warm paper ground · black-as-action · hairlines instead of shadows · `.18em` uppercase micro-labels · `-.02em` on display sizes |
| **Borrow only** | Mews — the black slab as a hierarchy device. Turso — how one electric accent behaves against near-black |
| **Reject** | A dark theme "because bars are dark" · cyan CTAs · shadows · pill buttons in a dense grid · a second accent hue |

### Decision ledger

| Decision | Source | Role preserved | Why |
|---|---|---|---|
| Paper `#f7f7f5`, ink `#0a0a0a` | brand `--background` / `--foreground` | canvas + text | The brand's literal values, not an interpretation |
| Black is the primary action | brand `--accent: #0a0a0a` | CTA | The brand already assigned its accent role; cyan would override it |
| Cyan only on ink, only for "live" | logo `#1de6f1`; sunday's rule that a vivid accent stays a status, not a CTA | status/brand mark | 12.9:1 on the slab, **1.4:1 on paper** — it physically cannot be text on light |
| One near-black slab per screen | Mews hero dark card | hierarchy by surface inversion | Gives the total and the CTA weight without shadow or a second hue |
| No shadows at all | shadcn/ui, Turso, Mews all say the same | elevation | Also removes the one thing that never ports cleanly to Flutter |
| Buttons `--r-md` (10px), pill for chips/tags only | shadcn/ui: 10px buttons + pill badges | radius roles | A grid of pill buttons on a POS reads as a toy |
| Body 16px, controls 48px | POS is read and tapped at arm's length | density | 15/44 is phone-scale and too tight on a counter tablet |
| Red is the only hue on paper | shadcn/ui `Callout Red` | destructive/error | A cashier must catch "sold out" without reading it |
| Tabular figures everywhere | craft | numerals | Prices are a column; proportional digits make them jitter |

---

## Color

Only `--c-*` tokens. No raw hex or `rgba()` in component code — not in `Btn`
palettes, not in `Tag` tones, not in a one-off style.

**Surfaces.** `--c-paper` is the app canvas, `--c-surface` (white) is cards and
rows, `--c-surface-tint` is a quiet fill (unselected chips, inset wells), and
`--c-slab` is the near-black surface.

**Ink.** `--c-ink` for text. `--c-ink-soft` for secondary text, labels and
placeholders — it's the brand's own muted grey and clears AA at 5.0:1.
`--c-ink-faint` is **decorative only**: icons, disabled states, rules. Never
readable copy. `--c-line` is every hairline; `--c-line-strong` outlines inputs
and outline buttons.

**Action.** `--c-action` is `--c-ink`. That is deliberate and it is the brand's
own call: the strongest thing you can do on paper is ink.

**Live — `--c-live` (#1de6f1).** Three hard rules:
1. **Only on ink.** On paper it is 1.4:1 — invisible as text, misleading as a fill.
   On the slab it is 12.9:1.
2. **Only for "this just changed".** A menu update landing from Manager, an item
   just added to the order. Not a CTA, not a brand wash, not decoration.
3. **On paper it may appear only as a non-text mark** — the 3px `LiveEdge` on a
   card, a dot. Never as a label, never as a surface.

**Blocked — `--c-blocked` (#c22b10).** Sold out, destructive confirm, error.
The only hue that appears on paper, so it is unmissable. Available is the
*default* state and carries **no color at all** — decorating the majority state
is how a POS becomes noise.

On-slab text uses `--c-on-slab` / `--c-on-slab-soft` and its own hairline
`--c-on-slab-line`. These are theme-independent.

## Type

**DM Sans** carries all UI — it is the brand's default family. **Instrument
Sans** (the brand's second face) is used *only* for large numerals, where its
condensed digits hold a big total together. That is a functional role, not a
decorative font swap; never set a word in it for emphasis.

Nine steps, `--t-caption … --t-display`. Weights 400 / 500 / 600 / 700. Body is
400; emphasis is 600 on the highlighted span, never a size bump.

Two tracking tokens, both the brand's own:
- `--track-tight` (-0.02em) on headings and display sizes.
- `--track-label` (0.18em) on the uppercase micro-label — the brand's signature
  typographic move, and the way a region gets named (`CATEGORY`, `ORDER`)
  without competing with content. Use `<Label>`, don't hand-roll it.

Everything numeric is tabular (`.app-screen` sets it globally). Money goes
through `<Money>`.

## Spacing

The 4-px grid, `--s-4 … --s-48`. No off-grid values (`6px`, `14px`, `18px`). If
a gap needs a size the scale doesn't have, the layout is wrong.

## Radii

`--r-sm` 6 · `--r-md` 10 (buttons, inputs) · `--r-lg` 14 (cards) · `--r-xl` 20
(sheets, the slab) · `--r-pill` for chips, tags and indicators **only**.

## Elevation

There isn't any. Hierarchy is a hairline or an inverted surface. The single
exception is `--shadow-sheet`, for a sheet floating over the screen.

## Touch targets

`--h-sm` 36 · `--h-md` 48 · `--h-lg` 60. 48 is the default because the POS is
tapped at arm's length, often one-handed, in a hurry. Standalone icon buttons
get a 44×44 hit area even when the glyph is smaller.

## Motion

One easing (`--ease-out`), one UI duration (`--dur-ui`, 180ms). The live edge
has its own `--dur-live` (2s) and holds full opacity for 70% of it, so a cashier
mid-pour still catches it; only the tail fades.

## Components

Live in [ui.jsx](ui.jsx) with strict contracts. Use them.

- `<Btn kind size full icon disabled>` — `kind` ∈ `slab` (primary, black) ·
  `outline` · `quiet` · `ghost` · `blocked` · `live` and `onslab` (**slab only**).
  `size` ∈ `sm | md | lg` (36 / 48 / 60).
- `<Card padded live>` — white surface, hairline, no shadow. `live` lights the
  cyan edge. **Content only, never an input** — inputs need a shell with no card
  padding; extract it once when the first field lands.
- `<Slab>` — the near-black surface. **One per screen.** A second slab and
  neither reads as the important one. The only place cyan is allowed.
- `<LiveEdge side>` — the 3px cyan edge that fades. Nothing else uses this color.
- `<Chip on>` (selectable) vs `<Tag tone>` (non-interactive label).
- `<Label>` — the uppercase micro-label. `<Heading size>`, `<Money value size>`.
- `<Toggle on blockedWhenOff>` — the sold-out switch; off is not neutral grey,
  off is *blocked*.
- `<Rule onSlab>`, `<SectionHead title sub action>`.

## Icons

Lucide via CDN, through the `I = {...}` map and `ico(name, size)` in
[ui.jsx](ui.jsx). To add one: find the PascalCase name at
<https://lucide.dev/icons>, add one line to `I`.

Don't write inline `<svg>`, don't use emoji as iconography, don't scale with
`transform: scale()`. The same Lucide names map to `flutter_lucide` in
snake_case (`MapPin` → `LucideIcons.mapPin`).

## Imagery

There isn't any, and that is a decision. The data model is name · price ·
category · availability — no photos. The system is type and surface, like its
references. If item photography is ever added upstream, it gets a defined slot
with a fixed aspect ratio; until then, do not invent decorative graphics to fill
space.

## Two layouts, one system

The POS is a **portrait** tablet on a counter stand, used at arm's length all
shift, often one-handed while the other hand takes payment: bigger targets,
nothing that needs precision. Portrait is a tall column, not a wide desk — the
menu grid and the running order stack vertically (the order slab anchored at the
bottom, where the thumb is), rather than sitting side by side. The Manager is a
phone used occasionally and deliberately: standard mobile ergonomics.

**Same tokens and same atoms in both** — the tablet gets more room, not a second
design language.

## Flutter portability

This canvas is a specification for a Flutter app, not a website. Check every
screen against this list — a web-only trick found at build time is a redesign,
found here it's a five-minute edit.

**Don't design with these.** They have no clean Flutter equivalent:

- **Inset shadows.** Flutter's `BoxShadow` has no inset. (We have no shadows at
  all, which is most of this problem solved.)
- **Percentage and viewport sizes** (`85%`, `100vh`, `calc()` mixing units). Use
  fixed sizes and flex weights.
- **`filter: brightness()` as a state.** Press states are `overlayColor` in
  Flutter — design the pressed state as an actual color.
- **Text effects with no counterpart:** `text-shadow` stacks, `background-clip:
  text`, CSS masks.
- **Heavy `backdrop-filter`.** It exists but costs real frames on a tablet.

**Design so these stay easy:**

- Every value comes from a token — the token file becomes `tokens.dart` more or
  less mechanically.
- Controls keep fixed heights (36 / 48 / 60) and `--r-md`; they map straight onto
  `ButtonStyle`.
- Layout is flex: rows, columns, gaps. No CSS Grid areas, no `position: sticky`.
- Tabular figures are `FontFeature.tabularFigures()` — supported, keep using them.

**Expect to re-tune by eye, not by number:** text vertical rhythm
(`line-height` vs Flutter's `height` handles leading differently) and large
corner radii (no iOS squircle out of the box). Fix these once in the Flutter
theme, not per widget.
