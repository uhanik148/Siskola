import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Users, GraduationCap, Package, Calendar, FileText, TrendingUp, Activity, Clock } from 'lucide-react';
import { CurrentDate } from '@/components/ui';
import { unstable_cache } from 'next/cache';

// Cached stats — revalidates every 60 seconds
// This means repeat dashboard visits within 60s are INSTANT (0 DB queries)
const getCachedStats = unstable_cache(
  async () => {
    // Single query with Promise.all for all counts — runs in parallel
    const [siswaCount, guruCount, sarprasCount, kegiatanCount, dokumenCount] = await Promise.all([prisma.siswa.count(), prisma.guru.count(), prisma.sarpras.count(), prisma.kegiatan.count(), prisma.dokumen.count()]);
    return { siswaCount, guruCount, sarprasCount, kegiatanCount, dokumenCount };
  },
  ['dashboard-stats'],
  { revalidate: 60 }, // Cache for 60 seconds
);

// Cached activities — revalidates every 30 seconds
const getCachedActivities = unstable_cache(
  async () => {
    const activities = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        description: true,
        createdAt: true,
        admin: { select: { nama: true } },
      },
    });
    return activities;
  },
  ['dashboard-activities'],
  { revalidate: 30 }, // Cache for 30 seconds
);

export default async function DashboardPage() {
  // Run ALL async operations in parallel — this is the biggest speedup
  // Previously: auth() -> getStats() -> getActivities() (sequential = slow)
  // Now: auth() + getStats() + getActivities() (parallel = fast)
  const [session, stats, activities] = await Promise.all([
    auth(),
    getCachedStats().catch(() => ({
      siswaCount: 0,
      guruCount: 0,
      sarprasCount: 0,
      kegiatanCount: 0,
      dokumenCount: 0,
    })),
    getCachedActivities().catch(() => [] as Awaited<ReturnType<typeof getCachedActivities>>),
  ]);

  const statCards = [
    {
      title: 'Total Siswa',
      value: stats.siswaCount,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
    },
    {
      title: 'Guru & Staf',
      value: stats.guruCount,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-l-emerald-500',
    },
    {
      title: 'Inventaris',
      value: stats.sarprasCount,
      icon: Package,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-l-amber-500',
    },
    {
      title: 'Kegiatan',
      value: stats.kegiatanCount,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-l-purple-500',
    },
    {
      title: 'Dokumen',
      value: stats.dokumenCount,
      icon: FileText,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-l-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Selamat datang kembali, {session?.user?.name || 'Administrator'}.</p>
        </div>
        <CurrentDate />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 ${stat.borderColor} hover:shadow-md transition-all duration-200 group`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stat.value.toLocaleString('id-ID')}</p>
            <p className="text-sm text-slate-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-white rounded-xl p-6 border border-slate-100 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Aktivitas Terbaru</h2>
                <p className="text-sm text-slate-500">Riwayat perubahan data terkini</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity: { id: number; description: string | null; createdAt: Date; admin: { nama: string } | null }) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{activity.admin?.nama || 'System'}</span> {activity.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(activity.createdAt).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada aktivitas</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Aksi Cepat</h2>
            <p className="text-sm text-slate-500">Pintasan menu</p>
          </div>
          <div className="p-5 space-y-3">
            <a href="/dashboard/siswa/tambah" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">Tambah Siswa Baru</span>
            </a>
            <a href="/dashboard/guru/tambah" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">Tambah Guru/Staf</span>
            </a>
            <a href="/dashboard/dokumen/scan" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">Scan Dokumen</span>
            </a>
            <a href="/dashboard/laporan" className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">Lihat Laporan</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
