import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const kategori = searchParams.get('kategori') || '';
    const kondisi = searchParams.get('kondisi') || '';

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [{ namaBarang: { contains: search, mode: 'insensitive' as const } }, { kodeBarang: { contains: search, mode: 'insensitive' as const } }, { lokasi: { contains: search, mode: 'insensitive' as const } }],
            }
          : {},
        kategori ? { kategori } : {},
        kondisi ? { kondisi } : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.sarpras.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sarpras.count({ where }),
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
    console.error('Error fetching sarpras:', error);
    return NextResponse.json({ error: 'Gagal mengambil data sarpras' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Simple validation
    if (!body.namaBarang || !body.kodeBarang || !body.kategori) {
      return NextResponse.json({ error: 'Data wajib belum lengkap' }, { status: 400 });
    }

    const newItem = await prisma.sarpras.create({
      data: {
        kodeBarang: body.kodeBarang,
        namaBarang: body.namaBarang,
        kategori: body.kategori,
        merk: body.merk,
        tahunPengadaan: body.tahunPengadaan ? parseInt(body.tahunPengadaan) : undefined,
        jumlah: parseInt(body.jumlah) || 1,
        satuan: body.satuan || 'unit',
        kondisi: body.kondisi || 'baik',
        lokasi: body.lokasi,
        sumberDana: body.sumberDana,
        keterangan: body.keterangan,
      },
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating sarpras:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}
