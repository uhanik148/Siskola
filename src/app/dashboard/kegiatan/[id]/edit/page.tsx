'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Clock, MapPin, AlignLeft, Image as ImageIcon } from 'lucide-react';
import { Button, DatePicker } from '@/components/ui';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import NextImage from 'next/image';

export default function EditKegiatanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | null>(null);

  // Foto State
  const [existingFoto, setExistingFoto] = useState<string | null>(null);
  const [newFileData, setNewFileData] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    namaKegiatan: '',
    jenisKegiatan: '',
    status: 'terjadwal',
    waktuMulai: '',
    waktuSelesai: '',
    lokasi: '',
    penanggungJawab: '',
    peserta: '',
    jumlahPeserta: '',
    anggaran: '',
    deskripsi: '',
    fotoName: '',
  });

  useEffect(() => {
    fetch(`/api/kegiatan/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const d = json.data;
          setFormData({
            namaKegiatan: d.namaKegiatan,
            jenisKegiatan: d.jenisKegiatan,
            status: d.status,
            waktuMulai: d.waktuMulai || '',
            waktuSelesai: d.waktuSelesai || '',
            lokasi: d.lokasi || '',
            penanggungJawab: d.penanggungJawab || '',
            peserta: d.peserta || '',
            jumlahPeserta: d.jumlahPeserta?.toString() || '',
            anggaran: d.anggaran?.toString() || '',
            deskripsi: d.deskripsi || '',
            fotoName: d.fotoName || '',
          });

          if (d.tanggalMulai) setTanggalMulai(new Date(d.tanggalMulai));
          if (d.tanggalSelesai) setTanggalSelesai(new Date(d.tanggalSelesai));
          if (d.foto) setExistingFoto(d.foto);
        } else {
          setError('Data tidak ditemukan');
        }
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setNewFileData({ file, previewUrl });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload: any = { ...formData };
    if (tanggalMulai) payload.tanggalMulai = tanggalMulai.toISOString();
    if (tanggalSelesai) payload.tanggalSelesai = tanggalSelesai.toISOString();

    // Validasi Tanggal & Waktu
    if (tanggalMulai && tanggalSelesai) {
      const dateMulai = new Date(tanggalMulai);
      dateMulai.setHours(0, 0, 0, 0);

      const dateSelesai = new Date(tanggalSelesai);
      dateSelesai.setHours(0, 0, 0, 0);

      if (dateSelesai < dateMulai) {
        setError('Tanggal selesai tidak boleh sebelum tanggal mulai');
        setIsSaving(false);
        return;
      }

      // Validasi Waktu jika tanggal sama
      if (dateSelesai.getTime() === dateMulai.getTime() && formData.waktuMulai && formData.waktuSelesai) {
        const [hMulai, mMulai] = formData.waktuMulai.split(':').map(Number);
        const [hSelesai, mSelesai] = formData.waktuSelesai.split(':').map(Number);

        const timeMulai = hMulai * 60 + mMulai;
        const timeSelesai = hSelesai * 60 + mSelesai;

        if (timeSelesai < timeMulai) {
          setError('Waktu selesai tidak boleh lebih awal dari waktu mulai pada hari yang sama');
          setIsSaving(false);
          return;
        }
      }
    }

    try {
      // Logic Upload Baru (Jika ada file baru dipilih)
      if (newFileData) {
        const serverPath = await uploadFileToServer(newFileData.file);
        payload.foto = serverPath;
        payload.fotoName = newFileData.file.name;
      }

      // Parser Angka
      if (payload.jumlahPeserta) payload.jumlahPeserta = parseInt(payload.jumlahPeserta);
      if (payload.anggaran) payload.anggaran = parseFloat(payload.anggaran);

      const res = await fetch(`/api/kegiatan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal menyimpan perubahan');

      router.push('/dashboard/kegiatan');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menyimpan');
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper Validasi Waktu
  const isTimeInvalid = () => {
    const { waktuMulai, waktuSelesai } = formData;
    if (!waktuMulai || !waktuSelesai) return false;

    // Periksa tanggal
    if (tanggalMulai && tanggalSelesai) {
      const d1 = new Date(tanggalMulai);
      d1.setHours(0, 0, 0, 0);
      const d2 = new Date(tanggalSelesai);
      d2.setHours(0, 0, 0, 0);
      if (d2.getTime() > d1.getTime()) return false;
    }

    const [h1, m1] = waktuMulai.split(':').map(Number);
    const [h2, m2] = waktuSelesai.split(':').map(Number);

    return h2 * 60 + m2 <= h1 * 60 + m1;
  };

  const isInvalid = isTimeInvalid();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/kegiatan">
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Kegiatan</h1>
          <p className="text-slate-500 text-sm">Perbarui detail agenda</p>
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
              <label className="text-sm font-medium text-slate-700 block mb-3">{existingFoto ? 'Ganti Foto (Opsional)' : 'Upload Foto (Opsional)'}</label>

              <DocumentUpload onFileSelect={handleFileSelect} folder="kegiatan" accept=".jpg,.jpeg,.png,.webp" />

              {/* Preview New File */}
              {newFileData && (
                <div className="mt-4 p-4 border border-blue-200 rounded-xl bg-blue-50">
                  <p className="text-sm font-medium text-blue-700 mb-2">Akan Diganti Dengan:</p>
                  <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                    <NextImage src={newFileData.previewUrl} alt="New Preview" fill className="object-cover" />
                  </div>
                </div>
              )}

              {/* Existing Photo Preview (Show if no new file selected) */}
              {!newFileData && existingFoto && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-sm font-medium text-slate-700 mb-2">Foto Saat Ini:</p>
                  <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-slate-200">
                    <NextImage src={existingFoto} alt="Current Foto" fill className="object-cover" />
                  </div>
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
                value={formData.namaKegiatan}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Jenis Kegiatan <span className="text-red-500">*</span>
              </label>
              <select
                required
                name="jenisKegiatan"
                value={formData.jenisKegiatan}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm bg-white"
              >
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
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm bg-white"
              >
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
                  value={formData.waktuMulai}
                  onChange={handleChange}
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
                  value={formData.waktuSelesai}
                  onChange={handleChange}
                  type="time"
                  className={`flex-1 h-10 px-3 rounded-lg border outline-none transition-all text-sm ${
                    isInvalid ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50 text-red-600' : 'border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                  }`}
                />
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-2 rounded-lg">WIB</span>
              </div>
              {isInvalid && <p className="text-xs text-red-500 flex items-center gap-1 mt-1">* Waktu selesai harus lebih akhir dari waktu mulai</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Lokasi Kegiatan</label>
              <div className="relative">
                <input
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  type="text"
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
                value={formData.penanggungJawab}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Target Peserta</label>
              <input
                name="peserta"
                value={formData.peserta}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Peserta (Est)</label>
              <input
                name="jumlahPeserta"
                value={formData.jumlahPeserta}
                onChange={handleChange}
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Anggaran Biaya</label>
              <div className="relative">
                <input
                  name="anggaran"
                  value={formData.anggaran}
                  onChange={handleChange}
                  type="number"
                  className="w-full h-10 pl-12 pr-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                />
                <div className="absolute left-3 top-2.5 text-sm font-bold text-slate-500 pointer-events-none bg-slate-100 px-1 rounded">Rp</div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Deskripsi Lengkap</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm resize-none"
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
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" isLoading={isSaving} disabled={isSaving || isInvalid}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
