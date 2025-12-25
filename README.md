# Reservasi

Sistem Reservasi Ruangan Rumah Sakit (RSUD) yang dibangun dengan Node.js, Express, dan Sequelize. Proyek ini memfasilitasi peminjaman ruangan pertemuan, pengecekan ketersediaan jadwal, serta integrasi notifikasi melalui WhatsApp.

## Fitur Utama

- **Peminjaman Ruangan**: Form reservasi untuk input detail pertemuan, waktu, dan penanggung jawab.
- **Cek Ketersediaan**: Validasi otomatis untuk mencegah bentrok jadwal (overlap) pada ruangan yang sama.
- **Notifikasi WhatsApp**: Pengiriman pesan otomatis ke pihak peminjam dan admin setelah reservasi berhasil.
- **Pembatalan Reservasi**: Fitur pembatalan melalui link unik yang dikirimkan via WhatsApp.
- **Monitoring Jadwal**: Halaman daftar reservasi yang akan datang.

## Teknologi Yang Digunakan

- **Backend**: Node.js, Express.js
- **Database**: MySQL/MariaDB
- **ORM**: Sequelize
- **Logging**: Morgan
- **Notifikasi**: Integrasi API WhatsApp Gateway (Axios)
- **Frontend**: HTML, Vanilla JavaScript, CSS (Shared Assets)

## Prasyarat

- Node.js (v14 atau lebih baru)
- MySQL atau MariaDB
- Akun WhatsApp Gateway (untuk fitur notifikasi)

## Instalasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/fakhryhizballah/Reservasi.git
   cd Reservasi
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Database**:
   - Sesuaikan file `config/config.js` dengan kredensial database Anda.
   - Buat database sesuai dengan nama yang ada di konfigurasi.

4. **Jalankan Migrasi**:
   ```bash
   npx sequelize-cli db:migrate
   ```

## Konfigurasi Environment

Buat file `.env` di root direktori dan tambahkan variabel berikut:

```env
PORT=3110
HOSTWA=https://api-wa-anda.com/send
SECRET_WA=token-secret-anda
WA_ADMIN=628xxxxxxxxx
```

## Menjalankan Aplikasi

```bash
# Untuk pengembangan
node index.js
```

Aplikasi akan berjalan di `http://localhost:3110/reservasi/ruangan`.

## Struktur Proyek

- `controllers/`: Logika bisnis aplikasi (webviews.js).
- `models/`: Definisi skema database menggunakan Sequelize.
- `routes/`: Definisi endpoint API dan routing halaman.
- `views/`: Halaman HTML (frontend).
- `public/`: File statis (CSS, JS, Gambar).
- `migrations/`: Skrip migrasi database.
- `config/`: Konfigurasi database.

## Kontribusi

Kontribusi selalu diterima. Silahkan kirimkan Pull Request atau buka Issue untuk saran dan masukan.

## Lisensi

Proyek ini menggunakan lisensi [ISC](LICENSE).
