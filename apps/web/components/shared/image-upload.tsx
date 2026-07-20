"use client";

import { useState, useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAuth = variant === "auth";

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className={compact ? "space-y-0.5 text-start" : "space-y-2 text-start"}>
      <span className={isAuth ? (compact ? "text-[10px] font-black uppercase tracking-widest text-white/70" : "text-xs font-black uppercase tracking-widest text-white/70") : "text-sm font-medium text-onyx-200"}>{label}</span>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={
          isAuth
            ? compact
              ? "relative flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-none border border-dashed border-white/20 bg-[#121212] text-white/45 transition-colors hover:border-gold hover:bg-white/5"
              : "relative flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-none border border-dashed border-white/20 bg-[#121212] text-white/45 transition-colors hover:border-gold hover:bg-white/5"
            : compact
            ? "relative flex h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[1.2rem] border-2 border-dashed border-onyx-700 bg-onyx-800/50 text-onyx-400 transition hover:border-primary-400 hover:bg-primary-50"
            : "relative flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.2rem] border-2 border-dashed border-onyx-700 bg-onyx-800/50 text-onyx-400 transition hover:border-primary-400 hover:bg-primary-50"
        }
      >
        {isUploading ? (
          <span className={isAuth ? "text-[10px] font-black text-gold" : "text-[10px] font-medium text-primary-600"}>
            {isArabic ? "جاري الرفع..." : "Uploading..."}
          </span>
        ) : value ? (
          <div className={isAuth ? "relative h-full w-full overflow-hidden" : "relative h-full w-full overflow-hidden rounded-[1.2rem]"}>
            <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-dark-950/20 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
               <span className="text-white text-[10px] font-black">{isArabic ? "تغيير الصورة" : "Change image"}</span>
            </div>
          </div>
        ) : (
          <>
             <div className="flex flex-row items-center justify-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {isArabic ? "اختر صورة" : "Select image"}
                </span>
                <span className="text-[9px] font-semibold text-white/35">(Max 5MB)</span>
             </div>
          </>
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
    </div>
  );
}
