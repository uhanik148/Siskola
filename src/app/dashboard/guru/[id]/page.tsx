'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge } from '@/components/ui';
import { ArrowLeft, Edit, Trash2, FileText, Calendar, Mail, Phone, MapPin, User, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as indoLocale } from 'date-fns/locale';

interface DetailGuru {
  id: number;
  nip: string | null;
  nuptk: string | null;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  agama: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  jabatan: string | null;
  bidangStudi: string | null;
  pendidikan: string | null;
  jurusan: string | null;
  tanggalMasuk: string | null;
  statusPegawai: string;
  jenisKontrak: string | null;
  dokumen: any[];
}

export default function DetailGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<DetailGuru | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/guru/${id}`);
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      const res = await fetch(`/api/guru/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard/guru');
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Data tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/guru">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.nama}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline" className="text-primary border-primary/20">
                {data.nip || 'NIP Belum Ada'}
              </Badge>
              <span>•</span>
              <span>{data.jabatan || 'Jabatan Belum Diisi'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/guru/${data.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Kolom Kiri - Info Utama */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-lg">{data.nama.charAt(0)}</div>
            <div>
              <h2 className="font-bold text-lg">{data.nama}</h2>
              <p className="text-muted-foreground text-sm">{data.bidangStudi || '-'}</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant={data.statusPegawai === 'aktif' ? 'success' : ('secondary' as any)} className="capitalize px-4 py-1">
                {data.statusPegawai}
              </Badge>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold border-b pb-2">Kontak & Alamat</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{data.email || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{data.telepon || '-'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{data.alamat || '-'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan - Detail Tab */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Informasi Pribadi</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">{data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tempat, Tanggal Lahir</p>
                <p className="font-medium">
                  {data.tempatLahir}, {data.tanggalLahir ? format(new Date(data.tanggalLahir), 'd MMMM yyyy', { locale: indoLocale }) : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Agama</p>
                <p className="font-medium">{data.agama || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NUPTK</p>
                <p className="font-medium font-mono">{data.nuptk || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2 border-b mt-8">
              <Briefcase className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Data Kepegawaian</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-muted-foreground">Jabatan</p>
                <p className="font-medium">{data.jabatan || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NIP</p>
                <p className="font-medium font-mono">{data.nip || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bidang Studi</p>
                <p className="font-medium">{data.bidangStudi || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jenis Kontrak</p>
                <p className="font-medium">{data.jenisKontrak || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Masuk</p>
                <p className="font-medium">{data.tanggalMasuk ? format(new Date(data.tanggalMasuk), 'd MMMM yyyy', { locale: indoLocale }) : '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2 border-b mt-8">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Pendidikan</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-muted-foreground">Pendidikan Terakhir</p>
                <p className="font-medium">{data.pendidikan || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Jurusan</p>
                <p className="font-medium">{data.jurusan || '-'}</p>
              </div>
            </div>
          </Card>

          {/* Dokumen Section */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Dokumen Digital</h3>
              </div>
              <Link href="/dashboard/dokumen/scan">
                <Button size="sm" variant="ghost">
                  Upload Baru
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {data.dokumen && data.dokumen.length > 0 ? (
                data.dokumen.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded border">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.jenisDokumen}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(doc.createdAt), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 text-blue-600">
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada dokumen yang diupload</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
