# Sistem Didik (Siskola) 🎓

Sistem Informasi Sekolah Modern berbasis web yang dirancang untuk mengelola Kegiatan, Dokumen Arsip (Guru/Siswa), Manajemen Sekolah, dan Pelaporan. Dibangun dengan teknologi web terbaru untuk performa, keamanan, dan desain antarmuka yang modern.

## 🚀 Teknologi yang Digunakan

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Directory)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Neon/Local)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (Auto Convert to WebP)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prasyarat Sistem

Pastikan komputer Anda sudah terinstal:

- [Node.js](https://nodejs.org/) (Versi 18 LTS atau terbaru)
- [PostgreSQL](https://www.postgresql.org/) (Jika ingin menjalankan database lokal)
- Git

## 🛠️ Instalasi & Menjalankan (Panduan Multi-OS)

### 1. Clone Repository

```bash
git clone <repository_url>
cd sistem-didik
```

### 2. Instalasi Dependencies

**Windows / macOS / Linux:**

```bash
npm install
# atau jika menggunakan yarn
yarn
```

### 3. Konfigurasi Environment Variable

Duplikat file `.env.example` menjadi `.env`.

**Windows (PowerShell):**

```powershell
cp .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan koneksi database Anda:

```env
# Contoh Format URL PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/sistem_didik?schema=public"

# Mode
NODE_ENV="development"
```

### 4. Setup Database

Pastikan PostgreSQL Anda sudah berjalan. Lalu jalankan perintah migrasi Prisma:

**Semua OS:**

```bash
# Sinkronisasi skema ke database
npx prisma db push

# (Opsional) Buka GUI Database
npx prisma studio
```

### 5. Jalankan Server Development

```bash
npm run dev
```

Akses di browser: [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Struktur Database (ERD)

Sistem ini memiliki beberapa modul utama yang saling berelasi:

### 1. Modul Siswa & Guru

- **Siswa**: Data induk siswa, termasuk Data Orang Tua & Wali.
  - _Relasi_: One-to-Many ke `NilaiRapor`, `PresensiSiswa`, `Dokumen`.
- **Guru**: Data induk guru & staf.
  - _Relasi_: One-to-Many ke `PresensiGuru`, `Dokumen`.

### 2. Modul Kegiatan (Agenda)

- **Kegiatan**: Jadwal acara sekolah (Rapat, Upacara, Parenting).
  - _Fitur_: Validasi Waktu (Selesai > Mulai), Status (Terjadwal/Berlangsung/Selesai).
  - _File_: Mendukung upload Foto Banner (disimpan lokal).
- **DokumentasiKegiatan**: Galeri foto/file terkait kegiatan (One-to-Many dari Kegiatan).

### 3. Modul Dokumen (Digitalisasi Arsip)

- **Dokumen**: Repositori file digital (Ijazah, SK, Sertifikat).
  - _Fitur_: Linking dinamis ke `Siswa` ATAU `Guru`.
  - _File_: Mendukung Upload & Ganti File Fisik.
  - _Auto Cleanup_: Jika entitas dokumen dihapus/diedit, file fisik lama di server dihapus otomatis.

### 4. Modul Sarpras

- **Sarpras**: Inventaris barang sekolah.
- **RiwayatPemeliharaan**: Pencatatan servis/maintenance barang.

### 5. Authentication & Logs

- **Admin**: User login dashboard (Role based).
- **ActivityLog**: Mencatat siapa melakukan apa (Audit Trail).

---

## 📦 Deployment (Hosting)

Aplikasi ini siap di-deploy ke **Vercel** atau **VPS**.

### Opsi A: Vercel (Paling Mudah)

1. Push kode ke GitHub.
2. Import project di Dashboard Vercel.
3. Masukkan Environment Variables (`DATABASE_URL`).
4. Deploy.

### Opsi B: VPS (Ubuntu/CentOS)

1. Build aplikasi:
   ```bash
   npm run build
   ```
2. Jalankan server production:
   ```bash
   npm start
   ```
   _(Disarankan menggunakan PM2 atau Docker untuk manajemen proses)._

---

## 🛡️ Best Practices & Fitur Keamanan

1.  **Validasi Input Ketat**:
    - Menggunakan Schema Validation (Zod) di Backend.
    - Validasi Logika Bisnis (misal: Waktu Selesai tidak boleh < Waktu Mulai).
2.  **File Management Optimation**:
    - **Auto-Cleanup**: Menghapus file sampah (orphan files) saat update/delete data.
    - **Image Compression**: Gambar di-convert otomatis ke format **WebP** menggunakan library `sharp` untuk loading cepat & hemat storage.
3.  **UI/UX Premium**:
    - Tampilan responsif (Mobile Friendly Login).
    - Feedback visual real-time (Loading states, Error messages).

---

© 2026 Siskola - All Rights Reserved.

thankyouuuuuuuuuuu 
