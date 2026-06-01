'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Clock, MapPin, AlignLeft, Image as ImageIcon } from 'lucide-react';
import { Button, DatePicker } from '@/components/ui';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import NextImage from 'next/image';

export default function TambahKegiatanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date state
  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(new Date());
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);

  // Time state for Real-time Validation
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');

  // Foto state
  const [fileData, setFileData] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  const isTimeInvalid = () => {
    if (!waktuMulai || !waktuSelesai) return false;

    if (tanggalMulai && tanggalSelesai) {
      const d1 = new Date(tanggalMulai);
      d1.setHours(0, 0, 0, 0);
      const d2 = new Date(tanggalSelesai);
      d2.setHours(0, 0, 0, 0);
      if (d2.getTime() > d1.getTime()) return false; // Tanggal selesai besoknya, jam berapapun oke
    }

    // Bandingkan jam
    const [h1, m1] = waktuMulai.split(':').map(Number);
    const [h2, m2] = waktuSelesai.split(':').map(Number);
    const t1 = h1 * 60 + m1;
    const t2 = h2 * 60 + m2;

    return t2 <= t1;
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFileData({ file, previewUrl });
    } else {
      alert('Mohon upload file gambar');
    }
  };

  const uploadFileToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'kegiatan');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Gagal mengupload foto');
    }

    const data = await response.json();
    return data.filePath;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const namaKegiatan = formData.get('namaKegiatan') as string;

    // Validasi Client Side
    if (!namaKegiatan || !namaKegiatan.trim()) {
      setError('Nama kegiatan wajib diisi');
      setIsLoading(false);
      return;
    }

    if (!tanggalMulai) {
      setError('Tanggal mulai wajib diisi');
      setIsLoading(false);
      return;
    }

    // Validasi Tanggal Selesai
    if (tanggalSelesai) {
      const dateMulai = new Date(tanggalMulai);
      dateMulai.setHours(0, 0, 0, 0);

      const dateSelesai = new Date(tanggalSelesai);
      dateSelesai.setHours(0, 0, 0, 0);

      if (dateSelesai < dateMulai) {
        setError('Tanggal selesai tidak boleh sebelum tanggal mulai');
        setIsLoading(false);
        return;
      }
    }

    // Validasi Time (Block submit if invalid)
    if (isTimeInvalid()) {
      setError('Waktu selesai tidak valid (lebih awal dari waktu mulai)');
      setIsLoading(false);
      return;
    }

    const payload: any = Object.fromEntries(formData.entries());

    // Add controlled fields manually if needed (FormData captures inputs by name, so value is enough)
    // But we need to ensure payload uses our state if we controlled it
    // FormData will pick up the input value because we pass `value={waktuMulai}` to input.

    // Add date fields manually
    payload.tanggalMulai = tanggalMulai.toISOString();
    if (tanggalSelesai) payload.tanggalSelesai = tanggalSelesai.toISOString();

    try {
      // 1. Upload Foto if exists
      if (fileData) {
        const serverPath = await uploadFileToServer(fileData.file);
        payload.foto = serverPath;
        payload.fotoName = fileData.file.name;
      }

      // 2. Submit Data
      const res = await fetch('/api/kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Gagal menyimpan kegiatan');
      }

      router.push('/dashboard/kegiatan');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  const isInvalid = isTimeInvalid();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/kegiatan">
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Kegiatan Baru</h1>
          <p className="text-slate-500 text-sm">Jadwalkan agenda atau acara sekolah</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto Kegiatan Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800">Foto / Banner Kegiatan</h2>
          </div>

          <div className="p-6">
            <div className="max-w-xl">
              <label className="text-sm font-medium text-slate-700 block mb-3">Upload Foto (Opsional)</label>
              <DocumentUpload onFileSelect={handleFileSelect} folder="kegiatan" accept=".jpg,.jpeg,.png,.webp" />

              {fileData && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                  <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-slate-200">
                    <NextImage src={fileData.previewUrl} alt="Preview" fill className="object-cover" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">*Gambar akan otomatis dikompres ke WebP untuk performa</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Kegiatan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800">Detail Kegiatan</h2>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="namaKegiatan"
                type="text"
                placeholder="Contoh: Upacara Bendera / Rapat Guru"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Jenis Kegiatan <span className="text-red-500">*</span>
              </label>
              <select required name="jenisKegiatan" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm bg-white">
                <option value="parenting">Parenting / Pertemuan Wali</option>
                <option value="outing">Outing Class / Kunjungan</option>
                <option value="pentas">Pentas Seni / Akhir Tahun</option>
                <option value="kesehatan">Pemeriksaan Kesehatan / Gizi</option>
                <option value="upacara">Upacara / Seremonial</option>
                <option value="rapat">Rapat Guru</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select name="status" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm bg-white">
                <option value="terjadwal">Terjadwal</option>
                <option value="berlangsung">Sedang Berlangsung</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Waktu & Lokasi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800">Waktu & Tempat</h2>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <DatePicker value={tanggalMulai} onChange={setTanggalMulai} placeholder="Pilih tanggal" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tanggal Selesai (Opsional)</label>
              <DatePicker value={tanggalSelesai} onChange={setTanggalSelesai} placeholder="Pilih tanggal" minDate={tanggalMulai || undefined} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Waktu Mulai</label>
              <div className="flex items-center gap-2">
                <input
                  name="waktuMulai"
                  value={waktuMulai}
                  onChange={(e) => setWaktuMulai(e.target.value)}
                  type="time"
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                />
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-2 rounded-lg">WIB</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Waktu Selesai</label>
              <div className="flex items-center gap-2">
                <input
                  name="waktuSelesai"
                  value={waktuSelesai}
                  onChange={(e) => setWaktuSelesai(e.target.value)}
                  type="time"
                  className={`flex-1 h-10 px-3 rounded-lg border outline-none transition-all text-sm ${
                    isInvalid ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50 text-red-600' : 'border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                  }`}
                />
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-2 rounded-lg">WIB</span>
              </div>
              {isInvalid && <p className="text-xs text-red-500 flex items-center gap-1 mt-1">* Waktu selesai tidak boleh lebih awal dari waktu mulai</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Lokasi Kegiatan</label>
              <div className="relative">
                <input
                  name="lokasi"
                  type="text"
                  placeholder="Contoh: Aula Utama / Lapangan Upacara"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                />
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Tambahan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlignLeft className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800">Informasi Tambahan</h2>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Penanggung Jawab</label>
              <input
                name="penanggungJawab"
                type="text"
                placeholder="Nama Guru / Panitia"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Target Peserta</label>
              <input
                name="peserta"
                type="text"
                placeholder="Contoh: Seluruh Siswa Kelas X"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Peserta (Est)</label>
              <input name="jumlahPeserta" type="number" placeholder="0" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Anggaran Biaya</label>
              <div className="relative">
                <input name="anggaran" type="number" placeholder="0" className="w-full h-10 pl-12 pr-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm" />
                <div className="absolute left-3 top-2.5 text-sm font-bold text-slate-500 pointer-events-none bg-slate-100 px-1 rounded">Rp</div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Deskripsi Lengkap</label>
              <textarea
                name="deskripsi"
                rows={4}
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm resize-none"
                placeholder="Jelaskan detail kegiatan..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 pb-8">
          <Link href="/dashboard/kegiatan">
            <Button variant="outline" type="button" className="px-8">
              Batal
            </Button>
          </Link>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" isLoading={isLoading} disabled={isLoading || isInvalid}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Menyimpan...' : 'Simpan Kegiatan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
