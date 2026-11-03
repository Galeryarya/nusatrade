# NusaTrade UAS v40 — finalisasi fungsional

## Perubahan
- Checkout multi-produk: satu checkoutGroup dengan satu order per item. Produk dihapus dari keranjang dalam transaksi Firestore.
- Penawaran supplier memerlukan nominal (teks dengan mata uang/satuan) dan syarat; buyer dapat membaca sebelum membuat order.
- Admin v39 tetap menangani status pembayaran simulasi serta tracking. Login dan chat dipertahankan.
- Rules Firestore wajib diganti dengan file versi ini.

## Penting
- Tidak ada pembayaran nyata, pelacakan ekspedisi nyata, atau escrow.
- Konfirmasi UAS: gunakan tiga akun test Buyer/Supplier/Admin. Buat produk supplier, checkout dua produk, cek dua order terkait group yang sama. RFQ baru -> supplier kirim penawaran -> buyer pesan -> bayar simulasi -> admin verifikasi -> update tracking -> buyer lihat status.
- `cp .env.local.example .env.local` bila belum pernah disalin; pastikan semua nilai benar.
- `npm install`, `npm run build`, `npm run dev`. Jika `npm` memperingatkan versi Node, gunakan Node LTS yang didukung oleh dependensi.
- Untuk deploy statis Netlify, gunakan folder `out` hasil build.

## Batasan
- Dashboard Admin mendukung monitoring, pengubahan pembayaran, dan tracking (fitur moderasi akun/produk belum dibuat).
- Checkout multi-produk membuat beberapa pesanan dalam satu grup; belum ada invoice gabungan.
- Proses belum diuji terhadap Firebase pengguna; aturan dan indeks perlu diverifikasi langsung.
