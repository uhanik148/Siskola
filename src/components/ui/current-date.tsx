'use client';

import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CurrentDate() {
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, []);

  if (!date) return null; // Render nothing on server/initial mount to allow hydration

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
      <Calendar className="w-4 h-4" />
      {date}
    </div>
  );
}
