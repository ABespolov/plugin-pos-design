// Shared UI atoms. Every screen builds from these — never style a raw
// <button> or re-roll a card surface inline.

const { useState, useEffect, useRef } = React;

// ─── Icons — Lucide (https://lucide.dev) — ISC licensed ──────
// Wraps window.lucide (loaded via CDN UMD). Each I.x is a pre-rendered React
// element at its default size. For another size use ico('MapPin', 24).
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
  plus:         ico('Plus', 16),
  minus:        ico('Minus', 16),
  close:        ico('X', 16),
  check:        ico('Check', 16),
  chevronLeft:  ico('ChevronLeft', 20),
  chevronRight: ico('ChevronRight', 16),
  chevronDown:  ico('ChevronDown', 16),
  more:         ico('MoreHorizontal', 20),
  settings:     ico('Settings', 20),
  trash:        ico('Trash2', 18),
  alert:        ico('TriangleAlert', 18),
};

// ─── Pill button ─────────────────────────────────────────────
function Btn({ children, kind = 'primary', size = 'md', icon, full, onClick, style = {}, disabled, className }) {
  const heights = { sm: 32, md: 44, lg: 56 };
  const px = { sm: 14, md: 22, lg: 28 };
  const fs = { sm: 13, md: 15, lg: 16 };
  const palettes = {
    primary:   { bg: 'var(--c-accent)', fg: 'var(--c-paper)', bd: 'transparent' },
    secondary: { bg: 'transparent', fg: 'var(--c-ink)', bd: 'var(--c-ink-line-strong)' },
    ghost:     { bg: 'transparent', fg: 'var(--c-ink-soft)', bd: 'transparent' },
    soft:      { bg: 'var(--c-soft-bg)', fg: 'var(--c-soft-fg)', bd: 'transparent' },
    canvas:    { bg: 'var(--c-canvas)', fg: 'var(--c-ink)', bd: 'transparent' },
    good:      { bg: 'var(--c-success-soft)', fg: 'var(--c-success)', bd: 'transparent' },
    danger:    { bg: 'var(--c-danger-soft)', fg: 'var(--c-danger)', bd: 'transparent' },
    onaccent:  { bg: 'var(--c-paper)', fg: 'var(--c-accent)', bd: 'transparent' },
    onmedia:   { bg: 'transparent', fg: 'var(--c-on-media)', bd: 'var(--c-glass-thin)' },
  };
  const p = palettes[kind] || palettes.primary;
  return (
    <button onClick={onClick} disabled={disabled} className={className} data-kind={kind} style={{
      height: heights[size], padding: `0 ${px[size]}px`, borderRadius: 'var(--r-pill)',
      background: p.bg, color: p.fg, border: `1px solid ${p.bd}`,
      fontFamily: 'inherit', fontSize: fs[size], fontWeight: 600, letterSpacing: 0.06,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 'var(--s-8)', justifyContent: 'center',
      width: full ? '100%' : undefined, lineHeight: 1, whiteSpace: 'nowrap',
      transition: 'filter 120ms ease, transform 80ms ease',
      ...style,
    }}>
      {icon}{children}
    </button>
  );
}

// ─── Card surface ────────────────────────────────────────────
// Content only — never wrap an input in this (an input needs its own shell
// with no shadow; a card-on-a-field is the classic drift bug).
function Card({ children, style = {}, padded = true, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card-bg)', border: 'var(--card-border)',
      borderRadius: 'var(--r-xl)', boxShadow: 'var(--card-shadow)',
      padding: padded ? 'var(--pad-card)' : 0, color: 'var(--c-ink)',
      ...style,
    }}>{children}</div>
  );
}

// ─── Selectable chip ─────────────────────────────────────────
// `fill` stretches it to an equal share of its row; `sm` is the dense variant.
// Font weight is constant across states so a row never reflows on selection.
function Chip({ children, on, onClick, icon, fill, sm }) {
  return (
    <button onClick={onClick} style={{
      height: sm ? 30 : 38, padding: sm ? '0 var(--s-8)' : '0 var(--s-12)', borderRadius: 'var(--r-pill)',
      background: on ? 'var(--c-accent-soft)' : 'transparent',
      color: on ? 'var(--c-accent)' : 'var(--c-ink)',
      border: `1px solid ${on ? 'var(--c-accent)' : 'var(--c-ink-line-strong)'}`,
      fontFamily: 'inherit', fontSize: sm ? 'var(--t-meta)' : 'var(--t-body-sm)', fontWeight: 600, letterSpacing: 0.02,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--s-4)',
      whiteSpace: 'nowrap',
      ...(fill ? { flex: 1, minWidth: 0 } : { flexShrink: 0, alignSelf: 'flex-start', width: 'fit-content' }),
    }}>{icon}{children}</button>
  );
}

// ─── Tag — non-interactive label ─────────────────────────────
function Tag({ children, tone = 'ink', icon }) {
  const tones = {
    ink:    { bg: 'var(--c-ink-line)', fg: 'var(--c-ink)' },
    canvas: { bg: 'var(--c-canvas)', fg: 'var(--c-ink)' },
    accent: { bg: 'var(--c-accent)', fg: 'var(--c-paper)' },
    good:   { bg: 'var(--c-success-soft)', fg: 'var(--c-success)' },
    warn:   { bg: 'var(--c-warn-soft)', fg: 'var(--c-warn)' },
    danger: { bg: 'var(--c-danger-soft)', fg: 'var(--c-danger)' },
  };
  const p = tones[tone] || tones.ink;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--s-4)',
      padding: 'var(--s-4) var(--s-8)', borderRadius: 'var(--r-pill)',
      background: p.bg, color: p.fg,
      fontSize: 'var(--t-caption)', fontWeight: 600, letterSpacing: 0.02, lineHeight: 1.3,
    }}>{icon}{children}</span>
  );
}

// ─── Image placeholder ───────────────────────────────────────
// Deterministic per `id`, so a screen keeps the same picture between reloads.
function Slot({ label, h = 140, style = {}, id }) {
  const seed = encodeURIComponent(id || label || 'slot');
  return (
    <div style={{
      height: h, borderRadius: 'var(--r-lg)', overflow: 'hidden',
      background: 'var(--c-canvas)', position: 'relative',
      ...style,
    }}>
      <img
        src={`https://picsum.photos/seed/${seed}/800/400`}
        alt={label || ''}
        loading="lazy"
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

// ─── iOS-style toggle ────────────────────────────────────────
// Controlled. stopPropagation so it works inside a tappable row without double-firing.
function Toggle({ on = false, onChange, label }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(); }}
      style={{
        width: 48, height: 28, borderRadius: 'var(--r-pill)', border: 'none', flexShrink: 0,
        background: on ? 'var(--c-accent)' : 'var(--c-ink-line-strong)',
        padding: 2, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background 160ms var(--ease-out)',
      }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--c-paper)', boxShadow: 'var(--card-shadow)' }}/>
    </button>
  );
}

// ─── Status-bar spacer (sits inside a screen, under the device notch) ──
function StatusFiller() {
  return <div style={{ height: 54 }}/>;
}

// ─── Section header ─────────────────────────────────────────
function SectionHead({ title, action, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--s-8)' }}>
      <div>
        <div style={{ fontSize: 'var(--t-caption)', fontWeight: 600, color: 'var(--c-ink-soft)', textTransform: 'uppercase', letterSpacing: 0.12 }}>{title}</div>
        {sub && <div style={{ fontSize: 'var(--t-meta)', color: 'var(--c-ink-soft)', marginTop: 2 }}>{sub}</div>}
      </div>
      {action && <span style={{ fontSize: 'var(--t-meta)', fontWeight: 600, color: 'var(--c-ink-soft)' }}>{action}</span>}
    </div>
  );
}

Object.assign(window, { Btn, Card, Chip, Tag, Slot, Toggle, StatusFiller, SectionHead, Icon: I, ico });
