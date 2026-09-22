/**
 * OASIS Local Database Manager
 * Stores member accounts, the member session, bookings (meetings & viewings) and the
 * property catalog in LocalStorage. Shared by the public site and the admin console.
 *
 * Also exposes OasisUtils: HTML escaping and Bali time (WITA, UTC+8) helpers.
 */

const OasisDB = (function () {
  const USERS_STORAGE_KEY = 'oasis_users_db';
  const CURRENT_USER_KEY = 'oasis_current_user';
  const BOOKINGS_STORAGE_KEY = 'oasis_booking_history';
  const PROPERTIES_STORAGE_KEY = 'oasis_properties_db';
  const TESTIMONIALS_STORAGE_KEY = 'oasis_testimonials_db';

  // Nightly rates of an earlier release; still-untouched values are moved to the new presets
  const PREVIOUS_NIGHTLY_RATES = {
    'uluwatu-cliff': 45000000,
    'seminyak-beachfront': 32000000,
    'canggu-horizon': 24000000,
    'ubud-sanctuary': 15500000,
    'nusa-dua-royal': 65000000,
    'jimbaran-bay': 38000000
  };

  const BOOKING_STATUSES = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  const TESTIMONIAL_STATUSES = {
    published: 'Published',
    hidden: 'Hidden'
  };

  // SAMPLE CONTENT shown until real guests write reviews; the admin can hide or delete these.
  const DEFAULT_TESTIMONIALS = [
    {
      id: 'tst_sample_1',
      userId: null,
      sample: true,
      name: 'Sophie L.',
      city: 'Melbourne, Australia',
      propertyId: 'uluwatu-cliff',
      villa: 'Uluwatu Cliff Villa',
      nights: 5,
      rating: 5,
      text: 'Waking up above the Indian Ocean every morning felt unreal. Our villa specialist had a private chef and a sunset dinner ready before we even arrived.',
      status: 'published',
      createdAt: '2026-08-02T03:00:00.000Z'
    },
    {
      id: 'tst_sample_2',
      userId: null,
      sample: true,
      name: 'Daniel & Mei K.',
      city: 'Singapore',
      propertyId: 'seminyak-beachfront',
      villa: 'Seminyak Beachfront Estate',
      nights: 7,
      rating: 5,
      text: 'We celebrated our anniversary here. Steps from the beach, spotless, and the concierge handled every detail. Worth every rupiah.',
      status: 'published',
      createdAt: '2026-08-01T03:00:00.000Z'
    },
    {
      id: 'tst_sample_3',
      userId: null,
      sample: true,
      name: 'Rizky A.',
      city: 'Jakarta, Indonesia',
      propertyId: 'ubud-sanctuary',
      villa: 'Ubud Jungle Sanctuary',
      nights: 3,
      rating: 5,
      text: 'Quiet, green and exactly like the photos. Scheduling a viewing first gave us complete confidence, and the team always replied within minutes.',
      status: 'published',
      createdAt: '2026-07-31T03:00:00.000Z'
    }
  ];

  // Default catalog, used on first load and when the admin restores defaults.
  // OASIS rents villas by the night: nightlyRate is the only price, in IDR (0 = on request).
  // Nightly rates are tiered Rp 3–5 million by facilities: Nusa Dua (helipad, private beach,
  // in-villa chefs) > Uluwatu (cliff pool, wellness) > Jimbaran (1.5 ha garden, cinema)
  // > Seminyak (beachfront, rooftop) > Canggu (rooftop pool, gym) > Ubud (plunge pool, yoga)
  const DEFAULT_PROPERTIES = [
    {
      id: 'uluwatu-cliff',
      title: 'Uluwatu Cliff Villa',
      tag: 'Oceanfront',
      location: 'Uluwatu',
      nightlyRate: 4700000,
      isBestSeller: true,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      bedrooms: 6,
      bathrooms: 7,
      area: '1,160 m² (12,500 sq ft)',
      garage: '4 Cars (Basement)',
      description: "A modern architectural masterpiece on the Uluwatu clifftops, with uninterrupted views over the Indian Ocean and the island's legendary sunsets.",
      facilities: [
        'Private cliff-edge infinity pool',
        'Private path down to a secluded beach',
        'Integrated smart home automation (Crestron)',
        'Private wellness suite (sauna, steam & massage room)',
        "Italian marble chef's kitchen with separate dry kitchen",
        '24/7 private security with biometric access'
      ]
    },
    {
      id: 'seminyak-beachfront',
      title: 'Seminyak Beachfront Estate',
      tag: 'Beachfront',
      location: 'Seminyak',
      nightlyRate: 4000000,
      isBestSeller: true,
      image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      bedrooms: 5,
      bathrooms: 6,
      area: '910 m² (9,800 sq ft)',
      garage: '3 Cars',
      description: "Ultra-luxury beachfront living moments from Seminyak's finest restaurants and beach clubs, crowned by a spectacular rooftop sunset lounge.",
      facilities: [
        'Direct private beach access',
        'Rooftop sky lounge & outdoor BBQ deck',
        'Panoramic glass private lift from basement to rooftop',
        'Temperature- and humidity-controlled wine cellar',
        'Private Dolby Atmos home cinema',
        "Separate staff quarters & butler's pantry"
      ]
    },
    {
      id: 'canggu-horizon',
      title: 'Canggu Horizon Residence',
      tag: 'Rice Field View',
      location: 'Canggu',
      nightlyRate: 3500000,
      isBestSeller: true,
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
      bedrooms: 5,
      bathrooms: 5,
      area: '965 m² (10,400 sq ft)',
      garage: '3 Cars',
      description: 'A contemporary tropical residence with a rooftop terrace overlooking emerald rice fields all the way to the ocean horizon.',
      facilities: [
        '360° views over rice fields and the Indian Ocean',
        'Glass-edged rooftop pool',
        'Double-height living pavilion with teak detailing',
        'Private gym with the latest Technogym equipment',
        'Private lift lobby with fingerprint access',
        '24-hour valet & dedicated concierge'
      ]
    },
    {
      id: 'ubud-sanctuary',
      title: 'Ubud Jungle Sanctuary',
      tag: 'Signature',
      location: 'Ubud',
      nightlyRate: 3000000,
      isBestSeller: false,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      bedrooms: 4,
      bathrooms: 5,
      area: '670 m² (7,200 sq ft)',
      garage: '2 Cars',
      description: 'Minimalist modern elegance in harmony with the lush jungle of the Ayung River valley, minutes from the heart of Ubud.',
      facilities: [
        'Direct views over the Ayung River valley',
        'Infinity plunge pool & teak sun deck',
        'Balinese zen garden by an international landscape studio',
        'Master suite with a Milan-designed walk-in closet',
        'Energy-efficient, eco-friendly smart climate control',
        'Private yoga & meditation pavilion'
      ]
    },
    {
      id: 'nusa-dua-royal',
      title: 'The Nusa Dua Royal Residence',
      tag: 'Ultra Luxury',
      location: 'Nusa Dua',
      nightlyRate: 5000000,
      isBestSeller: false,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      bedrooms: 6,
      bathrooms: 8,
      area: '1,410 m² (15,200 sq ft)',
      garage: '5 Cars',
      description: "The pinnacle of prestige within Nusa Dua's exclusive resort enclave, designed for the most discerning way of life.",
      facilities: [
        'Private beachfront pool pavilion',
        'Helipad access & VIP resort privileges',
        'Private in-villa dining by Michelin-trained chefs',
        'Residents-only entrance & private drop-off',
        'Wraparound terrace with open-ocean views',
        '2 km of private white-sand beach access'
      ]
    },
    {
      id: 'jimbaran-bay',
      title: 'Jimbaran Bay Sanctuary',
      tag: 'Estate Villa',
      location: 'Jimbaran',
      nightlyRate: 4300000,
      isBestSeller: false,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      bedrooms: 5,
      bathrooms: 6,
      area: '1,020 m² (11,000 sq ft)',
      garage: '4 Cars',
      description: 'A grand hillside estate overlooking the calm waters of Jimbaran Bay, with lush tropical gardens and the highest level of privacy.',
      facilities: [
        '1.5-hectare landscaped tropical garden',
        'Outdoor pool pavilion & resort-style cabanas',
        'Mahogany-panelled cigar lounge',
        '12-seat first-class private cinema',
        'Comprehensive biometric perimeter security',
        'Underground garage with a car lift'
      ]
    }
  ];

  let legacyDataMigrated = false;

  function readJSON(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error('Failed to read local database: ' + key, e);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Failed to write local database: ' + key, e);
      return false;
    }
  }

  function removeKey(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear local database: ' + key, e);
    }
  }

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Seed the local database with a demo member and the default catalog if missing
  function initDB() {
    let users = readJSON(USERS_STORAGE_KEY, null);
    if (!Array.isArray(users)) {
      users = [
        {
          id: 'usr_demo_01',
          name: 'Budi Santoso',
          email: 'budi@oasis.id',
          password: 'password123',
          createdAt: new Date().toISOString()
        }
      ];
      writeJSON(USERS_STORAGE_KEY, users);
    }

    const storedProps = readJSON(PROPERTIES_STORAGE_KEY, null);
    if (!Array.isArray(storedProps) || storedProps.length === 0) {
      writeJSON(PROPERTIES_STORAGE_KEY, copy(DEFAULT_PROPERTIES));
    }

    const storedTestimonials = readJSON(TESTIMONIALS_STORAGE_KEY, null);
    if (!Array.isArray(storedTestimonials) || storedTestimonials.length === 0) {
      writeJSON(TESTIMONIALS_STORAGE_KEY, copy(DEFAULT_TESTIMONIALS));
    }

    if (!legacyDataMigrated) {
      legacyDataMigrated = true;
      migrateLegacyData(users);
    }
  }

  // Upgrades data saved by older versions of the site (bookings had no owner or status)
  function migrateLegacyData(users) {
    const bookings = readJSON(BOOKINGS_STORAGE_KEY, []);
    if (Array.isArray(bookings)) {
      let changed = false;
      bookings.forEach((b) => {
        if (!b.type) {
          b.type = b.refNo && b.refNo.includes('VISIT') ? 'viewing' : 'meeting';
          changed = true;
        }
        if (!b.status) {
          b.status = 'confirmed';
          changed = true;
        }
        if (!b.userId && b.email) {
          const owner = users.find((u) => String(u.email || '').toLowerCase() === String(b.email).toLowerCase());
          if (owner) {
            b.userId = owner.id;
            changed = true;
          }
        }
      });
      if (changed) writeJSON(BOOKINGS_STORAGE_KEY, bookings);
    }

    // OASIS became a nightly rental: the old sale price is dropped and every villa gets a nightly rate
    const properties = readJSON(PROPERTIES_STORAGE_KEY, []);
    if (Array.isArray(properties)) {
      let changed = false;
      properties.forEach((p) => {
        if ('price' in p) {
          delete p.price;
          changed = true;
        }
        const preset = DEFAULT_PROPERTIES.find((d) => d.id === p.id);
        if (p.nightlyRate == null || (preset && p.nightlyRate === PREVIOUS_NIGHTLY_RATES[p.id])) {
          p.nightlyRate = preset ? preset.nightlyRate : 0;
          changed = true;
        }
      });
      if (changed) writeJSON(PROPERTIES_STORAGE_KEY, properties);
    }

    // The demo account used a UAE domain before the move to Bali
    const demo = users.find((u) => u.id === 'usr_demo_01' && u.email === 'budi@oasis.ae');
    if (demo && !users.some((u) => u.email === 'budi@oasis.id')) {
      demo.email = 'budi@oasis.id';
      writeJSON(USERS_STORAGE_KEY, users);
    }
  }

  /* ---------------- Members ---------------- */

  function getAllUsers() {
    initDB();
    const users = readJSON(USERS_STORAGE_KEY, []);
    return Array.isArray(users) ? users : [];
  }

  function findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = String(email).trim().toLowerCase();
    return getAllUsers().find((u) => String(u.email || '').toLowerCase() === cleanEmail) || null;
  }

  function findUserById(id) {
    if (!id) return null;
    return getAllUsers().find((u) => u.id === id) || null;
  }

  // Register a new member
  function registerUser({ name, email, password }) {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, message: 'All fields are required.' };
    }

    // Same limits as the admin member editor (updateUserProfile / resetUserPassword)
    if (cleanName.length > 100) {
      return { success: false, message: 'Name must be between 1 and 100 characters.' };
    }

    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128 || !password.trim()) {
      return { success: false, message: 'Password must be between 6 and 128 characters.' };
    }

    if (findUserByEmail(cleanEmail)) {
      return { success: false, message: 'This email is already registered. Please use another email or log in instead.' };
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: cleanName,
      email: cleanEmail,
      password: password,
      createdAt: new Date().toISOString()
    };

    const users = getAllUsers();
    users.push(newUser);
    if (!writeJSON(USERS_STORAGE_KEY, users)) {
      return { success: false, message: 'Your account could not be saved. Please free up browser storage and try again.' };
    }

    return { success: true, message: 'Registration successful! Please log in with your new account.', user: newUser };
  }

  function updateUserProfile(userId, { name, email }) {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanName || cleanName.length > 100) {
      return { success: false, message: 'Name must be between 1 and 100 characters.' };
    }
    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const users = getAllUsers();
    const user = users.find((entry) => entry.id === userId);
    if (!user) return { success: false, message: 'This member no longer exists.' };
    if (users.some((entry) => entry.id !== userId && entry.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'This email is already registered to another member.' };
    }

    user.name = cleanName;
    user.email = cleanEmail;
    if (!writeJSON(USERS_STORAGE_KEY, users)) {
      return { success: false, message: 'Changes could not be saved. Please try again.' };
    }
    return { success: true, message: 'Member profile updated.' };
  }

  function resetUserPassword(userId, password) {
    if (typeof password !== 'string' || password.length < 6 || password.length > 128 || !password.trim()) {
      return { success: false, message: 'Password must be between 6 and 128 characters.' };
    }
    const users = getAllUsers();
    const user = users.find((entry) => entry.id === userId);
    if (!user) return { success: false, message: 'This member no longer exists.' };

    user.password = password;
    // A version change invalidates existing sessions even if clearing storage fails.
    user.credentialVersion = (Number(user.credentialVersion) || 0) + 1;
    if (!writeJSON(USERS_STORAGE_KEY, users)) {
      return { success: false, message: 'Password could not be saved. Please try again.' };
    }
    const session = readJSON(CURRENT_USER_KEY, null);
    if (session && session.id === userId) removeKey(CURRENT_USER_KEY);
    return { success: true, message: 'OASIS password reset. The member must sign in again.' };
  }

  // Member login
  function loginUser(email, password) {
    const user = findUserByEmail(email);

    if (!user) {
      return { success: false, message: 'No account found for this email. Please register first.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      credentialVersion: Number(user.credentialVersion) || 0,
      loginAt: new Date().toISOString()
    };
    writeJSON(CURRENT_USER_KEY, sessionData);

    return { success: true, message: 'Login successful!', user: sessionData };
  }

  // End sessions for deleted accounts or credentials reset in the admin console.
  function getCurrentUser() {
    const session = readJSON(CURRENT_USER_KEY, null);
    if (!session || !session.id) return null;

    const user = findUserById(session.id);
    if (!user || (Number(session.credentialVersion) || 0) !== (Number(user.credentialVersion) || 0)) {
      removeKey(CURRENT_USER_KEY);
      return null;
    }

    return { id: user.id, name: user.name, email: user.email, loginAt: session.loginAt };
  }

  function isAuthenticated() {
    return getCurrentUser() !== null;
  }

  function logout() {
    removeKey(CURRENT_USER_KEY);
    return true;
  }

  // Remove a member together with their bookings and reviews
  function deleteUser(userId) {
    const users = getAllUsers();
    const remaining = users.filter((u) => u.id !== userId);
    if (remaining.length === users.length) return false;

    if (!writeJSON(USERS_STORAGE_KEY, remaining)) return false;
    writeJSON(BOOKINGS_STORAGE_KEY, getAllBookings().filter((b) => b.userId !== userId));
    writeJSON(TESTIMONIALS_STORAGE_KEY, getTestimonials().filter((t) => t.userId !== userId));
    return true;
  }

  /* ---------------- Bookings ---------------- */

  // Every booking, newest first
  function getAllBookings() {
    initDB();
    const bookings = readJSON(BOOKINGS_STORAGE_KEY, []);
    return Array.isArray(bookings) ? bookings : [];
  }

  function getBookingsForUser(user) {
    if (!user) return [];
    return getAllBookings().filter((b) => b.userId === user.id);
  }

  function generateRefNo(prefix) {
    const taken = new Set(getAllBookings().map((b) => b.refNo));
    let refNo;
    do {
      refNo = prefix + '-' + Math.floor(10000 + Math.random() * 90000);
    } while (taken.has(refNo));
    return refNo;
  }

  // Returns the saved booking, or null if it could not be stored
  function addBooking(booking) {
    const record = Object.assign({ status: 'confirmed', createdAt: new Date().toISOString() }, booking);
    const bookings = getAllBookings();
    bookings.unshift(record);
    return writeJSON(BOOKINGS_STORAGE_KEY, bookings) ? record : null;
  }

  function updateBookingStatus(refNo, status) {
    if (!BOOKING_STATUSES[status]) return false;
    const bookings = getAllBookings();
    const booking = bookings.find((b) => b.refNo === refNo);
    if (!booking) return false;

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    return writeJSON(BOOKINGS_STORAGE_KEY, bookings);
  }

  function deleteBooking(refNo) {
    const bookings = getAllBookings();
    const remaining = bookings.filter((b) => b.refNo !== refNo);
    if (remaining.length === bookings.length) return false;

    return writeJSON(BOOKINGS_STORAGE_KEY, remaining);
  }

  /* ---------------- Properties ---------------- */

  function getProperties() {
    initDB();
    let properties = readJSON(PROPERTIES_STORAGE_KEY, null);
    if (!Array.isArray(properties) || properties.length === 0) {
      properties = copy(DEFAULT_PROPERTIES);
      writeJSON(PROPERTIES_STORAGE_KEY, properties);
    }
    return Array.isArray(properties) ? properties : [];
  }

  function getPropertyById(id) {
    if (!id) return null;
    return getProperties().find((p) => p.id === id) || null;
  }

  function createPropertyId(title) {
    const slug = String(title || 'property')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    return (slug || 'property') + '-' + Date.now().toString(36);
  }

  // Insert a new property or replace the one with the same id; null if it could not be stored
  function saveProperty(property) {
    const properties = getProperties();
    const index = properties.findIndex((p) => p.id === property.id);
    if (index >= 0) {
      properties[index] = property;
    } else {
      properties.push(property);
    }
    return writeJSON(PROPERTIES_STORAGE_KEY, properties) ? property : null;
  }

  function deleteProperty(id) {
    const properties = getProperties();
    const remaining = properties.filter((p) => p.id !== id);
    if (remaining.length === properties.length) return false;

    return writeJSON(PROPERTIES_STORAGE_KEY, remaining);
  }

  function resetProperties() {
    return writeJSON(PROPERTIES_STORAGE_KEY, copy(DEFAULT_PROPERTIES));
  }

  /* ---------------- Testimonials (guest reviews) ---------------- */

  // Every review, newest first
  function getTestimonials() {
    initDB();
    let testimonials = readJSON(TESTIMONIALS_STORAGE_KEY, null);
    if (!Array.isArray(testimonials) || testimonials.length === 0) {
      testimonials = copy(DEFAULT_TESTIMONIALS);
      writeJSON(TESTIMONIALS_STORAGE_KEY, testimonials);
    }
    return Array.isArray(testimonials) ? testimonials : [];
  }

  function getPublishedTestimonials() {
    let published = getTestimonials().filter((t) => t.status === 'published');
    if (published.length === 0) {
      resetTestimonials();
      published = getTestimonials().filter((t) => t.status === 'published');
    }
    return published;
  }

  function resetTestimonials() {
    return writeJSON(TESTIMONIALS_STORAGE_KEY, copy(DEFAULT_TESTIMONIALS));
  }

  // A member writes a review; it is published straight away (admins can hide it)
  function addTestimonial({ userId, name, city, propertyId, nights, rating, text }) {
    const user = findUserById(userId);
    if (!user) {
      return { success: false, message: 'Please log in to share your stay.' };
    }

    const property = getPropertyById(propertyId);
    const cleanName = String(name || '').trim();
    const cleanCity = String(city || '').trim();
    const cleanText = String(text || '').trim();
    const cleanRating = Number(rating);
    const cleanNights = Number(nights);

    if (!Number.isInteger(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      return { success: false, message: 'Please choose a rating from 1 to 5 stars.' };
    }
    if (!property) {
      return { success: false, message: 'Please choose the villa you stayed in.' };
    }
    if (!Number.isInteger(cleanNights) || cleanNights < 1 || cleanNights > 365) {
      return { success: false, message: 'Please enter how many nights you stayed (1–365).' };
    }
    if (cleanText.length < 20 || cleanText.length > 500) {
      return { success: false, message: 'Your review should be between 20 and 500 characters.' };
    }
    if (cleanName.length < 2 || cleanName.length > 40) {
      return { success: false, message: 'Please enter the name to show (2–40 characters).' };
    }
    if (cleanCity.length > 60) {
      return { success: false, message: 'City / country can be at most 60 characters.' };
    }

    const testimonials = getTestimonials();
    if (testimonials.some((t) => t.userId === user.id && t.propertyId === property.id)) {
      return { success: false, message: 'You have already reviewed this villa. Delete your earlier review to write a new one.' };
    }

    const testimonial = {
      id: 'tst_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      userId: user.id,
      sample: false,
      name: cleanName,
      city: cleanCity,
      propertyId: property.id,
      villa: property.title,
      nights: cleanNights,
      rating: cleanRating,
      text: cleanText,
      status: 'published',
      createdAt: new Date().toISOString()
    };
    testimonials.unshift(testimonial);
    if (!writeJSON(TESTIMONIALS_STORAGE_KEY, testimonials)) {
      return { success: false, message: 'Your review could not be saved. Please free up browser storage and try again.' };
    }

    return { success: true, message: 'Thank you! Your review is now live.', testimonial };
  }

  function updateTestimonialStatus(id, status) {
    if (!TESTIMONIAL_STATUSES[status]) return false;
    const testimonials = getTestimonials();
    const testimonial = testimonials.find((t) => t.id === id);
    if (!testimonial) return false;

    testimonial.status = status;
    return writeJSON(TESTIMONIALS_STORAGE_KEY, testimonials);
  }

  function deleteTestimonial(id) {
    const testimonials = getTestimonials();
    const remaining = testimonials.filter((t) => t.id !== id);
    if (remaining.length === testimonials.length) return false;

    return writeJSON(TESTIMONIALS_STORAGE_KEY, remaining);
  }

  // Auto init on load
  initDB();

  return {
    BOOKING_STATUSES,
    TESTIMONIAL_STATUSES,
    getAllUsers,
    findUserByEmail,
    findUserById,
    registerUser,
    updateUserProfile,
    resetUserPassword,
    loginUser,
    getCurrentUser,
    isAuthenticated,
    logout,
    deleteUser,
    getAllBookings,
    getBookingsForUser,
    generateRefNo,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    getProperties,
    getPropertyById,
    createPropertyId,
    saveProperty,
    deleteProperty,
    resetProperties,
    resetTestimonials,
    getTestimonials,
    getPublishedTestimonials,
    addTestimonial,
    updateTestimonialStatus,
    deleteTestimonial
  };
})();

const OasisUtils = (function () {
  // Bali runs on WITA (Central Indonesia Time, UTC+8), IANA zone Asia/Makassar
  const BALI_TIMEZONE = 'Asia/Makassar';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Makes a URL safe to place inside CSS url("...")
  function cssUrl(url) {
    return String(url || '').replace(/["'()\\\s]/g, (ch) => '%' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
  }

  function initials(name) {
    const letters = String(name || '')
      .trim()
      .split(/\s+/)
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return letters || 'U';
  }

  // Public display name: "Ayu Sari Putri" -> "Ayu S.", "Budi" -> "Budi"
  function shortName(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  }

  function baliParts(date) {
    const parts = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: BALI_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(date || new Date())
      .forEach((part) => {
        parts[part.type] = part.value;
      });
    return parts;
  }

  // Today's date in Bali as YYYY-MM-DD (for <input type="date"> min values)
  function baliTodayISO() {
    const p = baliParts();
    return `${p.year}-${p.month}-${p.day}`;
  }

  // Minutes since midnight, Bali time
  function baliNowMinutes() {
    const p = baliParts();
    return Number(p.hour) * 60 + Number(p.minute);
  }

  // "14:32 WITA"
  function baliClock() {
    const p = baliParts();
    return `${p.hour}:${p.minute} WITA`;
  }

  // Fixed names, so every browser prints the same text ("Sep", never "Sept")
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function parseISODate(isoDate) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
    return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : null;
  }

  // "2026-09-21" -> "Monday, 21 September 2026" (a calendar date, so no time-zone shift)
  function formatDateLong(isoDate) {
    const d = parseISODate(isoDate);
    if (!d) return isoDate || '';
    return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  // "2026-09-21" -> "Mon, 21 Sep 2026"
  function formatDateShort(isoDate) {
    const d = parseISODate(isoDate);
    if (!d) return isoDate || '';
    return `${DAYS[d.getUTCDay()].slice(0, 3)}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
  }

  // "2026-09-21" + 3 -> "2026-09-24" (calendar arithmetic, no time-zone shift)
  function addDaysISO(isoDate, days) {
    const d = parseISODate(isoDate);
    if (!d) return '';
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // Nights from check-in to check-out; 0 when a date is missing or check-out is not later
  function nightsBetween(checkIn, checkOut) {
    const start = parseISODate(checkIn);
    const end = parseISODate(checkOut);
    if (!start || !end) return 0;
    return Math.max(0, Math.round((end - start) / 86400000));
  }

  // ISO timestamp -> "21 Sep 2026, 14:32 WITA"
  function formatBaliDateTime(isoString) {
    const d = new Date(isoString);
    if (!isoString || isNaN(d.getTime())) return '-';
    const p = baliParts(d);
    return `${Number(p.day)} ${MONTHS[Number(p.month) - 1].slice(0, 3)} ${p.year}, ${p.hour}:${p.minute} WITA`;
  }

  // First "HH:MM" in a session label -> minutes since midnight
  function slotStartMinutes(label) {
    const m = /(\d{1,2}):(\d{2})/.exec(label || '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }

  /* Rupiah formatting, full amount with English comma grouping */

  // 4700000 -> "Rp 4,700,000"
  function formatIdr(amount) {
    return 'Rp ' + Math.round(Number(amount) || 0).toLocaleString('en-US');
  }

  // 4700000 -> "Rp 4,700,000 / night"
  function formatNightlyRate(rate) {
    return Number(rate) > 0 ? `${formatIdr(rate)} / night` : 'Rate on request';
  }

  return {
    BALI_TIMEZONE,
    escapeHtml,
    cssUrl,
    initials,
    shortName,
    formatIdr,
    formatNightlyRate,
    baliTodayISO,
    baliNowMinutes,
    baliClock,
    formatDateLong,
    formatDateShort,
    addDaysISO,
    nightsBetween,
    formatBaliDateTime,
    slotStartMinutes
  };
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.OasisDB = OasisDB;
  window.OasisUtils = OasisUtils;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OasisDB, OasisUtils };
}
