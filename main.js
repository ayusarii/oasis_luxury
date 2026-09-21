/**
 * OASIS Real Estate - Main Script
 * Mengelola rendering katalog, otentikasi UI, proteksi fitur, modal spesifikasi detail unit,
 * pop-up notifikasi booking berhasil, dan surat konfirmasi email otomatis.
 */

// Dataset Properti Mewah OASIS
const OASIS_ESTATES = [
  {
    id: 'palm-crest',
    title: 'Palm Crest Villa',
    tag: 'Waterfront',
    location: 'Palm Jumeirah',
    price: 'AED 42.5M',
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    bedrooms: 6,
    bathrooms: 7,
    area: '12,500 sq ft (1,161 m²)',
    garage: '4 Mobil (Basement)',
    description: 'Mahakarya arsitektur modern di tepi pantai Palm Jumeirah dengan panorama langsung ke Teluk Arab dan Dubai Marina skyline.',
    facilities: [
      'Private Infinity Pool tepi pantai pribadi',
      'Akses pantai pribadi langsung dengan dermaga pribadi',
      'Sistem otomatisasi Smart Home terintegrasi (Crestron)',
      'Wellness Suite privat (Sauna, Steam, & Ruang Pijat Spa)',
      'Dapur chef marmer Italia & dry kitchen terpisah',
      'Keamanan privat 24/7 dan sistem biometrik'
    ]
  },
  {
    id: 'al-saraya',
    title: 'Al Saraya Villa',
    tag: 'Marina View',
    location: 'Dubai Marina',
    price: 'AED 28.4M',
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    bedrooms: 5,
    bathrooms: 6,
    area: '9,800 sq ft (910 m²)',
    garage: '3 Mobil',
    description: 'Hunian urban ultra-mewah di tepi kanal Dubai Marina dengan dermaga kapal pesiar privat dan rooftop sky lounge spektakuler.',
    facilities: [
      'Dermaga yacht privat (Private Yacht Berth)',
      'Sky lounge & rooftop deck dengan area BBQ luar ruangan',
      'Lift privat kaca panoramik dari basement hingga lantai atas',
      'Wine cellar dengan kontrol suhu dan kelembaban presisi',
      'Home cinema pribadi berstandar Dolby Atmos',
      'Pantry terpisah untuk asisten rumah tangga & butler'
    ]
  },
  {
    id: 'harbor-house',
    title: 'Harbor House',
    tag: 'Penthouses',
    location: 'Marina District',
    price: 'AED 31.1M',
    isBestSeller: true,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
    bedrooms: 5,
    bathrooms: 5,
    area: '10,400 sq ft (966 m²)',
    garage: '3 Mobil',
    description: 'Penthouse triplex spektakuler di lantai puncak dengan teras gantung dan pemandangan laut 360 derajat tak terbatas.',
    facilities: [
      'Pemandangan 360° Sky Harbor & Arabian Gulf',
      'Kolam renang kaca gantung di langit (Sky Pool)',
      'Perapian marmer kontemporer di grand salon',
      'Gym pribadi lengkap dengan peralatan Technogym terbaru',
      'Lobi lift privat dengan akses keamanan sidik jari',
      'Layanan valet dan dedicated concierge 24 jam'
    ]
  },
  {
    id: 'luma-residence',
    title: 'Luma Residence',
    tag: 'Signature',
    location: 'Dubai Hills',
    price: 'AED 18.9M',
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    bedrooms: 4,
    bathrooms: 5,
    area: '7,200 sq ft (669 m²)',
    garage: '2 Mobil',
    description: 'Kombinasi harmonis antara keanggunan minimalis modern dan lanskap hijau luas lapangan golf kejuaraan Dubai Hills.',
    facilities: [
      'Pemandangan langsung ke Championship Golf Course',
      'Plunge pool infinity & dek santai kayu jati',
      'Taman Zen bertaraf lanskap internasional',
      'Master suite dengan walk-in closet rancangan desainer Milan',
      'Smart climate control hemat energi dan ramah lingkungan',
      'Akses eksklusif ke fasilitas klub komunitas Dubai Hills'
    ]
  },
  {
    id: 'royal-atlantis',
    title: 'The Royal Atlantis Residence',
    tag: 'Ultra Luxury',
    location: 'Palm Jumeirah',
    price: 'AED 54.0M',
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    bedrooms: 6,
    bathrooms: 8,
    area: '15,200 sq ft (1,412 m²)',
    garage: '5 Mobil',
    description: 'Puncak prestise arsitektur dunia di ikon global Atlantis The Royal, dirancang untuk gaya hidup paling eksklusif.',
    facilities: [
      'Sky pool pribadi di ketinggian lantai 35',
      'Akses helipad & fasilitas VIP hotel Atlantis The Royal',
      'Layanan room service privat dari deretan chef Michelin',
      'Pintu masuk dan drop-off khusus penghuni residensial',
      'Balkon melingkar dengan pemandangan Atlantis & laut lepas',
      'Akses pantai privat sepanjang 2 kilometer'
    ]
  },
  {
    id: 'emirates-hills',
    title: 'Emirates Hills Sanctuary',
    tag: 'Estate Villa',
    location: 'Emirates Hills',
    price: 'AED 38.8M',
    isBestSeller: false,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    bedrooms: 5,
    bathrooms: 6,
    area: '11,000 sq ft (1,022 m²)',
    garage: '4 Mobil',
    description: 'Vila megah di kawasan paling prestisius, menghadap danau tenang dengan taman asri dan privasi tingkat tinggi.',
    facilities: [
      'Tepi danau privat & taman lanskap seluas 1.5 hektar',
      'Paviliun kolam renang outdoor & cabana mewah bergaya resort',
      'Cigar lounge formal berpanel kayu mahoni mewah',
      'Ruang bioskop berkapasitas 12 tempat duduk kelas satu',
      'Sistem keamanan biometrik perimeter komprehensif',
      'Garasi bawah tanah dengan teknologi lift mobil canggih'
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi animasi AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 50 });
  }

  // Cek sesi otentikasi saat ini
  const currentUser = typeof OasisDB !== 'undefined' ? OasisDB.getCurrentUser() : null;
  const isAuth = !!currentUser;

  // Render komponen halaman
  renderHeaderAuthState(currentUser);
  renderCatalog(isAuth);
  setupFeatureButtons(isAuth, currentUser);
  setupModals();
});

/**
 * 1. Render Status Otentikasi di Navbar
 */
function renderHeaderAuthState(user) {
  const authNavContainer = document.getElementById('authNavContainer');
  const navETicketLink = document.getElementById('navETicketLink');
  if (!authNavContainer) return;

  if (user) {
    const bookings = getStoredBookings();
    const ticketCount = bookings.length;
    const ticketBadgeLabel = ticketCount > 0 ? `E-Ticket (${ticketCount})` : 'E-Ticket';

    // Tampilkan link E-Ticket di navbar menu saat login
    if (navETicketLink) {
      navETicketLink.style.display = 'inline-block';
      navETicketLink.innerHTML = ticketCount > 0 
        ? `E-Ticket <span class="nav-ticket-counter">${ticketCount}</span>` 
        : 'E-Ticket';
      navETicketLink.onclick = (e) => {
        e.preventDefault();
        openETicketHistory();
      };
    }

    const initials = user.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

    authNavContainer.innerHTML = `
      <div class="user-profile-header">
        <button id="btnHeaderETicket" class="btn-inbox-badge" title="Lihat E-Ticket Riwayat Booking">
          ${ticketBadgeLabel}
        </button>
        <div class="user-badge" title="${user.email}">
          <span class="user-avatar">${initials}</span>
          <div class="user-info d-none-mobile">
            <span class="user-name">${user.name}</span>
            <span class="user-role">Member Eksklusif</span>
          </div>
        </div>
        <button id="btnLogout" class="btn btn-logout" title="Keluar dari akun">
          Keluar
        </button>
      </div>
    `;

    // Pasang listener ke tombol E-Ticket di header
    const btnHeaderETicket = document.getElementById('btnHeaderETicket');
    if (btnHeaderETicket) {
      btnHeaderETicket.addEventListener('click', () => {
        openETicketHistory();
      });
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
          OasisDB.logout();
          window.location.reload();
        }
      });
    }
  } else {
    // Sembunyikan link E-Ticket di navbar saat guest belum login
    if (navETicketLink) {
      navETicketLink.style.display = 'none';
    }

    authNavContainer.innerHTML = `
      <a href="login.html" class="btn btn-primary nav-login-btn">LOGIN</a>
    `;
  }
}

/**
 * 2. Render Katalog Properti
 * - Jika Guest: Hanya tampilkan produk bertanda Best Seller secara bersih (tanpa kartu locked dan tanpa tulisan login).
 * - Jika User: Tampilkan seluruh katalog 6 properti dengan ringkasan spesifikasi.
 */
function renderCatalog(isAuth) {
  const catalogGrid = document.getElementById('estateCatalogGrid');
  const catalogSectionSub = document.getElementById('catalogSubtitle');
  if (!catalogGrid) return;

  const itemsToRender = isAuth
    ? [...OASIS_ESTATES].sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0))
    : OASIS_ESTATES.filter((item) => item.isBestSeller);

  if (catalogSectionSub) {
    catalogSectionSub.innerHTML = isAuth
      ? 'Seluruh <strong>6 Koleksi Kediaman Mewah</strong> terbuka untuk Anda. Klik <em>Details</em> untuk melihat spesifikasi kamar, kamar mandi, dan fasilitas lengkap.'
      : 'Koleksi hunian eksklusif pilihan dengan nilai arsitektur dan prestise tertinggi.';
  }

  let html = itemsToRender
    .map((item) => {
      const bestSellerBadge = item.isBestSeller
        ? `<span class="badge-best-seller">★ BEST SELLER</span>`
        : '';

      const tagClass = item.isBestSeller ? 'estate-tag tag-gold' : 'estate-tag';

      // Ringkasan singkat spesifikasi hanya tampil setelah login
      const specsSummary = isAuth
        ? `
        <div class="estate-specs-quick">
          <span>🛏️ ${item.bedrooms} Kamar</span>
          <span>🚿 ${item.bathrooms} Kamar Mandi</span>
          <span>📐 ${item.area.split(' ')[0]} sq ft</span>
        </div>
      `
        : ''; // Sebelum login: tidak ada tulisan 'login untuk spesifikasi detail'

      return `
        <article class="estate-card ${item.isBestSeller ? 'card-best-seller' : ''}" data-aos="fade-up">
          <div class="estate-image" style="background-image: url('${item.image}');">
            <div class="estate-badges">
              ${bestSellerBadge}
              <span class="${tagClass}">${item.tag}</span>
            </div>
          </div>
          <div class="estate-content">
            <div class="estate-top">
              <h3 class="serif">${item.title}</h3>
            </div>
            
            ${specsSummary}

            <div class="estate-meta">
              <span class="location">${item.location}</span>
              <span class="price-tag">${item.price}</span>
            </div>
            <button type="button" class="details-link-btn" data-estate-id="${item.id}">
              Details →
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  catalogGrid.innerHTML = html;

  // Bind event listener ke tombol Details
  document.querySelectorAll('.details-link-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const estateId = btn.getAttribute('data-estate-id');
      handleDetailClick(estateId, isAuth);
    });
  });
}

/**
 * 3. Logika Klik Tombol Details Properti
 * Jika belum login, langsung diarahkan ke halaman login
 */
function handleDetailClick(estateId, isAuth) {
  if (!isAuth) {
    window.location.href = 'login.html?reason=auth_required&feature=Detail+Spesifikasi+Properti';
    return;
  }

  const estate = OASIS_ESTATES.find((item) => item.id === estateId);
  if (!estate) return;

  openPropertyDetailModal(estate);
}

/**
 * 4. Pasang Interaksi pada Tombol-Tombol Fitur Utama
 * Jika belum login, langsung diarahkan ke halaman login
 */
function setupFeatureButtons(isAuth, currentUser) {
  // Tombol 1: "Lihat Semua Katalog" di Hero
  const btnExploreCatalog = document.getElementById('btnExploreCatalog');
  if (btnExploreCatalog) {
    btnExploreCatalog.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isAuth) {
        window.location.href = 'login.html?reason=auth_required&feature=Lihat+Semua+Katalog';
      } else {
        const targetSection = document.getElementById('residences');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // Tombol 2: "Book a Meeting" di Hero
  const btnBookMeeting = document.getElementById('btnBookMeeting');
  if (btnBookMeeting) {
    btnBookMeeting.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isAuth) {
        window.location.href = 'login.html?reason=auth_required&feature=Book+a+Meeting';
      } else {
        openBookMeetingModal(currentUser);
      }
    });
  }

  // Tombol 3: "Schedule a Viewing" di Banner
  const btnScheduleViewing = document.getElementById('btnScheduleViewing');
  if (btnScheduleViewing) {
    btnScheduleViewing.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isAuth) {
        window.location.href = 'login.html?reason=auth_required&feature=Schedule+a+Viewing';
      } else {
        openScheduleViewingModal(null, currentUser);
      }
    });
  }
}

/**
 * 5. Pengelolaan Modal (Book Meeting, Schedule Viewing, Detail Properti, Pop-up Sukses, Email Konfirmasi)
 */
function setupModals() {
  // Setup tombol close pada seluruh modal
  document.querySelectorAll('.modal-overlay .modal-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Tombol class modal-close-trigger
  document.querySelectorAll('.modal-close-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Klik di luar modal dialog untuk menutup
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Form submit Book Meeting
  const formBookMeeting = document.getElementById('formBookMeeting');
  if (formBookMeeting) {
    formBookMeeting.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('bmName').value.trim();
      const email = document.getElementById('bmEmail').value.trim();
      const date = document.getElementById('bmDate').value;
      const time = document.getElementById('bmTime').value;
      const topicSelect = document.getElementById('bmTopic');
      const topic = topicSelect.options[topicSelect.selectedIndex].text;

      // Buat Nomor Referensi Unik
      const refNo = 'OASIS-MTG-' + Math.floor(10000 + Math.random() * 90000);

      // Format tanggal yang elegan
      let formattedDate = date;
      try {
        formattedDate = new Date(date).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (err) {
        formattedDate = date;
      }

      const bookingRecord = {
        id: refNo,
        refNo,
        type: 'meeting',
        typeLabel: 'Konsultasi Meeting',
        title: `Konsultasi: ${topic}`,
        name,
        email,
        date: formattedDate,
        rawDate: date,
        time,
        topic,
        property: topic,
        guests: '1 Orang (Klien Privat)',
        advisorOrHost: 'Alexander Wright (Senior Partner, Prime Acquisitions)',
        createdAt: new Date().toISOString()
      };

      // Simpan ke database lokal riwayat booking
      saveBooking(bookingRecord);

      // 1. Tampilkan Pop-up Notifikasi Booking Berhasil
      showBookingSuccessPopup(bookingRecord);

      formBookMeeting.reset();
    });
  }

  // Tombol di dalam Pop-up Booking Success: Buka Surat Konfirmasi Email
  const btnViewEmail = document.getElementById('btnViewEmailConfirmation');
  if (btnViewEmail) {
    btnViewEmail.addEventListener('click', () => {
      closeAllModals();
      const bookings = getStoredBookings();
      if (bookings.length > 0) {
        showEmailConfirmation(bookings[0]);
      }
    });
  }

  // Form submit Schedule Viewing (Simpan E-Ticket ke Riwayat & Tampilkan Pop-up Sesuai Tema OASIS)
  const formScheduleViewing = document.getElementById('formScheduleViewing');
  if (formScheduleViewing) {
    formScheduleViewing.addEventListener('submit', (e) => {
      e.preventDefault();
      const estateSelect = document.getElementById('svEstate');
      const estateTitle = estateSelect.options[estateSelect.selectedIndex].text;
      const date = document.getElementById('svDate').value;
      const timeSlot = document.getElementById('svTimeSlot').value;
      const name = document.getElementById('svName').value;
      const email = document.getElementById('svEmail').value;
      const guests = document.getElementById('svGuests') ? document.getElementById('svGuests').value : '1-2 Orang';

      const vsRefNo = 'OASIS-VISIT-' + Math.floor(10000 + Math.random() * 90000);
      let formattedDate = date;
      try {
        formattedDate = new Date(date).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (err) {
        formattedDate = date;
      }

      const viewingRecord = {
        id: vsRefNo,
        refNo: vsRefNo,
        type: 'viewing',
        typeLabel: 'Survei Properti',
        title: `Survei: ${estateTitle}`,
        name,
        email,
        date: formattedDate,
        rawDate: date,
        time: timeSlot,
        topic: `Survei Unit ${estateTitle}`,
        property: estateTitle,
        guests: `${guests} (Private Chauffeur & Refreshment)`,
        advisorOrHost: 'Dedicated VIP Site Host & Private Chauffeur',
        createdAt: new Date().toISOString()
      };

      // Simpan E-Ticket survei properti ke database riwayat lokal
      saveBooking(viewingRecord);

      // Isi data ke modal pop-up konfirmasi survei bertema OASIS
      const vsRefNoEl = document.getElementById('vsRefNo');
      if (vsRefNoEl) vsRefNoEl.innerText = vsRefNo;

      const vsPropertyEl = document.getElementById('vsProperty');
      if (vsPropertyEl) vsPropertyEl.innerText = estateTitle;

      const vsNameEl = document.getElementById('vsName');
      if (vsNameEl) vsNameEl.innerText = name;

      const vsEmailEl = document.getElementById('vsEmail');
      if (vsEmailEl) vsEmailEl.innerText = email;

      const vsDateEl = document.getElementById('vsDate');
      if (vsDateEl) vsDateEl.innerText = formattedDate;

      const vsTimeSlotEl = document.getElementById('vsTimeSlot');
      if (vsTimeSlotEl) vsTimeSlotEl.innerText = timeSlot;

      const vsGuestsEl = document.getElementById('vsGuests');
      if (vsGuestsEl) vsGuestsEl.innerText = `${guests} (Private Chauffeur & Refreshment)`;

      const vsBarcodeNumEl = document.getElementById('vsBarcodeNum');
      if (vsBarcodeNumEl) vsBarcodeNumEl.innerText = `${vsRefNo}-VERIFIED-PASS`;

      closeAllModals();
      const viewingModal = document.getElementById('viewingSuccessModal');
      if (viewingModal) {
        const btnPrintViewing = document.getElementById('btnPrintViewingTicket');
        if (btnPrintViewing) {
          btnPrintViewing.onclick = () => {
            printETicket(document.getElementById('oasisViewingETicket'));
          };
        }
        openModal(viewingModal);
      }

      // Perbarui navbar agar counter E-Ticket langsung bertambah
      renderHeaderAuthState(OasisDB.getCurrentUser());

      formScheduleViewing.reset();
    });
  }
}

/**
 * Buka Modal Riwayat Lengkap Seluruh E-Ticket & Jadwal (Meeting & Viewing)
 */
function openETicketHistory() {
  const allBookings = getStoredBookings();
  if (!allBookings || allBookings.length === 0) {
    closeAllModals();
    const modalEmpty = document.getElementById('emptyETicketModal');
    if (modalEmpty) {
      openModal(modalEmpty);
      const btnBook = document.getElementById('btnBookFromEmptyETicket');
      if (btnBook) {
        btnBook.onclick = () => {
          closeAllModals();
          openBookMeetingModal(OasisDB.getCurrentUser());
        };
      }
      const btnView = document.getElementById('btnViewFromEmptyETicket');
      if (btnView) {
        btnView.onclick = () => {
          closeAllModals();
          openScheduleViewingModal(null, OasisDB.getCurrentUser());
        };
      }
    }
    return;
  }

  closeAllModals();
  const modalHistory = document.getElementById('eTicketHistoryModal');
  if (!modalHistory) return;

  // Normalisasi data jika ada data lama
  allBookings.forEach((b) => {
    if (!b.type) {
      b.type = b.refNo && b.refNo.includes('VISIT') ? 'viewing' : 'meeting';
    }
  });

  // Hitung jumlah riwayat per kategori
  const countAll = allBookings.length;
  const countMeeting = allBookings.filter((b) => b.type === 'meeting').length;
  const countViewing = allBookings.filter((b) => b.type === 'viewing').length;

  const countAllEl = document.getElementById('countAll');
  if (countAllEl) countAllEl.innerText = countAll;

  const countMeetingEl = document.getElementById('countMeeting');
  if (countMeetingEl) countMeetingEl.innerText = countMeeting;

  const countViewingEl = document.getElementById('countViewing');
  if (countViewingEl) countViewingEl.innerText = countViewing;

  let currentFilter = 'all';

  function renderFilteredHistory() {
    const listContainer = document.getElementById('historyListContainer');
    const previewContainer = document.getElementById('historyTicketPreviewWrap');
    if (!listContainer || !previewContainer) return;

    let filtered = allBookings;
    if (currentFilter === 'meeting') {
      filtered = allBookings.filter((b) => b.type === 'meeting');
    } else if (currentFilter === 'viewing') {
      filtered = allBookings.filter((b) => b.type === 'viewing');
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="history-empty-state">
          <p>Tidak ada riwayat pada kategori ini.</p>
        </div>
      `;
      previewContainer.innerHTML = '';
      return;
    }

    // Render list kartu riwayat
    listContainer.innerHTML = filtered
      .map((item, idx) => {
        const isViewing = item.type === 'viewing';
        const typeBadge = isViewing
          ? `<span class="history-type-badge badge-viewing">SURVEI PROPERTI</span>`
          : `<span class="history-type-badge badge-meeting">KONSULTASI MEETING</span>`;
        const titleText = isViewing ? (item.property || item.title) : (item.topic || item.title);

        return `
          <div class="history-item-card ${idx === 0 ? 'active' : ''}" data-ref="${item.refNo}">
            <div class="history-item-top">
              ${typeBadge}
              <span class="history-item-ref">${item.refNo}</span>
            </div>
            <h4 class="history-item-title serif">${titleText}</h4>
            <div class="history-item-meta">
              <span>📅 ${item.date}</span>
              <span>⏰ ${item.time}</span>
            </div>
          </div>
        `;
      })
      .join('');

    // Render preview item pertama secara default
    renderTicketPreview(filtered[0]);

    // Bind event klik ke setiap kartu riwayat
    listContainer.querySelectorAll('.history-item-card').forEach((card) => {
      card.addEventListener('click', () => {
        listContainer.querySelectorAll('.history-item-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const ref = card.getAttribute('data-ref');
        const selectedBooking = allBookings.find((b) => b.refNo === ref);
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
    const passHeader = isViewing ? 'OASIS SITE VISIT' : 'OASIS REAL ESTATE';
    const passSub = isViewing ? 'EXCLUSIVE PROPERTY VIEWING PASS' : 'PRIVATE ADVISORY &bull; VIP PASS';
    const topicLabel = isViewing ? 'UNIT PROPERTI SURVEI' : 'FOKUS TOPIK ADVISORY';
    const topicVal = isViewing ? (item.property || item.topic) : (item.topic || item.title);
    const advisorLabel = isViewing ? 'LAYANAN & PRIVATE HOST' : 'SENIOR ADVISOR & FORMAT';
    const advisorVal = isViewing
      ? `${item.guests || '1-2 Orang'} &bull; Private Chauffeur & Refreshment VIP`
      : 'Alexander Wright (Senior Partner) &bull; DIFC VIP Lounge / Online VIP Room';

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
            <span class="eticket-pass-tag">CONFIRMED</span>
            <div class="eticket-ref-code">${item.refNo}</div>
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
              <span class="eticket-field-label">NAMA KLIEN</span>
              <strong class="eticket-field-val">${item.name}</strong>
            </div>
            <div class="eticket-col">
              <span class="eticket-field-label">EMAIL KONFIRMASI</span>
              <span class="eticket-field-val">${item.email}</span>
            </div>
            <div class="eticket-col">
              <span class="eticket-field-label">TANGGAL</span>
              <strong class="eticket-field-val highlight">${item.date}</strong>
            </div>
            <div class="eticket-col">
              <span class="eticket-field-label">SESI WAKTU</span>
              <strong class="eticket-field-val highlight">${item.time}</strong>
            </div>
            <div class="eticket-col eticket-col-full">
              <span class="eticket-field-label">${topicLabel}</span>
              <strong class="eticket-field-val highlight">${topicVal}</strong>
            </div>
            <div class="eticket-col eticket-col-full">
              <span class="eticket-field-label">${advisorLabel}</span>
              <span class="eticket-field-val">${advisorVal}</span>
            </div>
          </div>

          <div class="eticket-barcode-row">
            <div class="barcode-block">
              <div class="barcode-graphic"></div>
              <span class="barcode-text">${item.refNo}-VERIFIED-PASS</span>
            </div>
            <div class="eticket-seal">
              <div class="seal-inner">
                <span>OFFICIAL</span>
                <strong>OASIS</strong>
                <small>${isViewing ? 'VISIT' : 'ADVISORY'}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="history-ticket-actions">
        <button type="button" class="btn btn-secondary-dark" id="btnPrintSelectedTicket">
          Cetak E-Ticket Ini
        </button>
        ${!isViewing ? `<button type="button" class="btn btn-primary" id="btnViewEmailSelected">Buka Surat Email</button>` : ''}
      </div>
    `;

    // Pasang listener cetak
    const btnPrint = document.getElementById('btnPrintSelectedTicket');
    if (btnPrint) {
      btnPrint.onclick = () => {
        printETicket(document.getElementById('activeHistoryETicket'));
      };
    }

    // Pasang listener email jika meeting
    const btnEmail = document.getElementById('btnViewEmailSelected');
    if (btnEmail && !isViewing) {
      btnEmail.onclick = () => {
        showEmailConfirmation(item);
      };
    }
  }

  // Setup tab filter clicks
  document.querySelectorAll('.history-tab-btn').forEach((btn) => {
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
 * Tampilkan Pop-up Notifikasi Bahwa Book Meeting Telah Berhasil & Tampilkan E-Ticket
 */
function showBookingSuccessPopup(booking) {
  closeAllModals();

  // Isi data ke E-Ticket Resmi
  const etRefNo = document.getElementById('etRefNo');
  if (etRefNo) etRefNo.innerText = booking.refNo;

  const etClientName = document.getElementById('etClientName');
  if (etClientName) etClientName.innerText = booking.name;

  const etEmail = document.getElementById('etEmail');
  if (etEmail) etEmail.innerText = booking.email;

  const etDate = document.getElementById('etDate');
  if (etDate) etDate.innerText = booking.date;

  const etTime = document.getElementById('etTime');
  if (etTime) etTime.innerText = booking.time;

  const etTopic = document.getElementById('etTopic');
  if (etTopic) etTopic.innerText = booking.topic;

  const etBarcodeNum = document.getElementById('etBarcodeNum');
  if (etBarcodeNum) etBarcodeNum.innerText = `${booking.refNo}-VERIFIED-PASS`;

  const bsSentEmail = document.getElementById('bsSentEmail');
  if (bsSentEmail) bsSentEmail.innerText = booking.email;

  // Handler cetak E-ticket
  const btnPrintTicket = document.getElementById('btnPrintTicket');
  if (btnPrintTicket) {
    btnPrintTicket.onclick = () => {
      printETicket(document.getElementById('oasisETicket'));
    };
  }

  const modalSuccess = document.getElementById('bookingSuccessModal');
  openModal(modalSuccess);

  // Perbarui header auth state agar tombol konfirmasi email muncul di navbar
  renderHeaderAuthState(OasisDB.getCurrentUser());
}

/**
 * Utilitas Cetak E-Ticket: 1 Halaman Penuh, Presisi, Jelas, & Bebas Terpotong
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

  // Keterangan resmi legal & validasi di bagian bawah tiket
  const printNotice = document.createElement('div');
  printNotice.className = 'print-ticket-footer';
  printNotice.innerHTML = `
    <span>OASIS RESIDENCES &bull; OFFICIAL LUXURY E-PASS &bull; VERIFIED ENTRY</span>
    <small>Dokumen ini adalah bukti resmi reservasi privat OASIS. Harap ditunjukkan kepada concierge atau site host saat kedatangan.</small>
  `;
  printTarget.appendChild(printNotice);
}

function printETicket(sourceElement) {
  if (!sourceElement) return;
  preparePrintTicket(sourceElement);
  window.print();
}

// Fallback jika user mencetak melalui shortcut browser (Ctrl + P / Cmd + P)
window.addEventListener('beforeprint', () => {
  const printTarget = document.getElementById('oasisPrintTarget');
  if (!printTarget || printTarget.children.length === 0) {
    const activeModalTicket = document.querySelector('.modal-overlay.active .oasis-eticket');
    if (activeModalTicket) {
      preparePrintTicket(activeModalTicket);
    } else {
      const anyTicket = document.querySelector('.oasis-eticket');
      if (anyTicket) {
        preparePrintTicket(anyTicket);
      }
    }
  }
});

// Bersihkan print target setelah dialog cetak selesai/ditutup
window.addEventListener('afterprint', () => {
  const printTarget = document.getElementById('oasisPrintTarget');
  if (printTarget) {
    printTarget.innerHTML = '';
  }
});

/**
 * Tampilkan Surat Konfirmasi Email Resmi yang Diterima User Sesuai Emailnya
 */
function showEmailConfirmation(booking) {
  closeAllModals();

  document.getElementById('emRecipient').innerText = `${booking.name} <${booking.email}>`;
  document.getElementById('emClientName').innerText = booking.name;
  document.getElementById('emTableRef').innerText = booking.refNo;
  document.getElementById('emTableDate').innerText = booking.date;
  document.getElementById('emTableTime').innerText = booking.time;
  document.getElementById('emTableTopic').innerText = booking.topic;
  document.getElementById('emTimestamp').innerText = `Baru Saja (${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} GST)`;

  // Setup tombol Mailto untuk buka langsung di aplikasi email pengguna
  const mailtoSubject = encodeURIComponent(`Konfirmasi Resmi: Jadwal Konsultasi Properti Privat OASIS [Ref: ${booking.refNo}]`);
  const mailtoBody = encodeURIComponent(
    `Yang Terhormat ${booking.name},\n\n` +
    `Terima kasih atas reservasi konsultasi properti privat Anda bersama OASIS Luxury Real Estate.\n\n` +
    `DETAIL JADWAL KONSULTASI RESMI:\n` +
    `- Nomor Referensi: ${booking.refNo}\n` +
    `- Tanggal: ${booking.date}\n` +
    `- Waktu: ${booking.time}\n` +
    `- Fokus Topik: ${booking.topic}\n` +
    `- Senior Advisor: Alexander Wright (Senior Partner, Prime Acquisitions)\n` +
    `- Format: Private VIP Advisory Suite (DIFC, Dubai) / Google Meet VIP Room\n\n` +
    `Konfirmasi ini diterbitkan secara otomatis untuk alamat email: ${booking.email}\n\n` +
    `Concierge Hotline: +971 4 555 2201\n` +
    `Email: advisory@oasisliving.ae\n\n` +
    `Salam hangat,\n` +
    `OASIS Private Client Advisory`
  );

  const btnOpenMailto = document.getElementById('btnOpenMailto');
  if (btnOpenMailto) {
    btnOpenMailto.href = `mailto:${encodeURIComponent(booking.email)}?subject=${mailtoSubject}&body=${mailtoBody}`;
  }

  const modalEmail = document.getElementById('emailConfirmationModal');
  openModal(modalEmail);
}

/**
 * Utilitas Penyimpanan Riwayat Booking di LocalStorage
 */
function saveBooking(booking) {
  try {
    const list = getStoredBookings();
    list.unshift(booking);
    localStorage.setItem('oasis_booking_history', JSON.stringify(list));
  } catch (e) {
    console.error('Gagal menyimpan booking', e);
  }
}

function getStoredBookings() {
  try {
    const data = localStorage.getItem('oasis_booking_history');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach((m) => {
    m.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

function openModal(modalElement) {
  if (!modalElement) return;
  modalElement.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Buka Modal Book a Meeting Form
 */
function openBookMeetingModal(currentUser) {
  const modal = document.getElementById('bookMeetingModal');
  if (!modal) return;

  if (currentUser) {
    const nameInput = document.getElementById('bmName');
    const emailInput = document.getElementById('bmEmail');
    if (nameInput) nameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;
  }

  const dateInput = document.getElementById('bmDate');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  openModal(modal);
}

/**
 * Buka Modal Schedule a Viewing Form
 */
function openScheduleViewingModal(preselectedEstateId, currentUser) {
  const modal = document.getElementById('scheduleViewingModal');
  if (!modal) return;

  const select = document.getElementById('svEstate');
  if (select) {
    select.innerHTML = OASIS_ESTATES.map(
      (e) => `<option value="${e.id}" ${e.id === preselectedEstateId ? 'selected' : ''}>${e.title} (${e.location} - ${e.price})</option>`
    ).join('');
  }

  if (currentUser) {
    const nameInput = document.getElementById('svName');
    const emailInput = document.getElementById('svEmail');
    if (nameInput) nameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;
  }

  const dateInput = document.getElementById('svDate');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  openModal(modal);
}

/**
 * Buka Modal Detail Spesifikasi Properti (Kamar, Kamar Mandi, Fasilitas)
 */
function openPropertyDetailModal(estate) {
  const modal = document.getElementById('propertyDetailModal');
  if (!modal) return;

  document.getElementById('pdImage').style.backgroundImage = `url('${estate.image}')`;
  document.getElementById('pdTitle').innerText = estate.title;
  document.getElementById('pdLocation').innerText = estate.location;
  document.getElementById('pdPrice').innerText = estate.price;
  document.getElementById('pdTag').innerText = estate.tag;
  document.getElementById('pdDescription').innerText = estate.description;

  // Spesifikasi kamar & kamar mandi & luas & garasi
  document.getElementById('pdBedrooms').innerText = `${estate.bedrooms} Kamar Tidur`;
  document.getElementById('pdBathrooms').innerText = `${estate.bathrooms} Kamar Mandi`;
  document.getElementById('pdArea').innerText = estate.area;
  document.getElementById('pdGarage').innerText = estate.garage;

  const pdBestSellerBadge = document.getElementById('pdBestSellerBadge');
  if (pdBestSellerBadge) {
    pdBestSellerBadge.style.display = estate.isBestSeller ? 'inline-block' : 'none';
  }

  // Render fasilitas
  const facilitiesList = document.getElementById('pdFacilitiesList');
  if (facilitiesList) {
    facilitiesList.innerHTML = estate.facilities
      .map(
        (f) => `
        <li class="facility-item">
          <span class="facility-icon">✓</span>
          <span class="facility-text">${f}</span>
        </li>
      `
      )
      .join('');
  }

  const btnScheduleFromDetail = document.getElementById('btnScheduleFromDetail');
  if (btnScheduleFromDetail) {
    btnScheduleFromDetail.onclick = () => {
      closeAllModals();
      openScheduleViewingModal(estate.id, OasisDB.getCurrentUser());
    };
  }

  openModal(modal);
}
