'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, GraduationCap, Package, Calendar, FileText, BarChart3, LogOut, Menu, X, ChevronDown, Bell, User, ScanLine, Search, Shield, Code2, Mail, Phone, ExternalLink } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { toast } from 'sonner';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Data Siswa',
    href: '/dashboard/siswa',
    icon: GraduationCap,
  },
  {
    title: 'Data Guru & Staf',
    href: '/dashboard/guru',
    icon: Users,
  },
  {
    title: 'Sarana Prasarana',
    href: '/dashboard/sarpras',
    icon: Package,
  },
  {
    title: 'Kegiatan Sekolah',
    href: '/dashboard/kegiatan',
    icon: Calendar,
  },
  {
    title: 'Arsip & Dokumen',
    href: '/dashboard/dokumen',
    icon: FileText,
  },
  {
    title: 'Laporan & Rekap',
    href: '/dashboard/laporan',
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile Overlay */}
      <div className={cn('fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={() => setIsOpen(false)} />

      {/* Sidebar */}
      <aside className={cn('fixed top-0 left-0 z-50 h-screen w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col', isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-white leading-none mb-1">{APP_CONFIG.name}</h1>
              <span className="text-[10px] text-indigo-200 font-medium px-1.5 py-0.5 rounded bg-indigo-900/50 w-fit">Arsip Digital</span>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation - Scrollable */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="px-3 pb-2 pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modul Utama</p>
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/') && item.href !== '/dashboard/dokumen'); // Specialized check
            // Fix active state logic: /dashboard/dokumen/scan shouldn't activate /dashboard/dokumen if both are in menu, but here they are separate items.
            // Actually, best to exact match for scan.

            const isScan = item.href === '/dashboard/dokumen/scan';
            const isDokumen = item.href === '/dashboard/dokumen';

            let active = false;
            if (item.href === '/dashboard') {
              active = pathname === '/dashboard';
            } else if (isScan) {
              active = pathname === '/dashboard/dokumen/scan';
            } else if (isDokumen) {
              active = pathname.startsWith('/dashboard/dokumen') && pathname !== '/dashboard/dokumen/scan';
            } else {
              active = pathname.startsWith(item.href);
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-slate-800',
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-colors', active ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
                <span>{item.title}</span>
              </Link>
            );
          })}

          {/* Super Admin Menu */}
          {(session?.user as any)?.role === 'super_admin' && (
            <div className="mt-4 px-3">
              <div className="px-3 pb-2 pt-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengaturan</p>
              </div>
              <Link
                href="/dashboard/pengaturan/admin"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  pathname.startsWith('/dashboard/pengaturan') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-slate-800',
                )}
              >
                <Shield className={cn('w-5 h-5 flex-shrink-0 transition-colors', pathname.startsWith('/dashboard/pengaturan') ? 'text-white' : 'text-slate-500 group-hover:text-white')} />
                <span>Manajemen Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile - Fixed at bottom */}
        <div className="p-3 border-t border-slate-800 flex-shrink-0 bg-slate-900">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-inner">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400 truncate">Online</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0" title="Keluar Sistem">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="p-3 border-t border-slate-800/50 flex-shrink-0 bg-gradient-to-t from-slate-950 to-slate-900">
          <div className="px-2 py-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Code2 className="w-3 h-3 text-indigo-400" />
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Developer</p>
            </div>
            <p className="text-xs font-medium text-slate-300 mb-2">TK Dharma Wanita Karangsono</p>
            <div className="flex items-center gap-1.5">
              <a
                href="mailto:uhanik420@gmail.com"
                title="Email Developer"
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 transition-all text-[10px]"
              >
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </a>
              <a
                href="https://wa.me/6285785491116"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Developer"
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-emerald-600/20 border border-slate-700/50 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 transition-all text-[10px]"
              >
                <Phone className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(true)} className="fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white lg:hidden shadow-lg">
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}

export function Header() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-trigger')) {
        setIsProfileOpen(false);
      }
      if (!target.closest('.notif-dropdown') && !target.closest('.notif-trigger')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch notifications when opening
  useEffect(() => {
    if (isNotifOpen) {
      fetch('/api/activity-log/recent')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.data);
            setHasUnread(false); // Reset badge when opened
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isNotifOpen]);

  // Initial check (mock) or could use polling
  // For now, we always show a red dot on first load to encourage clicking
  useEffect(() => {
    setHasUnread(true);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {/* Spacer for mobile menu button */}
        <div className="w-12 lg:hidden" />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="notif-trigger relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="notif-dropdown absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-slate-900">Aktivitas Terbaru</h3>
                <Link href="/dashboard/laporan" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Lihat Semua
                </Link>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">Belum ada aktivitas.</div>
                ) : (
                  notifications.map((log: any) => (
                    <div key={log.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${log.action === 'create' ? 'bg-green-500' : log.action === 'delete' ? 'bg-red-500' : log.action === 'update' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-0.5">
                          <span className="font-medium text-slate-700">{log.admin?.nama || 'System'}</span> • {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-slate-800 line-clamp-2">{log.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        <div className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="profile-trigger flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 overflow-hidden">
              {/* Placeholder Avatar or Initials */}
              <span className="font-bold text-indigo-700 text-sm">{session?.user?.name?.substring(0, 2).toUpperCase() || 'AD'}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-none">{session?.user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{(session?.user as any)?.role?.replace('_', ' ') || 'Petugas'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="profile-dropdown absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => toast.info('Fitur Edit Profil akan segera hadir!', { description: 'Saat ini Anda belum bisa mengubah data diri sendiri.' })}
                  className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" /> Edit Profil
                </button>
                {/* Only Super Admin sees Settings link here too */}
                {(session?.user as any)?.role === 'super_admin' && (
                  <Link
                    href="/dashboard/pengaturan/admin"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Shield className="w-4 h-4" /> Pengaturan Admin
                  </Link>
                )}
                <hr className="my-1 border-slate-100" />
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
