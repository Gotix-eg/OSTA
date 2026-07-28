"use client";

import { useEffect, useState } from "react";
import { Check, GripVertical, Loader2, Plus, Save, Trash2, Video } from "lucide-react";

import { WorkerProAction, WorkerProPanel, WorkerProShell, WorkerProTopStrip } from "@/components/worker/worker-pro-ui";
import { ImageUpload } from "@/components/shared/image-upload";
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingRowIndex, setSavingRowIndex] = useState<number | null>(null);
  const [savedRowIndex, setSavedRowIndex] = useState<number | null>(null);

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

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const invalidPrice = data.serviceItems.find(
        (s) => s.name.trim() && (!s.price.trim() || !/^\d+(\.\d{1,2})?$/.test(s.price.trim().replace(/\s*(ج\.م|EGP)$/i, "")))
      );
      if (invalidPrice) {
        throw new Error(isArabic ? "يرجى إدخال سعر صحيح بالجنيه المصري (أرقام فقط، مثال: 150)" : "Please enter a valid numeric price in EGP for all services (e.g. 150)");
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

    if (!service.name.trim()) {
      setSaveState("error");
      setSaveError(isArabic ? "يرجى إدخال اسم الخدمة أولاً." : "Please enter the service name first.");
      return;
    }

    const cleanPrice = service.price.trim().replace(/\s*(ج\.م|EGP)$/i, "");
    if (!cleanPrice || !/^\d+(\.\d{1,2})?$/.test(cleanPrice)) {
      setSaveState("error");
      setSaveError(isArabic ? "يرجى إدخال سعر صحيح بالجنيه المصري (مثال: 150)." : "Please enter a valid price in EGP (e.g. 150).");
      return;
    }

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

  function updateList<K extends "education" | "achievements">(key: K, index: number, value: string) {
    setData((prev) => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? value : item)) }));
  }

  function addListItem(key: "education" | "achievements") {
    setData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  }

  function removeListItem(key: "education" | "achievements", index: number) {
    setData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  }

  function addGalleryImage(url: string) {
    setData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, url] }));
  }

  function removeGalleryImage(index: number) {
    setData((prev) => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  }

  function addCertificate() {
    setData((prev) => ({ ...prev, certificates: [...prev.certificates, { title: "", year: "", imageUrl: "" }] }));
  }

  function updateCertificate(index: number, patch: Partial<CertificateDraft>) {
    setData((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c, i) => (i === index ? { ...c, ...patch } : c))
    }));
  }

  function removeCertificate(index: number) {
    setData((prev) => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));
  }

  function addServiceItem() {
    setData((prev) => ({ ...prev, serviceItems: [...prev.serviceItems, { name: "", price: "", note: "" }] }));
  }

  function updateServiceItem(index: number, patch: Partial<ServiceItemDraft>) {
    setData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.map((s, i) => (i === index ? { ...s, ...patch } : s))
    }));
  }

  function removeServiceItem(index: number) {
    setData((prev) => ({ ...prev, serviceItems: prev.serviceItems.filter((_, i) => i !== index) }));
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
          {saveState === "saved" && (
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
              <Check className="h-4 w-4" />
              {isArabic ? "تم الحفظ" : "Saved"}
            </span>
          )}
          <WorkerProAction tone="light" onClick={handleSave} disabled={saveState === "saving"}>
            {saveState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saveState === "saving" ? (isArabic ? "جارٍ الحفظ" : "Saving") : isArabic ? "حفظ" : "Save"}
          </WorkerProAction>
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
                onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
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
                onChange={(e) => setData((prev) => ({ ...prev, yearsOfExperience: Math.max(0, Number(e.target.value) || 0) }))}
                className={textInputClass()}
              />
            </label>
          </div>
        </WorkerProPanel>

        <WorkerProPanel title={isArabic ? "العقد والضمان" : "Contract & Warranty"} eyebrow={isArabic ? "اختياري" : "optional"}>
          <textarea
            value={data.contractInfo}
            onChange={(e) => setData((prev) => ({ ...prev, contractInfo: e.target.value }))}
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
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-white/20" />
                <input
                  value={item}
                  onChange={(e) => updateList("education", index, e.target.value)}
                  placeholder={isArabic ? "مثال: شهادة اعتماد تركيب أنظمة • 2020" : "e.g. Certified installation accreditation • 2020"}
                  className={textInputClass()}
                />
                <button type="button" onClick={() => removeListItem("education", index)} className="shrink-0 p-2 text-white/40 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
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
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-white/20" />
                <input
                  value={item}
                  onChange={(e) => updateList("achievements", index, e.target.value)}
                  placeholder={isArabic ? "مثال: وسام التميز في جودة التنفيذ" : "e.g. Excellence award for quality of work"}
                  className={textInputClass()}
                />
                <button type="button" onClick={() => removeListItem("achievements", index)} className="shrink-0 p-2 text-white/40 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
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
                onChange={(e) => setData((prev) => ({ ...prev, galleryVideoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
                className={textInputClass()}
              />
            </div>
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
            <div key={index} className="grid gap-3 border border-white/10 bg-[#0d0d0d] p-4 sm:grid-cols-[auto_1fr_auto]">
              <ImageUpload
                label={isArabic ? "صورة الشهادة" : "Certificate image"}
                value={cert.imageUrl}
                onChange={(url) => updateCertificate(index, { imageUrl: url })}
                isArabic={isArabic}
                variant="auth"
                compact
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={cert.title}
                  onChange={(e) => updateCertificate(index, { title: e.target.value })}
                  placeholder={isArabic ? "عنوان الشهادة" : "Certificate title"}
                  className={textInputClass()}
                />
                <input
                  value={cert.year}
                  onChange={(e) => updateCertificate(index, { year: e.target.value })}
                  placeholder={isArabic ? "السنة" : "Year"}
                  className={textInputClass()}
                />
              </div>
              <button type="button" onClick={() => removeCertificate(index)} className="flex h-12 w-12 shrink-0 items-center justify-center self-start border border-white/10 text-white/40 hover:border-red-400 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
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
          {data.serviceItems.map((service, index) => (
            <div key={index} className="grid gap-2 border border-white/10 bg-[#0d0d0d] p-4 sm:grid-cols-[2fr_1fr_2fr_auto]">
              <input
                value={service.name}
                onChange={(e) => updateServiceItem(index, { name: e.target.value })}
                placeholder={isArabic ? "اسم الخدمة" : "Service name"}
                className={textInputClass()}
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
                  className={cn(textInputClass(), "pe-12 font-mono")}
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
                  onClick={() => removeServiceItem(index)}
                  title={isArabic ? "حذف" : "Remove"}
                  className="flex h-12 w-12 items-center justify-center border border-white/10 text-white/40 hover:border-red-400 hover:text-red-400 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </WorkerProPanel>
    </WorkerProShell>
  );
}
