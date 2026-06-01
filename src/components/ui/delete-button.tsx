'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from './button'; // Assuming button component exists
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface DeleteButtonProps {
  id: number;
  endpoint: string;
  title?: string;
  className?: string;
}

export function DeleteButton({ id, endpoint, title = 'item', className }: DeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Gagal menghapus data');
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus data. Silakan coba lagi.'); // Fallback error
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)} className={cn('p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors', className)} title="Hapus">
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Modern Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop with Blur */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => !isDeleting && setIsOpen(false)} />

          {/* Modal Content */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 p-6 text-center border border-white/20">
            {/* Close Button */}
            <button onClick={() => setIsOpen(false)} disabled={isDeleting} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* Icon Wrapper */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center animate-pulse-slow">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
            </div>

            {/* Text Content */}
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Data {title}?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini <span className="font-semibold text-red-500">tidak dapat dibatalkan</span>.
            </p>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting} className="w-full justify-center border-slate-200 text-slate-700 hover:bg-slate-50 h-11 rounded-xl">
                Batal
              </Button>
              <Button type="button" onClick={handleDelete} disabled={isDeleting} isLoading={isDeleting} className="w-full justify-center bg-red-600 hover:bg-red-700 text-white h-11 rounded-xl shadow-lg shadow-red-600/20">
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
