# 🌴 OASIS — Luxury Private Villa Stays in Bali

*Bali's Most Exclusive Doors, Unlocked*

OASIS adalah website **sewa villa mewah per malam di Bali**. Pengunjung bisa melihat 6 villa pilihan beserta tarif per malam dalam Rupiah, memesan lewat **WhatsApp** dengan pesan yang tersusun otomatis, dan bertanya lewat CS **OASIS Concierge**. Member bisa booking meeting dan viewing lalu mendapat e-ticket. Admin mengelola booking, member, villa, dan testimoni dari halaman admin tersembunyi.

Dibuat dengan **HTML, CSS, dan JavaScript murni**, tanpa framework dan tanpa server.

---

## 🚀 Cara menjalankan

**Cara 1: paling mudah.** Ekstrak zip, lalu double-click `index.html` (buka dengan Chrome atau Edge).

**Cara 2: server lokal** (disarankan untuk presentasi, dan supaya bisa dibuka dari HP satu Wi-Fi):

```bash
cd oasis-luxury
python -m http.server 8080
```

Lalu buka:

| Halaman | Link |
|---|---|
| Website | http://localhost:8080/index.html |
| Login member | http://localhost:8080/login.html |
| Daftar member | http://localhost:8080/register.html |
| Admin | http://localhost:8080/indexadmin.html |

> ⚠️ **Butuh internet**: Tailwind (tampilan login & admin), AOS (animasi), Google Fonts, dan foto villa dimuat dari internet.
> ⚠️ **Data tersimpan per browser** (localStorage). Buka website dan admin di browser dan alamat yang sama supaya booking terlihat di admin.
> 🔄 **Reset data demo**: tekan `F12` → Console → `localStorage.clear()` → refresh.

## 🔑 Akun demo

| Peran | Login | Password |
|---|---|---|
| Member | `budi@oasis.id` | `password123` |
| Admin | `BagaskaraAP` | `kamumaucaripasswordyangpanjanggini` |

WhatsApp admin: **0821-7980-8686** (`+62 821-7980-8686`).

---

## ✨ Fitur

### Untuk semua pengunjung
- **Katalog 6 villa** di Uluwatu, Seminyak, Canggu, Ubud, Nusa Dua, dan Jimbaran. Best Seller bertanda emas dan tampil paling atas. Harga lengkap per malam, misalnya `Rp 4,700,000 / night`.
- **Book via WhatsApp**: pilih villa, check-in, check-out, jumlah tamu. Estimasi total dihitung langsung (misalnya 3 malam × Rp 4.000.000 = Rp 12.000.000), lalu WhatsApp terbuka ke admin dengan pesan yang sudah lengkap.
- **CS "OASIS Concierge"**: tombol **Need help?** berlogo headset di pojok kanan bawah. Isinya tombol Book Your Stay, Chat with Us (WhatsApp), dan 8 tanya-jawab tentang OASIS dan cara memakai website.
- **Testimoni tamu** (Guest Stories) dan **jam Bali (WITA)** langsung di footer.

### Untuk member (setelah login)
- Ringkasan kamar di kartu villa dan **detail villa** (fasilitas lengkap).
- **Book a Meeting** dengan villa specialist dan **Schedule a Viewing** ke villa. Semua sesi dalam WITA, dan sesi yang sudah lewat ditolak.
- **E-ticket** (`OASIS-MTG-#####` / `OASIS-VISIT-#####`) yang bisa dicetak, pratinjau email konfirmasi, dan tombol **Confirm on WhatsApp** berisi nomor referensi.
- **Share Your Stay**: menulis testimoni (1 ulasan per villa).

### Untuk admin (`indexadmin.html`)
- Tidak ada link ke halaman ini dari website, dan halaman diberi `noindex`.
- **Overview** (statistik), **Bookings** (cari, filter, ubah status), **Members** (edit, reset password, hapus), **Properties** (tambah/edit/hapus villa, atur Best Seller), **Reviews** (tampilkan/sembunyikan).
- Perubahan langsung tampil di tab website lain tanpa refresh.

### Tampilan HP
Menu hamburger, bar menu bawah (Villas, Meeting, Viewing, Reviews, Log In / E-Tickets), dan tombol CS bulat.

---

## 🏗️ Arsitektur

```
Tampilan (HTML + CSS)  →  Logika halaman (main.js, admin.js)  →  Lapisan data (db.js)  →  localStorage
                                                              ↘  link wa.me  →  WhatsApp admin
```

Semua halaman membaca dan menulis data **hanya lewat `db.js`** (`OasisDB`). Kalau nanti pindah ke server (Supabase/Firebase), cukup isi `db.js` yang diganti.

## 📁 Struktur file

| File | Isi |
|---|---|
| `index.html` | Halaman utama + semua pop-up (booking, detail villa, e-ticket, email, testimoni, panel CS) |
| `login.html`, `register.html` | Login & registrasi member |
| `indexadmin.html` | Login & dashboard admin |
| `main.js` | Logika halaman utama: katalog, booking, e-ticket, WhatsApp, CS, menu HP |
| `admin.js` | Logika admin |
| `db.js` | Lapisan data (`OasisDB`) + helper (`OasisUtils`: WITA, Rupiah, keamanan) |
| `style.css` | Semua tampilan, responsif, dan cetak e-ticket |
| `oasis-mark.svg` | Logo OASIS (pohon palem + ombak) |
| `oasis-cs.svg` | Logo CS (headset + ombak) |
| `tests/` | 18 unit test |
| `planing_prd_trd_drd.md` | PRD · TRD · DRD (kebutuhan produk, teknis, desain) |
| `latarbelakang.md` | Alasan dibuat, filosofi nama, logo, warna, font |
| `jawabanpresentasi.md` | Naskah presentasi, skenario demo, dan bank tanya jawab |

## 🧰 Teknologi & library

| Nama | Untuk apa |
|---|---|
| HTML, CSS, JavaScript (murni) | Struktur, tampilan, logika |
| AOS 2.3.1 | Animasi saat scroll di halaman utama |
| Tailwind CSS (Play CDN) | Styling halaman login, registrasi, dan admin |
| Google Fonts | Huruf Playfair Display & Plus Jakarta Sans |
| WhatsApp Click to Chat (`wa.me`) | Booking & chat ke admin, **tanpa API key** |
| localStorage / sessionStorage | Penyimpanan data & sesi di browser |
| `Intl.DateTimeFormat` (`Asia/Makassar`) | Semua jam & tanggal dalam WITA |
| Node.js `node:test` | Unit test |

## 🧪 Menjalankan test

```bash
node --test tests/member-admin.test.cjs tests/whatsapp-admin.test.cjs
```

Hasil saat ini: **18 test lulus**.

## 🌐 Deploy (GitHub Pages)

1. Push ke repo `https://github.com/ayusarii/oasis_luxury` (branch `main`).
2. GitHub → **Settings → Pages** → *Deploy from a branch* → `main` / `(root)` → Save.
3. Website: `https://ayusarii.github.io/oasis_luxury/`

## ⚠️ Keterbatasan (prototipe)

- Data tersimpan per browser, belum di server.
- Password member belum di-hash, dan password admin terbaca di `admin.js`.
- Reservasi WhatsApp tidak tercatat di dashboard admin.
- Belum ada pembayaran online dan kalender ketersediaan.

Rencana v2.0: backend Supabase/Firebase (database bersama, password ter-hash, login admin di server), kalender ketersediaan, pembayaran online, dan notifikasi WhatsApp otomatis.

---

© 2026 OASIS · Private villa stays · Bali, Indonesia
