import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Pencil, User, Phone, MapPin, Mail, Calendar, BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui';

export default async function DetaiSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate ID
  if (isNaN(parseInt(id))) {
    notFound();
  }

  const siswa = await prisma.siswa.findUnique({
    where: { id: parseInt(id) },
    include: {
      dokumen: true,
      presensi: {
        take: 5,
        orderBy: { tanggal: 'desc' },
      },
    },
  });

  if (!siswa) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/siswa" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{siswa.nama}</h1>
            <p className="text-slate-500 text-sm">
              NIS: {siswa.nis} • {siswa.kelas ? `Kelas ${siswa.kelas}` : 'Belum ada kelas'}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/siswa/${siswa.id}/edit`}>
          <Button variant="outline">
            <Pencil className="w-4 h-4" />
            Edit Data
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Pribadi */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Data Pribadi
              </h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                <p className="text-slate-900 font-medium">{siswa.nama}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                <p className="text-slate-900 font-medium">{siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tempat, Tanggal Lahir</p>
                <p className="text-slate-900 font-medium">
                  {siswa.tempatLahir || '-'}, {formatDate(siswa.tanggalLahir)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Agama</p>
                <p className="text-slate-900 font-medium">{siswa.agama || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  {siswa.email ? (
                    <>
                      <Mail className="w-4 h-4 text-slate-400" />
                      {siswa.email}
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Telepon</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  {siswa.telepon ? (
                    <>
                      <Phone className="w-4 h-4 text-slate-400" />
                      {siswa.telepon}
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Alamat</p>
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  {siswa.alamat ? (
                    <>
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      {siswa.alamat}
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Data Orang Tua */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Data Orang Tua
              </h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nama Ayah</p>
                <p className="text-slate-900 font-medium">{siswa.namaAyah || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pekerjaan Ayah</p>
                <p className="text-slate-900 font-medium">{siswa.pekerjaanAyah || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nama Ibu</p>
                <p className="text-slate-900 font-medium">{siswa.namaIbu || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pekerjaan Ibu</p>
                <p className="text-slate-900 font-medium">{siswa.pekerjaanIbu || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Telepon Orang Tua</p>
                <p className="text-slate-900 font-medium">{siswa.teleponOrtu || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Alamat Orang Tua</p>
                <p className="text-slate-900 font-medium">{siswa.alamatOrtu || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & History */}
        <div className="space-y-6">
          {/* Academic Status */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden p-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Status Akademik
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Status Siswa</p>
                <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold capitalize ${siswa.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>{siswa.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kelas</p>
                  <p className="font-semibold">{siswa.kelas || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tahun Masuk</p>
                  <p className="font-semibold">{siswa.tahunMasuk || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden p-6">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-rose-500" />
              Dokumen Tersimpan
            </h2>
            {siswa.dokumen.length > 0 ? (
              <div className="space-y-2">
                {siswa.dokumen.map((doc) => (
                  <a href={`/uploads/dokumen/${doc.fileName}`} target="_blank" key={doc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg group transition-colors">
                    <div className="p-2 bg-rose-50 rounded text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{doc.jenisDokumen}</p>
                      <p className="text-xs text-slate-400 capitalize">{doc.fileType.split('/')[1]}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Belum ada dokumen digital.</p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/dashboard/dokumen/scan">
                <Button variant="outline" className="w-full text-xs h-9">
                  + Scan Dokumen Baru
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
