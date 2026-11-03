# NusaTrade UAS v37 — perbaikan awal

## Perbaikan
- Login: input email/password kini dikontrol oleh React, sehingga fitur tampilkan password tidak menghilangkan nilai saat login. Pesan error dibuat lebih jelas.
- Validasi pendaftaran: nama, email, password minimal 8 karakter, serta persetujuan syarat.
- Percakapan baru: ID deterministik berdasarkan buyer+supplier+produk, mencegah pembuatan room baru berulang untuk kombinasi sama. Untuk percakapan lama, daftar inbox mengelompokkan duplikat dan menampilkan yang paling baru.
- Tata letak: beberapa perbaikan responsive mobile untuk login dan inbox.

## Penting tentang chat lama
Dokumen percakapan lama di Firestore sengaja tidak dihapus atau digabung secara otomatis demi menjaga pesan. Bila satu pasangan pengguna telah memiliki beberapa room lama, inbox hanya menampilkan salah satu room. Chat yang tersimpan di room lainnya tetap ada di Firebase. Jika diperlukan migrasi riwayat, perlu proses tersendiri.

## Pemasangan di Mac
1. Backup folder nusatrade lama, lalu ekstrak ZIP ini.
2. Jika file .env.local pada proyek lama sudah benar, SALIN secara manual dari backup ke folder proyek baru (file ini sengaja tidak disertakan di ZIP).
3. Jalankan `npm install`, lalu `npm run dev` di dalam folder `nusatrade`.
4. Uji buka mata password lalu login (error `auth/missing-password` seharusnya tidak terjadi lagi ketika password terisi).
5. Masuk sebagai buyer, chat produk supplier yang sama berulang kali, lalu periksa inbox.
6. Pastikan Firestore Rules sesuai file `firestore.rules`, dan Email/Password Authentication aktif.
7. Jalankan `npm run build` dan deploy folder `out` setelah berhasil.

## Batasan verifikasi
Source sudah diperbarui tetapi pengujian npm/build end-to-end belum berhasil diselesaikan di lingkungan pembuatan paket. Seluruh alur tetap perlu dicoba dengan Firebase milik pengguna. Ini belum berarti semua fitur telah lolos pengujian produksi.
