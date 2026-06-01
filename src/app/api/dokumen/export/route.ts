import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils'; // Make sure utils has formatDate or just use toISO

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get('jenis');
    const periode = searchParams.get('periode');
    const search = searchParams.get('search');

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

    const dokumenList = await prisma.dokumen.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        siswa: { select: { nama: true } },
        guru: { select: { nama: true } },
      },
    });

    const headers = ['Jenis Dokumen', 'Nomor Dokumen', 'Nama File', 'Periode', 'Tanggal Dokumen', 'Keterangan', 'Terkait Dengan', 'Sumber Input'];

    const rows = dokumenList.map((doc) => [
      doc.jenisDokumen,
      doc.nomorDokumen || '-',
      doc.fileName,
      doc.periodeArsip || '-',
      doc.tanggalDokumen ? doc.tanggalDokumen.toISOString().split('T')[0] : '-',
      doc.keterangan || '-',
      doc.siswa ? `Siswa: ${doc.siswa.nama}` : doc.guru ? `Guru: ${doc.guru.nama}` : '-',
      doc.sumberInput,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data-dokumen-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal mengexport data' }, { status: 500 });
  }
}
