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
  more:         ico('MoreHorizontal', 20),
  pencil:       ico('Pencil', 18),
  trash:        ico('Trash2', 18),
  alert:        ico('TriangleAlert', 18),
};

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
      {live && <LiveEdge/>}
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
function LiveEdge({ side = 'left' }) {
  const horizontal = side === 'top' || side === 'bottom';
  return (
    <span aria-hidden style={{
      position: 'absolute', background: 'var(--c-live-edge)',
      [side]: 0,
      ...(horizontal ? { left: 0, right: 0, height: 3 } : { top: 0, bottom: 0, width: 3 }),
      animation: 'app-live-edge var(--dur-live) var(--ease-out) forwards',
    }}/>
  );
}

// ─── Chip — selectable filter (category tabs, sections) ──────
function Chip({ children, on, onClick, icon, sm }) {
  return (
    <button onClick={onClick} style={{
      height: sm ? 32 : 'var(--h-sm)', padding: '0 var(--s-16)', borderRadius: 'var(--r-pill)',
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
function Toggle({ on = false, onChange, label, blockedWhenOff }) {
  const offBg = blockedWhenOff ? 'var(--c-blocked)' : 'var(--c-line-strong)';
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(); }}
      style={{
        width: 52, height: 32, borderRadius: 'var(--r-pill)', border: 'none', flexShrink: 0,
        background: on ? 'var(--c-ink)' : offBg,
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

Object.assign(window, {
  Btn, Card, Slab, LiveEdge, Chip, Tag, Label, Money, Heading, Toggle, Rule, SectionHead,
  Icon: I, ico,
});
