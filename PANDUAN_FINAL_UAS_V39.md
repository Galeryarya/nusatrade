# NusaTrade UAS v39 – demonstrasi tanpa uang nyata

## Perubahan
- RFQ Supplier: tombol Dibaca/Dibalas, pesan kegagalan terlihat.
- Buyer: buat pesanan dari RFQ Dibalas, pembayaran dipilih (semua simulasi). Transaksi Firestore mencegah pesanan ganda.
- Buyer: tombol Saya sudah bayar mengirim permohonan verifikasi pembayaran simulasi.
- Admin: ubah status pembayaran, tracking beserta riwayat, status dari Menunggu supplier hingga Selesai.
- Buyer/Supplier: melihat tracking dan status pembayaran.
- Keranjang tetap per-akun di Firestore dan mengarah ke formulir RFQ untuk tiap barang; belum checkout multi-item.

## Perlu dilakukan
1. Pertahankan `.env.local` dari versi sebelumnya. Jangan unggah ke repositori publik.
2. Firebase Console -> Firestore -> Rules: salin `firestore.rules` v39, Publish.
3. `npm install && npm run build && npm run dev` lalu tes 3 role di browser terpisah.
4. Supplier buat produk -> Buyer kirim RFQ -> Supplier Dibalas -> Buyer pilih metode bayar dan buat order -> Buyer Saya sudah bayar -> Admin konfirmasi lunas -> Admin atur status/tracking -> Buyer cek order.
5. Deploy Netlify setelah build selesai; masukkan env NEXT_PUBLIC_FIREBASE_* ke pengaturan build Netlify dan tambahkan domain pada Firebase Auth.

## Keterbatasan
- Pembayaran, logistik dan L/C **hanya simulasi**; tidak ada transfer uang, bank, maupun ekspedisi nyata.
- Keranjang adalah daftar minat produk yang diteruskan ke RFQ satu per satu.
- Belum diuji terhadap Firebase nyata. Jangan dianggap platform produksi.
