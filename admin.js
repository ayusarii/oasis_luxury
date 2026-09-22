/**
 * OASIS Admin Console (indexadmin.html)
 * - Admin auth is separate from member auth: its own credentials and its own session in
 *   sessionStorage, so signing in here never signs anyone in on the member site (and vice versa).
 * - Members, bookings and properties are read and written through OasisDB (localStorage),
 *   the same store the public site uses.
 *
 * NOTE: this is a static site with no server, so every check here runs in the browser.
 * It keeps the console out of casual reach, not away from someone who reads the source.
 */

// Username is matched case-insensitively, the password exactly
const ADMIN_ACCOUNT = { username: 'BagaskaraAP', password: 'kamumaucaripasswordyangpanjanggini' };
const ADMIN_SESSION_KEY = 'oasis_admin_session';
const ADMIN_TABS = ['overview', 'bookings', 'members', 'properties', 'reviews'];

const esc = OasisUtils.escapeHtml;

const adminState = {
  tab: 'overview',
  bookingSearch: '',
  bookingType: 'all',
  bookingStatus: 'all',
  memberSearch: '',
  reviewSearch: '',
  reviewStatus: 'all'
};

let clockTimer = null;
let toastTimer = null;
let memberEditor = null;
let propertyFormOpener = null;

const AdminAuth = {
  login(username, password) {
    if (String(username).trim().toLowerCase() !== ADMIN_ACCOUNT.username.toLowerCase() || password !== ADMIN_ACCOUNT.password) {
      return false;
    }
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ username: ADMIN_ACCOUNT.username, loginAt: new Date().toISOString() }));
      return true;
    } catch (e) {
      console.error('Failed to start admin session', e);
      return false;
    }
  },

  getSession() {
    try {
      const data = sessionStorage.getItem(ADMIN_SESSION_KEY);
      const session = data ? JSON.parse(data) : null;
      // A session started with an earlier admin account is no longer valid
      return session && session.username === ADMIN_ACCOUNT.username ? session : null;
    } catch (e) {
      return null;
    }
  },

  logout() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.error('Failed to end admin session', e);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  setupDashboard();

  if (AdminAuth.getSession()) {
    showDashboard();
  } else {
    showLogin();
  }

  // Stay in sync when members register or book in another tab
  window.addEventListener('storage', () => {
    if (AdminAuth.getSession()) renderAll();
  });
});

/**
 * Views
 */
function showLogin() {
  closeMemberForm();
  document.getElementById('adminDashboardView').classList.add('hidden');
  document.getElementById('adminLoginView').classList.remove('hidden');
  document.title = 'Sign In | OASIS Console';
  document.getElementById('adminUsername').focus();
}

function showDashboard() {
  const session = AdminAuth.getSession();
  document.getElementById('adminLoginView').classList.add('hidden');
  document.getElementById('adminDashboardView').classList.remove('hidden');
  document.getElementById('adminName').textContent = session ? session.username : 'admin';
  document.title = 'Dashboard | OASIS Console';

  startClock();
  const hashTab = window.location.hash.replace('#', '');
  switchTab(ADMIN_TABS.includes(hashTab) ? hashTab : adminState.tab);
  renderAll();
}

function setupLogin() {
  const form = document.getElementById('adminLoginForm');
  const alertBox = document.getElementById('adminLoginAlert');
  const passwordInput = document.getElementById('adminPassword');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = passwordInput.value;

    if (AdminAuth.login(username, password)) {
      alertBox.classList.add('hidden');
      form.reset();
      showDashboard();
    } else {
      alertBox.textContent = '⚠️ Invalid username or password.';
      alertBox.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
}

function setupDashboard() {
  document.getElementById('btnAdminLogout').addEventListener('click', () => {
    if (!confirm('Log out of the admin console?')) return;
    AdminAuth.logout();
    clearInterval(clockTimer);
    clockTimer = null;
    history.replaceState(null, '', window.location.pathname);
    showLogin();
  });

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-goto')));
  });

  // Booking filters
  document.getElementById('bookingSearch').addEventListener('input', (e) => {
    adminState.bookingSearch = e.target.value;
    renderBookings();
  });
  document.getElementById('bookingTypeFilter').addEventListener('change', (e) => {
    adminState.bookingType = e.target.value;
    renderBookings();
  });
  document.getElementById('bookingStatusFilter').addEventListener('change', (e) => {
    adminState.bookingStatus = e.target.value;
    renderBookings();
  });

  // Booking actions
  const bookingsBody = document.getElementById('bookingsTableBody');
  bookingsBody.addEventListener('change', (e) => {
    const select = e.target.closest('[data-action="status"]');
    if (!select) return;
    const refNo = select.getAttribute('data-ref');
    if (OasisDB.updateBookingStatus(refNo, select.value)) {
      toast(`${refNo} marked as ${OasisDB.BOOKING_STATUSES[select.value]}.`);
    }
    renderAll();
  });
  bookingsBody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="delete-booking"]');
    if (!btn) return;
    const refNo = btn.getAttribute('data-ref');
    if (!confirm(`Delete booking ${refNo}? This cannot be undone.`)) return;
    toast(OasisDB.deleteBooking(refNo) ? `Booking ${refNo} deleted.` : `Booking ${refNo} could not be deleted.`);
    renderAll();
  });

  // Member actions
  document.getElementById('memberSearch').addEventListener('input', (e) => {
    adminState.memberSearch = e.target.value;
    renderMembers();
  });
  document.getElementById('membersTableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !AdminAuth.getSession()) return;
    const user = OasisDB.findUserById(btn.getAttribute('data-id'));
    if (!user) return;
    const action = btn.getAttribute('data-action');
    if (action === 'edit-member' || action === 'reset-member-password') {
      openMemberForm(user, action === 'reset-member-password', btn);
      return;
    }
    if (action !== 'delete-member') return;
    const bookingCount = OasisDB.getBookingsForUser(user).length;
    const reviewCount = OasisDB.getTestimonials().filter((t) => t.userId === user.id).length;
    const message =
      `Delete member "${user.name}" (${user.email})?\n\n` +
      `${plural(bookingCount, 'booking')} and ${plural(reviewCount, 'review')} will also be removed, and the member will be signed out.`;
    if (!confirm(message)) return;
    toast(OasisDB.deleteUser(user.id) ? `Member ${user.name} deleted.` : 'The member could not be deleted. Please try again.');
    renderAll();
  });

  const memberModal = document.getElementById('memberModal');
  document.getElementById('memberForm').addEventListener('submit', saveMember);
  memberModal.querySelectorAll('[data-close-member]').forEach((btn) => {
    btn.addEventListener('click', closeMemberForm);
  });
  memberModal.addEventListener('close', () => {
    document.getElementById('memberForm').reset();
    document.getElementById('memberFormError').hidden = true;
    if (memberEditor && memberEditor.trigger.isConnected) memberEditor.trigger.focus();
    memberEditor = null;
  });
  ['mfPassword', 'mfPasswordConfirm'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      document.getElementById('mfPasswordConfirm').setCustomValidity('');
    });
  });

  // Property actions
  document.getElementById('btnAddProperty').addEventListener('click', () => openPropertyForm(null));
  document.getElementById('btnRestoreProperties').addEventListener('click', () => {
    if (!confirm('Replace the whole catalog with the default Bali collection? All property edits will be lost.')) return;
    toast(OasisDB.resetProperties() ? 'Default catalog restored.' : 'The catalog could not be restored: browser storage is full or blocked.');
    renderAll();
  });
  document.getElementById('propertiesGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const property = OasisDB.getPropertyById(btn.getAttribute('data-id'));
    if (!property) return;

    if (btn.getAttribute('data-action') === 'edit-property') {
      openPropertyForm(property);
    } else if (btn.getAttribute('data-action') === 'delete-property') {
      if (!confirm(`Delete "${property.title}" from the catalog?`)) return;
      toast(OasisDB.deleteProperty(property.id) ? `${property.title} deleted.` : `${property.title} could not be deleted.`);
      renderAll();
    }
  });
  document.getElementById('propertiesGrid').addEventListener('change', (e) => {
    const toggle = e.target.closest('[data-action="toggle-best"]');
    if (!toggle) return;
    const property = OasisDB.getPropertyById(toggle.getAttribute('data-id'));
    if (!property) return;
    property.isBestSeller = toggle.checked;
    if (OasisDB.saveProperty(property)) {
      toast(`${property.title} ${toggle.checked ? 'is now a Best Seller' : 'is no longer a Best Seller'}.`);
    } else {
      toast('Could not save the change: browser storage is full or blocked.');
    }
    renderAll();
  });

  // Review moderation
  document.getElementById('reviewSearch').addEventListener('input', (e) => {
    adminState.reviewSearch = e.target.value;
    renderReviews();
  });
  document.getElementById('reviewStatusFilter').addEventListener('change', (e) => {
    adminState.reviewStatus = e.target.value;
    renderReviews();
  });
  const reviewsBody = document.getElementById('reviewsTableBody');
  reviewsBody.addEventListener('change', (e) => {
    const select = e.target.closest('[data-action="review-status"]');
    if (!select) return;
    if (OasisDB.updateTestimonialStatus(select.getAttribute('data-id'), select.value)) {
      toast(select.value === 'hidden' ? 'Review hidden from the website.' : 'Review published on the website.');
    }
    renderAll();
  });
  reviewsBody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="delete-review"]');
    if (!btn) return;
    const review = OasisDB.getTestimonials().find((t) => t.id === btn.getAttribute('data-id'));
    if (!review) return;
    if (!confirm(`Delete the review by "${review.name}" for ${review.villa}? This cannot be undone.`)) return;
    toast(OasisDB.deleteTestimonial(review.id) ? 'Review deleted.' : 'The review could not be deleted.');
    renderAll();
  });
  const btnRestoreReviews = document.getElementById('btnRestoreReviews');
  if (btnRestoreReviews) {
    btnRestoreReviews.addEventListener('click', () => {
      if (!confirm('Restore default guest testimonials? All custom reviews will be replaced.')) return;
      toast(OasisDB.resetTestimonials() ? 'Default reviews restored.' : 'The reviews could not be restored.');
      renderAll();
    });
  }

  // Property editor
  const propertyModal = document.getElementById('propertyModal');
  document.getElementById('propertyForm').addEventListener('submit', saveProperty);
  document.getElementById('pfNightlyRate').addEventListener('input', updateRateHint);
  propertyModal.querySelectorAll('[data-close-property]').forEach((btn) => {
    btn.addEventListener('click', closePropertyForm);
  });
  propertyModal.addEventListener('click', (e) => {
    if (e.target === propertyModal) closePropertyForm();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !propertyModal.classList.contains('hidden')) closePropertyForm();
  });
}

function switchTab(tab) {
  adminState.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tab);
  });
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.getAttribute('data-panel') !== tab);
  });
  history.replaceState(null, '', '#' + tab);
  window.scrollTo({ top: 0 });
}

function startClock() {
  if (clockTimer) return;
  const clock = document.getElementById('adminClock');
  const tick = () => {
    clock.textContent = OasisUtils.baliClock();
  };
  tick();
  clockTimer = setInterval(tick, 1000);
}

/**
 * Rendering
 */
function renderAll() {
  const bookings = OasisDB.getAllBookings();
  document.getElementById('tabCountBookings').textContent = bookings.length;
  document.getElementById('tabCountMembers').textContent = OasisDB.getAllUsers().length;
  document.getElementById('tabCountProperties').textContent = OasisDB.getProperties().length;
  document.getElementById('tabCountReviews').textContent = OasisDB.getTestimonials().length;

  renderOverview();
  renderBookings();
  renderMembers();
  renderProperties();
  renderReviews();
}

function renderReviews() {
  const all = OasisDB.getTestimonials();
  const users = OasisDB.getAllUsers();
  const query = adminState.reviewSearch.trim().toLowerCase();

  const rows = all.filter((t) => {
    if (adminState.reviewStatus !== 'all' && t.status !== adminState.reviewStatus) return false;
    if (!query) return true;
    return [t.name, t.city, t.villa, t.text].some((v) => String(v || '').toLowerCase().includes(query));
  });

  const tbody = document.getElementById('reviewsTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-slate-400 py-10">${
      all.length ? 'No reviews match your filters.' : 'No reviews yet. They will appear here as soon as members share their stay.'
    }</td></tr>`;
  } else {
    tbody.innerHTML = rows
      .map((t) => {
        const rating = Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5)));
        const status = OasisDB.TESTIMONIAL_STATUSES[t.status] ? t.status : 'published';
        const member = t.userId ? users.find((u) => u.id === t.userId) : null;
        const source = t.sample
          ? '<div class="text-[11px] text-amber-600 mt-0.5">Sample review</div>'
          : member
            ? `<div class="text-xs text-slate-500">${esc(member.email)}</div>`
            : '';
        const statusOptions = Object.keys(OasisDB.TESTIMONIAL_STATUSES)
          .map((value) => `<option value="${value}" ${value === status ? 'selected' : ''}>${OasisDB.TESTIMONIAL_STATUSES[value]}</option>`)
          .join('');

        return `
        <tr>
          <td>
            <div class="font-semibold text-slate-800">${esc(t.name)}</div>
            ${t.city ? `<div class="text-xs text-slate-500">${esc(t.city)}</div>` : ''}
            ${source}
          </td>
          <td class="min-w-[160px]">
            <div>${esc(t.villa)}</div>
            <div class="text-xs text-slate-500">${esc(plural(t.nights, 'night'))}</div>
          </td>
          <td><span class="review-stars" aria-label="${rating} out of 5">${'★'.repeat(rating)}<span class="off">${'★'.repeat(5 - rating)}</span></span></td>
          <td class="min-w-[240px] max-w-[420px] text-slate-700" style="overflow-wrap:anywhere">${esc(t.text)}</td>
          <td class="text-xs text-slate-500 whitespace-nowrap">${esc(OasisUtils.formatBaliDateTime(t.createdAt))}</td>
          <td>
            <select class="status-select status-${status}" data-action="review-status" data-id="${esc(t.id)}" aria-label="Status of the review by ${esc(t.name)}">${statusOptions}</select>
          </td>
          <td class="text-right">
            <button type="button" class="admin-btn-danger" data-action="delete-review" data-id="${esc(t.id)}">Delete</button>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  const published = all.filter((t) => t.status === 'published').length;
  document.getElementById('reviewsSummary').textContent = `Showing ${rows.length} of ${plural(all.length, 'review')} · ${published} published on the website.`;
}

function renderOverview() {
  const users = OasisDB.getAllUsers();
  const bookings = OasisDB.getAllBookings();
  const properties = OasisDB.getProperties();
  const today = OasisUtils.baliTodayISO();

  const meetings = bookings.filter((b) => b.type === 'meeting').length;
  const upcoming = bookings.filter((b) => bookingStatus(b) === 'confirmed' && b.rawDate && b.rawDate >= today).length;
  const bestSellers = properties.filter((p) => p.isBestSeller).length;

  document.getElementById('overviewDate').textContent = `${OasisUtils.formatDateLong(today)} · Bali time (WITA, UTC+8)`;

  const stats = [
    { label: 'Members', value: users.length, note: 'Registered accounts' },
    { label: 'Bookings', value: bookings.length, note: `${plural(meetings, 'meeting')} · ${plural(bookings.length - meetings, 'viewing')}` },
    { label: 'Upcoming', value: upcoming, note: 'Confirmed, from today (WITA)' },
    { label: 'Properties', value: properties.length, note: `${plural(bestSellers, 'Best Seller')}` }
  ];

  document.getElementById('statCards').innerHTML = stats
    .map(
      (s) => `
      <div class="admin-card">
        <div class="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">${s.label}</div>
        <div class="font-serif-luxury text-4xl text-[#3b2721] mt-1">${s.value}</div>
        <div class="text-xs text-slate-500 mt-1">${esc(s.note)}</div>
      </div>
    `
    )
    .join('');

  const latest = bookings.slice(0, 5);
  document.getElementById('overviewBookings').innerHTML = latest.length
    ? `<ul class="divide-y divide-slate-100">${latest
        .map(
          (b) => `
        <li class="py-3 flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              ${typeBadge(b)}
              <span class="font-mono text-xs text-slate-500">${esc(b.refNo)}</span>
            </div>
            <div class="font-semibold text-slate-800 truncate">${esc(bookingSubject(b))}</div>
            <div class="text-xs text-slate-500">${esc(b.name)} · ${esc(bookingDate(b))}, ${esc(b.time)}</div>
          </div>
          <span class="status-pill status-${bookingStatus(b)} shrink-0">${OasisDB.BOOKING_STATUSES[bookingStatus(b)]}</span>
        </li>
      `
        )
        .join('')}</ul>`
    : emptyNote('No bookings yet. They will appear here as soon as members book a meeting or viewing.');

  const newest = [...users].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 5);
  document.getElementById('overviewMembers').innerHTML = newest.length
    ? `<ul class="divide-y divide-slate-100">${newest
        .map(
          (u) => `
        <li class="py-3 flex items-center gap-3">
          ${avatar(u)}
          <div class="min-w-0">
            <div class="font-semibold text-slate-800 truncate">${esc(u.name)}</div>
            <div class="text-xs text-slate-500 truncate">${esc(u.email)}</div>
          </div>
        </li>
      `
        )
        .join('')}</ul>`
    : emptyNote('No members yet.');
}

function renderBookings() {
  const all = OasisDB.getAllBookings();
  const users = OasisDB.getAllUsers();
  const query = adminState.bookingSearch.trim().toLowerCase();

  const rows = all.filter((b) => {
    if (adminState.bookingType !== 'all' && b.type !== adminState.bookingType) return false;
    if (adminState.bookingStatus !== 'all' && bookingStatus(b) !== adminState.bookingStatus) return false;
    if (!query) return true;
    return [b.refNo, b.name, b.email, b.topic, b.property].some((v) => String(v || '').toLowerCase().includes(query));
  });

  const tbody = document.getElementById('bookingsTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-slate-400 py-10">${
      all.length ? 'No bookings match your filters.' : 'No bookings yet. They will appear here as soon as members book a meeting or viewing.'
    }</td></tr>`;
  } else {
    tbody.innerHTML = rows
      .map((b) => {
        const status = bookingStatus(b);
        const owner = b.userId ? users.find((u) => u.id === b.userId) : null;
        const statusOptions = Object.keys(OasisDB.BOOKING_STATUSES)
          .map((value) => `<option value="${value}" ${value === status ? 'selected' : ''}>${OasisDB.BOOKING_STATUSES[value]}</option>`)
          .join('');

        return `
        <tr>
          <td class="whitespace-nowrap">
            <div class="font-mono text-xs font-bold text-[#3b2721] mb-1">${esc(b.refNo)}</div>
            ${typeBadge(b)}
          </td>
          <td>
            <div class="font-semibold text-slate-800">${esc(b.name)}</div>
            <div class="text-xs text-slate-500">${esc(b.email)}</div>
            ${owner ? '' : '<div class="text-[11px] text-amber-600 mt-0.5">No linked member account</div>'}
          </td>
          <td class="whitespace-nowrap">
            <div>${esc(bookingDate(b))}</div>
            <div class="text-xs text-slate-500">${esc(b.time)}</div>
          </td>
          <td class="min-w-[180px]">${esc(bookingSubject(b))}</td>
          <td>
            <select class="status-select status-${status}" data-action="status" data-ref="${esc(b.refNo)}" aria-label="Status of ${esc(b.refNo)}">${statusOptions}</select>
          </td>
          <td class="text-xs text-slate-500 whitespace-nowrap">${esc(OasisUtils.formatBaliDateTime(b.createdAt))}</td>
          <td class="text-right">
            <button type="button" class="admin-btn-danger" data-action="delete-booking" data-ref="${esc(b.refNo)}">Delete</button>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  document.getElementById('bookingsSummary').textContent = `Showing ${rows.length} of ${plural(all.length, 'booking')}.`;
}

function renderMembers() {
  const users = [...OasisDB.getAllUsers()].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const bookings = OasisDB.getAllBookings();
  const query = adminState.memberSearch.trim().toLowerCase();
  const rows = users.filter((u) => !query || [u.name, u.email].some((v) => String(v || '').toLowerCase().includes(query)));

  const tbody = document.getElementById('membersTableBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-400 py-10">${users.length ? 'No members match your search.' : 'No members yet.'}</td></tr>`;
  } else {
    tbody.innerHTML = rows
      .map((u) => {
        const count = bookings.filter((b) => b.userId === u.id).length;
        return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              ${avatar(u)}
              <span class="font-semibold text-slate-800">${esc(u.name)}</span>
            </div>
          </td>
          <td class="text-slate-600">${esc(u.email)}</td>
          <td class="text-xs text-slate-500 whitespace-nowrap">${esc(OasisUtils.formatBaliDateTime(u.createdAt))}</td>
          <td>${count}</td>
          <td class="text-right">
            <div class="member-actions">
              <button type="button" class="admin-btn-secondary" data-action="edit-member" data-id="${esc(u.id)}">Edit</button>
              <button type="button" class="admin-btn-secondary" data-action="reset-member-password" data-id="${esc(u.id)}">Reset password</button>
              <button type="button" class="admin-btn-danger" data-action="delete-member" data-id="${esc(u.id)}">Delete</button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  document.getElementById('membersSummary').textContent = `Showing ${rows.length} of ${plural(users.length, 'member')}.`;
}

function renderProperties() {
  const properties = OasisDB.getProperties();
  const grid = document.getElementById('propertiesGrid');

  if (properties.length === 0) {
    grid.innerHTML = `<div class="admin-card sm:col-span-2 xl:col-span-3">${emptyNote('The catalog is empty. Add a property or restore the default collection.')}</div>`;
    return;
  }

  grid.innerHTML = properties
    .map(
      (p) => `
      <article class="admin-card !p-0 overflow-hidden flex flex-col">
        <div class="h-40 bg-cover bg-center bg-slate-200 relative" style="background-image: url('${esc(OasisUtils.cssUrl(p.image))}');">
          <div class="absolute top-3 left-3 flex gap-2">
            ${p.isBestSeller ? '<span class="badge-best-seller">★ Best Seller</span>' : ''}
            ${p.tag ? `<span class="estate-tag tag-gold">${esc(p.tag)}</span>` : ''}
          </div>
        </div>
        <div class="p-4 flex flex-col gap-1 flex-1">
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-serif-luxury text-lg text-[#3b2721] leading-tight">${esc(p.title)}</h3>
          </div>
          <div class="text-xs text-slate-500">${esc(p.location)} · ${esc(plural(p.bedrooms, 'bed'))} · ${esc(plural(p.bathrooms, 'bath'))}</div>
          <div class="font-bold text-[#5C3930]">${esc(OasisUtils.formatNightlyRate(p.nightlyRate))}</div>
          <label class="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 accent-[#5C3930]" data-action="toggle-best" data-id="${esc(p.id)}" ${p.isBestSeller ? 'checked' : ''}>
            Best Seller (badge, listed first, hero card)
          </label>
          <div class="flex gap-2 pt-2">
            <button type="button" class="admin-btn-secondary flex-1" data-action="edit-property" data-id="${esc(p.id)}">Edit</button>
            <button type="button" class="admin-btn-danger" data-action="delete-property" data-id="${esc(p.id)}">Delete</button>
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

function openMemberForm(user, resetPassword, trigger) {
  if (!AdminAuth.getSession()) return;
  const form = document.getElementById('memberForm');
  form.reset();
  memberEditor = { userId: user.id, resetPassword, trigger };
  document.getElementById('memberModalTitle').textContent = resetPassword ? 'Reset OASIS password' : 'Edit member';
  document.getElementById('memberModalAccount').textContent = `${user.name} (${user.email})`;
  document.getElementById('memberFormSubmit').textContent = resetPassword ? 'Reset password' : 'Save member';
  document.getElementById('memberFormError').hidden = true;
  document.getElementById('memberProfileFields').hidden = resetPassword;
  document.getElementById('memberPasswordFields').hidden = !resetPassword;
  ['mfName', 'mfEmail'].forEach((id) => { document.getElementById(id).disabled = resetPassword; });
  ['mfPassword', 'mfPasswordConfirm'].forEach((id) => { document.getElementById(id).disabled = !resetPassword; });
  document.getElementById('mfPasswordConfirm').setCustomValidity('');
  document.getElementById('mfName').value = user.name;
  document.getElementById('mfEmail').value = user.email;
  document.getElementById('memberModal').showModal();
  document.getElementById(resetPassword ? 'mfPassword' : 'mfName').focus();
}

function closeMemberForm() {
  const modal = document.getElementById('memberModal');
  if (modal.open) modal.close();
}

function saveMember(e) {
  e.preventDefault();
  if (!AdminAuth.getSession()) {
    showLogin();
    return;
  }
  if (!memberEditor) return;
  let result;
  if (memberEditor.resetPassword) {
    const password = document.getElementById('mfPassword').value;
    const confirmation = document.getElementById('mfPasswordConfirm');
    if (password !== confirmation.value) {
      confirmation.setCustomValidity('Passwords do not match.');
      confirmation.reportValidity();
      return;
    }
    result = OasisDB.resetUserPassword(memberEditor.userId, password);
  } else {
    result = OasisDB.updateUserProfile(memberEditor.userId, {
      name: document.getElementById('mfName').value,
      email: document.getElementById('mfEmail').value
    });
  }
  if (!result.success) {
    const error = document.getElementById('memberFormError');
    error.textContent = result.message;
    error.hidden = false;
    return;
  }
  closeMemberForm();
  renderAll();
  document.getElementById('memberSearch').focus();
  toast(result.message);
}

/**
 * Property editor
 */
function openPropertyForm(property) {
  const isEdit = !!property;
  const p = property || {};

  document.getElementById('propertyModalTitle').textContent = isEdit ? `Edit ${p.title}` : 'Add property';
  document.getElementById('pfId').value = p.id || '';
  document.getElementById('pfTitle').value = p.title || '';
  document.getElementById('pfLocation').value = p.location || '';
  document.getElementById('pfNightlyRate').value = Number(p.nightlyRate) > 0 ? p.nightlyRate : '';
  updateRateHint();
  document.getElementById('pfTag').value = p.tag || '';
  document.getElementById('pfGarage').value = p.garage || '';
  document.getElementById('pfBedrooms').value = p.bedrooms != null ? p.bedrooms : '';
  document.getElementById('pfBathrooms').value = p.bathrooms != null ? p.bathrooms : '';
  document.getElementById('pfArea').value = p.area || '';
  document.getElementById('pfImage').value = p.image || '';
  document.getElementById('pfDescription').value = p.description || '';
  document.getElementById('pfFacilities').value = Array.isArray(p.facilities) ? p.facilities.join('\n') : '';
  document.getElementById('pfBestSeller').checked = !!p.isBestSeller;
  document.getElementById('propertyFormError').classList.add('hidden');

  propertyFormOpener = document.activeElement;
  document.getElementById('propertyModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('pfTitle').focus();
}

// Live "= Rp 4,000,000 / night" hint so the number of zeros is easy to check
function updateRateHint() {
  const rate = Number(document.getElementById('pfNightlyRate').value);
  document.getElementById('pfNightlyHint').textContent =
    rate > 0 ? `= ${OasisUtils.formatNightlyRate(rate)}` : 'Our villas range from Rp 3,000,000 to Rp 5,000,000';
}

function closePropertyForm() {
  document.getElementById('propertyModal').classList.add('hidden');
  document.body.style.overflow = '';
  // Return focus to the button that opened the editor (if it is still on the page)
  if (propertyFormOpener && propertyFormOpener.isConnected) propertyFormOpener.focus();
  propertyFormOpener = null;
}

function saveProperty(e) {
  e.preventDefault();
  const value = (id) => document.getElementById(id).value.trim();
  const count = (id) => Math.min(50, Math.max(0, parseInt(value(id), 10) || 0));

  const title = value('pfTitle').slice(0, 80);
  const location = value('pfLocation').slice(0, 60);
  const nightlyRate = Math.max(0, Math.round(Number(value('pfNightlyRate')) || 0));
  const image = value('pfImage');

  const errorBox = document.getElementById('propertyFormError');
  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  };
  if (!title || !location || nightlyRate <= 0 || !image) {
    showError('Title, location, nightly rate (IDR) and image URL are required.');
    return;
  }
  if (nightlyRate > 1000000000) {
    showError('Please check the nightly rate: it should be at most Rp 1,000,000,000 per night.');
    return;
  }

  const existingId = value('pfId');
  // Don't bring back a villa that was deleted in another tab while this editor was open
  if (existingId && !OasisDB.getPropertyById(existingId)) {
    showError('This villa no longer exists (it was deleted elsewhere). Close the editor and add it again if needed.');
    return;
  }
  const property = {
    id: existingId || OasisDB.createPropertyId(title),
    title,
    tag: value('pfTag').slice(0, 30),
    location,
    nightlyRate,
    isBestSeller: document.getElementById('pfBestSeller').checked,
    image,
    bedrooms: count('pfBedrooms'),
    bathrooms: count('pfBathrooms'),
    area: value('pfArea').slice(0, 60),
    garage: value('pfGarage').slice(0, 40),
    description: value('pfDescription').slice(0, 600),
    facilities: document
      .getElementById('pfFacilities')
      .value.split('\n')
      .map((line) => line.trim().slice(0, 120))
      .filter(Boolean)
      .slice(0, 20)
  };

  if (!OasisDB.saveProperty(property)) {
    showError('The villa could not be saved because browser storage is full or blocked.');
    return;
  }
  closePropertyForm();
  toast(existingId ? `${title} updated.` : `${title} added to the catalog.`);
  renderAll();
}

/**
 * Helpers
 */
function bookingStatus(booking) {
  return OasisDB.BOOKING_STATUSES[booking.status] ? booking.status : 'confirmed';
}

function bookingSubject(booking) {
  return booking.type === 'viewing' ? booking.property || booking.topic : booking.topic || booking.title;
}

function bookingDate(booking) {
  return booking.rawDate ? OasisUtils.formatDateShort(booking.rawDate) : booking.date || '-';
}

function typeBadge(booking) {
  return booking.type === 'viewing'
    ? '<span class="type-badge type-viewing">Viewing</span>'
    : '<span class="type-badge type-meeting">Meeting</span>';
}

function avatar(user) {
  return `<span class="w-9 h-9 shrink-0 rounded-full grid place-items-center text-white text-xs font-bold bg-gradient-to-br from-[#d4af37] to-[#8c5e4a]">${esc(
    OasisUtils.initials(user.name)
  )}</span>`;
}

function emptyNote(text) {
  return `<p class="text-sm text-slate-400 py-6 text-center">${esc(text)}</p>`;
}

function plural(count, word) {
  const n = Number(count) || 0;
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function toast(message) {
  const el = document.getElementById('adminToast');
  el.textContent = message;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}
