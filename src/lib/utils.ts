import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '-';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const STATUS_SISWA = {
  aktif: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  lulus: { label: 'Lulus', color: 'bg-blue-100 text-blue-800' },
  pindah: { label: 'Pindah', color: 'bg-yellow-100 text-yellow-800' },
  keluar: { label: 'Keluar', color: 'bg-red-100 text-red-800' },
};

export const STATUS_PEGAWAI = {
  aktif: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
  pensiun: { label: 'Pensiun', color: 'bg-gray-100 text-gray-800' },
  pindah: { label: 'Pindah', color: 'bg-yellow-100 text-yellow-800' },
  keluar: { label: 'Keluar', color: 'bg-red-100 text-red-800' },
};

export const STATUS_PRESENSI = {
  hadir: { label: 'Hadir', color: 'bg-green-100 text-green-800' },
  sakit: { label: 'Sakit', color: 'bg-yellow-100 text-yellow-800' },
  izin: { label: 'Izin', color: 'bg-blue-100 text-blue-800' },
  alfa: { label: 'Alfa', color: 'bg-red-100 text-red-800' },
  dinas_luar: { label: 'Dinas Luar', color: 'bg-purple-100 text-purple-800' },
  cuti: { label: 'Cuti', color: 'bg-orange-100 text-orange-800' },
};

export const KONDISI_SARPRAS = {
  baik: { label: 'Baik', color: 'bg-green-100 text-green-800' },
  rusak_ringan: { label: 'Rusak Ringan', color: 'bg-yellow-100 text-yellow-800' },
  rusak_berat: { label: 'Rusak Berat', color: 'bg-red-100 text-red-800' },
};

export const STATUS_KEGIATAN = {
  terjadwal: { label: 'Terjadwal', color: 'bg-blue-100 text-blue-800' },
  berlangsung: { label: 'Berlangsung', color: 'bg-green-100 text-green-800' },
  selesai: { label: 'Selesai', color: 'bg-gray-100 text-gray-800' },
  dibatalkan: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
};

export const JENIS_DOKUMEN = [
  { value: 'ijazah', label: 'Ijazah' },
  { value: 'akta_kelahiran', label: 'Akta Kelahiran' },
  { value: 'kk', label: 'Kartu Keluarga' },
  { value: 'ktp', label: 'KTP' },
  { value: 'rapor', label: 'Rapor' },
  { value: 'sk', label: 'Surat Keputusan' },
  { value: 'sertifikat', label: 'Sertifikat' },
  { value: 'foto', label: 'Foto' },
  { value: 'surat', label: 'Surat' },
  { value: 'lainnya', label: 'Lainnya' },
];
