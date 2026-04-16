"use client";

import { useState } from "react";
import Link from "next/link";

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
  MessageSquare
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
  status: "PENDING" | "REPLIED" | "REJECTED";
  createdAt: string;
  vendor: {
    shopName: string;
    shopNameAr?: string | null;
    shopImageUrl?: string | null;
  };
}

function ClientCustomRequestsBlock({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData<CustomRequestItem[]>("/vendors/my-custom-requests", []);

  return (
    <DashboardBlock title={isArabic ? "طلبات المتاجر الخاصة" : "Store Custom Requests"} eyebrow={isArabic ? "تواصل المتجر" : "Store communication"}>
      {data.length === 0 ? (
        <EmptyState>{isArabic ? "لا توجد أي طلبات أرسلتها لمتاجر" : "No store requests sent yet"}</EmptyState>
      ) : (
        <div className="grid gap-4">
          {data.map((item) => (
            <article key={item.id} className="dashboard-card-soft p-4 sm:p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-dark-950">{isArabic && item.vendor.shopNameAr ? item.vendor.shopNameAr : item.vendor.shopName}</h2>
                    <SoftBadge 
                        label={item.status === "PENDING" ? (isArabic ? "قيد الانتظار" : "Pending") : item.status === "REPLIED" ? (isArabic ? "تم الرد" : "Replied") : (isArabic ? "مرفوض" : "Rejected")} 
                        tone={item.status === "REPLIED" ? "success" : item.status === "PENDING" ? "sun" : "error"} 
                    />
                  </div>
                  <div className="mt-4 break-words rounded-lg border border-dark-100 bg-white p-3 text-sm text-dark-600">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dark-400">{isArabic ? "رسالتك:" : "Your Request:"}</span>
                    {item.message}
                  </div>
                  
                  {item.vendorReply && (
                    <div className="mt-3 break-words rounded-lg border border-primary-100 bg-primary-50/50 p-3 text-sm text-primary-900 line-clamp-4 hover:line-clamp-none transition-all">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-primary-600">{isArabic ? "رد المتجر:" : "Store Reply:"}</span>
                      {item.vendorReply}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-dark-400">
                      {formatDate(locale, item.createdAt)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardBlock>
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
      default: return { label: status, tone: "dark" as const };
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
              <article key={item.id} className="dashboard-card-soft p-4 sm:p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-dark-950">{isArabic && item.vendor.shopNameAr ? item.vendor.shopNameAr : item.vendor.shopName}</h2>
                      <SoftBadge label={statusInfo.label} tone={statusInfo.tone} />
                    </div>
                    
                    <div className="mt-4">
                      <SplitInfo
                        items={[
                          { label: isArabic ? "رقم الطلب" : "Order no", value: item.orderNumber },
                          { label: isArabic ? "الإجمالي" : "Total", value: formatPrice(item.totalAmount) },
                          { label: isArabic ? "طريقة الدفع" : "Payment", value: item.paymentMethod === "CASH_ON_DELIVERY" ? (isArabic ? "دفع عند الاستلام" : "Cash on Delivery") : item.paymentMethod },
                          { label: isArabic ? "التاريخ" : "Date", value: formatDate(locale, item.createdAt) }
                        ]}
                      />
                    </div>

                    <div className="mt-4 rounded-lg border border-dark-100 bg-surface-soft p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark-400">
                        {isArabic ? "المنتجات:" : "Products:"}
                      </p>
                      <ul className="space-y-1">
                        {item.items.map((line) => (
                          <li key={line.id} className="text-sm flex justify-between">
                            <span className="text-dark-700">{line.qty} × {isArabic ? line.product.nameAr : (line.product.nameEn || line.product.nameAr)}</span>
                            <span className="font-medium text-dark-950">{formatPrice(line.unitPrice * line.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {item.deliveryNotes && (
                       <div className="mt-3 text-xs text-dark-500">
                         <strong>{isArabic ? "ملاحظات:" : "Notes:"}</strong> {item.deliveryNotes}
                       </div>
                    )}
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
  const [activeTab, setActiveTab] = useState<"services" | "custom_requests" | "direct_orders">("services");
  
  const data = useLiveApiData("/clients/requests", initialData);

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
          className={`flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "services" 
              ? "bg-primary-600 text-white shadow-soft" 
              : "border border-dark-200 bg-white text-dark-600 hover:bg-dark-50"
          }`}
        >
          <Wrench className="h-4 w-4" />
          {isArabic ? "طلبات الصيانة" : "Service Requests"}
        </button>
        <button
          onClick={() => setActiveTab("custom_requests")}
          className={`flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "custom_requests" 
              ? "bg-primary-600 text-white shadow-soft" 
              : "border border-dark-200 bg-white text-dark-600 hover:bg-dark-50"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          {isArabic ? "طلبات المتاجر (تواصل)" : "Store Custom Requests"}
        </button>
        <button
          onClick={() => setActiveTab("direct_orders")}
          className={`flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "direct_orders" 
              ? "bg-primary-600 text-white shadow-soft" 
              : "border border-dark-200 bg-white text-dark-600 hover:bg-dark-50"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {isArabic ? "مشتريات المتاجر (توصيل)" : "Store Orders (Delivery)"}
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
                  <article key={item.id} className="dashboard-card-soft p-4 sm:p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-semibold text-dark-950">{item.title}</h2>
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

                      <Link href={`/${locale}/client/request/${item.id}`} className="inline-flex items-center gap-2 rounded-full border border-dark-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark-700 shadow-soft transition hover:border-primary-300 hover:text-primary-700">
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
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الخدمة" : "Service"}</p>
              <p className="mt-3 text-lg font-semibold text-dark-950">{getServiceName(data.serviceId, locale)}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الوصف" : "Description"}</p>
              <p className="mt-3 text-sm leading-7 text-dark-600">{data.description}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "ملاحظات الوسائط" : "Media notes"}</p>
              <p className="mt-3 text-sm leading-7 text-dark-600">{data.mediaNotes || (isArabic ? "لا توجد ملاحظات" : "No notes added")}</p>
            </SoftCard>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "العنوان والخط الزمني" : "Delivery + timeline"} eyebrow={isArabic ? "تفاصيل الوصول" : "address rail"}>
          <div className="grid gap-4">
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "الموقع" : "Location"}</p>
              <p className="mt-3 text-sm font-semibold text-dark-950">{resolveAddress(locale, data)}</p>
            </SoftCard>
            <SoftCard>
              <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{isArabic ? "التوقيت المطلوب" : "Requested timing"}</p>
              <p className="mt-3 text-sm font-semibold text-dark-950">{formatTiming(locale, data.timing)}</p>
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
