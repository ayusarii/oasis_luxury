/**
 * OASIS Villas - Main Script
 * Handles catalog rendering, member auth UI, feature gating, the property detail modal,
 * booking confirmations, the e-ticket history, the confirmation email preview and
 * WhatsApp reservations (wa.me links to the admin number).
 * OASIS rents private villas by the night (prices in IDR); every schedule runs on
 * Bali time (WITA, UTC+8).
 */

const OASIS_CONTACT = {
  email: 'oasis@gmail.com',
  phone: '+62 821-7980-8686',
  // Admin WhatsApp (0821-7980-8686) in the international format wa.me links need
  whatsapp: '6282179808686',
  venue: 'Private VIP Lounge (Seminyak, Bali) / Google Meet VIP Room',
  advisor: 'Alexander Wright (Senior Villa Specialist)'
};

const esc = OasisUtils.escapeHtml;

// WhatsApp glyph from the #waGlyph symbol in index.html
const WHATSAPP_ICON = '<svg class="wa-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#waGlyph" /></svg>';

// Meeting shown in the latest success pop-up; "Open Confirmation Email" uses it
let lastMeetingBooking = null;

const STORAGE_FULL_MESSAGE = 'Your booking could not be saved because browser storage is full or blocked. Please free up space and try again.';

document.addEventListener('DOMContentLoaded', () => {
  // Current member session
  const currentUser = OasisDB.getCurrentUser();
  const isAuth = !!currentUser;

  // Render page components
  renderHeaderAuthState(currentUser);
  renderHeroFeature();
  renderCatalog(isAuth);
  renderTestimonials({ animate: true });
  setupFeatureButtons();
  setupModals();
  setupReservations();
  setupConcierge();
  setupTestimonials();
  setupMobileNav();
  setupMobileQuickbar();
  setupLiveSync(currentUser);
  startBaliClock();

  // Start AOS once the dynamic catalog is in the DOM. If the AOS script failed to load,
  // drop the data-aos attributes so aos.css cannot keep that content invisible.
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 50 });
  } else {
    document.querySelectorAll('[data-aos]').forEach((el) => el.removeAttribute('data-aos'));
  }
});

/**
 * Keep this tab in step with other tabs of the same browser (login / logout elsewhere,
 * account removed or password reset by the admin, catalog or review changes).
 */
function setupLiveSync(pageUser) {
  const pageUserId = pageUser ? pageUser.id : null;

  window.addEventListener('storage', (e) => {
    const user = OasisDB.getCurrentUser();
    if ((user ? user.id : null) !== pageUserId) {
      // Signed in, signed out or signed out by the admin: reload so every part of the page agrees
      window.location.reload();
      return;
    }
    if (e.key === null || e.key === 'oasis_properties_db') {
      renderHeroFeature();
      renderCatalog(!!user);
    }
    if (e.key === null || e.key === 'oasis_testimonials_db' || e.key === 'oasis_users_db') {
      renderTestimonials();
    }
    if (user && (e.key === null || e.key === 'oasis_booking_history' || e.key === 'oasis_users_db')) {
      renderHeaderAuthState(user);
    }
  });
}

/**
 * 1. Navbar auth state: LOGIN button, or member badge + e-tickets + logout
 */
function renderHeaderAuthState(user) {
  const authNavContainer = document.getElementById('authNavContainer');
  if (!authNavContainer) return;

  // Mobile quick bar account button mirrors the header
  const quickbarLabel = document.getElementById('quickbarAccountLabel');
  const quickbarCount = document.getElementById('quickbarTicketCount');

  if (!user) {
    authNavContainer.innerHTML = `
      <a href="login.html" class="btn btn-primary nav-login-btn">LOGIN</a>
    `;
    if (quickbarLabel) quickbarLabel.textContent = 'Log In';
    if (quickbarCount) quickbarCount.hidden = true;
    return;
  }

  const ticketCount = OasisDB.getBookingsForUser(user).length;
  const ticketBadgeLabel = ticketCount > 0 ? `E-Tickets (${ticketCount})` : 'E-Tickets';
  if (quickbarLabel) quickbarLabel.textContent = 'E-Tickets';
  if (quickbarCount) {
    quickbarCount.textContent = ticketCount;
    quickbarCount.hidden = ticketCount === 0;
  }

  authNavContainer.innerHTML = `
    <div class="user-profile-header">
      <button id="btnHeaderETicket" class="btn-inbox-badge" title="View your e-tickets and bookings">
        ${ticketBadgeLabel}
      </button>
      <div class="user-badge" title="${esc(user.email)}">
        <span class="user-avatar">${esc(OasisUtils.initials(user.name))}</span>
        <div class="user-info d-none-mobile">
          <span class="user-name">${esc(user.name)}</span>
          <span class="user-role">Exclusive Member</span>
        </div>
      </div>
      <button id="btnLogout" class="btn btn-logout" title="Log out of your account">
        Log Out
      </button>
    </div>
  `;

  document.getElementById('btnHeaderETicket').addEventListener('click', () => {
    openETicketHistory();
  });

  document.getElementById('btnLogout').addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      OasisDB.logout();
      window.location.reload();
    }
  });
}

/**
 * 2. Hero floating card: highlights the first Best Seller in the catalog
 */
function renderHeroFeature() {
  const card = document.getElementById('heroFeatureCard');
  if (!card) return;

  const properties = OasisDB.getProperties();
  const featured = properties.find((p) => p.isBestSeller) || properties[0];
  if (!featured) {
    card.style.display = 'none';
    return;
  }

  if (featured.image) {
    document.getElementById('heroFeatureThumb').style.backgroundImage = `url("${OasisUtils.cssUrl(featured.image)}")`;
  }
  setText('heroFeatureTitle', featured.title);
}

/**
 * 3. Property catalog
 * - Guests see only the Best Seller villas; members see all villas (Best Sellers first).
 * - Members also get a quick spec summary and the Details pop-up.
 */
function renderCatalog(isAuth) {
  if (typeof isAuth !== 'boolean') isAuth = !!OasisDB.getCurrentUser();
  const catalogGrid = document.getElementById('estateCatalogGrid');
  const catalogSectionSub = document.getElementById('catalogSubtitle');
  if (!catalogGrid) return;

  const allVillas = catalogProperties();
  const bestSellers = allVillas.filter((item) => item.isBestSeller);
  const itemsToRender = isAuth ? allVillas : (bestSellers.length ? bestSellers : allVillas.slice(0, 3));

  if (catalogSectionSub) {
    catalogSectionSub.innerHTML = isAuth
      ? `All <strong>${plural(itemsToRender.length, 'private villa')}</strong> ${itemsToRender.length === 1 ? 'is' : 'are'} open to you. Click <em>Details</em> to see bedrooms, bathrooms, facilities and nightly rates.`
      : `Featuring our <strong>Best Seller</strong> private villas across Bali, available by the night.`;
  }

  if (itemsToRender.length === 0) {
    catalogGrid.innerHTML = `<p class="estate-empty">Our private collection is being refreshed. Please check back soon.</p>`;
    return;
  }

  catalogGrid.innerHTML = itemsToRender
    .map((item) => {
      const bestSellerBadge = item.isBestSeller ? `<span class="badge-best-seller">★ BEST SELLER</span>` : '';
      const tagClass = item.isBestSeller ? 'estate-tag tag-gold' : 'estate-tag';
      const tagBadge = item.tag ? `<span class="${tagClass}">${esc(item.tag)}</span>` : '';

      // Quick spec summary is for members only
      const specsSummary = isAuth
        ? `
        <div class="estate-specs-quick">
          <span>🛏️ ${esc(plural(item.bedrooms, 'Bedroom'))}</span>
          <span>🚿 ${esc(plural(item.bathrooms, 'Bathroom'))}</span>
          <span>📐 ${esc(shortArea(item.area))}</span>
        </div>
      `
        : '';

      // AOS animates the wrapper so the card's hover lift still works
      return `
        <div class="estate-item" data-aos="fade-up">
        <article class="estate-card ${item.isBestSeller ? 'card-best-seller' : ''}">
          <div class="estate-image" style="background-image: url('${esc(OasisUtils.cssUrl(item.image))}');">
            <div class="estate-badges">
              ${bestSellerBadge}
              ${tagBadge}
            </div>
          </div>
          <div class="estate-content">
            <div class="estate-top">
              <h3 class="serif">${esc(item.title)}</h3>
            </div>

            ${specsSummary}

            <div class="estate-meta">
              <span class="location">${esc(item.location)}</span>
              <span class="price-tag">${nightlyRateHtml(item.nightlyRate)}</span>
            </div>
            <div class="estate-actions">
              <button type="button" class="details-link-btn" data-estate-id="${esc(item.id)}">
                Details →
              </button>
              <button type="button" class="reserve-link-btn" data-reserve-id="${esc(item.id)}">
                ${WHATSAPP_ICON} Book
              </button>
            </div>
          </div>
        </article>
        </div>
      `;
    })
    .join('');

  catalogGrid.querySelectorAll('.details-link-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleDetailClick(btn.getAttribute('data-estate-id'));
    });
  });

  // Reserving is open to members only (requires login)
  catalogGrid.querySelectorAll('.reserve-link-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openReserveModal(btn.getAttribute('data-reserve-id'));
    });
  });
}

// Every villa, Best Sellers first; sort is stable, so the admin's order is kept inside each group
function catalogProperties() {
  return [...OasisDB.getProperties()].sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
}

/**
 * 4. Details button: guests are sent to the login page
 */
function handleDetailClick(estateId) {
  requireMember('Villa details', () => {
    const estate = OasisDB.getPropertyById(estateId);
    if (estate) openPropertyDetailModal(estate);
  });
}

/**
 * 5. Main feature buttons: guests are sent to the login page
 */
function setupFeatureButtons() {
  // "View Full Catalog" in the hero: guests must log in to view the full collection
  const btnExploreCatalog = document.getElementById('btnExploreCatalog');
  if (btnExploreCatalog) {
    btnExploreCatalog.addEventListener('click', (e) => {
      const user = OasisDB.getCurrentUser();
      if (!user) {
        e.preventDefault();
        requireMember('The full catalog', () => {});
      }
    });
  }

  // "Book a Meeting" in the hero
  const btnBookMeeting = document.getElementById('btnBookMeeting');
  if (btnBookMeeting) {
    btnBookMeeting.addEventListener('click', (e) => {
      e.preventDefault();
      requireMember('Book a Meeting', (user) => openBookMeetingModal(user));
    });
  }

  // "Schedule a Viewing" in the banner
  const btnScheduleViewing = document.getElementById('btnScheduleViewing');
  if (btnScheduleViewing) {
    btnScheduleViewing.addEventListener('click', (e) => {
      e.preventDefault();
      requireMember('Schedule a Viewing', (user) => openScheduleViewingModal(null, user));
    });
  }
}

// Runs a members-only action with the member who is signed in *now* (the session may have
// ended in another tab or been reset by the admin), or sends guests to the login page.
function requireMember(feature, action) {
  const user = OasisDB.getCurrentUser();
  if (!user) {
    window.location.href = `login.html?reason=auth_required&feature=${encodeURIComponent(feature)}`;
    return;
  }
  action(user);
}

/**
 * WhatsApp reservations, open to everyone. OASIS uses wa.me click-to-chat links, so no API key
 * is needed: WhatsApp opens a chat with the admin number and the request already typed in,
 * and the guest presses Send.
 */
const MAX_RESERVATION_NIGHTS = 365;
const MAX_RESERVATION_GUESTS = 30;

function whatsappUrl(message) {
  return `https://wa.me/${OASIS_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

function validateReservation({ property, checkIn, checkOut, guests, name }) {
  if (!property) return 'Please choose a villa.';
  if (!checkIn || !checkOut) return 'Please choose your check-in and check-out dates.';
  if (checkIn < OasisUtils.baliTodayISO()) return 'That check-in date has already passed in Bali. Please choose another date.';
  const nights = OasisUtils.nightsBetween(checkIn, checkOut);
  if (nights < 1) return 'Check-out must be at least one day after check-in.';
  if (nights > MAX_RESERVATION_NIGHTS) return `Please choose a stay of ${MAX_RESERVATION_NIGHTS} nights or fewer.`;
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_RESERVATION_GUESTS) {
    return `Please enter between 1 and ${MAX_RESERVATION_GUESTS} guests.`;
  }
  if (!name) return 'Please enter your name.';
  return '';
}

// The message the guest sends to the admin on WhatsApp
function buildReservationMessage({ property, checkIn, checkOut, guests, name, note, memberEmail }) {
  const nights = OasisUtils.nightsBetween(checkIn, checkOut);
  const rate = Number(property.nightlyRate) || 0;
  const lines = [
    '*OASIS Villa Reservation Request*',
    '',
    `Villa: ${property.title} (${property.location})`,
    `Rooms: ${plural(property.bedrooms, 'bedroom')} · ${plural(property.bathrooms, 'bathroom')}`,
    `Check-in: ${OasisUtils.formatDateShort(checkIn)}`,
    `Check-out: ${OasisUtils.formatDateShort(checkOut)}`,
    `Length of stay: ${plural(nights, 'night')}`,
    `Guests: ${guests}`,
    `Nightly rate: ${OasisUtils.formatNightlyRate(rate)}`
  ];
  if (rate > 0) lines.push(`Estimated total: ${OasisUtils.formatIdr(rate * nights)}`);
  lines.push('', `Name: ${name}`);
  if (memberEmail) lines.push(`OASIS member: ${memberEmail}`);
  if (note) lines.push(`Special requests: ${note}`);
  lines.push('', 'Is this villa available for these dates? Thank you.');
  return lines.join('\n');
}

// Follow-up for a meeting or viewing booked on the website, quoting its reference number
function buildBookingWhatsAppMessage(booking) {
  const isViewing = booking.type === 'viewing';
  return [
    `Hello OASIS, I have just ${isViewing ? 'scheduled a villa viewing' : 'booked a meeting'} on your website.`,
    '',
    `Reference: ${booking.refNo}`,
    isViewing ? `Villa: ${booking.property}` : `Consultation: ${booking.topic}`,
    `Date: ${bookingDateLabel(booking)}`,
    `Time: ${booking.time}`,
    `Name: ${booking.name}`,
    '',
    'Please confirm my booking. Thank you.'
  ].join('\n');
}

function setupReservations() {
  document.querySelectorAll('[data-open-reserve]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openReserveModal(btn.getAttribute('data-open-reserve'));
    });
  });

  const form = document.getElementById('formReserve');
  if (!form) return;

  document.getElementById('rsCheckIn').addEventListener('change', () => {
    syncReserveCheckOut();
    updateReserveSummary();
  });
  ['rsVilla', 'rsCheckOut'].forEach((id) => document.getElementById(id).addEventListener('change', updateReserveSummary));
  // Typed dates fire "input" before the picker's "change"
  ['rsCheckIn', 'rsCheckOut'].forEach((id) => document.getElementById(id).addEventListener('input', updateReserveSummary));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = OasisDB.getCurrentUser();
    if (!user) {
      window.location.href = `login.html?reason=auth_required&feature=${encodeURIComponent('Book Your Stay')}`;
      return;
    }

    const villaId = document.getElementById('rsVilla').value;
    const request = {
      property: OasisDB.getPropertyById(villaId),
      checkIn: document.getElementById('rsCheckIn').value,
      checkOut: document.getElementById('rsCheckOut').value,
      guests: Number(document.getElementById('rsGuests').value),
      name: document.getElementById('rsName').value.trim(),
      note: document.getElementById('rsNote').value.trim(),
      memberEmail: user ? user.email : ''
    };

    const error = validateReservation(request);
    if (error) {
      showFormError('rsError', error);
      return;
    }
    showFormError('rsError', '');

    const message = buildReservationMessage(request);
    const url = whatsappUrl(message);
    window.open(url, '_blank', 'noopener');
    showReservationReady(message, url);
  });
}

function openReserveModal(preselectedId) {
  requireMember('Book Your Stay', (user) => {
    const modal = document.getElementById('reserveModal');
    if (!modal) return;

    const villas = catalogProperties();
    const select = document.getElementById('rsVilla');
    const keep = preselectedId || select.value;
    select.innerHTML = villas.length
      ? `<option value="">Choose a villa…</option>` +
        villas
          .map((p) => `<option value="${esc(p.id)}">${esc(p.title)} (${esc(p.location)} – ${esc(OasisUtils.formatNightlyRate(p.nightlyRate))})</option>`)
          .join('')
      : '<option value="">No villas available right now</option>';
    if (villas.some((p) => p.id === keep)) select.value = keep;

    const nameInput = document.getElementById('rsName');
    if (user && !nameInput.value) nameInput.value = user.name;

    const checkIn = document.getElementById('rsCheckIn');
    checkIn.min = OasisUtils.baliTodayISO();
    if (checkIn.value && checkIn.value < checkIn.min) checkIn.value = '';
    syncReserveCheckOut();
    updateReserveSummary();
    showFormError('rsError', '');

    openModal(modal);
  });
}

// Check-out is at least one night after check-in; moves forward when check-in passes it
function syncReserveCheckOut() {
  const checkIn = document.getElementById('rsCheckIn').value;
  const checkOut = document.getElementById('rsCheckOut');
  const earliest = OasisUtils.addDaysISO(checkIn || OasisUtils.baliTodayISO(), 1);
  checkOut.min = earliest;
  if (checkIn && (!checkOut.value || checkOut.value < earliest)) checkOut.value = earliest;
}

function updateReserveSummary() {
  const summary = document.getElementById('rsSummary');
  if (!summary) return;

  const property = OasisDB.getPropertyById(document.getElementById('rsVilla').value);
  const nights = OasisUtils.nightsBetween(document.getElementById('rsCheckIn').value, document.getElementById('rsCheckOut').value);
  if (!property || nights < 1) {
    summary.innerHTML = '<span>Choose a villa and your dates to see the estimated total.</span>';
    return;
  }

  const rate = Number(property.nightlyRate) || 0;
  summary.innerHTML =
    rate > 0
      ? `<span>Estimated total · ${esc(plural(nights, 'night'))} × ${esc(OasisUtils.formatIdr(rate))}</span><strong>${esc(OasisUtils.formatIdr(rate * nights))}</strong>`
      : `<span>${esc(plural(nights, 'night'))}</span><strong>Rate on request</strong>`;
}

function showReservationReady(message, url) {
  closeAllModals();
  setText('rsPreview', message);
  document.getElementById('rsOpenWhatsApp').href = url;
  openModal(document.getElementById('reserveReadyModal'));
}

/**
 * Concierge (customer service): the floating help button opens a panel with answers about
 * OASIS and this website, plus quick ways to book or to ask the team on WhatsApp.
 */
function setupConcierge() {
  const fab = document.getElementById('csFab');
  const panel = document.getElementById('csPanel');
  if (!fab || !panel) return;

  document.getElementById('csAskWhatsApp').href = whatsappUrl('Hello OASIS, I have a question about your villas:\n\n');

  fab.addEventListener('click', () => (panel.hidden ? openConcierge() : closeConcierge(true)));
  document.getElementById('csClose').addEventListener('click', () => closeConcierge(true));
  document.getElementById('csBookStay').addEventListener('click', () => {
    closeConcierge(true);
    openReserveModal('');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden && !document.querySelector('.modal-overlay.active')) closeConcierge(true);
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !fab.contains(e.target)) closeConcierge(false);
  });
}

function openConcierge() {
  const panel = document.getElementById('csPanel');
  renderConciergeFacts();
  panel.hidden = false;
  document.getElementById('csFab').setAttribute('aria-expanded', 'true');
  panel.focus({ preventScroll: true });
}

function closeConcierge(returnFocus) {
  const panel = document.getElementById('csPanel');
  const fab = document.getElementById('csFab');
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  fab.setAttribute('aria-expanded', 'false');
  if (returnFocus) fab.focus({ preventScroll: true });
}

// Answers that depend on the live catalog (the admin can change villas and rates)
function renderConciergeFacts() {
  const villas = OasisDB.getProperties();
  const locations = [...new Set(villas.map((p) => String(p.location || '').trim()).filter(Boolean))];
  if (villas.length) {
    setText('csVillaSummary', `${plural(villas.length, 'villa')}${locations.length ? ` in ${joinList(locations)}` : ''}`);
  }

  const rates = villas.map((p) => Number(p.nightlyRate) || 0).filter((rate) => rate > 0);
  const low = Math.min(...rates);
  const high = Math.max(...rates);
  setText(
    'csRateRange',
    rates.length === 0
      ? 'Nightly rates are available on request.'
      : low === high
        ? `Our villas are ${OasisUtils.formatIdr(low)} per night.`
        : `Nightly rates run from ${OasisUtils.formatIdr(low)} to ${OasisUtils.formatIdr(high)}, depending on the villa and its facilities.`
  );
}

// ["Ubud", "Canggu", "Seminyak"] -> "Ubud, Canggu and Seminyak"
function joinList(items) {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

// Points a "Confirm on WhatsApp" link at the admin chat for this booking
function setBookingWhatsAppLink(linkId, booking) {
  const link = document.getElementById(linkId);
  if (link) link.href = whatsappUrl(buildBookingWhatsAppMessage(booking));
}

/**
 * Guest testimonials: published reviews, newest first. Members can add and delete their own.
 */
const TESTIMONIALS_INITIAL = 6;
const RATING_WORDS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Exceptional' };
let showAllTestimonials = false;

function renderTestimonials({ animate = false } = {}) {
  const grid = document.getElementById('testimonialGrid');
  const btnShowAll = document.getElementById('btnShowAllReviews');
  if (!grid) return;

  const currentUser = OasisDB.getCurrentUser();
  const reviews = OasisDB.getPublishedTestimonials();
  const visible = showAllTestimonials ? reviews : reviews.slice(0, TESTIMONIALS_INITIAL);

  if (btnShowAll) {
    btnShowAll.hidden = reviews.length <= TESTIMONIALS_INITIAL;
    btnShowAll.textContent = showAllTestimonials ? 'Show fewer reviews' : `Show all ${reviews.length} reviews`;
  }

  if (visible.length === 0) {
    grid.innerHTML = `<p class="estate-empty">No reviews yet. Be the first to share your stay.</p>`;
    return;
  }

  grid.innerHTML = visible
    .map((t, idx) => {
      const rating = Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5)));
      const isOwn = !!currentUser && t.userId === currentUser.id;
      // Only the first render animates; later re-renders must never start hidden
      const aos = animate ? ` data-aos="fade-up" data-aos-delay="${Math.min(idx, 2) * 100 + 100}"` : '';
      const place = t.city ? `<small>${esc(t.city)}</small>` : '';
      const stay = `${esc(t.villa)} &bull; ${esc(plural(t.nights, 'night')).replace(' ', '&nbsp;')}`;

      return `
        <div class="testimonial-item"${aos}>
        <figure class="testimonial-card${isOwn ? ' is-own' : ''}" data-review-id="${esc(t.id)}">
          <div class="testimonial-top">
            <div class="testimonial-stars" role="img" aria-label="Rated ${rating} out of 5">${'★'.repeat(rating)}<span class="star-off">${'★'.repeat(5 - rating)}</span></div>
            ${isOwn ? '<span class="testimonial-own-badge">Your review</span>' : ''}
          </div>
          <blockquote class="testimonial-quote">${esc(t.text)}</blockquote>
          <figcaption class="testimonial-author">
            <span class="testimonial-avatar" aria-hidden="true">${esc(OasisUtils.initials(t.name))}</span>
            <span>
              <strong>${esc(t.name)}</strong>
              ${place}
              <small>${stay}</small>
            </span>
          </figcaption>
          ${isOwn ? `<button type="button" class="testimonial-delete" data-delete-review="${esc(t.id)}">Delete my review</button>` : ''}
        </figure>
        </div>
      `;
    })
    .join('');
}

function setupTestimonials() {
  const btnShare = document.getElementById('btnShareStay');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      requireMember('Sharing your stay', (user) => openReviewModal(user));
    });
  }

  const btnShowAll = document.getElementById('btnShowAllReviews');
  if (btnShowAll) {
    btnShowAll.addEventListener('click', () => {
      showAllTestimonials = !showAllTestimonials;
      renderTestimonials();
    });
  }

  // Members can delete their own review
  const grid = document.getElementById('testimonialGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-delete-review]');
      if (!btn) return;
      const user = OasisDB.getCurrentUser();
      const review = OasisDB.getTestimonials().find((t) => t.id === btn.getAttribute('data-delete-review'));
      if (!user || !review || review.userId !== user.id) return;
      if (!confirm('Delete your review? This cannot be undone.')) return;
      const deleted = OasisDB.deleteTestimonial(review.id);
      renderTestimonials();
      showToast(deleted ? 'Your review has been deleted.' : 'Your review could not be deleted. Please try again.');
    });
  }

  // Star rating: light up to the hovered / chosen star
  const stars = document.getElementById('rvStars');
  if (stars) {
    const chosen = () => {
      const checked = stars.querySelector('input:checked');
      return checked ? Number(checked.value) : 0;
    };
    const show = (value) => {
      stars.setAttribute('data-show', String(value));
      document.getElementById('rvStarsText').textContent = RATING_WORDS[value] || '';
    };
    stars.addEventListener('change', () => show(chosen()));
    stars.querySelectorAll('label').forEach((label) => {
      label.addEventListener('mouseenter', () => show(Number(document.getElementById(label.htmlFor).value)));
    });
    stars.addEventListener('mouseleave', () => show(chosen()));
  }

  // Live character counter
  const text = document.getElementById('rvText');
  if (text) {
    text.addEventListener('input', updateReviewCounter);
  }

  const form = document.getElementById('formReview');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const user = OasisDB.getCurrentUser();
      if (!user) {
        window.location.href = 'login.html?reason=auth_required&feature=Sharing+your+stay';
        return;
      }

      const checked = form.querySelector('input[name="rvRating"]:checked');
      const result = OasisDB.addTestimonial({
        userId: user.id,
        rating: checked ? Number(checked.value) : 0,
        propertyId: document.getElementById('rvVilla').value,
        nights: Number(document.getElementById('rvNights').value),
        text: document.getElementById('rvText').value,
        name: document.getElementById('rvName').value,
        city: document.getElementById('rvCity').value
      });

      if (!result.success) {
        showFormError('rvError', result.message);
        return;
      }

      closeAllModals();
      form.reset();
      showAllTestimonials = false;
      renderTestimonials();
      showToast(result.message);

      const card = document.querySelector(`[data-review-id="${result.testimonial.id}"]`);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function openReviewModal(currentUser) {
  const modal = document.getElementById('reviewModal');
  if (!modal) return;

  const properties = OasisDB.getProperties();
  document.getElementById('rvVilla').innerHTML = properties.length
    ? `<option value="">Choose a villa…</option>` + properties.map((p) => `<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('')
    : '<option value="">No villas available right now</option>';

  const nameInput = document.getElementById('rvName');
  if (currentUser && !nameInput.value) nameInput.value = OasisUtils.shortName(currentUser.name);

  // Default to 5 stars when nothing is chosen yet
  const stars = document.getElementById('rvStars');
  if (!stars.querySelector('input:checked')) document.getElementById('rvRating5').checked = true;
  const chosen = Number(stars.querySelector('input:checked').value);
  stars.setAttribute('data-show', String(chosen));
  document.getElementById('rvStarsText').textContent = RATING_WORDS[chosen];

  updateReviewCounter();
  showFormError('rvError', '');
  openModal(modal);
}

function updateReviewCounter() {
  const length = document.getElementById('rvText').value.trim().length;
  const counter = document.getElementById('rvTextCount');
  counter.textContent = `${length} / 500 characters (minimum 20)`;
  counter.classList.toggle('is-short', length > 0 && length < 20);
}

/**
 * Mobile & tablet navigation: hamburger menu (≤ 980px) and quick-action bar (≤ 720px)
 */
function setupMobileNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('navToggle');
  if (!header || !toggle) return;

  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));

  // Close after choosing a link or an account action, on Esc, on an outside click,
  // and when the screen grows back to desktop size
  document.querySelectorAll('.nav-menu a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.getElementById('authNavContainer').addEventListener('click', (e) => {
    if (e.target.closest('a, button')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) setOpen(false);
  });
  const desktop = window.matchMedia('(min-width: 981px)');
  const onResize = (e) => {
    if (e.matches) setOpen(false);
  };
  if (desktop.addEventListener) desktop.addEventListener('change', onResize);
  else desktop.addListener(onResize);
}

function setupMobileQuickbar() {
  const bar = document.getElementById('mobileQuickbar');
  if (!bar) return;

  bar.addEventListener('click', (e) => {
    const item = e.target.closest('[data-quick]');
    if (!item) return;

    switch (item.getAttribute('data-quick')) {
      case 'meeting':
        requireMember('Book a Meeting', (user) => openBookMeetingModal(user));
        break;
      case 'viewing':
        requireMember('Schedule a Viewing', (user) => openScheduleViewingModal(null, user));
        break;
      case 'account':
        if (OasisDB.getCurrentUser()) openETicketHistory();
        else window.location.href = 'login.html';
        break;
      default:
        // "Villas" and "Reviews" are plain anchor links
        break;
    }
  });
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('siteToast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

/**
 * 6. Modals (Book Meeting, Schedule Viewing, Property Detail, success pop-ups, confirmation email)
 */
function setupModals() {
  // Close buttons
  document.querySelectorAll('.modal-overlay .modal-close, .modal-close-trigger').forEach((btn) => {
    btn.addEventListener('click', closeAllModals);
  });

  // Click outside the dialog to close
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Esc closes any open modal; Tab stays inside it
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.modal-overlay.active')) {
      closeAllModals();
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  });

  // Dialog semantics for screen readers
  document.querySelectorAll('.modal-overlay .modal-dialog').forEach((dialog, i) => {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('tabindex', '-1');
    const title = dialog.querySelector('.modal-title, .pd-title');
    if (title) {
      if (!title.id) title.id = `modalTitle${i}`;
      dialog.setAttribute('aria-labelledby', title.id);
    } else {
      dialog.setAttribute('aria-label', 'Confirmation email');
    }
  });

  // Grey out sessions that have already started today (Bali time)
  [
    ['bmDate', 'bmTime'],
    ['svDate', 'svTimeSlot']
  ].forEach(([dateId, slotId]) => {
    const dateInput = document.getElementById(dateId);
    if (dateInput) {
      // "input" covers typing a date, "change" covers the date picker
      ['input', 'change'].forEach((evt) => dateInput.addEventListener(evt, () => updateSlotAvailability(dateId, slotId)));
    }
  });

  // Book Meeting submit
  const formBookMeeting = document.getElementById('formBookMeeting');
  if (formBookMeeting) {
    formBookMeeting.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentUser = OasisDB.getCurrentUser();
      if (!currentUser) {
        window.location.href = 'login.html?reason=auth_required&feature=Book+a+Meeting';
        return;
      }

      const name = document.getElementById('bmName').value.trim();
      const email = document.getElementById('bmEmail').value.trim();
      const date = document.getElementById('bmDate').value;
      const time = document.getElementById('bmTime').value;
      const topicSelect = document.getElementById('bmTopic');
      const topic = topicSelect.options[topicSelect.selectedIndex].text;

      if (!name || !email) {
        showFormError('bmError', 'Please enter your name and email address.');
        return;
      }
      const scheduleError = validateSchedule(date, time);
      if (scheduleError) {
        showFormError('bmError', scheduleError);
        return;
      }
      showFormError('bmError', '');

      const refNo = OasisDB.generateRefNo('OASIS-MTG');
      const bookingRecord = OasisDB.addBooking({
        id: refNo,
        refNo,
        type: 'meeting',
        typeLabel: 'Meeting',
        title: `Consultation: ${topic}`,
        userId: currentUser.id,
        name,
        email,
        date: OasisUtils.formatDateLong(date),
        rawDate: date,
        time,
        topic,
        property: topic,
        guests: '1 Guest (Private Client)',
        advisorOrHost: OASIS_CONTACT.advisor
      });
      if (!bookingRecord) {
        showFormError('bmError', STORAGE_FULL_MESSAGE);
        return;
      }

      showBookingSuccessPopup(bookingRecord);
      formBookMeeting.reset();
    });
  }

  // "Open Confirmation Email" inside the meeting success pop-up
  const btnViewEmail = document.getElementById('btnViewEmailConfirmation');
  if (btnViewEmail) {
    btnViewEmail.addEventListener('click', () => {
      if (lastMeetingBooking) {
        showEmailConfirmation(lastMeetingBooking);
      }
    });
  }

  // Schedule Viewing submit
  const formScheduleViewing = document.getElementById('formScheduleViewing');
  if (formScheduleViewing) {
    formScheduleViewing.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentUser = OasisDB.getCurrentUser();
      if (!currentUser) {
        window.location.href = 'login.html?reason=auth_required&feature=Schedule+a+Viewing';
        return;
      }

      const estate = OasisDB.getPropertyById(document.getElementById('svEstate').value);
      const date = document.getElementById('svDate').value;
      const timeSlot = document.getElementById('svTimeSlot').value;
      const name = document.getElementById('svName').value.trim();
      const email = document.getElementById('svEmail').value.trim();
      const guests = document.getElementById('svGuests').value;

      if (!estate) {
        showFormError('svError', 'Please choose a property to view.');
        return;
      }
      if (!name || !email) {
        showFormError('svError', 'Please enter your name and email address.');
        return;
      }
      const scheduleError = validateSchedule(date, timeSlot);
      if (scheduleError) {
        showFormError('svError', scheduleError);
        return;
      }
      showFormError('svError', '');

      const vsRefNo = OasisDB.generateRefNo('OASIS-VISIT');
      const guestsLabel = `${guests} (Private Chauffeur & Refreshments)`;
      const viewingRecord = OasisDB.addBooking({
        id: vsRefNo,
        refNo: vsRefNo,
        type: 'viewing',
        typeLabel: 'Villa Viewing',
        title: `Viewing: ${estate.title}`,
        userId: currentUser.id,
        name,
        email,
        date: OasisUtils.formatDateLong(date),
        rawDate: date,
        time: timeSlot,
        topic: `Private viewing of ${estate.title}`,
        property: estate.title,
        propertyId: estate.id,
        guests: guestsLabel,
        advisorOrHost: 'Dedicated VIP Site Host & Private Chauffeur'
      });
      if (!viewingRecord) {
        showFormError('svError', STORAGE_FULL_MESSAGE);
        return;
      }

      // Fill the viewing confirmation pop-up
      setText('vsRefNo', vsRefNo);
      setText('vsProperty', estate.title);
      setText('vsName', name);
      setText('vsEmail', email);
      setText('vsDate', viewingRecord.date);
      setText('vsTimeSlot', timeSlot);
      setText('vsGuests', guestsLabel);
      setText('vsBarcodeNum', `${vsRefNo}-VERIFIED-PASS`);
      setBookingWhatsAppLink('btnWhatsAppViewing', viewingRecord);

      closeAllModals();
      const btnPrintViewing = document.getElementById('btnPrintViewingTicket');
      if (btnPrintViewing) {
        btnPrintViewing.onclick = () => {
          printETicket(document.getElementById('oasisViewingETicket'));
        };
      }
      openModal(document.getElementById('viewingSuccessModal'));

      // Refresh the navbar so the e-ticket counter updates
      renderHeaderAuthState(currentUser);

      formScheduleViewing.reset();
    });
  }
}

/**
 * Bali-time schedule guards
 */
function updateSlotAvailability(dateId, slotId) {
  const dateInput = document.getElementById(dateId);
  const slotSelect = document.getElementById(slotId);
  if (!dateInput || !slotSelect) return;

  const isToday = dateInput.value === OasisUtils.baliTodayISO();
  const nowMinutes = OasisUtils.baliNowMinutes();
  const options = Array.from(slotSelect.options);

  options.forEach((option) => {
    const start = OasisUtils.slotStartMinutes(option.value);
    option.disabled = isToday && start !== null && start <= nowMinutes;
  });

  // Move off a session that has just become unavailable
  const selected = slotSelect.options[slotSelect.selectedIndex];
  if (selected && selected.disabled) {
    const firstOpen = options.find((o) => !o.disabled);
    if (firstOpen) slotSelect.value = firstOpen.value;
  }
}

function validateSchedule(dateValue, slotValue) {
  const today = OasisUtils.baliTodayISO();

  if (!dateValue) {
    return 'Please choose a date.';
  }
  if (dateValue < today) {
    return 'That date has already passed in Bali. Please choose another date.';
  }
  if (dateValue === today) {
    const start = OasisUtils.slotStartMinutes(slotValue);
    if (start !== null && start <= OasisUtils.baliNowMinutes()) {
      return 'That session has already started in Bali (WITA). Please choose a later session or another date.';
    }
  }
  return '';
}

function showFormError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.hidden = !message;
}

/**
 * E-ticket history (meetings & viewings) for the logged-in member
 */
function openETicketHistory() {
  const currentUser = OasisDB.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html?reason=auth_required&feature=E-Tickets';
    return;
  }

  const allBookings = OasisDB.getBookingsForUser(currentUser);
  closeAllModals();

  if (allBookings.length === 0) {
    const modalEmpty = document.getElementById('emptyETicketModal');
    if (!modalEmpty) return;

    document.getElementById('btnBookFromEmptyETicket').onclick = () => {
      closeAllModals();
      openBookMeetingModal(currentUser);
    };
    document.getElementById('btnViewFromEmptyETicket').onclick = () => {
      closeAllModals();
      openScheduleViewingModal(null, currentUser);
    };
    openModal(modalEmpty);
    return;
  }

  const modalHistory = document.getElementById('eTicketHistoryModal');
  if (!modalHistory) return;

  // Count per category
  setText('countAll', allBookings.length);
  setText('countMeeting', allBookings.filter((b) => b.type === 'meeting').length);
  setText('countViewing', allBookings.filter((b) => b.type === 'viewing').length);

  let currentFilter = 'all';

  function renderFilteredHistory() {
    const listContainer = document.getElementById('historyListContainer');
    const previewContainer = document.getElementById('historyTicketPreviewWrap');
    if (!listContainer || !previewContainer) return;

    const filtered = currentFilter === 'all' ? allBookings : allBookings.filter((b) => b.type === currentFilter);

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="history-empty-state">
          <p>No bookings in this category yet.</p>
        </div>
      `;
      previewContainer.innerHTML = '';
      return;
    }

    listContainer.innerHTML = filtered
      .map((item, idx) => {
        const isViewing = item.type === 'viewing';
        const status = bookingStatus(item);
        const typeBadge = isViewing
          ? `<span class="history-type-badge badge-viewing">VILLA VIEWING</span>`
          : `<span class="history-type-badge badge-meeting">MEETING</span>`;
        const titleText = isViewing ? item.property || item.title : item.topic || item.title;
        const statusBadge =
          status === 'confirmed' ? '' : `<span class="history-status status-${status}">${OasisDB.BOOKING_STATUSES[status]}</span>`;

        return `
          <div class="history-item-card ${idx === 0 ? 'active' : ''}" data-ref="${esc(item.refNo)}">
            <div class="history-item-top">
              ${typeBadge}
              <span class="history-item-ref">${esc(item.refNo)}</span>
            </div>
            <h4 class="history-item-title serif">${esc(titleText)}</h4>
            <div class="history-item-meta">
              <span>📅 ${esc(bookingDateLabel(item))}</span>
              <span>⏰ ${esc(item.time)}</span>
              ${statusBadge}
            </div>
          </div>
        `;
      })
      .join('');

    // Preview the first item by default
    renderTicketPreview(filtered[0]);

    listContainer.querySelectorAll('.history-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        listContainer.querySelectorAll('.history-item-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const selectedBooking = allBookings.find((b) => b.refNo === card.getAttribute('data-ref'));
        if (selectedBooking) {
          renderTicketPreview(selectedBooking);
        }
      });
    });
  }

  function renderTicketPreview(item) {
    const previewContainer = document.getElementById('historyTicketPreviewWrap');
    if (!previewContainer || !item) return;

    const isViewing = item.type === 'viewing';
    const status = bookingStatus(item);
    const passHeader = isViewing ? 'OASIS SITE VISIT' : 'OASIS VILLAS';
    const passSub = isViewing ? 'EXCLUSIVE VILLA VIEWING PASS' : 'PRIVATE CONSULTATION &bull; VIP PASS';
    const topicLabel = isViewing ? 'VILLA' : 'CONSULTATION FOCUS';
    const topicVal = isViewing ? item.property || item.topic : item.topic || item.title;
    const advisorLabel = isViewing ? 'GUESTS & SERVICES' : 'VILLA SPECIALIST & VENUE';
    const advisorVal = isViewing
      ? esc(item.guests || '1–2 Guests (Private Chauffeur & Refreshments)')
      : 'Alexander Wright (Senior Villa Specialist) &bull; Private VIP Lounge, Seminyak, Bali / Online VIP Room';

    previewContainer.innerHTML = `
      <div class="oasis-eticket eticket-in-history" id="activeHistoryETicket">
        <div class="eticket-top">
          <div class="eticket-brand">
            <span class="eticket-logo serif">O</span>
            <div>
              <div class="eticket-brand-title serif">${passHeader}</div>
              <div class="eticket-brand-sub">${passSub}</div>
            </div>
          </div>
          <div class="eticket-pass-meta">
            <span class="eticket-pass-tag status-${status}">${OasisDB.BOOKING_STATUSES[status].toUpperCase()}</span>
            <div class="eticket-ref-code">${esc(item.refNo)}</div>
          </div>
        </div>

        <div class="eticket-divider">
          <span class="eticket-notch notch-left"></span>
          <span class="eticket-line"></span>
          <span class="eticket-notch notch-right"></span>
        </div>

        <div class="eticket-body">
          <div class="eticket-grid">
            <div class="eticket-col">
              <span class="eticket-field-label">CLIENT NAME</span>
              <strong class="eticket-field-val">${esc(item.name)}</strong>
            </div>
            <div class="eticket-col">
              <span class="eticket-field-label">CONFIRMATION EMAIL</span>
              <span class="eticket-field-val">${esc(item.email)}</span>
            </div>
            <div class="eticket-col">
              <span class="eticket-field-label">DATE</span>
              <strong class="eticket-field-val highlight">${esc(bookingDateLabel(item))}</strong>
            </div>
            <div class="eticket-col">
              <span class="eticket-field-label">SESSION (BALI TIME)</span>
              <strong class="eticket-field-val highlight">${esc(item.time)}</strong>
            </div>
            <div class="eticket-col eticket-col-full">
              <span class="eticket-field-label">${topicLabel}</span>
              <strong class="eticket-field-val highlight">${esc(topicVal)}</strong>
            </div>
            <div class="eticket-col eticket-col-full">
              <span class="eticket-field-label">${advisorLabel}</span>
              <span class="eticket-field-val">${advisorVal}</span>
            </div>
          </div>

          <div class="eticket-barcode-row">
            <div class="barcode-block">
              <div class="barcode-graphic"></div>
              <span class="barcode-text">${esc(item.refNo)}-VERIFIED-PASS</span>
            </div>
            <div class="eticket-seal">
              <div class="seal-inner">
                <span>OFFICIAL</span>
                <strong>OASIS</strong>
                <small>${isViewing ? 'VISIT' : 'VILLAS'}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="history-ticket-actions">
        <button type="button" class="btn btn-secondary-dark" id="btnPrintSelectedTicket">
          Print This E-Ticket
        </button>
        ${!isViewing ? `<button type="button" class="btn btn-primary" id="btnViewEmailSelected">Open Confirmation Email</button>` : ''}
        <a class="btn btn-whatsapp" href="${esc(whatsappUrl(buildBookingWhatsAppMessage(item)))}" target="_blank" rel="noopener">
          ${WHATSAPP_ICON} Chat on WhatsApp
        </a>
      </div>
    `;

    document.getElementById('btnPrintSelectedTicket').onclick = () => {
      printETicket(document.getElementById('activeHistoryETicket'));
    };

    const btnEmail = document.getElementById('btnViewEmailSelected');
    if (btnEmail) {
      btnEmail.onclick = () => {
        showEmailConfirmation(item);
      };
    }
  }

  // Tab filters; always reopen on "All"
  document.querySelectorAll('.history-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
    btn.onclick = () => {
      document.querySelectorAll('.history-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderFilteredHistory();
    };
  });

  renderFilteredHistory();
  openModal(modalHistory);
}

/**
 * Meeting booked: show the success pop-up with its official e-ticket
 */
function showBookingSuccessPopup(booking) {
  closeAllModals();
  lastMeetingBooking = booking;

  setText('etRefNo', booking.refNo);
  setText('etClientName', booking.name);
  setText('etEmail', booking.email);
  setText('etDate', bookingDateLabel(booking));
  setText('etTime', booking.time);
  setText('etTopic', booking.topic);
  setText('etBarcodeNum', `${booking.refNo}-VERIFIED-PASS`);
  setText('bsSentEmail', booking.email);
  setBookingWhatsAppLink('btnWhatsAppMeeting', booking);

  const btnPrintTicket = document.getElementById('btnPrintTicket');
  if (btnPrintTicket) {
    btnPrintTicket.onclick = () => {
      printETicket(document.getElementById('oasisETicket'));
    };
  }

  openModal(document.getElementById('bookingSuccessModal'));

  // Refresh the navbar so the e-ticket counter updates
  renderHeaderAuthState(OasisDB.getCurrentUser());
}

/**
 * Print utilities: one clean A4 page with just the e-ticket
 */
function preparePrintTicket(sourceElement) {
  if (!sourceElement) return;
  let printTarget = document.getElementById('oasisPrintTarget');
  if (!printTarget) {
    printTarget = document.createElement('div');
    printTarget.id = 'oasisPrintTarget';
    printTarget.className = 'oasis-print-target';
    document.body.appendChild(printTarget);
  }

  printTarget.innerHTML = '';
  const clone = sourceElement.cloneNode(true);
  clone.removeAttribute('id');
  printTarget.appendChild(clone);

  const printNotice = document.createElement('div');
  printNotice.className = 'print-ticket-footer';
  printNotice.innerHTML = `
    <span>OASIS RESIDENCES &bull; OFFICIAL LUXURY E-PASS &bull; VERIFIED ENTRY</span>
    <small>This document is your official OASIS private reservation. All times are Bali time (WITA, UTC+8). Please present it to the concierge or site host on arrival.</small>
  `;
  printTarget.appendChild(printNotice);

  // Print CSS only hides the page while a ticket is being printed
  document.documentElement.classList.add('printing-ticket');
}

function printETicket(sourceElement) {
  if (!sourceElement) return;
  preparePrintTicket(sourceElement);
  window.print();
}

// Ctrl + P / Cmd + P while a ticket is open prints that ticket; otherwise the page prints normally
window.addEventListener('beforeprint', () => {
  const printTarget = document.getElementById('oasisPrintTarget');
  if (!printTarget || printTarget.children.length === 0) {
    const activeModalTicket = document.querySelector('.modal-overlay.active .oasis-eticket');
    if (activeModalTicket) {
      preparePrintTicket(activeModalTicket);
    }
  }
});

window.addEventListener('afterprint', () => {
  const printTarget = document.getElementById('oasisPrintTarget');
  if (printTarget) {
    printTarget.innerHTML = '';
  }
  document.documentElement.classList.remove('printing-ticket');
});

/**
 * Confirmation email preview, addressed to the email on the booking
 */
function showEmailConfirmation(booking) {
  closeAllModals();
  const dateLabel = bookingDateLabel(booking);

  setText('emRecipient', `${booking.name} <${booking.email}>`);
  setText('emClientName', booking.name);
  setText('emTableRef', booking.refNo);
  setText('emTableDate', dateLabel);
  setText('emTableTime', booking.time);
  setText('emTableTopic', booking.topic);
  setText('emTimestamp', OasisUtils.formatBaliDateTime(booking.createdAt));

  // Mailto button: opens the same letter in the member's own email app
  const mailtoSubject = encodeURIComponent(`Official Confirmation: OASIS Private Stay Consultation [Ref: ${booking.refNo}]`);
  const mailtoBody = encodeURIComponent(
    `Dear ${booking.name},\n\n` +
      `Thank you for booking a private stay consultation with OASIS Luxury Villas.\n\n` +
      `OFFICIAL CONSULTATION DETAILS:\n` +
      `- Reference Number: ${booking.refNo}\n` +
      `- Date: ${dateLabel}\n` +
      `- Time: ${booking.time}\n` +
      `- Consultation Focus: ${booking.topic}\n` +
      `- Villa Specialist: ${OASIS_CONTACT.advisor}\n` +
      `- Format: ${OASIS_CONTACT.venue}\n\n` +
      `All times are Bali time (WITA, UTC+8).\n` +
      `This confirmation was issued automatically for: ${booking.email}\n\n` +
      `Concierge (phone & WhatsApp): ${OASIS_CONTACT.phone}\n` +
      `Email: ${OASIS_CONTACT.email}\n\n` +
      `Warm regards,\n` +
      `OASIS Guest Relations`
  );

  const btnOpenMailto = document.getElementById('btnOpenMailto');
  if (btnOpenMailto) {
    btnOpenMailto.href = `mailto:${encodeURIComponent(booking.email)}?subject=${mailtoSubject}&body=${mailtoBody}`;
  }

  openModal(document.getElementById('emailConfirmationModal'));
}

/**
 * Helpers
 */
function bookingDateLabel(booking) {
  return booking.rawDate ? OasisUtils.formatDateLong(booking.rawDate) : booking.date || '-';
}

function bookingStatus(booking) {
  return OasisDB.BOOKING_STATUSES[booking.status] ? booking.status : 'confirmed';
}

function plural(count, word) {
  const n = Number(count) || 0;
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// Card price: "Rp 4,700,000 / night" with the unit set smaller
function nightlyRateHtml(rate) {
  return Number(rate) > 0 ? `${esc(OasisUtils.formatIdr(rate))}<small> / night</small>` : 'Rate on request';
}

// "910 m² (9,800 sq ft)" -> "910 m²"
function shortArea(area) {
  return String(area || '-').split('(')[0].trim();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value == null ? '' : value;
}

// Element that opened the first modal in a chain; focus returns here on close
let modalReturnFocus = null;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function closeAllModals() {
  const wasOpen = !!document.querySelector('.modal-overlay.active');
  document.querySelectorAll('.modal-overlay').forEach((m) => {
    m.classList.remove('active');
  });
  document.body.style.overflow = '';
  if (wasOpen && modalReturnFocus && modalReturnFocus.isConnected) {
    modalReturnFocus.focus({ preventScroll: true });
  }
}

function openModal(modalElement) {
  if (!modalElement) return;
  const active = document.activeElement;
  if (active && !active.closest('.modal-overlay')) modalReturnFocus = active;

  modalElement.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Move focus into the dialog (the dialog itself, so phones don't pop up the keyboard)
  const dialog = modalElement.querySelector('.modal-dialog');
  if (dialog) dialog.focus({ preventScroll: true });
}

// Keep Tab / Shift+Tab inside the open dialog
function trapFocus(e) {
  const dialog = document.querySelector('.modal-overlay.active .modal-dialog');
  if (!dialog) return;

  const focusables = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
  if (focusables.length === 0) {
    e.preventDefault();
    dialog.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const current = document.activeElement;
  const inside = dialog.contains(current) && current !== dialog;

  if (e.shiftKey && (!inside || current === first)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (!inside || current === last)) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * Book a Meeting form
 */
function openBookMeetingModal(currentUser) {
  const modal = document.getElementById('bookMeetingModal');
  if (!modal) return;

  if (currentUser) {
    document.getElementById('bmName').value = currentUser.name;
    document.getElementById('bmEmail').value = currentUser.email;
  }

  const dateInput = document.getElementById('bmDate');
  dateInput.min = OasisUtils.baliTodayISO();
  if (dateInput.value && dateInput.value < dateInput.min) dateInput.value = '';
  updateSlotAvailability('bmDate', 'bmTime');
  showFormError('bmError', '');

  openModal(modal);
}

/**
 * Schedule a Viewing form
 */
function openScheduleViewingModal(preselectedEstateId, currentUser) {
  const modal = document.getElementById('scheduleViewingModal');
  if (!modal) return;

  const properties = OasisDB.getProperties();
  const select = document.getElementById('svEstate');
  select.innerHTML = properties.length
    ? properties
        .map(
          (e) =>
            `<option value="${esc(e.id)}" ${e.id === preselectedEstateId ? 'selected' : ''}>${esc(e.title)} (${esc(e.location)} – ${esc(OasisUtils.formatNightlyRate(e.nightlyRate))})</option>`
        )
        .join('')
    : '<option value="">No properties available right now</option>';

  if (currentUser) {
    document.getElementById('svName').value = currentUser.name;
    document.getElementById('svEmail').value = currentUser.email;
  }

  const dateInput = document.getElementById('svDate');
  dateInput.min = OasisUtils.baliTodayISO();
  if (dateInput.value && dateInput.value < dateInput.min) dateInput.value = '';
  updateSlotAvailability('svDate', 'svTimeSlot');
  showFormError('svError', '');

  openModal(modal);
}

/**
 * Property detail modal (bedrooms, bathrooms, area, garage, facilities)
 */
function openPropertyDetailModal(estate) {
  const modal = document.getElementById('propertyDetailModal');
  if (!modal) return;

  document.getElementById('pdImage').style.backgroundImage = estate.image ? `url("${OasisUtils.cssUrl(estate.image)}")` : '';
  setText('pdTitle', estate.title);
  setText('pdLocation', estate.location);
  const hasRate = Number(estate.nightlyRate) > 0;
  setText('pdPrice', hasRate ? OasisUtils.formatIdr(estate.nightlyRate) : 'Rate on request');
  setText('pdRate', hasRate ? 'per night' : '');
  setText('pdDescription', estate.description);
  setText('pdBedrooms', plural(estate.bedrooms, 'Bedroom'));
  setText('pdBathrooms', plural(estate.bathrooms, 'Bathroom'));
  setText('pdArea', estate.area || '-');
  setText('pdGarage', estate.garage || '-');

  const pdTag = document.getElementById('pdTag');
  pdTag.textContent = estate.tag || '';
  pdTag.style.display = estate.tag ? 'inline-block' : 'none';

  document.getElementById('pdBestSellerBadge').style.display = estate.isBestSeller ? 'inline-block' : 'none';

  const facilities = Array.isArray(estate.facilities) ? estate.facilities : [];
  document.getElementById('pdFacilitiesList').innerHTML = facilities.length
    ? facilities
        .map(
          (f) => `
        <li class="facility-item">
          <span class="facility-icon">✓</span>
          <span class="facility-text">${esc(f)}</span>
        </li>
      `
        )
        .join('')
    : `<li class="facility-item"><span class="facility-text">Full facility details are available on request.</span></li>`;

  document.getElementById('btnScheduleFromDetail').onclick = () => {
    closeAllModals();
    openScheduleViewingModal(estate.id, OasisDB.getCurrentUser());
  };
  document.getElementById('btnReserveFromDetail').onclick = () => {
    closeAllModals();
    openReserveModal(estate.id);
  };

  openModal(modal);
}

/**
 * Live Bali clock in the footer
 */
function startBaliClock() {
  const clock = document.getElementById('baliClock');
  if (!clock) return;

  const tick = () => {
    clock.textContent = OasisUtils.baliClock();
  };
  tick();
  setInterval(tick, 1000);
}
