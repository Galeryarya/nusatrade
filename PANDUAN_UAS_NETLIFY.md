# NusaTrade UAS — demo marketplace B2B

## Deploy gratis Netlify + Firebase
1. Siapkan Firebase Authentication (Email/Password) dan Cloud Firestore pada proyek Firebase.
2. Di Firebase Console > Firestore > Rules, tempel isi `firestore.rules`, lalu Publish. **Lakukan setiap kali rules berubah.**
3. Di Netlify impor repository Git proyek ini dan pilih Base directory folder `nusatrade` (bila repo memuat folder tersebut). Build `npm run build`, publish `out`. Konfigurasi `netlify.toml` sudah tersedia.
4. Tambahkan environment variables `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`. Lihat `.env.local.example`.
5. Masukkan domain `nama-site.netlify.app` ke Firebase Authentication > Settings > Authorized domains.
6. Untuk membuat akun admin demo: daftar sebagai buyer, lalu ubah `role` menjadi `admin` secara manual lewat Firebase Console > Firestore > users > UID akun tersebut. Pengguna tidak boleh menaikkan role sendiri lewat aplikasi.
7. Buka situs tanpa login -> lihat produk -> daftar Buyer dan Supplier terpisah -> Supplier tambah produk -> Buyer keranjang, chat, RFQ -> Supplier balas RFQ -> Buyer buat pesanan -> Admin atur status dan catatan tracking -> Buyer melihat progres.

## Batasan prototipe
- **Tidak ada pembayaran asli, pengiriman asli, atau escrow.** Status tracking dan catatan pengiriman adalah simulasi yang dimasukkan admin.
- Fallback katalog demo masih tersedia ketika katalog Firebase kosong atau offline. Produk demo tidak terhubung ke supplier sungguhan, sehingga chat/RFQ terhadap demo diblokir dengan pesan panduan; untuk ujian gunakan produk yang dibuat akun supplier.
- Firestore memiliki kuota gratis; hindari unggah gambar terlalu besar dan data uji berlebihan.
- Akun buyer, supplier, admin harus diuji terpisah.

## Status pengecekan
Kode telah disusun dan diperiksa secara statis; build akhir belum berhasil dijalankan dalam lingkungan pengerjaan karena pengunduhan dependensi npm terhenti. Jalankan `npm ci` kemudian `npm run build` di Mac atau CI Netlify untuk verifikasi aktual.
