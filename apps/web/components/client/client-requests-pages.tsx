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
  ShoppingBag
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
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";
import type { ClientRequestDetailData, ClientRequestListItem } from "@/lib/operations-data";

const savedAddresses = {
  "home-new-cairo": { ar: "المنزل - القاهرة الجديدة", en: "Home - New Cairo" },
  "villa-maadi": { ar: "الفيلا - المعادي", en: "Villa - Maadi" }
} as const;

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getServiceName(serviceId: string, locale: Locale) {
  for (const category of serviceCategories) {
    const service = category.services.find((item) => item.id === serviceId);
    if (service) return service.name[locale];
  }

  return serviceId;
}

function getStatusMeta(locale: Locale, status: ClientRequestListItem["status"]) {
  const labels = {
    PENDING: { ar: "قيد المراجعة", en: "Pending review", tone: "sun" as const },
    WORKER_EN_ROUTE: { ar: "العامل في الطريق", en: "Worker en route", tone: "accent" as const },
    IN_PROGRESS: { ar: "قيد التنفيذ", en: "In progress", tone: "primary" as const },
    COMPLETED: { ar: "مكتمل", en: "Completed", tone: "success" as const }
  } as const;

  return {
    label: labels[status][locale],
    tone: labels[status].tone
  };
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

  return [detail.address.governorate, detail.address.city, detail.address.district, detail.address.street].filter(Boolean).join(", ");
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
    <div>
      <SubpageHero
        eyebrow={isArabic ? "مكتب الطلبات" : "Request desk"}
        title={isArabic ? "طلباتي" : "My requests"}
        subtitle={
          isArabic
            ? "شاهد كل الطلبات وحالتها وتوقيت إنشائها من مساحة أوضح وأكثر تنظيمًا."
            : "Track every request, its current status, and the booking timeline from one clearer workspace."
        }
        actionLabel={isArabic ? "طلب جديد" : "New request"}
        actionHref={`/${locale}/client/new-request`}
        tone="primary"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "إجمالي الطلبات" : "Total requests"} value={String(counts.total)} note={isArabic ? "كل الطلبات المنشأة" : "all created jobs"} icon={Wrench} tone="primary" />
        <MiniMetric label={isArabic ? "قيد المراجعة" : "Pending review"} value={String(counts.pending)} note={isArabic ? "ما زالت تنتظر الإجراء" : "still waiting for action"} icon={TimerReset} tone="sun" />
        <MiniMetric label={isArabic ? "طلبات نشطة" : "Active requests"} value={String(counts.active)} note={isArabic ? "متابعة مباشرة" : "live follow-up"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "مكتملة" : "Completed"} value={String(counts.completed)} note={isArabic ? "أغلقت بنجاح" : "closed successfully"} icon={CheckCircle2} tone="dark" />
      </div>

      {/* Tabs Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab("services")}
          className={`relative flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "services" 
              ? "bg-gold-500 text-onyx-950 shadow-gold" 
              : "border border-white/10 bg-white/5 text-onyx-400 hover:bg-white/10"
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
          className={`relative flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "custom_requests" 
              ? "bg-gold-500 text-onyx-950 shadow-gold" 
              : "border border-white/10 bg-white/5 text-onyx-400 hover:bg-white/10"
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
          className={`relative flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "direct_orders" 
              ? "bg-gold-500 text-onyx-950 shadow-gold" 
              : "border border-white/10 bg-white/5 text-onyx-400 hover:bg-white/10"
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
        <DashboardBlock title={isArabic ? "تدفق الطلبات" : "Request stream"} eyebrow={isArabic ? "الطابور المباشر" : "live queue"}>
          {data.length === 0 ? (
            <EmptyState>{isArabic ? "لا توجد طلبات حاليًا" : "No requests yet"}</EmptyState>
          ) : (
            <div className="grid gap-4">
              {data.map((item) => {
                const status = getStatusMeta(locale, item.status);
                return (
                  <article key={item.id} className="onyx-card p-4 sm:p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
                          <SoftBadge label={status.label} tone={status.tone} />
                        </div>
                        <div className="mt-4">
                          <SplitInfo
                            items={[
                              { label: isArabic ? "رقم الطلب" : "Request no", value: item.requestNumber },
                              { label: isArabic ? "الخدمة" : "Service", value: getServiceName(item.serviceId, locale) },
                              { label: isArabic ? "المنطقة" : "Area", value: item.area },
                              { label: isArabic ? "تاريخ الإنشاء" : "Created", value: formatDate(locale, item.createdAt) }
                            ]}
                          />
                        </div>
                      </div>

                      <Link href={`/${locale}/client/request/${item.id}`} className="inline-flex items-center gap-2 rounded-full border border-onyx-700 bg-onyx-800/50 px-4 py-2.5 text-sm font-semibold text-onyx-200 shadow-soft transition hover:border-primary-300 hover:text-primary-700">
                        {isArabic ? "التفاصيل" : "Details"}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </DashboardBlock>
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

  return (
    <div>
      <SubpageHero
        eyebrow={data.requestNumber}
        title={data.title}
        subtitle={data.description}
        actionLabel={isArabic ? "العودة إلى الطلبات" : "Back to requests"}
        actionHref={`/${locale}/client/my-requests`}
        tone="accent"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "الحالة" : "Status"} value={status.label} note={isArabic ? "الحالة الحالية للطلب" : "current request state"} icon={ShieldCheck} tone="primary" />
        <MiniMetric label={isArabic ? "الخدمة" : "Service"} value={getServiceName(data.serviceId, locale)} note={isArabic ? "الفئة المطلوبة" : "requested category"} icon={Wrench} tone="sun" />
        <MiniMetric label={isArabic ? "التوقيت" : "Timing"} value={formatTiming(locale, data.timing)} note={isArabic ? "الموعد المفضل" : "preferred schedule"} icon={Clock3} tone="accent" />
        <MiniMetric label={isArabic ? "المنطقة" : "Area"} value={data.area} note={isArabic ? "منطقة الخدمة" : "delivery zone"} icon={MapPin} tone="dark" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardBlock title={isArabic ? "سياق الطلب" : "Request context"} eyebrow={isArabic ? "تفاصيل المشكلة" : "issue profile"}>
          <div className="grid gap-4">
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "الخدمة" : "Service"}</p>
              <p className="mt-3 text-lg font-semibold text-white">{getServiceName(data.serviceId, locale)}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "الوصف" : "Description"}</p>
              <p className="mt-3 text-sm leading-7 text-onyx-300">{data.description}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "ملاحظات الوسائط" : "Media notes"}</p>
              <p className="mt-3 text-sm leading-7 text-onyx-300">{data.mediaNotes || (isArabic ? "لا توجد ملاحظات" : "No notes added")}</p>
            </SoftCard>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "العنوان والخط الزمني" : "Delivery + timeline"} eyebrow={isArabic ? "تفاصيل الوصول" : "address rail"}>
          <div className="grid gap-4">
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "الموقع" : "Location"}</p>
              <p className="mt-3 text-sm font-semibold text-white">{resolveAddress(locale, data)}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-onyx-500">{isArabic ? "التوقيت المطلوب" : "Requested timing"}</p>
              <p className="mt-3 text-sm font-semibold text-white">{formatTiming(locale, data.timing)}</p>
            </SoftCard>
            <SplitInfo
              items={[
                { label: isArabic ? "تاريخ الإنشاء" : "Created", value: formatDate(locale, data.createdAt) },
                { label: isArabic ? "آخر تحديث" : "Updated", value: formatDate(locale, data.updatedAt) }
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <SoftBadge label={status.label} tone={status.tone} />
              <SoftBadge label={data.requestNumber} tone="accent" />
            </div>
          </div>
        </DashboardBlock>
      </div>
    </div>
  );
}
