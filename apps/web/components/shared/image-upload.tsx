"use client";

import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
import { ImageCropModal } from "@/components/shared/avatar-crop-modal";

export function ImageUpload({
  label,
  value,
  onChange,
  isArabic,
  purpose,
  variant = "default",
  compact = false
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  isArabic: boolean;
  purpose?: "registration-document";
  variant?: "default" | "auth";
  compact?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAuth = variant === "auth";

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleCropConfirm(blob: Blob) {
    setCropSrc(null);
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", new File([blob], "upload.jpg", { type: "image/jpeg" }));
    if (purpose) {
      formData.append("purpose", purpose);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={compact ? "space-y-0.5 text-start" : "space-y-1 text-start"}>
      {label ? (
        <span className={isAuth ? (compact ? "text-[10px] font-black uppercase tracking-widest text-white/70" : "text-xs font-black uppercase tracking-widest text-white/70") : "text-sm font-medium text-onyx-200"}>{label}</span>
      ) : null}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={
          isAuth
            ? compact
              ? "relative flex h-12 cursor-pointer items-center justify-between px-3 rounded-none border border-dashed border-white/20 bg-[#121212] text-white/60 transition-colors hover:border-gold hover:bg-white/5 active:scale-[0.99]"
              : "relative flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-white/20 bg-[#121212] text-white/45 transition-colors hover:border-gold hover:bg-white/5"
            : compact
              ? "relative flex h-12 cursor-pointer items-center justify-between px-3 rounded-lg border border-dashed border-onyx-700 bg-onyx-800/50 text-onyx-400 transition hover:border-primary-400 hover:bg-primary-50 active:scale-[0.99]"
              : "relative flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-[1rem] border-2 border-dashed border-onyx-700 bg-onyx-800/50 text-onyx-400 transition hover:border-primary-400 hover:bg-primary-50"
        }
      >
        {isUploading ? (
          <span className={isAuth ? "text-[10px] font-black text-gold animate-pulse mx-auto" : "text-[10px] font-medium text-primary-600 animate-pulse mx-auto"}>
            {isArabic ? "جاري الرفع..." : "Uploading..."}
          </span>
        ) : value ? (
          compact ? (
            <div className="flex items-center gap-2 overflow-hidden w-full justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <img src={value} alt="Uploaded" className="h-5 w-5 object-cover rounded border border-white/20 shrink-0" />
                <span className="text-[10px] font-bold text-white truncate">{isArabic ? "تم الرفع (تغيير)" : "Uploaded (Change)"}</span>
              </div>
              <Check className="h-3.5 w-3.5 text-gold shrink-0" />
            </div>
          ) : (
            <div className={isAuth ? "relative h-full w-full overflow-hidden" : "relative h-full w-full overflow-hidden rounded-[1rem]"}>
              <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-dark-950/40 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                <span className="text-white text-[10px] font-black">{isArabic ? "تغيير الصورة" : "Change image"}</span>
              </div>
            </div>
          )
        ) : (
          compact ? (
            <div className="flex items-center justify-center gap-1.5 w-full text-white/55">
              <Upload className="h-3 w-3 text-gold shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {isArabic ? "اختر صورة" : "Select image"}
              </span>
              <span className="text-[9px] text-white/35">(5MB)</span>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center gap-1.5">
              <Upload className="h-4 w-4 text-gold shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wide">
                {isArabic ? "اختر صورة" : "Select image"}
              </span>
              <span className="text-[9px] font-semibold text-white/35">(Max 5MB)</span>
            </div>
          )
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => void handleFileChange(e)}
        />
      </div>
      {error ? <p className="text-xs text-error">{error}</p> : null}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          isArabic={isArabic}
          onCancel={() => setCropSrc(null)}
          onConfirm={handleCropConfirm}
          aspectRatio={label.includes("سيلفي مع الهوية") ? 3/4 : label.includes("الهوية الوطنية") ? 1.58 : label.includes("سيلفي") ? 1 : undefined}
        />
      )}
    </div>
  );
}
