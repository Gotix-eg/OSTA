"use client";

import { useEffect, useState } from "react";
import { fetchApiData } from "../../lib/api";
import { AuditLogEntry } from "./worker-verification-wizard";
import { Calendar, History, Loader2, UserCircle, LogIn, Activity } from "lucide-react";

export const formatAuditActionName = (action: string, isArabic: boolean) => {
  const map: Record<string, { ar: string; en: string }> = {
    "WORKER_FULL_VERIFICATION_APPROVED": { ar: "اعتماد وتوثيق الحساب بالكامل", en: "Worker Fully Verified & Approved" },
    "WORKER_FULL_VERIFICATION_REJECTED": { ar: "رفض اعتماد العامل نهائياً", en: "Worker Verification Rejected" },
    "WORKER_STEP_PHONE_VERIFIED": { ar: "توثيق رقم الهاتف (مقبول)", en: "Phone Number Verified" },
    "WORKER_STEP_PHONE_REJECTED": { ar: "توثيق رقم الهاتف (مرفوض)", en: "Phone Number Rejected" },
    "WORKER_STEP_AVATAR_VERIFIED": { ar: "مراجعة الصورة الشخصية (مقبول)", en: "Avatar Verified" },
    "WORKER_STEP_AVATAR_REJECTED": { ar: "مراجعة الصورة الشخصية (مرفوض)", en: "Avatar Rejected" },
    "WORKER_STEP_NATIONAL_ID_VERIFIED": { ar: "توثيق الهوية الوطنية (مقبول)", en: "National ID Verified" },
    "WORKER_STEP_NATIONAL_ID_REJECTED": { ar: "توثيق الهوية الوطنية (مرفوض)", en: "National ID Rejected" },
    "WORKER_STEP_DOCUMENTS_VERIFIED": { ar: "مراجعة المستندات المرفقة (مقبول)", en: "Documents Verified" },
    "WORKER_STEP_DOCUMENTS_REJECTED": { ar: "مراجعة المستندات المرفقة (مرفوض)", en: "Documents Rejected" },
    "WORKER_STEP_PROFESSION_VERIFIED": { ar: "مراجعة المهنة والخبرة (مقبول)", en: "Profession & Experience Verified" },
    "WORKER_STEP_PROFESSION_REJECTED": { ar: "مراجعة المهنة والخبرة (مرفوض)", en: "Profession & Experience Rejected" },
    "WORKER_STEP_FINAL_APPROVAL_VERIFIED": { ar: "قرار المراجعة النهائية (مقبول)", en: "Final Review Verified" },
    "WORKER_STEP_FINAL_APPROVAL_REJECTED": { ar: "قرار المراجعة النهائية (مرفوض)", en: "Final Review Rejected" },
  };

  const entry = map[action];
  if (entry) return isArabic ? entry.ar : entry.en;

  return action
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

export function WorkerHistoryLogs({
  workerId,
  createdAt,
  lastLoginAt,
  locale
}: {
  workerId: string;
  createdAt?: string;
  lastLoginAt?: string | null;
  locale: string;
}) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const isArabic = locale === "ar";

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return isArabic ? "غير متوفر" : "N/A";
    return new Date(dateStr).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).toUpperCase();
  };

  useEffect(() => {
    if (workerId) {
      setLoading(true);
      fetchApiData<AuditLogEntry[]>(`/admin/workers/${workerId}/audit-logs`, [])
        .then(res => {
          if (res) setLogs(res);
        })
        .finally(() => setLoading(false));
    }
  }, [workerId]);

  return (
    <div className="space-y-6 pt-8 border-t border-white/10 mt-8">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <div className="h-4 w-1.5 bg-gold-500 rounded-full" />
        {isArabic ? "سجل نشاط العامل والتاريخ" : "Worker Activity & History Log"}
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-onyx-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-onyx-300 border-b border-white/5 pb-3">
            <Calendar className="h-5 w-5 text-gold-500" />
            <div>
              <p className="text-xs text-onyx-500 uppercase font-bold tracking-widest">{isArabic ? "تاريخ التسجيل" : "Registration Date"}</p>
              <p className="font-medium text-white font-mono text-sm" dir="ltr">{formatDate(createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-onyx-300 border-b border-white/5 pb-3">
            <LogIn className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs text-onyx-500 uppercase font-bold tracking-widest">{isArabic ? "آخر تسجيل دخول" : "Last Login"}</p>
              <p className="font-medium text-white font-mono text-sm" dir="ltr">{formatDate(lastLoginAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-onyx-300">
            <UserCircle className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-xs text-onyx-500 uppercase font-bold tracking-widest">{isArabic ? "رقم التعريف (ID)" : "Worker ID"}</p>
              <p className="font-medium text-white font-mono text-xs">{workerId}</p>
            </div>
          </div>
        </div>

        <div className="bg-onyx-950/40 p-5 rounded-2xl border border-white/5 max-h-[300px] overflow-y-auto">
          <h4 className="text-sm font-bold text-onyx-300 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gold-500" />
            {isArabic ? "سجل المراجعة والاعتماد" : "Verification & Approval Logs"}
          </h4>
          
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-gold-500" /></div>
          ) : logs.length === 0 ? (
            <div className="text-xs text-onyx-500 text-center py-4">{isArabic ? "لا توجد سجلات" : "No logs found"}</div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:start-[9px] before:w-[2px] before:bg-white/10">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 rtl:pr-6 rtl:pl-0 text-sm">
                  <span className="absolute start-0 top-1.5 h-5 w-5 rounded-full bg-onyx-900 border-2 border-gold-500 flex items-center justify-center shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  </span>
                  <div className="bg-onyx-900 rounded-lg p-3 border border-white/5 space-y-1 ml-4 rtl:mr-4 rtl:ml-0">
                    <p className="text-white font-medium text-xs">{formatAuditActionName(log.action, isArabic)}</p>
                    <p className="text-onyx-400 text-[10px]">
                      {isArabic ? "بواسطة:" : "By:"} <span className="font-bold text-gold-400">{log.newData?.adminName || (isArabic ? "أدمن النظام" : "System Admin")}</span>
                    </p>
                    <p className="text-onyx-500 text-[9px] font-mono mt-1" dir="ltr">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
