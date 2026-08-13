# Plugin POS Design

Design prototype for the Plugin POS project. It defines the screens and visual
system later implemented in the [Flutter repository](https://github.com/ABespolov/plugin-pos).

## Run

No build step is required. Start the local server from this directory:

```bash
python3 serve.py
```

Open <http://localhost:8001/index.html>.

For a single screen, use the live preview:

```text
http://localhost:8001/_live.html?s=POSOrder&d=tablet&state=open
```

Use `serve.py` rather than `python3 -m http.server`; it disables caching for the
prototype files.

## Screens

- **POS** — iPad portrait, 834×1194. Live menu, order ticket and total.
- **Manager** — phone portrait, 390×844. Menu list, item form and delete flow.

Each screen has an interactive artboard and stills for its important states:
loading, empty data, live menu changes and order changes.

## Files

```text
index.html       design canvas with all artboards
_live.html       single-screen preview
screens.jsx      POS and Manager screens
ui.jsx           shared UI components
tokens.css       design tokens
STYLE_GUIDE.md   visual rules and decisions
starters/        phone, tablet and canvas wrappers
```

The prototype uses React and Babel Standalone from the browser. Files are loaded
as scripts, so there is no package manager or bundler in this repository.

## Design rules

`tokens.css` and `STYLE_GUIDE.md` are the source for colors, type, spacing,
radii and motion. New UI should use existing tokens and shared components. The
prototype models the real menu fields and order behaviour; it does not invent
backend data just for the mockup.

## Relationship to Flutter

The design repo answers what the product should look like and how each state
behaves. The [Flutter repo](https://github.com/ABespolov/plugin-pos) answers how it is implemented. If they differ, record
the reason and update the relevant source instead of leaving the difference
unexplained.

## AI tools

I used Claude Code to help build and review the prototype. The final screens,
states and design decisions were checked against the product requirements and
then used as the reference for the Flutter implementation.