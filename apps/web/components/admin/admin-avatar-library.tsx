"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2, UploadCloud, UserCircle2 } from "lucide-react";
import { workerProfessions } from "@/lib/geo-data";

type AvatarItem = {
  id: string;
  url: string;
  category?: string;
};

const UNCATEGORIZED = "__uncategorized__";

function getToken() {
  return window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token") || "";
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api";
}

export function AdminAvatarLibrary({ locale }: { locale: string }) {
  const isArabic = locale === "ar";
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAvatars();
  }, []);

  async function fetchAvatars() {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/admin/avatars`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        setAvatars(payload.data);
      }
    } catch (error) {
      console.error("Failed to load avatar library:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveAvatars(updated: AvatarItem[]) {
    setAvatars(updated);
    try {
      await fetch(`${getBaseUrl()}/admin/avatars`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ avatars: updated })
      });
    } catch (error) {
      console.error("Failed to save avatar library:", error);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploaded: AvatarItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", "avatar-library");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          alert(isArabic ? `فشل الرفع: ${err.error || ""}` : `Upload failed: ${err.error || ""}`);
          continue;
        }

        const data = await res.json();
        uploaded.push({ id: `avatar-${Date.now()}-${i}`, url: data.url, category: uploadCategory || undefined });
      }

      if (uploaded.length > 0) {
        await saveAvatars([...avatars, ...uploaded]);
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert(isArabic ? "حدث خطأ أثناء الرفع" : "An error occurred during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleDelete(id: string) {
    if (!confirm(isArabic ? "هل تريد حذف هذه الصورة من المكتبة؟" : "Remove this photo from the library?")) {
      return;
    }
    saveAvatars(avatars.filter(avatar => avatar.id !== id));
  }

  function handleRecategorize(id: string, category: string) {
    saveAvatars(avatars.map(avatar => avatar.id === id ? { ...avatar, category: category || undefined } : avatar));
  }

  function professionLabel(value: string) {
    const match = workerProfessions.find(p => p.value === value);
    if (!match) return value;
    return isArabic ? match.labelAr : match.labelEn;
  }

  const groups = useMemo(() => {
    const byCategory = new Map<string, AvatarItem[]>();
    for (const avatar of avatars) {
      const key = avatar.category || UNCATEGORIZED;
      const list = byCategory.get(key) ?? [];
      list.push(avatar);
      byCategory.set(key, list);
    }

    const ordered = workerProfessions
      .map(p => p.value)
      .filter(value => byCategory.has(value))
      .map(value => ({ key: value, label: professionLabel(value), items: byCategory.get(value)! }));

    if (byCategory.has(UNCATEGORIZED)) {
      ordered.push({
        key: UNCATEGORIZED,
        label: isArabic ? "بدون تصنيف" : "Uncategorized",
        items: byCategory.get(UNCATEGORIZED)!
      });
    }

    return ordered;
  }, [avatars, isArabic]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isArabic ? "مكتبة الصور الشخصية للصنايعية" : "Worker Avatar Library"}
          </h1>
          <p className="text-onyx-300 text-sm max-w-2xl">
            {isArabic
              ? "الصور المعتمدة هنا تُستخدم تلقائياً كصورة شخصية عشوائية لأي صنايعي يكمل التسجيل بدون رفع صورته الخاصة، مع تفضيل صور نفس مهنته."
              : "Approved photos here are randomly assigned to any pro who completes registration without uploading their own profile photo, preferring photos tagged for their trade."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="bg-onyx-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold-500"
          >
            <option value="">{isArabic ? "بدون تصنيف (عام)" : "No category (general)"}</option>
            {workerProfessions.map(p => (
              <option key={p.value} value={p.value}>{isArabic ? p.labelAr : p.labelEn}</option>
            ))}
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-gold flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold shadow-lg shadow-gold-500/10"
          >
            <UploadCloud className="h-4 w-4" />
            {uploading
              ? (isArabic ? "جاري الرفع..." : "Uploading...")
              : (isArabic ? "إضافة صور جديدة" : "Add Photos")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-onyx-400 text-sm">{isArabic ? "جاري تحميل المكتبة..." : "Loading library..."}</p>
        </div>
      ) : avatars.length === 0 ? (
        <div className="onyx-card py-20 flex flex-col items-center justify-center text-center">
          <UserCircle2 className="h-16 w-16 text-onyx-700 mb-4 stroke-[1.2]" />
          <h3 className="font-bold text-white text-lg mb-1">
            {isArabic ? "المكتبة فارغة حالياً" : "The library is empty"}
          </h3>
          <p className="text-onyx-400 text-xs max-w-sm">
            {isArabic
              ? "أضف صوراً معتمدة ليتم اختيار واحدة عشوائياً لأي فني يسجل بدون صورة شخصية."
              : "Add approved photos so one can be randomly assigned to any worker who registers without a profile photo."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.key} className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gold-500">
                {group.label} <span className="text-onyx-500 normal-case">({group.items.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {group.items.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="group relative bg-onyx-900/20 border border-white/5 rounded-2xl overflow-hidden hover:border-gold-500/30 hover:bg-onyx-900/40 transition-all"
                  >
                    <div className="relative aspect-square w-full bg-onyx-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatar.url}
                        alt=""
                        className="object-cover h-full w-full group-hover:scale-105 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-onyx-950/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(avatar.id)}
                          className="p-2 bg-onyx-900/90 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title={isArabic ? "حذف" : "Delete"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <select
                      value={avatar.category || ""}
                      onChange={(e) => handleRecategorize(avatar.id, e.target.value)}
                      className="w-full bg-onyx-950 border-t border-white/5 px-2 py-1.5 text-[10px] text-onyx-300 outline-none focus:text-white"
                    >
                      <option value="">{isArabic ? "بدون تصنيف" : "No category"}</option>
                      {workerProfessions.map(p => (
                        <option key={p.value} value={p.value}>{isArabic ? p.labelAr : p.labelEn}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
