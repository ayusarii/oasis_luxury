# 🌴 OASIS — Naskah & Bank Jawaban Presentasi

> **Website sewa villa mewah per malam di Bali**
> Presentasi **maks. 15 menit** + tanya jawab **10 menit**.
> Dokumen ini berisi: persiapan, pembagian peran, rundown per menit, naskah bicara, alur demo, penjelasan desain, arsitektur, alur data, "backend", arti kode, dan **60+ pertanyaan mentor beserta jawabannya**.

---

## 📋 Daftar Isi

1. [Apa yang dinilai mentor & di mana jawabannya](#1-apa-yang-dinilai-mentor--di-mana-jawabannya)
2. [Checklist persiapan (malam ini & sebelum tampil)](#2-checklist-persiapan)
3. [Pembagian peran](#3-pembagian-peran)
4. [Rundown 15 menit](#4-rundown-15-menit)
5. [Naskah bicara per bagian](#5-naskah-bicara-per-bagian)
6. [Skenario demo (klik demi klik)](#6-skenario-demo-klik-demi-klik)
7. [Desain: warna, layout, logo, font](#7-desain-warna-layout-logo-font)
8. [Arsitektur & library](#8-arsitektur--library)
9. [Alur data](#9-alur-data)
10. ["Backend-nya mana?" (bagian terpenting)](#10-backend-nya-mana)
11. [Bedah kode: arti kode penting](#11-bedah-kode-arti-kode-penting)
12. [Bank pertanyaan & jawaban](#12-bank-pertanyaan--jawaban)
13. [Glosarium istilah kode](#13-glosarium-istilah-kode)
14. [Contekan 1 halaman](#14-contekan-1-halaman)

---

## 1. Apa yang dinilai mentor & di mana jawabannya

| # | Kriteria dari mentor | Yang harus kita tunjukkan | Bagian dokumen |
|---|---|---|---|
| 1 | **Komposisi website** (warna, layout) | Alasan warna krem-cokelat-emas, tata letak per section, responsif HP | [§7](#7-desain-warna-layout-logo-font) |
| 2a | **Paham program** | Bisa menjelaskan fitur dan **arti kode** di baliknya | [§11](#11-bedah-kode-arti-kode-penting) |
| 2b | **Paham alur data** | Data dari form → disimpan di mana → dibaca siapa | [§9](#9-alur-data) |
| 2c | **Paham arsitektur** | File apa berisi apa, **library apa & untuk apa** | [§8](#8-arsitektur--library) |
| 3 | **Kesiapan & penyampaian** | Rundown rapi, demo lancar, jawaban tenang & jujur | [§4](#4-rundown-15-menit)–[§6](#6-skenario-demo-klik-demi-klik) |
| ⭐ | **Deploy** (opsional, nilai plus) | Link online yang bisa dibuka mentor | [§2](#deploy-opsional-tapi-nilai-plus) |
| ⚠️ | **"Backend-nya gimana?"** (hampir pasti ditanya) | Jujur: tanpa server, `db.js` = lapisan data; rencana backend nyata | [§10](#10-backend-nya-mana) |

> 💡 **Pesan kunci untuk seluruh presentasi:**
> *"OASIS adalah website statis yang kami rancang seperti aplikasi sungguhan: semua data lewat satu pintu (`db.js`), sehingga kalau nanti pakai server, cukup `db.js` yang diganti."*

---

## 2. Checklist persiapan

### Malam ini

- [ ] Semua anggota **baca §10 (backend) dan §11 (arti kode)**. Ini yang paling mungkin ditanya.
- [ ] Latihan demo minimal 2 kali sambil pakai timer (target demo ≤ 6 menit).
- [ ] Tentukan siapa menjawab pertanyaan jenis apa (lihat [§3](#3-pembagian-peran)).
- [ ] Siapkan **screenshot cadangan** tiap langkah demo (kalau internet/laptop bermasalah).
- [ ] Login **WhatsApp Web** di laptop presentasi (supaya demo WhatsApp langsung terbuka), atau siapkan HP.

### 30 menit sebelum tampil

- [ ] **Internet wajib nyala.** Tailwind (halaman login & admin), AOS (animasi), Google Fonts, dan foto villa (Unsplash) dimuat dari internet. Tanpa internet, halaman login/admin tampil berantakan. **Siapkan hotspot HP.**
- [ ] Ekstrak `oasis-luxury.zip`, lalu jalankan server lokal di folder `oasis-luxury`:
  ```bash
  python -m http.server 8080
  ```
  (Kalau tidak ada Python: cukup double-click `index.html` di Chrome/Edge. Cara lengkap ada di `README.md`.)
- [ ] Buka 3 tab: `http://localhost:8080/index.html` · `…/login.html` · `…/indexadmin.html`
- [ ] **Reset data demo** supaya bersih: tekan `F12` → tab **Console** → ketik `localStorage.clear()` → Enter → refresh. Data awal (1 member demo, 6 villa, 3 testimoni contoh) otomatis dibuat ulang.
- [ ] Zoom browser 110–125% supaya terbaca di proyektor (`Ctrl` + `+`).
- [ ] Tutup notifikasi/aplikasi lain.

### Akun demo

| Peran | Link | Login |
|---|---|---|
| Member | `/login.html` | `budi@oasis.id` / `password123` |
| Admin | `/indexadmin.html` | `BagaskaraAP` / `kamumaucaripasswordyangpanjanggini` |

> ⚠️ Buka user dan admin di **browser dan alamat yang sama** (misalnya dua-duanya `localhost:8080` di Chrome). Data tersimpan per browser, jadi booking dari HP tidak muncul di admin laptop.

### Deploy (opsional tapi nilai plus)

Repo: `https://github.com/ayusarii/oasis_luxury`

1. Commit & push semua perubahan terbaru ke branch `main`.
2. GitHub → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → **Save**.
3. Tunggu ±1–2 menit → link: `https://ayusarii.github.io/oasis_luxury/`
4. Admin: `https://ayusarii.github.io/oasis_luxury/indexadmin.html` (jangan ditaruh di slide publik).

---

## 3. Pembagian peran

> Sesuaikan nama dengan anggota kelompok. Kalau anggotanya 2 orang, gabungkan peran B dan C.

| Peran | Bagian presentasi | Spesialis menjawab pertanyaan tentang |
|---|---|---|
| **A — Pembuka & Desainer** | Pembukaan, masalah & solusi, desain (warna, layout, logo) | Desain, UI/UX, brand, responsif |
| **B — Demo User** | Demo sebagai tamu & member, reservasi WhatsApp, CS | Fitur user, alur booking, WhatsApp |
| **C — Demo Admin & Teknis** | Demo admin, arsitektur, library, alur data, backend, penutup | Kode, data, backend, keamanan, testing |

**Aturan menjawab:** yang ditunjuk menjawab dulu, anggota lain boleh menambah. Jangan saling potong.

---

## 4. Rundown 15 menit

| Waktu | Bagian | Siapa | Inti yang disampaikan |
|---|---|---|---|
| 00:00 – 01:00 | Pembukaan | A | Salam, perkenalan, nama proyek, satu kalimat "OASIS itu apa" |
| 01:00 – 02:30 | Masalah & solusi | A | 4 masalah → 4 solusi OASIS |
| 02:30 – 04:30 | Desain | A | Warna dari alam Bali, logo, font, layout & responsif |
| 04:30 – 08:30 | **Demo user** | B | Katalog → Book → WhatsApp → CS → login → viewing → e-ticket |
| 08:30 – 10:30 | **Demo admin** | C | Login admin → booking masuk → ubah status → edit villa langsung berubah |
| 10:30 – 13:30 | **Teknis** | C | Arsitektur, library, alur data, "backend" |
| 13:30 – 15:00 | Penutup | A | Keterbatasan jujur + rencana pengembangan + terima kasih |

**Kalau waktu mepet**, lewati: testimoni, cetak e-ticket, tab Members & Reviews di admin.
**Kalau waktu sisa**, tambahkan: tampilan HP (DevTools `Ctrl+Shift+M`) dan sinkron antar tab.

---

## 5. Naskah bicara per bagian

> Tidak perlu dihafal kata per kata. Pahami intinya, ucapkan dengan bahasa sendiri.

### 🎤 Pembukaan (A, ±1 menit)

> "Assalamualaikum warahmatullahi wabarakatuh. Selamat pagi/siang Kakak mentor dan teman-teman. Kami dari kelompok … akan mempresentasikan project kami, **OASIS**, website sewa villa mewah per malam di Bali.
>
> Nama OASIS kami ambil dari *oasis*, yaitu tempat teduh di tengah gurun: ada air, ada pohon palem, dan tempat beristirahat. Itu yang ingin kami tawarkan: **villa privat sebagai tempat pelarian yang tenang**. Tagline kami: *Bali's Most Exclusive Doors, Unlocked*."

### 🎤 Masalah & solusi (A, ±1,5 menit)

| Masalah | Solusi OASIS |
|---|---|
| Villa premium tenggelam di portal booking yang ramai | Katalog **terkurasi**: 6 villa pilihan, Best Seller ditandai |
| Harga membingungkan (mata uang asing, singkatan) | **Satu harga jujur**: `Rp 4,700,000 / night`, lengkap, tanpa singkatan |
| Salah jam karena beda zona waktu | **Semua jadwal pakai WITA** (waktu Bali), jam Bali tampil langsung |
| Booking & data tamu tercecer di chat dan catatan | **Reservasi via WhatsApp dengan pesan otomatis** + **halaman admin** untuk semua data |

> "Jadi OASIS menyelesaikan masalah dari dua sisi: **tamu** gampang memilih dan memesan, **pengelola** punya satu tempat untuk mengatur semuanya."

### 🎤 Desain (A, ±2 menit)

> "Untuk desain, palet warna kami ambil dari **alam Bali saat matahari terbenam**: **krem** dari pasir pantai, **cokelat** dari kayu jati dan atap alang-alang, dan **emas** dari cahaya sunset di Uluwatu. Konsepnya *quiet luxury*: mewah tapi tenang, tidak mencolok.
>
> Logo kami **pohon palem di atas dua garis ombak**, garis emas tipis tanpa isian, supaya elegan dan tetap jelas walau kecil sebagai favicon. Kami juga membuat **logo CS**: headset emas dengan ombak yang sama, supaya satu keluarga dengan logo utama.
>
> Layout-nya berurutan seperti cerita: **Hero** (kesan pertama) → **Discover** (3 keunggulan) → **Katalog villa** → **Banner ajakan** → **Testimoni** → **Footer kontak**. Dan semuanya **responsif**: di HP menu berubah jadi hamburger dan ada bar menu di bawah, karena kebanyakan wisatawan mencari penginapan lewat HP."

(Detail lengkap untuk menjawab pertanyaan: [§7](#7-desain-warna-layout-logo-font).)

### 🎤 Transisi ke demo (A → B)

> "Supaya lebih jelas, langsung kami tunjukkan websitenya. Silakan, [nama B]."

### 🎤 Demo user (B, ±4 menit) → lihat [§6.1](#61-demo-user-b-4-menit)

### 🎤 Demo admin (C, ±2 menit) → lihat [§6.2](#62-demo-admin-c-2-menit)

### 🎤 Teknis (C, ±3 menit)

> "Sekarang bagian teknis. OASIS dibuat dengan **HTML, CSS, dan JavaScript murni**, tanpa framework. Ada **4 halaman**: website utama, login, registrasi, dan admin.
>
> Yang paling penting ada di arsitekturnya: semua halaman **tidak boleh langsung menyentuh data**. Semua lewat **satu file, `db.js`**, yang isinya fungsi seperti `registerUser`, `loginUser`, `addBooking`, `saveProperty`. Data disimpan di **localStorage** browser.
>
> Kenapa begitu? Karena `db.js` ini berperan seperti **backend** kami: di situ ada validasi, penyimpanan, dan pengecekan sesi. Kalau nanti kami pindah ke server sungguhan seperti Firebase atau Supabase, **halaman-halamannya tidak perlu diubah**, cukup isi `db.js` yang diganti.
>
> Library yang kami pakai sedikit dan masing-masing ada tujuannya: **AOS** untuk animasi saat scroll, **Tailwind CSS** untuk mempercepat styling halaman login dan admin, dan **Google Fonts** untuk huruf. Untuk WhatsApp kami pakai **link wa.me**, jadi tidak perlu API key."

Tampilkan diagram [§8.1](#81-diagram-arsitektur) dan satu alur data dari [§9](#9-alur-data) (misalnya alur booking).

### 🎤 Penutup (A, ±1,5 menit)

> "Kami juga sadar keterbatasan project ini. Karena belum pakai server, **data tersimpan per browser**, dan password admin masih ada di kode. Rencana pengembangan kami:
> 1. Pindah ke **backend** seperti Supabase: database bersama, password di-hash, login admin di server.
> 2. **Kalender ketersediaan** dan **pembayaran online**.
> 3. **Notifikasi WhatsApp otomatis** ke admin lewat WhatsApp Business API.
>
> Sekian presentasi dari kami. OASIS: *Bali's Most Exclusive Doors, Unlocked*. Terima kasih, wassalamualaikum warahmatullahi wabarakatuh. Kami siap menerima pertanyaan."

---

## 6. Skenario demo (klik demi klik)

### 6.1 Demo user (B, ±4 menit)

| # | Aksi | Yang diucapkan |
|---|---|---|
| 1 | Buka `index.html`, diam 2 detik di hero | "Ini halaman utama. Animasi muncul saat scroll, pakai library AOS." |
| 2 | Scroll ke **Featured Estates** | "Ada 6 villa. Yang bertanda emas **Best Seller** tampil paling atas. Harga ditulis lengkap per malam dalam Rupiah." |
| 3 | Klik **Book** di Seminyak Beachfront Estate | "Tamu tidak perlu login untuk booking. Villa yang diklik langsung terpilih." |
| 4 | Pilih check-in → check-out terisi otomatis → ubah jadi 3 malam | "Check-out otomatis minimal 1 malam setelah check-in. **Totalnya dihitung langsung**: 3 malam × Rp 4 juta = Rp 12 juta." |
| 5 | Kosongkan nama → klik **Continue to WhatsApp** | "Kalau data kurang, ada pesan error yang jelas." |
| 6 | Isi nama → **Continue to WhatsApp** | "WhatsApp terbuka ke nomor admin **0821-7980-8686** dengan pesan yang sudah tersusun rapi: villa, kamar, tanggal, jumlah malam, tamu, estimasi total. Tamu tinggal tekan Send." |
| 7 | Tutup, klik **Need help?** (pojok kanan bawah) | "Ini **CS kami, OASIS Concierge**. Ada tombol Book dan Chat with Us, plus tanya-jawab tentang website. Harga dan jumlah villa di sini **ikut data terbaru dari admin**." Buka 1 pertanyaan. |
| 8 | Klik **LOGIN** → masuk `budi@oasis.id` | "Sekarang sebagai member." |
| 9 | Tunjukkan header (nama, E-Tickets) & kartu (jumlah kamar) | "Member dapat info tambahan: jumlah kamar tidur, kamar mandi, luas." |
| 10 | Klik **Details →** di satu villa | "Detail fasilitas lengkap, khusus member." |
| 11 | Klik **Schedule a Viewing** → pilih tanggal & sesi → submit | "Semua sesi dalam **WITA**. Sesi yang sudah lewat hari ini otomatis tidak bisa dipilih." |
| 12 | Tunjukkan e-ticket → **Confirm on WhatsApp** | "Keluar **e-ticket** dengan nomor referensi `OASIS-VISIT-…`. Tombol ini mengirim konfirmasi ke admin **lengkap dengan nomor referensinya**." |
| 13 | (Jika waktu) `Ctrl+Shift+M` → pilih iPhone | "Di HP ada menu hamburger, bar menu bawah, dan tombol CS bulat." |

### 6.2 Demo admin (C, ±2 menit)

| # | Aksi | Yang diucapkan |
|---|---|---|
| 1 | Buka `indexadmin.html` | "Halaman admin **tidak ada link-nya** di website dan tidak diindeks Google." |
| 2 | Login `BagaskaraAP` | "Login admin **terpisah** dari login member." |
| 3 | Tab **Overview** | "Statistik: jumlah member, booking, booking mendatang, villa." |
| 4 | Tab **Bookings** → booking viewing tadi | "Booking yang tadi dibuat member langsung masuk." Ubah status ke **Completed**. |
| 5 | Pindah ke tab website → buka E-Tickets | "Statusnya ikut berubah di sisi member." |
| 6 | Tab **Properties** → Edit Ubud → ubah tarif ke 3200000 → Save | "Admin bisa ubah katalog tanpa menyentuh kode. Ada pratinjau `= Rp 3,200,000 / night` supaya jumlah nol tidak salah." |
| 7 | Pindah ke tab website (tanpa refresh) | "Harganya **langsung berubah** di tab lain. Ini pakai event `storage` browser." |
| 8 | (Jika waktu) Tab **Reviews** → Hidden | "Testimoni yang tidak pantas bisa disembunyikan." |

> 🌟 **Momen "wow"**: taruh tab admin dan tab website **berdampingan** (`Win + ←` dan `Win + →`) saat langkah 6–7, supaya mentor melihat perubahan terjadi seketika.

---

## 7. Desain: warna, layout, logo, font

### 7.1 Warna

| Warna | Kode | Terinspirasi dari | Alasan | Dipakai di |
|---|---|---|---|---|
| **Krem** | `#faf6f0` | Pasir putih pantai Bali | Hangat, lapang; foto villa jadi menonjol | Latar halaman |
| **Cokelat** | `#5a3e36` | Kayu jati, atap alang-alang | Mewah tapi membumi, tidak dingin seperti hitam | Tombol utama, harga |
| **Cokelat tua** | `#3b2721` | Kayu gelap, bayangan senja | Kokoh, premium, tepercaya | Footer, judul, header HP, admin |
| **Emas** | `#f7d57f` · `#e7c88b` | Sunset Uluwatu & Jimbaran | Simbol eksklusif, dipakai **sedikit** supaya tetap istimewa | Logo, tab aktif, judul CS |
| **Emas tua** | `#e6a117` | Cahaya sore | Menarik perhatian tanpa murahan | Bintang rating, badge Best Seller |
| **Hijau WhatsApp** | `#0b8043` | Warna WhatsApp | Orang langsung tahu "ini ke WhatsApp"; digelapkan supaya teks putih kontras 5:1 | Tombol yang membuka WhatsApp |

**Prinsip:** netral hangat mendominasi, emas hanya aksen dan hanya di latar gelap (supaya terbaca), warna status fungsional (biru = Confirmed, hijau = Completed, merah = Cancelled). Warna disimpan sebagai **CSS variable** (`--brown`, `--cream`, dll.) di `:root`, jadi ganti satu nilai = seluruh website ikut berubah.

### 7.2 Layout halaman utama

```
┌────────────────────────────────────────────┐
│ Header kaca (logo · menu · LOGIN)          │  ← mengambang, efek blur
├────────────────────────────────────────────┤
│ HERO: judul besar + 2 tombol │ kartu villa │  ← kesan pertama
├────────────────────────────────────────────┤
│ DISCOVER: 3 keunggulan (3 kolom)           │  ← kenapa OASIS
├────────────────────────────────────────────┤
│ FEATURED ESTATES: grid kartu villa 3 kolom │  ← inti: katalog + harga + Book
├────────────────────────────────────────────┤
│ BANNER: "Beyond the Threshold" + 2 tombol  │  ← ajakan bertindak
├────────────────────────────────────────────┤
│ GUEST STORIES: testimoni                   │  ← bukti sosial / kepercayaan
├────────────────────────────────────────────┤
│ FOOTER: kontak, WhatsApp, jam Bali         │
└────────────────────────────────────────────┘
                         [🎧 Need help?]  ← CS selalu ada
```

**Kenapa urutannya begitu?** Mengikuti perjalanan calon tamu: *tertarik* (hero) → *percaya* (keunggulan) → *memilih* (katalog) → *terdorong* (banner) → *yakin* (testimoni) → *menghubungi* (footer/CS).

### 7.3 Responsif

| Lebar layar | Perubahan |
|---|---|
| > 1180 px | Desktop penuh |
| 981–1180 px | Header member hanya menampilkan avatar supaya tetap satu baris |
| ≤ 980 px | Menu jadi **hamburger**, grid 2 kolom |
| ≤ 720 px | Header ringkas & menempel, **bar menu bawah** (Villas, Meeting, Viewing, Reviews, Log In), tombol CS bulat, grid 1 kolom |
| ≤ 640 px | Baris form bertumpuk |

Dibuat dengan **CSS media query** (`@media (max-width: 720px) { … }`), **CSS Grid** dan **Flexbox**.

### 7.4 Logo & font

| Elemen | Penjelasan |
|---|---|
| Logo OASIS (`oasis-mark.svg`) | Pohon palem (simbol oasis & pantai tropis) di atas 2 garis ombak (laut Bali). Garis emas tipis = *quiet luxury*. Format **SVG**: tajam di ukuran berapa pun, dipakai juga sebagai favicon. |
| Logo CS (`oasis-cs.svg`) | Headset emas + ombak dari logo utama → satu keluarga desain. |
| Georgia (serif) | Judul di halaman utama: klasik, elegan, sudah ada di semua perangkat (tidak perlu diunduh). |
| Playfair Display | Judul di login & admin: kontras tebal-tipis ala butik mewah. |
| Plus Jakarta Sans | Teks di login & admin: modern, bersih, **dirancang desainer Indonesia**. |

---

## 8. Arsitektur & library

### 8.1 Diagram arsitektur

```
                         BROWSER PENGUNJUNG
 ┌──────────────────────────────────────────────────────────────┐
 │  TAMPILAN (HTML + CSS)            LOGIKA HALAMAN (JS)         │
 │  index.html ───────────────────▶ main.js                     │
 │  login.html / register.html ───▶ script di dalam halaman     │
 │  indexadmin.html ──────────────▶ admin.js                    │
 │                                     │                         │
 │                                     ▼  (satu-satunya pintu)   │
 │                        LAPISAN DATA: db.js                    │
 │                        • OasisDB   → simpan/baca/validasi     │
 │                        • OasisUtils → WITA, Rupiah, keamanan  │
 │                                     │                         │
 │                                     ▼                         │
 │                PENYIMPANAN: localStorage  (member, booking,   │
 │                             villa, testimoni, sesi member)    │
 │                             sessionStorage (sesi admin)       │
 └──────────────────────────────────────────────────────────────┘
          │ link wa.me
          ▼
   WhatsApp admin 0821-7980-8686
```

### 8.2 File dan isinya

| File | Baris | Isi |
|---|---|---|
| `index.html` | ~990 | Struktur halaman utama + semua pop-up (booking, detail villa, e-ticket, email, testimoni, CS) |
| `style.css` | ~3.300 | Semua tampilan: warna, layout, responsif, cetak e-ticket |
| `main.js` | ~1.600 | Logika halaman utama: katalog, login state, booking, e-ticket, WhatsApp, CS, menu HP |
| `db.js` | ~890 | **Lapisan data** (`OasisDB`) + helper (`OasisUtils`) |
| `admin.js` + `indexadmin.html` | ~820 + ~450 | Login & dashboard admin |
| `login.html`, `register.html` | ~160 masing-masing | Form login & registrasi member |
| `oasis-mark.svg`, `oasis-cs.svg` | — | Logo OASIS & logo CS |
| `tests/*.test.cjs` | ~300 | 19 unit test otomatis |

### 8.3 Library & alat: apa dan untuk apa

| Library / alat | Dipakai di | Untuk apa | Kenapa dipilih |
|---|---|---|---|
| **AOS 2.3.1** (Animate On Scroll) | `index.html` | Animasi elemen muncul (fade/zoom) saat di-scroll | Ringan, cukup tambah atribut `data-aos="fade-up"` di HTML |
| **Tailwind CSS** (Play CDN) | login, register, admin | Styling cepat pakai class siap pakai (`rounded-xl`, `bg-red-50`, …) | Membangun form & dashboard jauh lebih cepat |
| **Google Fonts** | login, register, admin | Huruf Playfair Display & Plus Jakarta Sans | Gratis, kualitas tinggi |
| **Unsplash** | Foto villa | Foto contoh berkualitas | Gratis; nanti diganti foto villa asli |
| **WhatsApp Click to Chat** (`wa.me`) | Reservasi, CS, konfirmasi | Membuka chat ke admin dengan pesan terisi | **Tanpa API key**, tanpa server, gratis |
| **Node.js test runner** (`node:test`) | `tests/` | Unit test otomatis | Bawaan Node.js, tanpa instal apa-apa |

**Tanpa framework** (tanpa React/Vue/jQuery) karena: tujuan pelatihan memahami dasar HTML/CSS/JS, website ringan, dan bisa langsung dibuka tanpa proses build.

### 8.4 Fitur bawaan browser (Web API) yang kami manfaatkan

| API | Untuk apa di OASIS |
|---|---|
| `localStorage` | Menyimpan data member, booking, villa, testimoni (tetap ada walau browser ditutup) |
| `sessionStorage` | Sesi admin (hilang saat tab ditutup → lebih aman) |
| `Intl.DateTimeFormat` + `timeZone: 'Asia/Makassar'` | Menghitung jam & tanggal **Bali (WITA)** apa pun zona waktu pengunjung |
| Event `storage` | Tab lain otomatis ikut update saat data berubah |
| `URLSearchParams` | Membaca pesan dari URL, misalnya `login.html?reason=auth_required` |
| `window.print()` + `@media print` | Mencetak e-ticket rapi 1 halaman A4 |
| `<dialog>` & `<details>` | Pop-up edit member di admin & tanya-jawab CS yang bisa dibuka-tutup |
| `encodeURIComponent` | Mengubah pesan WhatsApp jadi aman untuk URL |

---

## 9. Alur data

### 9.1 Registrasi → Login

```
[register.html] isi nama, email, password
      │  cek di halaman: kolom kosong? password ≥ 6? konfirmasi sama?
      ▼
OasisDB.registerUser({ name, email, password })          (db.js)
      │  validasi lagi: format email (regex), panjang, email belum dipakai
      ▼
localStorage["oasis_users_db"]  ← member baru ditambahkan
      │
      ▼  pindah ke login.html?registered=true&email=...
OasisDB.loginUser(email, password)
      │  cari email → cocokkan password
      ▼
localStorage["oasis_current_user"]  ← sesi { id, name, email, credentialVersion, loginAt }
      ▼
index.html membaca OasisDB.getCurrentUser() → header menampilkan nama member
```

### 9.2 Booking viewing (member) → admin

```
Klik "Schedule a Viewing" ──▶ requireMember(): sudah login?
                                 ├─ belum → ke login.html
                                 └─ sudah → buka form
Isi villa, tanggal, sesi ──▶ validateSchedule(): tanggal/sesi sudah lewat di Bali? → tolak
      ▼
OasisDB.generateRefNo('OASIS-VISIT')  → nomor unik OASIS-VISIT-48213
OasisDB.addBooking({...})             → status awal "confirmed"
      ▼
localStorage["oasis_booking_history"]  ← booking disimpan (terbaru di atas)
      ├──▶ Member: e-ticket + "Confirm on WhatsApp" (pesan berisi nomor referensi)
      └──▶ Admin (browser sama): tab Bookings membaca getAllBookings()
                 admin ubah status → updateBookingStatus() → tersimpan
                 → event "storage" → tab member ikut update
```

### 9.3 Reservasi via WhatsApp (Khusus Member / Harus Login)

```
Klik "Book" / "Book Your Stay" ──▶ openReserveModal()
      │
      ├──▶ Jika Guest (belum login):
      │       requireMember() langsung mengarahkan ke:
      │       login.html?reason=auth_required&feature=Book+Your+Stay
      │
      └──▶ Jika Member (sudah login):
              Buka modal #reserveModal
              Isi villa, check-in, check-out, tamu, nama
                    │  updateReserveSummary(): malam × tarif = estimasi total
                    ▼
              validateReservation(): villa ada? check-in ≥ hari ini (WITA)? 1–365 malam? tamu 1–30? nama?
                    ▼
              buildReservationMessage()  → teks pesan rapi
              whatsappUrl(pesan)         → https://wa.me/6282179808686?text=<pesan ter-encode>
              window.open(...)           → WhatsApp terbuka, tamu tekan Send
                    ▼
              Admin menerima chat di WhatsApp (reservasi dikonfirmasi via WhatsApp)
```

### 9.4 Admin mengubah villa → website

```
Admin: Properties → Edit → ubah tarif → Save
      ▼
saveProperty() di admin.js: validasi (wajib diisi, maks. Rp 1 miliar)
      ▼
OasisDB.saveProperty(property) → localStorage["oasis_properties_db"]
      ▼
Browser mengirim event "storage" ke tab lain
      ▼
main.js setupLiveSync(): renderCatalog() → kartu villa & harga baru tampil tanpa refresh
```

### 9.5 Tempat data disimpan

| Kunci | Tempat | Isi |
|---|---|---|
| `oasis_users_db` | localStorage | Daftar member |
| `oasis_current_user` | localStorage | Member yang sedang login |
| `oasis_booking_history` | localStorage | Semua booking meeting & viewing |
| `oasis_properties_db` | localStorage | Katalog villa |
| `oasis_testimonials_db` | localStorage | Testimoni |
| `oasis_admin_session` | sessionStorage | Sesi admin |

Lihat langsung: `F12` → tab **Application** → **Local Storage** → `http://localhost:8080`. (Bagus untuk ditunjukkan kalau mentor bertanya "datanya disimpan di mana?")

---

## 10. "Backend-nya mana?"

> ⚠️ **Hampir pasti ditanya.** Kuncinya: **jujur, lalu tunjukkan bahwa kami paham** konsep backend dan sudah menyiapkan jalannya.

### 10.1 Jawaban utama (hafalkan intinya)

> "OASIS saat ini adalah **website statis tanpa server**, jadi belum ada backend terpisah. Tapi kami merancangnya **seperti ada backend**: semua urusan data, yaitu **validasi, simpan, baca, login, dan hak akses**, kami kumpulkan di **satu file, `db.js`**. Halaman lain tidak pernah menyentuh penyimpanan langsung, mereka hanya memanggil fungsi seperti `OasisDB.addBooking()`.
>
> Data disimpan di **localStorage**, yaitu penyimpanan di browser. Kelemahannya, data hanya ada di browser itu saja. Karena itu, rencana kami berikutnya memindahkan data ke server seperti **Supabase atau Firebase**. Dan karena semua lewat `db.js`, yang perlu diganti **hanya isi `db.js`**, halaman-halamannya tetap."

### 10.2 Perbandingan: backend biasa vs OASIS sekarang

| Tugas backend | Aplikasi dengan server | Di OASIS sekarang |
|---|---|---|
| Menyimpan data | Database (MySQL, PostgreSQL) | `localStorage` lewat `db.js` |
| Validasi data | Di server | Di `db.js` (mis. `registerUser` cek email & password) |
| Login & sesi | Token/cookie dari server | `loginUser()` + `oasis_current_user` |
| Hak akses admin | Peran admin dicek server | `AdminAuth` di `admin.js` + `sessionStorage` |
| API | `POST /api/bookings` dll. | Fungsi `OasisDB.addBooking()` dll. |
| Notifikasi | Email/WhatsApp API dari server | Link `wa.me` dan tombol `mailto:` |

### 10.3 Kenapa belum pakai server?

1. **Fokus pelatihan**: memahami dasar HTML, CSS, JavaScript, dan alur data.
2. **Gratis & mudah di-deploy**: website statis bisa langsung online di GitHub Pages.
3. **Rancangan siap dipindah**: `db.js` sudah berperan sebagai "API" internal.

### 10.4 Rencana backend nyata (kalau ditanya "kalau pakai backend, gimana?")

**Tabel database (Supabase/PostgreSQL):**

| Tabel | Kolom utama |
|---|---|
| `users` | id, name, email (unik), password_hash, created_at |
| `properties` | id, title, location, nightly_rate, is_best_seller, image_url, bedrooms, bathrooms, facilities |
| `bookings` | ref_no (unik), type, status, user_id → users, property_id → properties, date, time, created_at |
| `reservations` | id, property_id, check_in, check_out, guests, name, phone, status |
| `testimonials` | id, user_id, property_id, rating, text, status |

**Contoh endpoint API:**

| Method | Endpoint | Pengganti fungsi |
|---|---|---|
| `POST` | `/api/register` | `OasisDB.registerUser()` |
| `POST` | `/api/login` | `OasisDB.loginUser()` |
| `GET` | `/api/properties` | `OasisDB.getProperties()` |
| `POST` | `/api/bookings` | `OasisDB.addBooking()` |
| `PATCH` | `/api/bookings/:refNo` | `OasisDB.updateBookingStatus()` |
| `DELETE` | `/api/users/:id` | `OasisDB.deleteUser()` |

**Yang jadi lebih baik:** data sama di semua perangkat, password di-**hash** (bcrypt), login admin dicek di server, bisa cek bentrok jadwal, dan reservasi WhatsApp bisa tercatat di database.

---

## 11. Bedah kode: arti kode penting

> Mentor menekankan **"harus tahu arti code"**. Berikut kode inti yang paling mungkin ditunjuk, beserta artinya baris demi baris.

### 11.1 Pola modul `OasisDB` (`db.js` baris 9)

```js
const OasisDB = (function () {
  const USERS_STORAGE_KEY = 'oasis_users_db';
  // ... fungsi-fungsi ...
  return { registerUser, loginUser, addBooking, /* ... */ };
})();
```

| Bagian | Arti |
|---|---|
| `(function () { ... })()` | **IIFE** (fungsi yang langsung dijalankan). Isinya jadi "ruang tertutup", jadi variabel di dalam tidak bocor ke luar. |
| `const USERS_STORAGE_KEY` | Hanya bisa dipakai di dalam `OasisDB` (privat). |
| `return { ... }` | Hanya fungsi yang di-return yang bisa dipakai halaman lain, contohnya `OasisDB.loginUser(...)`. Ini seperti "daftar layanan" backend. |

### 11.2 Baca & tulis data (`db.js` baris 225)

```js
function readJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error('Failed to read local database: ' + key, e);
    return fallback;
  }
}
```

| Bagian | Arti |
|---|---|
| `localStorage.getItem(key)` | Ambil data dari penyimpanan browser. localStorage hanya bisa menyimpan **teks**. |
| `JSON.parse(data)` | Ubah teks JSON kembali jadi array/objek JavaScript. (Kebalikannya `JSON.stringify` saat menyimpan.) |
| `data ? … : fallback` | Operator ternary: kalau data ada pakai itu, kalau belum ada pakai nilai cadangan. |
| `try { … } catch (e) { … }` | Kalau terjadi error (data rusak, storage diblokir), website **tidak crash**, tapi memakai nilai cadangan. |

### 11.3 Login & sesi yang bisa dicabut admin (`db.js` baris 469)

```js
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
```

**Arti:** setiap kali website butuh tahu "siapa yang login", fungsi ini:
1. Membaca sesi. Kalau tidak ada, berarti belum login (`null`).
2. Mengecek **akunnya masih ada** (bisa saja sudah dihapus admin).
3. Mengecek **`credentialVersion`**: setiap admin me-reset password, angka ini naik. Kalau angka di sesi berbeda, sesi lama **otomatis tidak berlaku** dan member harus login ulang.
4. Mengembalikan data member **tanpa password**.

### 11.4 Fitur khusus member (`main.js` baris 293)

```js
function requireMember(feature, action) {
  const user = OasisDB.getCurrentUser();
  if (!user) {
    window.location.href = `login.html?reason=auth_required&feature=${encodeURIComponent(feature)}`;
    return;
  }
  action(user);
}
```

**Arti:** "penjaga pintu". Kalau belum login, pengunjung dipindah ke halaman login beserta nama fitur yang ingin dibuka (muncul pesan "Schedule a Viewing requires you to log in first"). Kalau sudah login, jalankan `action`. Ini contoh **callback**: fungsi yang dikirim sebagai parameter.

### 11.5 Mencegah XSS (`db.js` baris 731)

```js
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

**Arti:** mengubah karakter berbahaya jadi versi aman. Kalau ada yang menulis testimoni `<script>alert(1)</script>`, yang tampil hanya **teks**, bukan kode yang dijalankan. Serangan ini namanya **XSS (Cross-Site Scripting)**. `/</g` adalah **regex**: cari semua (`g` = global) tanda `<`.

### 11.6 Waktu Bali (WITA) (`db.js` baris 763)

```js
new Intl.DateTimeFormat('en-GB', {
  timeZone: BALI_TIMEZONE,   // 'Asia/Makassar' = WITA, UTC+8
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
}).formatToParts(date || new Date())
```

**Arti:** mengambil tanggal & jam **di Bali**, bukan jam laptop pengunjung. Jadi tamu dari Jakarta (WIB) atau Eropa tetap melihat jadwal yang benar. `formatToParts` memecah hasilnya jadi bagian (tahun, bulan, jam, …) supaya bisa disusun jadi `2026-09-22`.

### 11.7 Menolak jadwal yang sudah lewat (`main.js` baris 1045)

```js
function validateSchedule(dateValue, slotValue) {
  const today = OasisUtils.baliTodayISO();
  if (!dateValue) return 'Please choose a date.';
  if (dateValue < today) return 'That date has already passed in Bali. ...';
  if (dateValue === today) {
    const start = OasisUtils.slotStartMinutes(slotValue);
    if (start !== null && start <= OasisUtils.baliNowMinutes()) {
      return 'That session has already started in Bali (WITA). ...';
    }
  }
  return '';
}
```

**Arti:** tanggal format `YYYY-MM-DD` bisa **dibandingkan langsung sebagai teks** (`'2026-09-21' < '2026-09-22'`). Kalau tanggalnya hari ini, jam mulai sesi diubah ke menit (`14:00` → `840`) lalu dibandingkan dengan menit sekarang di Bali. Mengembalikan teks error, atau `''` (kosong) kalau valid.

### 11.8 Nomor referensi unik (`db.js` baris 517)

```js
function generateRefNo(prefix) {
  const taken = new Set(getAllBookings().map((b) => b.refNo));
  let refNo;
  do {
    refNo = prefix + '-' + Math.floor(10000 + Math.random() * 90000);
  } while (taken.has(refNo));
  return refNo;
}
```

**Arti:** `Set` berisi semua nomor yang sudah dipakai. `Math.random()` membuat angka acak 5 digit (10000–99999). `do…while` **mengulang** sampai dapat nomor yang belum dipakai. Hasil: `OASIS-VISIT-48213`.

### 11.9 Link WhatsApp (`main.js` baris 310)

```js
function whatsappUrl(message) {
  return `https://wa.me/${OASIS_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}
```

| Bagian | Arti |
|---|---|
| `` `…${…}…` `` | **Template literal**: menyisipkan variabel ke dalam teks. |
| `OASIS_CONTACT.whatsapp` | `'6282179808686'`: nomor admin **format internasional** (0 di depan diganti 62). |
| `encodeURIComponent(message)` | Mengubah spasi, enter, `&`, `:` jadi kode URL (`%20`, `%0A`, …) supaya pesan tidak rusak. |

### 11.10 Sinkron antar tab (`main.js` baris 62)

```js
window.addEventListener('storage', (e) => {
  // ...
  if (e.key === null || e.key === 'oasis_properties_db') {
    renderHeroFeature();
    renderCatalog(!!user);
  }
});
```

**Arti:** browser otomatis mengirim event `storage` ke **tab lain** saat localStorage berubah. Kalau yang berubah data villa, katalog digambar ulang. Karena itu harga yang diubah admin langsung tampil di tab website tanpa refresh. `!!user` mengubah nilai jadi `true`/`false`.

### 11.11 Login admin terpisah (`admin.js` baris 34, diringkas)

```js
const AdminAuth = {
  login(username, password) {
    if (String(username).trim().toLowerCase() !== ADMIN_ACCOUNT.username.toLowerCase()
        || password !== ADMIN_ACCOUNT.password) {
      return false;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ username: ADMIN_ACCOUNT.username, loginAt: … }));
    return true;
  },
  // getSession(), logout()
};
```

**Arti:** username tidak membedakan huruf besar/kecil (`toLowerCase`), password harus persis. Sesi admin disimpan di **sessionStorage**, jadi otomatis hilang saat tab ditutup. Login admin **tidak** membuat sesi member, begitu juga sebaliknya.

### 11.12 Animasi AOS + cadangan (`main.js` baris 49)

```js
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 50 });
} else {
  document.querySelectorAll('[data-aos]').forEach((el) => el.removeAttribute('data-aos'));
}
```

**Arti:** kalau library AOS berhasil dimuat, animasi dijalankan (0,8 detik, sekali saja). Kalau **gagal dimuat** (misalnya internet putus), atribut `data-aos` dihapus supaya konten **tidak tersembunyi**. Ini disebut *graceful degradation*.

---

## 12. Bank pertanyaan & jawaban

> Format: **P** = pertanyaan mentor, **J** = jawaban kita. Jawab singkat dulu, detail kalau diminta.

### 🧭 A. Umum & konsep

**P: Jelaskan singkat project kalian.**
J: OASIS adalah website sewa villa mewah per malam di Bali. Tamu bisa melihat katalog, booking lewat WhatsApp dengan pesan otomatis, dan member bisa booking meeting/viewing lalu dapat e-ticket. Admin mengelola booking, member, villa, dan testimoni dari halaman admin.

**P: Siapa target penggunanya?**
J: Wisatawan domestik dan mancanegara yang mencari villa privat premium, serta pengelola villa (admin).

**P: Kenapa website-nya bahasa Inggris?**
J: Sebagian besar tamu villa premium di Bali adalah wisatawan mancanegara. Tapi harga tetap Rupiah dan kontak lokal Indonesia, jadi tamu domestik juga terlayani.

**P: Apa bedanya dengan Traveloka/Airbnb?**
J: OASIS **terkurasi dan privat**: hanya villa premium pilihan, harga ditulis jujur per malam, jadwal dalam waktu Bali, dan tamu langsung terhubung ke admin lewat WhatsApp tanpa perantara.

**P: Apa arti nama OASIS?**
J: Oasis adalah tempat teduh dan langka di tengah gurun. Filosofinya: villa privat sebagai tempat pelarian yang tenang dari keramaian.

**P: Fitur apa yang paling kalian banggakan?**
J: (Pilih satu) Reservasi WhatsApp dengan pesan otomatis dan estimasi total; atau sinkron data real-time antara admin dan website; atau semua jadwal otomatis memakai WITA.

### 🎨 B. Desain (warna & layout)

**P: Kenapa pilih warna cokelat dan krem?**
J: Diambil dari alam Bali: krem dari pasir pantai, cokelat dari kayu jati dan atap alang-alang, emas dari sunset. Kesannya mewah tapi tenang (*quiet luxury*), dan foto villa jadi lebih menonjol di latar netral.

**P: Kenapa emas dipakai sedikit saja?**
J: Supaya tetap terasa istimewa. Emas juga hanya dipakai di latar gelap karena di latar terang kontrasnya kurang dan susah dibaca.

**P: Kenapa tombol WhatsApp hijau, beda dari tema?**
J: Supaya orang langsung tahu tombol itu membuka WhatsApp. Hijaunya kami gelapkan (`#0b8043`) supaya teks putihnya kontras dan mudah dibaca. Tombol booking utama tetap cokelat sesuai tema.

**P: Bagaimana layout-nya disusun?**
J: Mengikuti perjalanan tamu: hero untuk kesan pertama → keunggulan → katalog → ajakan booking → testimoni → kontak. CS selalu ada di pojok kanan bawah.

**P: Bagaimana membuat website responsif?**
J: Pakai CSS media query di beberapa titik (980, 720, 640 px), CSS Grid untuk katalog (3 → 2 → 1 kolom), dan Flexbox. Di HP ada menu hamburger dan bar menu bawah.

**P: Kenapa halaman utama tidak pakai Tailwind?**
J: Halaman utama butuh kontrol penuh untuk identitas brand, jadi kami tulis CSS sendiri di `style.css` dengan CSS variable. Tailwind dipakai di login, registrasi, dan admin supaya form dan dashboard lebih cepat dibuat.

**P: Font apa dan kenapa?**
J: Georgia untuk judul (klasik, tersedia di semua perangkat), Playfair Display untuk judul di login/admin (anggun), Plus Jakarta Sans untuk teks (modern, karya desainer Indonesia).

### 💻 C. Program & kode

**P: Pakai bahasa/teknologi apa?**
J: HTML untuk struktur, CSS untuk tampilan, JavaScript untuk logika. Tanpa framework.

**P: Kenapa tidak pakai React/Laravel?**
J: Fokus pelatihan adalah memahami dasar. Dengan JavaScript murni kami benar-benar paham apa yang terjadi, dan website bisa dibuka tanpa proses build.

**P: Coba jelaskan kode ini.** (mentor menunjuk kode)
J: Lihat [§11](#11-bedah-kode-arti-kode-penting). Pola menjawab: **(1) fungsi ini untuk apa → (2) inputnya apa → (3) langkahnya → (4) hasilnya apa**.

**P: Apa itu `const`, `let`, `var`?**
J: `const` untuk nilai yang tidak diganti, `let` untuk yang bisa berubah. `var` cara lama; kami tidak memakainya karena cakupannya kurang jelas.

**P: Apa itu `addEventListener`?**
J: Mendaftarkan fungsi yang dijalankan saat sesuatu terjadi, misalnya `click` pada tombol, `submit` pada form, atau `DOMContentLoaded` saat halaman selesai dimuat.

**P: Apa itu DOM?**
J: Representasi halaman HTML sebagai objek yang bisa diubah JavaScript. Contohnya `document.getElementById('rsName').value` untuk membaca isi input.

**P: `innerHTML` itu kan berbahaya?**
J: Betul kalau isinya dari pengguna. Karena itu semua teks dari pengguna/admin kami lewatkan `escapeHtml()` dulu, atau pakai `textContent` yang selalu dianggap teks biasa.

**P: Bagaimana harga Rupiah diformat?**
J: `formatIdr()` di `db.js` memakai `toLocaleString('en-US')` supaya jadi `Rp 4,700,000`. Harga disimpan sebagai angka utuh, diformat hanya saat ditampilkan.

**P: Bagaimana total reservasi dihitung?**
J: `nightsBetween(checkIn, checkOut)` menghitung jumlah malam dari selisih tanggal, lalu dikali tarif per malam. Contoh 3 malam × Rp 4.000.000 = Rp 12.000.000.

**P: Kenapa pakai `try...catch`?**
J: localStorage bisa gagal (penuh, diblokir, mode privat). Dengan try-catch website tidak crash dan menampilkan pesan gagal yang jujur, bukan pesan "berhasil" palsu.

**P: Apa itu callback / arrow function?**
J: Callback = fungsi yang dikirim ke fungsi lain untuk dijalankan nanti, misalnya di `requireMember(feature, action)`. Arrow function `(x) => x * 2` adalah cara singkat menulis fungsi.

**P: Apa itu `map`, `filter`, `find`, `sort`?**
J: Fungsi array. `map` mengubah tiap item, `filter` menyaring, `find` mencari satu, `sort` mengurutkan. Contohnya Best Seller diurutkan di atas memakai `sort`.

### 🔄 D. Alur data

**P: Data disimpan di mana?**
J: Di localStorage browser, dalam format JSON, dengan 5 kunci: users, current_user, booking_history, properties, testimonials. Sesi admin di sessionStorage. (Tunjukkan di DevTools → Application.)

**P: Jelaskan alur dari user booking sampai admin melihatnya.**
J: Lihat [§9.2](#92-booking-viewing-member--admin). Singkatnya: form → validasi → `addBooking()` → localStorage → admin membaca `getAllBookings()`.

**P: Kenapa booking dari HP tidak muncul di admin laptop?**
J: Karena localStorage per browser per perangkat. Ini keterbatasan tanpa server, dan jadi alasan utama rencana backend kami.

**P: Kalau localStorage dihapus, bagaimana?**
J: Data yang dibuat pengguna hilang. Saat halaman dibuka lagi, `initDB()` membuat ulang data awal (akun demo, 6 villa, 3 testimoni contoh).

**P: Reservasi WhatsApp disimpan di mana?**
J: Tidak disimpan di website. Catatannya ada di chat WhatsApp admin. Untuk booking meeting/viewing, datanya tersimpan dan nomor referensinya ikut di pesan WhatsApp supaya admin bisa mencocokkan.

**P: Bagaimana data villa awal dibuat?**
J: Di `db.js` ada `DEFAULT_PROPERTIES` (6 villa). `initDB()` menyimpannya ke localStorage kalau belum ada. Admin bisa mengembalikannya lewat tombol "Restore defaults".

### 🏗️ E. Arsitektur & library

**P: Jelaskan arsitektur website kalian.**
J: Tiga lapis: **tampilan** (HTML/CSS), **logika halaman** (`main.js`, `admin.js`), dan **lapisan data** (`db.js`) yang satu-satunya boleh menyentuh localStorage. (Tunjukkan diagram [§8.1](#81-diagram-arsitektur).)

**P: Library apa saja dan untuk apa?**
J: AOS untuk animasi scroll, Tailwind untuk styling login/admin, Google Fonts untuk huruf, Unsplash untuk foto contoh, dan link wa.me WhatsApp. (Tabel [§8.3](#83-library--alat-apa-dan-untuk-apa).)

**P: Kalau AOS gagal dimuat bagaimana?**
J: Atribut `data-aos` dihapus otomatis supaya konten tetap tampil, hanya tanpa animasi.

**P: Tailwind Play CDN bagus untuk produksi?**
J: Belum ideal, karena Play CDN memproses CSS di browser. Untuk produksi, Tailwind sebaiknya di-compile jadi file CSS biasa. Ini ada di rencana kami.

**P: Kenapa `db.js` dipisah?**
J: Supaya ada satu pintu ke data (*separation of concerns*). Semua halaman memakai fungsi yang sama, validasinya konsisten, dan nanti kalau pindah ke server cukup `db.js` yang diubah.

### 🖥️ F. Backend

**P: Backend-nya pakai apa?**
J: → **Lihat jawaban utama [§10.1](#101-jawaban-utama-hafalkan-intinya).**

**P: Berarti tidak ada backend?**
J: Belum ada server terpisah. Peran backend (validasi, simpan data, sesi, hak akses) dijalankan oleh `db.js` di browser. Kami sudah menyiapkan rancangan tabel dan endpoint untuk pindah ke server ([§10.4](#104-rencana-backend-nyata-kalau-ditanya-kalau-pakai-backend-gimana)).

**P: Kalau mau pakai backend, apa yang diubah?**
J: Isi fungsi di `db.js` diganti memanggil API (misalnya `fetch('/api/bookings', { method: 'POST', ... })`). Halaman lain tetap karena nama fungsinya sama.

**P: Database apa yang cocok?**
J: PostgreSQL lewat Supabase: ada database, login (auth) dengan password ter-hash, dan aturan hak akses bawaan. Firebase juga bisa.

**P: Bagaimana mencegah dua orang booking jadwal yang sama?**
J: Saat ini belum ada cek bentrok karena data per browser. Dengan backend kami akan menambah aturan unik di database (villa + tanggal + sesi) dan mengeceknya di server.

### 🔒 G. Keamanan

**P: Password disimpan bagaimana?**
J: Jujur, saat ini masih teks biasa di localStorage karena ini prototipe tanpa server. Di versi backend, password akan di-hash (misalnya bcrypt) dan tidak pernah disimpan asli. Password juga tidak pernah ditampilkan di halaman admin (ini ada unit test-nya).

**P: Password admin kelihatan di `admin.js`?**
J: Betul, itu keterbatasan website tanpa server: semua kode bisa dibaca pengunjung. Pengamannya sementara: halaman admin tidak ada link-nya, diberi `noindex` supaya tidak muncul di Google, dan sesi hilang saat tab ditutup. Solusi sebenarnya: login admin dicek di server.

**P: Bagaimana mencegah XSS?**
J: Semua teks dari pengguna lewat `escapeHtml()` sebelum ditampilkan, dan pesan dari URL memakai `textContent`. Kami sudah uji dengan nama `<img src=x onerror=alert(1)>`, hasilnya tampil sebagai teks.

**P: Bagaimana kalau admin reset password member yang sedang login?**
J: `credentialVersion` akun naik, sehingga sesi lama member otomatis tidak berlaku dan member harus login ulang.

### 💬 H. WhatsApp & CS

**P: Pakai WhatsApp API? Mana API key-nya?**
J: Tidak pakai API key. Kami pakai **Click to Chat** (`wa.me/6282179808686?text=...`) yang resmi dan gratis dari WhatsApp. API resmi (WhatsApp Business Platform) butuh akun Meta Business terverifikasi dan server untuk menyimpan token. Token tidak boleh ditaruh di website statis karena bisa dibaca siapa pun.

**P: Bagaimana pesan WhatsApp-nya terisi otomatis?**
J: `buildReservationMessage()` menyusun teks dari isi form, lalu `encodeURIComponent()` mengubahnya jadi aman untuk URL dan ditempel di parameter `?text=`. WhatsApp membaca parameter itu sebagai isi pesan.

**P: Kalau WhatsApp tidak terbuka?**
J: Website menampilkan pratinjau pesan dan tombol **Open WhatsApp** sebagai cadangan (misalnya kalau pop-up diblokir browser).

**P: CS-nya chatbot?**
J: Bukan chatbot AI. CS kami berisi **tanya-jawab (FAQ)** tentang website dan tombol langsung ke WhatsApp admin. Data seperti jumlah villa, lokasi, dan rentang harga diambil **langsung dari katalog**, jadi selalu sesuai data terbaru dari admin.

### 🧪 I. Pengujian

**P: Bagaimana kalian menguji website?**
J: Ada **18 unit test** otomatis dengan Node.js (`node --test tests/…`), misalnya login admin, validasi reservasi, format pesan WhatsApp, reset password, dan pencegahan XSS. Kami juga menguji alur lengkap di browser (Chrome) termasuk tampilan HP, dan memastikan tidak ada error di console.

**P: Apa yang terjadi kalau input salah?**
J: Muncul pesan error yang spesifik, misalnya "That check-in date has already passed in Bali" atau "Please enter between 1 and 30 guests". Data tidak disimpan.

### 🚀 J. Deploy & pengembangan

**P: Sudah di-deploy?**
J: (Jika sudah) Sudah di GitHub Pages: [link]. (Jika belum) Bisa langsung di-deploy ke GitHub Pages karena website statis, tanpa build dan tanpa server.

**P: Apa kekurangan project ini?**
J: Data per browser, password belum di-hash, password admin terlihat di kode, belum ada pembayaran & kalender ketersediaan. Semua akan diselesaikan dengan backend di versi berikutnya.

**P: Rencana ke depan?**
J: (1) Backend Supabase, (2) kalender ketersediaan & pembayaran online, (3) notifikasi WhatsApp otomatis ke admin, (4) foto villa asli dan Tailwind yang di-compile.

**P: Apa yang paling sulit saat membuat project ini?**
J: (Contoh jujur) Mengatur waktu Bali supaya benar di semua zona waktu, dan menjaga data tetap sinkron antara halaman member dan admin.

### 🆘 Kalau tidak tahu jawabannya

> "Terima kasih pertanyaannya, Kak. Untuk bagian itu kami belum mendalami. Yang kami pahami sejauh ini adalah … Kami akan pelajari lebih lanjut."

Jangan mengarang. Mentor lebih menghargai **jujur + tahu arah solusinya**.

---

## 13. Glosarium istilah kode

| Istilah | Arti singkat | Contoh di OASIS |
|---|---|---|
| **Frontend** | Bagian yang dilihat & dipakai pengguna | HTML, CSS, `main.js` |
| **Backend** | Bagian di server yang mengolah & menyimpan data | Sekarang diperankan `db.js` |
| **localStorage** | Penyimpanan teks di browser, bertahan walau ditutup | Semua data OASIS |
| **sessionStorage** | Seperti localStorage tapi hilang saat tab ditutup | Sesi admin |
| **JSON** | Format teks untuk menyimpan objek/array | `JSON.stringify` / `JSON.parse` |
| **DOM** | Halaman HTML dalam bentuk objek yang bisa diubah JS | `document.getElementById` |
| **Event** | Kejadian (klik, submit, scroll, storage) | `addEventListener('submit', …)` |
| **Callback** | Fungsi yang dikirim untuk dijalankan nanti | `requireMember(feature, action)` |
| **IIFE** | Fungsi yang langsung dijalankan, untuk membuat modul privat | `OasisDB = (function(){…})()` |
| **Template literal** | Teks dengan backtick yang bisa menyisipkan variabel | `` `Rp ${harga}` `` |
| **Regex** | Pola pencarian teks | Validasi email, `escapeHtml` |
| **XSS** | Serangan menyisipkan kode ke halaman | Dicegah `escapeHtml` |
| **CDN** | Server yang menyediakan file library | AOS dari jsDelivr, Tailwind |
| **Media query** | Aturan CSS untuk ukuran layar tertentu | `@media (max-width: 720px)` |
| **CSS variable** | Nilai CSS yang bisa dipakai ulang | `--brown: #5a3e36` |
| **Responsive** | Tampilan menyesuaikan ukuran layar | Hamburger & bar menu bawah |
| **Unit test** | Kode yang menguji kode lain secara otomatis | `tests/*.test.cjs` |
| **Deploy** | Mengonlinekan website | GitHub Pages |
| **WITA** | Waktu Indonesia Tengah (UTC+8), zona Bali | `Asia/Makassar` |

---

## 14. Contekan 1 halaman

> Cetak atau buka di HP saat presentasi.

1. **OASIS** = sewa villa mewah per malam di Bali · *Bali's Most Exclusive Doors, Unlocked*.
2. **Teknologi**: HTML, CSS, JavaScript murni, tanpa framework, tanpa server.
3. **Arsitektur 3 lapis**: tampilan (HTML/CSS) → logika (`main.js`, `admin.js`) → data (`db.js`) → localStorage.
4. **"Backend"** = `db.js` (validasi, simpan, login, sesi). Pindah ke server → cukup ganti `db.js`.
5. **Library**: AOS (animasi), Tailwind (login/admin), Google Fonts, Unsplash, `wa.me` (WhatsApp tanpa API key).
6. **Warna**: krem (pasir), cokelat (kayu jati), emas (sunset) = *quiet luxury*. Hijau hanya untuk tombol WhatsApp.
7. **Layout**: hero → keunggulan → katalog → banner → testimoni → footer, + CS selalu ada. Responsif di 980/720/640 px.
8. **Waktu**: semua WITA lewat `Intl.DateTimeFormat` + `Asia/Makassar`.
9. **Keamanan**: `escapeHtml` cegah XSS · sesi dicabut via `credentialVersion` · admin di `sessionStorage` + `noindex`.
10. **Jujur soal batasan**: data per browser, password belum di-hash, password admin di kode → solusi: backend Supabase.
11. **Akun demo**: member `budi@oasis.id` / `password123` · admin `BagaskaraAP`.
12. **Admin WhatsApp**: 0821-7980-8686 (`6282179808686`).

**Semangat! Tenang, senyum, dan tunjukkan kalau kita paham apa yang kita buat. 🌴**
