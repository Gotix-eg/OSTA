"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Check, Loader2, X, ZoomIn, RotateCw } from "lucide-react";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = src;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.95
    );
  });
}

export function AdminImageEditModal({
  imageSrc,
  isArabic,
  aspectRatio,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  isArabic: boolean;
  aspectRatio?: number; 
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
    },
    []
  );

  async function handleConfirm() {
    if (!croppedAreaPixels || isSaving) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      await onConfirm(blob);
    } catch (err) {
      console.error("Error cropping image:", err);
    } finally {
      setIsSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg border border-gold/40 bg-[#111] p-6 text-white shadow-2xl rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-gold">
            {isArabic ? "تعديل الصورة" : "Edit Photo"}
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

        <div className="relative h-[400px] w-full overflow-hidden border border-white/10 bg-black rounded-xl">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape="rect"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 shrink-0 text-white/50" />
            <span className="text-xs text-white/50 w-12">{isArabic ? "تكبير" : "Zoom"}</span>
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
            <RotateCw className="h-4 w-4 shrink-0 text-white/50" />
            <span className="text-xs text-white/50 w-12">{isArabic ? "تدوير" : "Rotate"}</span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value))}
              className="w-full accent-gold"
            />
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs font-bold transition hover:bg-white/20"
            >
              +90°
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/45 text-center">
          {isArabic
            ? "قم بتدوير واقتصاص الصورة لتكون واضحة ومستقيمة."
            : "Rotate and crop the image so it is clear and straight."}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving || !croppedAreaPixels}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-black text-black transition hover:bg-gold/90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSaving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ التعديلات" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
