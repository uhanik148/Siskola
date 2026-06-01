'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siswaSchema, type SiswaInput } from '@/lib/validations';
import { Button, DatePicker } from '@/components/ui';
import { ArrowLeft, Save, User, Users, BookOpen, Phone, Mail, MapPin, Hash, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EditSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SiswaInput>({
    resolver: zodResolver(siswaSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/siswa/${id}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error);

        // Pre-fill form fields
        Object.keys(json).forEach((key) => {
          // Exclude relational objects or nulls if needed, or handle specifically
          if (key === 'tanggalLahir' && json[key]) {
            // Datepicker handles date object or string usually
            setValue(key as keyof SiswaInput, json[key]);
          } else {
            setValue(key as keyof SiswaInput, json[key]);
          }
        });
      } catch (err) {
        setError('Gagal mengambil data siswa');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data: SiswaInput) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/siswa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengupdate data siswa');

      router.push('/dashboard/siswa');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Link href="/dashboard/siswa" className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Data Siswa</h1>
            <p className="text-slate-500 text-sm">Perbarui informasi siswa</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Data Pribadi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-blue-100">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Data Pribadi</h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-5">
              {/* Nama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Nama lengkap siswa"
                    {...register('nama')}
                  />
                </div>
                {errors.nama && <p className="text-xs text-red-500 mt-1.5">{errors.nama.message}</p>}
              </div>

              {/* NIS */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  NIS (Nomor Induk Siswa) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    // NIS usually read-only/disabled on edit to prevent identity issues, but allowed here if needed
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="2024001"
                    {...register('nis')}
                  />
                </div>
                {errors.nis && <p className="text-xs text-red-500 mt-1.5">{errors.nis.message}</p>}
              </div>

              {/* NISN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">NISN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="10 digit NISN"
                    {...register('nisn')}
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('jenisKelamin')}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Agama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Agama</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('agama')}
                  >
                    <option value="">Pilih Agama</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tempat Lahir</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Kota kelahiran"
                    {...register('tempatLahir')}
                  />
                </div>
              </div>

              {/* Tanggal Lahir - Using Custom DatePicker */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Lahir</label>
                <Controller
                  name="tanggalLahir"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      placeholder="Pilih tanggal lahir"
                      maxDate={new Date()}
                      showYearDropdown
                      showMonthDropdown
                    />
                  )}
                />
              </div>

              {/* No Telepon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">No. Telepon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="08xxxxxxxxxx"
                    {...register('telepon')}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="email@contoh.com"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Alamat</label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea
                    className="w-full min-h-[100px] pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="Alamat lengkap siswa"
                    {...register('alamat')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Orang Tua */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Data Orang Tua</h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-5">
              {/* Nama Ayah */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Ayah</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Nama lengkap ayah"
                  {...register('namaAyah')}
                />
              </div>

              {/* Pekerjaan Ayah */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pekerjaan Ayah</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Pekerjaan ayah"
                  {...register('pekerjaanAyah')}
                />
              </div>

              {/* Nama Ibu */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Ibu</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Nama lengkap ibu"
                  {...register('namaIbu')}
                />
              </div>

              {/* Pekerjaan Ibu */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pekerjaan Ibu</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Pekerjaan ibu"
                  {...register('pekerjaanIbu')}
                />
              </div>

              {/* No Telepon Ortu */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">No. Telepon Orang Tua</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="08xxxxxxxxxx"
                    {...register('teleponOrtu')}
                  />
                </div>
              </div>

              {/* Alamat Ortu */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Orang Tua</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Alamat orang tua (jika berbeda)"
                  {...register('alamatOrtu')}
                />
              </div>
            </div>
          </div>

          {/* Data Akademik */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-purple-100">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Data Akademik</h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-5">
              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kelas</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Contoh: 7A, 8B, 9C"
                  {...register('kelas')}
                />
              </div>

              {/* Tahun Masuk */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tahun Masuk</label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="2024"
                  {...register('tahunMasuk')}
                />
              </div>

              {/* Tahun Lulus */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tahun Lulus</label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="2027 (opsional)"
                  {...register('tahunLulus')}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('status')}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="lulus">Lulus</option>
                    <option value="pindah">Pindah</option>
                    <option value="keluar">Keluar</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/siswa">
              <Button type="button" variant="outline" className="px-6">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="px-6 bg-blue-600 hover:bg-blue-700">
              {loading ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
