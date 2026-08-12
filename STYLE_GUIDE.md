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

Screen-level patterns came from Refero, and each is named in the ledger below:
Shopify's variant rows (a status control *and* a chevron on the same row),
Roots' app-group flow (list → edit → destructive confirm → the refreshed list),
Mela and Plane Finder (a form sheet whose actions sit in its header, above the
keyboard), Airbnb and ElevenLabs (validate on submit, inline, never a mute
disabled button), and On's cart (a line in the ticket carrying its own constraint
message). Drinkit's sheet is the one we looked at and rejected: its full-width
footer CTA is right for a cart with no keyboard and wrong for a form with two
text fields.

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
| All money in Instrument Sans, tabular | brand's second face; craft | numerals | Prices are a column and proportional digits make them jitter — and DM Sans ships no `tnum`, so the UI face cannot hold one however it is asked |
| Every kind of change speaks in **one slot on the line** — tone says which | On's cart (a line carrying its own constraint message) | status | Sold out, off the menu and re-priced are one question for the cashier: *is this line still what I told the customer?* One place to look, and the tone answers it |
| Sold out **replaces the price** on a tile | — | status | A tag on its own line grows the tile, a taller tile grows its grid row, and every target below it moves — from a change the cashier did not make. The right column is also the one the eye runs down |
| A live change nobody can see gets a **dot on the container** — the category chip, or the ticket's expander | — | status | The edge can only mark a thing that is on screen. The dot is cyan with a 1px ink ring: the hue carries the meaning, the ring carries the contrast cyan cannot have on paper |
| Blocked lines **stay in the total** | — | money | The total has to equal the lines above it. A number that quietly drops itself cannot be checked by looking; taking money off is the cashier's move (Remove), never the system's |
| Order lines carry their **own unit price** | — | data | The ticket then survives its item being deleted mid-order, and a price edit is an event that happens *to* the line rather than a lookup that silently returns something else |
| The item editor is a **bottom sheet**, not a pushed screen | Mela · Plane Finder "Add Alert" | form | Three fields and a button do not need a whole screen, and the list staying visible behind it is what makes Cancel obviously free |
| Its Cancel and commit sit in the **sheet's header** | Mela · Plane Finder · Shopify | form | On a phone the bottom third of a form sheet belongs to the keyboard. A commit button parked there is a commit button nobody can reach |
| Availability is **not** in the sheet | — | form | It is one switch on the row behind it. Two copies of the same fact on one screen is one copy too many |
| Save is **never disabled**; errors appear on the attempt | Airbnb "Finish signing up" · craft-details | form | A greyed-out button that will not say what is wrong is a dead end. Tapping it and being told is not |
| The delete confirmation **replaces** the sheet's body | Roots app groups | confirm | Two sheets deep is a place to find your way out of; one sheet that changes its mind is a question |
| The row carries a **chevron as well as** its switch | Shopify variant rows | navigation | Without it the switch is the only thing that looks live, and editing is a feature you have to guess at |
| Categories stay a **value on the item**, from a fixed list of four | the brief's own model | data | A category collection would buy rename, ordering and a management screen — none of which the brief asks for, all of which cost a second collection, its rules, and a rename that writes across every item pointing at it |
| That list is **in serving order, not A–Z** | — | data | Coffee first, because that is what the queue is here for. It is the order of the POS chips and of the manager's groups, it is the same every shift, and it costs nothing to predict |
| Category is **one field**, picked from those four as chips | — | form | There is no managing categories anywhere in this app, so there is no picker and no "+ New" mode either — two modes for one string is how typing a word becomes a feature. The chips keep it a choice from four rather than four spellings of the same word. They are the fixed list and not the names in use, because a list derived from the items offers nothing to pick on an empty menu — the first item could not be filed at all |

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
Sans** (the brand's second face) carries **every number that is money**, at
every size. That is a functional role, not a decorative font swap; never set a
word in it for emphasis.

It is money's face for one hard reason: **DM Sans has no `tnum` feature and its
digits are proportional** — its `1` is 312 units against its `0`'s 684, so a
column of prices set in it visibly jitters, and asking for `tabular-nums` does
nothing about it. Instrument Sans has the feature. Prices are the one thing on
this screen a cashier reads as a column, so they get the face that can hold one.

Nine steps, `--t-caption … --t-display`. Weights 400 / 500 / 600 / 700. Body is
400; emphasis is 600 on the highlighted span, never a size bump.

Two tracking tokens, both the brand's own:
- `--track-tight` (-0.02em) on headings and display sizes.
- `--track-label` (0.18em) on the uppercase micro-label — the brand's signature
  typographic move, and the way a region gets named (`CATEGORY`, `ORDER`)
  without competing with content. Use `<Label>`, don't hand-roll it.

`.app-screen` asks for tabular figures globally, but only Instrument Sans can
answer. Money goes through `<Money>`, which is what puts it in that face — a
price written as a bare `<span>` is a bug, not a shortcut.

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

`--h-sm` 36 · `--h-md` 48. 48 is the default because the POS is tapped at arm's
length, often one-handed, in a hurry; 36 is for a control sitting inside another
one — Clear on the slab header, the sheet's commit. Standalone icon buttons get a
44×44 hit area even when the glyph is smaller.

There is no third step. A 60-px `--h-lg` existed and no drawn screen ever used
it, so it was a size the Flutter port would have carried, mirrored and enumerated
for nobody. If a screen needs one, it gets added back with that screen.

## Motion

One easing, `--ease-out` — everything here is something arriving. Three
durations, each earned:

- **`--dur-ui` (180ms)** — hover, press, a row arriving. High-frequency, so short.
- **`--dur-emphasis` (320ms)** — a value changing in place on a line already in
  the ticket. Long enough to find with the eye, well short of the ~500ms where
  product UI starts to feel slow.
- **`--dur-live` (2s)** — the live edge, holding full opacity for 70% of it so a
  cashier mid-pour still catches it; only the tail fades.

Motion has to do one of three jobs — **feedback**, **continuity** or
**hierarchy** — and the tap that lands in the order panel needs all three: the
tap is in one place, the result is in another, and nothing connects them but
movement.

**Everything that arrives has a way to leave.** A row that opens from zero and
then vanishes on a frame is half-animated, and the half that teleports is the
half the eye catches. So `app-line-in` has `app-line-out`, the sheet slides both
ways, and the scrim fades in and out with it. Leaving runs at `--dur-ui`, not the
duration it arrived on: a thing you have finished with should not make you watch
it go. The cost is that the code has to hold the element until it has finished
leaving — `UI_MS` / `SHEET_MS` in [ui.jsx](ui.jsx), mirroring the tokens — which
is `AnimatedSize` and `AnimatedSwitcher` in Flutter, not a web-only trick.

**One movement per frame.** A new line opens from zero to `--h-order-row`, and
the lines under it are pushed down *by that same growth*. The earlier version
slid the new row in while its neighbours jumped 64px instantly — half the frame
animated, half teleported, which is exactly what reads as jank. If something has
to move because something else moved, the two must be the same motion. In
Flutter this is `AnimatedSize`, not a web-only trick.

A line whose quantity merely changed cannot open — it is already there — so it
takes `--dur-emphasis` of a light overlay instead. Never `transition: all`: name
the properties, or the layout animates behind your back.

Under `prefers-reduced-motion` durations collapse and nothing travels, but
nothing is *hidden* either — the live edge in particular stays lit rather than
being animated away, because losing it would cost that user the product's only
real-time cue.

## Components

Live in [ui.jsx](ui.jsx) with strict contracts. Use them.

- `<Btn kind size full icon disabled>` — `kind` ∈ `slab` (primary, black) ·
  `outline` · `quiet` · `ghost` · `blocked` · `live` and `onslab` (**slab only**).
  `size` ∈ `sm | md | lg` (36 / 48 / 60).
- `<Card padded live>` — white surface, hairline, no shadow. `live` lights the
  cyan edge. **Content only, never an input** — that is what `Field` is for.
- `<Slab>` — the near-black surface. **One per screen.** A second slab and
  neither reads as the important one. The only place cyan is allowed.
- `<LiveEdge side>` — the 3px cyan edge that fades, on a thing you can see.
  `<LiveDot ring>` — the same news when the thing itself is off screen; `ring`
  is required on paper and wrong on ink. Nothing else uses this color.
- `<Chip on dot>` (selectable) vs `<Tag tone>` (non-interactive label).
- `<Label>` — the uppercase micro-label. `<Heading size>`, `<Money value size>`.
- `<Toggle on blockedWhenOff>` — the sold-out switch; off is not neutral grey,
  off is *blocked*.
- `<MenuTile available live>` — fixed 84 in every state. `<TileSkeleton>` is the
  same tile before the first snapshot: two bars, no spinner.
- `<OrderLine note stopped live emphasis>` — `note` is `{tone, text}` and the one
  slot a line uses to say what happened to it; `stopped` takes the stepper away
  and offers Remove instead.
- `<ItemRow onOpen onToggle>` — the manager's row: switch *and* chevron.
- `<Field error inputRef>` — the labelled input. `error` is a sentence under a
  blocked border, and it only ever appears after an attempt to save.
- `<Sheet handle padded onDismiss>` + `<SheetHead onCancel action>` — the form
  sheet. `handle` promises it can be swiped away, so a confirmation never gets one.
- `<Rule onSlab>`, `<SectionHead title sub action>`.

## Icons

Lucide via CDN, through the `I = {...}` map and `ico(name, size)` in
[ui.jsx](ui.jsx). To add one: find the PascalCase name at
<https://lucide.dev/icons>, add one line to `I`.

Don't write inline `<svg>`, don't use emoji as iconography, don't scale with
`transform: scale()`. The same Lucide names map to `flutter_lucide`, which spells
them in snake_case: `MapPin` → `LucideIcons.map_pin`, `Trash2` →
`LucideIcons.trash_2`, `ChevronRight` → `LucideIcons.chevron_right`. Verified
against the package, not assumed — the identifiers are not lowerCamelCase.

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

### Targets do not move

On the POS the cashier is hitting targets at arm's length, fast, without
looking down between taps. So **no interaction may re-flow the layout around
it.** The order slab is a region of fixed height and the lines scroll *inside*
it; it does not grow with the order, and it keeps that height when the order is
empty, because a panel that is briefly smaller is the same bug in a smaller
dose. Its header holds its height whether or not `Clear` is showing. The menu,
the slab and the total sit at the same y all shift.

That rule is what makes the layout choice: growing panels, content-sized
sheets, and anything that reflows a grid the user is mid-tap on are out.

**The collapsed ticket does not scroll at all.** It shows the newest few lines
and nothing else moves; a tap on the menu makes that item the most recent, so
what you just rang up is always one of them — new or already there. Scrolling
exists in one place only, inside the expanded sheet, and only once the ticket
passes what the sheet can show. A region that can't scroll can't be scrolled to
a position that slices a row, which is most of that problem deleted rather than
solved. The steppers never re-order: a line must not move out from under the
finger using it.

It also decides how the menu is organised. **One category at a time, chosen by
a chip — not stacked sections.** Sections read fine and scroll badly: where an
item lands depends on how far you have scrolled, so it is never in the same
place twice. Filtering gives each item fixed coordinates the cashier can learn,
and it is what the reference products do (Uber Eats category tabs, Google
Maps' menu tab bars). The selected chip is also the one place the category name
appears.

And it is why a scrolling region is an exact number of whole rows high. A list
showing 3.2 rows has no resting position that doesn't slice one in half, so
every row is a fixed height and every container that holds rows is derived from
it — never a number picked by eye.

Deliberate mode changes are exempt. Expanding the ticket moves the layout on
purpose, because the user asked for it; that is not the same as a tap on a menu
item rearranging the menu.

### Where this knowingly leaves the industry standard

Square and Toast both build the cashier screen as a **configurable grid of
tiles grouped into menu groups** — that part we match, and it is why the menu is
a 3-up grid switched by category chips rather than a scrolling list.

Three places we diverge on purpose. Each is a decision, not an oversight:

| We do | The standard | Why |
|---|---|---|
| **Portrait**, ticket pinned at the bottom | Landscape, ticket a permanent right-hand rail | A counter stand is often vertical. The cost is real: only three lines are visible at rest, which is what makes the expand sheet necessary at all. In landscape the whole ticket is always on screen and that machinery disappears. |
| **Newest line first** | Chronological, newest appended last | The line just rung up is the one that has to be seen, and at the top it needs no scroll. A repeat tap only changes quantity — it never re-orders, or a line would move under the finger. |
| **No search, no favourites page** | Both, once a menu passes ~40 items | Out of scope for now, not a claim that it is unnecessary. It is the first thing to add if the menu grows. |

Refero has no coverage of cashier-facing POS, so those rows are grounded in
Square and Toast's own product documentation rather than in reference screens.
Weaker evidence than the rest of this file, and worth saying out loud.

### Deliberately not designed

Not oversights. If one of these becomes a requirement it gets designed then.

| Not here | Why |
|---|---|
| **Taking payment.** The order has a total and a Clear, and no Charge | The brief ends at "builds an order with a running total". The slab is already carrying the money; adding a commit action is a product decision, not a layout one |
| **Connection status.** No offline banner in either app | Firestore serves its cache offline and queues writes; the register keeps working. Called out here because a real-time product with no connection state is a gap someone should be able to find on purpose rather than by accident |
| **Search and favourites** | Out of scope while the menu is this size — the first thing to add when it grows |
| **Sign-in, roles, more than one till** | The security rules are a backend concern in the Flutter repo; nothing on these screens depends on who is holding the device |

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
- Tabular figures are `FontFeature.tabularFigures()` — supported, and it must go
  on the money styles specifically, since DM Sans has nothing to switch on.

**Expect to re-tune by eye, not by number:** text vertical rhythm
(`line-height` vs Flutter's `height` handles leading differently) and large
corner radii (no iOS squircle out of the box). Fix these once in the Flutter
theme, not per widget.
