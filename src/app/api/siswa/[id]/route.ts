import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { siswaSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const siswa = await prisma.siswa.findUnique({
      where: { id: parseInt(id) },
      include: {
        presensi: {
          take: 10,
          orderBy: { tanggal: 'desc' },
        },
        nilaiRapor: {
          orderBy: { tahunAjaran: 'desc' },
        },
        dokumen: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(siswa);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json({ error: 'Gagal mengambil data siswa' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = siswaSchema.parse(body);

    const siswa = await prisma.siswa.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        tanggalLahir: validatedData.tanggalLahir ? new Date(validatedData.tanggalLahir) : null,
      },
    });

    return NextResponse.json(siswa);
  } catch (error) {
    console.error('Error updating siswa:', error);
    return NextResponse.json({ error: 'Gagal mengupdate data siswa' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.siswa.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting siswa:', error);
    return NextResponse.json({ error: 'Gagal menghapus data siswa' }, { status: 500 });
  }
}
