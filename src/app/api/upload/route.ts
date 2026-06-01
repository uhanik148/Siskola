import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { put } from '@vercel/blob';
import sharp from 'sharp';

const UPLOAD_DIR = './public/uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'documents';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, PDF' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 5MB' }, { status: 400 });
    }

    // Generate unique filename components
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);

    // Initial Conversion Logic variables
    let fileName: string;
    let finalBuffer: Buffer;
    let finalFileType: string;

    // Convert file to buffer first
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- Image Processing (Convert to WebP) ---
    // Logika: Jika gambar (bukan PDF), paksa convert ke WebP
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      try {
        finalBuffer = await sharp(buffer)
          .webp({ quality: 80, effort: 3 }) // Quality 80 is sweet spot
          .toBuffer();

        fileName = `${timestamp}-${randomStr}.webp`;
        finalFileType = 'image/webp';
      } catch (err) {
        console.error('Sharp conversion failed, falling back to original:', err);
        // Fallback to original if Sharp fails
        finalBuffer = buffer;
        const extension = file.name.split('.').pop() || 'bin';
        fileName = `${timestamp}-${randomStr}.${extension}`;
        finalFileType = file.type;
      }
    } else {
      // PDF or GIF - Keep Original
      const extension = file.name.split('.').pop() || 'bin';
      fileName = `${timestamp}-${randomStr}.${extension}`;
      finalBuffer = buffer;
      finalFileType = file.type;
    }

    // --- Hybrid Storage Logic ---
    let publicPath = '';

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // 1. Upload to Vercel Blob (Production)
      const blob = await put(`${folder}/${fileName}`, finalBuffer, {
        access: 'public',
        contentType: finalFileType,
      });
      publicPath = blob.url; // Use Absolute BLOB URL
    } else {
      // 2. Upload to Local Filesystem (Development)
      const uploadPath = path.join(UPLOAD_DIR, folder);
      if (!existsSync(uploadPath)) {
        await mkdir(uploadPath, { recursive: true });
      }

      const filePath = path.join(uploadPath, fileName);
      await writeFile(filePath, finalBuffer);
      publicPath = `/uploads/${folder}/${fileName}`; // Use Relative Local URL
    }

    return NextResponse.json({
      success: true,
      fileName: fileName,
      originalName: file.name,
      filePath: publicPath,
      fileType: finalFileType,
      fileSize: finalBuffer.length, // Ukuran setelah kompresi
      storageType: process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'local',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 });
  }
}
