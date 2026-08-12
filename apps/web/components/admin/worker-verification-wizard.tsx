"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  PhoneCall,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
  Camera,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  Loader2,
  History,
  Award,
  BadgeCheck,
  Briefcase,
  MapPin,
  ExternalLink,
  Sparkles,
  Lock,
  MessageSquare,
  Crop
} from "lucide-react";
import { formatAuditActionName } from "./worker-history-logs";
import { AdminImageEditModal } from "./admin-image-edit-modal";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { postApiData, fetchApiData, patchApiData } from "@/lib/api";

export type VerificationStepKey = "phone" | "avatar" | "national_id" | "documents" | "public_profile";

export interface StepVerificationRecord {
  stepKey: string;
  stepName: string;
  status: "VERIFIED" | "REJECTED" | "FLAGGED";
  verifiedAt: string;
  verifiedByAdminId: string;
  verifiedByAdminName: string;
  notes?: string;
}

export interface WorkerForWizard {
  id: string;
  userId?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  profession?: string | null;
  specialty?: string;
  bio?: string | null;
  experienceYears?: number;
  rating?: number;
  documentsReady?: number;
  submittedAt?: string;
  status: string; // PENDING, UNDER_REVIEW, VERIFIED, REJECTED
  nationalIdNumber?: string | null;
  nationalIdFront?: string | null;
  nationalIdBack?: string | null;
  selfieWithId?: string | null;
  criminalRecord?: string | null;
  utilityBillUrl?: string | null;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
  stepVerifications?: Record<string, StepVerificationRecord> | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  newData?: {
    stepKey?: string;
    stepName?: string;
    status?: string;
    notes?: string;
    adminName?: string;
    adminEmail?: string;
    timestamp?: string;
  };
  createdAt: string;
}

interface WorkerVerificationWizardProps {
  locale: Locale;
  worker: WorkerForWizard;
  isOpen: boolean;
  onClose: () => void;
  onWorkerUpdated?: (updatedWorker: WorkerForWizard) => void;
}

const STEP_DEFINITIONS: Array<{
  key: VerificationStepKey;
  num: number;
  titleAr: string;
  titleEn: string;
  shortAr: string;
  shortEn: string;
  descAr: string;
  descEn: string;
  icon: any;
}> = [
    {
      key: "phone",
      num: 1,
      titleAr: "التحقق من رقم الهاتف والمكالمة",
      titleEn: "Phone & Call Verification",
      shortAr: "الهاتف",
      shortEn: "Phone",
      descAr: "الاتصال بالعامل هاتفياً للتأكد من هوية صاحب الرقم واستجابته",
      descEn: "Call worker to confirm phone ownership & voice responsiveness",
      icon: PhoneCall
    },
    {
      key: "national_id",
      num: 2,
      titleAr: "بطاقة الرقم القومي والاسم الثلاثي",
      titleEn: "National ID & Name Check",
      shortAr: "الهوية",
      shortEn: "ID",
      descAr: "فحص الرقم القومي وصور الوجه والظهر وتأكيد مطابقة الاسم",
      descEn: "Inspect National ID scans & check name match",
      icon: ShieldCheck
    },
    {
      key: "avatar",
      num: 3,
      titleAr: "التحقق من صورة الملف الشخصي والسيلفي",
      titleEn: "Avatar & Selfie Verification",
      shortAr: "السيلفي",
      shortEn: "Selfie",
      descAr: "مطابقة صورة الحساب مع الصورة الشخصية مع بطاقة الرقم القومي",
      descEn: "Verify profile photo matches selfie holding ID card",
      icon: Camera
    },
    {
      key: "documents",
      num: 4,
      titleAr: "الفيش الجنائي والمرافق والضامن",
      titleEn: "Criminal Record & Background",
      shortAr: "المستندات",
      shortEn: "Docs",
      descAr: "مراجعة صحيفة الحالة الجنائية وإيصال المرافق وبيانات الضامن",
      descEn: "Check Criminal record, Utility bill & Guarantor details",
      icon: FileText
    },
    {
      key: "public_profile",
      num: 5,
      titleAr: "مراجعة الصفحة العامة للفني",
      titleEn: "Public Profile Review",
      shortAr: "الصفحة العامة",
      shortEn: "Profile",
      descAr: "مراجعة شكل الصفحة العامة للفني، النبذة، ومعرض الأعمال للتأكد من الجودة",
      descEn: "Review worker's public page, bio, and gallery to ensure quality",
      icon: ExternalLink
    }
  ];

export function WorkerVerificationWizard({
  locale,
  worker,
  isOpen,
  onClose,
  onWorkerUpdated
}: WorkerVerificationWizardProps) {
  const isArabic = locale === "ar";
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const [stepVerifications, setStepVerifications] = useState<Record<string, StepVerificationRecord>>(
    worker.stepVerifications || {}
  );

  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingImage, setEditingImage] = useState<{ url: string; field: string; aspect?: number } | null>(null);

  useEffect(() => {
    if (worker.stepVerifications) {
      setStepVerifications(worker.stepVerifications);
    }
  }, [worker]);

  useEffect(() => {
    if (isOpen && worker.id) {
      fetchAuditLogs();
    }
  }, [isOpen, worker.id]);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetchApiData<AuditLogEntry[]>(
        `/admin/workers/${worker.id}/audit-logs`,
        []
      );
      const list = Array.isArray(res) ? res : (res as any).data || [];
      setAuditLogs(list);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (!isOpen) return null;

  const currentStep = (STEP_DEFINITIONS[currentStepIndex] || STEP_DEFINITIONS[0])!;

  const handleStepAction = async (
    stepKey: VerificationStepKey,
    status: "VERIFIED" | "REJECTED" | "FLAGGED"
  ) => {
    setLoadingStep(stepKey);
    setFeedback(null);
    try {
      const noteText = stepNotes[stepKey] || "";
      const response = await postApiData<
        {
          worker: WorkerForWizard;
          stepVerifications: Record<string, StepVerificationRecord>;
          stepRecord: StepVerificationRecord;
        },
        {
          stepKey: VerificationStepKey;
          status: "VERIFIED" | "REJECTED" | "FLAGGED";
          notes?: string;
        }
      >(`/admin/workers/${worker.id}/verify-step`, {
        stepKey,
        status,
        notes: noteText
      });

      if (response && response.stepVerifications) {
        setStepVerifications(response.stepVerifications);
        if (response.worker && onWorkerUpdated) {
          onWorkerUpdated(response.worker);
        }
      } else {
        setStepVerifications(prev => ({
          ...prev,
          [stepKey]: {
            stepKey,
            stepName: currentStep.titleAr,
            status,
            verifiedAt: new Date().toISOString(),
            verifiedByAdminId: "admin",
            verifiedByAdminName: "أدمن النظام",
            notes: noteText
          }
        }));
      }

      setFeedback({
        type: "success",
        text: status === "VERIFIED"
          ? (isArabic ? `تم توثيق واعتماد خطوة "${currentStep.titleAr}" بنجاح!` : `Step "${currentStep.titleEn}" verified successfully!`)
          : (isArabic ? `تم تسجيل ملاحظة على الخطوة "${currentStep.titleAr}"` : `Logged note for "${currentStep.titleEn}"`)
      });

      fetchAuditLogs();

      // Auto advance to next step or close if verifying
      if (status === "VERIFIED") {
        if (currentStepIndex < STEP_DEFINITIONS.length - 1) {
          setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
          }, 600);
        } else {
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || (isArabic ? "فشل حفظ خطوة التوثيق" : "Failed to save verification step")
      });
    } finally {
      setLoadingStep(null);
    }
  };

  const isStepDone = (key: VerificationStepKey) => {
    return stepVerifications[key]?.status === "VERIFIED";
  };

  const handleEditPhotoConfirm = async (blob: Blob) => {
    if (!editingImage) return;
    const { field } = editingImage;
    setLoadingStep(field);
    try {
      const formData = new FormData();
      formData.append("file", blob, `edited-${field}.jpg`);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");

      const newUrl = data.data.url;

      const patchRes = await patchApiData(`/admin/workers/${worker.id}`, {
        [field]: newUrl
      });
      
      if (!patchRes) throw new Error("Failed to patch worker");

      setFeedback({ type: "success", text: isArabic ? "تم حفظ الصورة والتعديلات بنجاح!" : "Photo saved successfully!" });
      
      if (onWorkerUpdated) {
        onWorkerUpdated({ ...worker, [field]: newUrl });
      }
    } catch (err) {
      console.error("Failed to edit photo", err);
      setFeedback({ type: "error", text: isArabic ? "فشل حفظ الصورة" : "Failed to save photo" });
    } finally {
      setEditingImage(null);
      setLoadingStep(null);
    }
  };

  const getStepBadge = (key: VerificationStepKey) => {
    const rec = stepVerifications[key];
    if (!rec) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Clock3 className="h-3 w-3" />
          {isArabic ? "بانتظار" : "Pending"}
        </span>
      );
    }
    if (rec.status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="h-3 w-3" />
          {isArabic ? "موثق ✓" : "Verified ✓"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
        <XCircle className="h-3 w-3" />
        {isArabic ? "مرجأ" : "Flagged"}
      </span>
    );
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div className="bg-onyx-950 border border-gold-500/20 rounded-[1.5rem] w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">

        <div className="bg-onyx-900/90 border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={worker.avatarUrl || worker.selfieWithId || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=1f1f23&color=eab308&bold=true`}
                alt={worker.name}
                className="h-9 w-9 rounded-xl object-cover border-2 border-gold-500/40 shadow-md"
              />
              {worker.status === "VERIFIED" && (
                <div className="absolute -bottom-1 -end-1 bg-emerald-500 text-onyx-950 p-0.5 rounded-full ring-2 ring-onyx-950">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white truncate">{worker.name}</h2>
                <span className={cn(
                  "hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0",
                  worker.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                )}>
                  {worker.status === "VERIFIED" ? (isArabic ? "موثق بالكامل" : "Fully Verified") : (isArabic ? "قيد التوثيق" : "In Verification")}
                </span>
              </div>
              <p className="text-[11px] text-onyx-400 flex items-center gap-1.5 truncate">
                <span>{worker.profession || worker.specialty}</span>
                {worker.phone && <span className="dir-ltr text-onyx-300">• {worker.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border",
                showAuditLogs
                  ? "bg-gold-500 text-onyx-950 border-gold-400"
                  : "bg-onyx-800 text-onyx-300 border-onyx-700 hover:text-white"
              )}
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isArabic ? "سجل التوثيق" : "Audit"}</span>
              <span className="bg-onyx-950/40 px-1.5 py-0.5 rounded-md text-[9px] font-black">{auditLogs.length}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-onyx-800 border border-onyx-700 text-onyx-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-onyx-900/50 border-b border-white/5 px-3 py-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            {STEP_DEFINITIONS.map((s, idx) => {
              const isDone = isStepDone(s.key);
              const isActive = idx === currentStepIndex;

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border",
                    isActive
                      ? "bg-gold-500/15 border-gold-500 text-gold-400 shadow-sm shadow-gold-500/10"
                      : isDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-onyx-800/40 border-white/5 text-onyx-400 hover:bg-onyx-800 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0",
                    isDone ? "bg-emerald-500 text-onyx-950" : isActive ? "bg-gold-500 text-onyx-950" : "bg-onyx-800 text-onyx-300"
                  )}>
                    {isDone ? <CheckCircle2 className="h-3 w-3" /> : s.num}
                  </div>
                  <span>{isArabic ? s.shortAr : s.shortEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 relative">

          {feedback && (
            <div className={cn(
              "px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between animate-fadeIn",
              feedback.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}>
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="text-current opacity-70 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {showAuditLogs ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <History className="h-4 w-4 text-gold-500" />
                    {isArabic ? "سجل تدقيق وتوقيعات المراجعة" : "Verification Audit Log"}
                  </h3>
                  <p className="text-[11px] text-onyx-400 mt-0.5">
                    {isArabic ? "كل خطوة وتوقيع يتم توثيقه بالاسم والتاريخ." : "Every step is timestamped and signed by the admin."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuditLogs(false)}
                  className="text-[11px] text-gold-500 hover:underline font-bold shrink-0"
                >
                  {isArabic ? "العودة للخطوات" : "Back to Wizard"}
                </button>
              </div>

              {loadingLogs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-onyx-500 text-xs">
                  {isArabic ? "لا توجد سجلات تدقيق سابقة لهذا العامل بعد" : "No audit history recorded yet for this worker."}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {auditLogs.map((log) => {
                    const data = log.newData || {};
                    return (
                      <div key={log.id} className="bg-onyx-900/60 border border-white/5 p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-md border border-gold-500/20">
                              {data.stepName}
                            </span>
                            <span className="text-[11px] text-emerald-400 font-semibold">{data.status || "ACTION"}</span>
                          </div>
                          <p className="text-xs font-bold text-white">
                            {isArabic ? `بواسطة: ${data.adminName || "أدمن النظام"}` : `By: ${data.adminName || "System Admin"}`}
                          </p>
                          {data.notes && (
                            <p className="text-[11px] text-onyx-300 italic bg-onyx-950/60 p-2 rounded-lg border border-white/5">
                              "{data.notes}"
                            </p>
                          )}
                        </div>
                        <div className="text-[11px] text-onyx-400 font-medium md:text-end shrink-0">
                          {new Date(log.createdAt).toLocaleString(isArabic ? "ar-EG" : "en-US", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">

              <div className="bg-onyx-900/70 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                    <currentStep.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold-500">
                      {isArabic ? `الخطوة ${currentStep.num} من ${STEP_DEFINITIONS.length}` : `Step ${currentStep.num} of ${STEP_DEFINITIONS.length}`}
                    </span>
                    <h3 className="text-base font-black text-white truncate">{isArabic ? currentStep.titleAr : currentStep.titleEn}</h3>
                    <p className="text-[11px] text-onyx-400 truncate">{isArabic ? currentStep.descAr : currentStep.descEn}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end shrink-0">
                  {getStepBadge(currentStep.key)}
                  {(() => {
                    const rec = stepVerifications[currentStep.key];
                    return rec?.verifiedByAdminName ? (
                      <p className="text-[10px] text-onyx-400 mt-1 font-medium">
                        {isArabic ? `وثّقه: ${rec.verifiedByAdminName}` : `By: ${rec.verifiedByAdminName}`}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              {currentStep.key === "phone" && (
                <div className="onyx-card p-4 border-gold-500/20 bg-onyx-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-gold-400">
                    <PhoneCall className="h-4.5 w-4.5" />
                    <h4 className="text-sm font-bold text-white">{isArabic ? "طلب الاتصال بالعامل" : "Worker Phone Verification"}</h4>
                  </div>

                  <div className="bg-onyx-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] text-onyx-400 block">{isArabic ? "رقم الهاتف المسجل:" : "Registered Phone Number:"}</span>
                      <span className="text-xl font-black text-gold-400 dir-ltr block truncate">{worker.phone || (isArabic ? "غير متوفر" : "N/A")}</span>
                      <span className="text-[11px] text-onyx-400 block">{isArabic ? `اسم العامل: ${worker.name}` : `Worker Name: ${worker.name}`}</span>
                    </div>

                    {worker.phone && (
                      <a
                        href={`tel:${worker.phone}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-onyx-950 font-black text-xs shadow-lg shadow-gold-500/20 hover:scale-105 transition-all shrink-0"
                      >
                        <PhoneCall className="h-4 w-4" />
                        {isArabic ? "إجراء مكالمة الآن" : "Call Worker Now"}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {currentStep.key === "national_id" && (
                <div className="onyx-card p-4 border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-center">
                      <span className="text-[11px] font-bold text-onyx-300 block">{isArabic ? "وجه البطاقة" : "ID Front"}</span>
                      {worker.nationalIdFront ? (
                        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black">
                          <img src={worker.nationalIdFront} alt="ID Front" className="h-32 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                            <button
                              onClick={() => setLightboxUrl(worker.nationalIdFront!)}
                              className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                            >
                              <Eye className="h-4 w-4" />
                              {isArabic ? "معاينة" : "Preview"}
                            </button>
                            <button
                              onClick={() => setEditingImage({ url: worker.nationalIdFront!, field: "nationalIdFront", aspect: undefined })}
                              className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                            >
                              <Crop className="h-4 w-4" />
                              {isArabic ? "تعديل" : "Edit"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-1.5 text-center">
                      <span className="text-[11px] font-bold text-onyx-300 block">{isArabic ? "ظهر البطاقة" : "ID Back"}</span>
                      {worker.nationalIdBack ? (
                        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black">
                          <img src={worker.nationalIdBack} alt="ID Back" className="h-32 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                            <button
                              onClick={() => setLightboxUrl(worker.nationalIdBack!)}
                              className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                            >
                              <Eye className="h-4 w-4" />
                              {isArabic ? "معاينة" : "Preview"}
                            </button>
                            <button
                              onClick={() => setEditingImage({ url: worker.nationalIdBack!, field: "nationalIdBack", aspect: undefined })}
                              className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                            >
                              <Crop className="h-4 w-4" />
                              {isArabic ? "تعديل" : "Edit"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.key === "avatar" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="onyx-card p-4 space-y-2 text-center border-white/5">
                    <span className="text-[11px] font-bold text-gold-400 block">{isArabic ? "صورة الملف الشخصي" : "Profile Avatar"}</span>
                    {worker.avatarUrl ? (
                      <div className="relative group inline-block mx-auto">
                        <img
                          src={worker.avatarUrl}
                          alt="Avatar"
                          className="h-28 w-28 rounded-2xl object-cover border-2 border-gold-500/30 mx-auto shadow-xl"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex flex-col items-center justify-center gap-2">
                          <button
                            onClick={() => setLightboxUrl(worker.avatarUrl!)}
                            className="flex items-center justify-center text-white font-bold text-[11px] gap-1 hover:text-gold-400"
                          >
                            <Eye className="h-4 w-4" />
                            {isArabic ? "تكبير" : "Zoom"}
                          </button>
                          <button
                            onClick={() => setEditingImage({ url: worker.avatarUrl!, field: "avatarUrl", aspect: 1 })}
                            className="flex items-center justify-center text-white font-bold text-[11px] gap-1 hover:text-gold-400"
                          >
                            <Crop className="h-4 w-4" />
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="onyx-card p-4 space-y-2 text-center border-white/5">
                    <span className="text-[11px] font-bold text-gold-400 block">{isArabic ? "سيلفي مع البطاقة" : "Selfie with ID"}</span>
                    {worker.selfieWithId ? (
                      <div className="relative group inline-block mx-auto">
                        <img
                          src={worker.selfieWithId}
                          alt="Selfie with ID"
                          className="h-28 w-28 rounded-2xl object-cover border-2 border-gold-500/30 mx-auto shadow-xl"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-2xl flex flex-col items-center justify-center gap-2">
                          <button
                            onClick={() => setLightboxUrl(worker.selfieWithId!)}
                            className="flex items-center justify-center text-white font-bold text-[11px] gap-1 hover:text-gold-400"
                          >
                            <Eye className="h-4 w-4" />
                            {isArabic ? "تكبير" : "Zoom"}
                          </button>
                          <button
                            onClick={() => setEditingImage({ url: worker.selfieWithId!, field: "selfieWithId", aspect: undefined })}
                            className="flex items-center justify-center text-white font-bold text-[11px] gap-1 hover:text-gold-400"
                          >
                            <Crop className="h-4 w-4" />
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Step 4: Background & Address Docs */}
              {currentStep.key === "documents" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="onyx-card p-3.5 border-white/10 space-y-2">
                    <h4 className="text-[11px] font-bold text-gold-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {isArabic ? "الفيش الجنائي" : "Criminal Record"}
                    </h4>
                    {worker.criminalRecord ? (
                      <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black">
                        <img src={worker.criminalRecord} alt="Criminal record" className="h-28 w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                          <button
                            onClick={() => setLightboxUrl(worker.criminalRecord!)}
                            className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                          >
                            <Eye className="h-4 w-4" />
                            {isArabic ? "عرض" : "View"}
                          </button>
                          <button
                            onClick={() => setEditingImage({ url: worker.criminalRecord!, field: "criminalRecord", aspect: undefined })}
                            className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                          >
                            <Crop className="h-4 w-4" />
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 rounded-xl bg-onyx-900 border border-white/10 flex items-center justify-center text-onyx-500 text-[11px] text-center px-2">
                        {isArabic ? "لم يتم إرفاق الفيش الجنائي" : "No criminal record attached"}
                      </div>
                    )}
                  </div>

                  <div className="onyx-card p-3.5 border-white/10 space-y-2">
                    <h4 className="text-[11px] font-bold text-gold-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {isArabic ? "إيصال المرافق" : "Utility Bill"}
                    </h4>
                    {worker.utilityBillUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black">
                        <img src={worker.utilityBillUrl} alt="Utility Bill" className="h-28 w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                          <button
                            onClick={() => setLightboxUrl(worker.utilityBillUrl!)}
                            className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                          >
                            <Eye className="h-4 w-4" />
                            {isArabic ? "عرض" : "View"}
                          </button>
                          <button
                            onClick={() => setEditingImage({ url: worker.utilityBillUrl!, field: "utilityBillUrl", aspect: undefined })}
                            className="flex items-center justify-center text-white text-[11px] font-bold gap-1 hover:text-gold-400"
                          >
                            <Crop className="h-4 w-4" />
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 rounded-xl bg-onyx-900 border border-white/10 flex items-center justify-center text-onyx-500 text-[11px] text-center px-2">
                        {isArabic ? "لم يتم إرفاق إيصال مرافق" : "No utility bill attached"}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep.key === "public_profile" && (
                <div className="onyx-card p-4 border-white/10 bg-onyx-900/40 space-y-3 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border-2 border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
                    <ExternalLink className="h-5 w-5" />
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {isArabic ? "مراجعة واجهة الفني للعملاء" : "Review Worker's Public Page"}
                  </h4>

                  <p className="text-xs text-onyx-400 max-w-md mx-auto">
                    {isArabic
                      ? "تأكد أن صفحة الفني احترافية، والنبذة سليمة، ومعرض الأعمال والأسعار مناسبة قبل التفعيل."
                      : "Ensure the worker's public profile is professional, bio is well-written, and gallery/prices are appropriate before approving."}
                  </p>

                  <div className="pt-1 flex justify-center">
                    <a
                      href={`/${locale}/workers/${worker.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                      {isArabic ? "فتح الصفحة العامة" : "Open Public Profile"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-onyx-900 p-4 rounded-2xl border border-white/10 space-y-3">
                <textarea
                  rows={2}
                  value={stepNotes[currentStep.key] || ""}
                  onChange={(e) => setStepNotes({ ...stepNotes, [currentStep.key]: e.target.value })}
                  placeholder={isArabic ? "اكتب أي ملاحظة..." : "Enter audit notes..."}
                  className="w-full bg-onyx-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-onyx-500 focus:border-gold-500/50 outline-none transition-all"
                />

                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                      className="px-3 py-2 rounded-lg border border-onyx-700 text-[11px] font-bold text-onyx-300 hover:text-white disabled:opacity-40"
                    >
                      {isArabic ? "← السابقة" : "← Previous"}
                    </button>
                    <button
                      type="button"
                      disabled={currentStepIndex === STEP_DEFINITIONS.length - 1}
                      onClick={() => setCurrentStepIndex(prev => Math.min(STEP_DEFINITIONS.length - 1, prev + 1))}
                      className="px-3 py-2 rounded-lg border border-onyx-700 text-[11px] font-bold text-onyx-300 hover:text-white disabled:opacity-40"
                    >
                      {isArabic ? "التالية →" : "Next →"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loadingStep === currentStep.key}
                      onClick={() => handleStepAction(currentStep.key, "FLAGGED")}
                      className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-[11px] hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {isArabic ? "إرجاء / ملاحظة" : "Flag Issue"}
                    </button>

                    <button
                      type="button"
                      disabled={loadingStep === currentStep.key}
                      onClick={() => handleStepAction(currentStep.key, "VERIFIED")}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-onyx-950 font-black text-[11px] shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      {loadingStep === currentStep.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {currentStep.key === "public_profile"
                        ? (isArabic ? "اعتماد الصفحة والموافقة ✓" : "Approve Profile & Verify ✓")
                        : (isArabic ? `اعتماد ${currentStep.shortAr} ✓` : `Verify ${currentStep.shortEn} ✓`)}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Lightbox Zoom Modal */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={lightboxUrl} alt="Zoom" className="max-h-[85vh] max-w-full rounded-2xl border border-white/20 shadow-2xl object-contain" />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-onyx-900 text-white p-2 rounded-full border border-white/20 hover:bg-gold-500 hover:text-onyx-950 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Image Edit Modal */}
      {editingImage && (
        <AdminImageEditModal
          imageSrc={editingImage.url}
          isArabic={isArabic}
          aspectRatio={editingImage.aspect}
          onCancel={() => setEditingImage(null)}
          onConfirm={handleEditPhotoConfirm}
        />
      )}
    </div>
  );

  return typeof window !== "undefined" ? createPortal(content, document.body) : null;
}
