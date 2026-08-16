"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, Clock3, Loader2, ShieldCheck, ShieldQuestion, Star, Users, XCircle, Eye, EyeOff, FileText, X, Sparkles, Edit } from "lucide-react";
import { WorkerVerificationWizard, type WorkerForWizard } from "./worker-verification-wizard";
import { WorkerHistoryLogs } from "./worker-history-logs";
import { ImageCropModal } from "@/components/image-crop-modal";

import {
  DashboardBlock,
  EmptyState,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo
} from "@/components/dashboard/dashboard-subpage-primitives";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { patchApiData } from "@/lib/api";
import type { DashboardVerificationStatus, DashboardWorkerSpecialtyCode } from "@/lib/dashboard-data";
import type { Locale } from "@/lib/locales";
import type { PendingWorkersData } from "@/lib/operations-data";
import { cn } from "@/lib/utils";

const specialtyLabels: Record<DashboardWorkerSpecialtyCode, Record<Locale, string>> = {
  acTechnician: { ar: "تكييف وتبريد", en: "AC & Cooling" },
  electrician: { ar: "كهرباء", en: "Electricity" },
  plumber: { ar: "سباكة", en: "Plumbing" },
  carpenter: { ar: "نجارة", en: "Carpentry" },
  painter: { ar: "دهانات وديكور", en: "Painting & Decor" },
  aluminum: { ar: "ألوميتال", en: "Aluminum" },
  computerRepair: { ar: "صيانة كمبيوتر", en: "Computer Repair" },
  networks: { ar: "شبكات كمبيوتر", en: "Computer Networks" },
  cctv: { ar: "تركيب كاميرات", en: "Camera Installation" },
  applianceRepair: { ar: "صيانة أجهزة منزلية", en: "Appliance Repair" },
  cleaning: { ar: "عامل نظافة", en: "Cleaning Worker" },
  gypsum: { ar: "فني جبس", en: "Gypsum Worker" },
  ceramic: { ar: "مبلط سيراميك", en: "Ceramic Installer" },
  plastering: { ar: "أعمال محارة", en: "Plasterer" },
  ironwork: { ar: "حدادة", en: "Ironworker" },
  finishing: { ar: "تشطيبات شاملة", en: "Finishing Specialist" },
  moving: { ar: "نقل عفش وتغليف", en: "Furniture Mover" },
  carMechanic: { ar: "ميكانيكي سيارات", en: "Car Mechanic" },
  bikeMechanic: { ar: "ميكانيكي موتوسيكلات", en: "Motorcycle Mechanic" },
  engineRepair: { ar: "صيانة مواتير", en: "Engine Repair Specialist" }
};

const statusLabels: Record<DashboardVerificationStatus, Record<Locale, string>> = {
  UNDER_REVIEW: { ar: "قيد المراجعة", en: "Under review" },
  DOCUMENTS_SUBMITTED: { ar: "المستندات مكتملة", en: "Docs submitted" },
  AWAITING_ID: { ar: "بانتظار تأكيد الهوية", en: "Awaiting ID check" }
};

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function cleanImageUrl(url: string): string {
  if (!url) return "";
  return url;
}

export function PendingWorkersPage({ locale, initialData }: { locale: Locale; initialData: PendingWorkersData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/admin/workers/pending", initialData);
  const [data, setData] = useState(initialData);
  const [activeFilter, setActiveFilter] = useState<DashboardVerificationStatus | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<PendingWorkersData["workers"][number] | null>(null);
  const [wizardWorker, setWizardWorker] = useState<WorkerForWizard | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ key: string; url: string; label: string } | null>(null);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  const filteredWorkers = useMemo(
    () => data.workers.filter((item) => activeFilter === "ALL" || item.status === activeFilter),
    [activeFilter, data.workers]
  );

  async function handleDecision(id: string, status: "VERIFIED" | "REJECTED") {
    setBusyId(id);
    setFeedback(null);

    try {
      const nextData = await patchApiData<PendingWorkersData, { status: "VERIFIED" | "REJECTED" }>(`/admin/workers/${id}/verify`, {
        status
      });

      setData(nextData);
      setFeedback(status === "VERIFIED" ? (isArabic ? "تم تفعيل حساب العامل بنجاح" : "Worker verified") : isArabic ? "تم رفض حساب العامل" : "Worker rejected");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : isArabic ? "حدثت مشكلة أثناء المعالجة" : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePhotoEditConfirm(blob: Blob) {
    if (!editingDoc || !selectedWorker) return;
    setBusyId(selectedWorker.id);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "edited-doc.jpg", { type: "image/jpeg" }));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Failed to upload edited photo");
      const uploadData = await uploadRes.json();
      const newUrl = uploadData.url;

      const patchRes = await patchApiData(`/admin/workers/${selectedWorker.id}`, {
        [editingDoc.key]: newUrl
      });
      
      if (patchRes.ok && patchRes.data) {
        setData(prev => ({
          ...prev,
          workers: prev.workers.map(w => w.id === selectedWorker.id ? { ...w, ...patchRes.data } : w)
        }));
        setSelectedWorker({ ...selectedWorker, ...patchRes.data });
      }
    } catch (err) {
      alert(isArabic ? "فشل تحديث الصورة" : "Failed to update photo");
    } finally {
      setBusyId(null);
      setEditingDoc(null);
    }
  }

  return (
    <div>


      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "إجمالي المعلق" : "Total pending"} value={formatNumber(locale, data.summary.totalPending)} note={isArabic ? "كامل قائمة الانتظار" : "full queue"} icon={Users} tone="sun" />
        <MiniMetric label={isArabic ? "أولوية عالية" : "High priority"} value={formatNumber(locale, data.summary.highPriority)} note={isArabic ? "تحتاج إلى اهتمام" : "needs attention"} icon={ShieldQuestion} tone="primary" />
        <MiniMetric label={isArabic ? "وصل اليوم" : "Submitted today"} value={formatNumber(locale, data.summary.submittedToday)} note={isArabic ? "توثيقات جديدة" : "fresh arrivals"} icon={Clock3} tone="accent" />
        <MiniMetric label={isArabic ? "متوسط وقت المراجعة" : "Avg review time"} value={isArabic ? `${formatNumber(locale, data.summary.averageReviewHours)} ساعة` : `${formatNumber(locale, data.summary.averageReviewHours)} hrs`} note={isArabic ? "سرعة المراجعة الحالية" : "current review speed"} icon={CheckCircle2} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "تصفية القائمة" : "Queue filters"} eyebrow={isArabic ? "عرض الفئات" : "segment view"}>
        <div className="flex flex-wrap gap-3">
          {(["ALL", "UNDER_REVIEW", "DOCUMENTS_SUBMITTED", "AWAITING_ID"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveFilter(status)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                activeFilter === status
                  ? "bg-dark-950 text-white shadow-soft"
                  : "border border-onyx-700 bg-onyx-800/50 text-onyx-300 hover:border-primary-300 hover:text-primary-700"
              )}
            >
              {status === "ALL"
                ? isArabic
                  ? "الكل"
                  : "All"
                : statusLabels[status][locale]}
            </button>
          ))}
        </div>
      </DashboardBlock>

      <DashboardBlock title={isArabic ? "طابور التوثيق" : "Verification queue"} eyebrow={isArabic ? "لوحة القرارات" : "decision deck"} className="mt-6">
        {feedback ? <div className="mb-4 rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 px-4 py-3 text-sm text-onyx-300">{feedback}</div> : null}
        {filteredWorkers.length === 0 ? (
          <EmptyState>{isArabic ? "لا توجد طلبات توثيق مطابقة للتصفية حالياً" : "No workers in this filter"}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {filteredWorkers.map((worker, index) => (
              <article key={worker.id} className={index % 2 === 0 ? "onyx-card p-5" : "onyx-card bg-onyx-800/80 p-5"}>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-white">{worker.name}</h2>
                      <SoftBadge
                        label={statusLabels[worker.status][locale]}
                        tone={worker.status === "AWAITING_ID" ? "error" : worker.status === "UNDER_REVIEW" ? "sun" : "accent"}
                      />
                    </div>
                    <p className="mt-2 text-body text-onyx-400">{specialtyLabels[worker.specialty][locale]} - {worker.area}</p>
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "تاريخ التقديم" : "Submitted", value: worker.submittedAt },
                          { label: isArabic ? "المستندات" : "Docs", value: `${formatNumber(locale, worker.documentsReady)}/5` },
                          { label: isArabic ? "الخبرة" : "Experience", value: isArabic ? `${formatNumber(locale, worker.experienceYears)} سنوات` : `${formatNumber(locale, worker.experienceYears)} years` },
                          { label: isArabic ? "التقييم" : "Rating", value: formatNumber(locale, worker.rating) }
                        ]}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-onyx-400">
                      <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {isArabic ? "مسار التحقق من الهوية والمستندات" : "identity + docs lane"}</span>
                      <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-sun-500" /> {formatNumber(locale, worker.rating)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 xl:w-[22rem] xl:justify-end">
                    <button
                      type="button"
                      onClick={() => setWizardWorker(worker)}
                      className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2.5 text-sm font-black text-gold-400 shadow-lg hover:scale-105 transition-all"
                    >
                      <Sparkles className="h-4 w-4 text-gold-400" />
                      {isArabic ? "التوثيق" : "Verification"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWorker(worker)}
                      className="inline-flex items-center gap-2 rounded-full border border-onyx-700 bg-onyx-800/50 px-3.5 py-2 text-sm font-semibold text-onyx-300 shadow-soft"
                    >
                      <Eye className="h-4 w-4" />
                      {isArabic ? "عرض المستندات" : "View Docs"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDecision(worker.id, "REJECTED")}
                      disabled={busyId === worker.id}
                      className="inline-flex items-center gap-2 rounded-full border border-onyx-700 bg-onyx-800/50 px-3.5 py-2 text-sm font-semibold text-onyx-200 shadow-soft disabled:opacity-60"
                    >
                      {busyId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {isArabic ? "رفض" : "Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDecision(worker.id, "VERIFIED")}
                      disabled={busyId === worker.id}
                      className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                    >
                      {busyId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {isArabic ? "تفعيل" : "Approve"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardBlock>

      {/* Verification Wizard Modal */}
      {wizardWorker && (
        <WorkerVerificationWizard
          locale={locale}
          worker={wizardWorker}
          isOpen={Boolean(wizardWorker)}
          onClose={() => setWizardWorker(null)}
          onWorkerUpdated={(updated) => {
            setData(prev => ({
              ...prev,
              workers: prev.workers.map(w => w.id === updated.id
                ? {
                    ...w,
                    nationalIdNumber: updated.nationalIdNumber ?? w.nationalIdNumber,
                    nationalIdFront: updated.nationalIdFront ?? w.nationalIdFront,
                    nationalIdBack: updated.nationalIdBack ?? w.nationalIdBack,
                    selfieWithId: updated.selfieWithId ?? w.selfieWithId,
                    criminalRecord: updated.criminalRecord ?? w.criminalRecord,
                    utilityBillUrl: updated.utilityBillUrl ?? w.utilityBillUrl,
                    guarantorName: updated.guarantorName ?? w.guarantorName,
                    guarantorPhone: updated.guarantorPhone ?? w.guarantorPhone,
                    status: (updated.status as DashboardVerificationStatus) || w.status
                  }
                : w)
            }));
            setWizardWorker(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
          }}
        />
      )}

      {/* Worker Details & Documents Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-onyx-900 border border-white/5 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 space-y-8 text-start relative">
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-6 end-6 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                {isArabic ? "بيانات ومستندات التوثيق" : "Verification Data & Documents"}
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                {selectedWorker.name}
              </h2>
              <p className="text-onyx-400 text-sm mt-1">
                {specialtyLabels[selectedWorker.specialty][locale]} - {selectedWorker.area}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Profile Details */}
              <div className="space-y-6 bg-onyx-950/40 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="h-4 w-1 bg-gold-500 rounded-full" />
                  {isArabic ? "المعلومات الشخصية والضامن" : "Personal Info & Guarantor"}
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-onyx-400">{isArabic ? "الرقم القومي" : "National ID Number"}</span>
                    <span className="text-white font-bold">{selectedWorker.nationalIdNumber || (isArabic ? "غير متوفر" : "N/A")}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-onyx-400">{isArabic ? "سنوات الخبرة" : "Years of Experience"}</span>
                    <span className="text-white font-bold">{selectedWorker.experienceYears} {isArabic ? "سنوات" : "years"}</span>
                  </div>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex flex-col justify-between p-6 bg-onyx-950/40 rounded-3xl border border-white/5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="h-4 w-1 bg-gold-500 rounded-full" />
                    {isArabic ? "اتخاذ القرار" : "Decision Panel"}
                  </h3>
                  <p className="text-xs text-onyx-400 mt-2 leading-relaxed">
                    {isArabic 
                      ? "يرجى التحقق من صحة المستندات المرفقة وصلاحية الرقم القومي والفيش الجنائي قبل الموافقة." 
                      : "Please verify all documents are correct and the national ID is valid before approving."}
                  </p>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      void handleDecision(selectedWorker.id, "REJECTED");
                      setSelectedWorker(null);
                    }}
                    disabled={busyId === selectedWorker.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-onyx-700 bg-onyx-800/50 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    {isArabic ? "رفض الطلب" : "Reject"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDecision(selectedWorker.id, "VERIFIED");
                      setSelectedWorker(null);
                    }}
                    disabled={busyId === selectedWorker.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-500 py-3 text-sm font-black text-onyx-950 shadow-lg hover:bg-gold-400 transition-colors disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isArabic ? "توثيق وتفعيل" : "Verify & Approve"}
                  </button>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="h-4 w-1.5 bg-gold-500 rounded-full" />
                {isArabic ? "المستندات والملفات المرفوعة" : "Uploaded Files & Documents"}
              </h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { key: "nationalIdFront", label: isArabic ? "صورة البطاقة (الأمام)" : "National ID Front", url: selectedWorker.nationalIdFront },
                  { key: "nationalIdBack", label: isArabic ? "صورة البطاقة (الخلف)" : "National ID Back", url: selectedWorker.nationalIdBack },
                  { key: "selfieWithId", label: isArabic ? "سيلفي مع البطاقة" : "Selfie with ID", url: selectedWorker.selfieWithId },
                  { key: "criminalRecord", label: isArabic ? "الفيش والتشبيه" : "Criminal Record (Fish)", url: selectedWorker.criminalRecord },
                  { key: "utilityBillUrl", label: isArabic ? "إيصال المرافق" : "Utility Bill", url: selectedWorker.utilityBillUrl }
                ].map((doc, idx) => (
                  <div key={idx} className="onyx-card p-4 flex flex-col justify-between min-h-[160px] bg-onyx-950/20 border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-onyx-400 uppercase">{doc.label}</span>
                      {doc.url && (
                        <button
                          type="button"
                          onClick={() => setEditingDoc({ key: doc.key, url: doc.url!, label: doc.label })}
                          className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-0.5 hover:bg-gold hover:text-black transition flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          {isArabic ? "تعديل" : "Edit"}
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-onyx-600 mt-0.5">
                        {doc.url ? (isArabic ? "ملف مرفوع" : "Uploaded") : (isArabic ? "لم يرفع بعد" : "Not uploaded")}
                      </p>
                    </div>

                    {doc.url ? (
                      <div className="mt-4 space-y-2">
                        {doc.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || doc.url.startsWith("data:image") ? (
                          <div className="h-20 w-full rounded-xl overflow-hidden border border-white/5 bg-onyx-900 flex items-center justify-center">
                            <img src={cleanImageUrl(doc.url)} alt={doc.label} className="h-full w-full object-cover" />
                          </div>
                        ) : null}
                        
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-gold-500 bg-gold-500/10 border border-gold-500/20 rounded-xl hover:bg-gold-500 hover:text-onyx-950 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isArabic ? "عرض بالحجم الكامل" : "View Fullscreen"}
                        </a>
                      </div>
                    ) : (
                      <div className="mt-4 py-3 text-center text-xs text-onyx-600 border border-dashed border-white/5 rounded-xl">
                        {isArabic ? "مستند فارغ" : "Empty document"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <WorkerHistoryLogs 
              workerId={selectedWorker.id} 
              createdAt={selectedWorker.createdAt} 
              lastLoginAt={selectedWorker.lastLoginAt} 
              locale={locale} 
            />

            {/* Photo Edit Modal */}
            {editingDoc && (
              <ImageCropModal
                imageSrc={editingDoc.url}
                isArabic={isArabic}
                onCancel={() => setEditingDoc(null)}
                onConfirm={handlePhotoEditConfirm}
                aspectRatio={undefined}
                titleAr={`تعديل ${editingDoc.label}`}
                titleEn={`Edit ${editingDoc.label}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
