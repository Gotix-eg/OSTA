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
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.classes}`}>
        {isArabic ? s.labelAr : s.labelEn}
      </span>
    );
  };

  return (
    <DashboardShell locale={locale} role="client">
      <div className="space-y-8 animate-slideUp">
        {/* Hero Section */}
        <div className="relative rounded-[2.5rem] border border-white/5 bg-onyx-950/40 p-8 overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-gold-500 text-xs font-bold tracking-[0.25em] uppercase">
                {isArabic ? "سوق الخامات الفاخر" : "Premium Material Hub"}
              </span>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {isArabic ? "سوق وعروض أسعار الخامات" : "Material Bidding Marketplace"}
              </h1>
              <p className="mt-3 text-sm text-onyx-400 max-w-xl leading-relaxed">
                {isArabic 
                  ? "اطلب خامات الصيانة والتشطيب ودع المتاجر المحلية تتنافس لتقديم أفضل أسعار الخامات والتوصيل إليك مباشرة."
                  : "Request maintenance materials and let local stores compete to give you the best prices and instant delivery."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRefreshing(true);
                  loadRequests();
                }}
                disabled={refreshing}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gold-500 px-6 font-bold text-onyx-950 transition-all hover:bg-gold-400 active:scale-95 shadow-lg shadow-gold-500/25"
              >
                <Plus className="h-5 w-5" />
                {isArabic ? "طلب خامات جديد" : "Request Materials"}
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Requests Feed */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-gold-500" />
              {isArabic ? "طلباتي المفتوحة" : "My Active Requests"}
            </h2>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-[2rem] border border-white/5 bg-onyx-900/20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-[2.5rem] border border-white/5 bg-onyx-900/20 p-8 text-center backdrop-blur-md">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-onyx-400 mb-4">
                  <Package className="h-7 w-7" />
                </div>
                <p className="font-bold text-white text-lg">
                  {isArabic ? "لا توجد طلبات خامات حالية" : "No active material requests"}
                </p>
                <p className="mt-2 text-sm text-onyx-400 max-w-sm">
                  {isArabic 
                    ? "ابدأ بإنشاء طلب خامات جديد واكتب ما تحتاجه للتشطيب ودع الموردين يرسلون لك عروض أسعار تنافسية."
                    : "Create a request with the items you need and local vendors will send you competitive offers."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Plus className="h-4 w-4 text-gold-500" />
                  {isArabic ? "أنشئ طلبك الأول" : "Create first request"}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`group relative cursor-pointer rounded-[2rem] border p-6 transition-all duration-300 ${
                      selectedRequest?.id === req.id 
                        ? "border-gold-500/30 bg-gold-500/[0.03] shadow-gold-500/5" 
                        : "border-white/5 bg-onyx-900/30 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-extrabold text-white text-lg group-hover:text-gold-500 transition-colors">
                            {req.title}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="mt-2 text-sm text-onyx-400 line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-onyx-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gold-500/70" />
                            {new Date(req.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-gold-500/70" />
                            {req.deliveryMethod === "VENDOR_DELIVERY" 
                              ? (isArabic ? "توصيل للمنزل" : "Home Delivery") 
                              : (isArabic ? "استلام شخصي" : "Self Pickup")}
                          </span>
                          {req.offers.length > 0 && (
                            <span className="flex items-center gap-1 bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded-md font-bold">
                              {req.offers.length} {isArabic ? "عروض" : "offers"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl bg-white/5 text-onyx-400 group-hover:text-gold-500 transition-colors ${isArabic ? "rotate-180" : ""}`}>
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
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-gold-500" />
              {isArabic ? "تفاصيل الطلب والعروض" : "Request Details & Offers"}
            </h2>

            {selectedRequest ? (
              <div className="rounded-[2.5rem] border border-white/5 bg-onyx-900/35 p-6 backdrop-blur-md space-y-6">
                {/* Header */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-extrabold text-white">{selectedRequest.title}</h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="mt-3 text-sm text-onyx-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Delivery details */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="block text-onyx-500">{isArabic ? "طريقة التوصيل المفضلة" : "Preferred Delivery"}</span>
                    <span className="mt-1 block font-bold text-white">
                      {selectedRequest.deliveryMethod === "VENDOR_DELIVERY"
                        ? (isArabic ? "توصيل من المتجر" : "Vendor Delivery")
                        : (isArabic ? "استلام شخصي من المحل" : "Client Pickup")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-onyx-500">{isArabic ? "تاريخ الطلب" : "Requested Date"}</span>
                    <span className="mt-1 block font-bold text-white">
                      {new Date(selectedRequest.createdAt).toLocaleDateString(locale, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                </div>

                {/* Offers list section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-onyx-400">
                    {isArabic ? "العروض المستلمة" : "Received Offers"} ({selectedRequest.offers.length})
                  </h4>

                  {selectedRequest.offers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl text-center bg-white/[0.01]">
                      <AlertCircle className="h-6 w-6 text-gold-500/60 mb-2" />
                      <p className="text-sm font-semibold text-white">
                        {isArabic ? "بانتظار تقديم العروض" : "Waiting for vendor bids"}
                      </p>
                      <p className="text-xs text-onyx-500 mt-1">
                        {isArabic 
                          ? "سيظهر هنا فوراً أي عرض سعر يقدمه أصحاب المتاجر المحيطة بك."
                          : "Bids submitted by nearby merchants will show up here instantly."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {selectedRequest.offers.map((offer) => {
                        const isThisAccepted = selectedRequest.order?.status && offer.isAccepted;
                        return (
                          <div 
                            key={offer.id}
                            className={`rounded-2xl border p-4 transition-all ${
                              isThisAccepted 
                                ? "border-emerald-500/40 bg-emerald-500/[0.02]" 
                                : "border-white/5 bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold border border-gold-500/20">
                                  {offer.vendor.storeName?.substring(0, 1) || offer.vendor.user.firstName.substring(0, 1)}
                                </div>
                                <div>
                                  <h5 className="font-bold text-white text-sm">
                                    {offer.vendor.storeName || `${offer.vendor.user.firstName} ${offer.vendor.user.lastName}`}
                                  </h5>
                                  <span className="text-[10px] text-onyx-500 block mt-0.5">
                                    {isArabic ? "متجر معتمد" : "Verified Store"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-end">
                                <span className="block font-black text-white text-base">
                                  {offer.totalPrice} {isArabic ? "ج.م" : "EGP"}
                                </span>
                                <span className="text-[10px] text-onyx-500 block mt-0.5">
                                  {isArabic ? `توصيل: ${offer.deliveryFee} ج.م` : `Delivery: ${offer.deliveryFee} EGP`}
                                </span>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-onyx-300 italic leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                              {offer.notes || (isArabic ? "لا توجد ملاحظات إضافية" : "No extra notes")}
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-4 text-xs font-semibold">
                              <span className="flex items-center gap-1.5 text-onyx-400">
                                <Clock className="h-3.5 w-3.5 text-gold-500" />
                                {isArabic ? `توصيل خلال ${offer.estimatedDeliveryTime} دقيقة` : `In ${offer.estimatedDeliveryTime} mins`}
                              </span>

                              {selectedRequest.status === "PENDING" || selectedRequest.status === "OFFERS_RECEIVED" ? (
                                <button
                                  onClick={() => setAcceptingOffer(offer)}
                                  className="rounded-lg bg-gold-500 px-3.5 py-2 font-bold text-onyx-950 hover:bg-gold-400 transition-all text-xs"
                                >
                                  {isArabic ? "قبول العرض" : "Accept Bid"}
                                </button>
                              ) : isThisAccepted ? (
                                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
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
                  <div className="mt-6 rounded-2xl bg-white/5 border border-white/5 p-4 space-y-4">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gold-500" />
                      {isArabic ? "دورة التوصيل والدفع" : "Delivery & Payment Cycle"}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-onyx-500">{isArabic ? "حالة التوصيل" : "Order Status"}</span>
                        <span className="mt-1 block font-bold text-gold-400">
                          {selectedRequest.order.status === "ACCEPTED" && (isArabic ? "تم قبول العرض" : "Accepted")}
                          {selectedRequest.order.status === "PREPARING" && (isArabic ? "قيد التجهيز" : "Preparing")}
                          {selectedRequest.order.status === "SHIPPED" && (isArabic ? "تم الشحن والتوصيل" : "Shipped")}
                          {selectedRequest.order.status === "DELIVERED" && (isArabic ? "تم التوصيل والاستلام" : "Delivered")}
                        </span>
                      </div>
                      <div>
                        <span className="block text-onyx-500">{isArabic ? "طريقة الدفع" : "Payment Method"}</span>
                        <span className="mt-1 block font-bold text-white">
                          {selectedRequest.order.paymentMethod === "CASH_ON_DELIVERY" ? (isArabic ? "كاش عند الاستلام" : "Cash") : "InstaPay"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 rounded-[2.5rem] border border-white/5 bg-onyx-900/10 p-6 text-center backdrop-blur-md text-onyx-500">
                <Wrench className="h-8 w-8 mb-3 text-white/20" />
                <p className="text-sm font-semibold">
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
                    <option value="VENDOR_DELIVERY">{isArabic ? "توصيل لباب البيت (Vendor Delivery)" : "Home Delivery"}</option>
                    <option value="CLIENT_PICKUP">{isArabic ? "سأقوم بالاستلام بنفسي من المحل (Client Pickup)" : "Self Pickup"}</option>
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
