import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Sparkles } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      setCountdown(null);
      setError(null);
      return;
    }

    let activeStream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then((mediaStream) => {
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        setError(
          'Could not access camera. Please allow camera permissions or upload a photo from your device instead ♡'
        );
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const takeSnapshotNow = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 720, video.videoHeight || 720);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;

    // Mirror horizontally for natural selfie booth look
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    soundFX.playCameraShutterAndPrint();
    onCapture(dataUrl);
    onClose();
  };

  const handleCountdownSnap = () => {
    if (countdown !== null) return;
    setCountdown(3);
    soundFX.playSoftPop();

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        soundFX.playSoftPop();
      } else {
        clearInterval(interval);
        setCountdown(null);
        takeSnapshotNow();
      }
    }, 850);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#422531]/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pastel Polaroid Photo Booth Camera"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#FFF9FB] border-2 border-[#F4C2D3] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D86C8E]" />
            <h3 className="font-display font-bold text-lg text-[#5C3A47]">
              Instant Photo Booth ♡
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera booth"
            className="w-8 h-8 rounded-full bg-[#FCEBF0] text-[#7D4E60] hover:bg-[#F7D4E0] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl bg-[#FDF0F4] border border-[#F3C6D5] p-6 text-center space-y-3">
            <p className="text-sm text-[#7D4E60]">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#E07A9A] text-white text-xs font-semibold hover:bg-[#D4688A] transition-colors"
            >
              Back to File Upload ♡
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#2A2627] border-4 border-white shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {countdown !== null && (
                <div className="absolute inset-0 bg-[#5C3A47]/25 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="font-display font-bold text-7xl text-white drop-shadow-lg animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
              <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                <span className="font-hand text-sm text-white/90 bg-black/30 backdrop-blur-xs px-3 py-0.5 rounded-full">
                  smile for your Polaroid ♡
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={takeSnapshotNow}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E4789A] to-[#D66589] text-white text-sm font-semibold shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Snap Right Now ♡
              </button>
              <button
                type="button"
                onClick={handleCountdownSnap}
                disabled={countdown !== null}
                className="px-4 py-2.5 rounded-full bg-[#FCEBF0] text-[#7D4E60] border border-[#F2C2D3] text-sm font-semibold hover:bg-[#F9DCE6] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D86C8E]" />
                3s Timer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
