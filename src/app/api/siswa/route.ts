import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { siswaSchema } from '@/lib/validations';
import { logActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const kelas = searchParams.get('kelas') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [{ nama: { contains: search, mode: 'insensitive' as const } }, { nis: { contains: search, mode: 'insensitive' as const } }, { nisn: { contains: search, mode: 'insensitive' as const } }],
            }
          : {},
        status ? { status } : {},
        kelas ? { kelas } : {},
      ],
    };

    const [siswa, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.siswa.count({ where }),
    ]);

    return NextResponse.json({
      data: siswa,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json({ error: 'Gagal mengambil data siswa' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = siswaSchema.parse(body);

    // Check if NIS already exists
    const existingSiswa = await prisma.siswa.findUnique({
      where: { nis: validatedData.nis },
    });

    if (existingSiswa) {
      return NextResponse.json({ error: 'NIS sudah terdaftar' }, { status: 400 });
    }

    const siswa = await prisma.siswa.create({
      data: {
        ...validatedData,
        tanggalLahir: validatedData.tanggalLahir ? new Date(validatedData.tanggalLahir) : null,
      },
    });

    await logActivity('create', 'siswa', `Menambahkan siswa baru: ${siswa.nama} (${siswa.nis})`, siswa.id, {
      nis: siswa.nis,
      nama: siswa.nama,
      kelas: siswa.kelas,
    });

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error('Error creating siswa:', error);
    return NextResponse.json({ error: 'Gagal menambahkan data siswa' }, { status: 500 });
  }
}
