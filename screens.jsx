// Product screens — one function per screen, exported on `window`, placed on the
// canvas in index.html and previewable via _live.html?s=Name.
//
// Two apps, one Firebase backend:
//   POS…      tablet / web — read the live menu, build an order, running total
//   Manager…  phone        — CRUD menu items, toggle sold out
//
// The first artboard of each screen is the working prototype; the rest are
// stills of states it passes through too fast to review.

const {
  Slab, Rule, Label, Money, Tag, Heading, Btn, Chip, LiveDot,
  MenuTile, MenuGrid, TileSkeleton, OrderLine, ItemRow, ItemGroup, Field,
  Sheet, SheetHead, ORDER_ROW_H, Icon: I,
} = window;

// Fixture data. A MenuItem is name · price · category · available and nothing
// else — a flat list, because that is what a Firestore collection is. Prices are
// numbers for the same reason they will be doubles in Flutter. Sized like a real
// café, not like a demo: a category holding six items makes any layout look
// right; the question worth answering is what fifteen do.
const MENU = [
  { name: 'Espresso',          price: 3.00, category: 'Coffee', available: true },
  { name: 'Doppio',            price: 3.50, category: 'Coffee', available: true },
  { name: 'Macchiato',         price: 3.75, category: 'Coffee', available: true },
  { name: 'Cortado',           price: 4.00, category: 'Coffee', available: true },
  { name: 'Flat White',        price: 4.50, category: 'Coffee', available: true },
  { name: 'Cappuccino',        price: 4.50, category: 'Coffee', available: true },
  { name: 'Latte',             price: 4.75, category: 'Coffee', available: true },
  { name: 'Mocha',             price: 5.50, category: 'Coffee', available: true },
  { name: 'Americano',         price: 3.50, category: 'Coffee', available: true },
  { name: 'Filter',            price: 3.50, category: 'Coffee', available: true },
  { name: 'Batch Brew',        price: 3.25, category: 'Coffee', available: true },
  { name: 'Cold Brew',         price: 5.00, category: 'Coffee', available: true },
  { name: 'Iced Latte',        price: 5.00, category: 'Coffee', available: true },
  { name: 'Affogato',          price: 5.75, category: 'Coffee', available: true },
  { name: 'Piccolo',           price: 3.75, category: 'Coffee', available: true },
  { name: 'Matcha Latte',      price: 5.00, category: 'Tea', available: true },
  { name: 'Chai Latte',        price: 4.75, category: 'Tea', available: true },
  { name: 'Earl Grey',         price: 3.25, category: 'Tea', available: true },
  { name: 'English Breakfast', price: 3.25, category: 'Tea', available: true },
  { name: 'Green Sencha',      price: 3.50, category: 'Tea', available: true },
  { name: 'Peppermint',        price: 3.00, category: 'Tea', available: true },
  { name: 'Rooibos',           price: 3.25, category: 'Tea', available: false },
  { name: 'Jasmine',           price: 3.50, category: 'Tea', available: true },
  { name: 'Iced Tea',          price: 4.00, category: 'Tea', available: true },
  { name: 'Butter Croissant',  price: 3.75, category: 'Pastry', available: true },
  { name: 'Almond Croissant',  price: 4.25, category: 'Pastry', available: false },
  { name: 'Pain au Chocolat',  price: 4.00, category: 'Pastry', available: true },
  { name: 'Cinnamon Bun',      price: 4.50, category: 'Pastry', available: true },
  { name: 'Banana Bread',      price: 4.00, category: 'Pastry', available: true },
  { name: 'Blueberry Muffin',  price: 3.75, category: 'Pastry', available: true },
  { name: 'Scone',             price: 3.50, category: 'Pastry', available: true },
  { name: 'Brownie',           price: 4.00, category: 'Pastry', available: true },
  { name: 'Cookie',            price: 2.75, category: 'Pastry', available: true },
  { name: 'Sparkling Water',   price: 2.50, category: 'Cold', available: true },
  { name: 'Still Water',       price: 2.00, category: 'Cold', available: true },
  { name: 'Orange Juice',      price: 4.00, category: 'Cold', available: true },
  { name: 'Apple Juice',       price: 3.75, category: 'Cold', available: true },
  { name: 'Lemonade',          price: 4.25, category: 'Cold', available: true },
  { name: 'Kombucha',          price: 4.75, category: 'Cold', available: true },
];

// The categories a café is divided into: a fixed list in shared code, the way
// the brief's model implies — `category` is a string on the item and nothing
// more. Not a collection, not a screen, not something the manager creates in
// passing while adding an item. Its order is the order of the tabs on the POS,
// and it is deliberate: coffee first, because that is what the queue is here for.
const CATEGORIES = ['Coffee', 'Tea', 'Pastry', 'Cold'];

const money = n => `$${n.toFixed(2)}`;
// What the POS shows as tabs and what the Manager groups by — the fixed order,
// minus the categories holding nothing yet. An empty tab wastes a cashier's tap.
const catsOf = items => CATEGORIES.filter(c => items.some(i => i.category === c));
const priceOf = name => (MENU.find(i => i.name === name) || {}).price;
const catOf = name => (MENU.find(i => i.name === name) || {}).category;

// An order line carries the unit price it is currently being sold at, so the
// ticket survives its item being deleted from the menu mid-order — and so a
// price edit is an event that happens TO the line rather than a lookup that
// silently returns something else.
const line = (name, qty) => ({ name, qty, unit: priceOf(name) });

const START_ORDER = ['Flat White', 'Cold Brew', 'Butter Croissant']
  .map((n, i) => line(n, [2, 3, 1][i]));

// A ticket long enough that lines are hidden — the only state in which the
// expand affordance exists at all.
const LONG_ORDER = [
  line('Mocha', 1), line('Matcha Latte', 2), line('Orange Juice', 1),
  line('Flat White', 2), line('Cold Brew', 3), line('Butter Croissant', 1),
  line('Earl Grey', 1),
];

// ─── Menu changes arriving from the Manager ──────────────────
// Every edit the Manager app can make, as the POS receives it. All five are one
// mechanism — a new snapshot of the collection — so they are one function here
// too; what differs is only what the cashier has to be told about each.
const applyChange = (items, ev) => {
  switch (ev.kind) {
    case 'sold':  return items.map(i => i.name === ev.name ? { ...i, available: false } : i);
    case 'back':  return items.map(i => i.name === ev.name ? { ...i, available: true } : i);
    case 'price': return items.map(i => i.name === ev.name ? { ...i, price: ev.price } : i);
    case 'gone':  return items.filter(i => i.name !== ev.name);
    case 'new':   return [...items, ev.item];
    default:      return items;
  }
};

const changeOf = (ev, n) => {
  const name = ev.item ? ev.item.name : ev.name;
  return { id: `${ev.kind}-${name}-${n}`, kind: ev.kind, name,
           category: ev.item ? ev.item.category : catOf(ev.name) };
};

// The prototype's manager, on a timer. Nobody believes a real-time claim they
// read; they believe the one that happens under their thumb while they are
// mid-order. So all five kinds of change land, spaced far enough apart to be
// read one at a time.
const PROTO_TIMELINE = [
  { at:  8000, kind: 'sold',  name: 'Cold Brew' },
  { at: 14000, kind: 'price', name: 'Flat White', price: 5.25 },
  { at: 20000, kind: 'sold',  name: 'Peppermint' },
  { at: 26000, kind: 'gone',  name: 'Butter Croissant' },
  { at: 32000, kind: 'new',
    item: { name: 'Oat Cortado', price: 4.25, category: 'Coffee', available: true } },
];

// What each still has already received by the time it is drawn.
const STILL_TIMELINE = {
  live:      [{ kind: 'sold',  name: 'Cold Brew' }],
  price:     [{ kind: 'price', name: 'Flat White', price: 5.25 }],
  gone:      [{ kind: 'gone',  name: 'Butter Croissant' }],
  elsewhere: [{ kind: 'sold',  name: 'Peppermint' }],
};

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
// the steppers and Clear run, the total recomputes, and PROTO_TIMELINE plays the
// manager's whole repertoire into it while you use it.
//
// state: 'loading'    before the first snapshot lands
//        'blank'      the collection is empty
//        'empty'      nothing rung up yet
//        'live'       an item in the ticket went sold out, frozen
//        'price'      an item in the ticket was re-priced, frozen
//        'gone'       an item in the ticket left the menu, frozen
//        'elsewhere'  the change landed in a category nobody is looking at
//        'open'       a ticket long enough to hide lines, with the sheet expanded
function POSOrder({ state }) {
  const still = state !== undefined;
  const seed = STILL_TIMELINE[state] || [];
  const blank = state === 'blank' || state === 'loading';

  const [items, setItems] = React.useState(() => blank ? [] : seed.reduce(applyChange, MENU));
  const [changes, setChanges] = React.useState(() => seed.map(changeOf));
  const [seen, setSeen] = React.useState(() => new Set());
  const [loading, setLoading] = React.useState(!still || state === 'loading');
  // A still that has already received a price change has to have received it on
  // the ticket too — the whole point of that frame is that the money moved.
  const [lines, setLines] = React.useState(() => seed.reduce((ls, ev) =>
    ev.kind === 'price' ? ls.map(l => l.name === ev.name ? { ...l, unit: ev.price } : l) : ls,
    state === 'empty' || blank ? [] : state === 'open' ? LONG_ORDER : START_ORDER));
  // The last item touched from the menu. `n` counts taps so that hitting the
  // same item twice is two events; `bumped` says the line already existed, so
  // it needs emphasis rather than the arrival animation it will never play.
  const [touch, setTouch] = React.useState({ name: null, n: 0, bumped: false });
  const [cat, setCat] = React.useState('Coffee');
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

  // The prototype opens on skeletons, the way the real thing opens: the frame is
  // instant, the collection is not.
  React.useEffect(() => {
    if (still) return;
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [still]);

  React.useEffect(() => {
    if (still) return;
    const timers = PROTO_TIMELINE.map((ev, n) => setTimeout(() => {
      setItems(prev => applyChange(prev, ev));
      setChanges(prev => [...prev, changeOf(ev, n)]);
      if (ev.kind === 'price') {
        setLines(prev => prev.map(l => l.name === ev.name ? { ...l, unit: ev.price } : l));
      }
    }, ev.at));
    return () => timers.forEach(clearTimeout);
  }, [still]);

  // A change the cashier has actually looked at stops being news. Anything in
  // the open category counts as looked at the moment it is drawn, so the chip
  // dots below only ever mark the categories nobody is watching.
  React.useEffect(() => {
    setSeen(prev => {
      let grew = false;
      const next = new Set(prev);
      changes.forEach(c => { if (c.category === cat && !next.has(c.id)) { next.add(c.id); grew = true; } });
      return grew ? next : prev;
    });
  }, [cat, changes]);

  // One rule: a tap on the menu makes that item the most recent, whether it was
  // in the ticket or not. The collapsed ticket then always shows the last three
  // things rung up, and there is never anything to scroll to. The steppers do
  // NOT re-order — a line must not move out from under the finger using it.
  const add = item => {
    const had = lines.some(l => l.name === item.name);
    setLines(ls => {
      const cur = ls.find(l => l.name === item.name);
      return [{ name: item.name, unit: item.price, qty: cur ? cur.qty + 1 : 1 },
              ...ls.filter(l => l.name !== item.name)];
    });
    setTouch(t => ({ name: item.name, n: t.n + 1, bumped: had }));
  };
  const bump = (name, d) => setLines(ls => ls.flatMap(l =>
    l.name !== name ? [l] : (l.qty + d < 1 ? [] : [{ ...l, qty: l.qty + d }])));
  const drop = name => setLines(ls => ls.filter(l => l.name !== name));

  const categories = catsOf(items);
  const shown = items.filter(i => i.category === cat);
  const changeFor = name => changes.filter(c => c.name === name).pop();
  const unseenIn = c => changes.some(ch => ch.category === c && !seen.has(ch.id));
  // A still frame of "this just changed" cannot spend its two seconds and vanish.
  const edge = still ? 'hold' : true;
  const edgeFor = name => (changeFor(name) ? edge : false);

  // What a line has to say about itself. One slot, four possible messages, and
  // the tone carries which: red means you can no longer sell it, cyan means the
  // number beside it is not the number that was there a minute ago.
  const stateOf = ({ name }) => {
    const item = items.find(i => i.name === name);
    if (!item) return { note: { tone: 'blocked', text: 'Off the menu' }, stopped: true };
    if (!item.available) return { note: { tone: 'blocked', text: 'Sold out' }, stopped: true };
    if ((changeFor(name) || {}).kind === 'price') return { note: { tone: 'live', text: 'New price' } };
    return {};
  };

  // Expanding is only offered when a line is actually hidden, and it un-expands
  // by itself when the ticket shrinks back to what already fits.
  const canOpen = lines.length > SLAB_ROWS;
  const open = expanded && canOpen;

  // Collapsed shows the newest few and nothing scrolls; the rest are behind the
  // chevron. Scrolling exists only in the expanded sheet, and only past its cap.
  const ticket = open ? lines : lines.slice(0, SLAB_ROWS);
  // A change that landed on a line you cannot see is the one case the edge
  // cannot cover, so the affordance that reveals it carries the news instead.
  const hiddenNews = !open && lines.slice(SLAB_ROWS).some(l => stateOf(l).note);

  // Every line on the ticket counts, including the ones that can no longer be
  // sold. The total has to equal the lines above it — a number that quietly
  // drops itself is a number the cashier cannot check by looking. Taking the
  // money off is the cashier's move (Remove), never the system's.
  const total = lines.reduce((sum, l) => sum + l.unit * l.qty, 0);

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* No title bar: a heading reading "Menu" above a menu names the obvious.
          The selected chip names the category, so nothing else has to. The row
          holds its height with no chips in it — on this screen nothing moves. */}
      <div style={{ flexShrink: 0, padding: 'var(--s-40) var(--pad-tablet) var(--s-16)' }}>
        <div style={{ display: 'flex', gap: 'var(--s-8)', overflowX: 'auto', height: 'var(--h-md)' }}>
          {categories.map(c => (
            <Chip key={c} size="lg" on={c === cat} dot={unseenIn(c)} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto', padding: '0 var(--pad-tablet)',
        // An empty menu region is still the menu region, the same way an empty
        // ticket is still a ticket: the message sits in the middle of the space
        // it owns rather than clinging to the top-left corner of it.
        ...(!loading && items.length === 0
          ? { display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }
          : null),
      }}>
        {loading ? (
          <MenuGrid>{Array.from({ length: 9 }, (_, i) => <TileSkeleton key={i}/>)}</MenuGrid>
        ) : items.length === 0 ? (
          <div>
            <div style={{ fontSize: 'var(--t-body-lg)', fontWeight: 600 }}>Nothing on the menu yet.</div>
            <div style={{ fontSize: 'var(--t-body)', color: 'var(--c-ink-soft)', marginTop: 'var(--s-4)' }}>
              Items added in the manager app appear here.
            </div>
          </div>
        ) : (
          <MenuGrid>
            {shown.map(item => (
              <MenuTile key={item.name} name={item.name} price={money(item.price)}
                available={item.available}
                live={edgeFor(item.name)}
                onClick={() => add(item)}/>
            ))}
          </MenuGrid>
        )}
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
              {hiddenNews && <LiveDot/>}
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
          ) : ticket.map(l => (
            <OrderLine key={l.name} name={l.name} qty={l.qty} price={money(l.unit * l.qty)}
              {...stateOf(l)}
              live={edgeFor(l.name)}
              emphasis={touch.bumped && touch.name === l.name ? touch.n : 0}
              onDec={() => bump(l.name, -1)}
              onInc={() => bump(l.name, +1)}
              onRemove={() => drop(l.name)}/>
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

// Manager — the menu's state, one tap to change availability, and the way into
// every item. No slab surface: there is no money on this screen, so the black is
// spent on the one action instead. No cyan either — this screen is where changes
// come FROM, and the live edge means "arrived from somewhere else".
//
// It owns the menu, so the sheet it opens really creates, edits and deletes: the
// list underneath is the list you changed.
//
// state: 'empty'   no items yet
//        'new'     the item sheet, blank
//        'edit'    the item sheet on an existing item
//        'errors'  the sheet saved at with nothing filled in
//        'delete'  the sheet's confirmation step
const PREFILL = 'Almond Croissant';
const SHEET_STATES = { new: {}, edit: { name: PREFILL }, errors: {}, delete: { name: PREFILL } };

function ManagerMenu({ state }) {
  const [items, setItems] = React.useState(() => state === 'empty' ? [] : MENU);
  // null · { item } to edit one · {} to create one
  const [editing, setEditing] = React.useState(() => {
    const seed = SHEET_STATES[state];
    return seed ? { item: seed.name ? MENU.find(i => i.name === seed.name) : undefined } : null;
  });

  const toggle = name => setItems(prev => prev.map(i =>
    i.name === name ? { ...i, available: !i.available } : i));
  const save = (draft, original) => {
    setItems(prev => original
      ? prev.map(i => i.name === original.name ? draft : i)
      : [...prev, draft]);
    setEditing(null);
  };
  const remove = original => {
    setItems(prev => prev.filter(i => i.name !== original.name));
    setEditing(null);
  };

  const empty = items.length === 0;
  const soldOut = items.filter(i => !i.available).length;

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Status, not a title: "Menu" above a menu says nothing, while the counts
          answer the question the manager opened the app with. The second line
          is the one thing they cannot see for themselves — there is no Save
          here, and no undo. */}
      <div style={{ padding: '60px var(--pad-phone) var(--s-16)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-8)' }}>
          <span style={{ fontSize: 'var(--t-body)', fontWeight: 600 }}>
            {empty ? 'No items yet' : `${items.length} items`}
          </span>
          {!empty && soldOut > 0 && <Tag tone="blocked">{soldOut} sold out</Tag>}
        </div>
        {/* Only where it applies. With nothing in the menu there is nothing to
            change, and the empty state below already makes the same promise. */}
        {!empty && (
          <div style={{ fontSize: 'var(--t-body-sm)', color: 'var(--c-ink-soft)', marginTop: 'var(--s-4)' }}>
            Changes show on the POS immediately.
          </div>
        )}
      </div>

      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto', padding: '0 var(--pad-phone)',
        // the same rule as the POS menu: an empty region keeps its shape and
        // puts its one line in the middle of it
        ...(empty
          ? { display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }
          : null),
      }}>
        {empty ? (
          <div style={{
            fontSize: 'var(--t-body)', color: 'var(--c-ink-soft)', lineHeight: 1.5,
            paddingBottom: 'var(--s-48)',
          }}>Add your first item and it appears on the counter straight away.</div>
        ) : catsOf(items).map(category => (
          <ItemGroup key={category} category={category}>
            {items.filter(i => i.category === category).map(item => (
              <ItemRow key={item.name} name={item.name} price={money(item.price)}
                available={item.available}
                onOpen={() => setEditing({ item })}
                onToggle={() => toggle(item.name)}/>
            ))}
          </ItemGroup>
        ))}
      </div>

      <div style={{ padding: 'var(--s-16) var(--pad-phone) var(--s-40)', flexShrink: 0 }}>
        <Btn kind="slab" full icon={I.plus} onClick={() => setEditing({})}>New item</Btn>
      </div>

      {editing && (
        <ManagerItemSheet key={editing.item ? editing.item.name : 'new'}
          item={editing.item} items={items} confirming={state === 'delete'}
          tried={state === 'errors'}
          onCancel={() => setEditing(null)}
          onSave={draft => save(draft, editing.item)}
          onDelete={() => remove(editing.item)}/>
      )}
    </div>
  );
}

// Manager — one item's three fields, in a sheet over the list it came from.
//
// A sheet rather than a pushed screen, because this form is three fields and a
// button: a whole screen for it hides the menu the manager is working through
// and makes editing feel like a place you travel to rather than a thing you do
// in passing. The list stays visible above it, which is also what makes it
// obvious that Cancel costs nothing.
//
// Cancel and the commit sit in the SHEET'S HEADER, not under the form. On a
// phone the bottom third of this sheet belongs to the keyboard — a commit button
// parked there is a commit button nobody can reach.
//
// Category is a row of chips and nothing else. The list is fixed in shared code,
// so there is no value to invent here and no field to invent it in: picking one
// of four is a tap, cannot be misspelled, and keeps this app free of anything
// that could be called managing categories.
//
// Availability is deliberately NOT here. It is one switch on the row behind this
// sheet, and duplicating it inside would put the same fact in two places on one
// screen. New items arrive available.
//
// Save is never disabled. A greyed-out button that will not say what is wrong
// with the form is a dead end; tapping it and being told is not. So the errors
// appear on the first attempt to save, and clear as each field is fixed.
const parsePrice = s => {
  const n = Number(String(s).trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

function ManagerItemSheet({ item, items = MENU, confirming: startConfirming, tried: startTried,
                            onCancel, onSave, onDelete }) {
  const isNew = !item;
  const [name, setName] = React.useState(item ? item.name : '');
  const [price, setPrice] = React.useState(item ? item.price.toFixed(2) : '');
  const [cat, setCat] = React.useState(item ? item.category : CATEGORIES[0]);
  const [confirming, setConfirming] = React.useState(!!startConfirming);
  const [tried, setTried] = React.useState(!!startTried);
  const nameRef = React.useRef(null);
  const priceRef = React.useRef(null);

  const taken = items.some(i => same(i.name, name) && (!item || i.name !== item.name));
  const errors = {
    name: !name.trim() ? 'Give the item a name.'
      : taken ? 'There is already an item with this name.' : null,
    price: !parsePrice(price) ? 'Enter a price, like 4.50.' : null,
  };
  const bad = tried ? errors : {};

  // Category needs no validation: one of the four is always selected, and there
  // is no way to type a fifth.
  const submit = () => {
    setTried(true);
    if (errors.name) return nameRef.current && nameRef.current.focus();
    if (errors.price) return priceRef.current && priceRef.current.focus();
    onSave && onSave({ name: name.trim(), price: parsePrice(price), category: cat,
                       available: item ? item.available : true });
  };

  // The confirmation replaces the form rather than stacking a second sheet on
  // the first. Two sheets deep is a place the manager has to find their way out
  // of; one sheet that changes its mind is a question.
  if (confirming) {
    return (
      <Sheet>
        <Heading size="sub">Delete {item ? item.name : 'this item'}?</Heading>
        <div style={{
          fontSize: 'var(--t-body)', color: 'var(--c-ink-soft)',
          lineHeight: 1.5, margin: 'var(--s-8) 0 var(--s-24)',
        }}>It leaves the counter immediately. This cannot be undone.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
          <Btn kind="blocked" full onClick={() => onDelete && onDelete()}>Delete</Btn>
          <Btn kind="ghost" full onClick={() => setConfirming(false)}>Cancel</Btn>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet handle padded={false} onDismiss={onCancel}>
      <SheetHead onCancel={onCancel}
        action={<Btn kind="slab" size="sm" onClick={submit}>{isNew ? 'Add item' : 'Save changes'}</Btn>}/>

      <div style={{
        padding: 'var(--s-24) var(--pad-phone) var(--s-40)',
        display: 'flex', flexDirection: 'column', gap: 'var(--s-20)',
      }}>
        <Field id="item-name" label="Name" value={name} placeholder="Flat White…"
          inputRef={nameRef} error={bad.name}
          onChange={e => setName(e.target.value)}/>

        {/* inputMode decimal puts a number pad under the thumb; the currency is
            the field's, not something the manager has to type */}
        <Field id="item-price" label="Price" value={price} placeholder="0.00…"
          prefix="$" inputMode="decimal" inputRef={priceRef} error={bad.price}
          onChange={e => setPrice(e.target.value)}/>

        {/* Chips, and nothing else. The category list is fixed, so there is no
            new value to type and therefore no text field to type it into —
            picking from four is one tap and cannot be misspelled. */}
        <div>
          <Label style={{ marginBottom: 'var(--s-8)' }}>Category</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-8)' }}>
            {CATEGORIES.map(c => (
              <Chip key={c} on={c === cat} onClick={() => setCat(c)}>{c}</Chip>
            ))}
          </div>
        </div>

        {/* Below a hairline and nowhere near the commit, which is at the other
            end of the sheet entirely. Loud enough to find, far enough not to be
            hit by the thumb reaching for Save. */}
        {!isNew && (
          <div style={{ marginTop: 'var(--s-4)' }}>
            <Rule style={{ marginBottom: 'var(--s-20)' }}/>
            <Btn kind="blocked" full icon={I.trash} onClick={() => setConfirming(true)}>Delete item</Btn>
          </div>
        )}
      </div>
    </Sheet>
  );
}

Object.assign(window, { POSOrder, ManagerMenu, ManagerItemSheet });
