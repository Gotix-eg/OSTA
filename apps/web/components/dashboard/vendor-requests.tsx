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
  price: number | null;
  deliveryMethod: "DELIVERY" | "PICKUP" | null;
  paymentMethod: "VODAFONE_CASH" | "INSTAPAY" | "COD" | null;
  status: "PENDING" | "SEEN" | "REPLIED" | "ACCEPTED" | "PREPARING" | "SHIPPED" | "COMPLETED" | "CLOSED" | "REJECTED";
  createdAt: string;
};

type VendorStats = {
  orderQuota: number;
  trialExpiresAt: string | null;
  subscriptionExpiresAt: string | null;
  totalOrders: number;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-sun-100 text-sun-700",
  SEEN: "bg-primary-50 text-primary-700",
  REPLIED: "bg-success/10 text-success",
  ACCEPTED: "bg-primary-500 text-white",
  PREPARING: "bg-accent-100 text-accent-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-success text-white",
  CLOSED: "bg-dark-100 text-onyx-400",
  REJECTED: "bg-error/10 text-error",
};

const statusLabels: Record<string, Record<string, string>> = {
  PENDING: { ar: "بانتظار الرد", en: "Pending" },
  SEEN: { ar: "تم القراءة", en: "Seen" },
  REPLIED: { ar: "تم الرد", en: "Replied" },
  ACCEPTED: { ar: "تم قبول العرض", en: "Order Accepted" },
  PREPARING: { ar: "جاري التحضير", en: "Preparing" },
  SHIPPED: { ar: "تم الشحن", en: "Shipped" },
  COMPLETED: { ar: "مكتمل", en: "Completed" },
  CLOSED: { ar: "مغلق", en: "Closed" },
  REJECTED: { ar: "مرفوض", en: "Rejected" },
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

function RequestCard({ req, locale, onReply, onStatusUpdate }: {
  req: CustomReq; locale: Locale;
  onReply: (id: string, reply: string) => Promise<void>;
  onStatusUpdate: (id: string, status: string) => Promise<void>;
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
      "rounded-[1.6rem] border bg-onyx-800/50 shadow-soft transition",
      req.status === "PENDING" ? "border-sun-300" : "border-onyx-700/70"
    )}>
      {/* Header */}
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-3 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 text-start min-w-0">
          <p className="font-semibold text-white truncate">{req.clientName}</p>
          <p className="text-xs text-onyx-500">{timeAgo(req.createdAt, locale)}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusColors[req.status])}>
          {statusLabels[req.status]?.[locale === "ar" ? "ar" : "en"]}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-onyx-500" /> : <ChevronDown className="h-4 w-4 text-onyx-500" />}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-dark-100 p-5">
          {/* Client message */}
          <div className="rounded-[1.2rem] bg-onyx-800/50 p-4">
            <p className="text-xs font-semibold text-onyx-500 mb-2">
              {isArabic ? "طلب العميل:" : "Customer request:"}
            </p>
            <p className="text-sm text-white/90 whitespace-pre-line">{req.message}</p>
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
          {(req.status !== "PENDING" && req.status !== "SEEN") && req.vendorReply && (
            <div className="rounded-[1.2rem] border border-success/30 bg-success/5 p-4">
              <p className="text-xs font-semibold text-success mb-2">
                {isArabic ? "ردك:" : "Your reply:"}
              </p>
              <p className="text-sm text-white/90 whitespace-pre-line">{req.vendorReply}</p>
            </div>
          )}

          {(req.status === "PENDING" || req.status === "SEEN") && (
            <div className="space-y-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-onyx-200">
                  {isArabic ? "اكتب ردك" : "Write your reply"}
                </span>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={2}
                  placeholder={isArabic ? "الرد على طلب العميل..." : "Reply to the customer request..."}
                  className="w-full rounded-[1.1rem] border border-onyx-700 bg-onyx-800/50 px-4 py-3 text-sm text-white placeholder:text-onyx-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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

          {/* New Lifecycle Actions */}
          {req.status === "ACCEPTED" && (
             <div className="rounded-[1.2rem] bg-primary-50 p-4 border border-primary-100">
                <div className="flex justify-between items-center mb-4">
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600">{isArabic ? "العميل وافق" : "Customer Accepted"}</p>
                      <p className="text-xs text-onyx-300 mt-1">
                         {isArabic ? `طريقة الاستلام: ${req.deliveryMethod === "DELIVERY" ? "توصيل" : "استلام"}` : `Method: ${req.deliveryMethod}`}
                         <br/>
                         {isArabic ? `طريقة الدفع: ${req.paymentMethod}` : `Payment: ${req.paymentMethod}`}
                      </p>
                   </div>
                   <button 
                     onClick={() => onStatusUpdate(req.id, "PREPARING")}
                     className="bg-primary-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-primary-700 shadow-sm"
                   >
                     {isArabic ? "بدء التحضير" : "Start Preparing"}
                   </button>
                </div>
             </div>
          )}

          {req.status === "PREPARING" && (
             <div className="flex gap-2">
                <button 
                  onClick={() => onStatusUpdate(req.id, "SHIPPED")}
                  className="flex-1 bg-accent-600 text-white py-3 rounded-full text-xs font-bold hover:bg-accent-700"
                >
                  {isArabic ? "تم الشحن / في الطريق" : "Shipped / On the way"}
                </button>
             </div>
          )}

          {req.status === "SHIPPED" && (
             <button 
               onClick={() => onStatusUpdate(req.id, "COMPLETED")}
               className="w-full bg-success text-white py-3 rounded-full text-xs font-bold hover:bg-success-700"
             >
               {isArabic ? "تم التوصيل والانتهاء" : "Delivered & Completed"}
             </button>
          )} 
        </div>
      )}
    </div>
  );
}

export function VendorRequestsPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [requests, setRequests] = useState<CustomReq[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApiData<CustomReq[]>("/vendors/custom-requests", []),
      fetchApiData<VendorStats | null>("/vendors/quota-status", null)
    ]).then(([reqData, statsData]) => {
      setRequests(reqData);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  async function handleReply(id: string, reply: string) {
    try {
      await patchApiData(`/vendors/custom-requests/${id}/reply`, { reply });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, vendorReply: reply, status: "REPLIED" as const } : r));
    } catch (error: any) { 
      alert(error.message || (isArabic ? "فشل إرسال الرد" : "Failed to send reply"));
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      await patchApiData(`/vendors/custom-requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
    } catch { /* ignore */ }
  }

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-700">
          {isArabic ? "طلبات العملاء" : "Customer Requests"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {isArabic ? "الطلبات المخصصة" : "Custom Requests"}
        </h1>
        <p className="mt-2 text-onyx-400">
          {isArabic
            ? `${requests.length} طلب — ${pendingCount} بانتظار الرد`
            : `${requests.length} requests — ${pendingCount} pending`}
        </p>

        {/* Subscription Status Card */}
        {stats && (
          <div className="mt-4 flex flex-wrap gap-3">
             {stats.trialExpiresAt && new Date(stats.trialExpiresAt) > new Date() ? (
               <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 border border-primary-100">
                 <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                 <span className="text-sm font-semibold text-primary-700">
                    {isArabic ? `الفترة التجريبية نشطة (تنتهي خلال ${Math.ceil((new Date(stats.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم)` : `Trial Active (${Math.ceil((new Date(stats.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)`}
                 </span>
               </div>
             ) : (
               <div className={cn(
                 "flex items-center gap-2 rounded-xl px-4 py-2 border",
                 stats.orderQuota > 0 ? "bg-success/10 border-success/30" : "bg-error/10 border-error/30"
               )}>
                  <Clock className={cn("h-4 w-4", stats.orderQuota > 0 ? "text-success" : "text-error")} />
                  <span className={cn("text-sm font-semibold", stats.orderQuota > 0 ? "text-success" : "text-error")}>
                    {isArabic ? `رصيد الأوردرات المتبقي: ${stats.orderQuota}` : `Remaining Orders: ${stats.orderQuota}`}
                  </span>
               </div>
             )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-[1.6rem] bg-onyx-800/50" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-onyx-700 bg-onyx-800/50 py-20 text-center">
          <Inbox className="h-12 w-12 text-onyx-600" />
          <p className="mt-4 text-lg font-semibold text-onyx-200">
            {isArabic ? "لا توجد طلبات بعد" : "No requests yet"}
          </p>
          <p className="mt-2 text-sm text-onyx-400">
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
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
