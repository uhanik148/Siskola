import prisma from '@/lib/prisma';
import { formatDate, formatCurrency, KONDISI_SARPRAS, STATUS_KEGIATAN } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/config';
import { BarChart3, Users, GraduationCap, Package, Calendar, FileText, Download, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { PrintButton } from './print-button';

async function getReportData() {
  const [siswaStats, guruStats, sarprasStats, kegiatanStats, dokumenStats, recentSiswa, recentGuru, recentSarpras, recentKegiatan] = await Promise.all([
    // Siswa stats
    prisma.siswa.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // Guru stats
    prisma.guru.groupBy({
      by: ['statusPegawai'],
      _count: { statusPegawai: true },
    }),
    // Sarpras stats
    prisma.sarpras.groupBy({
      by: ['kondisi'],
      _count: { kondisi: true },
    }),
    // Kegiatan stats
    prisma.kegiatan.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // Dokumen count
    prisma.dokumen.count(),
    // Recent siswa
    prisma.siswa.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    // Recent guru
    prisma.guru.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    // Sarpras with issues
    prisma.sarpras.findMany({
      where: { kondisi: { not: 'baik' } },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    }),
    // Upcoming kegiatan
    prisma.kegiatan.findMany({
      where: { status: { in: ['terjadwal', 'berlangsung'] } },
      take: 5,
      orderBy: { tanggalMulai: 'asc' },
    }),
  ]);

  return {
    siswaStats,
    guruStats,
    sarprasStats,
    kegiatanStats,
    dokumenStats,
    recentSiswa,
    recentGuru,
    recentSarpras,
    recentKegiatan,
  };
}

export default async function LaporanPage() {
  let data = {
    siswaStats: [] as { status: string; _count: { status: number } }[],
    guruStats: [] as { statusPegawai: string; _count: { statusPegawai: number } }[],
    sarprasStats: [] as { kondisi: string; _count: { kondisi: number } }[],
    kegiatanStats: [] as { status: string; _count: { status: number } }[],
    dokumenStats: 0,
    recentSiswa: [] as Awaited<ReturnType<typeof prisma.siswa.findMany>>,
    recentGuru: [] as Awaited<ReturnType<typeof prisma.guru.findMany>>,
    recentSarpras: [] as Awaited<ReturnType<typeof prisma.sarpras.findMany>>,
    recentKegiatan: [] as Awaited<ReturnType<typeof prisma.kegiatan.findMany>>,
  };

  try {
    data = await getReportData();
  } catch {
    // Database might not be initialized
  }

  const totalSiswa = data.siswaStats.reduce((acc, s) => acc + s._count.status, 0);
  const totalGuru = data.guruStats.reduce((acc, s) => acc + s._count.statusPegawai, 0);
  const totalSarpras = data.sarprasStats.reduce((acc, s) => acc + s._count.kondisi, 0);
  const totalKegiatan = data.kegiatanStats.reduce((acc, s) => acc + s._count.status, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan & Rekap</h1>
          <p className="text-slate-500 text-sm">Ringkasan data arsip kependidikan</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 print-full-width">
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalSiswa}</p>
          <p className="text-xs text-slate-500">Total Siswa</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalGuru}</p>
          <p className="text-xs text-slate-500">Guru & Staf</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalSarpras}</p>
          <p className="text-xs text-slate-500">Inventaris</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-purple-500 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalKegiatan}</p>
          <p className="text-xs text-slate-500">Kegiatan</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2.5 rounded-lg bg-rose-50">
              <FileText className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{data.dokumenStats}</p>
          <p className="text-xs text-slate-500">Dokumen</p>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Siswa Stats */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Rekap Siswa</h2>
          </div>
          <div className="space-y-3">
            {data.siswaStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between">
                <span className="text-slate-600 capitalize">{stat.status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stat._count.status / totalSiswa) * 100}%` }} />
                  </div>
                  <span className="font-medium text-slate-900 w-8 text-right">{stat._count.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guru Stats */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Rekap Guru & Staf</h2>
          </div>
          <div className="space-y-3">
            {data.guruStats.map((stat) => (
              <div key={stat.statusPegawai} className="flex items-center justify-between">
                <span className="text-slate-600 capitalize">{stat.statusPegawai}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stat._count.statusPegawai / totalGuru) * 100}%` }} />
                  </div>
                  <span className="font-medium text-slate-900 w-8 text-right">{stat._count.statusPegawai}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sarpras Stats */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-50">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Kondisi Inventaris</h2>
          </div>
          <div className="space-y-3">
            {data.sarprasStats.map((stat) => {
              const kondisiInfo = KONDISI_SARPRAS[stat.kondisi as keyof typeof KONDISI_SARPRAS];
              return (
                <div key={stat.kondisi} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stat.kondisi === 'baik' ? <CheckCircle className="w-4 h-4 text-green-500" /> : stat.kondisi === 'rusak_ringan' ? <AlertCircle className="w-4 h-4 text-yellow-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className="text-slate-600">{kondisiInfo?.label || stat.kondisi}</span>
                  </div>
                  <span className="font-medium text-slate-900">{stat._count.kondisi}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kegiatan Stats */}
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Status Kegiatan</h2>
          </div>
          <div className="space-y-3">
            {data.kegiatanStats.map((stat) => {
              const statusInfo = STATUS_KEGIATAN[stat.status as keyof typeof STATUS_KEGIATAN];
              return (
                <div key={stat.status} className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusInfo?.color || 'bg-gray-100 text-gray-700'}`}>{statusInfo?.label || stat.status}</span>
                  <span className="font-medium text-slate-900">{stat._count.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Siswa */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Siswa Terbaru</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">NIS</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Nama</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Kelas</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSiswa.map((siswa) => (
                <tr key={siswa.id} className="border-b border-slate-50">
                  <td className="px-4 py-2 text-slate-600">{siswa.nis}</td>
                  <td className="px-4 py-2 text-slate-900">{siswa.nama}</td>
                  <td className="px-4 py-2 text-slate-600">{siswa.kelas || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Kegiatan */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Kegiatan Mendatang</h2>
          </div>
          <div className="p-4 space-y-3">
            {data.recentKegiatan.length > 0 ? (
              data.recentKegiatan.map((kegiatan) => (
                <div key={kegiatan.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{kegiatan.namaKegiatan}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(kegiatan.tanggalMulai)} • {kegiatan.lokasi || '-'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_KEGIATAN[kegiatan.status as keyof typeof STATUS_KEGIATAN]?.color}`}>{STATUS_KEGIATAN[kegiatan.status as keyof typeof STATUS_KEGIATAN]?.label}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Tidak ada kegiatan mendatang</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-sm text-slate-500 pt-8 border-t">
        <p>
          Dicetak pada:{' '}
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p className="mt-1">
          {APP_CONFIG.name} - {APP_CONFIG.description}
        </p>
      </div>
    </div>
  );
}
