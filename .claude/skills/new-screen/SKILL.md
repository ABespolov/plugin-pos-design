---
name: new-screen
description: MANDATORY before designing any new screen, state variant, or flow in this project — POS or Manager. Runs Refero research (styles → screens → flows), produces a reference lock and decision ledger, and checks the result against the locked design system. Invoke whenever the task is to design, add, lay out, redesign, or restructure a screen, a screen state, a sheet/modal, or a multi-step flow. Also invoke before adding a new component that changes how a screen reads.
---

# New screen / flow

Nothing gets drawn in this project from vibe memory. The visual system is
already locked (see [STYLE_GUIDE.md](../../../STYLE_GUIDE.md)); what is *not*
locked, and what this skill exists to settle, is **what goes on the screen and
in what order** — and that has to come from real product evidence.

Do not skip a step because the screen "seems obvious". The obvious version of a
POS screen is the averaged one.

## 0. Gate

If the request is any of these, you are in the right place:

- a new screen in `screens.jsx`
- a new state of an existing screen (empty, error, sold out, mid-order…)
- a sheet, modal, or confirm
- a multi-step flow
- a component that changes how a screen reads

If it is a token change, a copy fix, or a bug, stop — this skill doesn't apply.

## 1. Brief (3 lines, written out)

```
Designing [SCREEN] for [POS cashier mid-shift | manager on a phone].
Goal: [the one thing the user is trying to finish].
Risk: [what goes wrong if this screen is slow or misread].
```

The POS user is standing, holding something in the other hand, and being watched
by a customer. The Manager user is fixing one thing, fast, and leaving. Neither
is browsing.

## 2. Research — Refero, in this order

Use the `refero-design` skill's methodology. Minimum for a screen:

1. **Screens** — `refero_search_screens` with `platform: "ios"`, at least **3
   queries from different angles**. Search by what is literally on the screen,
   not by adjective: `menu category grid price`, `order summary running total`,
   `sold out unavailable item state`, `edit item form delete`, `quantity
   stepper`. Pull 2–3 full screens with `refero_get_screen`; use
   `refero_get_similar_screens` to expand from the strongest one.
2. **Flows** — `refero_search_flows` whenever the task has a before/after
   (adding an item, editing a menu item, closing an order). Get the step count,
   the decision points, and the confirmation/undo behaviour.
3. **Styles** — only if the screen needs a *layout* idea the system doesn't have
   yet (a new kind of section rhythm, a new density). The palette, type and
   surface language are already locked; do not re-research them and do not let a
   style talk you into a new hue.

Coverage note: Refero is thin on tablet POS specifically. When it is, take the
pattern from adjacent products (ordering apps, checkout, inventory editors) and
say in the ledger that you adapted it — don't silently invent.

## 3. Lock, before drawing

Write these out. If a row has no source, it isn't a decision yet.

```
Pattern source:  [screen/flow, named]
Adapted because: [how the POS/Manager context differs]
Screen owns:     [the one job of this screen]
On the slab:     [what earns the near-black surface here — usually the total or the commit action]
Live signal:     [what can change in real time on this screen, and what lights]
States:          [empty · loading · sold out · error · just-changed]
```

| Decision | Source | Why |
|---|---|---|
| … | … | … |

## 4. Draw

Build from the atoms in [ui.jsx](../../../ui.jsx). If a pattern repeats or is
non-trivial, extract a component — a screen function reads like a recipe.

Hard rules from the system that get broken most often:

- **One slab per screen.** Two black surfaces and neither is the important one.
- **Cyan only on ink, only for "this just changed".** Not a CTA, not a highlight.
- **No shadows.** Hairline or inverted surface.
- **Available is not decorated.** Only `blocked` gets a hue on paper.
- **Every value from a token.** No raw hex, no off-grid spacing.
- **No invented data.** `MenuItem` is name · price · category · available;
  `Order` is lines + a computed total. Nothing else exists yet.

## 5. Check before saying it's done

- [ ] Every major choice traces to a Refero screen/flow, the brief, or the style guide
- [ ] The reference lock survived — nothing softened into the safe default
- [ ] All states drawn, not just the happy one
- [ ] Renders clean: `_live.html?s=<Name>` (`&d=tablet` for POS), no console errors
- [ ] Artboard added to `index.html`; state variants share a `groupId`
- [ ] Nothing on screen that the data model can't supply
- [ ] Reads at arm's length: 16px body, 48px controls, price column aligned

Report the ledger to the user with the screen. If a decision has no source,
say so out loud rather than dressing it up.
