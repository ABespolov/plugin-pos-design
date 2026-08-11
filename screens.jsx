// Product screens — one function per screen, exported on `window`, placed on the
// canvas in index.html and previewable via _live.html?s=Name.
//
// Two apps, one Firebase backend:
//   POS…      tablet / web — read the live menu, build an order, running total
//   Manager…  phone        — CRUD menu items, toggle sold out
//
// Both placeholders below are scaffolding. Delete each one as its real screen
// lands; nothing here is a design decision.

const { Card, SectionHead } = window;

function Scaffold({ app, screen }) {
  return (
    <div className="app-screen" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-24)',
      background: 'var(--c-canvas)',
    }}>
      <Card style={{ textAlign: 'center', maxWidth: 420 }}>
        <SectionHead title={app}/>
        <div style={{ fontSize: 'var(--t-h)', fontWeight: 700, letterSpacing: -0.4 }}>{screen}</div>
        <div style={{ fontSize: 'var(--t-body-sm)', color: 'var(--c-ink-soft)', marginTop: 'var(--s-8)', lineHeight: 1.5 }}>
          Not designed yet.
        </div>
      </Card>
    </div>
  );
}

function POSOrder() {
  return <Scaffold app="POS · tablet" screen={'Menu & order'}/>;
}

function ManagerMenu() {
  return <Scaffold app="Manager · phone" screen="Menu list"/>;
}

Object.assign(window, { POSOrder, ManagerMenu });
