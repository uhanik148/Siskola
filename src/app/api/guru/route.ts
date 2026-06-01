import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { guruSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [{ nama: { contains: search, mode: 'insensitive' as const } }, { nip: { contains: search, mode: 'insensitive' as const } }],
            }
          : {},
        status ? { statusPegawai: status } : {},
      ],
    };

    const [guru, total] = await Promise.all([
      prisma.guru.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.guru.count({ where }),
    ]);

    return NextResponse.json({
      data: guru,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching guru:', error);
    return NextResponse.json({ error: 'Gagal mengambil data guru' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = guruSchema.parse(body);

    const guru = await prisma.guru.create({
      data: {
        ...validatedData,
        tanggalLahir: validatedData.tanggalLahir ? new Date(validatedData.tanggalLahir) : null,
        tanggalMasuk: validatedData.tanggalMasuk ? new Date(validatedData.tanggalMasuk) : null,
      },
    });

    return NextResponse.json(guru, { status: 201 });
  } catch (error) {
    console.error('Error creating guru:', error);
    return NextResponse.json({ error: 'Gagal menambahkan data guru' }, { status: 500 });
  }
}
