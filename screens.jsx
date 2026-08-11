// Product screens — one function per screen, exported on `window`, placed on the
// canvas in index.html and previewable via _live.html?s=Name.
//
// Two apps, one Firebase backend:
//   POS…      tablet / web — read the live menu, build an order, running total
//   Manager…  phone        — CRUD menu items, toggle sold out
//
// The first artboard of each screen is the working prototype; the rest are
// stills of states it passes through too fast to review.

const { Slab, Rule, Label, Money, Tag, Btn, Chip, MenuTile, MenuGrid, OrderLine, ItemRow, ItemGroup, ORDER_ROW_H, Icon: I } = window;

// Fixture data. MenuItem is name · price · category · available and nothing else;
// an Order line is an item plus a quantity, and the total is DERIVED from them —
// prices are numbers here for the same reason they will be doubles in Flutter.
// Sized like a real café, not like a demo. A category holding six items makes
// any layout look right; the question worth answering is what fifteen do.
const MENU = [
  { category: 'Coffee', items: [
    { name: 'Espresso',         price: 3.00, available: true },
    { name: 'Doppio',           price: 3.50, available: true },
    { name: 'Macchiato',        price: 3.75, available: true },
    { name: 'Cortado',          price: 4.00, available: true },
    { name: 'Flat White',       price: 4.50, available: true },
    { name: 'Cappuccino',       price: 4.50, available: true },
    { name: 'Latte',            price: 4.75, available: true },
    { name: 'Mocha',            price: 5.50, available: true },
    { name: 'Americano',        price: 3.50, available: true },
    { name: 'Filter',           price: 3.50, available: true },
    { name: 'Batch Brew',       price: 3.25, available: true },
    { name: 'Cold Brew',        price: 5.00, available: true },
    { name: 'Iced Latte',       price: 5.00, available: true },
    { name: 'Affogato',         price: 5.75, available: true },
    { name: 'Piccolo',          price: 3.75, available: true },
  ]},
  { category: 'Tea', items: [
    { name: 'Matcha Latte',     price: 5.00, available: true },
    { name: 'Chai Latte',       price: 4.75, available: true },
    { name: 'Earl Grey',        price: 3.25, available: true },
    { name: 'English Breakfast', price: 3.25, available: true },
    { name: 'Green Sencha',     price: 3.50, available: true },
    { name: 'Peppermint',       price: 3.00, available: true },
    { name: 'Rooibos',          price: 3.25, available: false },
    { name: 'Jasmine',          price: 3.50, available: true },
    { name: 'Iced Tea',         price: 4.00, available: true },
  ]},
  { category: 'Pastry', items: [
    { name: 'Butter Croissant', price: 3.75, available: true },
    { name: 'Almond Croissant', price: 4.25, available: false },
    { name: 'Pain au Chocolat', price: 4.00, available: true },
    { name: 'Cinnamon Bun',     price: 4.50, available: true },
    { name: 'Banana Bread',     price: 4.00, available: true },
    { name: 'Blueberry Muffin', price: 3.75, available: true },
    { name: 'Scone',            price: 3.50, available: true },
    { name: 'Brownie',          price: 4.00, available: true },
    { name: 'Cookie',           price: 2.75, available: true },
  ]},
  { category: 'Cold', items: [
    { name: 'Sparkling Water',  price: 2.50, available: true },
    { name: 'Still Water',      price: 2.00, available: true },
    { name: 'Orange Juice',     price: 4.00, available: true },
    { name: 'Apple Juice',      price: 3.75, available: true },
    { name: 'Lemonade',         price: 4.25, available: true },
    { name: 'Kombucha',         price: 4.75, available: true },
  ]},
];

const ITEM = Object.fromEntries(MENU.flatMap(g => g.items.map(i => [i.name, i])));
const money = n => `$${n.toFixed(2)}`;

const START_ORDER = [
  { name: 'Flat White',       qty: 2 },
  { name: 'Cold Brew',        qty: 3 },
  { name: 'Butter Croissant', qty: 1 },
];

// A ticket long enough that lines are hidden — the only state in which the
// expand affordance exists at all.
const LONG_ORDER = [
  { name: 'Mocha',            qty: 1 },
  { name: 'Matcha Latte',     qty: 2 },
  { name: 'Orange Juice',     qty: 1 },
  { name: 'Flat White',       qty: 2 },
  { name: 'Cold Brew',        qty: 3 },
  { name: 'Butter Croissant', qty: 1 },
  { name: 'Earl Grey',        qty: 1 },
];

// How long the prototype waits before a manager edit lands. Long enough that
// whoever is playing with the board is mid-order when it happens — which is the
// exact moment the design has to survive.
const PROTO_LIVE_AFTER = 8000;

// The order slab is a FIXED region, and the lines scroll inside it. If the slab
// grew with the order the menu would re-flow on every tap — the cashier is
// hitting targets at arm's length and the targets would move between taps. It
// stays this height even when the order is empty, because one layout the whole
// shift beats a layout that is briefly smaller.
//
// Its height is DERIVED, never picked. The list has to be a whole number of
// rows: at 3.2 rows the scroll can only ever rest with a row sliced in half.
// Header and total are pinned for the same reason — if either could grow, the
// list would stop being a multiple of the row.
const SLAB_HEAD_H = 68;    // holds whether or not Clear is showing
const SLAB_ROWS = 3;       // whole order lines visible at rest
const SLAB_ROWS_MAX = 14;  // ceiling when expanded: the most whole rows that
                           // still leave the category chips uncovered, so the
                           // menu is not simply gone while the ticket is read
const SLAB_TOTAL_H = 108;
const slabHeight = rows => SLAB_HEAD_H + ORDER_ROW_H * rows + 1 + SLAB_TOTAL_H;
const SLAB_H = slabHeight(SLAB_ROWS);

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
//        'open'   a ticket long enough to hide lines, with the sheet expanded
function POSOrder({ state }) {
  const still = state === 'empty' || state === 'live' || state === 'open';
  const [lines, setLines] = React.useState(
    state === 'empty' ? [] : state === 'open' ? LONG_ORDER : START_ORDER);
  const [soldOutLive, setSoldOutLive] = React.useState(state === 'live' ? 'Cold Brew' : null);
  // The last item touched from the menu. `n` counts taps so that hitting the
  // same item twice is two events; `bumped` says the line already existed, so
  // it needs emphasis rather than the arrival animation it will never play.
  const [touch, setTouch] = React.useState({ name: null, n: 0, bumped: false });
  const [cat, setCat] = React.useState(MENU[0].category);
  const [expanded, setExpanded] = React.useState(state === 'open');
  // Captured when it opens, not derived live: sizing the sheet to the ticket
  // avoids a screen of empty black, but re-sizing it while open would move the
  // total every time a line was removed — under the finger doing the removing.
  const [openRows, setOpenRows] = React.useState(
    Math.min(state === 'open' ? LONG_ORDER.length : SLAB_ROWS, SLAB_ROWS_MAX));
  const toggleOpen = () => {
    if (!expanded) setOpenRows(Math.min(lines.length, SLAB_ROWS_MAX));
    setExpanded(v => !v);
  };

  React.useEffect(() => {
    if (still) return;
    const t = setTimeout(() => setSoldOutLive('Cold Brew'), PROTO_LIVE_AFTER);
    return () => clearTimeout(t);
  }, [still]);

  // One rule: a tap on the menu makes that item the most recent, whether it was
  // in the ticket or not. The collapsed ticket then always shows the last three
  // things rung up, and there is never anything to scroll to. The steppers do
  // NOT re-order — a line must not move out from under the finger using it.
  const add = name => {
    const had = lines.some(l => l.name === name);
    setLines(ls => {
      const cur = ls.find(l => l.name === name);
      return [{ name, qty: cur ? cur.qty + 1 : 1 }, ...ls.filter(l => l.name !== name)];
    });
    setTouch(t => ({ name, n: t.n + 1, bumped: had }));
  };
  const bump = (name, d) => setLines(ls => ls.flatMap(l =>
    l.name !== name ? [l] : (l.qty + d < 1 ? [] : [{ ...l, qty: l.qty + d }])));
  const drop = name => setLines(ls => ls.filter(l => l.name !== name));

  const shown = (MENU.find(g => g.category === cat) || MENU[0]).items;
  // Expanding is only offered when a line is actually hidden, and it un-expands
  // by itself when the ticket shrinks back to what already fits.
  const canOpen = lines.length > SLAB_ROWS;
  const open = expanded && canOpen;

  // Collapsed shows the newest few and nothing scrolls; the rest are behind the
  // chevron. Scrolling exists only in the expanded sheet, and only past its cap.
  const ticket = open ? lines : lines.slice(0, SLAB_ROWS);

  const total = lines.reduce((sum, l) => sum + ITEM[l.name].price * l.qty, 0);
  // A still frame of "this just changed" cannot spend its two seconds and vanish.
  const edge = still ? 'hold' : true;

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* No title bar: a heading reading "Menu" above a menu names the obvious.
          The selected chip names the category, so nothing else has to. */}
      <div style={{
        display: 'flex', gap: 'var(--s-8)', overflowX: 'auto', flexShrink: 0,
        padding: 'var(--s-40) var(--pad-tablet) var(--s-16)',
      }}>
        {MENU.map(g => (
          <Chip key={g.category} size="lg" on={g.category === cat} onClick={() => setCat(g.category)}>
            {g.category}
          </Chip>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 var(--pad-tablet)' }}>
        <MenuGrid>
          {shown.map(item => (
            <MenuTile key={item.name} name={item.name} price={money(item.price)}
              available={item.available && item.name !== soldOutLive}
              live={item.name === soldOutLive && edge}
              onClick={() => add(item.name)}/>
          ))}
        </MenuGrid>
      </div>

      <Slab padded={false} radius="var(--r-xl) var(--r-xl) 0 0" style={{
        overflow: 'hidden', height: open ? slabHeight(openRows) : SLAB_H, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        // the one shadow the system allows, and only when this is a sheet over
        // the menu rather than a panel beneath it
        boxShadow: open ? 'var(--shadow-sheet)' : 'none',
        transition: 'height var(--dur-sheet) var(--ease-out)',
      }}>
        {/* The whole bar opens the ticket, not just the chevron — a control the
            cashier hits at arm's length should be the width of the thing it
            belongs to. Clear keeps its own target because it destroys work. */}
        <div style={{
          display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
          height: SLAB_HEAD_H, flexShrink: 0,
        }}>
          {/* The chevron appears exactly when there is a line you cannot see —
              the affordance is its own information scent. */}
          {canOpen ? (
            <button type="button" onClick={toggleOpen} aria-expanded={open}
              data-onslab-icon style={{
                flex: 1, minWidth: 0,
                display: 'inline-flex', alignItems: 'center', gap: 'var(--s-12)',
                padding: '0 var(--pad-tablet)', textAlign: 'left',
                background: 'transparent', border: 'none',
                color: 'var(--c-on-slab)', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background var(--dur-ui) var(--ease-out)',
              }}>
              <Label tone="onslab">Order</Label>
              <span style={{ fontSize: 'var(--t-body-sm)', fontWeight: 600, color: 'var(--c-on-slab-soft)' }}>
                {lines.length}
              </span>
              {open ? I.chevronDown : I.chevronUp}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 var(--pad-tablet)' }}>
              <Label tone="onslab">Order</Label>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 'var(--pad-tablet)' }}>
            {lines.length > 0 && <Btn kind="onslab" size="sm" onClick={() => setLines([])}>Clear</Btn>}
          </div>
        </div>

        {/* the order grows in here and nowhere else */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: open ? 'auto' : 'hidden',
          // an empty ticket is still a ticket: the region keeps its height, so
          // the one line in it sits in the middle rather than stranded on top
          ...(lines.length === 0 ? { display: 'flex', alignItems: 'center' } : null),
        }}>
          {lines.length === 0 ? (
            <div style={{
              padding: '0 var(--pad-tablet)',
              fontSize: 'var(--t-body)', color: 'var(--c-on-slab-soft)',
            }}>Tap an item to start.</div>
          ) : ticket.map(line => (
            <OrderLine key={line.name} name={line.name} qty={line.qty}
              price={money(ITEM[line.name].price * line.qty)}
              blocked={line.name === soldOutLive}
              live={line.name === soldOutLive && edge}
              emphasis={touch.bumped && touch.name === line.name ? touch.n : 0}
              onDec={() => bump(line.name, -1)}
              onInc={() => bump(line.name, +1)}
              onRemove={() => drop(line.name)}/>
          ))}
        </div>

        <Rule onSlab/>
        <div style={{
          // `baseline` keeps TOTAL sitting on the numeral's baseline, but it also
          // parks the whole group at the TOP of the block — the number ends up
          // jammed against the rule with all the slack below it. The padding is
          // what centres it: 20 + the 68 the numeral occupies + 20 = SLAB_TOTAL_H.
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: 'var(--s-20) var(--pad-tablet)', height: SLAB_TOTAL_H, flexShrink: 0,
        }}>
          <Label tone="onslab">Total</Label>
          <Money value={money(total)} size="display"/>
        </div>
      </Slab>
    </div>
  );
}

// Manager — the menu's state, and one tap to change availability. No slab
// surface: there is no money on this screen, so the black is spent on the one
// action instead. No cyan either — this screen is where changes come FROM, and
// the live edge means "arrived from somewhere else".
//
// state: 'empty'  no items yet
function ManagerMenu({ state }) {
  const empty = state === 'empty';
  const [soldOut, setSoldOut] = React.useState(
    () => new Set(MENU.flatMap(g => g.items).filter(i => !i.available).map(i => i.name)));

  const toggle = name => setSoldOut(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  const count = MENU.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Status, not a title: "Menu" above a menu says nothing, while the counts
          answer the question the manager opened the app with. The second line
          is the one thing they cannot see for themselves — there is no Save
          here, and no undo. */}
      <div style={{ padding: '60px var(--pad-phone) var(--s-16)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-8)' }}>
          <span style={{ fontSize: 'var(--t-body)', fontWeight: 600 }}>
            {empty ? 'No items yet' : `${count} items`}
          </span>
          {!empty && soldOut.size > 0 && <Tag tone="blocked">{soldOut.size} sold out</Tag>}
        </div>
        {/* Only where it applies. With nothing in the menu there is nothing to
            change, and the empty state below already makes the same promise. */}
        {!empty && (
          <div style={{ fontSize: 'var(--t-body-sm)', color: 'var(--c-ink-soft)', marginTop: 'var(--s-4)' }}>
            Changes show on the POS immediately.
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 var(--pad-phone)' }}>
        {empty ? (
          <div style={{
            fontSize: 'var(--t-body)', color: 'var(--c-ink-soft)',
            lineHeight: 1.5, paddingTop: 'var(--s-32)',
          }}>Add your first item and it appears on the counter straight away.</div>
        ) : MENU.map(group => (
          <ItemGroup key={group.category} category={group.category}>
            {group.items.map(item => (
              <ItemRow key={item.name} name={item.name} price={money(item.price)}
                available={!soldOut.has(item.name)}
                onToggle={() => toggle(item.name)}/>
            ))}
          </ItemGroup>
        ))}
      </div>

      <div style={{ padding: 'var(--s-16) var(--pad-phone) var(--s-40)', flexShrink: 0 }}>
        <Btn kind="slab" full icon={I.plus}>New item</Btn>
      </div>
    </div>
  );
}

Object.assign(window, { POSOrder, ManagerMenu });
