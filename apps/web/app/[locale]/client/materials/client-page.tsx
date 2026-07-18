"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Plus, 
  Clock, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  MessageSquare, 
  MapPin, 
  AlertCircle, 
  DollarSign, 
  Wrench,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { ClientStitchHero, ClientStitchMetric } from "@/components/client/client-stitch-ui";

interface VendorUser {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface VendorProfile {
  id: string;
  storeName?: string;
  user: VendorUser;
}

interface MaterialOffer {
  id: string;
  price: number;
  deliveryFee: number;
  totalPrice: number;
  estimatedDeliveryTime: number;
  notes?: string;
  isAccepted: boolean;
  vendor: VendorProfile;
}

interface MaterialOrder {
  id: string;
  status: string;
  deliveryMethod: string;
  paymentMethod: string;
  totalAmount: number;
}

interface MaterialRequest {
  id: string;
  title: string;
  description: string;
  deliveryMethod: string;
  status: string;
  createdAt: string;
  offers: MaterialOffer[];
  order?: MaterialOrder;
}

function formatCount(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

export default function ClientMaterialsClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDeliveryMethod, setFormDeliveryMethod] = useState("VENDOR_DELIVERY");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Offer Acceptance Modal State
  const [acceptingOffer, setAcceptingOffer] = useState<MaterialOffer | null>(null);
  const [acceptPaymentMethod, setAcceptPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);

  async function loadRequests() {
    try {
      const data = await fetchApiData<MaterialRequest[]>("/materials/requests", []);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load material requests", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    
    if (formTitle.length < 2) {
      setFormError(isArabic ? "العنوان يجب أن يكون حرفين على الأقل" : "Title must be at least 2 characters");
      return;
    }
    if (formDescription.length < 5) {
      setFormError(isArabic ? "الوصف يجب أن يكون 5 أحرف على الأقل" : "Description must be at least 5 characters");
      return;
    }

    setSubmitting(true);
    try {
      await postApiData("/materials/requests", {
        title: formTitle,
        description: formDescription,
        deliveryMethod: formDeliveryMethod,
        latitude: 30.0444, // Default Cairo coords, normally HTML5 Geolocation is used
        longitude: 31.2357
      });
      
      setFormTitle("");
      setFormDescription("");
      setShowCreateModal(false);
      loadRequests();
    } catch (err: any) {
      setFormError(err.message || (isArabic ? "حدث خطأ أثناء حفظ الطلب" : "An error occurred"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAcceptOfferSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptingOffer || !selectedRequest) return;

    setAcceptSubmitting(true);
    try {
      await postApiData(`/materials/offers/${acceptingOffer.id}/accept`, {
        requestId: selectedRequest.id,
        deliveryMethod: selectedRequest.deliveryMethod,
        paymentMethod: acceptPaymentMethod
      });

      setAcceptingOffer(null);
      const updatedDetails = await fetchApiData<MaterialRequest>(`/materials/requests/${selectedRequest.id}`, selectedRequest);
      setSelectedRequest(updatedDetails);
      loadRequests();
    } catch (err: any) {
      alert(err.message || (isArabic ? "فشل قبول العرض" : "Failed to accept offer"));
    } finally {
      setAcceptSubmitting(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const states: Record<string, { labelAr: string; labelEn: string; classes: string }> = {
      PENDING: { labelAr: "انتظار العروض", labelEn: "Pending Offers", classes: "bg-gold-500/10 text-gold-500 border border-gold-500/20" },
      OFFERS_RECEIVED: { labelAr: "تم تلقي عروض", labelEn: "Offers Received", classes: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
      ACCEPTED: { labelAr: "مقبول", labelEn: "Accepted", classes: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
      PREPARING: { labelAr: "قيد التحضير", labelEn: "Preparing", classes: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
      SHIPPED: { labelAr: "تم الشحن", labelEn: "Shipped", classes: "bg-orange-500/10 text-orange-400 border border-orange-500/20" },
      DELIVERED: { labelAr: "تم التوصيل", labelEn: "Delivered", classes: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" }
    };
    const s = states[status] || { labelAr: status, labelEn: status, classes: "bg-white/5 text-white/70" };
    return (
      <span className={`border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${s.classes.replace("rounded-full", "")}`}>
        {isArabic ? s.labelAr : s.labelEn}
      </span>
    );
  };

  const openRequests = requests.filter((request) => request.status === "PENDING" || request.status === "OFFERS_RECEIVED").length;
  const totalOffers = requests.reduce((sum, request) => sum + request.offers.length, 0);
  const acceptedRequests = requests.filter((request) => request.status === "ACCEPTED" || Boolean(request.order)).length;

  return (
    <DashboardShell locale={locale} role="client">
      <div className="space-y-6 animate-slideUp lg:space-y-8">
        <ClientStitchHero
          locale={locale}
          eyebrow={isArabic ? "سوق الخامات" : "Materials market"}
          title={isArabic ? "عروض الخامات" : "MATERIALS MARKET"}
          subtitle={
            isArabic
              ? "اطلب الخامات ودع المتاجر المحلية ترسل عروض أسعار واضحة وسريعة."
              : "Request materials and let local vendors send fast, competitive quotes."
          }
          icon={Package}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <ClientStitchMetric label={isArabic ? "طلبات مفتوحة" : "Open requests"} value={formatCount(locale, openRequests)} note={isArabic ? "بانتظار عروض" : "awaiting bids"} icon={Clock} />
          <ClientStitchMetric label={isArabic ? "العروض" : "Offers"} value={formatCount(locale, totalOffers)} note={isArabic ? "إجمالي العروض" : "total bids"} icon={MessageSquare} />
          <ClientStitchMetric label={isArabic ? "طلبات مؤكدة" : "Accepted"} value={formatCount(locale, acceptedRequests)} note={isArabic ? "قيد التنفيذ" : "in execution"} icon={CheckCircle2} dark />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              loadRequests();
            }}
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 border border-black bg-white px-4 text-xs font-black uppercase text-black shadow-[4px_4px_0_#1a1c1c] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {isArabic ? "تحديث" : "Refresh"}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-12 items-center gap-2 bg-black px-5 text-xs font-black uppercase text-gold shadow-[4px_4px_0_#1a1c1c] transition active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Plus className="h-5 w-5" />
            {isArabic ? "طلب خامات جديد" : "Request materials"}
          </button>
        </div>

        {/* Content Body */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Requests Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-black">
              <Package className="h-5 w-5 text-black/35" />
              {isArabic ? "طلباتي المفتوحة" : "My Active Requests"}
              </h2>
              <span className="border-b border-black text-xs font-black uppercase text-black/70">
                {formatCount(locale, requests.length)}
              </span>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center border border-white/10 bg-black shadow-[6px_6px_0_#1a1c1c]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center border border-white/10 bg-black p-8 text-center text-white shadow-[6px_6px_0_#1a1c1c]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center border border-gold bg-[#121212] text-gold">
                  <Package className="h-7 w-7" />
                </div>
                <p className="text-xl font-black text-white">
                  {isArabic ? "لا توجد طلبات خامات حالية" : "No active material requests"}
                </p>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-7 text-white/50">
                  {isArabic 
                    ? "ابدأ بإنشاء طلب خامات جديد واكتب ما تحتاجه للتشطيب ودع الموردين يرسلون لك عروض أسعار تنافسية."
                    : "Create a request with the items you need and local vendors will send you competitive offers."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 bg-white px-5 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  {isArabic ? "أنشئ طلبك الأول" : "Create first request"}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`group relative cursor-pointer border p-5 shadow-[5px_5px_0_#1a1c1c] transition-all duration-300 hover:translate-x-1 ${
                      selectedRequest?.id === req.id 
                        ? "border-gold bg-black" 
                        : "border-white/10 bg-black hover:border-gold/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-black text-white transition-colors group-hover:text-gold">
                            {req.title}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-white/55">
                          {req.description}
                        </p>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-white/40">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gold" />
                            {new Date(req.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-gold" />
                            {req.deliveryMethod === "VENDOR_DELIVERY" 
                              ? (isArabic ? "توصيل للمنزل" : "Home Delivery") 
                              : (isArabic ? "استلام شخصي" : "Self Pickup")}
                          </span>
                          {req.offers.length > 0 && (
                            <span className="flex items-center gap-1 border border-gold/30 bg-gold/10 px-2 py-0.5 font-black text-gold">
                              {req.offers.length} {isArabic ? "عروض" : "offers"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`border border-white/10 bg-white/5 p-2 text-white/40 transition-colors group-hover:text-gold ${isArabic ? "rotate-180" : ""}`}>
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Details & Bids Viewer */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-black">
              <Clock className="h-5 w-5 text-black/35" />
              {isArabic ? "تفاصيل الطلب والعروض" : "Request Details & Offers"}
              </h2>
            </div>

            {selectedRequest ? (
              <div className="space-y-6 border border-white/10 bg-black p-6 text-white shadow-[6px_6px_0_#1a1c1c]">
                {/* Header */}
                <div className="border-b border-white/10 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-black text-white">{selectedRequest.title}</h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="mt-4 border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-7 text-white/65">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Delivery details */}
                <div className="grid grid-cols-1 gap-4 border border-white/10 bg-white/[0.03] p-4 text-xs sm:grid-cols-2">
                  <div className="border border-white/5 bg-black/30 p-4">
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{isArabic ? "طريقة التوصيل" : "Preferred delivery"}</span>
                    <span className="mt-2 block font-black text-white">
                      {selectedRequest.deliveryMethod === "VENDOR_DELIVERY"
                        ? (isArabic ? "توصيل من المتجر" : "Vendor Delivery")
                        : (isArabic ? "استلام شخصي من المحل" : "Client Pickup")}
                    </span>
                  </div>
                  <div className="border border-white/5 bg-black/30 p-4">
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{isArabic ? "تاريخ الطلب" : "Requested date"}</span>
                    <span className="mt-2 block font-black text-white">
                      {new Date(selectedRequest.createdAt).toLocaleDateString(locale, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                </div>

                {/* Offers list section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gold">
                    {isArabic ? "العروض المستلمة" : "Received Offers"} ({selectedRequest.offers.length})
                  </h4>

                  {selectedRequest.offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed border-white/15 bg-[#121212] p-8 text-center">
                      <AlertCircle className="mb-3 h-7 w-7 text-gold" />
                      <p className="text-base font-black text-white">
                        {isArabic ? "بانتظار تقديم العروض" : "Waiting for vendor bids"}
                      </p>
                      <p className="mt-2 max-w-sm text-xs font-semibold leading-6 text-white/45">
                        {isArabic 
                          ? "سيظهر هنا فوراً أي عرض سعر يقدمه أصحاب المتاجر المحيطة بك."
                          : "Bids submitted by nearby merchants will show up here instantly."}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[350px] space-y-3 overflow-y-auto pr-1">
                      {selectedRequest.offers.map((offer) => {
                        const isThisAccepted = selectedRequest.order?.status && offer.isAccepted;
                        return (
                          <div 
                            key={offer.id}
                            className={`border p-4 transition-all ${
                              isThisAccepted 
                                ? "border-emerald-400/40 bg-emerald-400/[0.04]" 
                                : "border-white/10 bg-white/[0.03] hover:border-gold/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center border border-gold/30 bg-gold/10 font-black text-gold">
                                  {offer.vendor.storeName?.substring(0, 1) || offer.vendor.user.firstName.substring(0, 1)}
                                </div>
                                <div>
                                  <h5 className="text-sm font-black text-white">
                                    {offer.vendor.storeName || `${offer.vendor.user.firstName} ${offer.vendor.user.lastName}`}
                                  </h5>
                                  <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                                    {isArabic ? "متجر معتمد" : "Verified Store"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-end">
                                <span className="block text-base font-black text-white">
                                  {offer.totalPrice} {isArabic ? "ج.م" : "EGP"}
                                </span>
                                <span className="mt-0.5 block text-[10px] font-semibold text-white/40">
                                  {isArabic ? `توصيل: ${offer.deliveryFee} ج.م` : `Delivery: ${offer.deliveryFee} EGP`}
                                </span>
                              </div>
                            </div>

                            <p className="mt-3 border border-white/5 bg-black/30 p-2.5 text-xs font-semibold italic leading-relaxed text-white/55">
                              {offer.notes || (isArabic ? "لا توجد ملاحظات إضافية" : "No extra notes")}
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-4 text-xs font-bold">
                              <span className="flex items-center gap-1.5 text-white/45">
                                <Clock className="h-3.5 w-3.5 text-gold" />
                                {isArabic ? `توصيل خلال ${offer.estimatedDeliveryTime} دقيقة` : `In ${offer.estimatedDeliveryTime} mins`}
                              </span>

                              {selectedRequest.status === "PENDING" || selectedRequest.status === "OFFERS_RECEIVED" ? (
                                <button
                                  onClick={() => setAcceptingOffer(offer)}
                                  className="bg-white px-3.5 py-2 text-xs font-black text-black transition hover:bg-gold"
                                >
                                  {isArabic ? "قبول العرض" : "Accept Bid"}
                                </button>
                              ) : isThisAccepted ? (
                                <span className="flex items-center gap-1 border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-emerald-300">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {isArabic ? "العرض المقبول" : "Accepted Bid"}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* If Request is in Delivery cycle, show progress tracker */}
                {selectedRequest.order && (
                  <div className="mt-6 space-y-4 border border-white/10 bg-white/5 p-4">
                    <h4 className="flex items-center gap-2 text-sm font-black text-white">
                      <Truck className="h-4 w-4 text-gold" />
                      {isArabic ? "دورة التوصيل والدفع" : "Delivery & Payment Cycle"}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block font-black uppercase tracking-[0.14em] text-white/40">{isArabic ? "حالة التوصيل" : "Order Status"}</span>
                        <span className="mt-1 block font-black text-gold">
                          {selectedRequest.order.status === "ACCEPTED" && (isArabic ? "تم قبول العرض" : "Accepted")}
                          {selectedRequest.order.status === "PREPARING" && (isArabic ? "قيد التجهيز" : "Preparing")}
                          {selectedRequest.order.status === "SHIPPED" && (isArabic ? "تم الشحن والتوصيل" : "Shipped")}
                          {selectedRequest.order.status === "DELIVERED" && (isArabic ? "تم التوصيل والاستلام" : "Delivered")}
                        </span>
                      </div>
                      <div>
                        <span className="block font-black uppercase tracking-[0.14em] text-white/40">{isArabic ? "طريقة الدفع" : "Payment Method"}</span>
                        <span className="mt-1 block font-black text-white">
                          {selectedRequest.order.paymentMethod === "CASH_ON_DELIVERY" ? (isArabic ? "كاش عند الاستلام" : "Cash") : "InstaPay"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center border border-white/10 bg-black p-8 text-center text-white shadow-[6px_6px_0_#1a1c1c]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center border border-white/10 bg-[#121212] text-white/30">
                  <Wrench className="h-8 w-8" />
                </div>
                <p className="max-w-sm text-sm font-black leading-7 text-white/75">
                  {isArabic ? "اختر طلبًا من القائمة لاستعراض تفاصيله وعروض أسعار التجار" : "Select a request from the feed to view its status and vendor bids"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-[2.5rem] border border-white/5 bg-onyx-950 p-6 sm:p-8 shadow-2xl relative animate-slideUp">
              <h2 className="text-2xl font-black text-white">
                {isArabic ? "إنشاء طلب خامات جديد" : "Request New Materials"}
              </h2>
              <p className="mt-2 text-sm text-onyx-400">
                {isArabic 
                  ? "قم بكتابة خامات التشطيب المطلوبة بدقة لتلقي عروض مناسبة." 
                  : "List your required items clearly so local merchants can quote accurately."}
              </p>

              <form onSubmit={handleCreateRequest} className="mt-6 space-y-4">
                {formError && (
                  <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-sm text-error flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "عنوان الطلب" : "Request Title"}</span>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? "مثال: أدوات تشطيب كهرباء شقة" : "e.g., Plumbing materials for bathroom"}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-gold-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "الوصف وقائمة المواد" : "Description & List"}</span>
                  <textarea
                    required
                    rows={4}
                    placeholder={isArabic ? "مثال: 3 بكرات سلك 2مم السويدي، 12 علبة تجميع ماجيك، 4 مفاتيح ثنائية شنايدر..." : "e.g., 2 rolls of 2.5mm copper cable, 10 electrical gang boxes, etc."}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-white focus:border-gold-500/30 focus:bg-white/10 outline-none text-sm transition-all resize-none"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "خيار التسليم المفضل" : "Preferred Handover"}</span>
                  <select
                    value={formDeliveryMethod}
                    onChange={(e) => setFormDeliveryMethod(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-gold-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                  >
                    <option value="VENDOR_DELIVERY">{isArabic ? "توصيل لباب البيت" : "Home Delivery"}</option>
                    <option value="CLIENT_PICKUP">{isArabic ? "سأقوم بالاستلام بنفسي من المحل" : "Self Pickup"}</option>
                  </select>
                </label>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm font-bold text-white hover:bg-white/5 transition-all"
                  >
                    {isArabic ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-onyx-950 hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {isArabic ? "نشر الطلب" : "Post Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Offer Acceptance Details Modal */}
        {acceptingOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-[2.5rem] border border-white/5 bg-onyx-950 p-6 sm:p-8 shadow-2xl relative animate-slideUp">
              <h2 className="text-2xl font-black text-white">
                {isArabic ? "تأكيد وقبول عرض السعر" : "Accept Quotation"}
              </h2>
              <p className="mt-2 text-sm text-onyx-400">
                {isArabic 
                  ? "اختر طريقة الدفع لتأكيد الطلب وبدء دورة التوصيل فوراً."
                  : "Choose your payment method to lock in the bid and notify the vendor."}
              </p>

              <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-onyx-400">{isArabic ? "المتجر" : "Merchant"}</span>
                  <span className="font-bold text-white">{acceptingOffer.vendor.storeName || `${acceptingOffer.vendor.user.firstName} ${acceptingOffer.vendor.user.lastName}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx-400">{isArabic ? "قيمة الخامات" : "Materials Price"}</span>
                  <span className="font-bold text-white">{acceptingOffer.price} {isArabic ? "ج.م" : "EGP"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-onyx-400">{isArabic ? "رسوم التوصيل" : "Delivery Fee"}</span>
                  <span className="font-bold text-white">{acceptingOffer.deliveryFee} {isArabic ? "ج.م" : "EGP"}</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gold-500">{isArabic ? "الإجمالي الكلي" : "Grand Total"}</span>
                  <span className="font-black text-gold-500">{acceptingOffer.totalPrice} {isArabic ? "ج.م" : "EGP"}</span>
                </div>
              </div>

              <form onSubmit={handleAcceptOfferSubmit} className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "طريقة الدفع" : "Payment Method"}</span>
                  <select
                    value={acceptPaymentMethod}
                    onChange={(e) => setAcceptPaymentMethod(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-gold-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                  >
                    <option value="CASH_ON_DELIVERY">{isArabic ? "الدفع كاش عند الاستلام" : "Cash on Delivery"}</option>
                    <option value="INSTAPAY">{isArabic ? "الدفع الرقمي عبر InstaPay" : "Digital Payment via InstaPay"}</option>
                  </select>
                </label>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAcceptingOffer(null)}
                    className="rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-bold text-white hover:bg-white/5 transition-all"
                  >
                    {isArabic ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={acceptSubmitting}
                    className="rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-onyx-950 hover:bg-gold-400 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {acceptSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {isArabic ? "تأكيد وقبول العرض" : "Confirm & Accept"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
