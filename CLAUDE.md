# Plugin — design canvas

Design canvas for the **Plugin** POS product (<https://pluginpromotions.com/>).
Single page, React + Babel-standalone via CDN, **no build step**. It feeds a
Flutter implementation in the sibling repo `plugin` — every design choice must be
portable to Flutter.

**Status:** the design system is set — brand-grounded tokens, atoms, device frames
and the canvas are wired. **No screen is designed yet**; `screens.jsx` holds two
placeholders.

## What we're designing

One Flutter project, two applications, one shared Firebase backend.

**POS — iPad Pro 11" (M4) portrait, 834×1194 pt. Also has to survive as web.**
- Shows the active menu: item name, price, category, availability.
- Tapping items builds an order with a running total.
- Menu changes made in Manager appear **live**, without a restart.

**Manager — phone portrait, 390×844 pt.**
- Create, edit and delete menu items.
- Toggle an item between available and sold out.
- Changes propagate to POS in real time.

Two consequences the design has to carry: **live updates are visible events**
(an item going sold out under the cashier's thumb must be legible, not silent),
and **the same menu data reads in two very different layouts**.

## Data model — real fields only

Bind every value on screen to a field that exists. If it isn't in the model,
don't render it — add the field upstream or omit it.

- **MenuItem** — `name`, `price`, `category`, `available` (bool).
- **Order** — a list of lines (`MenuItem` + quantity) and a running total derived
  from them. The total is computed, never stored on a line.

No invented fields (no ratings, prep times, stock counts, images) until they
exist in the backend. And **each fact appears in exactly one place per screen** —
if the price is in the row, it isn't repeated in a chip beside it.

## Run locally

```
python3 serve.py
```

Then open <http://localhost:8001/index.html>. **Use [serve.py](serve.py), not
`python3 -m http.server`** — it sends `Cache-Control: no-store`, so a normal
reload always shows the latest `.jsx` edit. Plain `http.server` lets the browser
cache the Babel files, which makes edits look like they "didn't apply".
`file://` does **not** work (CORS on `.jsx` imports).

> **Debugging "I don't see my change":** suspect caching first, not the code.
> Verify the file on disk, confirm the server's no-cache headers
> (`curl -sI http://localhost:8001/index.html | grep -i cache`), then hard-reload.
> Don't keep re-editing code that's already right.

## The single rule: follow the design system

**Before touching anything visual, read [STYLE_GUIDE.md](STYLE_GUIDE.md) and
[tokens.css](tokens.css).** They are the source of truth. If a design need can't
be expressed by an existing token or component contract, the system needs a new
token — never a one-off inline override.

**North star — ink slab on warm paper.** Warm off-white canvas, ink type, white
cards on hairlines, and **one near-black slab per screen** that carries the money
(the running total, the primary action). Depth is a border or an inverted
surface — there are **no shadows**. The brand's electric cyan means exactly one
thing, *this just changed right now*, and lives **only on ink** (on paper it is
1.4:1). It is never a CTA: the brand made black its action color. Sold-out red is
the only hue on paper; available is the default state and carries no color.

The short version: only `--c-*` colors (no raw hex/rgba in component code), the
4-px spacing grid, the 9-step type scale, DM Sans (Instrument Sans for large
numerals only), `--r-md` on buttons and pill for chips/tags only, 48-px controls,
`--c-ink-soft` (never `--c-ink-faint`) for readable secondary copy.

There are **no theming knobs** — one light token set, no `data-palette` /
`data-density` / `data-radius` / dark-mode variants. If dark mode becomes a
product requirement, it gets designed then, not kept warm as dead CSS.

## Before designing any screen or flow: run `/new-screen`

**Mandatory.** Any new screen, screen state, sheet, confirm, or multi-step flow
starts by invoking the project skill `new-screen`. It runs Refero research
(screens → flows → styles only if needed), forces a reference lock and a decision
ledger, and checks the result against this system. The visual language is already
settled; what that skill settles is *what goes on the screen and in what order*,
grounded in real products rather than in a plausible-looking guess.

Token edits, copy fixes and bug fixes don't need it.

## File map

| File | Role |
|---|---|
| [index.html](index.html) | Entry point — the design canvas (sections + artboards), and the `Phone` / `Tablet` wrappers |
| [_live.html](_live.html) | Single-screen preview harness: `_live.html?s=Name` (`&d=tablet`, `&state=…`, `&fit=1`, `&frame=0`, `&w=`, `&h=`). No canvas, so it stays light enough to screenshot |
| [tokens.css](tokens.css) | **Single source of truth** for colors, type, spacing, radii, motion |
| [STYLE_GUIDE.md](STYLE_GUIDE.md) | The direction, the reference lock, the decision ledger, and the do / don't |
| [ui.jsx](ui.jsx) | Shared atoms — `Btn`, `Card`, `Slab`, `LiveEdge`, `Chip`, `Tag`, `Label`, `Money`, `Heading`, `Toggle`, `Rule`, `SectionHead`, icon set `I` / `ico` |
| [.claude/skills/new-screen/SKILL.md](.claude/skills/new-screen/SKILL.md) | The mandatory pre-screen research gate |
| [screens.jsx](screens.jsx) | Product screens. One function per screen, exported on `window` |
| [starters/ios-frame.jsx](starters/ios-frame.jsx) | iPhone frame (390×844) — Manager |
| [starters/tablet-frame.jsx](starters/tablet-frame.jsx) | iPad Pro 11" (M4) frame — POS. `width`/`height` are the screen (834×1194 portrait); the body adds its own bezel |
| [starters/design-canvas.jsx](starters/design-canvas.jsx) | Canvas wrapper — zoom, pan, sections, PNG export |

Files load as `<script type="text/babel" src="…">` and communicate through
`window` — each file ends with `Object.assign(window, {…})`.

## Canvas is for screens, not components

**Components and atoms live in code only.** Never create an artboard whose sole
purpose is to showcase a component — no `XxxShowcase` functions, no "component
catalog" artboards. To see how a component looks, look at the screens that use it.

If a showcase artboard is ever genuinely needed, it MUST import and render the
**real** component off `window` and only vary props — never reproduce its markup.
A re-implemented copy silently drifts.

## Canvas layout — state variants stack vertically

State variants of one screen (empty cart vs filled, item available vs sold out)
go in a single **vertical column** — main on top, variants below — via a shared
`groupId`:

```jsx
<W.DCArtboard groupId="pos-order" id="pos-order" label="POS · order" …>…</W.DCArtboard>
<W.DCArtboard groupId="pos-order" id="pos-order-empty" label="POS · empty order" …>…</W.DCArtboard>
```

**Group:** state variants of the same screen.
**Don't group:** sequential flow steps, the two different apps, or artboards of
different sizes.

## Working agreements

- **Always make components, never write inline soup.** Inline only markup that
  definitely won't repeat. A visual pattern used twice — or non-trivial even once
  (5+ style props, nested children with their own structure) — is a missing
  component. Extract it into [ui.jsx](ui.jsx). A screen function should read like
  a recipe, not a 200-line wall of styled divs. **Default to extracting.**
- **No new files unless required.** Edit existing ones. The system is small on purpose.
- **Don't add comments** that restate the code. Comment only when the *why* would
  surprise a future reader.
- **After UI edits, reload the page and verify visually.** Type-checking doesn't
  catch design regressions.
- **Verify layout via the live DOM, not screenshots** — inspect the rendered page
  (`getComputedStyle`, `getBoundingClientRect`, `scrollHeight`) against
  `_live.html?s=<Screen>`. Fast and exact.
- **Don't take screenshots unless explicitly asked.**
- When the same value (color, padding, height) appears inline more than twice,
  it's a missing token.
