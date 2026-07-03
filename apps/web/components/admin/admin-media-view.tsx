"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash2, UploadCloud, ExternalLink, Image as ImageIcon, Search, Copy, Check, RefreshCw } from "lucide-react";

interface MediaItem {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

function formatFileSize(bytes: number) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function AdminMediaView({ locale }: { locale: string }) {
  const isArabic = locale === "ar";
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "images" | "documents">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        // Sort by upload date descending
        const sorted = result.data.sort(
          (a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        setItems(sorted);
      }
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", "general"); // General purpose upload (needs admin session cookies)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert(isArabic ? `فشل الرفع: ${err.error || ""}` : `Upload failed: ${err.error || ""}`);
          continue;
        }
      }
      fetchMedia();
    } catch (error) {
      console.error("Upload error:", error);
      alert(isArabic ? "حدث خطأ أثناء الرفع" : "An error occurred during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(url: string) {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف هذا الملف نهائياً؟" : "Are you sure you want to delete this file permanently?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        setItems(prev => prev.filter(item => item.url !== url));
      } else {
        alert(isArabic ? "فشل الحذف" : "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(isArabic ? "حدث خطأ أثناء الحذف" : "An error occurred during deletion");
    }
  }

  function handleCopy(url: string) {
    void navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.pathname.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simple extension match
    const ext = item.pathname.split(".").pop()?.toLowerCase() || "";
    const isImg = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
    
    if (filterType === "images") return matchesSearch && isImg;
    if (filterType === "documents") return matchesSearch && !isImg;
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isArabic ? "معرض الوسائط والملفات (Media Library)" : "Media Library"}
          </h1>
          <p className="text-onyx-300 text-sm">
            {isArabic
              ? "استعرض، ارفع، أو احذف الملفات والصور المرفوعة على خوادم المنصة."
              : "Browse, upload, or delete files and images hosted on the platform."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-3 bg-onyx-900 border border-white/5 rounded-2xl text-onyx-300 hover:text-white hover:bg-onyx-800 transition-all"
            title={isArabic ? "تحديث القائمة" : "Refresh List"}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-gold flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-lg shadow-gold-500/10"
          >
            <UploadCloud className="h-4 w-4" />
            {uploading
              ? (isArabic ? "جاري الرفع..." : "Uploading...")
              : (isArabic ? "رفع وسائط جديدة" : "Upload New Media")}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-4 bg-onyx-900/40 p-4 rounded-2xl border border-white/5">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-onyx-400" />
          <input
            type="text"
            placeholder={isArabic ? "ابحث باسم الملف..." : "Search by file name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-onyx-950 border border-white/5 rounded-xl pr-11 pl-4 py-3 text-white placeholder-onyx-500 text-sm outline-none focus:border-gold-500 transition-all"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterType === "all"
                ? "bg-gold-500 text-onyx-950"
                : "bg-onyx-900 text-onyx-400 hover:text-white border border-white/5"
            }`}
          >
            {isArabic ? "الكل" : "All"}
          </button>
          <button
            onClick={() => setFilterType("images")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterType === "images"
                ? "bg-gold-500 text-onyx-950"
                : "bg-onyx-900 text-onyx-400 hover:text-white border border-white/5"
            }`}
          >
            {isArabic ? "الصور" : "Images"}
          </button>
          <button
            onClick={() => setFilterType("documents")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterType === "documents"
                ? "bg-gold-500 text-onyx-950"
                : "bg-onyx-900 text-onyx-400 hover:text-white border border-white/5"
            }`}
          >
            {isArabic ? "المستندات" : "Documents"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-onyx-400 text-sm">{isArabic ? "جاري جلب الوسائط من الخادم..." : "Fetching files from server..."}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="onyx-card py-20 flex flex-col items-center justify-center text-center">
          <ImageIcon className="h-16 w-16 text-onyx-700 mb-4 stroke-[1.2]" />
          <h3 className="font-bold text-white text-lg mb-1">{isArabic ? "لم نجد أي وسائط" : "No media found"}</h3>
          <p className="text-onyx-400 text-xs max-w-sm">
            {isArabic
              ? "لا يوجد صور أو ملفات تطابق بحثك حالياً. يمكنك رفع ملفات جديدة باستخدام زر الرفع بالأعلى."
              : "No images or files match your search criteria. You can upload new files using the button above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredItems.map((item) => {
            const ext = item.pathname.split(".").pop()?.toLowerCase() || "";
            const isImg = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
            const filename = item.pathname.split("/").pop() || item.pathname;

            return (
              <div
                key={item.url}
                className="group relative bg-onyx-900/20 border border-white/5 rounded-2xl overflow-hidden hover:border-gold-500/30 hover:bg-onyx-900/40 transition-all flex flex-col justify-between"
              >
                {/* Image Preview / Icon */}
                <div className="relative aspect-video w-full bg-onyx-950 flex items-center justify-center overflow-hidden border-b border-white/5">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={filename}
                      className="object-cover h-full w-full group-hover:scale-105 transition-all duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 p-4 text-onyx-500">
                      <ImageIcon className="h-8 w-8 stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-onyx-900 px-2 py-0.5 rounded text-onyx-300">
                        {ext}
                      </span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-onyx-950/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(item.url)}
                      className="p-2 bg-onyx-900/90 text-white rounded-lg hover:bg-gold-500 hover:text-onyx-950 transition-all"
                      title={isArabic ? "نسخ الرابط" : "Copy Link"}
                    >
                      {copiedUrl === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-onyx-900/90 text-white rounded-lg hover:bg-gold-500 hover:text-onyx-950 transition-all"
                      title={isArabic ? "فتح في نافذة جديدة" : "Open in new window"}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.url)}
                      className="p-2 bg-onyx-900/90 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      title={isArabic ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 space-y-1">
                  <p className="text-white text-xs truncate font-medium" title={filename}>
                    {filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-onyx-400">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{new Date(item.uploadedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
