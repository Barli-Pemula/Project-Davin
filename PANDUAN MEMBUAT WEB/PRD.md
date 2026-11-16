# PRD ARTANAYA — spesifikasi web berdasarkan implementasi

**Versi:** 1.0 · **Tanggal pemeriksaan:** 16 November 2026 · **Status:** dokumentasi perilaku demo saat ini.

## 1. Ringkasan produk

ARTANAYA adalah web demonstrasi pembiayaan usaha pesisir. Nelayan membuat pengajuan modal, admin memeriksa identitas dan kelayakan, koperasi menjadi penerbit penawaran simulasi, investor membeli unit fiktif, lalu progres usaha, aliran dana, dan bagi hasil dicatat. Seluruh identitas, saldo, pembayaran, verifikasi wajah, skor, dan sinyal radar adalah data atau proses demo. Tidak ada investasi maupun pembayaran riil.

Dokumen ini diturunkan dari kode `src`, `prisma`, `public`, `tests`, dan `README.md`. Jika spesifikasi lama `ARTANAYA_PRD.md` berbeda dengan kode saat ini, perilaku kode saat ini adalah acuan bagian **sudah ada**. Bagian **pengembangan lanjutan** adalah kebutuhan tambahan, bukan klaim implementasi.

**Persyaratan rebuild:** gunakan kembali database PostgreSQL yang saat ini terhubung ke Vercel Project yang sama, tanpa menghilangkan data lama atau memasukkan ulang kredensial ke kode. Ikuti [ARAH DATABASE VERCEL.md](./ARAH%20DATABASE%20VERCEL.md). Koneksi Production belum diverifikasi dari workspace lokal.

### Sasaran

1. Nelayan dapat menyiapkan pengajuan dari draf sampai tinjauan dan memantau dana serta laporan.
2. Investor dapat membaca usaha, skor, risiko, prospektus, dan simulasi hasil sebelum membeli.
3. Admin dapat menelusuri seluruh keputusan, pembukuan demo, verifikasi, risiko, dan pendampingan.
4. Pengunjung memahami alur dan batas simulasi sebelum membuat akun.

### Indikator keberhasilan yang disarankan

| Indikator | Definisi pengukuran |
|---|---|
| Konversi pengajuan | Jumlah proyek DIAJUKAN / proyek DRAF yang dibuat. |
| Waktu tinjauan | Median selisih waktu pengajuan ke keputusan admin. |
| Penyelesaian KYC | Akun TERVERIFIKASI / akun yang mengirim KYC. |
| Pembelian berhasil | Pesanan TERKONFIRMASI / percobaan pembelian. |
| Laporan valid | Laporan VALID / laporan DIAJUKAN. |
| Konsistensi dana | Semua jurnal berimbang, saldo non-clearing tidak negatif, refund dan distribusi tidak ganda. |

Target angka harus ditetapkan setelah data pilot tersedia. Belum ada sistem analitik khusus dalam kode.

## 2. Peran, izin, dan batas data

| Peran | Boleh melihat | Boleh mengubah |
|---|---|---|
| Pengunjung | Beranda, Edukasi, Kredit Foto, Masuk, Daftar. | Mendaftar sebagai investor atau nelayan. |
| Investor | Penawaran yang telah diterbitkan, detail, prospektus, skor, portofolio sendiri, dompet dan jurnal sendiri, profil, keamanan. | KYC sendiri, unggah dokumen identitas, top-up demo, Self-Lock, pembelian penawaran aktif. |
| Nelayan | Proyek sendiri, skor dan catatan keputusan sendiri, Dompetku, akad dan laporan sendiri, catatan pendampingan, profil. | KYC sendiri, draf dan berkas proyek sendiri, pengajuan, tanda tangan akad, laporan serta bukti. |
| Admin | Seluruh proyek, KYC, laporan, alert, jurnal, audit, penugasan, dokumen. | Keputusan KYC/proyek/laporan, penawaran, waktu akhir demo, refund, pelepasan escrow, akad sisi koperasi, tahap pencairan, distribusi, alert, penugasan dan catatan pendampingan sesuai kepemilikan penugasan. |

Server memeriksa sesi dan peran pada route serta aksi. Investor tidak memperoleh daftar proyek privat nelayan. Nelayan hanya menerima proyek miliknya. Dokumen privat dapat diunduh pemilik atau admin. Pengguna yang membuka URL portal peran lain dialihkan ke portal perannya. URL detail yang tidak dikenal menghasilkan 404.

## 3. Peta halaman dan navigasi

| URL | Konten dan fungsi |
|---|---|
| `/` | Beranda publik: hero foto ilustratif, CTA nelayan/investor, tiga peran, dua penawaran terbaru dari database demo yang telah diterbitkan, empat tahap alur, edukasi risiko, CTA masuk dan penjelasan mode demo. Jika belum ada penawaran, tampilkan keadaan kosong. |
| `/edukasi` | Tiga langkah mencoba, enam kartu tanya jawab dengan `details`, FAQ bantuan dan Self-Lock, tautan WhatsApp bila dikonfigurasi. |
| `/kredit-foto` | Kredit dan lisensi foto ilustrasi. |
| `/masuk` | Pemilih akun demo investor/nelayan/admin, email dan kata sandi, tampil/sembunyi kata sandi, pesan kesalahan, tautan daftar. |
| `/daftar?peran=investor|nelayan` | Pendaftaran akun demo dengan nama, email, kata sandi, dua pilihan peran. |
| `/verifikasi` | Profil dan formulir KYC pengguna yang sudah masuk. |
| `/portal` | Pengalihan ke beranda portal sesuai peran atau ke masuk. |
| `/investor` | Ringkasan saldo, pendanaan dan portofolio serta kartu proyek pilihan. |
| `/investor/pendanaan` | Pencarian nama/lokasi, filter Semua/Budidaya/Tangkap, kartu semua penawaran terbit. |
| `/investor/pendanaan/[slug]` | Foto ilustrasi, informasi usaha, koperasi, nelayan, periode, skenario hasil, skor, prospektus, risiko, progres, formulir beli dan top-up. |
| `/investor/portofolio` | Pesanan, status, nilai posisi, hasil dan riwayat yang relevan. |
| `/investor/keamanan` | Status Self-Lock, alert dan aktivitas. |
| `/investor/profil` | Identitas, KYC, unggah dokumen dan status verifikasi. |
| `/nelayan` | Ringkasan proyek, status, kebutuhan tindakan dan pendampingan. |
| `/nelayan/proyek` | Daftar proyek milik sendiri. |
| `/nelayan/proyek/baru` | Form pengajuan bertahap. |
| `/nelayan/proyek/[id]` | Detail, sunting draf/revisi, unggah rencana, kirim proyek, skor, akad, laporan dan berkas. |
| `/nelayan/dompetku` | Saldo simulasi, mutasi, akad dan tahap pencairan. |
| `/nelayan/profil` | KYC dan profil nelayan. |
| `/admin` | Ringkasan tugas, angka utama, tautan cepat. |
| `/admin/verifikasi` | Antrean KYC dan keputusan dengan alasan. |
| `/admin/pengajuan` | Tinjauan proyek, penawaran, status pendanaan, pelepasan escrow, akad dan tahap. |
| `/admin/laporan` | Tinjauan laporan, bukti, revisi, validasi, distribusi. |
| `/admin/ledger` | Jurnal seluruh akun dan audit keputusan. |
| `/admin/radar` | Alert keamanan demo, penugasan dan penyelesaian. |
| `/admin/pengaturan` | Penugasan admin pendamping dan catatan untuk nelayan. |

Navigasi portal memakai sidebar desktop, menu overlay dan navigasi bawah seluler. Header menunjukkan ruang kerja, lokasi halaman, badge Mode Demo, tombol pemberitahuan, avatar dan keluar. Ada tautan lewati ke konten, halaman loading, error dan 404.

## 4. Kebutuhan fungsional rinci

### FR-01 Akun dan sesi

- Daftar hanya untuk INVESTOR dan NELAYAN; admin disediakan lewat seed demo.
- Nama 3–100 karakter, email valid dan unik, kata sandi daftar 10–128 karakter. Email dinormalisasi menjadi huruf kecil; kata sandi di-hash bcrypt biaya 12.
- Pendaftaran membuat pengguna, kasus KYC DRAF dan dompet pengguna dalam satu transaksi. Dalam `DEMO_MODE=true`, nelayan baru diberi keanggotaan koperasi aktif pertama jika tersedia.
- Masuk menggunakan kredensial; UI menyediakan pilihan peran yang mengisi akun seed. Validasi masuk menerima kata sandi 8–128 karakter. Sesi berbasis JWT dengan catatan sesi basis data dan masa berlaku delapan jam. Keluar menghapus catatan sesi.
- Pembatasan masuk: lebih dari 20 percobaan untuk email dalam jendela 15 menit ditolak. Admin terkunci tidak dapat masuk.
- Pesan error disajikan tanpa mengungkap apakah email terdaftar.

### FR-02 Profil, KYC, dan dokumen

- Pengguna mengunggah identitas fiktif sebelum mengirim KYC. Format: PDF, PNG, JPEG; ukuran 1 byte sampai 2 MB; tipe MIME harus cocok dengan magic bytes. Nama berkas disanitasi dan dipotong 120 karakter. Dokumen tersimpan privat di basis data.
- Form KYC mengumpulkan nama 3–100, lokasi 3–150, KUSUKA opsional maksimal 50 karakter, kode MFA demo `123456`, serta persetujuan liveness demo. Untuk nelayan, KUSUKA harus diawali `DEMO-`.
- Pengiriman mengubah status ke DIAJUKAN, `liveness=LULUS_DEMO`, `mfa=true`; pengguna yang sudah terverifikasi tidak dapat mengulang.
- Admin memutuskan setuju atau perlu perbaikan dan wajib memberi alasan 5–500 karakter. Persetujuan memerlukan dokumen, MFA, dan liveness demo. Status pengguna `verified` ikut berubah.
- Unduhan `/api/documents/[id]` hanya pemilik atau admin, memakai `private, no-store`, `nosniff`, dan attachment.

### FR-03 Pengajuan nelayan

- Form langkah 1: judul, kategori BUDIDAYA/TANGKAP, lokasi, koperasi aktif tempat nelayan menjadi anggota, kebutuhan modal Rp50.000–Rp1 miliar dan kelipatan Rp50.000.
- Langkah 2: rencana 20–4.000 karakter; sinyal T/P/K/L/R masing-masing angka 0–100 atau kosong. Nilai kosong berbeda dari 0. Form dapat menyimpan draf dan melanjutkan ke detail proyek.
- Draf baru dan proyek berstatus DRAF, PERLU_REVISI, atau PERLU_PEMBINAAN dapat diubah pemiliknya. Proyek dalam tinjauan tidak dapat diubah.
- Sebelum diajukan, nelayan harus terverifikasi, masih menjadi anggota koperasi aktif, dan memiliki minimal satu dokumen rencana proyek. Dokumen proyek hanya dapat ditambah dalam status yang bisa diedit.
- Pengajuan menghitung serta menyimpan satu ScoreRun baru, mengubah status ke DIAJUKAN dan menghapus alasan lama. Admin dapat menyetujui, meminta revisi, atau menandai perlu pembinaan dengan alasan. Persetujuan mensyaratkan skor final >=50.

### FR-04 Skor kelayakan transparan

`S = (25T + 30P + 15K + 15L + 15R) / jumlah bobot sinyal tersedia`.

| Sinyal | Makna | Bobot |
|---|---|---:|
| T | Transaksi Dompetku | 25% |
| P | Produksi | 30% |
| K | Koperasi | 15% |
| L | Legalitas | 15% |
| R | Riwayat akad | 15% |

- Jika semua sinyal ada: >=70 Tinggi; >=50 dan <70 Sedang; <50 Perlu Pembinaan.
- Jika R saja kosong dan empat sinyal lain lengkap, bobot dinormalisasi terhadap 85, hasil diberi label Nelayan Baru dan kelas skor biasa.
- Jika sinyal lain kosong, hasil diberi label Perlu Verifikasi Tambahan dan `provisional=true`, walau skor numerik awal bisa dihitung. Semua kosong menghasilkan skor null.
- Perbandingan ambang memakai nilai mentah sebelum pembulatan tampilan. Simpan sinyal, bobot efektif, alasan, sumber dan versi `ACS-DEMO-1.0`. Skor adalah aturan deterministik, bukan AI produksi.

### FR-05 Penawaran dan prospektus

- Admin membuat penawaran hanya untuk proyek DISETUJUI. Target harus sama dengan kebutuhan modal proyek dan habis dibagi harga unit. Target dan harga unit minimal Rp50.000; periode 1–90 hari.
- Admin mengisi risiko 20–3.000 karakter dan penggunaan dana 20–3.000. Sistem membuat slug, prospektus versi 1, escrow, akad DRAF dan dua tahap: 60% persiapan/sarana, 40% operasional.
- Publikasi memerlukan status DRAF, proyek DISETUJUI, skor final >=50, nelayan terverifikasi, koperasi dan keanggotaan aktif, prospektus versi aktif, serta tanggal penutupan di masa depan. Penawaran berubah AKTIF dan `publishedAt` terisi.
- Hanya penawaran yang `publishedAt` terisi terlihat oleh investor. Detail tetap menampilkan penawaran yang terbit lalu menjadi SUKSES/GAGAL; formulir beli hanya untuk AKTIF sebelum penutupan.
- Prospektus memuat risiko, penggunaan dana, aturan hasil, ID dan versi. Nilai skenario 12% per tahun adalah ilustrasi seed/default, bukan janji.

### FR-06 Marketplace, pembelian dan top-up

- Cari proyek berdasarkan judul atau lokasi tanpa membedakan huruf besar/kecil; filter SEMUA, BUDIDAYA, TANGKAP; hasil kosong menampilkan panduan mengubah kata kunci/filter. Beranda investor menampilkan maksimal tiga kartu dalam bagian ringkas.
- Kartu proyek menunjukkan kategori, lokasi, progres, target dan status. Detail menampilkan foto ilustratif berdasarkan kategori, koperasi, penerima manfaat, periode, skor dan penjelasannya, prospektus serta risiko.
- Investor harus terverifikasi dan tidak Self-Lock. Pembelian minimum Rp50.000, kelipatan harga unit, tidak melebihi saldo atau sisa target, dalam periode dan status AKTIF, serta menyetujui prospektus versi aktif dan risiko.
- Opsi `simulateFailure` menolak pembelian sebelum saldo dipotong. Saat sukses, Subscription TERKONFIRMASI, versi prospektus dan harga unit tersimpan, dana berpindah ke escrow, `raised` bertambah dan status menjadi SUKSES tepat saat target penuh.
- Top-up demo investor minimum Rp50.000, maksimum Rp1 miliar per aksi, mensyaratkan KYC dan Self-Lock mati. Opsi gagal tidak mengubah saldo. Sumber dana adalah rekening clearing simulasi.
- Perubahan finansial terjadi dalam transaksi serializable. Kunci permintaan 8–100 karakter dan fingerprint payload mencegah efek ganda: kunci yang sama dan data sama mengembalikan hasil lama; kunci sama dan data berbeda menghasilkan konflik. Jurnal dan beberapa objek punya kunci unik tambahan.

### FR-07 Portofolio, ledger dan keamanan investor

- Portofolio mengambil pesanan milik investor, status pengembalian, detail proyek, dan distribusi hasil. Jurnal pengguna mengambil maksimal 100 transaksi terbaru yang menyentuh dompetnya.
- Self-Lock memblokir top-up dan pembelian di server. Mengaktifkan kunci tidak memerlukan kode; membuka kunci memerlukan `123456`. Status dan aksi tercatat di audit.
- Pusat keamanan menampilkan alert milik pengguna dan riwayat audit aktor; tombol pemberitahuan mengarah ke pusat keamanan. Alert radar bersifat demo, bukan deteksi fraud nyata.

### FR-08 Akad, escrow dan pencairan

- Setelah target penuh, admin melepas seluruh target dari escrow penawaran ke rekening koperasi sekali saja. Tidak bisa sebelum SUKSES.
- Akad mudharabah ditandatangani terpisah oleh nelayan pemilik proyek dan admin yang mewakili koperasi. Akad AKTIF setelah kedua sisi menyetujui; penawaran harus sudah diterbitkan.
- Admin menyetujui tahap sesuai urutan. Tahap 2 memerlukan minimal satu laporan VALID, tahap sebelumnya DICAIRKAN, akad AKTIF, penawaran SUKSES, escrow sudah dilepas, dan total tahap tidak melebihi target.
- Pencairan hanya untuk tahap DISETUJUI; dana bergerak dari koperasi ke Dompetku nelayan, `paidAt` terisi dan proyek menjadi BERJALAN. Pengulangan tahap cair menghasilkan pesan tanpa mutasi baru.

### FR-09 Laporan, hasil dan refund

- Nelayan hanya dapat mengirim laporan untuk proyek sendiri yang BERJALAN. Field: periode 3–50 karakter, progres 0–100%, dana terpakai 0–Rp1 miliar dan tidak melebihi total yang sudah dicairkan, hasil usaha -Rp1 miliar sampai Rp1 miliar, catatan 20–4.000 karakter. Satu laporan per proyek/periode; hanya status PERLU_REVISI bisa dikirim ulang.
- Bukti dokumen laporan PDF/PNG/JPEG maksimal 2 MB ditambahkan setelah laporan ada. Admin tidak dapat memvalidasi tanpa minimal satu bukti.
- Admin memilih VALID atau PERLU_REVISI dengan alasan. Jika hasil negatif dan admin menyetujui, status TINJAUAN_MANUAL; tidak ada distribusi otomatis. Hasil nol valid dan mencatat distribusi nol.
- Distribusi hanya setelah laporan VALID, hasil >=0, akad AKTIF dan penawaran SUKSES. Nisbah demo koperasi:nelayan 60:40. Dari bagian koperasi, 80% dialokasikan kepada investor sesuai proporsi nominal pesanan; sisa rupiah menurut urutan ID pesanan. Sisanya tetap pada koperasi. Pokok investasi tidak dikembalikan melalui fungsi distribusi laba.
- Admin dapat mengakhiri penawaran AKTIF yang belum penuh dalam `DEMO_MODE=true`. Status menjadi GAGAL dan setiap Subscription TERKONFIRMASI mendapat refund dari escrow ke investor, lalu status DIKEMBALIKAN. Pemanggilan ulang tidak membuat refund kedua.

### FR-10 Admin, radar, audit, pendampingan

- Admin melihat antrean KYC, proyek, laporan, semua jurnal dan audit. Audit mencatat aktor, aksi, entitas, ID, alasan/detail, dan waktu. Jurnal mencatat event key unik, tipe, referensi, baris debit/kredit seimbang, dan hash SHA-256 dari data jurnal. Ini ledger basis data, bukan blockchain/on-chain.
- Alert keamanan punya jenis, tingkat keparahan, status TERBUKA/DITANGANI/SELESAI, penanggung jawab dan catatan. Admin dapat mengambil alih atau menyelesaikan dengan alasan 5–500 karakter.
- Admin menugaskan admin pendamping kepada nelayan. Penugasan aktif dapat diaktifkan kembali. Hanya admin yang ditugaskan boleh menulis catatan 10–2.000 karakter; nelayan terkait dapat membacanya.

### FR-11 Konten publik dan dukungan

- Edukasi menjelaskan penerbit, pembagian hasil, target gagal, risiko, skor dan batas teknologi demo. Interaksi FAQ memakai elemen `details` agar bisa dibuka/tutup.
- Bila `NEXT_PUBLIC_HELP_WHATSAPP` berisi nomor, tampilkan tautan `wa.me` yang nomornya dibersihkan dari karakter non-angka; bila kosong tampilkan keterangan kanal belum dikonfigurasi.
- Kredit foto mencantumkan sumber/lisensi. Foto proyek bersifat ilustrasi, bukan foto proyek yang diverifikasi.

## 5. Model data dan relasi inti

| Entitas | Isi penting | Relasi dan kendala |
|---|---|---|
| User/AuthSession/KycCase | Peran, identitas, status verifikasi, kunci, masa sesi. | Email unik, satu KYC per user. |
| Cooperative/Membership | Koperasi penerbit dan keanggotaan nelayan. | Pasangan user–koperasi unik; keanggotaan harus aktif saat pengajuan/publikasi. |
| Project/ScoreRun/Document | Usaha, kebutuhan modal, sinyal, hasil skor, bukti. | Proyek milik nelayan; banyak perhitungan skor dan dokumen. |
| Offering/Prospectus/Subscription | Penawaran, versi informasi risiko, pesanan investor. | Satu penawaran per proyek, slug unik, pesanan merekam prospektus yang disetujui. |
| Account/Journal/JournalLine | Saldo demo dan mutasi berimbang. | Rekening user/koperasi/escrow, event key unik, saldo non-clearing tidak negatif. |
| Agreement/Stage/Report/Distribution | Akad, pencairan, progres, hasil. | Satu akad per penawaran; laporan unik per proyek/periode; distribusi unik per akad/laporan/jenis. |
| SecurityAlert/Assignment/FacilitatorNote/Audit/RequestKey/RateLimit | Risiko, pendampingan, jejak, idempotensi, batas login. | Penugasan admin–nelayan unik; kunci permintaan unik per aktor/aksi/kunci. |

Status yang digunakan: KYC `DRAF → DIAJUKAN → TERVERIFIKASI | PERLU_PERBAIKAN`; proyek `DRAF → DIAJUKAN → DISETUJUI | PERLU_REVISI | PERLU_PEMBINAAN → BERJALAN`; penawaran `DRAF → AKTIF → SUKSES | GAGAL`; tahap `DIRENCANAKAN → DISETUJUI → DICAIRKAN`; laporan `DIAJUKAN → VALID | PERLU_REVISI | TINJAUAN_MANUAL`; pesanan `TERKONFIRMASI → DIKEMBALIKAN`. Status `DITINJAU` diterima oleh aksi review, walau aksi saat ini tidak menetapkannya secara eksplisit. Status proyek `SELESAI` disebut pada spesifikasi lama tetapi belum memiliki aksi transisi pada implementasi.

## 6. API dan kontrak aksi

| Endpoint | Metode | Kegunaan |
|---|---|---|
| `/api/register` | POST JSON | Daftar investor/nelayan, validasi identitas dasar, pembuatan KYC/dompet. |
| `/api/auth/[...nextauth]` | NextAuth | Masuk, sesi, keluar. |
| `/api/actions` | POST JSON `{action,data,key}` | Seluruh mutasi domain; memerlukan Origin host sama, sesi, peran, validasi Zod dan idempotensi. |
| `/api/documents` | POST multipart | Unggah dokumen KYC/PROJECT/REPORT privat; Origin host sama. |
| `/api/documents/[id]` | GET | Unduh dokumen milik sendiri atau sebagai admin. |

Nama aksi: `wallet.topup`, `security.lock`, `kyc.submit`, `kyc.review`, `project.save`, `project.submit`, `project.review`, `offering.propose`, `offering.publish`, `offering.buy`, `offering.expire`, `offering.release`, `agreement.sign`, `stage.approve`, `stage.pay`, `report.submit`, `report.review`, `report.distribute`, `alert.assign`, `alert.resolve`, `assignment.create`, `assignment.note`.

Respons sukses aksi berisi `{ok:true,message,id?}`. Kesalahan validasi/aturan dikembalikan sebagai `{error}` dengan HTTP 4xx; kesalahan internal 500 menggunakan pesan umum. UI menampilkan keadaan sibuk, pesan sukses/gagal, menjaga kunci permintaan saat retry payload yang sama, lalu refresh data server.

## 7. Antarmuka, aksesibilitas, dan visual

- Bahasa Indonesia; nama merek ARTANAYA dan slogan “Berlayar. Bertumbuh. Bersama.”; tone jelas, hangat, tidak menjanjikan hasil investasi.
- Palet laut: navy gelap, teal, kertas hangat/putih dan amber sebagai aksen. Hero publik memakai foto pesisir ilustratif; cuplikan penawaran berasal dari database demo, bukan angka statis. Portal menggunakan panel datar, badge status tekstual, statistik, progress bar, tabel/daftar, dialog tindakan, dan ikon relevan. Rujuk `DESIGN.md` di akar proyek untuk arah visual rebuild.
- Desain responsif pada 360 px dan 1440 px. Sidebar desktop berubah menjadi menu overlay serta navigasi bawah seluler. Tidak boleh ada gulir horizontal pada alur inti.
- Setiap input punya label, kebutuhan wajib, pesan validasi dekat konteks dan tombol yang menampilkan loading. Badge tidak boleh hanya mengandalkan warna. Gunakan fokus terlihat, nama aksesibel untuk ikon, alt pada foto, `aria-current` navigasi, dan `skip-link` ke `#main`.
- Sediakan keadaan kosong untuk katalog/proyek/riwayat, loading, kesalahan dan konfirmasi tindakan sensitif. Angka rupiah ditampilkan dengan format Indonesia; saldo/nominal disimpan sebagai integer BigInt.

## 8. Keamanan, nonfungsional dan lingkungan

- Semua operasi sensitif harus diperiksa di server: sesi, peran, kepemilikan, status, batas nominal, dan asal permintaan. Jangan mengandalkan tombol tersembunyi sebagai otorisasi.
- Semua perubahan dana atomik dan jurnal berimbang. Serializability, retry konflik dan kunci idempotensi wajib dipertahankan. Uji transaksi berulang serta pembelian serentak yang mengejar sisa target.
- Dokumen harus menggunakan data fiktif, akses privat, pemeriksaan ukuran dan signature file. Jangan tampilkan detail identitas nyata di log atau hash ledger.
- Stack saat ini: Next.js 16, React 19, TypeScript, Tailwind CSS 4/CSS, NextAuth 5 beta, Prisma 6, Zod 4, Vitest. Node minimal 20.19. Demo lokal memakai SQLite `.local-demo/artanaya.db`; deployment Vercel menurut README memakai PostgreSQL hosted dan URL koneksi langsung untuk migrasi. Baca panduan Next.js di `node_modules/next/dist/docs/` sebelum menulis kode karena versi ini memiliki perubahan API.
- Variabel lingkungan: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `DEMO_MODE`, `DEMO_PASSWORD`, `NEXT_PUBLIC_HELP_WHATSAPP`; deployment dapat memerlukan `DATABASE_URL_UNPOOLED` sesuai provider.
- Perintah pemeriksaan: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:integration`, `npm run build`. Pengujian integrasi memakai database terpisah.

## 9. Skenario penerimaan minimum

1. Pengunjung membuka beranda, edukasi, kredit foto; tautan masuk/daftar benar dan halaman portal tanpa sesi mengarah ke masuk.
2. Investor dan nelayan dapat mendaftar, masuk, mengunggah dokumen fiktif valid, mengirim KYC; admin meminta perbaikan/menyetujui dengan alasan; akses lintas peran ditolak.
3. Nelayan membuat draf bertahap; file yang salah format/lebih 2 MB ditolak; pengajuan tanpa KYC/dokumen/keanggotaan aktif ditolak.
4. Skor R kosong dengan T/P/K/L lengkap memberi label Nelayan Baru; sinyal lain kosong memberi Perlu Verifikasi Tambahan; semua kosong memberi skor kosong; 0 dihitung sebagai nilai valid.
5. Admin menyetujui hanya skor final >=50, membuat penawaran dengan target tepat, menerbitkan sesudah seluruh prasyarat; investor melihatnya di katalog dan dapat mencari/filter.
6. Investor terverifikasi melakukan top-up dan beli setelah persetujuan prospektus; saldo dan progres berubah tepat sekali. Self-Lock, nominal tidak valid, saldo kurang, target lewat, waktu tutup, prospektus usang dan kegagalan simulasi menolak tanpa mutasi.
7. Target penuh menghasilkan SUKSES; admin melepas escrow sekali, kedua pihak menandatangani akad, tahap 1 disetujui/dicairkan; tahap 2 menunggu laporan VALID.
8. Nelayan mengirim laporan dan bukti; admin meminta revisi atau validasi. Laba positif didistribusikan sesuai 60:40 dan 80% porsi koperasi pro-rata; laba nol menghasilkan nol; rugi menjadi tinjauan manual.
9. Penawaran AKTIF yang belum penuh diakhiri admin demo; setiap pesanan direfund sekali. Audit dan jurnal tetap dapat ditelusuri.
10. Pemilik dokumen dan admin bisa mengunduh; pengguna lain menerima 403. Pendamping hanya bisa menulis untuk penugasan aktifnya.

## 10. Batasan implementasi dan backlog terpisah

- Forum Bahari, posting/komentar, konsultasi AI terbuka, pembayaran nyata, biometrik nyata, fraud detection nyata, efek/sekuritas riil, blockchain, dan integrasi regulator belum tersedia.
- Skor memakai sinyal ternormalisasi yang diisi pada form, bukan pengambilan otomatis data transaksi/produksi. `DEMO_MODE` mengizinkan admin menutup penawaran lebih awal sebagai simulasi waktu; tidak ada scheduler kedaluwarsa otomatis yang teridentifikasi.
- UI menyebut “lima peran” pada satu FAQ, tetapi akun aplikasi hanya memiliki tiga jenis peran; lima adalah jumlah akun seed. Salinan konten ini sebaiknya diperbaiki pada iterasi berikutnya.
- Prospektus saat ini dibuat versi 1 lewat aksi admin; belum ada editor/aksi revisi versi. Proyek belum memiliki aksi akhir status SELESAI. Laporan kerugian berhenti di tinjauan manual.
- Sebelum layanan produksi, diperlukan kajian legal/perizinan, akad dan efek, mitra pembayaran, privasi data, tata kelola risiko, operasional refund, serta audit keamanan. Semua klaim demo harus tetap jelas bagi pengguna.

## 11. Kebutuhan khusus rebuild dengan database Vercel lama

- **DB-01:** Rilis kode baru di Vercel Project yang sekarang, memakai environment Production yang sudah ada. `DATABASE_URL` tetap menunjuk database/branch PostgreSQL lama dan URL langsung migrasi (`DATABASE_URL_UNPOOLED` atau `DIRECT_URL`) tetap tersedia. Jika membuat Vercel Project baru, integrasi/environment harus dipindahkan secara aman; kode sama saja tidak otomatis membawa koneksi.
- **DB-02:** Pertahankan `AUTH_SECRET`, nama environment, model dan riwayat `prisma/migrations/`. Jangan hardcode secret atau URL, jangan memakai SQLite lokal di Vercel, dan jangan menjalankan reset atau `db push` pada Production.
- **DB-03:** Build hasil rebuild hanya membuat Prisma Client dan aplikasi. Migrasi PostgreSQL dijalankan eksplisit lewat `npm run db:deploy`/`db:migrate`; seed hanya untuk SQLite lokal atau bootstrap demo baru yang diberi `DEMO_BOOTSTRAP=true`. Seed tetap dapat meng-update password akun demo bila dijalankan, sehingga jangan menjalankannya pada database lama.
- **DB-04:** Sebelum migrasi, ambil snapshot/backup provider dan uji migrasi pada staging/salinan data; perubahan skema harus maju dan kompatibel. Setelah deploy, bandingkan data historis, saldo, jurnal, audit, pesanan serta akses dokumen.
- **DB-05:** Preview dan tes tidak boleh menulis ke database Production. Bila koneksi atau migrasi gagal, hentikan rollout dan perbaiki penyebabnya tanpa mengganti URL ke database kosong.
