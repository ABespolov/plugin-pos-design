// iPad Pro 11" (M4) device frame — the POS runs portrait on a counter stand.
// Screen is 834×1194 pt portrait (swap for landscape); `width`/`height` are the
// SCREEN, the body adds its own bezel, so an artboard needs ~60 px more each way.
// No assets, no deps. Exports: TabletDevice, IPadStatusBar.
//
// The status bar overlays the screen (that's how iPadOS works — apps draw
// under it), so a screen that puts content at the very top must clear
// TABLET_STATUS_H itself.

const TABLET_STATUS_H = 24;

// iPad status bar: time hard left, radios hard right — not the iPhone's
// split-around-the-island layout.
function IPadStatusBar({ dark = false, time = '9:41', battery = 82 }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: TABLET_STATUS_H, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', boxSizing: 'border-box', pointerEvents: 'none',
      fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590, fontSize: 13, color: c,
    }}>
      <span style={{ letterSpacing: 0.1 }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <svg width="16" height="11" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/>
          <circle cx="8.5" cy="10.5" r="1.5" fill={c}/>
        </svg>
        <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.9 }}>{battery}%</span>
        <svg width="25" height="12" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/>
          <rect x="2" y="2" width={20 * Math.max(0, Math.min(100, battery)) / 100} height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function TabletDevice({
  children, width = 834, height = 1194, dark = false,
  statusBar = true, homeIndicator = true, time, battery,
  // Glass reflection. Off by default — it looks great in a mock-up and lies to
  // you during a design review, so opt in only for presentation shots.
  glare = false,
}) {
  const BEZEL = 22;   // black glass border around the display
  const RIM = 8;      // aluminium edge visible around the glass
  const landscape = width >= height;

  return (
    <div style={{
      // aluminium body
      padding: RIM, borderRadius: 42, boxSizing: 'content-box',
      background: 'linear-gradient(150deg, #6e6e77 0%, #3a3a41 26%, #26262b 55%, #45454d 100%)',
      boxShadow: '0 40px 90px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18)',
      display: 'inline-block',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        // black glass front
        position: 'relative', padding: BEZEL, borderRadius: 36, background: '#0a0a0c',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}>
        {/* front camera — on the long edge, which is the top in landscape and
            the left in portrait (M4 iPad Pro moved it there) */}
        <div style={{
          position: 'absolute', borderRadius: '50%', width: 7, height: 7,
          background: 'radial-gradient(circle at 35% 35%, #3b3b46, #101014 70%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
          ...(landscape
            ? { top: (BEZEL - 7) / 2, left: '50%', transform: 'translateX(-50%)' }
            : { left: (BEZEL - 7) / 2, top: '50%', transform: 'translateY(-50%)' }),
        }}/>

        <div style={{
          width, height, borderRadius: 18, overflow: 'hidden', position: 'relative',
          background: dark ? '#000' : 'var(--c-page)',
        }}>
          {children}
          {statusBar && <IPadStatusBar dark={dark} time={time} battery={battery}/>}
          {homeIndicator && (
            <div style={{
              position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
              width: landscape ? 315 : 260, height: 5, borderRadius: 100, zIndex: 60,
              background: dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.28)',
              pointerEvents: 'none',
            }}/>
          )}
          {glare && (
            <div aria-hidden style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 70,
              background: 'linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 22%, rgba(255,255,255,0) 46%)',
            }}/>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TabletDevice, IPadStatusBar, TABLET_STATUS_H });
