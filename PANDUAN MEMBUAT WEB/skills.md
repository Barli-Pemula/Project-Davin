# SKILLS.md — panduan kemampuan untuk membangun dan merawat ARTANAYA

Dokumen ini adalah playbook kerja proyek, bukan deklarasi bahwa semua kemampuan produk sudah ada. Bacalah [PRD.md](./PRD.md) untuk kontrak fitur dan batas simulasi serta [ARAH DATABASE VERCEL.md](./ARAH%20DATABASE%20VERCEL.md) untuk reuse database saat rebuild. Jika dipakai oleh agen pembuat web, ikuti urutan dan pemeriksaan di bawah agar perubahan tidak merusak alur dana atau akses.

**Skill desain yang dipasang:** `design-taste-frontend` dari `Leonxlnx/taste-skill` (versi yang terdeteksi di Codex saat panduan diperbarui: 2.5.1). Saat membangun atau merombak antarmuka, baca `SKILL.md` skill tersebut dan terapkan proses desain, foto nyata berlisensi, pemeriksaan browser, serta finish gate yang relevan. Pertahankan PRD ARTANAYA, aksesibilitas, batas simulasi, dan kontrak database Vercel sebagai kebutuhan produk. Skill desain tidak memberi izin menghapus data, mengganti database, atau mengubah aturan dana.

## 1. Kemampuan wajib tim/agen

| Bidang | Kemampuan praktis | Bukti hasil |
|---|---|---|
| Analisis produk | Memetakan persona, halaman, alur, status dan kriteria terima dari kode/PRD. | Matriks fitur dan daftar asumsi yang bisa diperiksa. |
| UX Indonesia | Menulis microcopy jelas, form bertahap, status kosong/gagal/sukses, keputusan beralasan. | Alur dapat dipahami pengguna pertama kali. |
| Frontend | Next.js App Router, React Server/Client Components, TypeScript, CSS responsif, komponen aksesibel. | Tampilan 360/1440 px dan keyboard berfungsi. |
| Backend | Route Handler, NextAuth, validasi Zod, otorisasi server, Prisma. | Pengguna tidak bisa melakukan aksi di luar peran/kepemilikan. |
| Domain keuangan demo | Rupiah bulat BigInt, rekening escrow, jurnal berimbang, idempotensi, transaksi serializable. | Tidak ada saldo negatif atau mutasi ganda. |
| Data/model | Relasi Prisma, migrasi SQLite/PostgreSQL, seed bootstrap yang tidak mengubah data lama. | Migrasi kompatibel dan deploy ulang tidak mengubah akun, saldo atau riwayat. |
| Keamanan dokumen | Validasi signature berkas, ukuran, akses privat, unduhan aman. | Dokumen orang lain ditolak 403. |
| QA | Unit aturan skor/alokasi, integrasi lintas peran, lint, typecheck, build, pemeriksaan UI. | Skenario penerimaan PRD lulus. |

## 2. Sumber kebenaran dan cara membaca proyek

1. Mulai dari `AGENTS.md`, lalu baca dokumentasi Next.js yang relevan di `node_modules/next/dist/docs/` **sebelum menulis kode**. Versi Next.js proyek dapat berbeda dari pengetahuan umum. Periksa catatan deprecated API.
2. Baca `package.json`, `README.md`, `PRD.md`, `DESIGN.md` di akar proyek, `prisma/schema.prisma`, `src/lib/validation.ts`, `src/lib/actions.ts`, `src/lib/domain.ts`, `src/lib/finance.ts`, `src/lib/scoring.ts`, dan route/komponen yang hendak diubah.
3. Anggap kode berjalan sebagai kebenaran saat mendokumentasikan fitur yang sudah ada; jelaskan perubahan yang diusulkan secara terpisah.
4. Jaga `AGENTS.md` termasuk blok yang dihasilkan Next dev. Jangan menghapusnya hanya agar diff tampak bersih.
5. Jangan menyalin `.env`, kata sandi, token atau URL database ke dokumen publik. Akun seed hanya untuk data demo lokal.

## 3. Alur kerja untuk tiap perubahan

1. Tentukan aktor, tujuan, halaman, aksi API, entitas dan status sebelum menyunting.
2. Tulis aturan sebelum UI: prasyarat, nilai minimum/maksimum, kepemilikan, transisi status, hasil sukses, pesan gagal dan retry.
3. Perbarui skema Prisma dan migrasi jika struktur data berubah. Pertahankan constraint unik untuk idempotensi dan relasi penting.
4. Tambahkan/ubah validasi Zod di `src/lib/validation.ts`; validasi HTML hanya bantuan UX, bukan pengganti pemeriksaan server.
5. Implementasikan aturan di `src/lib/actions.ts` atau fungsi domain kecil; gunakan `atomic` untuk mutasi, `audit` untuk keputusan dan `journal`/`transfer` untuk dana.
6. Pastikan loader `src/lib/portal.ts` menyaring data sesuai peran dan pemilik. Jangan mengirim data privat lalu menyembunyikannya dengan CSS.
7. Bangun UI dengan label yang jelas, status loading/kosong/error/sukses, pesan dekat aksi, dan konfirmasi tindakan yang berdampak.
8. Perbarui seed dan dokumentasi bila alur demo berubah. Jalankan pemeriksaan yang relevan lalu uji skenario nyata lintas peran.

## 4. Aturan implementasi yang tidak boleh dilanggar

### Akses dan sesi

- Pemeriksaan halaman dan API harus dilakukan di server. Role hanya `INVESTOR`, `NELAYAN`, `ADMIN`.
- Investor hanya mengakses wallet, order, alert, audit dan dokumen sendiri; nelayan hanya proyek/laporan/dokumen sendiri; admin mengakses antrean lintas pengguna.
- Aksi pendampingan memerlukan penugasan aktif dan admin yang ditugaskan.
- Cek `Origin` host sama pada POST yang mengubah data. Jangan mengandalkan tombol UI untuk keamanan.

### Dana dan status

- Simpan nominal sebagai integer/BigInt rupiah. Jangan gunakan floating point untuk saldo, harga unit, escrow, hasil atau alokasi.
- Semua jurnal harus memiliki minimal dua baris, tanpa baris nol, dan jumlah baris tepat nol. Rekening selain `DEMO_CLEARING` tidak boleh negatif.
- Untuk pembelian: validasi akun terverifikasi/tidak terkunci, penawaran aktif dalam periode, harga unit, saldo, sisa target dan prospektus versi aktif dalam transaksi yang sama.
- Untuk retry: pertahankan `RequestKey` berdasarkan aktor + aksi + kunci dan fingerprint payload. Kunci lama dengan data berbeda harus ditolak.
- Untuk distribusi: satu distribusi per akad/laporan/jenis; alokasi sisa rupiah deterministik. Laba nol tidak menciptakan jurnal bernilai nol. Rugi tidak dibagi otomatis.
- Refund hanya dari penawaran gagal yang sebelumnya aktif dan belum penuh; setiap pesanan dikembalikan sekali.

### Skor

- Input 0 adalah nilai sah; `null` artinya belum ada data. Jangan gunakan truthiness untuk membedakannya.
- Bobot T/P/K/L/R = 25/30/15/15/15. Normalisasi hanya dari bobot sinyal yang tersedia; empat sinyal lengkap dengan R kosong adalah kasus khusus Nelayan Baru.
- Skor sementara tidak boleh lolos persetujuan dan publikasi. Ambang >=50 dan >=70 dihitung sebelum pembulatan tampilan.
- Label sumber harus menjelaskan bahwa skor berdasarkan input demo, bukan prediksi AI produksi.

### Berkas dan privasi

- Ukuran unggah 1 byte–2 MB; hanya PDF, PNG, JPEG dengan magic bytes cocok dengan MIME.
- Periksa konteks: KYC milik sendiri dan belum terverifikasi; PROJECT milik sendiri dalam status editable; REPORT milik sendiri dan belum valid.
- Unduhan hanya pemilik/admin. Tambahkan `no-store`, `nosniff` dan attachment. Jangan tampilkan bytes di HTML atau log.
- Gunakan identitas fiktif pada seed, screenshot, pengujian dan contoh.

## 5. Panduan desain dan konten

- Pertahankan bahasa Indonesia, identitas pesisir, navy/teal/amber, dan mode demo yang terlihat di halaman publik maupun portal.
- Setiap angka hasil diberi konteks “skenario/ilustrasi, bukan jaminan”. Foto proyek diberi keterangan ilustratif dan kredit lisensi.
- Form nelayan dimulai dari usaha dan modal, lalu rencana/sinyal, lalu dokumen/kirim. Pastikan tombol kembali dan simpan draf tidak menghilangkan isian.
- Gunakan badge dengan teks untuk status, progress bar dengan angka, format rupiah Indonesia, serta pesan error yang menjelaskan langkah perbaikan.
- Sidebar desktop, menu overlay dan navigasi bawah seluler harus konsisten dengan role. Uji 360 px dan 1440 px, keyboard, fokus, label, alt, `aria-current` dan skip link.
- Gunakan komponen dan gaya yang sudah ada bila sesuai. Hindari desain generik yang mengubah karakter produk tanpa alasan.

## 6. Peta pengujian berdasarkan risiko

| Perubahan | Pemeriksaan minimum |
|---|---|
| Copy atau konten statis | Baca halaman hasil, cek tautan, ejaan, mobile. |
| Form/validasi | Input valid, kosong, batas, format salah, pesan kesalahan, retry. |
| Role/data privat | Sesi hilang, role salah, pemilik lain, URL langsung, dokumen lain. |
| Skor | Semua lengkap, R saja kosong, sinyal lain kosong, semua kosong, 0, ambang 50/70. |
| Pembelian/top-up/refund | Nominal batas, saldo kurang, Self-Lock, gagal simulasi, klik ganda, kunci sama/beda, dua permintaan serentak. |
| Pencairan/distribusi | Urutan tahap, laporan valid, saldo koperasi, laba positif/nol/negatif, sisa rupiah, panggilan ulang. |
| Database/deploy | Migrasi maju, seed hanya saat bootstrap, database tes terpisah, build tanpa mutasi data Production. |

Perintah dasar: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:integration`, `npm run build`. Bila mengubah fitur dana, jalankan tes domain dan integrasi terkait; bila mengubah antarmuka, periksa halaman di browser, termasuk layar sempit.

## 7. Definisi selesai

Sebuah fitur selesai bila seluruh kriteria terima di PRD terkait terpenuhi; role dan pemilik diperiksa di server; validasi dan status gagal jelas; mutasi dana atomik dan dapat diaudit; UI responsif serta dapat dipakai keyboard; data demo tetap fiktif; dokumentasi dan seed diselaraskan; pemeriksaan relevan lulus. Bila ada batasan yang tidak bisa dipenuhi, tulis secara eksplisit di hasil kerja dan jangan menyebut fitur tersebut selesai.

## 8. Rencana pengembangan setelah demo

Pisahkan proyek produksi dari simulasi. Tahap berikutnya dapat mencakup editor prospektus berversi, scheduler penutupan penawaran, penyelesaian status proyek, alur rugi dan pokok yang disetujui pihak berwenang, analitik, Forum Bahari, dan integrasi pembayaran/KYC nyata. Setiap fitur yang menyentuh dana atau identitas nyata memerlukan spesifikasi hukum, keamanan, privasi, rekonsiliasi, dan operasional yang baru; jangan mengaktifkannya dengan sekadar mengganti label “demo”.

## 9. Skill tambahan: mempertahankan database Vercel saat rebuild

- Pilih deployment pada **Vercel Project yang sama** agar Environment Variables dan integrasi PostgreSQL yang sekarang tetap dipakai. Jika sumber repository berubah, ubah sumber deployment proyek yang ada; jangan membuat proyek baru lalu mengasumsikan koneksinya ikut berpindah.
- Baca `scripts/build-demo.mjs`, `scripts/deploy-migrations.mjs`, `scripts/setup-demo.mjs`, `scripts/prisma-schema.mjs` dan `prisma/seed.ts` sebelum menyentuh build atau migrasi. Build saat ini tidak lagi menjalankan migrasi/seed; `db:deploy` menjalankan migrasi PostgreSQL tanpa seed, sedangkan bootstrap hosted memerlukan `DEMO_BOOTSTRAP=true`. Seed dapat meng-update password akun demo bila dijalankan, jadi hindari pada database lama.
- Pertahankan `DATABASE_URL`, `DATABASE_URL_UNPOOLED`/`DIRECT_URL`, `AUTH_SECRET` dan scope Production tanpa menyalin nilainya ke repo. Jangan mengubah `AUTH_SECRET` bila tidak perlu. Pastikan Preview dan integrasi tes tidak memakai DB Production untuk mutasi.
- Bawa skema serta seluruh riwayat migrasi lama. Buat migrasi maju yang kompatibel, uji di staging, ambil backup/snapshot, lalu jalankan migrasi rilis terhadap URL direct. Jangan jalankan `db push`, `migrate reset`, truncate atau drop pada Production.
- Sesudah deploy, bandingkan data lama dan aksesnya: pengguna, proyek, penawaran, pesanan, saldo, jurnal, audit, dokumen. Kegagalan koneksi bukan alasan membuat database kosong baru. Lihat langkah rinci dan rollback pada dokumen arah database.

Jika panduan ini akan dipasang sebagai **Codex skill** yang dapat ditemukan otomatis, `skills.md` saja belum menjadi paket skill. Saat membuat paketnya, letakkan instruksi utama dalam file `SKILL.md` pada direktori skill yang valid, sertakan metadata/frontmatter sesuai format skill yang dipakai, lalu sertakan PRD, arah database dan prompt sebagai referensi. Pastikan skill memerintahkan agen membaca ketiga referensi itu saat tugas rebuild ARTANAYA. Jangan menaruh URL database atau secret di paket skill.
