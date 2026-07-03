"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Image as ImageIcon } from "lucide-react";

interface MediaItem {
  url: string;
  pathname: string;
  uploadedAt: string;
}

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  locale: string;
}

export function MediaSelectorModal({ isOpen, onClose, onSelect, locale }: MediaSelectorModalProps) {
  const isArabic = locale === "ar";
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        // Filter to only include images
        const imagesOnly = result.data.filter((item: any) => {
          const ext = item.pathname.split(".").pop()?.toLowerCase() || "";
          return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
        });
        // Sort by date descending
        imagesOnly.sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        setItems(imagesOnly);
      }
    } catch (error) {
      console.error("Failed to fetch media for selector:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const filteredItems = items.filter(item =>
    item.pathname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx-950/80 backdrop-blur-sm p-4">
      <div className="bg-onyx-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
          <h3 className="font-bold text-white text-lg">
            {isArabic ? "اختيار صورة من المعرض" : "Select Image from Media"}
          </h3>
          <button onClick={onClose} className="p-1 text-onyx-400 hover:text-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-onyx-400" />
            <input
              type="text"
              placeholder={isArabic ? "ابحث باسم الصورة..." : "Search by image name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-onyx-950 border border-white/5 rounded-xl pr-11 pl-4 py-2.5 text-white placeholder-onyx-500 text-sm outline-none focus:border-gold-500 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="h-8 w-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-onyx-400 text-sm">{isArabic ? "جاري تحميل الصور..." : "Loading images..."}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-onyx-400">
              <ImageIcon className="h-12 w-12 text-onyx-600 mb-3" />
              <p className="text-sm font-bold">{isArabic ? "لا توجد صور متوفرة" : "No images available"}</p>
              <p className="text-xs text-onyx-500 mt-1">
                {isArabic ? "ارفع صوراً جديدة من قسم المعرض أولاً." : "Upload images in the Media section first."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const filename = item.pathname.split("/").pop() || item.pathname;
                return (
                  <button
                    key={item.url}
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className="group relative bg-onyx-950 border border-white/5 rounded-xl overflow-hidden hover:border-gold-500 transition-all text-start"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-onyx-900 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={filename}
                        className="object-cover h-full w-full group-hover:scale-105 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2 border-t border-white/5">
                      <p className="text-white text-[11px] truncate font-medium" title={filename}>
                        {filename}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
