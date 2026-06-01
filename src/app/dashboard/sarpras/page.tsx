import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Package, Search, Plus, Filter, Edit, Download, Box, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Card, Badge, DeleteButton, Input } from '@/components/ui';

const KATEGORI_OPTIONS = ['Meubelair', 'Elektronik', 'Alat Tulis', 'Buku', 'Alat Peraga', 'Kendaraan', 'Perlengkapan Kebersihan', 'Lainnya'];

export default async function SarprasPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; kategori?: string; kondisi?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const kategoriFilter = params.kategori || '';
  const kondisiFilter = params.kondisi || '';
  const limit = 10;
  const skip = (page - 1) * limit;

  // Query Building
  const where: any = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [{ namaBarang: { contains: search, mode: 'insensitive' } }, { kodeBarang: { contains: search, mode: 'insensitive' } }, { lokasi: { contains: search, mode: 'insensitive' } }],
    });
  }

  if (kategoriFilter) {
    where.AND.push({ kategori: kategoriFilter });
  }

  if (kondisiFilter) {
    where.AND.push({ kondisi: kondisiFilter });
  }

  // Fetch Data
  const [data, total] = await Promise.all([
    prisma.sarpras.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.sarpras.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Helper Functions
  const getKondisiColor = (kondisi: string) => {
    switch (kondisi.toLowerCase()) {
      case 'baik':
        return 'success';
      case 'rusak_ringan':
        return 'warning';
      case 'rusak_berat':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatKondisi = (str: string) => {
    return str.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sarana & Prasarana</h1>
          <p className="text-slate-500 text-sm">Manajemen inventaris dan aset sekolah</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/sarpras/export?format=csv&kategori=${kategoriFilter}&kondisi=${kondisiFilter}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/dashboard/sarpras/tambah">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Barang
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats - Example static stats for layout consistency */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-indigo-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Aset</p>
              <h3 className="text-2xl font-bold text-slate-900">{total}</h3>
            </div>
          </div>
        </Card>
        {/* Placeholder cards */}
        {/* <Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-green-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Kondisi Bauk</p>
              <h3 className="text-2xl font-bold text-slate-900">-</h3>
            </div>
          </div>
        </Card> */}
        {/* <Card className="p-4 bg-white border border-slate-100 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Rusak Ringan</p>
              <h3 className="text-2xl font-bold text-slate-900">-</h3>
            </div>
          </div>
        </Card> */}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {/* Filters Form */}
        <form className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input name="search" defaultValue={search} placeholder="Cari nama barang, kode, atau lokasi..." className="pl-10" />
          </div>
          <select name="kategori" defaultValue={kategoriFilter} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white w-full lg:w-40">
            <option value="">Semua Kategori</option>
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select name="kondisi" defaultValue={kondisiFilter} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white w-full lg:w-40">
            <option value="">Semua Kondisi</option>
            <option value="baik">Baik</option>
            <option value="rusak_ringan">Rusak Ringan</option>
            <option value="rusak_berat">Rusak Berat</option>
          </select>
          <Button type="submit" variant="outline">
            Cari
          </Button>
        </form>

        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Kode / Nama Barang</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Merk</th>
                  <th className="px-6 py-3">Jumlah</th>
                  <th className="px-6 py-3">Lokasi</th>
                  <th className="px-6 py-3">Kondisi</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <Box className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Belum ada data inventaris</p>
                      <Link href="/dashboard/sarpras/tambah" className="text-indigo-600 hover:underline mt-2 inline-block">
                        Tambah Barang Baru
                      </Link>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.namaBarang}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{item.kodeBarang}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.kategori}</td>
                      <td className="px-6 py-4 text-slate-600">{item.merk || '-'}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {item.jumlah} <span className="text-xs text-slate-500 font-normal">{item.satuan}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.lokasi || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getKondisiColor(item.kondisi) as any}>{formatKondisi(item.kondisi)}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/sarpras/${item.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteButton id={item.id} endpoint="/api/sarpras" title="Barang" />
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Hal {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Link href={`?page=${page - 1}&search=${search}&kategori=${kategoriFilter}&kondisi=${kondisiFilter}`}>
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Sebelumnya
                </Button>
              </Link>
              <Link href={`?page=${page + 1}&search=${search}&kategori=${kategoriFilter}&kondisi=${kondisiFilter}`}>
                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                  Selanjutnya
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
