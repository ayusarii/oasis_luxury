const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');

function fixture() {
  const data = new Map();
  const state = { failWrites: false, failRemovals: false };
  const context = vm.createContext({
    localStorage: {
      getItem: (key) => data.get(key) ?? null,
      setItem(key, value) {
        if (state.failWrites) throw new Error('Storage unavailable');
        data.set(key, value);
      },
      removeItem(key) {
        if (state.failRemovals) throw new Error('Storage unavailable');
        data.delete(key);
      }
    },
    console: { error() {} }
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'db.js'), 'utf8'), context);
  const db = vm.runInContext('OasisDB', context);
  return { db, data, state, context };
}

test('profile edits normalize email and preserve credentials, bookings, and reviews', () => {
  const { db, data } = fixture();
  const original = db.findUserById('usr_demo_01');
  data.set('oasis_booking_history', JSON.stringify([{ refNo: 'TEST-1', userId: original.id, email: original.email, type: 'meeting', status: 'confirmed' }]));
  const bookings = data.get('oasis_booking_history');
  const reviews = data.get('oasis_testimonials_db');
  db.loginUser(original.email, original.password);
  const result = db.updateUserProfile(original.id, { name: ' Updated Member ', email: ' MEMBER@EXAMPLE.COM ' });
  assert.equal(result.success, true);
  const updated = db.findUserById(original.id);
  assert.equal(updated.name, 'Updated Member');
  assert.equal(updated.email, 'member@example.com');
  assert.equal(updated.password, original.password);
  assert.equal(updated.createdAt, original.createdAt);
  assert.equal(db.getCurrentUser().email, updated.email);
  assert.equal(data.get('oasis_booking_history'), bookings);
  assert.equal(data.get('oasis_testimonials_db'), reviews);
  assert.equal(db.getBookingsForUser(updated).length, 1);
});

test('invalid, duplicate, and missing-member edits leave stored accounts unchanged', () => {
  const { db, data } = fixture();
  db.registerUser({ name: 'Second', email: 'second@example.com', password: 'test-pass-2' });
  const before = data.get('oasis_users_db');
  for (const profile of [
    { name: '', email: 'valid@example.com' },
    { name: 'Name', email: 'invalid-email' },
    { name: 'Name', email: ' SECOND@EXAMPLE.COM ' },
    { name: 'x'.repeat(101), email: 'valid@example.com' }
  ]) {
    assert.equal(db.updateUserProfile('usr_demo_01', profile).success, false);
  }
  assert.equal(db.updateUserProfile('missing', { name: 'Name', email: 'valid@example.com' }).success, false);
  assert.equal(data.get('oasis_users_db'), before);
});

test('reset rejects old password, accepts new password, and revokes existing session', () => {
  const { db, data } = fixture();
  const user = db.findUserById('usr_demo_01');
  db.loginUser(user.email, user.password);
  const oldSession = data.get('oasis_current_user');
  const result = db.resetUserPassword(user.id, 'new-test-password');
  assert.equal(result.success, true);
  assert.equal(db.getCurrentUser(), null);
  assert.equal(db.loginUser(user.email, user.password).success, false);
  data.set('oasis_current_user', oldSession);
  assert.equal(db.getCurrentUser(), null);
  assert.equal(db.loginUser(user.email, 'new-test-password').success, true);
  assert.equal(db.getCurrentUser().id, user.id);
  assert.equal('password' in result, false);
  assert.equal('password' in db.getCurrentUser(), false);
});

test('legacy member sessions remain valid until password reset', () => {
  const { db, data } = fixture();
  data.set('oasis_current_user', JSON.stringify({ id: 'usr_demo_01', loginAt: '2026-09-21T00:00:00Z' }));
  assert.equal(db.getCurrentUser().id, 'usr_demo_01');
  db.resetUserPassword('usr_demo_01', 'new-test-password');
  assert.equal(db.getCurrentUser(), null);
});

test('resetting one member does not change another member or their session', () => {
  const { db, data } = fixture();
  const second = db.registerUser({ name: 'Second', email: 'second@example.com', password: 'test-pass-2' }).user;
  db.loginUser(second.email, second.password);
  const session = data.get('oasis_current_user');
  const reviews = data.get('oasis_testimonials_db');
  assert.equal(db.resetUserPassword('usr_demo_01', 'new-test-password').success, true);
  assert.equal(JSON.stringify(db.findUserById(second.id)), JSON.stringify(second));
  assert.equal(data.get('oasis_current_user'), session);
  assert.equal(data.get('oasis_testimonials_db'), reviews);
  assert.equal(db.getCurrentUser().id, second.id);
});

test('invalid resets leave accounts and sessions unchanged', () => {
  const { db, data } = fixture();
  db.loginUser('budi@oasis.id', 'password123');
  const before = data.get('oasis_users_db');
  const session = data.get('oasis_current_user');
  for (const password of ['', 'short', '      ', null, 12345678, 'x'.repeat(129)]) {
    assert.equal(db.resetUserPassword('usr_demo_01', password).success, false);
  }
  assert.equal(db.resetUserPassword('missing', 'new-test-password').success, false);
  assert.equal(data.get('oasis_users_db'), before);
  assert.equal(data.get('oasis_current_user'), session);
});

test('write failures report failure without changing credentials or ending sessions', () => {
  const { db, data, state } = fixture();
  db.loginUser('budi@oasis.id', 'password123');
  const before = data.get('oasis_users_db');
  const session = data.get('oasis_current_user');
  state.failWrites = true;
  assert.equal(db.resetUserPassword('usr_demo_01', 'new-test-password').success, false);
  assert.equal(db.updateUserProfile('usr_demo_01', { name: 'Updated', email: 'updated@example.com' }).success, false);
  assert.equal(data.get('oasis_users_db'), before);
  assert.equal(data.get('oasis_current_user'), session);
  assert.equal(db.getCurrentUser().id, 'usr_demo_01');
});

test('password version revokes old session when session removal fails', () => {
  const { db, state } = fixture();
  db.loginUser('budi@oasis.id', 'password123');
  state.failRemovals = true;
  assert.equal(db.resetUserPassword('usr_demo_01', 'new-test-password').success, true);
  assert.equal(db.getCurrentUser(), null);
});

test('admin member table escapes profile text and never renders stored passwords', () => {
  const { db, context } = fixture();
  const member = db.registerUser({ name: '<img src=x onerror=alert(1)>', email: 'member@example.com', password: 'NEVER-RENDER-THIS-PASSWORD' }).user;
  const nodes = { membersTableBody: {}, membersSummary: {} };
  context.document = { addEventListener() {}, getElementById: (id) => nodes[id] };
  vm.runInContext(fs.readFileSync(path.join(root, 'admin.js'), 'utf8'), context);
  vm.runInContext('renderMembers()', context);
  const html = nodes.membersTableBody.innerHTML;
  assert.match(html, /data-action="edit-member"/);
  assert.match(html, /data-action="reset-member-password"/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.equal(html.includes(member.password), false);
  assert.equal(html.includes('<img src=x'), false);
});
