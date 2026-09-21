# OASIS — PRD · TRD · DRD (Ringkas)

| | |
|---|---|
| **Produk** | OASIS — Sewa villa mewah privat per malam, Bali |
| **Versi** | 1.2 · 21 September 2026 |
| **Platform** | Website statis (HTML, CSS, JavaScript murni), tanpa server |
| **Pasar** | Bali · Website berbahasa Inggris · Harga Rupiah · Waktu WITA (UTC+8) |
| **Kontak admin** | `oasis@gmail.com` · **0821-7980-8686** (telepon & WhatsApp, format website `+62 821-7980-8686`) |
| **Dokumen terkait** | `README.md` (cara menjalankan) · `latarbelakang.md` (alasan, nama, logo, warna) · `jawabanpresentasi.md` (naskah & tanya jawab presentasi) |

**Baru di v1.2:** tombol CS **OASIS Concierge** (logo headset, selalu tampil) berisi tanya-jawab tentang website, semua villa tampil untuk semua pengunjung (tidak lagi hanya Best Seller untuk guest), reservasi villa lewat WhatsApp untuk semua pengunjung, tombol "Confirm on WhatsApp" di setiap booking, semua nomor HP diganti ke nomor admin, akun admin baru `BagaskaraAP`.

---

## 1. PRD — Kebutuhan Produk

### 1.1 Ringkasan

OASIS adalah website **sewa villa mewah per malam** di Bali (Rp 3–5 juta/malam). Siapa pun bisa memilih villa dan mengirim permintaan reservasi ke admin lewat **WhatsApp** dengan pesan yang sudah terisi otomatis. Member juga bisa booking meeting dan viewing, lalu mendapat e-ticket. Admin mengelola booking, member, villa, dan testimoni dari halaman tersembunyi. OASIS tidak menjual villa.

### 1.2 Pengguna

| Pengguna | Bisa apa |
|---|---|
| **Guest** (belum login) | Lihat **semua villa** + tarif, **reservasi via WhatsApp** untuk villa mana pun, baca testimoni, lihat kontak. |
| **Member** (terdaftar) | Semua fitur guest + ringkasan spesifikasi di kartu, detail villa, booking meeting/viewing, e-ticket, testimoni. |
| **Admin** (`BagaskaraAP`) | Terima reservasi di WhatsApp 0821-7980-8686; kelola booking, member, villa, testimoni di `indexadmin.html`. |

### 1.3 Alur utama

**A. Reservasi via WhatsApp (guest & member)**

```
Tombol Book (kartu villa) / Book This Villa (detail) / Book Your Stay (banner & panel CS)
  → Form: villa, check-in, check-out, jumlah tamu, nama, permintaan khusus (opsional)
  → Ringkasan langsung: "3 nights × Rp 4,000,000 = Rp 12,000,000"
  → "Continue to WhatsApp"
  → WhatsApp terbuka ke 0821-7980-8686 dengan pesan template (lihat 2.3)
  → Tamu tekan Send → admin membalas di WhatsApp (cek ketersediaan, konfirmasi harga)
  → Di website tampil pratinjau pesan + tombol "Open WhatsApp" (jika WhatsApp tidak terbuka)
```

**B. Booking meeting / viewing (member)**

```
Guest klik Book a Meeting / Schedule a Viewing → diarahkan ke login → login
  → isi form (tanggal & sesi WITA) → e-ticket OASIS-MTG-##### / OASIS-VISIT-#####
  → "Confirm on WhatsApp": chat ke admin berisi nomor referensi, tanggal, jam
  → e-ticket tersimpan di "E-Tickets" (bisa dicetak, ada tombol WhatsApp juga)
```

**C. Testimoni (member):** Share Your Stay → rating, villa, jumlah malam, ulasan → langsung tayang → admin bisa sembunyikan/hapus.

**D. Admin:** buka `indexadmin.html` → login `BagaskaraAP` → Overview · Bookings · Members · Properties · Reviews → Log out (sesi juga berakhir saat tab ditutup).

**E. Tanya CS (semua pengunjung)**

```
Tombol "Need help?" (logo headset, kanan bawah, selalu ada)
  → Panel OASIS Concierge
      ├─ Book Your Stay → form reservasi (alur A)
      ├─ Chat with Us   → WhatsApp admin dengan sapaan "I have a question about your villas"
      └─ 8 tanya-jawab  → jumlah villa, lokasi & rentang tarif diambil dari katalog terbaru
  → Tutup: ×, Esc, atau klik di luar panel
```

### 1.4 Kebutuhan fungsional

| Kelompok | Kebutuhan |
|---|---|
| **Katalog** | Semua pengunjung melihat semua villa, Best Seller di urutan atas. "View Full Catalog" tidak butuh login. Best Seller = badge emas, urutan atas, dan villa pertama tampil di hero. Kartu: foto, tag, nama, lokasi, tarif `Rp 4,700,000 / night`, tombol **Details →** dan **Book**. Tanpa tarif → `Rate on request`. |
| **Reservasi WhatsApp** | Terbuka untuk semua pengunjung. Villa wajib (semua villa bisa dipilih), check-in ≥ hari ini (WITA), check-out minimal 1 malam setelahnya (terisi otomatis), maks. 365 malam, tamu 1–30, nama wajib, catatan maks. 300 karakter. Nama member terisi otomatis dan email member ikut di pesan. Reservasi **tidak disimpan** di website; catatannya ada di chat WhatsApp admin. |
| **Akun member** | Registrasi (nama 1–100, email unik, password 6–128), login, logout. Sesi berakhir jika akun dihapus atau password di-reset admin. |
| **Meeting** | Sesi 10:00–11:30, 14:00–15:30, 16:30–18:00, 20:00–21:00 WITA; topik stay, long stay, wedding, retreat. Tanggal/sesi yang sudah lewat ditolak. |
| **Viewing** | Sesi Morning 09:30–11:30, Afternoon 13:30–15:30, Sunset 16:30–18:30 WITA; pilih villa dan jumlah tamu. |
| **E-ticket** | Riwayat per member (All / Meetings / Viewings), status Confirmed / Completed / Cancelled, cetak A4, pratinjau email + `mailto:`, tombol WhatsApp berisi nomor referensi. |
| **Testimoni** | 6 terbaru + "Show all"; satu ulasan per villa per member; member bisa hapus ulasannya sendiri; 3 ulasan awal hanya contoh. |
| **Admin** | Halaman `indexadmin.html` tanpa link publik (`noindex`). Overview (statistik), Bookings (cari, filter, ubah status, hapus), Members (edit, reset password, hapus), Properties (tambah/edit/hapus, Best Seller, restore default), Reviews (tayang/sembunyi, hapus). |
| **Concierge (CS)** | Tombol "Need help?" berlogo headset (`oasis-cs.svg`) selalu ada di kanan bawah. Panel berisi tombol **Book Your Stay** dan **Chat with Us** (WhatsApp admin), serta 8 tanya-jawab: apa itu OASIS, cara booking, harga, pembayaran, akun, meeting & viewing, zona waktu, kontak. Jumlah villa, lokasi, dan rentang tarif diambil langsung dari katalog. Tutup dengan ×, Esc, atau klik di luar panel. |
| **Mobile** | ≤ 980 px menu hamburger; ≤ 720 px header ringkas + bar aksi cepat di bawah + tombol CS bulat di atasnya. |
| **Kontak & waktu** | Semua nomor HP = **+62 821-7980-8686** (footer: telepon + WhatsApp, email konfirmasi, template). Semua jam dalam WITA. |

### 1.5 Aturan bisnis

- Hanya sewa per malam; harga selalu lengkap: `Rp 4,700,000 / night` (tanpa "M"/"B").
- Total di form reservasi adalah **estimasi** (malam × tarif). Harga final dan ketersediaan dikonfirmasi admin di WhatsApp; tidak ada pembayaran online.
- Booking meeting/viewing baru berstatus Confirmed; admin bisa ubah ke Completed/Cancelled.

### 1.6 Di luar cakupan & risiko

| Di luar cakupan v1.2 | Risiko | Penanganan |
|---|---|---|
| Pembayaran online, kalender ketersediaan, pesan WhatsApp otomatis dari server | Data per browser (localStorage): admin hanya melihat booking dari browser yang sama | Backend di v2.0 |
| Email transaksional sungguhan | Username & password admin terbaca di `admin.js` | Login di server (v2.0); halaman admin tidak ditautkan & `noindex` |
| Lebih dari satu admin | Password member tidak dienkripsi | Hash di server (v2.0) |
| | Reservasi WhatsApp tidak tercatat di dashboard admin | Admin mencatat di WhatsApp; simpan ke database di v2.0 |

---

## 2. TRD — Kebutuhan Teknis

### 2.1 Arsitektur

```
Browser
 ├─ index.html / login.html / register.html ─ main.js ─┐
 ├─ indexadmin.html ─ admin.js ────────────────────────┤
 │                                                     ▼
 │                                  db.js (OasisDB, OasisUtils)
 │                                  localStorage (member, booking, villa, testimoni)
 │                                  sessionStorage (sesi admin)
 └─ Link wa.me ──► WhatsApp (aplikasi / WhatsApp Web) ──► admin 0821-7980-8686
CDN: AOS, Tailwind Play CDN (login & admin), Google Fonts, foto Unsplash
```

### 2.2 File

| File | Isi |
|---|---|
| `index.html` | Halaman utama, semua modal (reservasi, booking, detail, e-ticket, email, testimoni), tombol & panel CS (Concierge), simbol ikon `#waGlyph`. |
| `main.js` | Katalog (`renderCatalog`, `catalogProperties`), header, booking, e-ticket, testimoni, menu mobile, **reservasi WhatsApp** (`OASIS_CONTACT`, `whatsappUrl`, `buildReservationMessage`, `validateReservation`), **CS** (`setupConcierge`, `renderConciergeFacts`). |
| `db.js` | Data (`OasisDB`) dan helper (`OasisUtils`: escape, WITA, Rupiah, `addDaysISO`, `nightsBetween`). |
| `admin.js`, `indexadmin.html` | Login & dashboard admin (`ADMIN_ACCOUNT`, `AdminAuth`). |
| `login.html`, `register.html` | Login & registrasi member. |
| `style.css` | Semua style, termasuk bagian "WHATSAPP RESERVATIONS" dan "CONCIERGE". |
| `oasis-mark.svg` · `oasis-cs.svg` | Logo OASIS (palem + ombak) · logo CS (headset emas + ombak). |
| `tests/*.test.cjs` | 18 unit test (Node). |
| `README.md`, `latarbelakang.md`, `jawabanpresentasi.md`, dokumen ini | Dokumentasi. |

### 2.3 Integrasi WhatsApp

- Memakai **Click to Chat** (`https://wa.me/6282179808686?text=<pesan ter-encode>`), **tanpa API key**. Nomor diatur di satu tempat: `OASIS_CONTACT.whatsapp` di `main.js` (format internasional tanpa `+` dan tanpa 0 di depan).
- Kenapa bukan WhatsApp Business API: API resmi butuh akun Meta Business terverifikasi, server untuk menyimpan token, dan template pesan yang disetujui Meta. Token tidak boleh ditaruh di website statis karena bisa dibaca siapa pun. Bisa ditambahkan di v2.0 (backend) untuk notifikasi otomatis.
- Form dikirim → `window.open(url, '_blank', 'noopener')` → modal pratinjau dengan link cadangan jika pop-up diblokir.

**Template reservasi** (baris opsional hanya muncul jika ada isinya):

```
*OASIS Villa Reservation Request*

Villa: Seminyak Beachfront Estate (Seminyak)
Rooms: 5 bedrooms · 6 bathrooms
Check-in: Mon, 28 Sep 2026
Check-out: Thu, 1 Oct 2026
Length of stay: 3 nights
Guests: 4
Nightly rate: Rp 4,000,000 / night
Estimated total: Rp 12,000,000

Name: Rizky Aditya
OASIS member: budi@oasis.id          ← hanya jika login
Special requests: Airport pickup     ← hanya jika diisi

Is this villa available for these dates? Thank you.
```

**Template konfirmasi booking:** `Hello OASIS, I have just booked a meeting / scheduled a villa viewing…` + Reference, Consultation/Villa, Date, Time, Name.

### 2.4 Data (localStorage kecuali disebut lain)

| Kunci | Isi |
|---|---|
| `oasis_users_db` | Member `{ id, name, email, password, credentialVersion, createdAt }` (awal: demo `budi@oasis.id` / `password123`). |
| `oasis_current_user` | Sesi member. |
| `oasis_booking_history` | Booking `{ refNo, type: meeting/viewing, status, userId, name, email, rawDate, date, time, topic, property, guests, createdAt }`. |
| `oasis_properties_db` | Villa `{ id, title, location, tag, nightlyRate, isBestSeller, image, bedrooms, bathrooms, area, garage, description, facilities[] }`. |
| `oasis_testimonials_db` | Testimoni `{ id, userId, sample, name, city, propertyId, villa, nights, rating, text, status, createdAt }`. |
| `oasis_admin_session` | sessionStorage: `{ username, loginAt }`. |

Reservasi WhatsApp tidak memakai storage.

### 2.5 Login & keamanan

- **Admin:** username `BagaskaraAP` (huruf besar/kecil bebas), password persis seperti di `ADMIN_ACCOUNT` (`admin.js`). Sesi admin dari akun lama otomatis tidak berlaku. Login admin dan member terpisah.
- Semua teks dari pengguna di-escape (`escapeHtml`) sebelum tampil; pesan WhatsApp di-encode dengan `encodeURIComponent`; pratinjau memakai `textContent`.
- Semua penulisan data melaporkan gagal dengan jujur jika storage penuh.

### 2.6 Waktu & Rupiah

- "Hari ini" dan jam dihitung di `Asia/Makassar` (WITA). Tanggal kalender disimpan `YYYY-MM-DD`; jumlah malam dihitung dari tanggal (tanpa geser zona waktu).
- Rupiah disimpan sebagai angka utuh, tampil `Rp 12,000,000`.

### 2.7 Pengujian

| Level | Isi |
|---|---|
| Unit (`node --test tests/member-admin.test.cjs tests/whatsapp-admin.test.cjs`) | Member & admin (18 tes): login admin baru/lama, hitung malam, template pesan, link wa.me, aturan reservasi, semua villa tampil (Best Seller di atas). |
| End-to-end (Chrome headless) | Reservasi guest & member, validasi, panel CS (buka, tutup, isi, Book Your Stay), tombol banner/detail, WhatsApp di meeting/viewing/e-ticket, tampilan HP, login admin; tanpa error di console. |

**Uji manual cepat**

- *User:* buka `index.html` → klik **Book** di kartu villa (atau **Need help?** → **Book Your Stay**) → isi tanggal & nama → **Continue to WhatsApp** → pastikan WhatsApp terbuka ke 0821-7980-8686 dengan pesan lengkap. Login `budi@oasis.id` / `password123` → booking viewing → **Confirm on WhatsApp**.
- *Admin:* buka `indexadmin.html` → login `BagaskaraAP` → cek booking yang tadi dibuat → ubah status → pastikan "Signed in as BagaskaraAP".

### 2.8 Deployment & backend

- Menjalankan lokal: double-click `index.html` (Chrome/Edge), atau `python -m http.server 8080` di folder proyek lalu buka `http://localhost:8080`. Butuh internet untuk Tailwind, AOS, Google Fonts, dan foto.
- Deploy: push ke GitHub (`ayusarii/oasis_luxury`) → Settings → Pages → branch `main`, root. Website `https://ayusarii.github.io/oasis_luxury/`, admin `…/indexadmin.html` (bagikan privat).
- v2.0 (Firebase/Supabase): auth dengan password ter-hash, tabel `bookings` / `reservations` / `properties` / `testimonials`, peran admin di server, lalu opsional WhatsApp Business API untuk notifikasi otomatis. Nama fungsi `OasisDB` dipertahankan.

---

## 3. DRD — Kebutuhan Desain

### 3.1 Prinsip & warna

Mewah yang tenang (krem, cokelat, aksen emas), harga selalu `Rp`, jam selalu `WITA`, dan satu gaya untuk e-ticket, email, testimoni, dan admin.

| Token | Hex | Untuk |
|---|---|---|
| `--cream` / `--cream-strong` | `#faf6f0` / `#f3ece2` | Latar, kotak ringkasan reservasi |
| `--brown` / `--brown-dark` | `#5a3e36` / `#3b2721` | Tombol utama, judul, footer |
| Emas | `#f7d57f` / `#e7c88b` / `#c5a059` | Logo OASIS & logo CS, judul panel CS, tab aktif, garis fokus |
| `--whatsapp` / `--whatsapp-dark` | `#0b8043` / `#096b38` | Hanya tombol yang langsung membuka WhatsApp (teks putih, kontras 5:1); tombol booking utama tetap cokelat |
| Status | Confirmed `#3730a3`, Completed `#047857`, Cancelled `#b91c1c` | Label status |

Font: Georgia + Arial (website); Playfair Display + Plus Jakarta Sans (login, admin).

### 3.2 Komponen

| Komponen | Spesifikasi |
|---|---|
| **Tombol CS (Concierge)** | Kanan bawah. Desktop: pil cokelat bergaris emas, logo headset + "Need help?". HP (≤ 720 px): lingkaran logo saja, di atas bar aksi cepat. Disembunyikan saat cetak. |
| **Panel CS** | Kartu putih 380 px di atas tombol (HP: selebar layar). Header cokelat dengan logo, judul emas "OASIS Concierge", tombol ×. Dua tombol (Book Your Stay cokelat, Chat with Us hijau), lalu daftar "Frequently asked" yang bisa dibuka satu per satu (tanda + / −). |
| **Tombol Book di kartu** | Pil kecil krem bergaris cokelat dengan ikon WhatsApp, di kanan baris "Details →"; cokelat penuh saat hover. |
| **Modal reservasi** | Judul "Book Your Stay". Villa; check-in + check-out; tamu + nama; permintaan khusus (textarea pendek); kotak ringkasan krem ("Estimated total · 3 nights × Rp …" kiri, total serif kanan); tombol hijau "Continue to WhatsApp"; catatan "Nothing is charged online…". |
| **Modal pesan siap** | Lencana hijau ikon WhatsApp, judul "Your Request Is Ready", pratinjau pesan dalam kotak hijau muda (bisa di-scroll), tombol "Open WhatsApp", link "Close". |
| **Detail villa** | Dua tombol berdampingan: "Schedule a Viewing" (krem) + "Book This Villa" (cokelat, tombol utama); bertumpuk di ≤ 640 px. |
| **Sukses meeting/viewing & riwayat e-ticket** | Tambahan tombol hijau "Confirm on WhatsApp" / "Chat on WhatsApp". |
| **Footer kontak** | Email, telepon `+62 821-7980-8686`, link "WhatsApp: +62 821-7980-8686", jam Bali. |
| Lainnya | Kartu villa, e-ticket, email, testimoni, admin: tidak berubah dari v1.1. |

### 3.3 Breakpoint

| Lebar | Perilaku |
|---|---|
| > 980 px | Desktop penuh. |
| ≤ 980 px | Menu hamburger, grid 2 kolom. |
| ≤ 720 px | Header ringkas, bar aksi cepat, tombol CS bulat, panel CS selebar layar, grid 1 kolom. |
| ≤ 640 px | Baris form bertumpuk; tombol detail villa bertumpuk. |

### 3.4 Teks & aksesibilitas

- Teks website berbahasa Inggris; nada tenang; kosakata sewa (stay, guests), bukan jual-beli.
- Nomor telepon tidak terpotong baris (`.text-nowrap`).
- Setiap isian punya label; error pakai `role="alert"`; ringkasan total `aria-live`; tombol ikon punya `aria-label`; modal bisa ditutup dengan ×, klik luar, atau Esc, dan fokus kembali ke tombol pembuka.
