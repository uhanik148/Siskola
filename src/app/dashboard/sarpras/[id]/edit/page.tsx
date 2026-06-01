'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package, Tag, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

export default function EditSarprasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    namaBarang: '',
    kodeBarang: '',
    kategori: '',
    merk: '',
    jumlah: 1,
    satuan: 'unit',
    tahunPengadaan: '',
    lokasi: '',
    kondisi: 'baik',
    sumberDana: '',
    keterangan: '',
  });

  useEffect(() => {
    fetch(`/api/sarpras/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const d = json.data;
          setFormData({
            namaBarang: d.namaBarang,
            kodeBarang: d.kodeBarang,
            kategori: d.kategori,
            merk: d.merk || '',
            jumlah: d.jumlah,
            satuan: d.satuan,
            tahunPengadaan: d.tahunPengadaan?.toString() || '',
            lokasi: d.lokasi || '',
            kondisi: d.kondisi,
            sumberDana: d.sumberDana || '',
            keterangan: d.keterangan || '',
          });
        } else {
          setError('Data tidak ditemukan');
        }
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/sarpras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Gagal menyimpan perubahan');

      router.push('/dashboard/sarpras');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan');
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sarpras">
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Data Barang</h1>
            <p className="text-slate-500 text-sm">Perbarui informasi inventaris</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Aset */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800">Informasi Aset</h2>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="namaBarang"
                value={formData.namaBarang}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Kode Barang <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="kodeBarang"
                value={formData.kodeBarang}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none bg-white"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Meubelair">Meubelair / Furniture</option>
                  <option value="APE Dalam">APE Dalam (Indoor)</option>
                  <option value="APE Luar">APE Luar (Outdoor)</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Alat Tulis">Alat Tulis</option>
                  <option value="Buku">Buku Cerita</option>
                  <option value="Kendaraan">Kendaraan</option>
                  <option value="Perlengkapan Kebersihan">Perlengkapan Kebersihan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <Tag className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Merk / Model</label>
              <input
                name="merk"
                value={formData.merk}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Jumlah</label>
                <input
                  required
                  name="jumlah"
                  value={formData.jumlah}
                  onChange={handleChange}
                  type="number"
                  min="1"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Satuan</label>
                <input
                  name="satuan"
                  value={formData.satuan}
                  onChange={handleChange}
                  type="text"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tahun Pengadaan</label>
              <input
                name="tahunPengadaan"
                value={formData.tahunPengadaan}
                onChange={handleChange}
                type="number"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Kondisi & Lokasi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-slate-800">Detail & Lokasi</h2>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lokasi Penyimpanan</label>
              <input
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                type="text"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kondisi</label>
              <select
                name="kondisi"
                value={formData.kondisi}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-white"
              >
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sumber Dana</label>
              <div className="relative">
                <input
                  name="sumberDana"
                  value={formData.sumberDana}
                  onChange={handleChange}
                  type="text"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Keterangan Tambahan</label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/dashboard/sarpras">
            <Button variant="outline" type="button" className="px-8">
              Batal
            </Button>
          </Link>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" isLoading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
