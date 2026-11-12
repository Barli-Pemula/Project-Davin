# ARTANAYA

Demo Next.js untuk pembiayaan usaha nelayan melalui koperasi dan Securities Crowdfunding Syariah **simulasi**. Seluruh identitas, saldo, efek, verifikasi, liveness, MFA, dan sinyal radar adalah fiktif. Aplikasi ini belum menjadi layanan investasi atau pembayaran riil.

## Menjalankan di laptop

Persyaratan: Node.js 20.19+, npm, dan PostgreSQL 17+ atau Docker. Windows tanpa Docker dapat memakai PostgreSQL tertanam untuk pengembangan.

```bash
npm ci
cp .env.example .env
# Isi AUTH_SECRET dengan nilai acak yang panjang, misalnya: openssl rand -base64 32
docker compose up -d postgres
npm run db:setup
npm run dev
```

Buka **http://localhost:3000**. Di Windows, salin `.env.example` secara manual ke `.env` jika `cp` tidak tersedia. `docker-compose.yml` memakai port 5432. Jika port tersebut dipakai aplikasi lain, ubah pemetaan port dan `DATABASE_URL`/`DIRECT_URL` di `.env`.

Tanpa Docker, jalankan `npm run db:local` dalam terminal tersendiri. PostgreSQL tertanam menyimpan data dalam `.local-postgres/`; konfigurasi defaultnya memakai port 5432. Pada laptop pengembangan ini, port 55432 dipakai karena 5432 tidak tersedia. Samakan port pada kedua URL database di `.env`, kemudian jalankan `node scripts/create-local-db.mjs` dan `npm run db:setup`. Database akan tetap ada setelah proses dihentikan.

Perintah yang tersedia: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run db:migrate`, `npm run db:seed`. Pengujian integrasi **selalu** membuat atau memakai database dengan nama mengandung `_test`; data demo utama tidak dihapus.

### Jika login lokal gagal

Server Next.js dan database harus sama-sama aktif. Jika memakai PostgreSQL tertanam, jalankan `npm run db:local` di terminal pertama dan biarkan tetap berjalan, lalu `npm run dev` di terminal kedua. Jalankan kembali keduanya setelah restart laptop. Data di `.local-postgres/` tetap tersimpan, tetapi proses database tidak otomatis aktif kembali.

Jika log server menampilkan `Can't reach database server`, periksa bahwa port database sesuai dengan `DATABASE_URL` dan `DIRECT_URL` di `.env`. Jika database baru belum berisi akun demo, jalankan `npm run db:setup` setelah database aktif. Pesan batas percobaan login berlaku selama 15 menit; gangguan layanan kini ditampilkan dengan pesan terpisah.

## Akun demo

Kata sandi semua akun seed: `ArtaDemo!2026` (dapat diganti melalui `DEMO_PASSWORD` sebelum seed pertama).

| Peran | Email |
| --- | --- |
| Investor | `investor@artanaya.demo` |
| Nelayan | `nelayan@artanaya.demo` |
| Admin | `admin@artanaya.demo` |
| Operator koperasi | `koperasi@artanaya.demo` |
| Fasilitator | `fasilitator@artanaya.demo` |
| Nelayan baru | `baru@artanaya.demo` |
| Investor menunggu KYC | `ayu@artanaya.demo` |

Keluar akun untuk berpindah peran. Akun baru melalui `/daftar` hanya tersedia untuk investor dan nelayan. Kode MFA dan verifikasi ulang Self-Lock: **123456**. Gunakan dokumen fiktif PDF, PNG, atau JPG sampai 2 MB. Unggahan disimpan sebagai `Bytes` di PostgreSQL dan hanya dapat diunduh dari endpoint berotorisasi.

## Coba alur lintas peran

1. Masuk sebagai `nelayan` atau `baru`. Buat proyek, isi sinyal 0–100 (biarkan R kosong untuk nelayan baru), simpan draf, unggah dokumen rencana fiktif, lalu ajukan. Proyek `Jaring Ramah Laut Nusantara` sudah memiliki catatan revisi sehingga dapat diperbaiki dan diajukan ulang.
2. Masuk sebagai `admin`, buka **Pengajuan & dana**, tinjau skor beserta alasan dan dokumen, kemudian setujui atau kembalikan dengan alasan.
3. Masuk sebagai `koperasi`, susun target, harga unit, risiko, dan penggunaan dana pada prospektus proyek yang disetujui. Setujui akad terpisah dengan nelayan setelah penawaran diterbitkan. Admin menerbitkan penawaran setelah meninjau skor, identitas, keanggotaan, periode, dan dokumen.
4. Masuk sebagai `investor`, buka detail penawaran, baca prospektus dan risikonya, lalu beli minimal **Rp50.000** dalam kelipatan harga unit. Saldo dan progres penawaran berubah setelah refresh. **Top-up demo** menambah saldo fiktif. Kotak *simulasikan pembayaran gagal* menguji kegagalan tanpa memotong saldo. Ulangi dengan data yang sama bila koneksi terputus.
5. Untuk uji sukses cepat, penuhi sisa target penawaran aktif. Admin melepas escrow ke koperasi. Nelayan dan koperasi menyetujui akad, admin menyetujui lalu mencairkan tahap sesuai urutan. Nelayan mengirim laporan dan bukti; admin memvalidasi lalu mendistribusikan hasil. Proyek `Tambak Bandeng Mutiara Pesisir` sudah berjalan dengan tahap pertama cair dan laporan laba Rp1.000.000 siap didistribusikan.
6. Untuk uji gagal, gunakan penawaran `Peremajaan Kapal Tunas Laut`. Admin memilih **Simulasi akhir periode & refund**. Pesanan kembali sekali ke dompet investor. Admin melihat jurnal dan audit di **Ledger & audit**. Investor dapat mengaktifkan Self-Lock dan membukanya dengan kode demo 123456.

Seed aman dijalankan ulang: akun, saldo awal, jurnal awal, dan proyek contoh tidak digandakan. Dana awal investor Rp25.000.000 diisi sekali; tiga pesanan seed berjumlah Rp17.000.000 sehingga saldo awal yang terlihat Rp8.000.000. Beberapa penawaran sudah aktif atau sukses agar lintas portal dapat dicoba sejak awal.

## Aturan dan batas demo

- Skor di backend: `S = 0,25T + 0,30P + 0,15K + 0,15L + 0,15R`. Sinyal ternormalisasi 0–100 diberikan sebagai input demo: **T** transaksi 90 hari, **P** produksi 6 bulan, **K** keanggotaan, **L** legalitas, **R** riwayat akad. Normalisasi data mentah belum tersedia sehingga seed memakai contoh fiktif. Nilai `0` valid dan berbeda dari kosong.
- Ambang: ≥70 Tinggi, 50–<70 Sedang, <50 Perlu Pembinaan. Bila hanya R kosong dan empat sinyal lain lengkap, bobot empat sinyal dibagi 0,85 dan diberi label **Nelayan Baru**. Sinyal wajib yang kosong menghasilkan skor sementara; tanpa sinyal skor kosong. Skor sementara dan skor <50 tidak bisa diterbitkan. Admin tetap menjadi gerbang publikasi.
- Pembelian dilakukan dalam transaksi PostgreSQL `SERIALIZABLE` dengan retry terbatas. Setiap aktor+tindakan+kunci permintaan memiliki hasil unik; kunci jurnal unik per kejadian. Saldo berasal dari jurnal berpasangan dan proyeksi akun yang diubah dalam transaksi sama. Constraint database menjaga saldo, target, nominal, nisbah, dan jurnal tetap valid. Audit dan jurnal bersifat append-only.
- Contoh laba Rp1.000.000: nisbah akad koperasi 60% (Rp600.000) dan nelayan 40% (Rp400.000). Prospektus demo mengalokasikan 80% porsi laba koperasi (Rp480.000) ke investor secara pro-rata; koperasi menyimpan Rp120.000. Sisa pembulatan rupiah jatuh ke ID pesanan yang diurutkan. Laba nol membagikan nol. Kerugian ditandai tinjauan manual. Fitur laba tidak mengembalikan pokok. Skenario imbal hasil pada kartu proyek **bukan** realisasi atau jaminan.
- Ledger adalah hash SHA-256 dari referensi internal dan baris jurnal; **bukan** smart contract on-chain. Radar memakai alert seed fiktif; tidak membaca lokasi nyata. Liveness, MFA, top-up, pembayaran, dan escrow memakai adaptor simulasi dalam layanan backend. Self-Lock diperiksa lagi di server untuk top-up dan pembelian.

P0 yang tersedia: landing, edukasi/FAQ ringkas, pendaftaran, login, verifikasi, dashboard investor/nelayan/admin, katalog, portofolio, penawaran, proyek, laporan, dompet, koperasi, fasilitator, audit, ledger, radar, dan Self-Lock. Forum Bahari, artikel lanjutan, konsultasi AI terbuka, integrasi pembayaran/identitas nyata, dan ledger on-chain berada di luar MVP.

## Deploy Vercel

1. Buat database PostgreSQL terkelola yang dapat diakses Vercel. Sediakan URL koneksi pooler sebagai `DATABASE_URL` dan URL koneksi langsung untuk migrasi sebagai `DIRECT_URL`. Gunakan penyedia yang mendukung koneksi Prisma/Node.js di lingkungan serverless.
2. Pada Vercel, impor repositori ini sebagai proyek **Next.js**. Set environment variable `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (acak dan rahasia), `AUTH_TRUST_HOST=true`, `DEMO_MODE=true`, dan `DEMO_PASSWORD` bila ingin mengubah kata sandi seed. `NEXT_PUBLIC_HELP_WHATSAPP` opsional (nomor internasional tanpa `+`). Jangan menaruh `.env` di Git. `AUTH_URL` lokal tidak perlu dipakai untuk domain Vercel; jika diisi, gunakan URL publik yang tepat.
3. Jalankan `npm run db:migrate` dari lingkungan yang memiliki akses ke database produksi demo, lalu `npm run db:seed` **hanya** untuk instalasi demo dengan data fiktif. Migrasi terpisah dari build Vercel agar tidak mengubah database setiap kali halaman dibangun. Deploy memakai `npm ci` dan `npm run build` sesuai `vercel.json`.
4. Buka domain deploy dan uji login lima peran serta pembelian fiktif. Sebelum mengubah `DEMO_MODE` untuk pemakaian non-demo, layanan identitas, penerbit, pembayaran, escrow, dokumen, keamanan, regulasi, dan pengawasan syariah perlu dirancang dan diverifikasi lebih lanjut.

Sesi Auth.js disimpan sebagai JWT terenkripsi yang menunjuk ke record sesi server di database. Hak akses diperiksa pada Route Handler dan saat memuat halaman sesuai peran dan objek. Semua uang domain disimpan sebagai `BigInt` rupiah bulat dan dikirim ke client sebagai string; waktu disimpan UTC dan ditampilkan dalam zona Asia/Jakarta.
