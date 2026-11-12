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

Jika `.env` lama masih berisi URL PostgreSQL, ganti `DATABASE_URL` menjadi `file:../.local-demo/artanaya.db` dan hapus `DIRECT_URL`. Isi `AUTH_SECRET` dengan nilai acak yang panjang untuk penggunaan di luar laptop pribadi. Setelah mengubah struktur data, jalankan `npm run db:setup`. Perintah ini aman dijalankan ulang dan tidak menghapus data demo yang sudah ada.

## Akun demo

Kata sandi: `ArtaDemo!2026` (atau `DEMO_PASSWORD` saat data contoh pertama dibuat).

| Peran | Email |
| --- | --- |
| Investor | `investor@artanaya.demo` |
| Nelayan | `nelayan@artanaya.demo` |
| Admin | `admin@artanaya.demo` |
| Operator koperasi | `koperasi@artanaya.demo` |
| Fasilitator | `fasilitator@artanaya.demo` |
| Nelayan baru | `baru@artanaya.demo` |
| Investor menunggu KYC | `ayu@artanaya.demo` |

Keluar untuk berpindah peran. Kode MFA dan buka Self-Lock adalah `123456`. Gunakan berkas PDF, PNG, atau JPG fiktif hingga 2 MB untuk unggahan.

## Alur yang dapat dicoba

1. Sebagai nelayan, buat proyek, isi sinyal 0–100, simpan draf, unggah rencana, lalu ajukan.
2. Sebagai admin, tinjau dan setujui pengajuan.
3. Sebagai koperasi, siapkan prospektus. Sebagai admin, terbitkan penawaran.
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

Penyimpanan SQLite ditujukan untuk satu instalasi lokal. Hosting serverless seperti Vercel tidak menyediakan file lokal persisten antar permintaan; agar seluruh fitur dapat dipakai bersama secara online diperlukan layanan database persisten dan konfigurasi deploy yang sesuai. Jangan gunakan konfigurasi demo ini untuk uang atau identitas nyata.
