# ARTANAYA · Product Requirements Document

**Versi 1.0 · Spesifikasi MVP demonstrasi · 10 November 2026**

ARTANAYA membantu nelayan pesisir mengajukan modal usaha melalui koperasi dan memberi investor cara untuk menilai penawaran efek syariah, memahami risikonya, serta mengikuti perkembangan usaha. MVP mendemonstrasikan perjalanan lengkap dengan akun, dokumen, identitas, dan dana fiktif.

## 1. Sasaran dan ruang lingkup

| Sasaran produk | Bukti keberhasilan demo |
|---|---|
| Nelayan dapat mengajukan modal meski belum memiliki riwayat kredit formal | Nelayan baru menyimpan draf, melengkapi data, menerima skor awal atau hasil penilaian, lalu memperbaiki pengajuan dari catatan admin. |
| Investor dapat memahami apa yang dibeli dan memantau penggunaannya | Investor membuka prospektus, melakukan pembelian simulasi, dan melihat posisi, perkembangan usaha serta jejak transaksi. |
| Pengelola dapat menelusuri keputusan dan aliran dana | Verifikasi, perubahan status, penerimaan dana, pencairan, pelaporan, serta distribusi atau refund memiliki referensi audit. |

**P0** mencakup tiga portal utama, ruang kerja sederhana untuk koperasi dan fasilitator, verifikasi simulasi, scoring berbobot, penawaran dan transaksi simulasi, Dompetku, pelaporan, radar keamanan dan audit. **P1** mencakup Forum Bahari dengan posting dan komentar, artikel edukasi lengkap, serta konsultasi berbasis FAQ. Di P0, tampilkan halaman edukasi dengan artikel contoh dan bantuan WhatsApp melalui tautan konfigurasi atau tampilan informasi demo.

Layanan pembayaran riil, penawaran efek riil, biometrik produksi, smart contract on-chain, model machine learning produksi, dan konsultasi AI terbuka berada pada fase lanjutan. Peluncuran produksi memerlukan validasi badan penerbit, jenis efek, dokumen dan mekanisme syariah, perizinan, mitra pembayaran, pelindungan data, serta tata kelola dana dan keputusan risiko.

## 2. Pengguna dan batas akses

| Peran | Akses dan tanggung jawab |
|---|---|
| Investor | Mengelola identitas dan saldo demo sendiri, membaca penawaran terbit, menyetujui prospektus, membeli efek simulasi, memantau posisi dan riwayat. |
| Nelayan | Mengelola profil dan data usaha sendiri, memilih koperasi tempat ia terdaftar, mengajukan modal, memperbaiki berkas, mengirim laporan, melihat jadwal dan Dompetku. |
| Operator koperasi | Meninjau proyek anggota, mengusulkan penawaran sebagai penerbit, mengelola dokumen penawaran, serta mengonfirmasi pertanggungjawaban proyek koperasinya. |
| Fasilitator Karang Taruna | Mendampingi nelayan yang ditugaskan, melihat indikator kelengkapan, mencatat tindak lanjut. Akses dibatasi pada data yang dibutuhkan untuk pendampingan. |
| Admin pengelola | Meninjau KYC dan proyek, mengelola antrean, memvalidasi laporan, menerbitkan penawaran, mengotorisasi tindakan dana simulasi dan menindaklanjuti peringatan. |
| Pengunjung | Melihat halaman awal dan edukasi. Marketplace investor dan transaksi memakai sesi yang sesuai. |

Tiga portal utama mengikuti Lampiran 8. Ruang koperasi dan fasilitator adalah tambahan MVP untuk menjalankan peran dalam Lampiran 6, 19, 21, dan 23. Regulator dan pengawas syariah direpresentasikan sebagai pemangku kepentingan, tanpa akun pada demo.

## 3. Kebutuhan fungsional

| ID | Prioritas | Fitur dan kriteria penerimaan |
|---|---|---|
| FR-01 | P0 | **Akun dan KYC.** Investor mengisi biodata dan menjalani alur dokumen serta MFA/liveness simulasi. Nelayan memakai nomor KUSUKA, dokumen pendukung dan bantuan pendaftaran. Admin menandai pengajuan valid atau perlu perbaikan dengan alasan. Akun investor wajib lolos KYC untuk membeli dan akun nelayan wajib lolos KYC untuk mengirim pengajuan. |
| FR-02 | P0 | **Pengajuan nelayan.** Simpan draf dengan judul, kategori budidaya/tangkap, lokasi, koperasi, kebutuhan modal, rencana usaha, dokumen, dan data usaha. Status dan catatan revisi terlihat dari dasbor. Sistem menyimpan riwayat keputusan. |
| FR-03 | P0 | **Skor kelayakan dan tinjauan.** Simpan lima sinyal, bobot efektif, versi aturan, penjelasan dan skor. Admin meninjau skor, lokasi, kelengkapan, dan data usaha. Keputusan admin memiliki alasan. Proyek revisi dapat diajukan ulang dan dihitung kembali. |
| FR-04 | P0 | **Penawaran koperasi.** Operator koperasi menyusun penawaran dengan jenis efek demo, target, periode, harga unit, risiko, rencana penggunaan dana dan prospektus berversi. Admin menerbitkan penawaran setelah verifikasi. Proyek dengan skor sementara atau di bawah 50 belum dapat diterbitkan. |
| FR-05 | P0 | **Marketplace dan detail.** Beranda investor menampilkan portofolio ringkas, pencarian, filter kategori, progres pendanaan dan kartu proyek. Detail memuat koperasi penerbit, skor dan keterangannya, risiko, status ledger, prospektus, dan tombol pembelian untuk penawaran aktif. Tampilkan estimasi imbal hasil sebagai skenario apabila tersedia. |
| FR-06 | P0 | **Pembelian efek simulasi.** Tinjau prospektus versi aktif, risiko, nominal, dan saldo. Izinkan top-up simulasi bila saldo kurang. Simpan versi persetujuan; pembelian berhasil tercermin di portofolio, progres, saldo, dan ledger sekali saja. Batas minimum demo Rp50.000 per pesanan. |
| FR-07 | P0 | **Pencairan dan Dompetku.** Setelah target penuh dan penawaran sukses, catat perpindahan dana simulasi dari escrow ke koperasi. Setelah akad koperasi–nelayan aktif, admin mencairkan sesuai jadwal dan persetujuan tahap. Nelayan melihat saldo, riwayat, jadwal pelaporan/setoran, dan dokumen usaha. |
| FR-08 | P0 | **Laporan, hasil, dan refund.** Nelayan mengirim progres, penggunaan dana, bukti, dan realisasi hasil usaha. Admin memvalidasi laporan. Bagi hasil mudharabah mengikuti nisbah akad atas laba yang divalidasi, sedangkan hak investor mengikuti prospektus efek dan periode terkait. Penawaran kedaluwarsa yang tidak mencapai target mengembalikan dana simulasi tiap pesanan tepat satu kali. |
| FR-09 | P0 | **Portal admin dan radar.** Dasbor memuat tugas, antrean KYC/proyek/laporan, dana kelolaan demo dan log. Sediakan tinjauan berkas, Smart Contract Ledger Demo, Fraud Radar dengan sinyal geofencing dan liveness fiktif, serta pengaturan. Catat pemilik, status dan alasan tindak lanjut alert. |
| FR-10 | P0 | **Keamanan akun.** Pusat keamanan investor menampilkan aktivitas dan Self-Lock. Saat terkunci, pembelian dan top-up diblokir di server. Pembukaan kembali melalui verifikasi ulang simulasi dan dicatat. |
| FR-11 | P0 | **Pendampingan.** Admin menugaskan fasilitator; fasilitator melihat proyek yang ditugaskan, kelengkapan, dan catatan. Nelayan melihat tindak lanjut; pengambilan keputusan tetap ada pada admin. |
| FR-12 | P1 | **Edukasi dan Forum Bahari.** Artikel, panduan akad, forum termoderasi, profil dan Ruang Konsultasi berbasis FAQ contoh. Sediakan status kosong, pelaporan konten dan penyelesaian oleh admin jika forum aktif. |

## 4. Aturan keputusan

### Skor kelayakan usaha

`S = 0,25T + 0,30P + 0,15K + 0,15L + 0,15R`. Setiap sinyal berada pada skala 0–100. T = frekuensi dan nilai transaksi Dompetku (90 hari); P = rata-rata dan stabilitas produksi (6 bulan); K = status dan lama keanggotaan koperasi/KUB; L = kelengkapan KUSUKA dan SKU; R = riwayat penyelesaian akad. Nilai 0 yang valid berbeda dari nilai kosong. Normalisasi data mentah belum dijabarkan dalam lampiran, sehingga demo memakai input ternormalisasi dan berlabel asal data.

| Kondisi | Hasil dan tindakan |
|---|---|
| Lengkap, S ≥ 70 | Skor Tinggi; dapat masuk proses publikasi setelah persetujuan admin dan verifikasi penerbit. |
| Lengkap, 50 ≤ S < 70 | Skor Sedang; aturan publikasi sama, dengan rekomendasi pendampingan. |
| Lengkap, S < 50 | Perlu Pembinaan; rujuk ke fasilitator dan buka jalur pengajuan ulang. |
| Sinyal wajib hilang | Hitung skor awal dari sinyal tersedia dengan membagi jumlah hasil berbobot dengan jumlah bobot yang tersedia; tampilkan Perlu Verifikasi Tambahan. Jika semua sinyal wajib tidak tersedia dan tidak ada sinyal yang dapat dihitung, skor kosong. |
| Pengajuan pertama, hanya R tidak tersedia | Lakukan normalisasi ulang bobot T/P/K/L (dibagi 0,85). Bila empat sinyal ini lengkap, pakai kelas skor biasa dan tampilkan label Nelayan Baru. |

Bandingkan skor sebelum pembulatan tampilan. Lampiran 7 menyebut publikasi otomatis untuk skor tinggi, sementara Lampiran 13–14 menunjukkan tinjauan admin. MVP memilih tinjauan admin sebagai gerbang publikasi. Perlakuan R yang belum tersedia dibedakan dari sinyal wajib yang hilang agar aturan cold-start dapat diuji secara konsisten.

### Status dan dana simulasi

| Objek | Jalur utama dan percabangan |
|---|---|
| Verifikasi | DRAF → DIAJUKAN → TERVERIFIKASI atau PERLU_PERBAIKAN → DIAJUKAN kembali. |
| Proyek | DRAF → DIAJUKAN → DITINJAU → DISETUJUI → BERJALAN → SELESAI. Dari DITINJAU dapat menuju PERLU_REVISI atau PERLU_PEMBINAAN dan diajukan ulang. Proyek mulai berjalan setelah pencairan tahap pertama berhasil. |
| Penawaran | DRAF → AKTIF → SUKSES saat target tercapai. DRAF hanya dapat diterbitkan untuk proyek disetujui. AKTIF → GAGAL ketika masa penawaran habis tanpa mencapai target. SUKSES/GAGAL menutup pembelian. |
| Pesanan | Berhasil dicatat sebagai TERKONFIRMASI setelah dana terkunci di escrow demo. Jika penawaran gagal, refund atomik mengubah status menjadi DIKEMBALIKAN. |
| Akad dan pencairan | Akad DRAF → AKTIF → SELESAI. Tahap pencairan DIRENCANAKAN → DISETUJUI → DICAIRKAN, dengan urutan dan pagu diverifikasi. Laporan DRAF → DIAJUKAN → VALID atau PERLU_REVISI. |

- Jalur pembelian ialah investor → escrow simulasi → koperasi setelah penawaran sukses. Jalur akad ialah koperasi → nelayan secara bertahap. Persetujuan investor atas prospektus dan akad koperasi–nelayan disimpan terpisah.
- Gunakan rupiah bulat dan nominal kelipatan harga unit demo. Tolak nominal di bawah Rp50.000, melebihi saldo atau sisa target, dan percobaan saat penawaran tutup. Siapkan seed dengan target dan harga unit yang memungkinkan penawaran mencapai target tepat.
- Perubahan saldo, pencatatan pesanan, progres dan jurnal berlangsung atomik. Gunakan kunci idempotensi dan batasan basis data untuk mencegah pembayaran ganda dan kelebihan target ketika ada permintaan bersamaan.
- Contoh demonstrasi laba Rp1.000.000 dan nisbah koperasi:nelayan 60:40 menghasilkan porsi koperasi Rp600.000 dan nelayan Rp400.000. Hak investor dihitung di tahap terpisah dengan aturan efek demo yang terdokumentasi. Laba nol menghasilkan bagi hasil nol; kerugian masuk tinjauan manual sesuai dokumen yang berlaku. Persentase nisbah contoh merupakan data seed.

## 5. Antarmuka dan kebutuhan nonfungsional

- **Identitas visual.** Splash bernuansa laut, navy gelap untuk header dan portal admin, teal untuk navigasi/aksi utama, amber untuk sorotan, putih dan abu muda untuk kartu serta konten. Gunakan badge status berteks, bar progres, dan ikon yang disertai label.
- **Mobile-first.** Navigasi bawah mengikuti mockup mobile, lalu berubah menjadi sidebar pada desktop. Formulir nelayan dibuat bertahap dengan simpan draf, label sederhana, ringkasan dokumen, dan pesan error dekat input. Uji lebar 360 px dan 1440 px tanpa gulir horizontal pada layar utama.
- **Aksesibilitas dan koneksi.** Pastikan alur inti dapat dioperasikan dengan keyboard, fokus terlihat, warna memiliki kontras, target sentuh memadai, dan gambar dimuat secara bertahap. Sediakan loading, kosong, gagal, percobaan ulang, dan konfirmasi tindakan sensitif.
- **Privasi dan jejak audit.** Terapkan otorisasi per peran dan kepemilikan di server, masking pada identitas, akses dokumen privat, serta audit yang hanya dapat ditambahkan dari layanan berwenang. Gunakan data dummy dan simpan hanya hasil verifikasi demo. Hash ledger memakai referensi internal non-sensitif.
- **Ukuran keberhasilan pilot yang diusulkan.** Lacak konversi draf → diajukan, waktu median pengajuan → keputusan, persentase laporan tepat waktu, dan persentase transaksi tercatat lengkap. Tetapkan target pilot setelah ada data awal.

## 6. Skenario penerimaan MVP

1. Nelayan baru yang memiliki empat sinyal wajib dapat memperoleh kelas skor biasa tanpa riwayat akad. Sinyal wajib yang hilang memicu skor awal, dan kasus tanpa sinyal menghasilkan skor kosong.
2. Admin meminta revisi, nelayan mengirim ulang, admin menyetujui, koperasi mengusulkan penawaran, dan admin menerbitkannya. Kartu baru terlihat di marketplace setelah publikasi.
3. Investor terverifikasi membeli Rp50.000 setelah membaca prospektus dan top-up demo. Klik ganda memakai kunci yang sama menghasilkan satu pesanan dan satu mutasi. Dua pesanan bersamaan tidak menyebabkan sisa target negatif.
4. Penawaran sukses mengalirkan dana ke koperasi. Tahap pertama cair setelah akad aktif dan tahap disetujui. Tahap yang belum disetujui atau melampaui pagu gagal dengan pesan jelas.
5. Penawaran gagal mengembalikan dana sekali per pesanan. Setelah laporan valid, jalankan simulasi distribusi dan tampilkan riwayat yang sesuai pada portal pihak terkait.
6. Investor yang mengunci akun tidak bisa top-up atau membeli. Investor lain, nelayan lain, operator koperasi berbeda dan fasilitator yang tidak ditugaskan gagal mengakses data privat di luar lingkupnya.

## 7. Pemetaan sumber

Nomor di bawah mengikuti halaman PDF, dihitung dari sampul.

| Sumber dalam esai ARTANAYA | Turunan ke produk |
|---|---|
| Lampiran 6 (hlm. 21–23) dan 19 (hlm. 49) | Persona dan pendampingan Karang Taruna. |
| Lampiran 7 (hlm. 24–25) | Sinyal, bobot, ambang, dan cold-start. |
| Lampiran 8 (hlm. 26–34) | Nama fitur, mockup mobile, portal dan nominal minimum. |
| Lampiran 12–14 (hlm. 41–43) | Percabangan onboarding, revisi, pembelian, dan validasi. |
| Lampiran 21–23 (hlm. 54–57) | Penerbit, efek, akad, pengawasan dan pembagian peran. |

Pendekatan teknis dan perilaku refund adalah keputusan spesifikasi MVP. Detail operasional produksi seperti struktur instrumen, kebijakan refund, dan pembagian hasil harus ditetapkan melalui dokumen dan validasi pihak berwenang sebelum diterapkan untuk transaksi riil.
