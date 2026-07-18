"use client";

import { useState, useRef } from "react";

export function ImageUpload({
  label,
  value,
  onChange,
  isArabic,
  purpose,
  variant = "default"
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  isArabic: boolean;
  purpose?: "registration-document";
  variant?: "default" | "auth";
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
    <div className="space-y-2 text-start">
      <span className={isAuth ? "text-xs font-black uppercase tracking-widest text-white/70" : "text-sm font-medium text-onyx-200"}>{label}</span>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={isAuth ? "relative flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-none border border-dashed border-white/20 bg-[#121212] text-white/45 transition-colors hover:border-gold hover:bg-white/5" : "relative flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.2rem] border-2 border-dashed border-onyx-700 bg-onyx-800/50 text-onyx-400 transition hover:border-primary-400 hover:bg-primary-50"}
      >
        {isUploading ? (
          <span className={isAuth ? "text-sm font-black text-gold" : "text-sm font-medium text-primary-600"}>
            {isArabic ? "جاري الرفع..." : "Uploading..."}
          </span>
        ) : value ? (
          <div className={isAuth ? "relative h-full w-full overflow-hidden" : "relative h-full w-full overflow-hidden rounded-[1.2rem]"}>
            <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-dark-950/20 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
               <span className="text-white text-sm font-black">{isArabic ? "تغيير الصورة" : "Change image"}</span>
            </div>
          </div>
        ) : (
          <>
             <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-black uppercase tracking-wide">
                  {isArabic ? "اختر صورة" : "Select image"}
                </span>
                <span className="text-xs font-semibold text-white/35">Max 5MB</span>
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
