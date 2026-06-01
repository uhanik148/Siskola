import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDate, STATUS_SISWA } from '@/lib/utils';
import { Plus, Search, Filter, MoreVertical, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, GraduationCap, Users, Download } from 'lucide-react';
import { Button, DeleteButton } from '@/components/ui';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    kelas?: string;
  }>;
}

export default async function SiswaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 10;
  const search = params.search || '';
  const status = params.status || '';
  const kelas = params.kelas || '';

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [{ nama: { contains: search, mode: 'insensitive' as const } }, { nis: { contains: search, mode: 'insensitive' as const } }],
          }
        : {},
      status ? { status } : {},
      kelas ? { kelas } : {},
    ],
  };

  let siswaList: Awaited<ReturnType<typeof prisma.siswa.findMany>> = [];
  let total = 0;
  let kelasList: string[] = [];

  try {
    [siswaList, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.siswa.count({ where }),
    ]);

    // Get unique kelas for filter
    const kelasData = await prisma.siswa.findMany({
      select: { kelas: true },
      distinct: ['kelas'],
      where: { kelas: { not: null } },
    });
    kelasList = kelasData.map((k) => k.kelas).filter((k): k is string => k !== null);
  } catch {
    // Database might not be initialized
  }

  const totalPages = Math.ceil(total / limit);

  // Stats
  const stats = {
    total,
    aktif: siswaList.filter((s) => s.status === 'aktif').length,
    lulus: siswaList.filter((s) => s.status === 'lulus').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-slate-500 text-sm">Kelola data siswa sekolah</p>
        </div>

        <div className="flex gap-2">
          <a href="/api/siswa/export?format=csv" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </a>
          <Link href="/dashboard/siswa/tambah">
            <Button>
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">Total Siswa</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 border-l-green-500 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.aktif}</p>
              <p className="text-xs text-slate-500">Siswa Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <form className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari nama atau NIS..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select name="status" defaultValue={status} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="pindah">Pindah</option>
            <option value="keluar">Keluar</option>
          </select>
          <select name="kelas" defaultValue={kelas} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="default">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">NIS</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Nama Siswa</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Kelas</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Jenis Kelamin</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tanggal Lahir</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {siswaList.length > 0 ? (
                siswaList.map((siswa) => (
                  <tr key={siswa.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{siswa.nis}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{siswa.nama}</p>
                        {siswa.nisn && <p className="text-xs text-slate-400">NISN: {siswa.nisn}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{siswa.kelas || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(siswa.tanggalLahir)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_SISWA[siswa.status as keyof typeof STATUS_SISWA]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_SISWA[siswa.status as keyof typeof STATUS_SISWA]?.label || siswa.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/siswa/${siswa.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/dashboard/siswa/${siswa.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={siswa.id} endpoint="/api/siswa" title="Siswa" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada data siswa</p>
                    <Link href="/dashboard/siswa/tambah" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                      Tambah siswa baru
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Menampilkan {skip + 1} - {Math.min(skip + limit, total)} dari {total} data
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/siswa?page=${page - 1}&search=${search}&status=${status}&kelas=${kelas}`}
                className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <span className="text-sm text-slate-600">
                {page} / {totalPages}
              </span>
              <Link
                href={`/dashboard/siswa?page=${page + 1}&search=${search}&status=${status}&kelas=${kelas}`}
                className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
