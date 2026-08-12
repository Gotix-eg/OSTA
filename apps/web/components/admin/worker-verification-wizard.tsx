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
  descAr: string;
  descEn: string;
  icon: any;
}> = [
    {
      key: "phone",
      num: 1,
      titleAr: "التحقق من رقم الهاتف والمكالمة",
      titleEn: "Phone & Call Verification",
      descAr: "الاتصال بالعامل هاتفياً للتأكد من هوية صاحب الرقم واستجابته",
      descEn: "Call worker to confirm phone ownership & voice responsiveness",
      icon: PhoneCall
    },
    {
      key: "national_id",
      num: 2,
      titleAr: "بطاقة الرقم القومي والاسم الثلاثي",
      titleEn: "National ID & Name Check",
      descAr: "فحص الرقم القومي وصور الوجه والظهر وتأكيد مطابقة الاسم",
      descEn: "Inspect National ID scans & check name match",
      icon: ShieldCheck
    },
    {
      key: "avatar",
      num: 3,
      titleAr: "التحقق من صورة الملف الشخصي والسيلفي",
      titleEn: "Avatar & Selfie Verification",
      descAr: "مطابقة صورة الحساب مع الصورة الشخصية مع بطاقة الرقم القومي",
      descEn: "Verify profile photo matches selfie holding ID card",
      icon: Camera
    },
    {
      key: "documents",
      num: 4,
      titleAr: "الفيش الجنائي والمرافق والضامن",
      titleEn: "Criminal Record & Background",
      descAr: "مراجعة صحيفة الحالة الجنائية وإيصال المرافق وبيانات الضامن",
      descEn: "Check Criminal record, Utility bill & Guarantor details",
      icon: FileText
    },
    {
      key: "public_profile",
      num: 5,
      titleAr: "مراجعة الصفحة العامة للفني",
      titleEn: "Public Profile Review",
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
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Clock3 className="h-3 w-3" />
          {isArabic ? "بانتظار التوثيق" : "Pending"}
        </span>
      );
    }
    if (rec.status === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isArabic ? "موثق معتمد ✓" : "Verified ✓"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
        <XCircle className="h-3.5 w-3.5" />
        {isArabic ? "مرجأ / مرفوض" : "Flagged"}
      </span>
    );
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden">
      <div className="bg-onyx-950 border border-gold-500/20 rounded-[2.5rem] w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">

        <div className="bg-onyx-900/90 border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <img
                src={worker.avatarUrl || worker.selfieWithId || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=1f1f23&color=eab308&bold=true`}
                alt={worker.name}
                className="h-12 w-12 rounded-2xl object-cover border-2 border-gold-500/40 shadow-md"
              />
              {worker.status === "VERIFIED" && (
                <div className="absolute -bottom-1 -end-1 bg-emerald-500 text-onyx-950 p-0.5 rounded-full ring-2 ring-onyx-950">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white truncate">{worker.name}</h2>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  worker.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                )}>
                  {worker.status === "VERIFIED" ? (isArabic ? "حساب موثق بالكامل" : "Fully Verified") : (isArabic ? "قيد التوثيق والتوقيع" : "In Verification")}
                </span>
              </div>
              <p className="text-xs text-onyx-400 mt-0.5 flex items-center gap-2">
                <span>{worker.profession || worker.specialty}</span>
                {worker.phone && <span className="dir-ltr text-onyx-300">• {worker.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border",
                showAuditLogs
                  ? "bg-gold-500 text-onyx-950 border-gold-400"
                  : "bg-onyx-800 text-onyx-300 border-onyx-700 hover:text-white"
              )}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{isArabic ? "سجل المراجعات والتوقيعات" : "Audit Trail"}</span>
              <span className="bg-onyx-950/40 px-1.5 py-0.5 rounded-md text-[10px] font-black">{auditLogs.length}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-2xl bg-onyx-800 border border-onyx-700 text-onyx-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-onyx-900/50 border-b border-white/5 px-6 py-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {STEP_DEFINITIONS.map((s, idx) => {
              const isDone = isStepDone(s.key);
              const isActive = idx === currentStepIndex;

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border",
                    isActive
                      ? "bg-gold-500/15 border-gold-500 text-gold-400 shadow-md shadow-gold-500/10"
                      : isDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-onyx-800/40 border-white/5 text-onyx-400 hover:bg-onyx-800 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-lg flex items-center justify-center text-[11px] font-black",
                    isDone ? "bg-emerald-500 text-onyx-950" : isActive ? "bg-gold-500 text-onyx-950" : "bg-onyx-800 text-onyx-300"
                  )}>
                    {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <span>{isArabic ? s.titleAr.split(" ")[0] + " " + (s.titleAr.split(" ")[1] || "") : s.titleEn.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative">

          {feedback && (
            <div className={cn(
              "px-4 py-3 rounded-2xl border text-sm font-semibold flex items-center justify-between animate-fadeIn",
              feedback.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}>
              <span>{feedback.text}</span>
              <button onClick={() => setFeedback(null)} className="text-current opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {showAuditLogs ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <History className="h-5 w-5 text-gold-500" />
                    {isArabic ? "سجل تدقيق وتوقيعات مراجعة حساب العامل" : "Verification Audit Log & Signature Trail"}
                  </h3>
                  <p className="text-xs text-onyx-400 mt-1">
                    {isArabic ? "كل خطوة وتوقيع يتم توثيقه بالاسم والتاريخ لضمان الحوكمة الكاملة." : "Every step is timestamped and signed with the admin ID for accountability."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuditLogs(false)}
                  className="text-xs text-gold-500 hover:underline font-bold"
                >
                  {isArabic ? "العودة للخطوات" : "Back to Wizard"}
                </button>
              </div>

              {loadingLogs ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-16 text-onyx-500 text-sm">
                  {isArabic ? "لا توجد سجلات تدقيق سابقة لهذا العامل بعد" : "No audit history recorded yet for this worker."}
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => {
                    const data = log.newData || {};
                    return (
                      <div key={log.id} className="bg-onyx-900/60 border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-md border border-gold-500/20">
                              <span className="font-bold">
                                {data.stepName}
                              </span>
                            </span>
                            <span className="text-xs text-emerald-400 font-semibold">{data.status || "ACTION"}</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {isArabic ? `بواسطة الأدمن: ${data.adminName || "أدمن النظام"}` : `By Admin: ${data.adminName || "System Admin"}`}
                          </p>
                          {data.notes && (
                            <p className="text-xs text-onyx-300 italic bg-onyx-950/60 p-2.5 rounded-xl border border-white/5 mt-2">
                              "{data.notes}"
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-onyx-400 font-medium md:text-end shrink-0">
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
            <div className="space-y-8 animate-fadeIn">

              <div className="bg-onyx-900/70 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                      <currentStep.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                        {isArabic ? `الخطوة ${currentStep.num} من ${STEP_DEFINITIONS.length}` : `Step ${currentStep.num} of ${STEP_DEFINITIONS.length}`}
                      </span>
                      <h3 className="text-2xl font-black text-white">{isArabic ? currentStep.titleAr : currentStep.titleEn}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-onyx-400 mt-2">{isArabic ? currentStep.descAr : currentStep.descEn}</p>
                </div>

                <div>
                  {getStepBadge(currentStep.key)}
                  {(() => {
                    const rec = stepVerifications[currentStep.key];
                    return rec?.verifiedByAdminName ? (
                      <p className="text-[11px] text-onyx-400 mt-1 font-medium">
                        {isArabic ? `وثّقه: ${rec.verifiedByAdminName}` : `By: ${rec.verifiedByAdminName}`}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              {currentStep.key === "phone" && (
                <div className="space-y-6">
                  <div className="onyx-card p-6 border-gold-500/20 bg-onyx-900/40 space-y-6">
                    <div className="flex items-center gap-3 text-gold-400">
                      <PhoneCall className="h-6 w-6" />
                      <h4 className="text-lg font-bold text-white">{isArabic ? "طلب الاتصال بالعامل" : "Worker Phone Verification"}</h4>
                    </div>

                    <div className="bg-onyx-950 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <span className="text-xs text-onyx-400 block mb-1">{isArabic ? "رقم الهاتف المسجل:" : "Registered Phone Number:"}</span>
                        <span className="text-3xl font-black text-gold-400 dir-ltr block">{worker.phone || (isArabic ? "غير متوفر" : "N/A")}</span>
                        <span className="text-xs text-onyx-400 mt-1 block">{isArabic ? `اسم العامل: ${worker.name}` : `Worker Name: ${worker.name}`}</span>
                      </div>

                      {worker.phone && (
                        <a
                          href={`tel:${worker.phone}`}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gold-500 text-onyx-950 font-black text-sm shadow-lg shadow-gold-500/20 hover:scale-105 transition-all"
                        >
                          <PhoneCall className="h-4 w-4" />
                          {isArabic ? "إجراء مكالمة الآن 📞" : "Call Worker Now 📞"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.key === "national_id" && (
                <div className="space-y-6">
                  <div className="onyx-card p-6 border-white/10 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-center">
                        <span className="text-xs font-bold text-onyx-300 block">{isArabic ? "وجه بطاقة الرقم القومي" : "ID Front Scan"}</span>
                        {worker.nationalIdFront ? (
                          <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black">
                            <img src={worker.nationalIdFront} alt="ID Front" className="h-48 w-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                              <button
                                onClick={() => setLightboxUrl(worker.nationalIdFront!)}
                                className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400"
                              >
                                <Eye className="h-5 w-5" />
                                {isArabic ? "معاينة الوجه" : "Preview Front"}
                              </button>
                              <button
                                onClick={() => setEditingImage({ url: worker.nationalIdFront!, field: "nationalIdFront", aspect: undefined })}
                                className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400 mt-2"
                              >
                                <Crop className="h-5 w-5" />
                                {isArabic ? "تعديل الصورة" : "Edit Photo"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-2 text-center">
                        <span className="text-xs font-bold text-onyx-300 block">{isArabic ? "ظهر بطاقة الرقم القومي" : "ID Back Scan"}</span>
                        {worker.nationalIdBack ? (
                          <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black">
                            <img src={worker.nationalIdBack} alt="ID Back" className="h-48 w-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                              <button
                                onClick={() => setLightboxUrl(worker.nationalIdBack!)}
                                className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400"
                              >
                                <Eye className="h-5 w-5" />
                                {isArabic ? "معاينة الظهر" : "Preview Back"}
                              </button>
                              <button
                                onClick={() => setEditingImage({ url: worker.nationalIdBack!, field: "nationalIdBack", aspect: undefined })}
                                className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400 mt-2"
                              >
                                <Crop className="h-5 w-5" />
                                {isArabic ? "تعديل الصورة" : "Edit Photo"}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.key === "avatar" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="onyx-card p-6 space-y-4 text-center border-white/5">
                      <span className="text-xs font-bold text-gold-400 block">{isArabic ? "صورة الملف الشخصي" : "Profile Avatar"}</span>
                      {worker.avatarUrl ? (
                        <div className="relative group inline-block mx-auto">
                          <img
                            src={worker.avatarUrl}
                            alt="Avatar"
                            className="h-48 w-48 rounded-3xl object-cover border-2 border-gold-500/30 mx-auto shadow-xl"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex flex-col items-center justify-center gap-3">
                            <button
                              onClick={() => setLightboxUrl(worker.avatarUrl!)}
                              className="flex items-center justify-center text-white font-bold text-xs gap-1 hover:text-gold-400"
                            >
                              <Eye className="h-5 w-5" />
                              {isArabic ? "تكبير الصورة" : "Zoom"}
                            </button>
                            <button
                              onClick={() => setEditingImage({ url: worker.avatarUrl!, field: "avatarUrl", aspect: 1 })}
                              className="flex items-center justify-center text-white font-bold text-xs gap-1 hover:text-gold-400"
                            >
                              <Crop className="h-5 w-5" />
                              {isArabic ? "تعديل الصورة" : "Edit Photo"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="onyx-card p-6 space-y-4 text-center border-white/5">
                      <span className="text-xs font-bold text-gold-400 block">{isArabic ? "صورة السيلفي مع البطاقة" : "Selfie with ID"}</span>
                      {worker.selfieWithId ? (
                        <div className="relative group inline-block mx-auto">
                          <img
                            src={worker.selfieWithId}
                            alt="Selfie with ID"
                            className="h-48 w-48 rounded-3xl object-cover border-2 border-gold-500/30 mx-auto shadow-xl"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex flex-col items-center justify-center gap-3">
                            <button
                              onClick={() => setLightboxUrl(worker.selfieWithId!)}
                              className="flex items-center justify-center text-white font-bold text-xs gap-1 hover:text-gold-400"
                            >
                              <Eye className="h-5 w-5" />
                              {isArabic ? "تكبير الصورة" : "Zoom"}
                            </button>
                            <button
                              onClick={() => setEditingImage({ url: worker.selfieWithId!, field: "selfieWithId", aspect: undefined })}
                              className="flex items-center justify-center text-white font-bold text-xs gap-1 hover:text-gold-400"
                            >
                              <Crop className="h-5 w-5" />
                              {isArabic ? "تعديل الصورة" : "Edit Photo"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Background & Address Docs */}
              {currentStep.key === "documents" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="onyx-card p-6 border-white/10 space-y-4">
                      <h4 className="text-sm font-bold text-gold-400 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {isArabic ? "صحيفة الحالة الجنائية (الفيش والتشبيه)" : "Criminal Record Certificate"}
                      </h4>
                      {worker.criminalRecord ? (
                        <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black">
                          <img src={worker.criminalRecord} alt="Criminal record" className="h-40 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                            <button
                              onClick={() => setLightboxUrl(worker.criminalRecord!)}
                              className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400"
                            >
                              <Eye className="h-5 w-5" />
                              {isArabic ? "عرض الفيش الجنائي" : "View Record"}
                            </button>
                            <button
                              onClick={() => setEditingImage({ url: worker.criminalRecord!, field: "criminalRecord", aspect: undefined })}
                              className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400 mt-2"
                            >
                              <Crop className="h-5 w-5" />
                              {isArabic ? "تعديل الصورة" : "Edit Photo"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 rounded-2xl bg-onyx-900 border border-white/10 flex items-center justify-center text-onyx-500 text-xs">
                          {isArabic ? "لم يتم إرفاق الفيش الجنائي" : "No criminal record attached"}
                        </div>
                      )}
                    </div>

                    <div className="onyx-card p-6 border-white/10 space-y-4">
                      <h4 className="text-sm font-bold text-gold-400 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {isArabic ? "إيصال المرافق / إثبات العنوان" : "Utility Bill / Address Proof"}
                      </h4>
                      {worker.utilityBillUrl ? (
                        <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black">
                          <img src={worker.utilityBillUrl} alt="Utility Bill" className="h-40 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                            <button
                              onClick={() => setLightboxUrl(worker.utilityBillUrl!)}
                              className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400"
                            >
                              <Eye className="h-5 w-5" />
                              {isArabic ? "عرض إيصال المرافق" : "View Bill"}
                            </button>
                            <button
                              onClick={() => setEditingImage({ url: worker.utilityBillUrl!, field: "utilityBillUrl", aspect: undefined })}
                              className="flex items-center justify-center text-white text-xs font-bold gap-1 hover:text-gold-400 mt-2"
                            >
                              <Crop className="h-5 w-5" />
                              {isArabic ? "تعديل الصورة" : "Edit Photo"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 rounded-2xl bg-onyx-900 border border-white/10 flex items-center justify-center text-onyx-500 text-xs">
                          {isArabic ? "لم يتم إرفاق إيصال مرافق" : "No utility bill attached"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep.key === "public_profile" && (
                <div className="space-y-6">
                  <div className="onyx-card p-6 border-white/10 bg-onyx-900/40 space-y-6 text-center">
                    <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border-2 border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-xl mb-4">
                      <ExternalLink className="h-8 w-8" />
                    </div>
                    
                    <h4 className="text-xl font-bold text-white">
                      {isArabic ? "مراجعة واجهة الفني للعملاء" : "Review Worker's Public Page"}
                    </h4>
                    
                    <p className="text-sm text-onyx-400 max-w-lg mx-auto">
                      {isArabic 
                        ? "يجب التأكد من أن صفحة الفني تبدو احترافية، وتمت كتابة النبذة بشكل سليم ومراجعة معرض الأعمال والأسعار المعروضة قبل تفعيل الحساب للعملاء." 
                        : "Ensure the worker's public profile is professional, bio is well-written, and gallery/prices are appropriate before approving."}
                    </p>

                    <div className="pt-4 pb-2 flex justify-center">
                      <a
                        href={`/${locale}/workers/${worker.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                      >
                        {isArabic ? "فتح الصفحة العامة في نافذة جديدة" : "Open Public Profile in New Tab"}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-onyx-900 p-6 rounded-3xl border border-white/10 space-y-4">
                <textarea
                  rows={2}
                  value={stepNotes[currentStep.key] || ""}
                  onChange={(e) => setStepNotes({ ...stepNotes, [currentStep.key]: e.target.value })}
                  placeholder={isArabic ? "اكتب أي ملاحظة..." : "Enter audit notes..."}
                  className="w-full bg-onyx-950 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-onyx-500 focus:border-gold-500/50 outline-none transition-all"
                />

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentStepIndex === 0}
                      onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2.5 rounded-xl border border-onyx-700 text-xs font-bold text-onyx-300 hover:text-white disabled:opacity-40"
                    >
                      {isArabic ? "← الخطوة السابقة" : "← Previous"}
                    </button>
                    <button
                      type="button"
                      disabled={currentStepIndex === STEP_DEFINITIONS.length - 1}
                      onClick={() => setCurrentStepIndex(prev => Math.min(STEP_DEFINITIONS.length - 1, prev + 1))}
                      className="px-4 py-2.5 rounded-xl border border-onyx-700 text-xs font-bold text-onyx-300 hover:text-white disabled:opacity-40"
                    >
                      {isArabic ? "الخطوة التالية →" : "Next →"}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={loadingStep === currentStep.key}
                      onClick={() => handleStepAction(currentStep.key, "FLAGGED")}
                      className="px-5 py-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      {isArabic ? "إرجاء / تسجيل ملاحظة" : "Flag Issue"}
                    </button>

                    <button
                      type="button"
                      disabled={loadingStep === currentStep.key}
                      onClick={() => handleStepAction(currentStep.key, "VERIFIED")}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 text-onyx-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      {loadingStep === currentStep.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {currentStep.key === "public_profile"
                        ? (isArabic ? "✍️ اعتماد الصفحة النهائية والموافقة ✓" : "✍️ Approve Profile & Verify ✓")
                        : (isArabic ? `اعتماد توثيق ${currentStep.titleAr.split(" ")[0]} ✓` : `Verify ${currentStep.titleEn} ✓`)}
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
