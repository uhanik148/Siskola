'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Search, User, Mail, Shield, Trash2, Key, Edit, X, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Admin {
  id: number;
  username: string;
  nama: string;
  email: string | null;
  role: string;
  createdAt: string;
}

export default function AdminManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleWarningOpen, setIsRoleWarningOpen] = useState(false); // Separate warning if strictly needed, but inline is better.

  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    email: '',
    role: 'admin',
  });

  const [resetPasswordValue, setResetPasswordValue] = useState('');

  // Fetch Admins
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.data);
      } else {
        if (res.status === 403) {
          toast.error('Akses Ditolak: Hanya Super Admin yang bisa mengakses halaman ini.');
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to fetch admins', error);
      toast.error('Gagal memuat data admin');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAdmins();
    }
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.warning('Password minimal 6 karakter');

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ username: '', password: '', nama: '', email: '', role: 'admin' });
        fetchAdmins();
        toast.success('Admin baru berhasil dibuat');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal membuat admin');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedAdmin(null);
        fetchAdmins();
        toast.success('Data admin berhasil diperbarui');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal update admin');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat update data');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    if (resetPasswordValue.length < 6) return toast.warning('Password minimal 6 karakter');

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/${selectedAdmin.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPasswordValue }),
      });

      if (res.ok) {
        setIsResetModalOpen(false);
        setResetPasswordValue('');
        setSelectedAdmin(null);
        toast.success('Password user berhasil direset!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal reset password');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/${selectedAdmin.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedAdmin(null);
        fetchAdmins();
        toast.success('Admin berhasil dihapus');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Gagal menghapus admin');
      }
    } catch (error) {
      toast.error('Gagal menghapus admin');
    } finally {
      setIsActionLoading(false);
    }
  };

  const openDeleteModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const filteredAdmins = admins.filter((admin) => admin.nama.toLowerCase().includes(searchQuery.toLowerCase()) || admin.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Admin</h1>
          <p className="text-slate-500 text-sm">Kelola pengguna yang memiliki akses ke dashboard sistem.</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ username: '', password: '', nama: '', email: '', role: 'admin' });
            setIsAddModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Admin
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Cari nama atau username..." className="pl-9 max-w-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Admins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading Skeleton
            [1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>)
          ) : filteredAdmins.length === 0 ? (
            <div className="col-span-full text-center py-10 text-slate-500">Tidak ada admin ditemukan.</div>
          ) : (
            filteredAdmins.map((admin) => (
              <Card key={admin.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm ${admin.role === 'super_admin' ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                        {admin.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{admin.nama}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">@{admin.username}</p>
                      </div>
                    </div>
                    <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'} className={admin.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200' : ''}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'operator'}
                    </Badge>
                  </div>

                  <div className="px-6 pb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{admin.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="capitalize">{admin.role.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                      title="Edit Data"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setFormData({
                          username: admin.username,
                          password: '',
                          nama: admin.nama,
                          email: admin.email || '',
                          role: admin.role,
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-orange-600"
                      title="Reset Password"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setResetPasswordValue('');
                        setIsResetModalOpen(true);
                      }}
                    >
                      <Lock className="w-4 h-4" />
                    </Button>
                    {admin.id.toString() !== session?.user?.id && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600" title="Hapus Admin" onClick={() => openDeleteModal(admin)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* ADD ADMIN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-lg">Tambah Admin Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Budi Santoso" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="budi123" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">Operator (Biasa)</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email (Opsional)</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@sekolah.sch.id" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Awal</label>
                <Input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimal 6 karakter" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isActionLoading} className="bg-indigo-600 hover:bg-indigo-700">
                  {isActionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-lg">Edit Data Admin</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Operator (Biasa)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {selectedAdmin?.role === 'super_admin' && formData.role !== 'super_admin' && (
                  <p className="text-xs text-orange-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Peringatan: Anda akan menurunkan hak akses user ini.
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isActionLoading} className="bg-indigo-600 hover:bg-indigo-700">
                  {isActionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" /> Reset Password
              </h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-800 text-sm rounded-lg border border-indigo-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Anda sedang mereset password untuk admin <strong className="font-semibold">{selectedAdmin?.nama}</strong>. Pastikan password baru segera dicatat.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <Input type="password" required minLength={6} value={resetPasswordValue} onChange={(e) => setResetPasswordValue(e.target.value)} placeholder="Masukkan password baru" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsResetModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isActionLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isActionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Proses Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Admin?</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Anda yakin ingin menghapus <strong>{selectedAdmin?.nama}</strong>?
                  {selectedAdmin?.role === 'super_admin' && <span className="block mt-2 text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">Peringatan: User ini adalah SUPER ADMIN.</span>}
                  <br />
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Batal
                </Button>
                <Button variant="destructive" disabled={isActionLoading} onClick={handleDelete}>
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus Permanen'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
