# Arah database Vercel untuk rebuild ARTANAYA

**Tujuan:** web ARTANAYA yang dibuat ulang tetap memakai **database PostgreSQL hosted yang sekarang terhubung ke proyek Vercel**, beserta data, ID, relasi dan riwayat yang sudah ada. Dokumen ini tidak berisi kredensial. Sambungan langsung ke database Vercel tidak diverifikasi dari workspace lokal, sehingga sebelum deploy perlu pemeriksaan di proyek Vercel yang benar.

## Keputusan arsitektur utama

**Deploy versi baru ke proyek Vercel yang sama** adalah jalur utama. Pertahankan Vercel Project, integrasi database, Environment Variables, domain, dan target Production yang sekarang. Ganti kode/deployment di proyek itu setelah lolos pemeriksaan. Dengan demikian nilai environment yang sudah tersimpan di Vercel dipakai ulang tanpa mengetik ulang URL database. Menyalin kode ke repository baru boleh, tetapi hubungkan repository baru ke **Vercel Project yang sudah ada**; jangan membuat proyek Vercel baru bila tujuannya benar-benar tanpa konfigurasi ulang.

Jika harus membuat Vercel Project baru, sambungan database **tidak berpindah otomatis** hanya karena kode sama. Proyek baru harus dihubungkan ke integrasi database yang sama atau diberi environment yang sama melalui mekanisme Vercel yang aman. Jangan menyalin nilai secret ke repository, prompt, chat, atau file `.env.example`.

## Peta environment yang harus tetap cocok

| Variabel | Fungsi | Aturan saat rebuild |
|---|---|---|
| `DATABASE_URL` | URL PostgreSQL aplikasi; boleh pooled. | Pertahankan nilai dari proyek Vercel lama dan pastikan menunjuk database/branch yang sama. Jangan ganti dengan URL SQLite lokal. |
| `DATABASE_URL_UNPOOLED` | URL langsung untuk migrasi, biasanya dari Neon. | Pertahankan nilai lama. Host migrasi tidak boleh `-pooler`. `DIRECT_URL` adalah fallback yang dikenali script sekarang. |
| `AUTH_SECRET` | Kunci sesi NextAuth. | Pertahankan nilai yang sama, minimal 32 karakter. Mengubahnya dapat memutus sesi aktif. |
| `AUTH_TRUST_HOST` | Kepercayaan host auth. | Tetap `true` sesuai deployment sekarang. |
| `DEMO_MODE` | Mengaktifkan data/aksi demo. | Tetap `true` selama produk masih demo. Jangan menganggap ini aman untuk dana riil. |
| `DEMO_PASSWORD` | Kata sandi seed akun demo. | Jangan ubah saat reuse DB. Script seed saat ini meng-update password akun seed pada tiap deploy. |
| `NEXT_PUBLIC_HELP_WHATSAPP` | Link dukungan opsional. | Pertahankan bila sudah dipakai. Nilai ini tampil di klien, jadi jangan isi secret. |

Periksa scope masing-masing variabel: **Production**, Preview, dan Development dapat berbeda. Jangan arahkan Preview atau database tes ke database Production secara tidak sengaja. Jangan mencetak nilai environment ke log CI, dokumentasi atau screenshot. Untuk melihat nama dan scope, gunakan dashboard Vercel Settings → Environment Variables; untuk memastikan identitas database, gunakan dashboard integrasi/penyedia database tanpa membagikan URL lengkap.

## Kontrak skema yang harus dipertahankan

1. Pertahankan `prisma/schema.prisma`, seluruh `prisma/migrations/`, `prisma/migrations/migration_lock.toml`, dan model/enum serta nama tabel/kolom yang sudah dipakai database lama. Jika membangun ulang repo dari nol, bawa riwayat migrasi ini bersama kode. Jangan membuat skema baru yang memakai nama berbeda lalu mengarahkannya ke database lama.
2. File sumber skema memakai SQLite untuk lokal. `scripts/prisma-schema.mjs` membuat `prisma/schema.postgres.generated.prisma` dengan provider `postgresql` ketika `DATABASE_URL` berupa PostgreSQL. Jangan menghapus logika itu tanpa pengganti yang kompatibel. Jangan menyimpan URL nyata di schema.
3. Untuk PostgreSQL, `scripts/deploy-migrations.mjs` memilih `DATABASE_URL_UNPOOLED` atau `DIRECT_URL` atau `DATABASE_URL`, lalu menjalankan `prisma migrate deploy` tanpa seed. Migrasi tidak boleh melewati pooler. `scripts/setup-demo.mjs` dipakai untuk SQLite lokal; bootstrap PostgreSQL baru memerlukan `DEMO_BOOTSTRAP=true` secara eksplisit. **Jangan jalankan `db push`, `migrate reset`, seed destruktif, truncate, atau drop pada database Production**.
4. Setiap perubahan skema baru harus memakai migrasi maju yang kompatibel dengan data lama. Tambahkan field opsional/default dahulu bila diperlukan; lakukan backfill terukur; baru terapkan constraint lebih ketat setelah data lama cocok. Jangan mengubah ID, request key, jurnal, audit, saldo atau status historis hanya untuk menyederhanakan rebuild.
5. Sebelum migrasi Production, bandingkan skema target dengan skema dan riwayat migrasi yang sudah ada. Bila drift ditemukan, hentikan deploy dan rencanakan migrasi yang eksplisit. Jangan memaksa baseline atau reset untuk “memperbaiki” error.

## Catatan penting tentang build dan seed saat ini

`vercel.json` menjalankan `npm run build`. Pada rebuild ini, `scripts/build-demo.mjs` hanya menjalankan generate Prisma Client dan build Next.js. Migrasi disediakan lewat `npm run db:deploy` atau `npm run db:migrate`; keduanya tidak menjalankan seed. `scripts/setup-demo.mjs` masih menyediakan seed untuk demo lokal dan bootstrap PostgreSQL baru secara eksplisit. Seed memakai `upsert`/pengecekan tetapi tetap meng-update `passwordHash` akun demo yang sudah ada. Maka seed **bukan operasi baca saja** pada database lama.

Untuk rebuild yang harus mempertahankan data dan akun, ubah proses deployment sebelum rilis agar:

- Migrasi dijalankan sebagai langkah eksplisit dan dapat diaudit pada rilis yang memang memiliki migrasi baru; build aplikasi tidak memodifikasi data Production tanpa keputusan rilis.
- Seed awal hanya dijalankan pada database kosong atau lewat sakelar eksplisit khusus bootstrap, dan tidak mengubah pengguna, password, saldo, proyek, jurnal, atau audit yang sudah ada.
- Bila tetap memakai seed untuk demo, uji idempotensi terhadap salinan database terlebih dahulu dan dokumentasikan tepat data mana yang boleh dibuat/diubah.

Pemisahan build dan migrasi sudah diterapkan dalam kode rebuild. Sambungan ke database Vercel Production belum diverifikasi dari workspace lokal; verifikasi tetap diperlukan sebelum deploy Vercel.

## Urutan kerja aman untuk rebuild

### 1. Inventaris koneksi lama

- Catat Vercel Project dan target Production yang sedang aktif; pastikan apakah integrasi memakai Neon atau provider PostgreSQL lain.
- Periksa **nama dan scope** environment di dashboard tanpa menyalin nilainya ke dokumen. Pastikan `DATABASE_URL` dan URL migrasi menunjuk database/branch yang dimaksud.
- Catat schema/migration history dan jumlah ringkas data penting sebelum perubahan: User, Cooperative, Project, Offering, Subscription, Account, Journal, Audit, Document. Gunakan akses read-only bila tersedia.
- Buat backup/snapshot database melalui provider sebelum migrasi pertama dan pastikan prosedur restore diketahui. Backup dapat berisi data sensitif; simpan di tempat provider yang berwenang.

### 2. Bangun kode baru dengan kontrak lama

- Pertahankan nama env dan formatnya. Kode runtime membaca `DATABASE_URL` dari environment Vercel; jangan hardcode URL atau mengganti dengan database baru.
- Pertahankan model Prisma serta riwayat migrasi. Jika perlu perubahan, buat migrasi kompatibel. `npm ci`, generate client, typecheck, lint, unit/integrasi lokal dan build harus lulus tanpa koneksi Production.
- Uji migrasi di database staging/salinan skema dan data yang tepat, bukan pada Production pertama kali. Gunakan URL staging yang berbeda secara eksplisit.
- Pertahankan build yang tidak meng-seed Production secara otomatis. Migrasi rilis dijalankan sekali melalui proses deployment yang jelas.

### 3. Hubungkan ke proyek Vercel yang sama

- Atur repository/branch baru sebagai sumber deployment dari **Vercel Project yang sudah ada**. Jangan menghapus integrasi database atau environment lama.
- Tinjau Preview environment sebelum menyalakan Preview. Jangan memakai database Production untuk tes mutasi di Preview.
- Pada rilis yang memiliki migrasi, jalankan `prisma migrate deploy` terhadap URL langsung yang sesuai, sekali, setelah backup dan verifikasi. Rilis tanpa migrasi cukup menjalankan build yang tidak menyentuh data.
- Deploy kode dan lakukan pemeriksaan read-only awal: login, jumlah data, contoh proyek lama, saldo, jurnal dan dokumen. Setelah itu uji aksi mutasi demo pada akun/proyek khusus uji yang memang boleh berubah.

### 4. Verifikasi pascadeploy

- Pastikan domain dan Vercel Project sama; `DATABASE_URL` tetap berasal dari environment proyek itu.
- Bandingkan jumlah serta ID beberapa User, Project, Offering, Subscription, Journal dan Audit sebelum/sesudah. Tidak boleh ada hilangnya data historis.
- Periksa saldo `Account`, jumlah baris dan keseimbangan jurnal, status penawaran/pesanan, serta kunci `RequestKey`. Jangan menulis ulang ledger agar tampak cocok.
- Coba autentikasi akun yang memang diizinkan. Jika `AUTH_SECRET` dan host dipertahankan, tidak ada perubahan konfigurasi sesi yang disengaja; pengguna mungkin tetap perlu login ulang karena pergantian domain/cookie atau sesi yang kedaluwarsa.
- Periksa bahwa endpoint dokumen menolak akses lintas pemilik dan UI menampilkan proyek lama yang sesuai role.

## Kegagalan dan rollback

- Jika koneksi gagal, cek nama/scope environment, provider PostgreSQL, host pooler vs direct, dan schema/migration history; jangan mengganti URL dengan database kosong untuk membuat halaman hidup.
- Jika migrasi gagal, **jangan** menjalankan reset. Hentikan rollout, baca error dan status migrasi, lalu rencanakan perbaikan/restore sesuai snapshot. Deploy versi kode lama belum tentu cukup jika skema baru sudah diterapkan; migrasi perlu didesain agar kompatibel dengan kode lama selama jendela rollback.
- Jika data berubah akibat seed, hentikan build otomatis yang menjalankan seed, evaluasi perubahan terhadap snapshot, lalu pulihkan hanya dengan prosedur yang disetujui pemilik data.

## Kriteria penerimaan reuse database

1. Kode baru di-deploy ke Vercel Project yang sama dan membaca environment yang sudah ada, tanpa URL hardcoded atau konfigurasi ulang manual.
2. Koneksi mengarah ke database PostgreSQL/branch lama, bukan database kosong baru.
3. Migrasi lama dikenali; migrasi baru, bila ada, lulus pada staging lebih dulu dan tidak menghapus data historis.
4. Build rutin tidak menjalankan seed yang mengubah akun/saldo/data lama.
5. Data proyek, investor, pesanan, saldo, jurnal, audit dan dokumen lama tetap terbaca dan akses perannya benar.
6. Rahasia database dan `AUTH_SECRET` tidak muncul di repo, artefak, log, atau dokumentasi.
