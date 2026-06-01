import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

import { APP_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: ['arsip digital', 'kependidikan', 'sekolah', 'siswa', 'guru', 'manajemen'],
  authors: [{ name: `${APP_CONFIG.name} Team` }],
  openGraph: {
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
