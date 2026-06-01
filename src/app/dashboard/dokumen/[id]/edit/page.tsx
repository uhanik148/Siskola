'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, FileText, User, Tag, Eye, Hash, ChevronDown, UploadCloud } from 'lucide-react';
import { Button, DatePicker, DeleteButton } from '@/components/ui';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import { JENIS_DOKUMEN } from '@/lib/utils';
import { format } from 'date-fns';

interface Entity {
  id: number;
  nama: string;
  nis?: string;
  nip?: string;
}

export default function EditDokumenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Document Data State
  const [existingFileKey, setExistingFileKey] = useState<{ path: string; name: string; type: string } | null>(null);
  const [fileName, setFileName] = useState('');

  // New File State
  const [newFile, setNewFile] = useState<{ file: File; previewUrl: string } | null>(null);

  // Form state
  const [jenisDokumen, setJenisDokumen] = useState('');
  const [nomorDokumen, setNomorDokumen] = useState('');
  const [periodeArsip, setPeriodeArsip] = useState('');
  const [tanggalDokumen, setTanggalDokumen] = useState<string>('');
  const [keterangan, setKeterangan] = useState('');
  const [entityType, setEntityType] = useState<'none' | 'siswa' | 'guru'>('none');
  const [entityId, setEntityId] = useState<number | null>(null);

  // Entity lists
  const [siswaList, setSiswaList] = useState<Entity[]>([]);
  const [guruList, setGuruList] = useState<Entity[]>([]);

  // Fetch Initial Data
  useEffect(() => {
    const initData = async () => {
      try {
        const [docRes, siswaRes, guruRes] = await Promise.all([fetch(`/api/dokumen/${id}`, { method: 'GET' }), fetch('/api/siswa?limit=100'), fetch('/api/guru?limit=100')]);

        if (siswaRes.ok) {
          const data = await siswaRes.json();
          setSiswaList(data.data || []);
        }
        if (guruRes.ok) {
          const data = await guruRes.json();
          setGuruList(data.data || []);
        }

        if (docRes.ok) {
          const result = await docRes.json();
          const doc = result.data;

          setJenisDokumen(doc.jenisDokumen);
          setNomorDokumen(doc.nomorDokumen || '');
          setPeriodeArsip(doc.periodeArsip || '');
          setTanggalDokumen(doc.tanggalDokumen ? format(new Date(doc.tanggalDokumen), 'yyyy-MM-dd') : '');
          setKeterangan(doc.keterangan || '');
          setFileName(doc.fileName);

          if (doc.siswaId) {
            setEntityType('siswa');
            setEntityId(doc.siswaId);
          } else if (doc.guruId) {
            setEntityType('guru');
            setEntityId(doc.guruId);
          } else {
            setEntityType('none');
          }

          setExistingFileKey({
            path: doc.filePath,
            name: doc.fileName,
            type: doc.fileType,
          });
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data dokumen.');
      } finally {
        setDataLoading(false);
      }
    };
    initData();
  }, [id]);

  const handleFileSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setNewFile({ file, previewUrl });

    // Auto update filename input if empty or default
    if (!fileName || fileName === existingFileKey?.name) {
      setFileName(file.name);
    }
  };

  const uploadFileToServer = async (file: File): Promise<{ path: string; size: number; type: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'documents');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Gagal mengupload file');
    }

    const data = await response.json();
    return {
      path: data.filePath,
      size: data.fileSize,
      type: data.fileType,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jenisDokumen) {
      setError('Silakan pilih jenis dokumen');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: any = {
        jenisDokumen,
        fileName,
        nomorDokumen: nomorDokumen || null,
        periodeArsip: periodeArsip || null,
        tanggalDokumen: tanggalDokumen || null,
        keterangan: keterangan || null,
        siswaId: entityType === 'siswa' ? entityId : null,
        guruId: entityType === 'guru' ? entityId : null,
      };

      // Handle New File Upload
      if (newFile) {
        const uploadResult = await uploadFileToServer(newFile.file);
        payload.filePath = uploadResult.path;
        payload.fileSize = uploadResult.size;
        payload.fileType = uploadResult.type;
        // fileName overridden by input state
      }

      const response = await fetch(`/api/dokumen/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menyimpan perubahan');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/dokumen');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (dataLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat data dokumen...</div>;
  }

  // Helper untuk menentukan path preview
  const previewData = newFile
    ? {
        path: newFile.previewUrl,
        type: newFile.file.type,
        isNew: true,
      }
    : existingFileKey
      ? {
          path: existingFileKey.path,
          type: existingFileKey.type,
          isNew: false,
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/dokumen" className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Dokumen</h1>
              <p className="text-slate-500 text-sm">Perbarui metadata atau ganti file dokumen</p>
            </div>
          </div>
          {/* Delete Button with Modal */}
          <DeleteButton
            id={parseInt(id)}
            endpoint="/api/dokumen"
            title="Dokumen"
            className="text-red-600 hover:bg-red-50 p-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors bg-white border border-red-100 hover:border-red-200 shadow-sm"
          />
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Perubahan berhasil disimpan!
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Preview Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">File Dokumen</h2>
                <p className="text-sm text-slate-500">Anda dapat mengganti file jika diperlukan</p>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 block mb-2">Ganti File Dokumen (Opsional)</label>
                <DocumentUpload onFileSelect={handleFileSelect} folder="dokumen" />
              </div>

              {previewData ? (
                <div className="flex flex-col gap-6">
                  {/* Full Width Preview area */}
                  <div className="w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden min-h-[300px] flex items-center justify-center relative">
                    {/* Logic Render Preview */}
                    {previewData.type.startsWith('image/') ? (
                      <img src={previewData.path} alt="Preview" className="max-h-[500px] w-auto object-contain mx-auto" />
                    ) : previewData.type === 'application/pdf' ? (
                      <iframe src={`${previewData.path}#toolbar=0`} className="w-full h-[600px]" title="PDF Preview" />
                    ) : (
                      <div className="text-center p-12">
                        <FileText className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Preview tidak tersedia untuk tipe file ini</p>
                        <a href={previewData.path} target="_blank" className="text-blue-600 hover:underline mt-2 inline-block">
                          Download untuk melihat
                        </a>
                      </div>
                    )}

                    {previewData.isNew && <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">Preview File Baru</div>}
                  </div>

                  {/* Info Bar */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1 mr-4">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Nama File {newFile ? '(Baru)' : '(Saat Ini)'}</label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full text-slate-900 font-medium bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none py-1 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Tipe</label>
                      <p className="text-slate-700 text-sm bg-slate-200 px-2 py-1 rounded w-fit">{previewData.type}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-red-500 font-medium">File dokumen fisik tidak ditemukan</p>
                  <p className="text-slate-400 text-sm">Mungkin file telah dihapus dari server</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Section (Editable) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* ... (Bagian Metadata sama persis) ... */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
              <div className="p-2 rounded-lg bg-purple-100">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Metadata Dokumen</h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-5">
              {/* Jenis Dokumen */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jenis Dokumen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    value={jenisDokumen}
                    onChange={(e) => setJenisDokumen(e.target.value)}
                    required
                  >
                    <option value="">Pilih Jenis Dokumen</option>
                    {JENIS_DOKUMEN.map((jenis) => (
                      <option key={jenis.value} value={jenis.value}>
                        {jenis.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Nomor Dokumen */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Dokumen</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Contoh: SK/2024/001"
                    value={nomorDokumen}
                    onChange={(e) => setNomorDokumen(e.target.value)}
                  />
                </div>
              </div>

              {/* Periode Arsip */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Periode Arsip</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Contoh: 2024/2025"
                  value={periodeArsip}
                  onChange={(e) => setPeriodeArsip(e.target.value)}
                />
              </div>

              {/* Tanggal Dokumen */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Dokumen</label>
                <DatePicker
                  value={tanggalDokumen ? new Date(tanggalDokumen) : null}
                  onChange={(date) => setTanggalDokumen(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholder="Pilih tanggal dokumen"
                  maxDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                />
              </div>

              {/* Keterangan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan</label>
                <textarea
                  className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                  placeholder="Keterangan tambahan tentang dokumen..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Linking Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
              <div className="p-2 rounded-lg bg-emerald-100">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Pengaitan Dokumen</h2>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-5">
              {/* Tipe Entitas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Entitas</label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    value={entityType}
                    onChange={(e) => {
                      setEntityType(e.target.value as typeof entityType);
                      setEntityId(null);
                    }}
                  >
                    <option value="none">Tidak dikaitkan</option>
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Pilih Entitas */}
              {entityType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pilih {entityType === 'siswa' ? 'Siswa' : 'Guru'}</label>
                  <div className="relative">
                    <select
                      className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      value={entityId || ''}
                      onChange={(e) => setEntityId(Number(e.target.value) || null)}
                    >
                      <option value="">Pilih {entityType === 'siswa' ? 'Siswa' : 'Guru'}</option>
                      {entityType === 'siswa'
                        ? siswaList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nis} - {s.nama}
                            </option>
                          ))
                        : guruList.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.nip || '-'} - {g.nama}
                            </option>
                          ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/dokumen">
              <Button type="button" variant="outline" className="px-6">
                Batal
              </Button>
            </Link>
            <Button type="submit" isLoading={isSaving} className="px-6 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
