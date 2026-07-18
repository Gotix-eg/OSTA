"use client";

import { useEffect, useState } from "react";
import { 
  Store, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Send
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  VendorStitchBadge,
  VendorStitchEmpty,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";

interface Requester {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface MaterialRequest {
  id: string;
  title: string;
  description: string;
  deliveryMethod: string;
  status: string;
  createdAt: string;
  requester: Requester;
}

interface MaterialOffer {
  id: string;
  price: number;
  deliveryFee: number;
  totalPrice: number;
  estimatedDeliveryTime: number;
  notes?: string;
  isAccepted: boolean;
}

interface MaterialOrder {
  id: string;
  status: string;
  deliveryMethod: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  request: {
    title: string;
    description: string;
  };
  offer: MaterialOffer;
}

export default function VendorMaterialsClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  const [activeTab, setActiveTab] = useState<"nearby" | "orders">("nearby");
  const [nearbyRequests, setNearbyRequests] = useState<MaterialRequest[]>([]);
  const [vendorOrders, setVendorOrders] = useState<MaterialOrder[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  // Form Bid State
  const [bidPrice, setBidPrice] = useState("");
  const [bidDeliveryFee, setBidDeliveryFee] = useState("");
  const [bidDeliveryTime, setBidDeliveryTime] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  // Order state update
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "nearby") {
        const reqs = await fetchApiData<MaterialRequest[]>("/materials/vendor/nearby-requests", []);
        setNearbyRequests(reqs);
      } else {
        const ords = await fetchApiData<MaterialOrder[]>("/materials/vendor/orders", []);
        setVendorOrders(ords);
      }
    } catch (err) {
      console.error("Failed to fetch vendor material data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
    setSelectedRequest(null);
    setBidSuccess(false);
    setBidError("");
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  async function handleSendBid(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setBidError("");
    setBidSuccess(false);

    const priceNum = parseFloat(bidPrice);
    const feeNum = parseFloat(bidDeliveryFee || "0");
    const timeNum = parseInt(bidDeliveryTime);

    if (isNaN(priceNum) || priceNum <= 0) {
      setBidError(isArabic ? "برجاء كتابة سعر خامات صحيح" : "Please enter a valid price");
      return;
    }
    if (isNaN(timeNum) || timeNum < 5) {
      setBidError(isArabic ? "الوقت المقدر للتوصيل يجب أن يكون 5 دقائق على الأقل" : "Delivery time must be at least 5 minutes");
      return;
    }

    setBidSubmitting(true);
    try {
      await postApiData(`/materials/vendor/requests/${selectedRequest.id}/offer`, {
        price: priceNum,
        deliveryFee: feeNum,
        estimatedDeliveryTime: timeNum,
        notes: bidNotes
      });

      setBidSuccess(true);
      setBidPrice("");
      setBidDeliveryFee("");
      setBidDeliveryTime("");
      setBidNotes("");
      
      setTimeout(() => {
        setSelectedRequest(null);
        setBidSuccess(false);
        loadData();
      }, 1500);
      
    } catch (err: any) {
      setBidError(err.message || (isArabic ? "فشل إرسال عرض السعر" : "Failed to submit offer"));
    } finally {
      setBidSubmitting(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    setOrderUpdatingId(orderId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_OSTA_API_URL ?? "/api"}/materials/vendor/orders/${orderId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      loadData();
    } catch (err) {
      console.error(err);
      alert(isArabic ? "فشل تحديث حالة الطلب" : "Failed to update order status");
    } finally {
      setOrderUpdatingId(null);
    }
  }

  const getOrderStatusLabel = (status: string) => {
    const states: Record<string, { labelAr: string; labelEn: string; tone: "gold" | "green" | "muted" }> = {
      ACCEPTED: { labelAr: "مقبول - بانتظار التجهيز", labelEn: "Accepted - Awaiting Prep", tone: "gold" },
      PREPARING: { labelAr: "قيد التجهيز بالمحل", labelEn: "Preparing Items", tone: "muted" },
      SHIPPED: { labelAr: "قيد الشحن والتوصيل", labelEn: "Shipped & Out for Delivery", tone: "muted" },
      DELIVERED: { labelAr: "تم التسليم بنجاح", labelEn: "Delivered Successfully", tone: "green" }
    };
    const s = states[status] || { labelAr: status, labelEn: status, tone: "muted" as const };
    return <VendorStitchBadge tone={s.tone}>{isArabic ? s.labelAr : s.labelEn}</VendorStitchBadge>;
  };

  return (
    <DashboardShell locale={locale} role="vendor">
      <VendorStitchShell locale={locale}>
        <VendorStitchTopStrip locale={locale} title={isArabic ? "مزايدات الخامات" : "Material bidding"} />
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden border border-white/10 bg-black p-6 text-white shadow-[5px_5px_0_#1d1600] lg:p-8">
          <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,#f5bd18_0,transparent_32%),linear-gradient(135deg,transparent_0,#171717_70%)]" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase">
                {isArabic ? "لوحة التجهيز والمزايدات" : "Supply & Bidding Center"}
              </span>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {isArabic ? "بوابة مزايدة وتوصيل الخامات" : "Materials Supply Bidding"}
              </h1>
              <p className="mt-3 text-sm text-onyx-400 max-w-xl leading-relaxed">
                {isArabic 
                  ? "تصفح طلبات الخامات الصادرة عن عملاء وفنيي الجوار، قدم عروض أسعار منافسة وسريعة، وتابع توصيل الطلبات الجارية."
                  : "Browse material requests from nearby clients and workers. Send instant competitive quotes and track delivery flow."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-12 w-12 items-center justify-center border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-6 border-b border-black/20">
          <button
            onClick={() => setActiveTab("nearby")}
            className={`relative pb-4 text-base font-extrabold transition-all ${
              activeTab === "nearby" ? "text-black" : "text-black/45 hover:text-black"
            }`}
          >
            {isArabic ? "طلبات الجوار النشطة" : "Nearby Active Requests"}
            {activeTab === "nearby" && (
              <span className="absolute bottom-0 inset-x-0 h-1 bg-black" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("orders")}
            className={`relative pb-4 text-base font-extrabold transition-all ${
              activeTab === "orders" ? "text-black" : "text-black/45 hover:text-black"
            }`}
          >
            {isArabic ? "طلباتي الجارية والمقبولة" : "My Supplies & Orders"}
            {activeTab === "orders" && (
              <span className="absolute bottom-0 inset-x-0 h-1 bg-black" />
            )}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* List panel */}
          <VendorStitchPanel
            eyebrow={activeTab === "nearby" ? "Requests" : "Orders"}
            title={activeTab === "nearby" ? (isArabic ? "طلبات الجوار المتاحة للتسعير" : "Nearby Requests Waiting for Quotes") : (isArabic ? "الطلبات والمبيعات المقبولة" : "Accepted Orders & Deliveries")}
            action={activeTab === "nearby" ? <MapPin className="h-5 w-5 text-gold" /> : <CheckCircle2 className="h-5 w-5 text-gold" />}
          >
            {activeTab === "nearby" ? (
              <>
                {loading ? (
                  <div className="flex h-48 items-center justify-center border border-white/10 bg-[#080808]">
                    <div className="h-9 w-9 animate-spin border-4 border-gold border-t-transparent" />
                  </div>
                ) : nearbyRequests.length === 0 ? (
                  <VendorStitchEmpty
                    title={isArabic ? "لا توجد طلبات قريبة حالياً" : "No nearby requests available"}
                    text={isArabic
                      ? "جميع طلبات خامات الصيانة والتشطيب المحيطة بموقع متجرك تم تغطيتها أو لا توجد طلبات جديدة حالياً."
                      : "All material requests around your store have been quoted or there are no new active requests."}
                  />
                ) : (
                  <div className="grid gap-4">
                    {nearbyRequests.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`group relative cursor-pointer border p-5 shadow-[3px_3px_0_#1d1600] transition-colors ${
                          selectedRequest?.id === req.id 
                            ? "border-gold bg-[#111111]"
                            : "border-white/10 bg-[#080808] hover:border-gold/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="font-extrabold text-white text-lg group-hover:text-gold transition-colors">
                                {req.title}
                              </h3>
                              <VendorStitchBadge tone="gold">{isArabic ? "طلب متاح" : "Open request"}</VendorStitchBadge>
                            </div>
                            
                            <p className="mt-2 text-sm text-onyx-400 line-clamp-2 leading-relaxed">
                              {req.description}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-onyx-500 font-medium">
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
                              <span className="flex items-center gap-1.5 font-bold text-white/90">
                                {isArabic 
                                  ? `بواسطة: ${req.requester.firstName} ${req.requester.lastName}`
                                  : `By: ${req.requester.firstName} ${req.requester.lastName}`}
                              </span>
                            </div>
                          </div>

                          <div className={`border border-white/10 bg-black p-2 text-white/45 transition-colors group-hover:border-gold group-hover:text-gold ${isArabic ? "rotate-180" : ""}`}>
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {loading ? (
                  <div className="flex h-48 items-center justify-center border border-white/10 bg-[#080808]">
                    <div className="h-9 w-9 animate-spin border-4 border-gold border-t-transparent" />
                  </div>
                ) : vendorOrders.length === 0 ? (
                  <VendorStitchEmpty
                    title={isArabic ? "لا توجد مبيعات جارية حالياً" : "No active orders"}
                    text={isArabic
                      ? "بمجرد قيام العميل بقبول عروض الأسعار التي ترسلها، ستظهر مبيعاتك وطلبات الشحن والتجهيز هنا مباشرة."
                      : "Once a client accepts your bid, purchase details and delivery status will show up here."}
                  />
                ) : (
                  <div className="grid gap-4">
                    {vendorOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="space-y-4 border border-white/10 bg-[#080808] p-5 shadow-[3px_3px_0_#1d1600]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                          <div>
                            <h3 className="font-black text-white text-lg">{order.request.title}</h3>
                            <span className="text-xs text-onyx-500 mt-1 block">
                              {isArabic ? `تاريخ التعاقد: ${new Date(order.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}` : `Contracted: ${new Date(order.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}`}
                            </span>
                          </div>
                          <div className="text-end">
                            {getOrderStatusLabel(order.status)}
                          </div>
                        </div>

                        <p className="text-sm text-onyx-300 leading-relaxed">
                          {order.request.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 border border-white/10 bg-black p-4 text-xs md:grid-cols-4">
                          <div>
                            <span className="block text-onyx-500">{isArabic ? "قيمة الطلب الكلية" : "Total Amount"}</span>
                            <span className="mt-1 block font-black text-gold text-sm">
                              {order.totalAmount} {isArabic ? "ج.م" : "EGP"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-onyx-500">{isArabic ? "سعر الخامات" : "Materials Price"}</span>
                            <span className="mt-1 block font-bold text-white">
                              {order.offer.price} {isArabic ? "ج.م" : "EGP"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-onyx-500">{isArabic ? "تكلفة التوصيل" : "Delivery Fee"}</span>
                            <span className="mt-1 block font-bold text-white">
                              {order.offer.deliveryFee} {isArabic ? "ج.م" : "EGP"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-onyx-500">{isArabic ? "طريقة الدفع" : "Payment Method"}</span>
                            <span className="mt-1 block font-bold text-gold-400">
                              {order.paymentMethod === "CASH_ON_DELIVERY" ? (isArabic ? "كاش عند الاستلام" : "Cash") : "InstaPay"}
                            </span>
                          </div>
                        </div>

                        {/* Status Update Quick Buttons */}
                        {order.status !== "DELIVERED" && (
                          <div className="flex flex-wrap items-center gap-2 justify-end pt-2 border-t border-white/5">
                            <span className="text-xs text-onyx-400 mr-2">
                              {isArabic ? "تحديث حالة التوصيل للعميل:" : "Update Delivery State:"}
                            </span>
                            
                            {order.status === "ACCEPTED" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                                disabled={orderUpdatingId === order.id}
                                className="border border-gold bg-gold px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-white disabled:opacity-50"
                              >
                                {isArabic ? "بدء التجهيز والتحضير" : "Start Prep"}
                              </button>
                            )}

                            {order.status === "PREPARING" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "SHIPPED")}
                                disabled={orderUpdatingId === order.id}
                                className="border border-gold bg-gold px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-white disabled:opacity-50"
                              >
                                {isArabic ? "تسليم شركة الشحن / بدء التوصيل" : "Ship Order"}
                              </button>
                            )}

                            {order.status === "SHIPPED" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                                disabled={orderUpdatingId === order.id}
                                className="border border-gold bg-gold px-4 py-2 text-xs font-black uppercase text-black transition-colors hover:bg-white disabled:opacity-50"
                              >
                                {isArabic ? "تأكيد التسليم النهائي للعميل" : "Delivered"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </VendorStitchPanel>

          {/* Details / Pricing Proposal Form */}
          <VendorStitchPanel
            eyebrow="Quote"
            title={isArabic ? "تقديم عرض السعر الفوري" : "Quotation Proposal Form"}
            action={<TrendingUp className="h-5 w-5 text-gold" />}
          >
            {selectedRequest ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-gold/60 bg-gold font-black text-black">
                      {selectedRequest.requester.firstName.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">
                        {selectedRequest.requester.firstName} {selectedRequest.requester.lastName}
                      </h4>
                      <span className="text-[10px] text-onyx-500 block">
                        {selectedRequest.deliveryMethod === "VENDOR_DELIVERY" ? (isArabic ? "يطلب التوصيل للمنزل" : "Wants Home Delivery") : (isArabic ? "سيقوم بالاستلام بنفسه" : "Will pickup in store")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 border border-white/10 bg-[#080808] p-4 text-sm leading-relaxed text-onyx-300">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-onyx-500 mb-2">{isArabic ? "الطلبات والمواصفات المطلوبة:" : "Requested specification:"}</span>
                    {selectedRequest.description}
                  </div>
                </div>

                <form onSubmit={handleSendBid} className="space-y-4 pt-4 border-t border-white/5">
                  <h5 className="font-extrabold text-white text-sm">
                    {isArabic ? "نموذج تقديم العرض المالي" : "Financial Quotation"}
                  </h5>

                {bidError && (
                    <div className="flex items-center gap-2 border border-error/30 bg-error/10 p-3 text-sm text-error">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{bidError}</span>
                    </div>
                  )}

                  {bidSuccess && (
                    <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{isArabic ? "تم إرسال عرض سعرك بنجاح للعميل!" : "Quotation submitted successfully!"}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-2">
                      <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "سعر الخامات الكلي (ج.م)" : "Materials Price (EGP)"}</span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 750"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "رسوم التوصيل (ج.م)" : "Delivery Fee (EGP)"}</span>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={bidDeliveryFee}
                        onChange={(e) => setBidDeliveryFee(e.target.value)}
                        className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "وقت التوصيل المتوقع (بالدقائق)" : "Est. Delivery Time (Mins)"}</span>
                    <input
                      type="number"
                      required
                      min="5"
                      placeholder="e.g. 45"
                      value={bidDeliveryTime}
                      onChange={(e) => setBidDeliveryTime(e.target.value)}
                      className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "ملاحظات إضافية للعميل" : "Notes to client"}</span>
                    <textarea
                      rows={3}
                      placeholder={isArabic ? "تفاصيل إضافية مثل: الدهانات أصلية جوتن والأسلاك بضمان السويدي..." : "e.g. paints are original Jotun, copper cables Elsewedy certified..."}
                      value={bidNotes}
                      onChange={(e) => setBidNotes(e.target.value)}
                      className="w-full resize-none border border-white/10 bg-[#121212] p-4 text-white outline-none transition-colors focus:border-gold text-sm"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={bidSubmitting || bidSuccess}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 border border-gold bg-gold font-black uppercase text-black transition-colors hover:bg-white disabled:opacity-50"
                  >
                    {bidSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isArabic ? "تقديم هذا العرض للعميل" : "Submit Proposal"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center border border-white/10 bg-[#080808] p-6 text-center text-onyx-500">
                <Store className="h-8 w-8 mb-3 text-gold/70" />
                <p className="text-sm font-semibold">
                  {isArabic ? "اختر طلبًا متاحًا من الجوار لتجهيز وتقديم عرض السعر والمزايدة عليه فوراً" : "Select an active nearby request from the feed to draft and submit your supply bid"}
                </p>
              </div>
            )}
          </VendorStitchPanel>

        </div>

      </VendorStitchShell>
    </DashboardShell>
  );
}
