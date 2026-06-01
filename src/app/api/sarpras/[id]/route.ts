import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sarpras = await prisma.sarpras.findUnique({
      where: { id: parseInt(id) },
    });

    if (!sarpras) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sarpras });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.sarpras.update({
      where: { id: parseInt(id) },
      data: {
        namaBarang: body.namaBarang,
        kodeBarang: body.kodeBarang,
        kategori: body.kategori,
        merk: body.merk,
        tahunPengadaan: body.tahunPengadaan ? parseInt(body.tahunPengadaan) : null,
        jumlah: parseInt(body.jumlah),
        satuan: body.satuan,
        kondisi: body.kondisi,
        lokasi: body.lokasi,
        sumberDana: body.sumberDana,
        keterangan: body.keterangan,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengupdate data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.sarpras.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
