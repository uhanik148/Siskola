# Panduan Deploy Final ke Vercel 🚀

Aplikasi Sistem Didik TK Anda sudah siap untuk online! Ikuti langkah-langkah ini untuk deploy ke Vercel.

## 1. Persiapan GitHub (PENTING)
Pastikan kode Anda sudah di-upload (push) ke GitHub.
Jika belum:
1. Buat repository baru di GitHub (Private/Public).
2. Push semua kode dari folder ini ke repository tersebut.

## 2. Setting Vercel
1. Login ke [vercel.com](https://vercel.com).
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository GitHub Anda (`sistem-didik`).
4. Pada halaman konfigurasi deploy:
   - **Framework Preset**: Next.js (Otomatis terdeteksi).
   - **Root Directory**: `.` (Biarkan default).

## 3. Masukkan Environment Variables (WAJIB)
Di bagian **"Environment Variables"**, masukkan data yang SAMA PERSIS dengan file `.env` di laptop Anda:

| Key | Value (Copy dari .env laptop) |
| --- | --- |
| `DATABASE_URL` | `postgresql://neondb_owner:.....` (URL Database Neon Anda) |
| `AUTH_SECRET` | `....` (Kode rahasia acak Anda) |
| `APP_URL` | Kosongkan dulu atau isi url sementara (nanti diisi domain vercel) |

**Catatan:** `DB_SOURCE` tidak perlu dimasukkan, otomatis pakai database cloud.

## 4. Klik Deploy
Klik tombol **Deploy**. Tunggu sekitar 1-2 menit.
Vercel akan:
1. Install dependencies.
2. Generate Prisma Client (`postinstall`).
3. Build aplikasi (`npm run build`).

Jika sukses, Anda akan melihat kembang api! 🎉

---

## ⚠️ PENTING: Fitur Upload Gambar & Dokumen
Server Vercel bersifat "Read-Only". Artinya:
*   Fitur **Upload Foto Siswa** dan **Scan Dokumen** akan berjalan normal TAPI filenya **akan hilang** sesaat setelah diupload (karena disimpan di storage sementara/temporary).
*   Untuk project skala TK kecil, ini mungkin oke untuk demo.
*   Untuk jangka panjang, Anda disarankan menghubungkan **Vercel Blob** (Storage).

### Cara Menghubungkan Storage (Opsional - Tahap Lanjut)
1. Di Dashboard Project Vercel Anda, klik menu **Storage**.
2. Klik **Connect Database** -> Pilih **Vercel Blob**.
3. Ikuti langkahnya (Create Blob).
4. Vercel otomatis menambahkan `BLOB_READ_WRITE_TOKEN`.
5. Kode aplikasi perlu sedikit disesuaikan untuk memakai Blob (Saya bisa bantu ini nanti jika Anda sudah siap).

---

## Troubleshooting
Jika deploy gagal dengan error database:
- Pastikan `DATABASE_URL` di Vercel sudah benar.
- Pastikan Database Neon Anda "Active" (bukan suspended).

Selamat mencoba!
