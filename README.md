# ARTANAYA

Demo pembiayaan usaha nelayan berbasis Next.js. Semua identitas, saldo, efek, verifikasi, pembayaran, dan sinyal radar bersifat fiktif. Ini bukan layanan investasi atau pembayaran riil.

## Jalankan demo lokal

Perlu Node.js 20.19+ dan npm. Tidak perlu Docker atau server database.

```bash
npm ci
copy .env.example .env
npm run dev
```

Di macOS/Linux gunakan `cp .env.example .env`. Buka http://localhost:3000. Perintah `npm run dev` menyiapkan file SQLite, mengisi akun dan proyek contoh, lalu menjalankan Next.js. Data tersimpan di `.local-demo/artanaya.db` dan tidak masuk Git. Untuk port lain, jalankan `npm run dev -- -p 3001` belum didukung; gunakan `npm run db:setup` lalu `npx next dev -p 3001`.

Jika `.env` lama masih berisi URL PostgreSQL, ganti `DATABASE_URL` menjadi `file:../.local-demo/artanaya.db` untuk demo lokal. Isi `AUTH_SECRET` dengan nilai acak yang panjang. Setelah mengubah struktur data, jalankan `npm run db:setup`. Perintah ini aman dijalankan ulang dan tidak menghapus data demo yang sudah ada. Jika muncul halaman “Server error”, jalankan `npm run db:setup`, lalu mulai ulang `npm run dev` dan buka `http://localhost:3000/masuk`.

## Deploy ke Vercel

File SQLite lokal tidak dapat dipakai sebagai database persisten di Vercel. Hubungkan satu database PostgreSQL dari Vercel Marketplace (misalnya Neon) ke proyek Vercel. Pada **Settings → Environment Variables**, pastikan variabel berikut tersedia untuk deployment yang dipakai:

| Variabel | Nilai |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL dari integrasi database; awalan `postgresql://` atau `postgres://` |
| `DATABASE_URL_UNPOOLED` | URL langsung dari Neon untuk migrasi (biasanya ditambahkan otomatis oleh integrasi); hostname tanpa `-pooler` |
| `AUTH_SECRET` | String acak panjang, minimal 32 karakter; pertahankan nilainya antar redeploy |
| `AUTH_TRUST_HOST` | `true` |
| `DEMO_MODE` | `true` |
| `DEMO_PASSWORD` | `ArtaDemo!2026` agar cocok dengan tombol akun demo |

Jangan salin `DATABASE_URL=file:...` atau `AUTH_URL=http://localhost:3000` ke Vercel. Bila integrasi memberi nama variabel berbeda, salin **nilainya** ke `DATABASE_URL`. Deploy ulang setelah mengubah variabel. Build Vercel hanya membuat Prisma Client dan membangun aplikasi; build tidak mengubah database. Untuk database lama, pertahankan proyek Vercel dan semua variabelnya. Bila rilis memiliki migrasi baru, ambil snapshot provider, uji migrasi pada staging, lalu jalankan `npm run db:deploy` satu kali dengan URL PostgreSQL langsung sebelum deploy kode. Jangan jalankan `npm run db:setup` atau seed pada database yang sudah berisi data; seed saat ini dapat memperbarui kata sandi akun demo. URL database dan secret harus tetap rahasia.

## Akun demo

Kata sandi: `ArtaDemo!2026` (atau `DEMO_PASSWORD` saat data contoh pertama dibuat).

| Peran | Email |
| --- | --- |
| Investor | `investor@artanaya.demo` |
| Nelayan | `nelayan@artanaya.demo` |
| Admin | `admin@artanaya.demo` |
| Nelayan baru | `baru@artanaya.demo` |
| Investor menunggu KYC | `ayu@artanaya.demo` |

Keluar untuk berpindah peran. Kode MFA dan buka Self-Lock adalah `123456`. Gunakan berkas PDF, PNG, atau JPG fiktif hingga 2 MB untuk unggahan.

## Alur yang dapat dicoba

1. Sebagai nelayan, buat proyek, isi sinyal 0–100, simpan draf, unggah rencana, lalu ajukan.
2. Sebagai admin, tinjau dan setujui pengajuan.
3. Sebagai admin, siapkan prospektus, terbitkan penawaran, dan catat pendampingan nelayan.
4. Sebagai investor, beli unit dengan saldo fiktif atau lakukan top-up demo. Portofolio dan jurnal berubah setelah refresh.
5. Sebagai admin, coba pelepasan escrow, pencairan bertahap, distribusi laba, atau akhir periode dan refund.

Penawaran dan laporan contoh sudah disiapkan agar alur lintas peran dapat langsung dicoba. Semua perubahan disimpan dalam file SQLite yang sama selama demo lokal berjalan.

## Pemeriksaan

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
```

Pengujian integrasi memakai `.local-demo/artanaya_test.db`, terpisah dari data demo utama.

## Batas penggunaan

SQLite ditujukan untuk satu instalasi lokal; Vercel menggunakan PostgreSQL hosted. Data lokal dan data online terpisah. Jangan gunakan konfigurasi demo ini untuk uang atau identitas nyata.
