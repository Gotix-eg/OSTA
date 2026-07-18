"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Wrench,
  Store,
  MessageSquare,
  ShoppingBag,
  Star
} from "lucide-react";

import { serviceCategories } from "@/lib/shared";

import {
  DashboardBlock,
  EmptyState,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo,
  SubpageHero
} from "@/components/dashboard/dashboard-subpage-primitives";
import {
  ClientStitchBadge,
  ClientStitchEmpty,
  ClientStitchHero,
  ClientStitchMetric,
  ClientStitchPanel
} from "@/components/client/client-stitch-ui";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { patchApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import type { ClientRequestDetailData, ClientRequestListItem } from "@/lib/operations-data";

const savedAddresses = {
  "home-new-cairo": { ar: "المنزل - القاهرة الجديدة", en: "Home - New Cairo" },
  "villa-maadi": { ar: "الفيلا - المعادي", en: "Villa - Maadi" }
} as const;

function formatPrice(locale: Locale, price: number) {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(price);
  return locale === "ar" ? `${n} ج.م` : `EGP ${n}`;
}

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDateOnly(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function formatTimeOnly(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatCount(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function getServiceName(item: any, locale: Locale) {
  if (item && typeof item === "object") {
    if (locale === "ar" && item.serviceNameAr) return item.serviceNameAr;
    if (locale === "en" && item.serviceNameEn) return item.serviceNameEn;
    const serviceId = item.serviceId;
    for (const category of serviceCategories) {
      const service = category.services.find((s) => s.id === serviceId);
      if (service) return service.name[locale];
    }
    return serviceId;
  }

  const serviceId = String(item);
  for (const category of serviceCategories) {
    const service = category.services.find((s) => s.id === serviceId);
    if (service) return service.name[locale];
  }

  return serviceId;
}

function getStatusMeta(locale: Locale, status: string) {
  const labels: Record<string, { ar: string; en: string; tone: "sun" | "accent" | "primary" | "success" | "error" }> = {
    PENDING: { ar: "قيد الانتظار", en: "Pending", tone: "sun" },
    ACCEPTED: { ar: "تم القبول", en: "Accepted", tone: "primary" },
    WORKER_EN_ROUTE: { ar: "العامل في الطريق", en: "Worker en route", tone: "accent" },
    IN_PROGRESS: { ar: "قيد التنفيذ", en: "In progress", tone: "primary" },
    COMPLETED: { ar: "مكتمل", en: "Completed", tone: "success" },
    CONFIRMED_BY_CLIENT: { ar: "مؤكد من العميل", en: "Confirmed by client", tone: "success" },
    CANCELLED_BY_CLIENT: { ar: "ملغي من العميل", en: "Cancelled by client", tone: "error" },
    CANCELLED_BY_WORKER: { ar: "ملغي من الفني", en: "Cancelled by worker", tone: "error" },
    DISPUTED: { ar: "قيد النزاع", en: "Disputed", tone: "error" },
  };

  const meta = labels[status] || { ar: status, en: status, tone: "sun" };
  return {
    label: meta[locale],
    tone: meta.tone
  };
}

function translateArea(area: string, locale: Locale) {
  const translations: Record<string, { ar: string; en: string }> = {
    "القاهرة": { ar: "القاهرة", en: "Cairo" },
    "Cairo": { ar: "القاهرة", en: "Cairo" },
    "المنطقة": { ar: "المنطقة", en: "District" },
    "District": { ar: "المنطقة", en: "District" },
    "الشارع الرئيسي": { ar: "الشارع الرئيسي", en: "Main Street" },
    "Main Street": { ar: "الشارع الرئيسي", en: "Main Street" },
    "المعادي": { ar: "المعادي", en: "Maadi" },
    "Maadi": { ar: "المعادي", en: "Maadi" },
    "القاهرة الجديدة": { ar: "القاهرة الجديدة", en: "New Cairo" },
    "New Cairo": { ar: "القاهرة الجديدة", en: "New Cairo" },
    "التجمع الخامس": { ar: "التجمع الخامس", en: "Fifth Settlement" },
    "Fifth Settlement": { ar: "التجمع الخامس", en: "Fifth Settlement" },
    "Unknown": { ar: "غير معروف", en: "Unknown" },
    "Pending": { ar: "قيد التحديد", en: "Pending" },
    "قيد التحديد": { ar: "قيد التحديد", en: "Pending" },
  };

  return translations[area]?.[locale] || area;
}

function formatTiming(locale: Locale, timing: ClientRequestDetailData["timing"]) {
  if (timing.type === "emergency") return locale === "ar" ? "طوارئ خلال ساعة" : "Emergency within 1 hour";
  if (timing.type === "today") return locale === "ar" ? "اليوم" : "Today";
  if (timing.type === "tomorrow") return locale === "ar" ? "غدًا" : "Tomorrow";
  return `${timing.customDate ?? "-"} ${timing.customWindow ?? ""}`.trim();
}

function resolveAddress(locale: Locale, detail: ClientRequestDetailData) {
  if (detail.address.mode === "saved") {
    const saved = detail.address.savedAddressId ? savedAddresses[detail.address.savedAddressId as keyof typeof savedAddresses] : null;
    return saved ? saved[locale] : locale === "ar" ? "عنوان محفوظ" : "Saved address";
  }

  return [detail.address.governorate, detail.address.city, detail.address.district, detail.address.street]
    .filter(Boolean)
    .map((val) => translateArea(val || "", locale))
    .join(", ");
}

export interface CustomRequestItem {
  id: string;
  message: string;
  vendorReply: string | null;
  price: number | null;
  deliveryMethod: string | null;
  paymentMethod: string | null;
  status: "PENDING" | "REPLIED" | "ACCEPTED" | "PREPARING" | "SHIPPED" | "COMPLETED" | "REJECTED" | "CLOSED";
  createdAt: string;
  vendor: {
    id: string;
    shopName: string;
    shopNameAr?: string | null;
    shopImageUrl?: string | null;
  };
}

function ClientCustomRequestsBlock({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [confirmingItem, setConfirmingItem] = useState<CustomRequestItem | null>(null);
  const data = useLiveApiData<CustomRequestItem[]>("/vendors/my-custom-requests", []);

  return (
    <DashboardBlock title={isArabic ? "طلبات المتاجر الخاصة" : "Store Custom Requests"} eyebrow={isArabic ? "تواصل المتجر" : "Store communication"}>
      {data.length === 0 ? (
        <EmptyState>{isArabic ? "لا توجد أي طلبات أرسلتها لمتاجر" : "No store requests sent yet"}</EmptyState>
      ) : (
        <div className="grid gap-4">
          {data.map((item) => (
            <article key={item.id} className="onyx-card p-4 sm:p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {isArabic && item.vendor.shopNameAr ? item.vendor.shopNameAr : item.vendor.shopName}
                    </h2>
                    <SoftBadge 
                        label={
                          item.status === "PENDING" ? (isArabic ? "قيد الانتظار" : "Pending") : 
                          item.status === "REPLIED" ? (isArabic ? "تم الرد" : "Replied") : 
                          item.status === "ACCEPTED" ? (isArabic ? "تم القبول" : "Accepted") :
                          item.status === "PREPARING" ? (isArabic ? "جاري التحضير" : "Preparing") :
                          item.status === "SHIPPED" ? (isArabic ? "تم الشحن" : "Shipped") :
                          item.status === "COMPLETED" ? (isArabic ? "مكتمل" : "Completed") :
                          (isArabic ? "مرفوض" : "Rejected")
                        } 
                        tone={
                          item.status === "COMPLETED" || item.status === "REPLIED" || item.status === "ACCEPTED" ? "success" : 
                          item.status === "PENDING" || item.status === "PREPARING" || item.status === "SHIPPED" ? "sun" : "error"
                        } 
                    />
                  </div>
                  <div className="mt-4 break-words rounded-lg border border-white/5 bg-white/5 p-3 text-sm text-onyx-300">
                    <span className="mb-1 block text-eyebrow text-gold-500/70">{isArabic ? "رسالتك:" : "Your Request:"}</span>
                    {item.message}
                  </div>
                  
                  {item.vendorReply && (
                    <div className="mt-4 ring-2 ring-primary-500/20 break-words rounded-xl border border-primary-100 bg-primary-50/50 p-4 text-sm text-primary-950 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-primary-700">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{isArabic ? "رد المتجر:" : "Store Reply:"}</span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed font-medium">
                        {item.vendorReply}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-onyx-500">
                      {formatDate(locale, item.createdAt)}
                  </div>
                </div>

                {item.status === "REPLIED" && (
                   <div className="mt-4 xl:mt-0 xl:ps-6 xl:border-s xl:border-dark-100 flex flex-col justify-center">
                      <button 
                        onClick={() => setConfirmingItem(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary-700 active:scale-95"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isArabic ? "الموافقة وتأكيد الطلب" : "Approve & Order"}
                      </button>
                      <p className="mt-2 text-center text-[10px] text-onyx-500">
                        {isArabic ? "سيتم إبلاغ المتجر بقرارك فوراً" : "Store will be notified instantly"}
                      </p>
                   </div>
                )}

                {(item.status === "ACCEPTED" || item.status === "PREPARING" || item.status === "SHIPPED" || item.status === "COMPLETED") && (
                  <div className="mt-4 xl:mt-0 xl:ps-6 xl:border-s xl:border-dark-100 min-w-[200px]">
                     <div className="rounded-xl border border-white/5 bg-onyx-800/50/[0.03] p-3">
                        <p className="text-eyebrow text-onyx-500 mb-2">
                          {isArabic ? "تفاصيل التنفيذ" : "Execution details"}
                        </p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs">
                              <span className="text-onyx-400">{isArabic ? "التوصيل" : "Delivery"}</span>
                              <span className="font-semibold text-white">{item.deliveryMethod === "DELIVERY" ? (isArabic ? "توصيل" : "Delivery") : (isArabic ? "استلام" : "Pickup")}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                              <span className="text-onyx-400">{isArabic ? "الدفع" : "Payment"}</span>
                              <span className="font-semibold text-white">
                                 {item.paymentMethod === "VODAFONE_CASH" ? "Vodafone Cash" : 
                                  item.paymentMethod === "INSTAPAY" ? "InstaPay" : (isArabic ? "الدفع عند الاستلام" : "Cash on Delivery")}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {confirmingItem && (
        <OrderConfirmationModal 
          item={confirmingItem} 
          locale={locale} 
          onClose={() => setConfirmingItem(null)} 
          onSuccess={() => {
             setConfirmingItem(null);
             // useLiveApiData will auto-refresh
          }}
        />
      )}
    </DashboardBlock>
  );
}

function OrderConfirmationModal({ item, locale, onClose, onSuccess }: { item: CustomRequestItem; locale: Locale; onClose: () => void; onSuccess: () => void }) {
  const isArabic = locale === "ar";
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<"VODAFONE_CASH" | "INSTAPAY" | "COD">("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { patchApiData } = await import("@/lib/api");
      await patchApiData(`/vendors/custom-requests/${item.id}/accept`, {
        deliveryMethod,
        paymentMethod
      });
      onSuccess();
    } catch (error: any) {
      alert(error.message || (isArabic ? "فشل تأكيد الطلب" : "Failed to confirm order"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-onyx-950 p-6 shadow-2xl sm:p-8">
        <h2 className="text-2xl font-bold text-white font-display">
          {isArabic ? "تأكيد الطلب المخصص" : "Confirm Custom Order"}
        </h2>
        <p className="mt-2 text-sm text-onyx-400">
          {isArabic ? "اختر وسيلة الاستلام والدفع المناسبة لك لمتابعة الطلب مع المتجر." : "Choose your preferred delivery and payment methods to proceed with the store."}
        </p>

        <div className="mt-8 space-y-6">
          {/* Delivery Method */}
          <div>
            <label className="text-eyebrow text-gold-500/80 mb-3">
              {isArabic ? "وسيلة الاستلام" : "Delivery Method"}
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { id: "DELIVERY", label: isArabic ? "توصيل للمنزل" : "Delivery", icon: MapPin },
                { id: "PICKUP", label: isArabic ? "استلام من المحل" : "Pickup", icon: Store }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDeliveryMethod(m.id as any)}
                  className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    deliveryMethod === m.id ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-white/5 bg-white/5 text-onyx-400 hover:border-white/10"
                  }`}
                >
                  <m.icon className="h-5 w-5" />
                  <span className="text-sm font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-eyebrow text-gold-500/80 mb-3">
              {isArabic ? "وسيلة الدفع" : "Payment Method"}
            </label>
            <div className="mt-3 space-y-2">
              {[
                { id: "VODAFONE_CASH", label: "Vodafone Cash" },
                { id: "INSTAPAY", label: "InstaPay" },
                { id: "COD", label: isArabic ? "الدفع عند الاستلام" : "Cash on Delivery" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 transition-all ${
                    paymentMethod === m.id ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-white/5 bg-white/5 text-onyx-400 hover:border-white/10"
                  }`}
                >
                   <span className="text-sm font-bold">{m.label}</span>
                   <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === m.id ? "border-gold-500 bg-gold-500" : "border-onyx-700"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-white/10 py-4 text-sm font-bold text-onyx-400 hover:bg-white/5">
             {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button 
            disabled={isSubmitting}
            onClick={handleSubmit} 
            className="flex-1 rounded-full bg-gold-500 py-4 text-sm font-extrabold text-onyx-950 shadow-gold transition hover:bg-gold-400 active:scale-95 disabled:opacity-50"
          >
             {isSubmitting ? (isArabic ? "جاري..." : "Loading...") : (isArabic ? "تأكيد الطلب" : "Confirm Order")}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface DirectOrderListItem {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryNotes: string | null;
  paymentMethod: string;
  createdAt: string;
  vendor: {
    shopName: string;
    shopNameAr?: string | null;
    shopImageUrl?: string | null;
  };
  items: Array<{
    id: string;
    qty: number;
    unitPrice: number;
    product: {
      nameAr: string;
      nameEn?: string | null;
    };
  }>;
}

function ClientDirectOrdersBlock({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData<DirectOrderListItem[]>("/vendors/my-orders", []);

  function formatPrice(price: number) {
    const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(price);
    return locale === "ar" ? `${n} ج.م` : `EGP ${n}`;
  }

  function getOrderStatus(status: DirectOrderListItem["status"]) {
    switch (status) {
      case "PENDING": return { label: isArabic ? "قيد التأكيد" : "Pending", tone: "sun" as const };
      case "CONFIRMED": return { label: isArabic ? "مؤكد" : "Confirmed", tone: "primary" as const };
      case "PREPARING": return { label: isArabic ? "جاري التجهيز" : "Preparing", tone: "accent" as const };
      case "READY": return { label: isArabic ? "جاهز" : "Ready", tone: "accent" as const };
      case "IN_TRANSIT": return { label: isArabic ? "في الطريق" : "In Transit", tone: "primary" as const };
      case "DELIVERED": return { label: isArabic ? "تم التوصيل" : "Delivered", tone: "success" as const };
      case "CANCELLED": return { label: isArabic ? "ملغي" : "Cancelled", tone: "error" as const };
      default: return { label: status, tone: undefined };
    }
  }

  return (
    <DashboardBlock title={isArabic ? "مشتريات المتاجر" : "Store Orders"} eyebrow={isArabic ? "توصيل مباشر" : "Direct delivery"}>
      {data.length === 0 ? (
        <EmptyState>{isArabic ? "لا توجد أي مشتريات من المتاجر" : "No store orders yet"}</EmptyState>
      ) : (
        <div className="grid gap-4">
          {data.map((item) => {
            const statusInfo = getOrderStatus(item.status);
            return (
              <article key={item.id} className="onyx-card p-4 sm:p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-white">{isArabic && item.vendor.shopNameAr ? item.vendor.shopNameAr : item.vendor.shopName}</h2>
                      <SoftBadge label={statusInfo.label} tone={statusInfo.tone} />
                    </div>
                    
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "التكلفة" : "Total", value: formatPrice(item.totalAmount) },
                          { label: isArabic ? "المنتجات" : "Items", value: item.items.length.toString() }
                        ]}
                      />
                      
                      <div className="mt-4 rounded-xl border border-onyx-700 bg-onyx-800/50 p-3">
                        <p className="text-eyebrow text-onyx-500 mb-2">
                          {isArabic ? "المنتجات:" : "Products:"}
                        </p>
                        <ul className="space-y-1">
                          {item.items.map((line) => (
                            <li key={line.id} className="text-sm flex justify-between">
                              <span className="text-onyx-400">{line.qty} × {isArabic ? line.product.nameAr : (line.product.nameEn || line.product.nameAr)}</span>
                              <span className="font-medium text-white">{formatPrice(line.unitPrice * line.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {item.deliveryNotes && (
                         <div className="mt-3 text-xs text-onyx-500">
                           <strong>{isArabic ? "ملاحظات:" : "Notes:"}</strong> {item.deliveryNotes}
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardBlock>
  );
}

export function ClientRequestsPage({ locale, initialData }: { locale: Locale; initialData: ClientRequestListItem[] }) {
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as "services" | "custom_requests" | "direct_orders" | null;
  
  const [activeTab, setActiveTab] = useState<"services" | "custom_requests" | "direct_orders">(tabParam || "services");
  
  const data = useLiveApiData("/clients/requests", initialData);
  const customRequests = useLiveApiData<CustomRequestItem[]>("/vendors/my-custom-requests", []);
  const directOrders = useLiveApiData<DirectOrderListItem[]>("/vendors/my-orders", []);

  // Set default tab based on where there is data
  useEffect(() => {
    if (data.length === 0 && customRequests.length > 0) {
      setActiveTab("custom_requests");
    } else if (data.length === 0 && customRequests.length === 0 && directOrders.length > 0) {
      setActiveTab("direct_orders");
    }
  }, [data.length, customRequests.length, directOrders.length]);

  const counts = {
    total: data.length,
    pending: data.filter((item) => item.status === "PENDING").length,
    active: data.filter((item) => item.status === "WORKER_EN_ROUTE" || item.status === "IN_PROGRESS").length,
    completed: data.filter((item) => item.status === "COMPLETED").length
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <ClientStitchHero
        locale={locale}
        eyebrow={isArabic ? "مكتب الطلبات" : "Request command"}
        title={isArabic ? "طلباتي" : "MY REQUESTS"}
        subtitle={
          isArabic
            ? "تابع طلبات الصيانة ومشتريات المتاجر من لوحة تشغيل واضحة وسريعة."
            : "Track service requests and store orders from one sharp operations board."
        }
        actionLabel={isArabic ? "طلب جديد" : "New request"}
        actionHref={`/${locale}/client/new-request`}
        icon={Wrench}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClientStitchMetric label={isArabic ? "إجمالي الطلبات" : "Total requests"} value={formatCount(locale, counts.total)} note={isArabic ? "كل الطلبات" : "all jobs"} icon={Wrench} />
        <ClientStitchMetric label={isArabic ? "قيد المراجعة" : "Pending"} value={formatCount(locale, counts.pending)} note={isArabic ? "بانتظار إجراء" : "awaiting action"} icon={TimerReset} />
        <ClientStitchMetric label={isArabic ? "نشطة" : "Active"} value={formatCount(locale, counts.active)} note={isArabic ? "متابعة مباشرة" : "live follow-up"} icon={Sparkles} />
        <ClientStitchMetric label={isArabic ? "مكتملة" : "Completed"} value={formatCount(locale, counts.completed)} note={isArabic ? "أغلقت بنجاح" : "closed"} icon={CheckCircle2} dark />
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 overflow-x-auto border border-black/10 bg-white/70 p-2 shadow-[4px_4px_0_#1a1c1c] scrollbar-hide">
        <button
          onClick={() => setActiveTab("services")}
          className={`relative flex-shrink-0 flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "services" 
              ? "bg-black text-gold" 
              : "border border-black/10 bg-transparent text-black/70 hover:border-black"
          }`}
        >
          <Wrench className="h-4 w-4" />
          {isArabic ? "طلبات الصيانة" : "Service Requests"}
          {data.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sun-500 text-[10px] font-bold text-white ring-2 ring-onyx-900">
              {data.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("custom_requests")}
          className={`relative flex-shrink-0 flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "custom_requests" 
              ? "bg-black text-gold" 
              : "border border-black/10 bg-transparent text-black/70 hover:border-black"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          {isArabic ? "طلبات المتاجر (تواصل)" : "Store Custom Requests"}
          {customRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sun-500 text-[10px] font-bold text-white ring-2 ring-onyx-900">
              {customRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("direct_orders")}
          className={`relative flex-shrink-0 flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "direct_orders" 
              ? "bg-black text-gold" 
              : "border border-black/10 bg-transparent text-black/70 hover:border-black"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {isArabic ? "مشتريات المتاجر (توصيل)" : "Store Orders (Delivery)"}
          {directOrders.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sun-500 text-[10px] font-bold text-white ring-2 ring-onyx-900">
              {directOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "services" && (
        <ClientStitchPanel title={isArabic ? "تدفق الطلبات" : "Request stream"} eyebrow={isArabic ? "الطابور المباشر" : "live queue"}>
          {data.length === 0 ? (
            <ClientStitchEmpty>{isArabic ? "لا توجد طلبات حاليًا" : "No requests yet"}</ClientStitchEmpty>
          ) : (
            <div className="grid gap-4">
              {data.map((item) => {
                const status = getStatusMeta(locale, item.status);
                return (
                  <article key={item.id} className="border border-white/10 bg-[#121212] p-4 transition hover:border-gold/60 sm:p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black uppercase text-white sm:text-2xl">{item.title}</h2>
                          <ClientStitchBadge tone={status.tone === "success" ? "success" : status.tone === "error" ? "danger" : "gold"}>{status.label}</ClientStitchBadge>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {[
                            { label: isArabic ? "رقم الطلب" : "Request no", value: item.requestNumber },
                            { label: isArabic ? "الخدمة" : "Service", value: getServiceName(item, locale) },
                            { label: isArabic ? "المنطقة" : "Area", value: translateArea(item.area, locale) },
                            { label: isArabic ? "تاريخ الإنشاء" : "Created", value: formatDate(locale, item.createdAt) }
                          ].map((info) => (
                            <div key={info.label} className="border border-white/5 bg-black p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{info.label}</p>
                              <p className="mt-2 truncate text-sm font-bold text-white">{info.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link href={`/${locale}/client/request/${item.id}`} className="inline-flex items-center justify-center gap-2 border border-white bg-white px-4 py-3 text-xs font-black uppercase text-black transition hover:bg-gold">
                        {isArabic ? "التفاصيل" : "Details"}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </ClientStitchPanel>
      )}

      {activeTab === "custom_requests" && (
        <ClientCustomRequestsBlock locale={locale} />
      )}

      {activeTab === "direct_orders" && (
        <ClientDirectOrdersBlock locale={locale} />
      )}
    </div>
  );
}

export function ClientRequestDetailPage({ locale, requestId, initialData }: { locale: Locale; requestId: string; initialData: ClientRequestDetailData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData(`/clients/requests/${requestId}`, initialData);
  const status = getStatusMeta(locale, data.status);

  const currentPrice = data.finalPrice || data.estimatedPrice || 0;
  const serviceName = getServiceName(data, locale);
  const addressText = resolveAddress(locale, data);
  const priceText = currentPrice > 0 ? formatPrice(locale, currentPrice) : (isArabic ? "غير محدد" : "Not specified");
  const canEditBudget = ["PENDING", "ACCEPTED", "WORKER_EN_ROUTE", "IN_PROGRESS"].includes(data.status);
  const mapImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAYCCgb8EMbX5TBAInhvCXHspEoppbuxNBQuUz3UxzY__E-M4gnuGuX9qyDZv8dgUY-KMI38-pDvEmIrfeAl8VrAk1ULYen26GSn7VB2wRs4_b1nNbvkVsnORsCGWP8_FbHNknyu1lVzrPxeQXkj65ADH4O1bNYxZmH2rcoUUWNELHG8-fZ2IZZwkuohxWFiIx8lgwAbTBK9ytOUMfHkHwg7K-PcKwa9G0VMAwH6ssOzNvcEmsYFAYatx_hSoWh0PqblOgbwlLTCIg";

  const handleEditBudget = async () => {
    const promptText = isArabic
      ? `أدخل الميزانية/السعر الجديد المقترح (ج.م) [الحالي: ${currentPrice ? formatPrice(locale, currentPrice) : "غير محدد"}]:`
      : `Enter new proposed budget/price (EGP) [Current: ${currentPrice ? formatPrice(locale, currentPrice) : "none"}]:`;
    
    const userInput = prompt(promptText);
    if (userInput === null) return;
    
    const parsed = parseFloat(userInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert(isArabic ? "يرجى إدخال سعر صحيح أكبر من الصفر." : "Please enter a valid price greater than zero.");
      return;
    }

    try {
      await patchApiData(`/clients/requests/${requestId}/budget`, { price: parsed });
      alert(isArabic ? "تم تحديث الميزانية بنجاح" : "Budget updated successfully");
      window.location.reload();
    } catch (err: any) {
      alert(err.message || (isArabic ? "فشل تعديل الميزانية" : "Failed to update budget"));
    }
  };

  const openChat = () => {
    if (!data.worker) {
      alert(isArabic ? "لم يتم تعيين فني لهذا الطلب حتى الآن." : "No pro has been assigned to this request yet.");
      return;
    }

    window.dispatchEvent(new CustomEvent("osta_open_chat", {
      detail: { id: data.worker.userId, firstName: data.worker.name, lastName: "" }
    }));
  };

  return (
    <div className="relative -m-4 min-h-screen bg-gold px-4 pb-28 pt-4 text-[#1a1c1c] sm:-m-6 sm:px-6 sm:py-6 lg:-m-8 lg:px-12 lg:py-10">
      <div className="hidden items-center justify-between gap-6 md:flex">
        <Link
          href={`/${locale}/client/my-requests`}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-black px-6 py-4 text-sm font-black uppercase tracking-[0.05em] text-white shadow-[6px_6px_0_#ffffff] transition hover:-translate-y-0.5"
        >
          <ChevronRight className={`h-5 w-5 ${isArabic ? "" : "rotate-180"}`} />
          {isArabic ? "العودة إلى الطلبات" : "Back to requests"}
        </Link>

        <div className="flex items-center gap-4 rounded-lg border border-gold/30 bg-black px-6 py-3 text-white">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{isArabic ? "رقم الطلب" : "Request ID"}</span>
            <span className="text-2xl font-black leading-none text-gold">{data.requestNumber}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{isArabic ? "الحالة" : "Status"}</span>
            <span className="text-sm font-black uppercase tracking-tight text-white">{status.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-0 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-12">
        <section className="relative overflow-hidden rounded-lg border-2 border-gold/20 bg-black p-6 text-white md:col-span-12 md:flex md:items-center md:justify-between md:p-12">
          <div className="relative z-10">
            <div className="mb-3 flex items-start justify-between gap-4 md:hidden">
              <span className="rounded-sm bg-gold px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black">{status.label}</span>
              <span className="font-mono text-xs text-white/40">{data.requestNumber}</span>
            </div>
            <p className="hidden text-xs font-black uppercase tracking-[0.24em] text-gold md:block">{data.requestNumber}</p>
            <h1 className="text-3xl font-black leading-tight text-white md:mt-4 md:text-5xl">{data.title || (isArabic ? "تفاصيل الطلب" : "Request details")}</h1>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.05em] text-gold md:text-2xl md:normal-case md:tracking-normal">{serviceName}</p>
            <Link
              href={`/${locale}/client/my-requests`}
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-white px-5 py-2 text-sm font-black text-black shadow-[4px_4px_0_#000000] md:hidden"
            >
              <ChevronRight className={`h-4 w-4 ${isArabic ? "" : "rotate-180"}`} />
              {isArabic ? "العودة إلى الطلبات" : "Back to requests"}
            </Link>
          </div>

          <div className="relative z-10 mt-6 hidden gap-6 md:flex">
            <div className="flex min-w-[140px] flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-6 text-center">
              <Clock3 className="mb-2 h-9 w-9 text-gold" />
              <span className="text-2xl font-black text-white">{formatTiming(locale, data.timing)}</span>
              <span className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{isArabic ? "التوقيت" : "Scheduled timing"}</span>
            </div>
            <div className="flex min-w-[140px] flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-6 text-center">
              <TimerReset className="mb-2 h-9 w-9 text-gold" />
              <span className="text-2xl font-black text-white">{status.label}</span>
              <span className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{isArabic ? "الحالة الحالية" : "Current status"}</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 md:hidden">
          <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black p-4 text-center text-white">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#775a00]/30 text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="mb-1 text-xs font-black uppercase text-white/60">{isArabic ? "الحالة" : "Status"}</span>
            <span className="font-black text-gold">{status.label}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black p-4 text-center text-white">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#775a00]/30 text-gold">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="mb-1 text-xs font-black uppercase text-white/60">{isArabic ? "التوقيت" : "Timing"}</span>
            <span className="font-black text-white">{formatTiming(locale, data.timing)}</span>
          </div>
        </section>

        <section className="flex flex-col gap-6 md:col-span-5">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black text-white">
            <div className="hidden items-center justify-between border-b border-white/10 bg-white/5 p-6 md:flex">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">{isArabic ? "الموقع والخط الزمني" : "Location & timeline"}</h2>
              <MapPin className="h-6 w-6 text-gold" />
            </div>
            <div className="relative h-48 overflow-hidden md:h-64 md:grayscale md:contrast-125">
              <div className="absolute inset-0 bg-cover bg-center opacity-75" style={{ backgroundImage: `url(${mapImage})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 md:bottom-6 md:left-6 md:right-auto md:block">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-gold md:hidden">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-white md:text-2xl">{translateArea(data.area, locale) || addressText}</p>
                  <p className="text-xs font-bold text-white/60 md:mt-1 md:text-base md:text-gold">{addressText}</p>
                </div>
              </div>
            </div>
            <div className="hidden space-y-4 p-8 md:block">
              <div className="flex items-start gap-4 rounded-lg border border-white/5 bg-white/5 p-4">
                <Clock3 className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">{isArabic ? "تاريخ الإنشاء" : "Created date"}</p>
                  <p className="mt-1 text-base font-black text-white">{formatDate(locale, data.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-white/5 bg-white/5 p-4">
                <TimerReset className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">{isArabic ? "آخر تحديث" : "Last updated"}</p>
                  <p className="mt-1 text-base font-black text-white">{formatDate(locale, data.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black p-6 text-white md:hidden">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
              <Clock3 className="h-5 w-5 text-gold" />
              <h2 className="text-2xl font-black text-white">{isArabic ? "العنوان والخط الزمني" : "Location & timeline"}</h2>
            </div>
            <div className={`relative mt-4 space-y-8 ${isArabic ? "pr-6" : "pl-6"}`}>
              <div className={`absolute bottom-2 top-2 w-0.5 bg-white/10 ${isArabic ? "right-[7px]" : "left-[7px]"}`} />
              {[
                { label: isArabic ? "تاريخ الإنشاء" : "Created date", date: formatDateOnly(locale, data.createdAt), time: formatTimeOnly(locale, data.createdAt), active: true },
                { label: isArabic ? "آخر تحديث" : "Last updated", date: formatDateOnly(locale, data.updatedAt), time: formatTimeOnly(locale, data.updatedAt), active: data.status !== "PENDING" }
              ].map((item) => (
                <div className="relative" key={item.label}>
                  <div className={`absolute top-1 h-4 w-4 rounded-full border-4 border-black ${item.active ? "bg-gold" : "bg-white/20"} ${isArabic ? "-right-6" : "-left-6"}`} />
                  <span className="block text-[10px] font-black uppercase text-white/40">{item.label}</span>
                  <p className="mt-1 text-base font-black text-white">{item.date}</p>
                  <p className="text-xs font-semibold text-white/60">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6 md:col-span-7">
          <div className="rounded-lg border border-white/10 bg-black text-white">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-black md:uppercase md:tracking-tight">{isArabic ? "سياق الطلب" : "Issue context"}</h2>
              <Wrench className="h-6 w-6 text-gold" />
            </div>
            <div className="space-y-6 p-6 md:p-8">
              <div>
                <p className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-gold">{isArabic ? "الخدمة" : "Service type"}</p>
                <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <p className="text-lg font-black text-white md:text-2xl">{serviceName}</p>
                </div>
              </div>
              <div>
                <p className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-gold">{isArabic ? "الوصف" : "User description"}</p>
                <div className="min-h-[100px] rounded-lg border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold italic leading-7 text-white/80 md:text-base">
                    &ldquo;{data.description || (isArabic ? "لا يوجد وصف مضاف" : "No description added")}&rdquo;
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-gold">{isArabic ? "الميزانية / السعر" : "Budget / price"}</p>
                  <div className="flex h-full items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-5 md:block">
                    <p className="text-2xl font-black text-gold md:text-white">{priceText}</p>
                    {canEditBudget ? (
                      <button onClick={handleEditBudget} className="shrink-0 border-b-2 border-gold pb-1 text-sm font-black text-gold md:hidden">
                        {isArabic ? "تعديل السعر" : "Edit price"}
                      </button>
                    ) : null}
                  </div>
                </div>
                <div>
                  <p className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-gold">{isArabic ? "المرفقات" : "Media attachments"}</p>
                  <div className="flex h-full min-h-20 items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white/45">{data.mediaNotes || (isArabic ? "لا توجد ملفات مرفقة" : "No files attached")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden flex-col justify-end gap-4 rounded-b-lg border-t border-white/10 bg-white/5 p-8 sm:flex-row md:flex">
              {canEditBudget ? (
                <button onClick={handleEditBudget} className="rounded-lg border-2 border-white px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black">
                  {isArabic ? "تعديل الميزانية" : "Edit budget"}
                </button>
              ) : null}
              <button disabled className="rounded-lg bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-black opacity-60 shadow-[6px_6px_0_#000000]">
                {isArabic ? "إلغاء الطلب" : "Cancel request"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <button
        onClick={openChat}
        className="fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-sm bg-white text-black shadow-[4px_4px_0_#000000] transition active:scale-95 md:hidden"
        aria-label={isArabic ? "محادثة الفني" : "Chat with pro"}
      >
        <MessageSquare className="h-7 w-7" />
      </button>
    </div>
  );
}
