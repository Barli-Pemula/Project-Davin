# Arah visual ARTANAYA

**Design Read:** platform pendanaan demo untuk nelayan, investor dan pengelola di Indonesia; bahasa editorial pesisir yang jernih; **ENERGY 2 / RHYTHM 2 / MOTION 1**.

## Identitas

- **Watak:** teliti, hangat, tenang, berpijak pada kegiatan pesisir. Antarmuka harus terasa seperti ruang kerja yang dapat dipercaya, bukan janji hasil investasi.
- **Suara:** kalimat pendek dan langsung. Sebut pelaku, tindakan, risiko, dan status dengan nama yang jelas. Jangan menyebut saldo fiktif sebagai dana riil.
- **Motif:** garis horizon tipis sebagai pemisah informasi. Ini merujuk lanskap laut sekaligus membantu membaca tahap alur dan rincian transaksi.
- **Palet:** tinta laut `#102E34`, hijau pasang `#176C68`, kertas hangat `#F5F4EF`, putih `#FFFFFF`, dan kuning pasir `#D3A35D` hanya untuk penekanan penting. Kontras teks utama harus memenuhi WCAG AA.
- **Tipografi:** Onest untuk teks dan UI karena bentuknya terbuka pada ukuran kecil; Georgia pada satu kalimat editorial besar untuk memberi karakter tanpa mengganggu keterbacaan form dan angka.
- **Foto:** gunakan foto pesisir berlisensi yang sudah ada di `public/photos`, dengan alt dan kredit di halaman kredit foto. Foto adalah ilustrasi tema, bukan bukti proyek tertentu.

## Komposisi dan alasan

- Beranda memakai foto lebar sebagai bukti konteks pesisir; data produk nyata dari database dipakai untuk cuplikan penawaran, bukan angka pemasaran rekaan.
- Satu tindakan utama per layar: mendaftar sebagai nelayan pada hero, memeriksa penawaran pada bagian proyek, dan masuk pada penutup.
- Tiga peran ditampilkan sebagai baris editorial karena tanggung jawab masing-masing lebih mudah dibandingkan lewat teks daripada tiga kartu seragam.
- Portal mempertahankan navigasi dan fungsi yang ada, dengan latar kertas hangat, panel putih yang rata, batas halus, dan hierarki angka. Bayangan hanya untuk lapisan yang benar-benar mengambang seperti dialog.
- Gerak hanya untuk hover, fokus, dan masuk hero singkat; seluruh gerak non-esensial berhenti saat `prefers-reduced-motion` aktif.

## Batasan

Jangan membuat logo, avatar orang, testimoni, statistik pelanggan, atau fitur baru tanpa sumber. Gunakan logo dan foto yang sudah ada. Semua angka proyek yang ditampilkan ke pengunjung harus berasal dari database demo aktif atau diberi label contoh yang jujur. Pertahankan navigasi tiga peran, fitur server, dan kontrak database dari `PANDUAN MEMBUAT WEB`.
