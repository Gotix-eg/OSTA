"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, ExternalLink, Eye, GripVertical, Loader2, Plus, Save, Trash2, Video, X } from "lucide-react";

import { WorkerProAction, WorkerProPanel, WorkerProShell, WorkerProTopStrip } from "@/components/worker/worker-pro-ui";
import { WorkerProfileDetail } from "@/components/workers/worker-profile-detail";
import { ImageUpload } from "@/components/shared/image-upload";
import { WorkerVideoPlayer } from "@/components/shared/video-player";
import { resolveApiBaseUrl } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

interface CertificateDraft {
  title: string;
  year: string;
  imageUrl: string;
}

interface ServiceItemDraft {
  name: string;
  price: string;
  note: string;
}

interface ProfileDraft {
  bio: string;
  yearsOfExperience: number;
  education: string[];
  achievements: string[];
  galleryImages: string[];
  galleryVideoUrl: string;
  contractInfo: string;
  certificates: CertificateDraft[];
  serviceItems: ServiceItemDraft[];
}

const emptyProfile: ProfileDraft = {
  bio: "",
  yearsOfExperience: 0,
  education: [],
  achievements: [],
  galleryImages: [],
  galleryVideoUrl: "",
  contractInfo: "",
  certificates: [],
  serviceItems: []
};

function fieldLabelClass() {
  return "text-xs font-black uppercase tracking-[0.16em] text-white/45";
}

function textInputClass() {
  return "h-12 w-full border border-white/10 bg-[#111] px-4 text-sm text-white outline-none focus:border-gold";
}

function textareaClass() {
  return "w-full border border-white/10 bg-[#111] p-4 text-sm text-white outline-none focus:border-gold resize-none";
}

export function WorkerProfileEditor({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [data, setData] = useState<ProfileDraft>(emptyProfile);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingRowIndex, setSavingRowIndex] = useState<number | null>(null);
  const [savedRowIndex, setSavedRowIndex] = useState<number | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const [eduRowErrors, setEduRowErrors] = useState<Record<number, string>>({});
  const [eduSavingRowIndex, setEduSavingRowIndex] = useState<number | null>(null);
  const [eduSavedRowIndex, setEduSavedRowIndex] = useState<number | null>(null);

  const [achRowErrors, setAchRowErrors] = useState<Record<number, string>>({});
  const [achSavingRowIndex, setAchSavingRowIndex] = useState<number | null>(null);
  const [achSavedRowIndex, setAchSavedRowIndex] = useState<number | null>(null);

  const [certRowErrors, setCertRowErrors] = useState<Record<number, string>>({});
  const [certSavingRowIndex, setCertSavingRowIndex] = useState<number | null>(null);
  const [certSavedRowIndex, setCertSavedRowIndex] = useState<number | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const baseUrl = resolveApiBaseUrl();
        const res = await fetch(`${baseUrl}/workers/profile`, { credentials: "include" });
        const payload = await res.json();
        if (!res.ok || !payload.success) {
          throw new Error(payload.error?.message || payload.message || "Failed to load profile");
        }
        const d = payload.data;
        if (d.id) setWorkerId(d.id);
        setData({
          bio: d.bio ?? "",
          yearsOfExperience: d.yearsOfExperience ?? 0,
          education: d.education ?? [],
          achievements: d.achievements ?? [],
          galleryImages: d.galleryImages ?? [],
          galleryVideoUrl: d.galleryVideoUrl ?? "",
          contractInfo: d.contractInfo ?? "",
          certificates: (d.certificates ?? []).map((c: any) => ({ title: c.title, year: c.year ?? "", imageUrl: c.imageUrl })),
          serviceItems: (d.serviceItems ?? []).map((s: any) => ({ name: s.name, price: s.price, note: s.note ?? "" }))
        });
      } catch (err: any) {
        setLoadError(err.message || (isArabic ? "تعذر تحميل بيانات الملف الشخصي." : "Failed to load profile data."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isArabic]);

  const triggerAutoSave = useCallback(
    (updatedData: ProfileDraft) => {
      setSaveState("saving");
      setSaveError(null);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const baseUrl = resolveApiBaseUrl();
          const res = await fetch(`${baseUrl}/workers/profile`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bio: updatedData.bio,
              yearsOfExperience: updatedData.yearsOfExperience,
              education: updatedData.education.filter((e) => e.trim()),
              achievements: updatedData.achievements.filter((a) => a.trim()),
              galleryImages: updatedData.galleryImages.filter(Boolean),
              galleryVideoUrl: updatedData.galleryVideoUrl,
              contractInfo: updatedData.contractInfo,
              certificates: updatedData.certificates.filter((c) => c.title.trim() && c.imageUrl),
              serviceItems: updatedData.serviceItems
                .filter((s) => s.name.trim() && s.price.trim())
                .map((s) => ({
                  ...s,
                  price: s.price.trim().replace(/\s*(ج\.م|EGP)$/i, "")
                }))
            })
          });

          const payload = await res.json();
          if (!res.ok || !payload.success) {
            throw new Error(payload.error?.message || payload.message || "Failed to save profile");
          }

          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 2000);
        } catch (err: any) {
          console.error("Auto-save profile failed", err);
          setSaveState("error");
          setSaveError(err.message || (isArabic ? "فشل حفظ الملف الشخصي." : "Failed to save profile."));
        }
      }, 400);
    },
    [isArabic]
  );

  function updateData(updater: ProfileDraft | ((prev: ProfileDraft) => ProfileDraft)) {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      triggerAutoSave(next);
      return next;
    });
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const newRowErrors: Record<number, string> = {};
      data.serviceItems.forEach((s, idx) => {
        const hasName = Boolean(s.name.trim());
        const cleanPrice = s.price.trim().replace(/\s*(ج\.م|EGP)$/i, "");
        const hasValidPrice = Boolean(cleanPrice && /^\d+(\.\d{1,2})?$/.test(cleanPrice));

        if (hasName || cleanPrice) {
          if (!hasName && !hasValidPrice) {
            newRowErrors[idx] = isArabic ? "يرجى إدخال اسم الخدمة والسعر بالجنيه المصري" : "Please enter service name and price in EGP";
          } else if (!hasName) {
            newRowErrors[idx] = isArabic ? "يرجى إدخال اسم الخدمة" : "Service name is required";
          } else if (!hasValidPrice) {
            newRowErrors[idx] = isArabic ? "يرجى إدخال سعر صحيح بالجنيه المصري (مثال: 150)" : "Valid price in EGP is required (e.g. 150)";
          }
        }
      });

      if (Object.keys(newRowErrors).length > 0) {
        setRowErrors(newRowErrors);
        setSaveState("error");
        setSaveError(isArabic ? "يرجى تصحيح الأخطاء في قائمة الخدمات والأسعار" : "Please fix the errors in your services list");
        return;
      }

      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/workers/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: data.bio,
          yearsOfExperience: data.yearsOfExperience,
          education: data.education.filter((e) => e.trim()),
          achievements: data.achievements.filter((a) => a.trim()),
          galleryImages: data.galleryImages.filter(Boolean),
          galleryVideoUrl: data.galleryVideoUrl,
          contractInfo: data.contractInfo,
          certificates: data.certificates.filter((c) => c.title.trim() && c.imageUrl),
          serviceItems: data.serviceItems
            .filter((s) => s.name.trim() && s.price.trim())
            .map((s) => ({
              ...s,
              price: s.price.trim().replace(/\s*(ج\.م|EGP)$/i, "")
            }))
        })
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || payload.message || "Failed to save profile");
      }
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch (err: any) {
      setSaveState("error");
      setSaveError(err.message || (isArabic ? "فشل حفظ الملف الشخصي." : "Failed to save profile."));
    }
  }

  async function saveSingleServiceRow(index: number) {
    const service = data.serviceItems[index];
    if (!service) return;

    const hasName = Boolean(service.name.trim());
    const cleanPrice = service.price.trim().replace(/\s*(ج\.م|EGP)$/i, "");
    const hasValidPrice = Boolean(cleanPrice && /^\d+(\.\d{1,2})?$/.test(cleanPrice));

    if (!hasName || !hasValidPrice) {
      let errMsg = "";
      if (!hasName && !hasValidPrice) {
        errMsg = isArabic ? "يرجى إدخال اسم الخدمة والسعر بالجنيه المصري" : "Please enter service name and valid price in EGP";
      } else if (!hasName) {
        errMsg = isArabic ? "يرجى إدخال اسم الخدمة أولاً." : "Please enter the service name first.";
      } else {
        errMsg = isArabic ? "يرجى إدخال سعر صحيح بالجنيه المصري (أرقام فقط، مثال: 150)." : "Please enter a valid price in EGP (e.g. 150).";
      }

      setRowErrors((prev) => ({ ...prev, [index]: errMsg }));
      setSaveState("error");
      setSaveError(errMsg);
      return;
    }

    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });

    setSavingRowIndex(index);
    setSaveState("saving");
    setSaveError(null);

    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/workers/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: data.bio,
          yearsOfExperience: data.yearsOfExperience,
          education: data.education.filter((e) => e.trim()),
          achievements: data.achievements.filter((a) => a.trim()),
          galleryImages: data.galleryImages.filter(Boolean),
          galleryVideoUrl: data.galleryVideoUrl,
          contractInfo: data.contractInfo,
          certificates: data.certificates.filter((c) => c.title.trim() && c.imageUrl),
          serviceItems: data.serviceItems
            .filter((s) => s.name.trim() && s.price.trim())
            .map((s) => ({
              ...s,
              price: s.price.trim().replace(/\s*(ج\.م|EGP)$/i, "")
            }))
        })
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || payload.message || "Failed to save service line");
      }

      setSaveState("saved");
      setSavedRowIndex(index);
      window.setTimeout(() => {
        setSaveState("idle");
        setSavedRowIndex(null);
      }, 2000);
    } catch (err: any) {
      setSaveState("error");
      setSaveError(err.message || (isArabic ? "فشل حفظ الخدمة." : "Failed to save service line."));
    } finally {
      setSavingRowIndex(null);
    }
  }

  async function saveSingleEduRow(index: number) {
    const val = (data.education[index] ?? "").trim();
    if (!val) {
      const errMsg = isArabic ? "يرجى كتابة تفاصيل الشهادة أو التدريب أولاً" : "Please enter certification or education details";
      setEduRowErrors((prev) => ({ ...prev, [index]: errMsg }));
      return;
    }

    setEduRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });

    setEduSavingRowIndex(index);
    setSaveState("saving");
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/workers/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          education: data.education.filter((e) => e.trim())
        })
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || payload.message || "Failed to save entry");
      }
      setEduSavedRowIndex(index);
      setSaveState("saved");
      setTimeout(() => {
        setEduSavedRowIndex(null);
        setSaveState("idle");
      }, 2000);
    } catch (err: any) {
      setEduRowErrors((prev) => ({ ...prev, [index]: err.message || (isArabic ? "فشل حفظ الشهادة" : "Failed to save") }));
      setSaveState("error");
    } finally {
      setEduSavingRowIndex(null);
    }
  }

  async function saveSingleAchRow(index: number) {
    const val = (data.achievements[index] ?? "").trim();
    if (!val) {
      const errMsg = isArabic ? "يرجى كتابة عنوان الإنجاز أو الجائزة أولاً" : "Please enter achievement or award details";
      setAchRowErrors((prev) => ({ ...prev, [index]: errMsg }));
      return;
    }

    setAchRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });

    setAchSavingRowIndex(index);
    setSaveState("saving");
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/workers/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          achievements: data.achievements.filter((a) => a.trim())
        })
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || payload.message || "Failed to save achievement");
      }
      setAchSavedRowIndex(index);
      setSaveState("saved");
      setTimeout(() => {
        setAchSavedRowIndex(null);
        setSaveState("idle");
      }, 2000);
    } catch (err: any) {
      setAchRowErrors((prev) => ({ ...prev, [index]: err.message || (isArabic ? "فشل حفظ الإنجاز" : "Failed to save") }));
      setSaveState("error");
    } finally {
      setAchSavingRowIndex(null);
    }
  }

  async function saveSingleCertRow(index: number) {
    const cert = data.certificates[index];
    if (!cert) return;

    const hasTitle = Boolean(cert.title.trim());
    const hasImage = Boolean(cert.imageUrl);

    if (!hasTitle || !hasImage) {
      let errMsg = "";
      if (!hasTitle && !hasImage) {
        errMsg = isArabic ? "يرجى رفع صورة الشهادة وكتابة عنوان الشهادة" : "Please upload certificate image and enter title";
      } else if (!hasTitle) {
        errMsg = isArabic ? "يرجى كتابة عنوان الشهادة" : "Please enter certificate title";
      } else {
        errMsg = isArabic ? "يرجى رفع صورة الشهادة" : "Please upload certificate image";
      }

      setCertRowErrors((prev) => ({ ...prev, [index]: errMsg }));
      return;
    }

    setCertRowErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });

    setCertSavingRowIndex(index);
    setSaveState("saving");
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/workers/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificates: data.certificates.filter((c) => c.title.trim() && c.imageUrl)
        })
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || payload.message || "Failed to save certificate");
      }
      setCertSavedRowIndex(index);
      setSaveState("saved");
      setTimeout(() => {
        setCertSavedRowIndex(null);
        setSaveState("idle");
      }, 2000);
    } catch (err: any) {
      setCertRowErrors((prev) => ({ ...prev, [index]: err.message || (isArabic ? "فشل حفظ الشهادة" : "Failed to save") }));
      setSaveState("error");
    } finally {
      setCertSavingRowIndex(null);
    }
  }

  function updateList<K extends "education" | "achievements">(key: K, index: number, value: string) {
    updateData((prev) => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? value : item)) }));
  }

  function addListItem(key: "education" | "achievements") {
    updateData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  }

  function removeListItem(key: "education" | "achievements", index: number) {
    updateData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  }

  function addGalleryImage(url: string) {
    updateData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, url] }));
  }

  function removeGalleryImage(index: number) {
    updateData((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  }

  function addCertificate() {
    updateData((prev) => ({ ...prev, certificates: [...prev.certificates, { title: "", year: "", imageUrl: "" }] }));
  }

  function updateCertificate(index: number, patch: Partial<CertificateDraft>) {
    updateData((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c, i) => (i === index ? { ...c, ...patch } : c))
    }));
  }

  function removeCertificate(index: number) {
    updateData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  }

  function addServiceItem() {
    updateData((prev) => ({ ...prev, serviceItems: [...prev.serviceItems, { name: "", price: "", note: "" }] }));
  }

  function updateServiceItem(index: number, patch: Partial<ServiceItemDraft>) {
    updateData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.map((s, i) => (i === index ? { ...s, ...patch } : s))
    }));
    if (rowErrors[index]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  }

  function removeServiceItem(index: number) {
    updateData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.filter((_, i) => i !== index)
    }));
    if (rowErrors[index]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  }

  if (isLoading) {
    return (
      <WorkerProShell locale={locale}>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-black">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-sm font-bold">{isArabic ? "جاري تحميل الملف الشخصي..." : "Loading profile..."}</p>
        </div>
      </WorkerProShell>
    );
  }

  return (
    <WorkerProShell locale={locale}>
      <WorkerProTopStrip locale={locale} title={isArabic ? "صفحتي الشخصية" : "Public Profile"} />

      <section className="flex flex-col gap-4 border border-white/10 bg-black p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">
            {isArabic ? "يظهر هذا في ملفك العام" : "Shown on your public profile"}
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
            {isArabic ? "أكمل ملفك الشخصي" : "Complete your profile"}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-semibold text-white/50">
            {isArabic
              ? "أي قسم تتركه فارغًا لن يظهر للعملاء في صفحتك العامة. عبّئ الأقسام التي تريد عرضها."
              : "Any section you leave empty will not appear on your public profile. Fill in only the sections you want clients to see."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {workerId && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-black uppercase text-gold transition hover:bg-gold hover:text-black"
            >
              <Eye className="h-4 w-4" />
              <span>{isArabic ? "معاينة الملف" : "Preview Profile"}</span>
            </button>
          )}
          {saveState === "saving" ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-black text-gold shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
              {isArabic ? "جارٍ الحفظ تلقائياً..." : "Auto-saving..."}
            </span>
          ) : saveState === "error" && saveError ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-3.5 py-1.5 text-xs font-bold text-rose-300">
              {saveError}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-black text-emerald-400 shadow-sm">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              {isArabic ? "تم الحفظ تلقائياً ✓" : "Auto-saved ✓"}
            </span>
          )}
        </div>
      </section>

      {loadError && (
        <div className="border border-red-400/40 bg-red-500/10 p-4 text-sm font-bold text-red-200">{loadError}</div>
      )}
      {saveError && (
        <div className="border border-red-400/40 bg-red-500/10 p-4 text-sm font-bold text-red-200">{saveError}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkerProPanel title={isArabic ? "نبذة عنك" : "About you"} eyebrow={isArabic ? "التعريف الشخصي" : "bio"}>
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className={fieldLabelClass()}>{isArabic ? "نبذة تعريفية" : "Bio"}</span>
              <textarea
                value={data.bio}
                onChange={(e) => updateData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                placeholder={isArabic ? "اكتب نبذة مختصرة عن خبرتك وأسلوب عملك..." : "Write a short summary of your experience and how you work..."}
                className={textareaClass()}
              />
            </label>
            <label className="block space-y-2">
              <span className={fieldLabelClass()}>{isArabic ? "سنوات الخبرة" : "Years of experience"}</span>
              <input
                type="number"
                min={0}
                max={80}
                value={data.yearsOfExperience}
                onChange={(e) => updateData((prev) => ({ ...prev, yearsOfExperience: Math.max(0, Number(e.target.value) || 0) }))}
                className={textInputClass()}
              />
            </label>
          </div>
        </WorkerProPanel>

        <WorkerProPanel title={isArabic ? "العقد والضمان" : "Contract & Warranty"} eyebrow={isArabic ? "اختياري" : "optional"}>
          <textarea
            value={data.contractInfo}
            onChange={(e) => updateData((prev) => ({ ...prev, contractInfo: e.target.value }))}
            rows={5}
            placeholder={isArabic ? "وضّح تفاصيل العقد الرسمي ومدة الضمان التي تقدمها..." : "Describe the formal contract and warranty period you offer..."}
            className={textareaClass()}
          />
        </WorkerProPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <WorkerProPanel
          title={isArabic ? "الشهادات والتدريب" : "Education & Certifications"}
          eyebrow={isArabic ? "قائمة نصية" : "list"}
          action={
            <WorkerProAction tone="ghost" onClick={() => addListItem("education")}>
              <Plus className="h-4 w-4" />
              {isArabic ? "إضافة" : "Add"}
            </WorkerProAction>
          }
        >
          <div className="space-y-3">
            {data.education.length === 0 && (
              <p className="text-sm font-semibold text-white/40">{isArabic ? "لم تتم إضافة أي شهادات بعد." : "No entries added yet."}</p>
            )}
            {data.education.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 shrink-0 text-white/20" />
                  <input
                    value={item}
                    onChange={(e) => {
                      updateList("education", index, e.target.value);
                      if (eduRowErrors[index]) {
                        setEduRowErrors((prev) => {
                          const next = { ...prev };
                          delete next[index];
                          return next;
                        });
                      }
                    }}
                    placeholder={isArabic ? "مثال: شهادة اعتماد تركيب أنظمة • 2020" : "e.g. Certified installation accreditation • 2020"}
                    className={cn(textInputClass(), eduRowErrors[index] && "border-red-500 focus:border-red-500 bg-red-950/10")}
                  />
                  <button
                    type="button"
                    disabled={eduSavingRowIndex === index}
                    onClick={() => void saveSingleEduRow(index)}
                    title={isArabic ? "حفظ" : "Save"}
                    className={cn(
                      "flex h-12 px-3 items-center justify-center border text-xs font-bold transition gap-1.5 shrink-0",
                      eduSavedRowIndex === index
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : eduRowErrors[index]
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                    )}
                  >
                    {eduSavingRowIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : eduSavedRowIndex === index ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{eduSavedRowIndex === index ? (isArabic ? "تم" : "Saved") : (isArabic ? "حفظ" : "Save")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeListItem("education", index)}
                    className="shrink-0 p-2 text-white/40 hover:text-red-400"
                    title={isArabic ? "حذف" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {eduRowErrors[index] && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 p-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    <span>{eduRowErrors[index]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </WorkerProPanel>

        <WorkerProPanel
          title={isArabic ? "الإنجازات والجوائز" : "Achievements"}
          eyebrow={isArabic ? "قائمة نصية" : "list"}
          action={
            <WorkerProAction tone="ghost" onClick={() => addListItem("achievements")}>
              <Plus className="h-4 w-4" />
              {isArabic ? "إضافة" : "Add"}
            </WorkerProAction>
          }
        >
          <div className="space-y-3">
            {data.achievements.length === 0 && (
              <p className="text-sm font-semibold text-white/40">{isArabic ? "لم تتم إضافة أي إنجازات بعد." : "No entries added yet."}</p>
            )}
            {data.achievements.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 shrink-0 text-white/20" />
                  <input
                    value={item}
                    onChange={(e) => {
                      updateList("achievements", index, e.target.value);
                      if (achRowErrors[index]) {
                        setAchRowErrors((prev) => {
                          const next = { ...prev };
                          delete next[index];
                          return next;
                        });
                      }
                    }}
                    placeholder={isArabic ? "مثال: وسام التميز في جودة التنفيذ" : "e.g. Excellence award for quality of work"}
                    className={cn(textInputClass(), achRowErrors[index] && "border-red-500 focus:border-red-500 bg-red-950/10")}
                  />
                  <button
                    type="button"
                    disabled={achSavingRowIndex === index}
                    onClick={() => void saveSingleAchRow(index)}
                    title={isArabic ? "حفظ" : "Save"}
                    className={cn(
                      "flex h-12 px-3 items-center justify-center border text-xs font-bold transition gap-1.5 shrink-0",
                      achSavedRowIndex === index
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : achRowErrors[index]
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                    )}
                  >
                    {achSavingRowIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : achSavedRowIndex === index ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{achSavedRowIndex === index ? (isArabic ? "تم" : "Saved") : (isArabic ? "حفظ" : "Save")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeListItem("achievements", index)}
                    className="shrink-0 p-2 text-white/40 hover:text-red-400"
                    title={isArabic ? "حذف" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {achRowErrors[index] && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 p-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    <span>{achRowErrors[index]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </WorkerProPanel>
      </div>

      <WorkerProPanel title={isArabic ? "الصور والفيديو" : "Photos & Video"} eyebrow={isArabic ? "معرض الأعمال" : "portfolio"}>
        <div className="space-y-6">
          <div>
            <p className={fieldLabelClass()}>{isArabic ? "صور من أعمالك" : "Photos of your work"}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {data.galleryImages.map((url, index) => (
                <div key={index} className="group relative aspect-4/3 overflow-hidden border border-white/10 bg-black">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center bg-black/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <ImageUpload
                label=""
                value=""
                onChange={addGalleryImage}
                isArabic={isArabic}
                variant="auth"
                compact={false}
              />
            </div>
          </div>

          <label className="block space-y-2">
            <span className={fieldLabelClass()}>{isArabic ? "رابط فيديو (يوتيوب مثلاً)" : "Video link (e.g. YouTube)"}</span>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 shrink-0 text-white/40" />
              <input
                value={data.galleryVideoUrl}
                onChange={(e) => updateData((prev) => ({ ...prev, galleryVideoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
                className={textInputClass()}
              />
            </div>
            {data.galleryVideoUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/10 p-2 bg-[#080808]">
                <p className="mb-2 text-[10px] font-black uppercase text-gold">
                  {isArabic ? "معاينة الفيديو:" : "Video Preview:"}
                </p>
                <WorkerVideoPlayer videoUrl={data.galleryVideoUrl} isArabic={isArabic} />
              </div>
            )}
          </label>
        </div>
      </WorkerProPanel>

      <WorkerProPanel
        title={isArabic ? "الشهادات والوثائق" : "Documents & Certificates"}
        eyebrow={isArabic ? "صور موثقة" : "verified images"}
        action={
          <WorkerProAction tone="ghost" onClick={addCertificate}>
            <Plus className="h-4 w-4" />
            {isArabic ? "إضافة" : "Add"}
          </WorkerProAction>
        }
      >
        <div className="space-y-4">
          {data.certificates.length === 0 && (
            <p className="text-sm font-semibold text-white/40">{isArabic ? "لم تتم إضافة أي شهادات موثقة بعد." : "No certificates added yet."}</p>
          )}
          {data.certificates.map((cert, index) => (
            <div key={index} className="space-y-2 border border-white/10 bg-[#0d0d0d] p-4">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <div className="w-full sm:w-48 shrink-0">
                  <ImageUpload
                    label=""
                    value={cert.imageUrl}
                    onChange={(url) => {
                      updateCertificate(index, { imageUrl: url });
                      if (certRowErrors[index]) {
                        setCertRowErrors((prev) => {
                          const next = { ...prev };
                          delete next[index];
                          return next;
                        });
                      }
                    }}
                    isArabic={isArabic}
                    variant="auth"
                    compact
                  />
                </div>
                <input
                  value={cert.title}
                  onChange={(e) => {
                    updateCertificate(index, { title: e.target.value });
                    if (certRowErrors[index]) {
                      setCertRowErrors((prev) => {
                        const next = { ...prev };
                        delete next[index];
                        return next;
                      });
                    }
                  }}
                  placeholder={isArabic ? "عنوان الشهادة *" : "Certificate title *"}
                  className={cn(textInputClass(), "flex-1 min-w-0 h-12", certRowErrors[index] && !cert.title.trim() && "border-red-500 focus:border-red-500 bg-red-950/10")}
                />
                <input
                  value={cert.year}
                  onChange={(e) => updateCertificate(index, { year: e.target.value })}
                  placeholder={isArabic ? "السنة" : "Year"}
                  className={cn(textInputClass(), "w-full sm:w-28 shrink-0 h-12")}
                />
                <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={certSavingRowIndex === index}
                    onClick={() => void saveSingleCertRow(index)}
                    title={isArabic ? "حفظ" : "Save"}
                    className={cn(
                      "flex h-12 px-3 items-center justify-center border text-xs font-bold transition gap-1.5 shrink-0",
                      certSavedRowIndex === index
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : certRowErrors[index]
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                    )}
                  >
                    {certSavingRowIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : certSavedRowIndex === index ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{certSavedRowIndex === index ? (isArabic ? "تم" : "Saved") : (isArabic ? "حفظ" : "Save")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCertificate(index)}
                    className="flex h-12 w-12 items-center justify-center border border-white/10 text-white/40 hover:border-red-400 hover:text-red-400 transition shrink-0"
                    title={isArabic ? "حذف" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {certRowErrors[index] && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 p-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{certRowErrors[index]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </WorkerProPanel>

      <WorkerProPanel
        title={isArabic ? "الخدمات والأسعار" : "Services & Pricing"}
        eyebrow={isArabic ? "قائمة الأسعار" : "price list"}
        action={
          <WorkerProAction tone="ghost" onClick={addServiceItem}>
            <Plus className="h-4 w-4" />
            {isArabic ? "إضافة" : "Add"}
          </WorkerProAction>
        }
      >
        <div className="space-y-3">
          {data.serviceItems.length === 0 && (
            <p className="text-sm font-semibold text-white/40">{isArabic ? "لم تتم إضافة أي خدمات بعد." : "No services added yet."}</p>
          )}
          {data.serviceItems.map((service, index) => {
            const hasNameError = rowErrors[index] && !service.name.trim();
            const cleanPrice = service.price.trim().replace(/\s*(ج\.م|EGP)$/i, "");
            const hasPriceError = rowErrors[index] && (!cleanPrice || !/^\d+(\.\d{1,2})?$/.test(cleanPrice));

            return (
              <div key={index} className="grid gap-2 border border-white/10 bg-[#0d0d0d] p-4 sm:grid-cols-[2fr_1fr_2fr_auto]">
                <input
                  value={service.name}
                  onChange={(e) => updateServiceItem(index, { name: e.target.value })}
                  placeholder={isArabic ? "اسم الخدمة" : "Service name"}
                  className={cn(textInputClass(), hasNameError && "border-red-500 focus:border-red-500 bg-red-950/10")}
                />
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={service.price}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
                        updateServiceItem(index, { price: raw });
                      }
                    }}
                    placeholder={isArabic ? "السعر" : "Price"}
                    className={cn(textInputClass(), "pe-12 font-mono", hasPriceError && "border-red-500 focus:border-red-500 bg-red-950/10")}
                  />
                  <span className="absolute end-3 text-xs font-black text-gold pointer-events-none select-none">
                    {isArabic ? "ج.م" : "EGP"}
                  </span>
                </div>
                <input
                  value={service.note}
                  onChange={(e) => updateServiceItem(index, { note: e.target.value })}
                  placeholder={isArabic ? "ملاحظة (اختياري)" : "Note (optional)"}
                  className={textInputClass()}
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={savingRowIndex === index}
                    onClick={() => void saveSingleServiceRow(index)}
                    title={isArabic ? "حفظ هذه الخدمة" : "Save this service"}
                    className={cn(
                      "flex h-12 px-3 items-center justify-center border text-xs font-bold transition gap-1.5",
                      savedRowIndex === index
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : rowErrors[index]
                        ? "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                    )}
                  >
                    {savingRowIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : savedRowIndex === index ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{savedRowIndex === index ? (isArabic ? "تم" : "Saved") : (isArabic ? "حفظ" : "Save")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeServiceItem(index)}
                    title={isArabic ? "حذف" : "Remove"}
                    className="flex h-12 w-12 items-center justify-center border border-white/10 text-white/40 hover:border-red-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {rowErrors[index] && (
                  <div className="sm:col-span-4 mt-1 flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 p-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{rowErrors[index]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </WorkerProPanel>

      {/* Bottom Action Section: Preview Public Page Before Publication */}
      <section className="border border-white/10 bg-black p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Eye className="h-6 w-6 text-gold" />
              <h3 className="text-xl font-black uppercase text-white">
                {isArabic ? "معاينة الصفحة العامة قبل النشر" : "Preview Public Page Before Publication"}
              </h3>
            </div>
            <p className="max-w-2xl text-sm font-semibold text-white/60">
              {isArabic
                ? "تأكد من مظهر ملفك الشخصي وكيف يظهر للعملاء قبل مشاركته أو استقبال الطلبات عبر الصفحة العامة."
                : "Review your public profile appearance as clients see it before publishing or sharing your profile link."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {workerId && (
              <a
                href={`/${locale}/workers/${workerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-5 py-3 text-xs font-black uppercase text-white transition hover:border-gold hover:text-gold"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{isArabic ? "فتح في نافذة جديدة" : "Open in New Tab"}</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              disabled={!workerId}
              className="inline-flex items-center gap-2 border border-black bg-gold px-6 py-3 text-xs font-black uppercase text-black transition hover:bg-yellow-400 disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              <span>{isArabic ? "معاينة الصفحة العامة" : "Preview Public Page"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Public Profile Preview Modal */}
      {isPreviewOpen && workerId && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
          {/* Modal Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0d0d0d] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-gold/40 bg-gold/10 text-gold">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-white">
                  {isArabic ? "معاينة الملف الشخصي العام" : "Public Profile Preview"}
                </h2>
                <p className="text-xs text-white/50">
                  {isArabic ? "هكذا سيظهر ملفك الشخصي للعملاء على المنصة" : "This is how your profile appears to clients"}
                </p>
              </div>
              <span className="ms-2 hidden rounded border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-black uppercase text-gold sm:inline-block">
                {isArabic ? "معاينة قبل النشر" : "Pre-Publication Preview"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/${locale}/workers/${workerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-black uppercase text-white transition hover:border-gold hover:text-gold"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isArabic ? "فتح في نافذة جديدة" : "Open full page"}</span>
              </a>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-9 w-9 items-center justify-center border border-white/20 bg-white/5 text-white transition hover:bg-white/10 hover:text-gold"
                title={isArabic ? "إغلاق" : "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 sm:p-8">
            <div className="mx-auto max-w-6xl rounded-lg border border-white/10 bg-black p-4 sm:p-8 shadow-2xl">
              <WorkerProfileDetail locale={locale} workerId={workerId} />
            </div>
          </div>
        </div>
      )}
    </WorkerProShell>
  );
}
