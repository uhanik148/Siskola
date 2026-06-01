import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { guruSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const guru = await prisma.guru.findUnique({
      where: { id: parseInt(id) },
      include: {
        presensi: {
          take: 5,
          orderBy: { tanggal: 'desc' },
        },
        dokumen: true,
      },
    });

    if (!guru) {
      return NextResponse.json({ error: 'Data guru tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error fetching guru detail:', error);
    return NextResponse.json({ error: 'Gagal mengambil data guru' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = guruSchema.parse(body);

    // Update data
    const guru = await prisma.guru.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        tanggalLahir: validatedData.tanggalLahir ? new Date(validatedData.tanggalLahir) : null,
        tanggalMasuk: validatedData.tanggalMasuk ? new Date(validatedData.tanggalMasuk) : null,
      },
    });

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error updating guru:', error);
    return NextResponse.json({ error: 'Gagal mengupdate data guru' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.guru.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Data guru berhasil dihapus' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting guru:', error);
    return NextResponse.json({ error: 'Gagal menghapus data guru' }, { status: 500 });
  }
}
