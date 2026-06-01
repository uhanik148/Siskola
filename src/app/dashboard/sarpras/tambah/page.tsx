'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Package, Tag, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui';

export default function TambahSarprasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/sarpras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Gagal menyimpan data');
      }

      router.push('/dashboard/sarpras');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sarpras">
          <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Barang Baru</h1>
          <p className="text-slate-500 text-sm">Input data inventaris atau aset sekolah</p>
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
                type="text"
                placeholder="Contoh: Laptop Unit 01"
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
                type="text"
                placeholder="Contoh: INV/2024/001"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select required name="kategori" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm appearance-none bg-white">
                  <option value="">Pilih Kategori</option>
                  <option value="Meubelair">Meubelair (Meja, Kursi, Loker)</option>
                  <option value="APE Dalam">APE Dalam (Puzzle, Balok, Boneka)</option>
                  <option value="APE Luar">APE Luar (Ayunan, Prosotan, Putaran)</option>
                  <option value="Elektronik">Elektronik (Sound System, Laptop)</option>
                  <option value="Alat Tulis">Alat Tulis Guru</option>
                  <option value="Buku">Buku Cerita / Perpustakaan</option>
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
                type="text"
                placeholder="Contoh: Asus Vivobook / Chitose"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="jumlah"
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Satuan</label>
                <input
                  name="satuan"
                  type="text"
                  defaultValue="unit"
                  placeholder="Pcs/Unit/Set"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tahun Pengadaan</label>
              <input name="tahunPengadaan" type="number" placeholder="2024" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm" />
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
                type="text"
                placeholder="Contoh: Ruang Guru / Gudang"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kondisi</label>
              <select name="kondisi" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm bg-white">
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
                  type="text"
                  placeholder="Contoh: BOS 2024"
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Keterangan Tambahan</label>
              <textarea
                name="keterangan"
                rows={3}
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                placeholder="Deskripsi kondisi atau catatan lainnya"
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
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Simpan Data
          </Button>
        </div>
      </form>
    </div>
  );
}
