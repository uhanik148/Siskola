'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchCamera = async () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    await startCamera();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);

    // Stop video stream
    stream?.getTracks().forEach((track) => track.stop());
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    // Convert base64 to blob
    const res = await fetch(capturedImage);
    const blob = await res.blob();

    // Create File object
    const timestamp = Date.now();
    const file = new File([blob], `capture-${timestamp}.jpg`, { type: 'image/jpeg' });

    onCapture(file);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium">Ambil Foto Dokumen</h2>
        <button onClick={switchCamera} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="h-full flex items-center justify-center">
        {isLoading && (
          <div className="text-white flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p>Mengaktifkan kamera...</p>
          </div>
        )}

        {error && (
          <div className="text-white text-center p-6">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="mb-4">{error}</p>
            <Button onClick={startCamera} variant="outline">
              Coba Lagi
            </Button>
          </div>
        )}

        {!capturedImage ? <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-contain ${isLoading || error ? 'hidden' : ''}`} /> : <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/70 to-transparent">
        {!capturedImage ? (
          <div className="flex justify-center">
            <button onClick={capturePhoto} disabled={isLoading || !!error} className="w-20 h-20 rounded-full bg-white border-4 border-white/50 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50">
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-6">
            <button onClick={retakePhoto} className="flex flex-col items-center gap-2 text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <RotateCcw className="w-6 h-6" />
              </div>
              <span className="text-sm">Ulangi</span>
            </button>
            <button onClick={confirmPhoto} className="flex flex-col items-center gap-2 text-white">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors">
                <Check className="w-6 h-6" />
              </div>
              <span className="text-sm">Gunakan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
