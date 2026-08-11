// Shared UI atoms. Every screen builds from these — never style a raw
// <button> or re-roll a surface inline.
//
// The system is INK SLAB ON WARM PAPER (see STYLE_GUIDE.md). Two rules do most
// of the work here: hierarchy comes from hairlines and surface inversion, never
// shadow; and cyan (`--c-live`) only ever appears on ink.

const { useState, useEffect, useRef } = React;

// ─── Icons — Lucide (https://lucide.dev) — ISC licensed ──────
// Wraps window.lucide (loaded via CDN UMD). Each I.x is a pre-rendered React
// element at its default size. For another size use ico('Plus', 24).
function ico(name, size = 24, extra = {}) {
  const spec = (typeof window !== 'undefined' && window.lucide && window.lucide[name]);
  const children = Array.isArray(spec) ? spec : [];
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
    ...extra,
  }, children.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs })));
}

// Add icons here as screens need them — one line each, PascalCase Lucide name.
const I = {
  search:       ico('Search', 20),
  plus:         ico('Plus', 20),
  minus:        ico('Minus', 20),
  close:        ico('X', 20),
  check:        ico('Check', 18),
  chevronLeft:  ico('ChevronLeft', 20),
  chevronRight: ico('ChevronRight', 18),
  chevronDown:  ico('ChevronDown', 18),
  chevronUp:    ico('ChevronUp', 18),
  more:         ico('MoreHorizontal', 20),
  pencil:       ico('Pencil', 18),
  trash:        ico('Trash2', 18),
  alert:        ico('TriangleAlert', 18),
};

// The menu grid is 3-up on the POS: at arm's length a 254-px tile is a target you
// hit without looking, and with no imagery in the model three columns still read
// as a list of names rather than a wall.
const MENU_COLUMNS = 3;

// Mirrors --h-order-row in tokens.css, which is where the row height actually
// lives; this copy exists because the slab has to do arithmetic with it. Every
// order line is exactly this tall, including the taller-looking one carrying a
// Sold out tag — a ticket showing 3.2 rows would always cut one of them.
const ORDER_ROW_H = 64;

// ─── Button ──────────────────────────────────────────────────
// `slab` is the primary: black fill, white label — the brand made black its
// accent, so the strongest action on paper is ink. `live` is the only cyan
// button and it may ONLY be placed on the ink slab.
function Btn({ children, kind = 'slab', size = 'md', icon, full, onClick, style = {}, disabled, className }) {
  const heights = { sm: 'var(--h-sm)', md: 'var(--h-md)', lg: 'var(--h-lg)' };
  const px = { sm: 14, md: 20, lg: 26 };
  const fs = { sm: 'var(--t-body-sm)', md: 'var(--t-body)', lg: 'var(--t-body-lg)' };
  const kinds = {
    slab:      { bg: 'var(--c-action)', fg: 'var(--c-on-action)', bd: 'transparent' },
    outline:   { bg: 'transparent', fg: 'var(--c-ink)', bd: 'var(--c-line-strong)' },
    quiet:     { bg: 'var(--c-surface-tint)', fg: 'var(--c-ink)', bd: 'transparent' },
    ghost:     { bg: 'transparent', fg: 'var(--c-ink-soft)', bd: 'transparent' },
    blocked:   { bg: 'var(--c-blocked-soft)', fg: 'var(--c-blocked)', bd: 'transparent' },
    // on the slab
    live:      { bg: 'var(--c-live)', fg: 'var(--c-on-live)', bd: 'transparent' },
    onslab:    { bg: 'transparent', fg: 'var(--c-on-slab)', bd: 'var(--c-on-slab-line)' },
  };
  const p = kinds[kind] || kinds.slab;
  return (
    <button onClick={onClick} disabled={disabled} className={className} data-kind={kind} style={{
      height: heights[size], padding: `0 ${px[size]}px`, borderRadius: 'var(--r-md)',
      background: p.bg, color: p.fg, border: `1px solid ${p.bd}`,
      fontFamily: 'inherit', fontSize: fs[size], fontWeight: 600, letterSpacing: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 'var(--s-8)', justifyContent: 'center',
      width: full ? '100%' : undefined, lineHeight: 1, whiteSpace: 'nowrap',
      transition: 'background var(--dur-ui) var(--ease-out), transform 80ms var(--ease-out)',
      ...style,
    }}>
      {icon}{children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────
// A white surface on paper, held by a hairline. No shadow, ever — depth in this
// system is a border or an inverted surface. `live` lights the brand edge when a
// real-time change has just landed on this card.
function Card({ children, style = {}, padded = true, onClick, live }) {
  return (
    <div onClick={onClick} style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--c-surface)', border: '1px solid var(--c-line)',
      borderRadius: 'var(--r-lg)', padding: padded ? 'var(--pad-card)' : 0,
      color: 'var(--c-ink)',
      ...style,
    }}>
      {live && <LiveEdge hold={live === 'hold'}/>}
      {children}
    </div>
  );
}

// ─── Slab ────────────────────────────────────────────────────
// The near-black surface that carries the money: the running order, the total,
// the moment of commitment. One per screen — a second slab and neither reads as
// the important one. This is the only place cyan is allowed.
function Slab({ children, style = {}, padded = true, radius = 'var(--r-xl)' }) {
  return (
    <div style={{
      background: 'var(--c-slab)', color: 'var(--c-on-slab)',
      borderRadius: radius, padding: padded ? 'var(--s-20)' : 0,
      ...style,
    }}>{children}</div>
  );
}

// ─── Live edge ───────────────────────────────────────────────
// The product's promise is that a change made in Manager shows up here, now.
// That has to be visible: the edge lights cyan and fades. Nothing else in the
// system uses this color, so it can only ever mean "this just changed".
// `hold` freezes it lit. The canvas is a still medium: an artboard whose whole
// subject is "this just changed" cannot spend its 2 seconds and then show
// nothing. Product code lets it fade; a design frame holds the moment.
function LiveEdge({ side = 'left', hold }) {
  const horizontal = side === 'top' || side === 'bottom';
  return (
    <span aria-hidden data-live-edge style={{
      position: 'absolute', background: 'var(--c-live-edge)',
      [side]: 0,
      ...(horizontal ? { left: 0, right: 0, height: 3 } : { top: 0, bottom: 0, width: 3 }),
      ...(hold ? {} : { animation: 'app-live-edge var(--dur-live) var(--ease-out) forwards' }),
    }}/>
  );
}

// ─── Chip — selectable filter (category tabs, sections) ──────
// `lg` is the POS size: a chip that switches the whole menu is hit as often as
// the items themselves, so it gets the same 48 as every other counter control.
function Chip({ children, on, onClick, icon, size = 'md' }) {
  const heights = { sm: 32, md: 'var(--h-sm)', lg: 'var(--h-md)' };
  return (
    <button onClick={onClick} style={{
      height: heights[size], padding: '0 var(--s-20)', borderRadius: 'var(--r-pill)',
      background: on ? 'var(--c-ink)' : 'var(--c-surface-tint)',
      color: on ? 'var(--c-on-action)' : 'var(--c-ink)',
      border: 'none',
      fontFamily: 'inherit', fontSize: 'var(--t-body-sm)', fontWeight: 600,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: 'var(--s-4)', whiteSpace: 'nowrap', flexShrink: 0,
      transition: 'background var(--dur-ui) var(--ease-out)',
    }}>{icon}{children}</button>
  );
}

// ─── Tag — non-interactive label ─────────────────────────────
// `blocked` is the loud one, and deliberately the only hue that appears on
// paper: a cashier must catch "sold out" without reading it.
function Tag({ children, tone = 'quiet', icon }) {
  const tones = {
    quiet:   { bg: 'var(--c-surface-tint)', fg: 'var(--c-ink-soft)', bd: 'transparent' },
    outline: { bg: 'transparent', fg: 'var(--c-ink-soft)', bd: 'var(--c-line)' },
    ink:     { bg: 'var(--c-ink)', fg: 'var(--c-on-action)', bd: 'transparent' },
    blocked: { bg: 'var(--c-blocked-soft)', fg: 'var(--c-blocked)', bd: 'transparent' },
    live:    { bg: 'var(--c-live)', fg: 'var(--c-on-live)', bd: 'transparent' }, // slab only
  };
  const p = tones[tone] || tones.quiet;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--s-4)',
      padding: '3px var(--s-8)', borderRadius: 'var(--r-pill)',
      background: p.bg, color: p.fg, border: `1px solid ${p.bd}`,
      fontSize: 'var(--t-caption)', fontWeight: 700, lineHeight: 1.4,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
    }}>{icon}{children}</span>
  );
}

// ─── Micro label ─────────────────────────────────────────────
// The brand's signature typographic move: tiny uppercase set on .18em tracking.
// Names a region (CATEGORY, ORDER, SOLD OUT) without competing with content.
function Label({ children, tone = 'soft', style = {} }) {
  const colors = { soft: 'var(--c-ink-soft)', ink: 'var(--c-ink)', onslab: 'var(--c-on-slab-soft)' };
  return (
    <div style={{
      fontSize: 'var(--t-caption)', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 'var(--track-label)', color: colors[tone] || colors.soft,
      ...style,
    }}>{children}</div>
  );
}

// ─── Money ───────────────────────────────────────────────────
// Prices are a column, not a sentence: tabular figures, and the large sizes use
// the brand's second face, whose condensed digits hold a big total together.
function Money({ value, size = 'body', style = {} }) {
  const big = size === 'display' || size === 'h-lg' || size === 'h';
  return (
    <span style={{
      fontFamily: big ? 'var(--font-numeric)' : 'inherit',
      fontSize: `var(--t-${size})`,
      fontWeight: big ? 600 : 500,
      letterSpacing: big ? 'var(--track-tight)' : 0,
      fontVariantNumeric: 'tabular-nums',
      ...style,
    }}>{value}</span>
  );
}

// ─── Heading ─────────────────────────────────────────────────
function Heading({ children, size = 'h', style = {} }) {
  return (
    <div style={{
      fontSize: `var(--t-${size})`, fontWeight: 700,
      letterSpacing: 'var(--track-tight)', lineHeight: 1.15,
      ...style,
    }}>{children}</div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────
// The manager's sold-out switch. Off is not "grey neutral" — it is blocked, so
// the off track carries the blocked hue and the state is readable at a glance.
// When off means *blocked*, on must go quiet. A list of forty rows where every
// available one wears the system's strongest ink is a black picket fence: the
// majority state ends up shouting and the two rows that actually need attention
// are outnumbered. Available carries no colour — that is the whole rule — so the
// on track drops to the same neutral the component already uses for a track,
// and red is left as the only hue on the screen.
function Toggle({ on = false, onChange, label, blockedWhenOff }) {
  const offBg = blockedWhenOff ? 'var(--c-blocked)' : 'var(--c-line-strong)';
  const onBg = blockedWhenOff ? 'var(--c-ink-faint)' : 'var(--c-ink)';
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(); }}
      style={{
        width: 52, height: 32, borderRadius: 'var(--r-pill)', border: 'none', flexShrink: 0,
        background: on ? onBg : offBg,
        padding: 3, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background var(--dur-ui) var(--ease-out)',
      }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--c-surface)' }}/>
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────
function Rule({ onSlab, style = {} }) {
  return <div style={{ height: 1, background: onSlab ? 'var(--c-on-slab-line)' : 'var(--c-line)', ...style }}/>;
}

// ─── Section header ─────────────────────────────────────────
function SectionHead({ title, action, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--s-12)' }}>
      <div>
        <Label>{title}</Label>
        {sub && <div style={{ fontSize: 'var(--t-body-sm)', color: 'var(--c-ink-soft)', marginTop: 4 }}>{sub}</div>}
      </div>
      {action && <span style={{ fontSize: 'var(--t-body-sm)', fontWeight: 600, color: 'var(--c-ink-soft)' }}>{action}</span>}
    </div>
  );
}

// ─── Stepper — quantity on an order line ─────────────────────
// Two standalone icon buttons, so they get the full 48 hit area rather than the
// glyph's size. `onSlab` is the only variant used today; the paper palette is
// here so a Manager screen doesn't have to re-roll it.
function Stepper({ value, onDec, onInc, onSlab, label = 'quantity' }) {
  const bd = onSlab ? 'var(--c-on-slab-line)' : 'var(--c-line-strong)';
  const fg = onSlab ? 'var(--c-on-slab)' : 'var(--c-ink)';
  const step = (icon, onClick, aria) => (
    <button type="button" aria-label={`${aria} ${label}`} onClick={onClick}
      data-onslab-icon={onSlab ? '' : undefined} style={{
        width: 'var(--h-md)', height: 'var(--h-md)', flexShrink: 0, padding: 0,
        borderRadius: 'var(--r-md)', background: 'transparent',
        border: `1px solid ${bd}`, color: fg, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background var(--dur-ui) var(--ease-out)',
      }}>{icon}</button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-8)' }}>
      {step(I.minus, onDec, 'Decrease')}
      <span style={{ minWidth: 28, textAlign: 'center', fontSize: 'var(--t-body)', fontWeight: 600, color: fg }}>{value}</span>
      {step(I.plus, onInc, 'Increase')}
    </div>
  );
}

// ─── Menu tile — one MenuItem on the POS grid ────────────────
// Available is the default and carries no decoration. Sold out drops the tile to
// the quiet fill, softens the ink and states itself in the one hue paper gets —
// the cashier catches it before reading it. `live` lights the cyan edge when the
// change landed from Manager just now.
function MenuTile({ name, price, available = true, live, onClick }) {
  return (
    <button
      type="button" aria-disabled={!available} data-tile
      onClick={available ? onClick : undefined}
      style={{
        position: 'relative', overflow: 'hidden',
        // One row of content, vertically centred — a tile tall enough to pin the
        // name to the top and the price to the bottom leaves a hole in the middle
        // that reads as missing content. 84 fits the sold-out tag's second line
        // and still lands four categories on screen without a scroll.
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 'var(--s-8)', minHeight: 84, padding: 'var(--pad-card)',
        background: available ? 'var(--c-surface)' : 'var(--c-surface-tint)',
        border: '1px solid var(--c-line)', borderRadius: 'var(--r-lg)',
        // a <button> does not inherit color — say it here so the whole tile,
        // name and price together, greys out in one move when it's sold out
        color: available ? 'var(--c-ink)' : 'var(--c-ink-soft)',
        fontFamily: 'inherit', textAlign: 'left',
        cursor: available ? 'pointer' : 'default',
        // named properties, never `all` — `all` would animate the layout too
        transition: 'background var(--dur-ui) var(--ease-out), transform 90ms var(--ease-out)',
      }}>
      {live && <LiveEdge hold={live === 'hold'}/>}
      {/* name left, money right — the price column runs down the whole screen and
          terminates in the total on the slab */}
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-12)' }}>
        <span style={{
          flex: 1, minWidth: 0,
          fontSize: 'var(--t-body-lg)', fontWeight: 600, lineHeight: 1.25, textWrap: 'balance',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{name}</span>
        <Money value={price} size="body-sm" style={{ color: 'var(--c-ink-soft)' }}/>
      </span>
      {!available && <span style={{ alignSelf: 'flex-start' }}><Tag tone="blocked">Sold out</Tag></span>}
    </button>
  );
}

// ─── Menu grid ───────────────────────────────────────────────
// One category's items. The category is named by the selected chip above, not
// repeated here — and because only one category is ever on screen, an item sits
// at the same coordinates every time the cashier picks that chip. Stacked
// sections cannot promise that: where an item lands depends on the scroll.
function MenuGrid({ children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${MENU_COLUMNS}, 1fr)`, gap: 'var(--s-12)',
    }}>{children}</div>
  );
}

// ─── Field — a labelled input ────────────────────────────────
// The shell STYLE_GUIDE asked for: Card is content-only, an input needs its own
// surface with no card padding. The label is a real <label>, so the tap target
// includes the word, not only the box.
//
// `prefix` sits inside the border and is not part of the value — a price field
// shows the currency without the manager having to type it.
function Field({ label, value, placeholder, prefix, inputMode, id, onChange }) {
  return (
    <label htmlFor={id} style={{ display: 'block', cursor: 'text' }}>
      <Label style={{ marginBottom: 'var(--s-8)' }}>{label}</Label>
      <span style={{
        display: 'flex', alignItems: 'center', gap: 'var(--s-4)',
        height: 'var(--h-md)', padding: '0 var(--pad-card)',
        background: 'var(--c-surface)', border: '1px solid var(--c-line-strong)',
        borderRadius: 'var(--r-md)',
      }}>
        {prefix && <span style={{ color: 'var(--c-ink-soft)', fontSize: 'var(--t-body)' }}>{prefix}</span>}
        <input
          id={id} value={value} placeholder={placeholder} onChange={onChange}
          inputMode={inputMode} autoComplete="off" spellCheck={false}
          style={{
            flex: 1, minWidth: 0, height: '100%',
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'inherit', fontSize: 'var(--t-body)', color: 'var(--c-ink)',
            fontVariantNumeric: 'tabular-nums',
          }}/>
      </span>
    </label>
  );
}

// ─── Sheet — a decision that blocks the screen behind it ─────
// The one place the system allows a shadow, and it is spent here: this is not a
// panel sitting on the page, it is a thing floating over it that wants an answer.
function Sheet({ children, onDismiss }) {
  return (
    <div onClick={onDismiss} style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'var(--c-scrim)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        boxShadow: 'var(--shadow-sheet)',
        padding: 'var(--s-24) var(--pad-phone) var(--s-40)',
        overscrollBehavior: 'contain',
      }}>{children}</div>
    </div>
  );
}

// ─── Item row — one MenuItem in the Manager's list ───────────
// The row opens the editor; the switch changes availability without leaving.
// Sold out is NOT greyed here, unlike the POS tile: on the counter grey means
// "you cannot tap this", and on this screen a sold-out item is exactly the one
// the manager most needs to tap. Same state, different decoration, because the
// affordance is the opposite.
//
// A <div> and not a <button>: it contains the Toggle, and a button inside a
// button is invalid. Toggle stops its own click from reaching the row.
function ItemRow({ name, price, available, onOpen, onToggle }) {
  return (
    <div role="button" tabIndex={0} onClick={onOpen} data-row
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen && onOpen(); } }}
      style={{
      display: 'flex', alignItems: 'center', gap: 'var(--s-12)',
      padding: '0 var(--pad-card)', height: 'var(--h-order-row)',
      cursor: 'pointer', transition: 'background var(--dur-ui) var(--ease-out)',
    }}>
      <span style={{
        flex: 1, minWidth: 0, fontSize: 'var(--t-body)', fontWeight: 500,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{name}</span>
      {/* fixed column, so a two-digit price does not shove its neighbours out
          of line — every price on this screen lands on one edge */}
      <Money value={price} size="body-sm"
        style={{ width: 64, textAlign: 'right', color: 'var(--c-ink-soft)', flexShrink: 0 }}/>
      <Toggle on={available} onChange={onToggle} blockedWhenOff label={`${name} available`}/>
    </div>
  );
}

// ─── Item group — one category of the Manager's list ─────────
// The grouped list: category named once above a white card, rows inside it
// divided by hairlines. The card is the system's surface and the iOS
// convention at the same time.
function ItemGroup({ category, children }) {
  const rows = React.Children.toArray(children);
  return (
    <section style={{ marginBottom: 'var(--s-24)' }}>
      <Label style={{ marginBottom: 'var(--s-8)', paddingLeft: 'var(--pad-card)' }}>{category}</Label>
      <Card padded={false}>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Rule style={{ marginLeft: 'var(--pad-card)' }}/>}
            {row}
          </React.Fragment>
        ))}
      </Card>
    </section>
  );
}

// ─── Order line — one line of the running order, on the slab ──
// `price` is the line total; the unit price lives on the menu tile. When the item
// behind the line goes sold out the stepper is gone — there is nothing left to
// increment — and the line offers the only move left: take it off.
// `emphasis` is a counter, not a flag: re-tapping the same item has to read as a
// second event, and changing the key restarts the animation where a boolean
// would sit there already true.
function OrderLine({ name, qty, price, blocked, live, emphasis, onDec, onInc, onRemove }) {
  return (
    <div data-line={name} style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 'var(--s-16)',
      padding: '0 var(--pad-tablet)', height: 'var(--h-order-row)', flexShrink: 0,
      // clipped so the content does not spill while the row opens
      overflow: 'hidden',
      animation: 'app-line-in var(--dur-ui) var(--ease-out)',
    }}>
      {live && <LiveEdge hold={live === 'hold'}/>}
      {emphasis > 0 && (
        <span key={emphasis} aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'var(--c-on-slab-hover)',
          animation: 'app-emphasis var(--dur-emphasis) var(--ease-out) forwards',
        }}/>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--t-body)', fontWeight: 500, color: 'var(--c-on-slab)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{name}</div>
        {blocked && <div style={{ marginTop: 'var(--s-4)' }}><Tag tone="blocked">Sold out</Tag></div>}
      </div>
      {blocked
        ? <Btn kind="onslab" onClick={onRemove}>Remove</Btn>
        : <Stepper value={qty} onDec={onDec} onInc={onInc} onSlab label={name}/>}
      <Money value={price} style={{ width: 88, textAlign: 'right', color: 'var(--c-on-slab)' }}/>
    </div>
  );
}

Object.assign(window, {
  Btn, Card, Slab, LiveEdge, Chip, Tag, Label, Money, Heading, Toggle, Rule, SectionHead,
  Stepper, MenuTile, MenuGrid, OrderLine, ItemRow, ItemGroup, Field, Sheet, ORDER_ROW_H,
  Icon: I, ico,
});
