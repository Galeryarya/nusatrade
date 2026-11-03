# NusaTrade UAS v38 — penyempurnaan prototype

## Revisi pada source
- Pesanan dari satu RFQ menggunakan ID konsisten (`rfq_<rfqId>`), jadi klik ulang tidak membuat banyak dokumen.
- Feedback keberhasilan/gagal ketika membuat pesanan; tombol dinonaktifkan saat menyimpan.
- Validasi input RFQ, nama produk, harga, MOQ, ukuran gambar.
- Produk demo tidak lagi muncul sebagai daftar produk asli saat Firestore kosong/bermasalah. Isi data sendiri melalui dashboard Supplier.
- Label "Terverifikasi" statis di tabel Supplier dihapus.
- Konfirmasi sebelum hapus produk.
- Login memeriksa kecocokan akun Buyer/Supplier yang dipilih.
- Responsivitas CSS tambahan untuk dashboard, tabel, formulir, modal, dan layar kecil.
- Rules Firestore baru membatasi ID pesanan per RFQ. **Wajib publish file firestore.rules versi ini.**

## Cara memperbarui di Mac
1. Backup folder `~/Desktop/nusatrade` dan ekstrak ZIP ini menjadi folder `nusatrade` baru.
2. Salin `.env.local` dari folder lama (jangan bagikan API settings akun lain).
3. Buka Firebase Console -> Firestore Database -> Rules, tempel dan Publish `firestore.rules` yang ada dalam ZIP ini.
4. Buka Terminal dalam folder baru: `npm install`, `npm run dev`.
5. Setelah mencoba lokal, jalankan `npm run build`. Untuk Netlify gunakan direktori publish `out` dan environment variables Firebase pada waktu build.

## Skenario pengujian UAS
- Pengunjung: buka beranda/katalog tanpa login. Jika Firestore kosong, harus tampil keadaan kosong, bukan supplier palsu.
- Buyer: daftar, login, lihat produk Supplier, keranjang, wishlist, chat, RFQ, buat pesanan.
- Supplier: daftar/login, buat/edit/hapus produk, lihat RFQ, tanggapi penawaran, balas chat.
- Admin: buka dashboard, cek daftar akun dan order, ubah status tracking, lihat perubahan pada layar Buyer.
- Coba refresh halaman dan buka browser baru untuk mengecek data dari Firestore.

## Batasan penting
Ini prototype UAS. Belum mencakup payment gateway, ekspedisi sungguhan, verifikasi perusahaan, atau pengujian end-to-end melalui Firebase hidup. Riwayat chat duplikat lama tidak dihapus dari database. Aturan keamanan perlu audit lanjutan jika kelak dijadikan produk komersial.

## Catatan instalasi
Build tidak bisa diselesaikan di lingkungan pengerjaan karena `npm ci` terhenti ketika mengambil paket. Jalankan `npm install` dan `npm run build` pada Mac untuk mengonfirmasi kesesuaian dependensi.
