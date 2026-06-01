import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const jenisDokumen = searchParams.get('jenis') || '';
    const periodeArsip = searchParams.get('periode') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { fileName: { contains: search, mode: 'insensitive' as const } },
                { keterangan: { contains: search, mode: 'insensitive' as const } },
                { siswa: { nama: { contains: search, mode: 'insensitive' as const } } },
                { guru: { nama: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {},
        jenisDokumen ? { jenisDokumen } : {},
        periodeArsip ? { periodeArsip } : {},
      ],
    };

    const [dokumen, total] = await Promise.all([
      prisma.dokumen.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          siswa: { select: { id: true, nama: true, nis: true } },
          guru: { select: { id: true, nama: true, nip: true } },
        },
      }),
      prisma.dokumen.count({ where }),
    ]);

    return NextResponse.json({
      data: dokumen,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching dokumen:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dokumen' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const dokumen = await prisma.dokumen.create({
      data: {
        jenisDokumen: body.jenisDokumen,
        nomorDokumen: body.nomorDokumen,
        periodeArsip: body.periodeArsip,
        tanggalDokumen: body.tanggalDokumen ? new Date(body.tanggalDokumen) : null,
        filePath: body.filePath,
        fileName: body.fileName,
        fileType: body.fileType,
        fileSize: body.fileSize,
        keterangan: body.keterangan,
        sumberInput: body.sumberInput || 'upload',
        siswaId: body.siswaId,
        guruId: body.guruId,
      },
    });

    return NextResponse.json(dokumen, { status: 201 });
  } catch (error) {
    console.error('Error creating dokumen:', error);
    return NextResponse.json({ error: 'Gagal menyimpan dokumen' }, { status: 500 });
  }
}
