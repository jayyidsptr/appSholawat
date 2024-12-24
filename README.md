# Sholawat PWA App 🎵

Aplikasi Progressive Web App (PWA) untuk membaca dan mencari lirik sholawat dengan tampilan modern dan responsif. Aplikasi ini bisa diinstal di perangkat mobile dan desktop, serta bisa digunakan secara offline.

## ✨ Fitur

- 📱 Progressive Web App (PWA)
- 🔍 Pencarian real-time
- 📂 Filter berdasarkan kategori
- 🌙 Lirik dalam bahasa Arab, Latin, dan Terjemahan
- 📲 Dapat diinstal di perangkat mobile dan desktop
- 💫 Tampilan responsif dan modern
- 🎥 Integrasi dengan YouTube dan audio (jika tersedia)
- 🔄 Offline support

## 🛠️ Teknologi yang Digunakan

- HTML5
- JavaScript (ES6+)
- Tailwind CSS
- Service Worker untuk PWA
- Font Arabic (Noto Naskh Arabic)

## 📋 Persyaratan

- Web Server (Apache, Nginx, atau Live Server)
- Browser modern yang mendukung PWA
- Koneksi ke backend API

## 🚀 Cara Instalasi

1. Clone repository
```bash
git clone https://github.com/jayyidsptr/appSholawat.git
cd appSholawat
```

2. Sesuaikan API URL
```javascript
// Di file app.js
const API_BASE_URL = 'https://your-api-url.com/api';
```

3. Jalankan dengan web server
```bash
# Jika menggunakan VSCode Live Server
# Klik kanan pada index.html -> Open with Live Server

# Atau gunakan server static lainnya
npx serve .
```

## 💻 Cara Penggunaan

1. **Instalasi PWA**
   - Buka aplikasi di browser
   - Klik tombol "Install App" di pojok kanan atas
   - Atau gunakan opsi "Add to Home Screen" di browser

2. **Pencarian Sholawat**
   - Gunakan kolom pencarian untuk mencari berdasarkan judul atau lirik
   - Filter berdasarkan kategori menggunakan dropdown
   - Hasil pencarian akan muncul secara real-time

3. **Melihat Detail Sholawat**
   - Klik tombol "Lihat Detail" pada kartu sholawat
   - Lihat lirik lengkap dalam tiga bahasa
   - Akses link YouTube atau audio jika tersedia

4. **Fitur Offline**
   - Aplikasi dapat digunakan tanpa internet setelah pertama kali dimuat
   - Data yang sudah pernah diakses tersimpan di cache

## 📱 Screenshot

![Screenshot 1](screenshots/home.png)
*Halaman Utama*

![Screenshot 2](screenshots/detail.png)
*Detail Sholawat*

## 🔧 Konfigurasi

### Mengubah Tema
Untuk mengubah warna tema, edit kelas Tailwind di `index.html`:
```html
<!-- Dari -->
<header class="bg-emerald-600">

<!-- Menjadi -->
<header class="bg-[warna-pilihan-anda]">
```

### Mengubah Font
Untuk mengubah font Arab, edit di bagian `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourChosenFont&display=swap" rel="stylesheet">
```

## 🤝 Kontribusi

Kontribusi selalu diterima! 

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Todo

- [ ] Tambahkan fitur favorit
- [ ] Implementasi tema gelap
- [ ] Tambahkan fitur share
- [ ] Tambahkan audio player terintegrasi
- [ ] Implementasi fitur bookmark

## 📜 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

Your Name - [@jayyidsptr](https://twitter.com/jayyidsptr)

Project Link: [https://github.com/jayyidsptr/appSholawat](https://github.com/jayyidsptr/appSholawat)

---
⭐️ Dibuat dengan ❤️ untuk komunitas Muslim Developer