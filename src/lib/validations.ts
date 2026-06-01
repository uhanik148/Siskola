import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Siswa Schema
export const siswaSchema = z.object({
  nis: z.string().min(1, 'NIS wajib diisi'),
  nisn: z.string().optional(),
  nama: z.string().min(1, 'Nama wajib diisi'),
  jenisKelamin: z.enum(['L', 'P']),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  agama: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  namaAyah: z.string().optional(),
  pekerjaanAyah: z.string().optional(),
  namaIbu: z.string().optional(),
  pekerjaanIbu: z.string().optional(),
  teleponOrtu: z.string().optional(),
  alamatOrtu: z.string().optional(),
  kelas: z.string().optional(),
  tahunMasuk: z.string().optional(),
  tahunLulus: z.string().optional(),
  status: z.enum(['aktif', 'lulus', 'pindah', 'keluar']),
});

// Guru Schema
export const guruSchema = z.object({
  nip: z.string().optional(),
  nuptk: z.string().optional(),
  nama: z.string().min(1, 'Nama wajib diisi'),
  jenisKelamin: z.enum(['L', 'P']),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  agama: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  jabatan: z.string().optional(),
  bidangStudi: z.string().optional(),
  pendidikan: z.string().optional(),
  jurusan: z.string().optional(),
  tanggalMasuk: z.string().optional(),
  statusPegawai: z.enum(['aktif', 'pensiun', 'pindah', 'keluar']),
  jenisKontrak: z.string().optional(),
});

// Sarpras Schema
export const sarprasSchema = z.object({
  kodeBarang: z.string().min(1, 'Kode barang wajib diisi'),
  namaBarang: z.string().min(1, 'Nama barang wajib diisi'),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  merk: z.string().optional(),
  tahunPengadaan: z.number().optional(),
  jumlah: z.number().min(1, 'Jumlah minimal 1').default(1),
  satuan: z.string().default('unit'),
  kondisi: z.enum(['baik', 'rusak_ringan', 'rusak_berat']).default('baik'),
  lokasi: z.string().optional(),
  sumberDana: z.string().optional(),
  hargaSatuan: z.number().optional(),
  keterangan: z.string().optional(),
});

// Kegiatan Schema
export const kegiatanSchema = z.object({
  namaKegiatan: z.string().min(1, 'Nama kegiatan wajib diisi'),
  jenisKegiatan: z.string().min(1, 'Jenis kegiatan wajib diisi'),
  tanggalMulai: z.string().min(1, 'Tanggal mulai wajib diisi'),
  tanggalSelesai: z.string().optional(),
  waktuMulai: z.string().optional(),
  waktuSelesai: z.string().optional(),
  lokasi: z.string().optional(),
  penanggungJawab: z.string().optional(),
  peserta: z.string().optional(),
  jumlahPeserta: z.number().optional(),
  anggaran: z.number().optional(),
  deskripsi: z.string().optional(),
  status: z.enum(['terjadwal', 'berlangsung', 'selesai', 'dibatalkan']).default('terjadwal'),
});

// Dokumen Schema
export const dokumenSchema = z.object({
  siswaId: z.number().optional(),
  guruId: z.number().optional(),
  jenisDokumen: z.string().min(1, 'Jenis dokumen wajib diisi'),
  nomorDokumen: z.string().optional(),
  periodeArsip: z.string().optional(),
  tanggalDokumen: z.string().optional(),
  keterangan: z.string().optional(),
  tags: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SiswaInput = z.infer<typeof siswaSchema>;
export type GuruInput = z.infer<typeof guruSchema>;
export type SarprasInput = z.infer<typeof sarprasSchema>;
export type KegiatanInput = z.infer<typeof kegiatanSchema>;
export type DokumenInput = z.infer<typeof dokumenSchema>;
