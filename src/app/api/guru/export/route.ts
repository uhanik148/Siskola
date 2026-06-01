import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {
      AND: [status ? { statusPegawai: status } : {}],
    };

    const guruList = await prisma.guru.findMany({
      where,
      orderBy: { nama: 'asc' },
    });

    const headers = ['NIP', 'Nama Lengkap', 'Jenis Kelamin', 'Jabatan', 'Status Kepegawaian', 'No HP', 'Email', 'Alamat'];

    const rows = guruList.map((guru) => [guru.nip || '-', guru.nama, guru.jenisKelamin, guru.jabatan || '-', guru.statusPegawai, guru.telepon || '-', guru.email || '-', guru.alamat || '-']);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data-guru-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal mengexport data' }, { status: 500 });
  }
}
