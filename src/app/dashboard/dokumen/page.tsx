import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDate, formatFileSize, JENIS_DOKUMEN } from '@/lib/utils';
import { Plus, Search, Filter, Eye, Download, Trash2, ChevronLeft, ChevronRight, FileText, Image, Camera, Upload, User, Edit } from 'lucide-react';
import { Button, DeleteButton, DownloadButton } from '@/components/ui';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    jenis?: string;
    periode?: string;
  }>;
}

// Type untuk dokumen dengan relasi siswa dan guru
interface DokumenWithRelations {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  siswaId: number | null;
  keterangan: string | null;
  guruId: number | null;
  jenisDokumen: string;
  nomorDokumen: string | null;
  periodeArsip: string | null;
  tanggalDokumen: Date | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  sumberInput: string;
  tags: string | null;
  siswa: { id: number; nama: string; nis: string } | null;
  guru: { id: number; nama: string; nip: string | null } | null;
}

export default async function DokumenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 10;
  const search = params.search || '';
  const jenis = params.jenis || '';
  const periode = params.periode || '';

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [{ fileName: { contains: search, mode: 'insensitive' as const } }, { keterangan: { contains: search, mode: 'insensitive' as const } }],
          }
        : {},
      jenis ? { jenisDokumen: jenis } : {},
      periode ? { periodeArsip: periode } : {},
    ],
  };

  let dokumenList: DokumenWithRelations[] = [];
  let total = 0;

  try {
    [dokumenList, total] = await Promise.all([
      prisma.dokumen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          siswa: { select: { id: true, nama: true, nis: true } },
          guru: { select: { id: true, nama: true, nip: true } },
        },
      }) as unknown as Promise<DokumenWithRelations[]>,
      prisma.dokumen.count({ where }),
    ]);
  } catch {
    // Database might not be initialized
  }

  const totalPages = Math.ceil(total / limit);

  const getJenisLabel = (value: string) => {
    return JENIS_DOKUMEN.find((j) => j.value === value)?.label || value;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dokumen & Arsip</h1>
          <p className="text-slate-500 text-sm">Kelola dokumen digital sekolah</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/dokumen/export?format=csv" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/dashboard/dokumen/scan">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Scan Dokumen
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">Total Dokumen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{dokumenList.filter((d) => d.sumberInput === 'upload').length}</p>
              <p className="text-xs text-slate-500">Via Upload</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{dokumenList.filter((d) => d.sumberInput === 'kamera').length}</p>
              <p className="text-xs text-slate-500">Via Kamera</p>
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
              placeholder="Cari nama file atau keterangan..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select name="jenis" defaultValue={jenis} className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="">Semua Jenis</option>
            {JENIS_DOKUMEN.map((j) => (
              <option key={j.value} value={j.value}>
                {j.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="periode"
            defaultValue={periode}
            placeholder="Periode (2024/2025)"
            className="h-10 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-40"
          />
          <Button type="submit" variant="outline" size="default">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </form>
      </div>

      {/* Document Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dokumenList.length > 0 ? (
          dokumenList.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-video bg-slate-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {doc.fileType.startsWith('image/') ? <img src={doc.filePath} alt={doc.fileName} className="w-full h-full object-cover" /> : getFileIcon(doc.fileType)}
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-900 truncate flex-1" title={doc.fileName}>
                    {doc.fileName}
                  </h3>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${doc.sumberInput === 'kamera' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {doc.sumberInput === 'kamera' ? 'Kamera' : 'Upload'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{getJenisLabel(doc.jenisDokumen)}</span>
                  {doc.periodeArsip && <span className="text-xs">{doc.periodeArsip}</span>}
                </div>

                {/* Linked Entity */}
                {(doc.siswa || doc.guru) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">{doc.siswa ? doc.siswa.nama : doc.guru?.nama}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-slate-50 text-slate-600 text-sm transition-colors">
                  <Eye className="w-4 h-4" />
                  Lihat
                </a>
                <DownloadButton url={doc.filePath} filename={doc.fileName} className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg hover:bg-slate-50 text-slate-600 text-sm transition-colors" label="Unduh" />
                <Link href={`/dashboard/dokumen/${doc.id}/edit`}>
                  <button className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Metadata">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <DeleteButton id={doc.id} endpoint="/api/dokumen" title="Dokumen" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="mb-2">Belum ada dokumen</p>
            <Link href="/dashboard/dokumen/scan" className="text-blue-600 hover:underline text-sm">
              Scan dokumen pertama
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-sm text-slate-500">
            Menampilkan {skip + 1} - {Math.min(skip + limit, total)} dari {total} dokumen
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/dokumen?page=${page - 1}&search=${search}&jenis=${jenis}&periode=${periode}`}
              className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm text-slate-600">
              {page} / {totalPages}
            </span>
            <Link
              href={`/dashboard/dokumen?page=${page + 1}&search=${search}&jenis=${jenis}&periode=${periode}`}
              className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
