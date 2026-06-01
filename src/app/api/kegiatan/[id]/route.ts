import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.kegiatan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const idInt = parseInt(id);

    // 1. Cek & Hapus File Lama jika ada update Foto
    if (body.foto) {
      const oldData = await prisma.kegiatan.findUnique({
        where: { id: idInt },
        select: { foto: true },
      });

      if (oldData?.foto && oldData.foto !== body.foto) {
        // Hapus file lama dari local storage
        if (!oldData.foto.startsWith('http')) {
          const absolutePath = path.join(process.cwd(), 'public', oldData.foto);
          try {
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath);
            }
          } catch (err) {
            console.error('Gagal menghapus file lama:', err);
          }
        }
      }
    }

    const updated = await prisma.kegiatan.update({
      where: { id: idInt },
      data: {
        namaKegiatan: body.namaKegiatan,
        jenisKegiatan: body.jenisKegiatan,
        tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : undefined,
        tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
        waktuMulai: body.waktuMulai,
        waktuSelesai: body.waktuSelesai,
        lokasi: body.lokasi,
        penanggungJawab: body.penanggungJawab,
        peserta: body.peserta,
        jumlahPeserta: body.jumlahPeserta && !isNaN(parseInt(body.jumlahPeserta)) ? parseInt(body.jumlahPeserta) : null,
        anggaran: body.anggaran && !isNaN(parseFloat(body.anggaran)) ? parseFloat(body.anggaran) : null,
        deskripsi: body.deskripsi,
        status: body.status,
        foto: body.foto, // Update field foto
        fotoName: body.fotoName, // Update field fotoName
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
    const idInt = parseInt(id);

    // Hapus foto sebelum hapus record
    const data = await prisma.kegiatan.findUnique({
      where: { id: idInt },
      select: { foto: true },
    });

    if (data?.foto && !data.foto.startsWith('http')) {
      const absolutePath = path.join(process.cwd(), 'public', data.foto);
      try {
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (err) {
        console.error('Gagal menghapus file saat delete:', err);
      }
    }

    await prisma.kegiatan.delete({
      where: { id: idInt },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
