"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Check, Loader2, X, ZoomIn } from "lucide-react";

import { RotateCcw } from "lucide-react";

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImageBlob(imageSrc: string, cropArea: Area, rotation: number = 0): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) throw new Error("Canvas not supported");

  // Scale down if image is too large (max 1200px)
  const MAX_DIM = 1200;
  let finalWidth = cropArea.width;
  let finalHeight = cropArea.height;

  if (finalWidth > MAX_DIM || finalHeight > MAX_DIM) {
    if (finalWidth > finalHeight) {
      finalHeight = Math.round((finalHeight * MAX_DIM) / finalWidth);
      finalWidth = MAX_DIM;
    } else {
      finalWidth = Math.round((finalWidth * MAX_DIM) / finalHeight);
      finalHeight = MAX_DIM;
    }
  }

  croppedCanvas.width = finalWidth;
  croppedCanvas.height = finalHeight;
  croppedCtx.imageSmoothingEnabled = true;
  croppedCtx.imageSmoothingQuality = "high";

  croppedCtx.drawImage(
    canvas,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    finalWidth,
    finalHeight
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.85);
  });
}

export function ImageCropModal({
  imageSrc,
  isArabic,
  onCancel,
  onConfirm,
  aspectRatio = 1,
  titleAr = "اضبط صورتك الشخصية",
  titleEn = "Position your photo",
  subtitleAr = "حرك الصورة واضبط التكبير حتى يظهر وجهك بوضوح داخل الإطار.",
  subtitleEn = "Drag and zoom until your face is clearly centered in the frame.",
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
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(aspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels || isSaving) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation);
      await onConfirm(blob);
    } finally {
      setIsSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md border border-gold/40 bg-[#111] p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
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

        <div className="mb-4 flex gap-2 justify-center">
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
        <div className="relative h-72 w-full overflow-hidden border border-white/10 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={currentAspect}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-gold"
            />
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value))}
              className="w-full accent-gold"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-white/45">
          {isArabic ? subtitleAr : subtitleEn}
        </p>

        <div className="mt-6 flex gap-3">
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
            disabled={isSaving || !croppedAreaPixels}
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
