'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
  url: string;
  filename: string;
  className?: string;
  label?: React.ReactNode;
}

export function DownloadButton({ url, filename, className, label = 'Unduh' }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Helper untuk convert WebP kembali ke format asli (PNG/JPG)
  const convertBlob = async (blob: Blob, targetExt: string): Promise<Blob> => {
    return new Promise((resolve) => {
      // Jika bukan WebP atau targetnya aneh, jangan convert
      if (blob.type !== 'image/webp' || !['png', 'jpg', 'jpeg'].includes(targetExt)) {
        return resolve(blob);
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(blob);

        // Handle background untuk JPG (WebP transparan jadi hitam kalau JPG, kita buat putih)
        let mimeType = 'image/png';
        if (targetExt === 'jpg' || targetExt === 'jpeg') {
          mimeType = 'image/jpeg';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        // Convert
        canvas.toBlob(
          (newBlob) => {
            resolve(newBlob || blob);
          },
          mimeType,
          0.9,
        );
      };

      img.onerror = () => resolve(blob); // Fallback jika gagal load image
      img.src = URL.createObjectURL(blob);
    });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    // Jika file URL lokal/relative, tidak perlu fetch cross-origin komplek
    // Tapi jika Blob URL, perlu fetch.

    try {
      setLoadingText('Mengunduh...');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Gagal mengunduh file');

      const blob = await response.blob();

      // Deteksi ekstensi target dari filename (misal "foto.png")
      const ext = filename.split('.').pop()?.toLowerCase() || '';

      // Jika file aslinya WebP (dari server) tapi nama filenya PNG/JPG (dari DB), lakukan konversi balik
      let finalBlob = blob;
      if (blob.type === 'image/webp' && ['png', 'jpg', 'jpeg'].includes(ext)) {
        setLoadingText('Memproses...');
        finalBlob = await convertBlob(blob, ext);
      }

      const blobUrl = window.URL.createObjectURL(finalBlob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename; // Browser akan menyimpan dengan nama & ekstensi ini
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading} className={className} title={`Download ${filename}`}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? loadingText || 'Proses...' : label}
    </button>
  );
}
