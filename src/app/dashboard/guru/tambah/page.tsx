'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guruSchema, type GuruInput } from '@/lib/validations';
import { Button, DatePicker } from '@/components/ui';
import { ArrowLeft, Save, User, Briefcase, GraduationCap, Phone, Mail, MapPin, Hash, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TambahGuruPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GuruInput>({
    resolver: zodResolver(guruSchema),
    defaultValues: {
      statusPegawai: 'aktif',
      jenisKelamin: 'L',
    },
  });

  const onSubmit = async (data: GuruInput) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/guru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan data');
      }

      router.push('/dashboard/guru');
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Link href="/dashboard/guru" className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tambah Data Guru</h1>
            <p className="text-slate-500 text-sm">Formulir pendaftaran guru baru</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identitas Pribadi */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-blue-100">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Identitas Pribadi</h2>
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
                    placeholder="Nama lengkap beserta gelar"
                    {...register('nama')}
                  />
                </div>
                {errors.nama && <p className="text-xs text-red-500 mt-1.5">{errors.nama.message}</p>}
              </div>

              {/* NIP */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">NIP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="198xxxxxxxxx (opsional)"
                    {...register('nip')}
                  />
                </div>
              </div>

              {/* NUPTK */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">NUPTK</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Nomor Unik Pendidik (opsional)"
                    {...register('nuptk')}
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

              {/* Tanggal Lahir */}
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
                    placeholder="example@sekolah.sch.id"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
              </div>

              {/* Telepon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telepon</label>
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
                    {...register('telepon')}
                  />
                </div>
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
                    placeholder="Alamat lengkap domisili"
                    {...register('alamat')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Kepegawaian */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-green-100">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Data Kepegawaian</h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-5">
              {/* Jabatan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jabatan</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('jabatan')}
                  >
                    <option value="">Pilih Jabatan</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Guru Kelas">Guru Kelas / Wali Kelas</option>
                    <option value="Guru Sentra">Guru Sentra</option>
                    <option value="Guru Pendamping">Guru Pendamping</option>
                    <option value="Tenaga Administrasi">Tenaga Administrasi / TU</option>
                    <option value="Operator">Operator Sekolah</option>
                    <option value="Penjaga Sekolah">Penjaga Sekolah</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Pendidikan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pendidikan Terakhir</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('pendidikan')}
                  >
                    <option value="">Pilih Pendidikan</option>
                    <option value="SMA/SMK">SMA / SMK</option>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                    <option value="S1">S1 / Sarjana</option>
                    <option value="S2">S2 / Magister</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Jurusan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jurusan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Pendidikan Matematika, dll"
                    {...register('jurusan')}
                  />
                </div>
              </div>

              {/* Tanggal Masuk */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Masuk</label>
                <Controller
                  name="tanggalMasuk"
                  control={control}
                  render={({ field }) => (
                    <DatePicker value={field.value ? new Date(field.value) : null} onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')} placeholder="Pilih tanggal masuk" showYearDropdown showMonthDropdown />
                  )}
                />
              </div>

              {/* Status Pegawai */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status Pegawai</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('statusPegawai')}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="pensiun">Pensiun</option>
                    <option value="pindah">Pindah</option>
                    <option value="keluar">Keluar</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Jenis Kontrak */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Kontrak</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    {...register('jenisKontrak')}
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="Honorer">Honorer</option>
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
            <Link href="/dashboard/guru">
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
                  Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
