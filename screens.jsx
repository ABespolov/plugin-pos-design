// Product screens — one function per screen, exported on `window`, placed on the
// canvas in index.html and previewable via _live.html?s=Name.
//
// Two apps, one Firebase backend:
//   POS…      tablet / web — read the live menu, build an order, running total
//   Manager…  phone        — CRUD menu items, toggle sold out
//
// Both placeholders below are scaffolding. Delete each one as its real screen
// lands; nothing here is a design decision.

const { Card, SectionHead, Slab, Rule, Label, Money, Heading, Btn, MenuTile, MenuGroup, OrderLine } = window;

// Fixture data. MenuItem is name · price · category · available and nothing else;
// an Order line is an item plus a quantity, and the total is DERIVED from them —
// prices are numbers here for the same reason they will be doubles in Flutter.
const MENU = [
  { category: 'Coffee', items: [
    { name: 'Espresso',         price: 3.00, available: true },
    { name: 'Flat White',       price: 4.50, available: true },
    { name: 'Cortado',          price: 4.00, available: true },
    { name: 'Cold Brew',        price: 5.00, available: true },
    { name: 'Mocha',            price: 5.50, available: true },
    { name: 'Filter',           price: 3.50, available: true },
  ]},
  { category: 'Tea', items: [
    { name: 'Matcha Latte',     price: 5.00, available: true },
    { name: 'Chai Latte',       price: 4.75, available: true },
    { name: 'Earl Grey',        price: 3.25, available: true },
  ]},
  { category: 'Pastry', items: [
    { name: 'Butter Croissant', price: 3.75, available: true },
    { name: 'Almond Croissant', price: 4.25, available: false },
    { name: 'Cinnamon Bun',     price: 4.50, available: true },
    { name: 'Banana Bread',     price: 4.00, available: true },
  ]},
  { category: 'Cold', items: [
    { name: 'Sparkling Water',  price: 2.50, available: true },
    { name: 'Orange Juice',     price: 4.00, available: true },
  ]},
];

const ITEM = Object.fromEntries(MENU.flatMap(g => g.items.map(i => [i.name, i])));
const money = n => `$${n.toFixed(2)}`;

const START_ORDER = [
  { name: 'Flat White',       qty: 2 },
  { name: 'Cold Brew',        qty: 3 },
  { name: 'Butter Croissant', qty: 1 },
];

// How long the prototype waits before a manager edit lands. Long enough that
// whoever is playing with the board is mid-order when it happens — which is the
// exact moment the design has to survive.
const PROTO_LIVE_AFTER = 8000;

function Scaffold({ app, screen }) {
  return (
    <div className="app-screen" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-24)',
      background: 'var(--c-paper)',
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

// POS — the whole shift happens here. The menu scrolls on paper; the order is the
// one near-black slab, anchored at the bottom where the thumb already is.
//
// No `state` prop — the working prototype. Tapping the menu builds the order,
// the steppers and Clear run, the total recomputes, and after PROTO_LIVE_AFTER a
// manager edit lands and Cold Brew goes sold out with the edge actually firing.
//
// state: 'empty'  nothing rung up yet
//        'live'   the moment the edit lands, frozen — the tile and the order line
//                 both hold the cyan edge, and the line says what it now is
function POSOrder({ state }) {
  const still = state === 'empty' || state === 'live';
  const [lines, setLines] = React.useState(state === 'empty' ? [] : START_ORDER);
  const [soldOutLive, setSoldOutLive] = React.useState(state === 'live' ? 'Cold Brew' : null);

  React.useEffect(() => {
    if (still) return;
    const t = setTimeout(() => setSoldOutLive('Cold Brew'), PROTO_LIVE_AFTER);
    return () => clearTimeout(t);
  }, [still]);

  const add = name => setLines(ls => ls.some(l => l.name === name)
    ? ls.map(l => (l.name === name ? { ...l, qty: l.qty + 1 } : l))
    : [...ls, { name, qty: 1 }]);
  const bump = (name, d) => setLines(ls => ls.flatMap(l =>
    l.name !== name ? [l] : (l.qty + d < 1 ? [] : [{ ...l, qty: l.qty + d }])));
  const drop = name => setLines(ls => ls.filter(l => l.name !== name));

  const total = lines.reduce((sum, l) => sum + ITEM[l.name].price * l.qty, 0);
  // A still frame of "this just changed" cannot spend its two seconds and vanish.
  const edge = still ? 'hold' : true;

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* No title bar: a heading reading "Menu" above a menu names the obvious.
          The category micro-labels start the screen and do that job for free. */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--s-40) var(--s-24) 0' }}>
        {MENU.map(group => (
          <MenuGroup key={group.category} category={group.category}>
            {group.items.map(item => (
              <MenuTile key={item.name} name={item.name} price={money(item.price)}
                available={item.available && item.name !== soldOutLive}
                live={item.name === soldOutLive && edge}
                onClick={() => add(item.name)}/>
            ))}
          </MenuGroup>
        ))}
      </div>

      <Slab padded={false} radius="var(--r-xl) var(--r-xl) 0 0" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--s-16) var(--s-24)',
        }}>
          <Label tone="onslab">Order</Label>
          {lines.length > 0 && <Btn kind="onslab" size="sm" onClick={() => setLines([])}>Clear</Btn>}
        </div>

        {lines.length === 0 ? (
          <div style={{
            padding: 'var(--s-24) var(--s-24) var(--s-32)',
            fontSize: 'var(--t-body)', color: 'var(--c-on-slab-soft)',
          }}>Tap an item to start.</div>
        ) : lines.map(line => (
          <OrderLine key={line.name} name={line.name} qty={line.qty}
            price={money(ITEM[line.name].price * line.qty)}
            blocked={line.name === soldOutLive}
            live={line.name === soldOutLive && edge}
            onDec={() => bump(line.name, -1)}
            onInc={() => bump(line.name, +1)}
            onRemove={() => drop(line.name)}/>
        ))}

        <Rule onSlab/>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: 'var(--s-16) var(--s-24) var(--s-24)',
        }}>
          <Label tone="onslab">Total</Label>
          <Money value={money(total)} size="display"/>
        </div>
      </Slab>
    </div>
  );
}

function ManagerMenu() {
  return <Scaffold app="Manager · phone" screen="Menu list"/>;
}

Object.assign(window, { POSOrder, ManagerMenu });
