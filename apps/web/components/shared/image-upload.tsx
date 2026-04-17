"use client";

import { useState, useRef } from "react";
import { Upload3 } from "lucide-react"; // Fallback to a valid upload/image icon later if Upload is not available

export function ImageUpload({
  label,
  value,
  onChange,
  isArabic
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  isArabic: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

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
      <span className="text-sm font-medium text-dark-700">{label}</span>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.2rem] border-2 border-dashed border-dark-200 bg-surface-soft text-dark-500 transition hover:border-primary-400 hover:bg-primary-50"
      >
        {isUploading ? (
          <span className="text-sm font-medium text-primary-600">
            {isArabic ? "جاري الرفع..." : "Uploading..."}
          </span>
        ) : value ? (
          <div className="relative h-full w-full overflow-hidden rounded-[1.2rem]">
            <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-dark-950/20 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
               <span className="text-white text-sm font-medium">{isArabic ? "تغيير الصورة" : "Change image"}</span>
            </div>
          </div>
        ) : (
          <>
             <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium group-hover:text-primary-600">
                  {isArabic ? "اختر صورة (Max 5MB)" : "Select image (Max 5MB)"}
                </span>
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
