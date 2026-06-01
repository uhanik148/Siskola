import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Search, Plus, Filter, Edit, Download, MapPin, Clock } from 'lucide-react';
import { Button, Card, Badge, DeleteButton, Input, DownloadButton } from '@/components/ui';
import NextImage from 'next/image';

const JENIS_KEGIATAN = ['upacara', 'lomba', 'rapat', 'pelatihan', 'ekstrakurikuler', 'sosialisasi', 'lainnya'];

export default async function KegiatanPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; jenis?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const statusFilter = params.status || '';
  const jenisFilter = params.jenis || '';
  const limit = 9; // Grid 3x3
  const skip = (page - 1) * limit;

  // Build Query
  const where: any = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      namaKegiatan: { contains: search, mode: 'insensitive' },
    });
  }

  if (statusFilter) {
    where.AND.push({ status: statusFilter });
  }

  if (jenisFilter) {
    where.AND.push({ jenisKegiatan: jenisFilter });
  }

  // Fetch Data
  const [data, total] = await Promise.all([
    prisma.kegiatan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { tanggalMulai: 'desc' },
    }),
    prisma.kegiatan.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Helper colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terjadwal':
        return 'default'; // blue-ish usually default badge
      case 'berlangsung':
        return 'warning';
      case 'selesai':
        return 'success';
      case 'dibatalkan':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kegiatan Sekolah</h1>
          <p className="text-slate-500 text-sm">Jadwal agenda dan dokumentasi kegiatan</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/kegiatan/export?format=csv&status=${statusFilter}&jenis=${jenisFilter}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/dashboard/kegiatan/tambah">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Buat Kegiatan
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {/* Filters Form */}
        <form className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input name="search" defaultValue={search} placeholder="Cari nama kegiatan..." className="pl-10" />
          </div>
          <select name="jenis" defaultValue={jenisFilter} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white capitalize w-full lg:w-40">
            <option value="">Semua Jenis</option>
            {JENIS_KEGIATAN.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={statusFilter} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white w-full lg:w-40">
            <option value="">Semua Status</option>
            <option value="terjadwal">Terjadwal</option>
            <option value="berlangsung">Berlangsung</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
          <Button type="submit" variant="outline">
            Terapkan
          </Button>
        </form>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Belum ada kegiatan terjadwal</p>
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow relative group flex flex-col h-full overflow-hidden">
                {/* Foto Kegiatan Section */}
                {item.foto ? (
                  <div className="relative w-full aspect-video bg-slate-100">
                    <NextImage src={item.foto} alt={item.namaKegiatan} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DownloadButton url={item.foto} filename={item.fotoName || `${item.namaKegiatan}.png`} className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-slate-700 hover:text-blue-600 transition-colors" label="" />
                    </div>
                  </div>
                ) : null}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={item.jenisKegiatan === 'lomba' ? 'warning' : 'secondary'} className="capitalize border-none">
                      {item.jenisKegiatan}
                    </Badge>
                    <Badge variant={getStatusColor(item.status) as any} className="capitalize">
                      {item.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2">{item.namaKegiatan}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.lokasi || 'Lokasi belum ditentukan'}
                  </p>

                  <div className="space-y-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg mt-auto">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium">{format(new Date(item.tanggalMulai), 'dd MMMM yyyy', { locale: id })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>
                        {item.waktuMulai || '--:--'}
                        {item.waktuSelesai ? ` - ${item.waktuSelesai}` : ''} WIB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <span className="text-xs text-slate-400 truncate max-w-[120px]" title={item.penanggungJawab || ''}>
                      PJ: {item.penanggungJawab || '-'}
                    </span>
                    <div className="flex gap-1">
                      <Link href={`/dashboard/kegiatan/${item.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteButton id={item.id} endpoint="/api/kegiatan" title="Kegiatan" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Hal {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Link href={`?page=${page - 1}&search=${search}&status=${statusFilter}&jenis=${jenisFilter}`}>
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Sebelumnya
                </Button>
              </Link>
              <Link href={`?page=${page + 1}&search=${search}&status=${statusFilter}&jenis=${jenisFilter}`}>
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
