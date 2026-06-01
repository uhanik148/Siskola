import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Users, Search, Plus, Filter, Eye, Edit, Download, GraduationCap } from 'lucide-react';
import { Button, Card, Badge, DeleteButton, Input } from '@/components/ui';

export default async function GuruPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const status = params.status || '';
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build Query
  const where: any = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [{ nama: { contains: search, mode: 'insensitive' } }, { nip: { contains: search, mode: 'insensitive' } }],
    });
  }

  if (status) {
    where.AND.push({ statusPegawai: status });
  }

  // Fetch Data (Parallel)
  const [data, total] = await Promise.all([
    prisma.guru.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.guru.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Helper for Status Color
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'aktif':
        return 'success';
      case 'cuti':
        return 'warning';
      case 'pensiun':
        return 'secondary';
      case 'keluar':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Guru & Staf</h1>
          <p className="text-muted-foreground">Manajemen data pendidik dan tenaga kependidikan</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/guru/export?format=csv" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/dashboard/guru/tambah">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Guru
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Simplified for Server Component */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Guru</p>
              <h3 className="text-2xl font-bold">{total}</h3>
            </div>
          </div>
        </Card>
        {/* Placeholder cards kept static for layout consistency */}
       {/* <Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Guru Aktif</p>
              <h3 className="text-2xl font-bold">-</h3>
            </div>
          </div>
        </Card>*/}
        {/*<Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wali Kelas</p>
              <h3 className="text-2xl font-bold">-</h3>
            </div>
          </div>
        </Card>*/}
        {/*<Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Staf Admin</p>
              <h3 className="text-2xl font-bold">-</h3>
            </div>
          </div>
        </Card>*/}
      </div>

      <Card className="border-none shadow-xl bg-white/60 backdrop-blur-xl">
        <div className="p-6">
          {/* Filters Form - Server Side Friendly */}
          <form className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="search" defaultValue={search} placeholder="Cari nama atau NIP..." className="pl-9 bg-white/50" />
            </div>
            <div className="w-full sm:w-[200px]">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select name="status" defaultValue={status} className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent">
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="cuti">Cuti</option>
                  <option value="pensiun">Pensiun</option>
                  <option value="keluar">Keluar</option>
                </select>
              </div>
            </div>
            <Button type="submit" variant="outline">
              Cari
            </Button>
          </form>

          <div className="rounded-xl border bg-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 font-medium">Nama / NIP</th>
                    <th className="px-6 py-3 font-medium">Jabatan</th>
                    <th className="px-6 py-3 font-medium">Pendidikan</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Tidak ada data guru ditemukan
                      </td>
                    </tr>
                  ) : (
                    data.map((guru) => (
                      <tr key={guru.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{guru.nama}</div>
                          <div className="text-xs text-muted-foreground">{guru.nip || '-'}</div>
                        </td>
                        <td className="px-6 py-4">{guru.jabatan || '-'}</td>
                        <td className="px-6 py-4">{guru.pendidikan || '-'}</td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusColor(guru.statusPegawai) as any} className="capitalize">
                            {guru.statusPegawai.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/guru/${guru.id}/edit`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <DeleteButton id={guru.id} endpoint="/api/guru" title="Guru" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} data
            </p>
            <div className="flex gap-2">
              <Link href={`?page=${page - 1}&search=${search}&status=${status}`}>
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Sebelumnya
                </Button>
              </Link>
              <Link href={`?page=${page + 1}&search=${search}&status=${status}`}>
                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                  Selanjutnya
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
