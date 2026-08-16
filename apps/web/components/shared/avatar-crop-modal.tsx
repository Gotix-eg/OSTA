"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Check, Loader2, X } from "lucide-react";

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

function getDefaultCrop(mediaWidth: number, mediaHeight: number): Crop {
  // If no aspect ratio, just give a 90% crop centered
  return {
    unit: '%',
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  }
}

export function ImageCropModal({
  imageSrc,
  isArabic,
  onCancel,
  onConfirm,
  aspectRatio = 1,
  titleAr = "اضبط صورتك",
  titleEn = "Position your photo",
  subtitleAr = "اسحب زوايا الإطار لقص الصورة بالشكل الذي تريده.",
  subtitleEn = "Drag the corners to crop the image.",
}: {
  imageSrc: string;
  isArabic: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
  aspectRatio?: number;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(aspectRatio);
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (currentAspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, currentAspect));
    } else {
      setCrop(getDefaultCrop(e.currentTarget.width, e.currentTarget.height));
    }
  }

  // Handle aspect ratio change
  useEffect(() => {
    if (imgRef.current && currentAspect) {
      setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, currentAspect));
    } else if (imgRef.current) {
      setCrop(getDefaultCrop(imgRef.current.width, imgRef.current.height));
    }
  }, [currentAspect]);

  async function handleConfirm() {
    if (!completedCrop || !imgRef.current || isSaving) return;
    setIsSaving(true);
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Ensure we have a valid crop width and height
      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      // Scale down if image is too large (max 1200px)
      const MAX_DIM = 1200;
      let finalWidth = cropWidth;
      let finalHeight = cropHeight;

      if (finalWidth > MAX_DIM || finalHeight > MAX_DIM) {
        if (finalWidth > finalHeight) {
          finalHeight = Math.round((finalHeight * MAX_DIM) / finalWidth);
          finalWidth = MAX_DIM;
        } else {
          finalWidth = Math.round((finalWidth * MAX_DIM) / finalHeight);
          finalHeight = MAX_DIM;
        }
      }

      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = finalWidth;
      resizedCanvas.height = finalHeight;
      const resizedCtx = resizedCanvas.getContext('2d');
      if (!resizedCtx) throw new Error('No 2d context');
      
      resizedCtx.imageSmoothingEnabled = true;
      resizedCtx.imageSmoothingQuality = "high";
      
      resizedCtx.drawImage(
        canvas,
        0,
        0,
        canvas.width / pixelRatio,
        canvas.height / pixelRatio,
        0,
        0,
        finalWidth,
        finalHeight
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        resizedCanvas.toBlob((b) => {
          if (!b) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(b);
        }, 'image/jpeg', 0.85);
      });

      await onConfirm(blob);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-[95vw] md:max-w-2xl border border-gold/40 bg-[#111] p-6 text-white shadow-2xl flex flex-col max-h-[95vh]">
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-black uppercase tracking-wider text-gold">
            {isArabic ? titleAr : titleEn}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="text-white/50 transition hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 justify-center shrink-0">
          <button type="button" onClick={() => setCurrentAspect(undefined)} className={`px-3 py-1 text-xs font-bold border ${!currentAspect ? 'border-gold text-gold bg-gold/10' : 'border-white/20 text-white/60 hover:text-white'}`}>
            {isArabic ? "حر" : "Free"}
          </button>
          <button type="button" onClick={() => setCurrentAspect(1)} className={`px-3 py-1 text-xs font-bold border ${currentAspect === 1 ? 'border-gold text-gold bg-gold/10' : 'border-white/20 text-white/60 hover:text-white'}`}>
            {isArabic ? "مربع 1:1" : "Square"}
          </button>
          <button type="button" onClick={() => setCurrentAspect(4/3)} className={`px-3 py-1 text-xs font-bold border ${currentAspect === 4/3 ? 'border-gold text-gold bg-gold/10' : 'border-white/20 text-white/60 hover:text-white'}`}>
            {isArabic ? "أفقي 4:3" : "Landscape"}
          </button>
          <button type="button" onClick={() => setCurrentAspect(3/4)} className={`px-3 py-1 text-xs font-bold border ${currentAspect === 3/4 ? 'border-gold text-gold bg-gold/10' : 'border-white/20 text-white/60 hover:text-white'}`}>
            {isArabic ? "عمودي 3:4" : "Portrait"}
          </button>
        </div>

        <div className="relative w-full flex-1 min-h-0 overflow-auto border border-white/10 bg-black flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={currentAspect}
            className="max-w-full max-h-full"
          >
            <img 
              ref={imgRef}
              alt="Crop me" 
              src={imageSrc} 
              onLoad={onImageLoad}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: '60vh' }}
            />
          </ReactCrop>
        </div>

        <p className="mt-4 text-xs text-white/45 shrink-0 text-center">
          {isArabic ? subtitleAr : subtitleEn}
        </p>

        <div className="mt-4 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving || !completedCrop?.width || !completedCrop?.height}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gold py-2.5 text-sm font-black text-black transition hover:bg-gold/90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSaving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الصورة" : "Save photo"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
