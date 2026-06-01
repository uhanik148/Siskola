import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const jenis = searchParams.get('jenis') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [{ namaKegiatan: { contains: search, mode: 'insensitive' as const } }, { lokasi: { contains: search, mode: 'insensitive' as const } }, { penanggungJawab: { contains: search, mode: 'insensitive' as const } }],
            }
          : {},
        status ? { status } : {},
        jenis ? { jenisKegiatan: jenis } : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.kegiatan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalMulai: 'desc' },
      }),
      prisma.kegiatan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kegiatan' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.namaKegiatan || !body.tanggalMulai) {
      return NextResponse.json({ error: 'Nama dan Tanggal Mulai wajib diisi' }, { status: 400 });
    }

    const newActivity = await prisma.kegiatan.create({
      data: {
        namaKegiatan: body.namaKegiatan,
        jenisKegiatan: body.jenisKegiatan,
        tanggalMulai: new Date(body.tanggalMulai),
        tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
        waktuMulai: body.waktuMulai,
        waktuSelesai: body.waktuSelesai,
        lokasi: body.lokasi,
        penanggungJawab: body.penanggungJawab,
        peserta: body.peserta,
        jumlahPeserta: body.jumlahPeserta && !isNaN(parseInt(body.jumlahPeserta)) ? parseInt(body.jumlahPeserta) : null,
        anggaran: body.anggaran && !isNaN(parseFloat(body.anggaran)) ? parseFloat(body.anggaran) : null,
        deskripsi: body.deskripsi,
        status: body.status || 'terjadwal',
        foto: body.foto || null,
        fotoName: body.fotoName || null,
      },
    });

    return NextResponse.json({ success: true, data: newActivity }, { status: 201 });
  } catch (error) {
    console.error('Error creating kegiatan:', error);
    return NextResponse.json({ error: 'Gagal menyimpan kegiatan' }, { status: 500 });
  }
}
