"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare, Clock, CheckCircle2, Send, Loader2,
  User, Phone, ChevronDown, ChevronUp, Inbox
} from "lucide-react";
import { fetchApiData, patchApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type CustomReq = {
  id: string;
  clientName: string;
  clientPhone: string | null;
  message: string;
  vendorReply: string | null;
  status: "PENDING" | "SEEN" | "REPLIED" | "CLOSED";
  createdAt: string;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-sun-100 text-sun-700",
  SEEN: "bg-primary-50 text-primary-700",
  REPLIED: "bg-success/10 text-success",
  CLOSED: "bg-dark-100 text-dark-500",
};

const statusLabels: Record<string, Record<string, string>> = {
  PENDING: { ar: "بانتظار الرد", en: "Pending" },
  SEEN: { ar: "تم القراءة", en: "Seen" },
  REPLIED: { ar: "تم الرد", en: "Replied" },
  CLOSED: { ar: "مغلق", en: "Closed" },
};

function timeAgo(dateStr: string, locale: Locale): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return locale === "ar" ? "الآن" : "Just now";
  if (diffMin < 60) return locale === "ar" ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return locale === "ar" ? `منذ ${diffH} ساعة` : `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return locale === "ar" ? `منذ ${diffD} يوم` : `${diffD}d ago`;
}

function RequestCard({ req, locale, onReply }: {
  req: CustomReq; locale: Locale;
  onReply: (id: string, reply: string) => Promise<void>;
}) {
  const isArabic = locale === "ar";
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState(req.vendorReply || "");
  const [sending, setSending] = useState(false);

  async function handleReply() {
    if (reply.trim().length < 2) return;
    setSending(true);
    await onReply(req.id, reply);
    setSending(false);
  }

  return (
    <div className={cn(
      "rounded-[1.6rem] border bg-white shadow-soft transition",
      req.status === "PENDING" ? "border-sun-300" : "border-dark-200/70"
    )}>
      {/* Header */}
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 text-start min-w-0">
          <p className="font-semibold text-dark-950 truncate">{req.clientName}</p>
          <p className="text-xs text-dark-400">{timeAgo(req.createdAt, locale)}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusColors[req.status])}>
          {statusLabels[req.status]?.[locale === "ar" ? "ar" : "en"]}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-dark-400" /> : <ChevronDown className="h-4 w-4 text-dark-400" />}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-dark-100 p-5">
          {/* Client message */}
          <div className="rounded-[1.2rem] bg-surface-soft p-4">
            <p className="text-xs font-semibold text-dark-400 mb-2">
              {isArabic ? "طلب العميل:" : "Customer request:"}
            </p>
            <p className="text-sm text-dark-900 whitespace-pre-line">{req.message}</p>
          </div>

          {/* Client phone */}
          {req.clientPhone && (
            <a
              href={`tel:${req.clientPhone}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition"
            >
              <Phone className="h-4 w-4" />
              {req.clientPhone}
            </a>
          )}

          {/* Vendor reply */}
          {req.status === "REPLIED" && req.vendorReply ? (
            <div className="rounded-[1.2rem] border border-success/30 bg-success/5 p-4">
              <p className="text-xs font-semibold text-success mb-2">
                {isArabic ? "ردك:" : "Your reply:"}
              </p>
              <p className="text-sm text-dark-900 whitespace-pre-line">{req.vendorReply}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-dark-700">
                  {isArabic ? "اكتب ردك" : "Write your reply"}
                </span>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={2}
                  placeholder={isArabic ? "الرد على طلب العميل..." : "Reply to the customer request..."}
                  className="w-full rounded-[1.1rem] border border-dark-200 bg-surface-soft px-4 py-3 text-sm text-dark-950 placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </label>
              <button
                type="button"
                onClick={handleReply}
                disabled={sending || reply.trim().length < 2}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "إرسال الرد" : "Send Reply")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VendorRequestsPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [requests, setRequests] = useState<CustomReq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiData<CustomReq[]>("/vendors/custom-requests", []).then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, []);

  async function handleReply(id: string, reply: string) {
    try {
      await patchApiData(`/vendors/custom-requests/${id}/reply`, { reply });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, vendorReply: reply, status: "REPLIED" as const } : r));
    } catch { /* ignore */ }
  }

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-700">
          {isArabic ? "طلبات العملاء" : "Customer Requests"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-dark-950">
          {isArabic ? "الطلبات المخصصة" : "Custom Requests"}
        </h1>
        <p className="mt-2 text-dark-500">
          {isArabic
            ? `${requests.length} طلب — ${pendingCount} بانتظار الرد`
            : `${requests.length} requests — ${pendingCount} pending`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-[1.6rem] bg-surface-soft" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-dark-200 bg-surface-soft py-20 text-center">
          <Inbox className="h-12 w-12 text-dark-300" />
          <p className="mt-4 text-lg font-semibold text-dark-700">
            {isArabic ? "لا توجد طلبات بعد" : "No requests yet"}
          </p>
          <p className="mt-2 text-sm text-dark-500">
            {isArabic ? "ستظهر هنا طلبات العملاء المرسلة لمتجرك" : "Customer requests sent to your store will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <RequestCard
              key={req.id}
              req={req}
              locale={locale}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
