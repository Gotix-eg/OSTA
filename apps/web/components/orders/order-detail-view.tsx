"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  ShieldCheck, 
  Loader2, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api";

interface OrderDetailData {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  urgency: "NORMAL" | "EMERGENCY";
  serviceNameAr: string;
  serviceNameEn: string;
  categorySlug: string;
  categoryNameAr: string;
  categoryNameEn: string;
  createdAt: string;
  preferredDate: string | null;
  preferredTimeSlot: string | null;
  estimatedPrice: number | null;
  offersCount: number;
  address: {
    governorate: string;
    city: string;
    area: string;
    street: string;
    building: string | null;
    floor: string | null;
    apartment: string | null;
    landmark: string | null;
  };
}

export function OrderDetailView({ locale, orderId }: { locale: Locale; orderId: string }) {
  const isArabic = locale === "ar";
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication & accept actions
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [showWorkerAuthModal, setShowWorkerAuthModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const role = window.localStorage.getItem("osta_user_role");
      setIsLoggedIn(!!token);
      setIsWorker(role === "WORKER");
    }
  }, []);

  const fetchOrderDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/requests/${orderId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch order details");
      }
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError(isArabic ? "تعذر تحميل تفاصيل الطلب" : "Failed to load order details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const handleAcceptClick = () => {
    if (!order) return;
    if (isLoggedIn) {
      if (isWorker) {
        window.location.assign(`/${locale}/worker`);
      } else {
        alert(isArabic ? "هذا الإجراء متاح لحسابات الفنيين فقط." : "Accepting requests is only available for technician accounts.");
      }
    } else {
      setShowWorkerAuthModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-onyx-400">
        <Loader2 className="h-12 w-12 animate-spin text-gold-500 mb-4" />
        <p className="text-sm font-medium">{isArabic ? "جاري تحميل تفاصيل الطلب..." : "Loading order details..."}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="onyx-card border-red-500/20 bg-red-500/5 text-red-500 font-bold rounded-3xl p-8">
          {error || (isArabic ? "لم يتم العثور على الطلب" : "Order not found")}
        </div>
        <Link href={`/${locale}/orders`} className="inline-flex items-center gap-2 mt-8 text-gold-500 font-bold hover:underline">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "العودة للوحة الطلبات" : "Back to Open Orders"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Back Link */}
      <Link 
        href={`/${locale}/orders`} 
        className="inline-flex items-center gap-2 text-sm font-bold text-onyx-400 hover:text-gold-500 transition-colors"
      >
        {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        {isArabic ? "العودة للوحة الطلبات" : "Back to Open Orders"}
      </Link>

      {/* Main Order Card */}
      <section className="onyx-card relative overflow-hidden p-6 sm:p-10 border-white/5 bg-white/[0.02] backdrop-blur rounded-[2.5rem] space-y-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10 border-b border-white/5 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border",
                order.urgency === "EMERGENCY" 
                  ? "bg-red-500/10 border-red-500/20 text-red-500" 
                  : "bg-onyx-800 border-white/5 text-onyx-300"
              )}>
                {order.urgency === "EMERGENCY" ? (isArabic ? "حالة طوارئ" : "Emergency") : (isArabic ? "طلب عادي" : "Normal")}
              </span>
              <span className="text-xs text-onyx-400 font-semibold">
                #{order.requestNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {order.title}
            </h1>
            <p className="text-sm text-gold-500 font-bold uppercase tracking-wider">
              {isArabic ? order.categoryNameAr : order.categoryNameEn} {` > `} {isArabic ? order.serviceNameAr : order.serviceNameEn}
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 text-xs text-onyx-400">
            <Clock className="h-4 w-4 text-gold-500" />
            <span>
              {new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
          <div className="onyx-card border-white/5 bg-white/[0.01] p-4 rounded-2xl flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-gold-500 shrink-0" />
            <div>
              <span className="text-[10px] text-onyx-500 font-bold block uppercase">
                {isArabic ? "العروض المقدمة" : "Offers Sent"}
              </span>
              <span className="text-lg font-black text-white">
                {order.offersCount} {isArabic ? "عروض" : "offers"}
              </span>
            </div>
          </div>

          {order.estimatedPrice && (
            <div className="onyx-card border-white/5 bg-white/[0.01] p-4 rounded-2xl flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-gold-500 shrink-0" />
              <div>
                <span className="text-[10px] text-onyx-500 font-bold block uppercase">
                  {isArabic ? "الميزانية المتوقعة" : "Estimated Budget"}
                </span>
                <span className="text-lg font-black text-white">
                  {order.estimatedPrice} {isArabic ? "ج.م" : "EGP"}
                </span>
              </div>
            </div>
          )}

          {order.preferredDate && (
            <div className="onyx-card border-white/5 bg-white/[0.01] p-4 rounded-2xl flex items-center gap-3 col-span-2 md:col-span-1">
              <Calendar className="h-6 w-6 text-gold-500 shrink-0" />
              <div>
                <span className="text-[10px] text-onyx-500 font-bold block uppercase">
                  {isArabic ? "الموعد المفضل" : "Preferred Date"}
                </span>
                <span className="text-sm font-black text-white">
                  {new Date(order.preferredDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                  {order.preferredTimeSlot ? ` (${order.preferredTimeSlot})` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Full Description */}
        <div className="space-y-3 relative z-10">
          <h3 className="text-base font-black text-white uppercase tracking-wider">
            {isArabic ? "تفاصيل طلب الصيانة" : "Request Details / Description"}
          </h3>
          <div className="h-0.5 w-12 bg-gold-500 rounded-full" />
          <p className="text-onyx-350 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
            {order.description}
          </p>
        </div>

        {/* Address */}
        <div className="space-y-4 relative z-10 border-t border-white/5 pt-6">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold-500" />
            <span>{isArabic ? "عنوان وموقع العمل" : "Job Location / Address"}</span>
          </h3>
          <div className="h-0.5 w-12 bg-gold-500 rounded-full" />
          
          <div className="onyx-card border-white/5 bg-white/[0.01] p-6 rounded-3xl space-y-4 text-sm text-onyx-300">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "المحافظة" : "Governorate"}</span>
                <span className="font-bold text-white">{order.address.governorate}</span>
              </div>
              <div>
                <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "المدينة / المركز" : "City / Center"}</span>
                <span className="font-bold text-white">{order.address.city}</span>
              </div>
              <div>
                <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "الحي / المنطقة" : "Area / Neighborhood"}</span>
                <span className="font-bold text-white">{order.address.area}</span>
              </div>
              <div>
                <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "الشارع" : "Street"}</span>
                <span className="font-bold text-white">{order.address.street}</span>
              </div>
            </div>

            {/* Display full private address details only to authenticated workers */}
            {isWorker ? (
              <div className="border-t border-white/5 pt-4 mt-4 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isArabic ? "معلومات الحجز الكاملة معروضة للفنيين الموثقين" : "Full booking details visible to verified pros"}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {order.address.building && (
                    <div>
                      <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "المبنى / العقار" : "Building"}</span>
                      <span className="font-bold text-white">{order.address.building}</span>
                    </div>
                  )}
                  {order.address.floor && (
                    <div>
                      <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "الطابق" : "Floor"}</span>
                      <span className="font-bold text-white">{order.address.floor}</span>
                    </div>
                  )}
                  {order.address.apartment && (
                    <div>
                      <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "الشقة" : "Apartment"}</span>
                      <span className="font-bold text-white">{order.address.apartment}</span>
                    </div>
                  )}
                </div>
                {order.address.landmark && (
                  <div>
                    <span className="text-xs text-onyx-550 block mb-1">{isArabic ? "علامة مميزة" : "Landmark"}</span>
                    <span className="font-bold text-white">{order.address.landmark}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-white/5 pt-4 mt-4 text-xs text-onyx-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gold-500 shrink-0" />
                <span>
                  {isArabic 
                    ? "تفاصيل العنوان الإضافية (رقم المبنى، الطابق، الشقة) تظهر للفنيين الموثقين فقط لحماية الخصوصية."
                    : "Additional address details (building, floor, apartment) are visible to verified technicians only."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Call To Action Buttons */}
        <div className="border-t border-white/5 pt-8 flex flex-col items-center gap-4 relative z-10">
          <button
            onClick={handleAcceptClick}
            className="w-full sm:w-80 btn-gold py-4 text-base font-black shadow-lg shadow-gold-500/15 flex items-center justify-center gap-2"
          >
            <span>{isArabic ? "اقبل الطلب الآن" : "Accept Job Now"}</span>
          </button>
          <p className="text-xs text-onyx-500 font-medium">
            {isArabic 
              ? "القبول مجاني وسيتم خصم العمولات المتعلقة بالمشروع عند الدفع أو التسوية." 
              : "Accepting is free; project commissions are settled upon checkout/payment."}
          </p>
        </div>
      </section>

      {/* Auth Prompt Modal for Technician */}
      {showWorkerAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card border-white/10 bg-onyx-900 max-w-md w-full p-8 rounded-3xl shadow-2xl relative border animate-scaleUp">
            <button 
              onClick={() => setShowWorkerAuthModal(false)}
              className="absolute top-4 right-4 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <div className="h-16 w-16 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                <Briefcase className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                {isArabic ? "قبول وتسلّم طلب الصيانة" : "Accept & Start Job"}
              </h3>
              
              <p className="text-gold-500 font-bold mb-4 text-sm">
                {isArabic 
                  ? `الطلب: ${order.title}` 
                  : `Job: ${order.title}`}
              </p>

              <p className="text-onyx-300 text-sm leading-relaxed mb-8">
                {isArabic
                  ? "لقبول هذا الطلب والبدء بالتواصل المباشر مع العميل وعرض ميزانيتك المقترحة، يرجى تسجيل الدخول كفني محترف أو إنشاء حساب فني جديد."
                  : "To accept this job and start direct communication with the client, please sign in as a technician or create a worker account."}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/worker`)}`}
                  className="btn-gold py-3 text-sm font-black w-full text-center rounded-xl shadow-lg shadow-gold-500/10"
                >
                  {isArabic ? "تسجيل الدخول كفني" : "Login as Technician"}
                </Link>
                <Link
                  href={`/${locale}/register/worker`}
                  className="btn-onyx py-3 text-sm font-black w-full text-center border-white/10 text-white hover:bg-white/5 rounded-xl"
                >
                  {isArabic ? "إنشاء حساب فني جديد" : "Register as Technician"}
                </Link>
                <button
                  onClick={() => setShowWorkerAuthModal(false)}
                  className="text-xs text-onyx-500 hover:text-onyx-300 transition-colors font-bold mt-4"
                >
                  {isArabic ? "إلغاء ومتابعة التصفح" : "Cancel and Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
