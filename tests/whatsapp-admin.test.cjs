const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');

function storage() {
  const data = new Map();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

// db.js plus one page script, with just enough browser globals for the script to load
function load(script) {
  const context = vm.createContext({
    localStorage: storage(),
    sessionStorage: storage(),
    console: { error() {} },
    document: { addEventListener() {} },
    window: { addEventListener() {} }
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'db.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, script), 'utf8'), context);
  return { context, run: (code) => vm.runInContext(code, context) };
}

test('admin signs in as BagaskaraAP with the new password only', () => {
  const { context, run } = load('admin.js');
  const auth = run('AdminAuth');

  assert.equal(auth.login('liak', '12345678'), false);
  assert.equal(auth.login('BagaskaraAP', 'wrong-password'), false);
  assert.equal(auth.login('BagaskaraAP', 'KAMUMAUCARIPASSWORDYANGPANJANGGINI'), false);
  assert.equal(auth.getSession(), null);

  assert.equal(auth.login('  bagaskaraap ', 'kamumaucaripasswordyangpanjanggini'), true);
  assert.equal(auth.getSession().username, 'BagaskaraAP');

  // Admin sign-in never creates a member session
  assert.equal(context.localStorage.getItem('oasis_current_user'), null);
});

test('an admin session from the old account is no longer accepted', () => {
  const { context, run } = load('admin.js');
  context.sessionStorage.setItem('oasis_admin_session', JSON.stringify({ username: 'liak', loginAt: '2026-09-21T00:00:00Z' }));
  assert.equal(run('AdminAuth').getSession(), null);
});

test('calendar helpers count nights and add days across month ends', () => {
  const { run } = load('admin.js');
  const utils = run('OasisUtils');
  assert.equal(utils.nightsBetween('2026-09-29', '2026-10-02'), 3);
  assert.equal(utils.nightsBetween('2026-10-02', '2026-09-29'), 0);
  assert.equal(utils.nightsBetween('', '2026-10-02'), 0);
  assert.equal(utils.addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(utils.addDaysISO('bad-date', 1), '');
});

test('reservation message names the villa, dates, guests and estimated total', () => {
  const { run } = load('main.js');
  const property = run("OasisDB.getPropertyById('uluwatu-cliff')");
  const message = run('buildReservationMessage')({
    property,
    checkIn: '2026-10-01',
    checkOut: '2026-10-04',
    guests: 4,
    name: 'Budi Santoso',
    note: 'Airport pickup',
    memberEmail: 'budi@oasis.id'
  });

  assert.match(message, /Villa: Uluwatu Cliff Villa \(Uluwatu\)/);
  assert.match(message, /Rooms: 6 bedrooms · 7 bathrooms/);
  assert.match(message, /Check-in: Thu, 1 Oct 2026/);
  assert.match(message, /Check-out: Sun, 4 Oct 2026/);
  assert.match(message, /Length of stay: 3 nights/);
  assert.match(message, /Guests: 4/);
  assert.match(message, /Estimated total: Rp 14,100,000/);
  assert.match(message, /OASIS member: budi@oasis.id/);
  assert.match(message, /Special requests: Airport pickup/);
});

test('reservation message leaves out optional lines and totals for villas without a rate', () => {
  const { run } = load('main.js');
  const property = Object.assign(run("OasisDB.getPropertyById('ubud-sanctuary')"), { nightlyRate: 0 });
  const message = run('buildReservationMessage')({ property, checkIn: '2026-10-01', checkOut: '2026-10-02', guests: 1, name: 'Ayu', note: '', memberEmail: '' });
  assert.match(message, /Nightly rate: Rate on request/);
  assert.equal(message.includes('Estimated total'), false);
  assert.equal(message.includes('OASIS member'), false);
  assert.equal(message.includes('Special requests'), false);
});

test('WhatsApp links go to the admin number with the message encoded', () => {
  const { run } = load('main.js');
  const url = run('whatsappUrl')('Villa: A & B\nGuests: 2');
  assert.equal(url, 'https://wa.me/6282179808686?text=Villa%3A%20A%20%26%20B%0AGuests%3A%202');
  assert.equal(run('OASIS_CONTACT.phone'), '+62 821-7980-8686');
});

test('booking follow-up quotes the reference number', () => {
  const { run } = load('main.js');
  const message = run('buildBookingWhatsAppMessage')({
    type: 'viewing',
    refNo: 'OASIS-VISIT-12345',
    property: 'Seminyak Beachfront Estate',
    rawDate: '2026-10-01',
    time: 'Morning (09:30 – 11:30 WITA)',
    name: 'Budi Santoso'
  });
  assert.match(message, /Reference: OASIS-VISIT-12345/);
  assert.match(message, /Villa: Seminyak Beachfront Estate/);
  assert.match(message, /Date: Thursday, 1 October 2026/);
});

test('reservation rules: villa, future Bali dates, 1–365 nights, 1–30 guests, a name', () => {
  const { run } = load('main.js');
  const validate = run('validateReservation');
  const utils = run('OasisUtils');
  const today = utils.baliTodayISO();
  const property = run("OasisDB.getPropertyById('canggu-horizon')");
  const ok = { property, checkIn: today, checkOut: utils.addDaysISO(today, 2), guests: 2, name: 'Ayu' };

  assert.equal(validate(ok), '');
  assert.notEqual(validate({ ...ok, property: null }), '');
  assert.notEqual(validate({ ...ok, checkIn: utils.addDaysISO(today, -1) }), '');
  assert.notEqual(validate({ ...ok, checkOut: today }), '');
  assert.notEqual(validate({ ...ok, checkOut: utils.addDaysISO(today, 366) }), '');
  assert.equal(validate({ ...ok, checkOut: utils.addDaysISO(today, 365) }), '');
  for (const guests of [0, 31, 2.5, NaN]) {
    assert.notEqual(validate({ ...ok, guests }), '');
  }
  assert.notEqual(validate({ ...ok, name: '' }), '');
});

test('every villa is listed for everyone, Best Sellers first', () => {
  const { run } = load('main.js');
  const list = run('catalogProperties')();
  assert.equal(list.length, run('OasisDB.getProperties().length'));
  assert.equal(list.length, 6);
  const firstOther = list.findIndex((p) => !p.isBestSeller);
  assert.ok(firstOther > 0);
  assert.ok(list.slice(firstOther).every((p) => !p.isBestSeller));
});

test('guests see only best seller villas in catalog while members see all villas', () => {
  const { run } = load('main.js');
  const all = run('catalogProperties')();
  const guestVillas = all.filter((p) => p.isBestSeller);
  assert.equal(all.length, 6);
  assert.equal(guestVillas.length, 3);
  assert.ok(guestVillas.every((p) => p.isBestSeller));
});

