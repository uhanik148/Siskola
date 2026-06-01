import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { logActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const kelas = searchParams.get('kelas');

    const where = {
      AND: [status ? { status } : {}, kelas ? { kelas } : {}],
    };

    const siswaList = await prisma.siswa.findMany({
      where,
      orderBy: { nama: 'asc' },
    });

    // CSV Header
    const headers = ['NIS', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Kelas', 'Status', 'Nama Ayah', 'Nama Ibu', 'Alamat'];

    // CSV Rows
    const rows = siswaList.map((siswa) => [
      siswa.nis,
      siswa.nisn || '-',
      siswa.nama,
      siswa.jenisKelamin,
      siswa.tempatLahir || '-',
      siswa.tanggalLahir ? formatDate(siswa.tanggalLahir) : '-',
      siswa.kelas || '-',
      siswa.status,
      siswa.namaAyah || '-',
      siswa.namaIbu || '-',
      siswa.alamat || '-',
    ]);

    // Combine
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    // Log this export action
    await logActivity('login', 'siswa', 'Mengunduh data siswa (Export CSV)', undefined, { count: siswaList.length });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data-siswa-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal mengexport data' }, { status: 500 });
  }
}
