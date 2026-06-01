import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jenis = searchParams.get('jenis');

    const where = {
      AND: [status ? { status } : {}, jenis ? { jenisKegiatan: jenis } : {}],
    };

    const items = await prisma.kegiatan.findMany({
      where,
      orderBy: { tanggalMulai: 'desc' },
    });

    const headers = ['Nama Kegiatan', 'Jenis', 'Tanggal Mulai', 'Waktu', 'Lokasi', 'Penanggung Jawab', 'Status', 'Anggaran', 'Peserta'];

    const rows = items.map((item) => [
      item.namaKegiatan,
      item.jenisKegiatan,
      item.tanggalMulai ? item.tanggalMulai.toISOString().split('T')[0] : '-',
      item.waktuMulai ? `${item.waktuMulai} - ${item.waktuSelesai || ''}` : '-',
      item.lokasi || '-',
      item.penanggungJawab || '-',
      item.status,
      item.anggaran || '-',
      item.peserta || '-',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data-kegiatan-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal mengexport data' }, { status: 500 });
  }
}
