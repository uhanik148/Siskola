'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, FileText, User, Tag, Eye, Hash, ChevronDown, ScanText, Loader2, RefreshCw } from 'lucide-react';
import { Button, DatePicker } from '@/components/ui';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import { JENIS_DOKUMEN } from '@/lib/utils';
import { format } from 'date-fns';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';

interface Entity {
  id: number;
  nama: string;
  nis?: string;
  nip?: string;
}

export default function ScanDokumenPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File upload state - Modified for Lazy Upload
  const [fileData, setFileData] = useState<{
    file: File;
    previewUrl: string | null;
  } | null>(null);

  // Form state
  const [jenisDokumen, setJenisDokumen] = useState('');
  const [nomorDokumen, setNomorDokumen] = useState('');
  const [periodeArsip, setPeriodeArsip] = useState('');
  const [tanggalDokumen, setTanggalDokumen] = useState<string>(''); // format yyyy-MM-dd
  const [keterangan, setKeterangan] = useState('');
  const [entityType, setEntityType] = useState<'none' | 'siswa' | 'guru'>('none');
  const [entityId, setEntityId] = useState<number | null>(null);

  // OCR State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Entity lists
  const [siswaList, setSiswaList] = useState<Entity[]>([]);
  const [guruList, setGuruList] = useState<Entity[]>([]);

  // Fetch entities for linking
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [siswaRes, guruRes] = await Promise.all([fetch('/api/siswa?limit=100'), fetch('/api/guru?limit=100')]);

        if (siswaRes.ok) {
          const data = await siswaRes.json();
          setSiswaList(data.data || []);
        }
        if (guruRes.ok) {
          const data = await guruRes.json();
          setGuruList(data.data || []);
        }
      } catch {
        // Silently fail - lists will be empty
      }
    };

    fetchEntities();
  }, []);

  const handleFileSelect = (file: File) => {
    // Create local preview URL
    let previewUrl: string | null = null;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }
    setFileData({ file, previewUrl });

    // Reset form fields lightly (optional, maybe user wants to keep prev data?)
    // setNomorDokumen('');
    // setTanggalDokumen('');
    // setKeterangan('');
  };

  // --- SMART OCR LOGIC ---
  // --- SMART OCR LOGIC ---
  const handleScanOCR = async () => {
    if (!fileData || !fileData.file) {
      toast.error('Harap pilih gambar terlebih dahulu untuk discan.');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    try {
      const worker = await createWorker('ind'); // Load Indonesian language

      // Use the actual File object (Blob) instead of previewUrl for maximum resolution
      const {
        data: { text },
      } = await worker.recognize(fileData.file);

      console.log('OCR Result RAW:', text); // Debugging

      // 1. Extract Nomor Dokumen (Smart Priority)
      // Strategy:
      // - Avoid "No" in headers (Telp, Fax, Terakreditasi, Kotak Pos)
      // - Prioritize "Nomor :" that usually appears after "SURAT ..." title

      const lines = text.split('\n');
      let foundNomor = null;

      // Regex for valid document number
      // OLD: ([0-9a-zA-Z\/\.\-]+) -> stopped at space
      // NEW: ([\w\.\/\-\s]+) -> allows spaces, see below
      const docNoRegex = /(?:nomor|no|ref)[\.:\s]+([0-9a-zA-Z\/\.\-\s]{3,})/i;

      // Keywords to ignore (Header stuff)
      const ignoreKeywords = ['telp', 'fax', 'phone', 'akreditasi', 'kotak pos', 'jalan', 'jl.'];

      for (const line of lines) {
        const match = line.match(docNoRegex);
        if (match && match[1]) {
          const lowerLine = line.toLowerCase();
          // Check if line contains ignored keywords
          const isIgnored = ignoreKeywords.some((keyword) => lowerLine.includes(keyword));

          if (!isIgnored) {
            // Found a candidate that is NOT a phone/fax number
            let cleanNo = match[1].trim();

            // Stop at newline if regex captured too much
            cleanNo = cleanNo.split('\n')[0];

            // Remove trailing punctuation often found in OCR
            cleanNo = cleanNo.replace(/[:,\.]$/, '');

            if (cleanNo.length > 3) {
              // Filter out noise like "No. ."
              foundNomor = cleanNo;
              break; // Stop at the first valid "Nomor Surat" found (usually topmost after header)
            }
          }
        }
      }

      if (foundNomor) {
        setNomorDokumen(foundNomor);
        toast.info(`Ditemukan Nomor: ${foundNomor}`);
      }

      // 2. Extract Tanggal (Improved Regex for various formats)
      // Matches: "21 Agustus 1997", "12 Desember 2020", "12-12-2020", "Medan, 12 Desember 2020"
      // Look for Date pattern specifically, ignoring "Lahir", "Medan" prefixes
      const monthNames = 'januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des';
      const dateRegexIndo = new RegExp(`(\\d{1,2})[\\s\\-,]+(${monthNames})[\\s\\-,]+(\\d{4})`, 'i');

      // Find all matches, usually the LAST date is the document date (at the bottom),
      // but FIRST date might be DOB. Let's try to find the one associated with place or signature first.
      const matches = [...text.matchAll(new RegExp(dateRegexIndo, 'gi'))];

      let dateFound = null;

      if (matches.length > 0) {
        // If multiple dates found, usually the last one in the document is the 'signed date' (Surat Keterangan style)
        // But 'Tanggal Lahir' usually appears early.
        // Strategy: Pick the LAST detected date as default document date.
        const lastMatch = matches[matches.length - 1];
        dateFound = lastMatch;
      }

      if (dateFound) {
        const monthMap: Record<string, string> = {
          januari: '01',
          februari: '02',
          maret: '03',
          april: '04',
          mei: '05',
          juni: '06',
          juli: '07',
          agustus: '08',
          september: '09',
          oktober: '10',
          november: '11',
          desember: '12',
          jan: '01',
          feb: '02',
          mar: '03',
          apr: '04',
          jun: '06',
          jul: '07',
          agu: '08',
          sep: '09',
          okt: '10',
          nov: '11',
          des: '12',
        };
        const day = dateFound[1].padStart(2, '0');
        const monthStr = dateFound[2].toLowerCase();
        const year = dateFound[3];
        const month = monthMap[monthStr] || '01';

        setTanggalDokumen(`${year}-${month}-${day}`);
        toast.success(`Ditemukan Tanggal: ${day} ${monthStr} ${year}`);

        // --- AUTO PERIODE ARSIP (School Year Logic) ---
        // If Month >= July (07), then Periode = Year / Year+1
        // If Month < July, then Periode = Year-1 / Year
        const yearInt = parseInt(year);
        const monthInt = parseInt(month);

        let periode = '';
        if (monthInt >= 7) {
          periode = `${yearInt}/${yearInt + 1}`;
        } else {
          periode = `${yearInt - 1}/${yearInt}`;
        }
        setPeriodeArsip(periode);
      }

      // 3. Put everything else in Keterangan if empty
      // Clean text: Remove empty lines, remove weird OCR artifacts
      const cleanText = text
        .split('\n')
        .map((line) => line.trim()) // Correct TS syntax
        .filter((line) => line.length > 3)
        .join('\n');

      // ALWAYS OVERWRITE Keterangan for a fresh scan
      setKeterangan(cleanText);

      toast.success('Scan selesai! Data telah diisi otomatis.');
      await worker.terminate();
    } catch (err) {
      console.error(err);
      toast.error('Gagal melakukan scan OCR. Pastikan gambar jelas.');
    } finally {
      setIsScanning(false);
    }
  };

  const uploadFileToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'documents');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Gagal mengupload file ke server');
    }

    const data = await response.json();
    return data.filePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileData) {
      setError('Silakan pilih dokumen terlebih dahulu');
      return;
    }

    if (!jenisDokumen) {
      setError('Silakan pilih jenis dokumen');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload File First
      const serverFilePath = await uploadFileToServer(fileData.file);

      // 2. Submit Metadata
      const payload = {
        jenisDokumen,
        nomorDokumen: nomorDokumen || null,
        periodeArsip: periodeArsip || null,
        tanggalDokumen: tanggalDokumen || null,
        keterangan: keterangan || null,
        filePath: serverFilePath,
        fileName: fileData.file.name,
        fileType: fileData.file.type,
        fileSize: fileData.file.size, // Original size
        siswaId: entityType === 'siswa' ? entityId : null,
        guruId: entityType === 'guru' ? entityId : null,
        sumberInput: fileData.file.name.startsWith('capture-') ? 'kamera' : 'upload',
      };

      const response = await fetch('/api/dokumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menyimpan dokumen');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/dokumen');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat proses simpan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Link href="/dashboard/dokumen" className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Scan & Digitalisasi Dokumen</h1>
            <p className="text-slate-500 text-sm">Upload file atau ambil foto dokumen fisik</p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Dokumen berhasil diupload dan disimpan! Mengarahkan...
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Upload & Preview */}
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Upload Dokumen</h2>
                    <p className="text-sm text-slate-500">Pilih file atau ambil foto</p>
                  </div>
                </div>

                <div className="p-6">
                  <DocumentUpload onFileSelect={handleFileSelect} folder="documents" />
                </div>
              </div>

              {/* Preview & OCR Trigger */}
              {fileData && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 transition-all duration-500">
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Eye className="w-5 h-5 text-amber-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
                    </div>

                    {/* SMART OCR BUTTON */}
                    {fileData.previewUrl && (
                      <Button type="button" size="sm" onClick={handleScanOCR} disabled={isScanning} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                        {isScanning ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...
                          </>
                        ) : (
                          <>
                            <ScanText className="w-4 h-4 mr-2" /> Auto-Scan Text
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="p-6">
                    {fileData.previewUrl ? (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 shadow-lg group">
                        <Image src={fileData.previewUrl} alt="Preview Dokumen" fill className="object-contain bg-slate-900/5 group-hover:scale-[1.02] transition-transform duration-500" />
                        {isScanning && (
                          <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                            <p className="font-semibold text-lg">Membaca Dokumen...</p>
                            <p className="text-sm opacity-80 mt-1">AI sedang mencari No. Surat dan Tanggal</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-8 text-center">
                        <div className="p-4 bg-slate-100 rounded-xl">
                          <FileText className="w-12 h-12 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium">{fileData.file.name}</p>
                          <p className="text-xs text-slate-400 mt-1">Preview tidak tersedia untuk file non-gambar</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Metadata Form */}
            <div className="space-y-6">
              {/* Metadata Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900">Metadata Dokumen</h2>
                    <p className="text-sm text-slate-500">Lengkapi data di bawah ini</p>
                  </div>
                  {/* Reset Form Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNomorDokumen('');
                      setTanggalDokumen('');
                      setKeterangan('');
                      setJenisDokumen('');
                      toast.info('Formulir dibersihkan');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Reset Form"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
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
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                      <span>Nomor Dokumen</span>
                      {isScanning && <span className="text-indigo-600 text-xs animate-pulse">Mencari...</span>}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-500 text-slate-400 transition-colors">
                        <Hash className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                        placeholder="Contoh: SK/2024/001"
                        value={nomorDokumen}
                        onChange={(e) => setNomorDokumen(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tanggal Dokumen */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                      <span>Tanggal Dokumen</span>
                      {isScanning && <span className="text-indigo-600 text-xs animate-pulse">Mencari...</span>}
                    </label>
                    <DatePicker
                      value={tanggalDokumen ? new Date(tanggalDokumen) : null}
                      onChange={(date) => setTanggalDokumen(date ? format(date, 'yyyy-MM-dd') : '')}
                      placeholder="Pilih tanggal dokumen"
                      maxDate={new Date()}
                      showYearDropdown
                      showMonthDropdown
                    />
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

                  {/* Keterangan */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Keterangan / Isi Ringkas</label>
                    <textarea
                      className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                      placeholder="Isi dokumen (Hasil scan text akan muncul disini)..."
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-right">*Hasil OCR otomatis akan ditambahkan ke sini.</p>
                  </div>

                  {/* Pengaitan (Compact) */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-900">Pengaitan (Opsional)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                        value={entityType}
                        onChange={(e) => {
                          setEntityType(e.target.value as typeof entityType);
                          setEntityId(null);
                        }}
                      >
                        <option value="none">Tanpa Kaitan</option>
                        <option value="siswa">Siswa</option>
                        <option value="guru">Guru</option>
                      </select>

                      {entityType !== 'none' && (
                        <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" value={entityId || ''} onChange={(e) => setEntityId(Number(e.target.value) || null)}>
                          <option value="">Pilih Data...</option>
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons (Sticky Bottom) */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link href="/dashboard/dokumen">
              <Button type="button" variant="outline" className="px-6">
                Batal
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading} disabled={!fileData} className="px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Menyimpan...' : 'Simpan Dokumen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
