import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    const kondisi = searchParams.get('kondisi');

    const where = {
      AND: [kategori ? { kategori } : {}, kondisi ? { kondisi } : {}],
    };

    const items = await prisma.sarpras.findMany({
      where,
      orderBy: { namaBarang: 'asc' },
    });

    const headers = ['Kode Barang', 'Nama Barang', 'Kategori', 'Merk/Model', 'Tahun', 'Jumlah', 'Satuan', 'Kondisi', 'Lokasi', 'Sumber Dana'];

    const rows = items.map((item) => [item.kodeBarang, item.namaBarang, item.kategori, item.merk || '-', item.tahunPengadaan || '-', item.jumlah, item.satuan, item.kondisi, item.lokasi || '-', item.sumberDana || '-']);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data-sarpras-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal mengexport data' }, { status: 500 });
  }
}
