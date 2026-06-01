'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { formatFileSize } from '@/lib/utils';

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  folder?: string;
}

export function DocumentUpload({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.gif',
  maxSize = 5 * 1024 * 1024, // 5MB limit
  folder = 'documents',
}: DocumentUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file size
      if (file.size > maxSize) {
        setError(`Ukuran file terlalu besar. Maksimal ${formatFileSize(maxSize)}`);
        return;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      setSelectedFile(file);
      onFileSelect(file); // Pass file to parent immediately
    },
    [maxSize, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCameraCapture = (file: File) => {
    handleFile(file);
    setShowCamera(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    // Also notify parent that selection is cleared (optional, could pass null)
  };

  return (
    <>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Camera className="w-4 h-4" />
            Ambil Foto
          </button>
        </div>

        {/* Upload Area */}
        {activeTab === 'upload' && !selectedFile && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-700 font-medium mb-1">Drag & drop file di sini</p>
            <p className="text-slate-500 text-sm mb-3">atau klik untuk memilih file</p>
            <p className="text-slate-400 text-xs">Format: PDF, JPG, PNG, WebP (Maks. {formatFileSize(maxSize)})</p>
            <input ref={inputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />
          </div>
        )}

        {/* Camera Button */}
        {activeTab === 'camera' && !selectedFile && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-700 font-medium mb-4">Ambil foto dokumen langsung dari kamera</p>
            <Button type="button" onClick={() => setShowCamera(true)}>
              <Camera className="w-4 h-4" />
              Buka Kamera
            </Button>
          </div>
        )}

        {/* Preview */}
        {selectedFile && (
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-start gap-4">
              {/* Preview Image/Icon */}
              <div className="flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                    {selectedFile.type === 'application/pdf' ? <FileText className="w-10 h-10 text-red-500" /> : <Image className="w-10 h-10 text-slate-400" />}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium">File siap disimpan</p>
              </div>

              {/* Remove Button */}
              <button type="button" onClick={clearSelection} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error */}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
    </>
  );
}
