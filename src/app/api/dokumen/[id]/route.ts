import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);

    const dokumen = await prisma.dokumen.findUnique({
      where: { id: documentId },
    });

    if (!dokumen) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dokumen });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat dokumen' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);
    const body = await request.json();

    // Check for file replacement
    if (body.filePath) {
      const oldDoc = await prisma.dokumen.findUnique({
        where: { id: documentId },
        select: { filePath: true },
      });

      if (oldDoc?.filePath && oldDoc.filePath !== body.filePath) {
        // Delete old file
        if (oldDoc.filePath.startsWith('http')) {
          // Vercel Blob delete... (skip implementation here if complicated import needed, but good to have)
          // For local dev focus:
        } else {
          const publicPath = path.join(process.cwd(), 'public');
          const fullPath = path.join(publicPath, oldDoc.filePath);
          try {
            await fs.unlink(fullPath);
          } catch (err) {
            console.error('Failed to delete old file system:', err);
          }
        }
      }
    }

    const updateData: any = {
      jenisDokumen: body.jenisDokumen,
      nomorDokumen: body.nomorDokumen,
      periodeArsip: body.periodeArsip,
      tanggalDokumen: body.tanggalDokumen ? new Date(body.tanggalDokumen) : null,
      keterangan: body.keterangan,
      siswaId: body.siswaId || null,
      guruId: body.guruId || null,
      fileName: body.fileName,
    };

    if (body.filePath) {
      updateData.filePath = body.filePath;
      updateData.fileSize = body.fileSize;
      updateData.fileType = body.fileType;
    }

    const dokumen = await prisma.dokumen.update({
      where: { id: documentId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: dokumen });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Gagal mengupdate dokumen' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const documentId = parseInt(id);

    // Get document first to find file path
    const dokumen = await prisma.dokumen.findUnique({
      where: { id: documentId },
    });

    if (!dokumen) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    // Delete record from DB
    await prisma.dokumen.delete({
      where: { id: documentId },
    });

    // Hybrid Delete Logic
    if (dokumen.filePath) {
      // 1. Check if it's a Vercel Blob URL (starts with https)
      if (dokumen.filePath.startsWith('http')) {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          const { del } = await import('@vercel/blob');
          await del(dokumen.filePath);
        }
      } else {
        // 2. Local File Delete
        const publicPath = path.join(process.cwd(), 'public');
        const fullPath = path.join(publicPath, dokumen.filePath);
        try {
          await fs.unlink(fullPath);
        } catch (err) {
          console.error('Failed to delete file system:', err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Gagal menghapus dokumen' }, { status: 500 });
  }
}
