"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  ChevronRight, 
  X, 
  ShieldCheck, 
  Loader2, 
  Wrench, 
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Award
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api";

interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface WorkerProfileData {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  professionAr: string;
  professionEn: string;
  categoryId: string;
  serviceId: string;
  rating: number;
  ratingCount: number;
  totalJobs: number;
  isOnline: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  areas: string[];
  bio: string | null;
  joinedAt: string;
  reviews: ReviewItem[];
}

export function WorkerProfileDetail({ locale, workerId }: { locale: Locale; workerId: string }) {
  const isArabic = locale === "ar";
  const [worker, setWorker] = useState<WorkerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct Booking States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showBookingAuthModal, setShowBookingAuthModal] = useState(false);

  // Review Form States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const role = window.localStorage.getItem("osta_user_role");
      setIsLoggedIn(!!token);
      setIsClient(role === "CLIENT");
    }
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/public/workers/${workerId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch worker profile");
      }
      const data = await res.json();
      if (data.success) {
        setWorker(data.data);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error(err);
      setError(isArabic ? "تعذر تحميل ملف الفني الشخصي" : "Failed to load technician profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [workerId]);

  const handleBookClick = () => {
    if (!worker) return;
    if (isLoggedIn) {
      if (isClient) {
        const redirectUrl = `/${locale}/client/new-request?workerId=${worker.id}&categoryId=${worker.categoryId}&serviceId=${worker.serviceId}`;
        window.location.assign(redirectUrl);
      } else {
        alert(isArabic ? "هذا الإجراء متاح لحسابات العملاء فقط." : "Booking is only available for client accounts.");
      }
    } else {
      setShowBookingAuthModal(true);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker || isSubmittingReview) return;

    if (!isLoggedIn) {
      alert(isArabic ? "يرجى تسجيل الدخول أولاً لتتمكن من كتابة تقييم." : "Please login first to submit a review.");
      return;
    }

    if (!isClient) {
      alert(isArabic ? "التقييمات متاحة للعملاء فقط." : "Only client accounts can rate technicians.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const token = window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token");
      const baseUrl = resolveApiBaseUrl();
      const res = await fetch(`${baseUrl}/reviews/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targetId: worker.userId,
          overallRating: newRating,
          comment: newComment.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || "Failed to submit review");
      }

      setReviewSuccess(true);
      setNewComment("");
      setNewRating(5);
      // Reload profile to show the new review and updated average rating
      fetchProfile();
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || (isArabic ? "فشل إرسال التقييم." : "Failed to submit review."));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-onyx-400">
        <Loader2 className="h-12 w-12 animate-spin text-gold-500 mb-4" />
        <p className="text-sm font-medium">{isArabic ? "جاري تحميل الملف الشخصي للفني..." : "Loading technician profile..."}</p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="onyx-card border-red-500/20 bg-red-500/5 text-red-500 font-bold rounded-3xl p-8">
          {error || (isArabic ? "لم يتم العثور على الفني" : "Technician not found")}
        </div>
        <Link href={`/${locale}/workers`} className="inline-flex items-center gap-2 mt-8 text-gold-500 font-bold hover:underline">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "العودة لدليل الفنيين" : "Back to Technicians"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Back Link */}
      <Link 
        href={`/${locale}/workers`} 
        className="inline-flex items-center gap-2 text-sm font-bold text-onyx-400 hover:text-gold-500 transition-colors"
      >
        {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        {isArabic ? "العودة لدليل الفنيين" : "Back to Technicians"}
      </Link>

      {/* Profile Header Card */}
      <section className="onyx-card relative overflow-hidden p-6 sm:p-10 border-white/5 bg-white/[0.02] backdrop-blur rounded-[2.5rem]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Large Avatar */}
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-onyx-800 border-2 border-white/10 overflow-hidden flex items-center justify-center text-gold-500 text-3xl font-bold flex-shrink-0 shadow-2xl">
            {worker.avatarUrl ? (
              <img src={worker.avatarUrl} alt={worker.name} className="h-full w-full object-cover" />
            ) : (
              worker.name.charAt(0)
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-start space-y-4 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {worker.name}
              </h1>
              <div className="flex gap-2">
                {worker.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-onyx-950 bg-gold-500 px-2.5 py-1 rounded-md shadow-sm">
                    <Sparkles className="h-3 w-3 fill-current" />
                    {isArabic ? "راعٍ مميز" : "Sponsored"}
                  </span>
                )}
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border",
                  worker.isOnline 
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                    : "bg-onyx-800 border-white/5 text-onyx-400"
                )}>
                  <span className={cn("h-2 w-2 rounded-full", worker.isOnline ? "bg-emerald-500 green-glow" : "bg-onyx-600")} />
                  {worker.isOnline ? (isArabic ? "متصل" : "Online") : (isArabic ? "غير متصل" : "Offline")}
                </span>
              </div>
            </div>

            <p className="text-lg text-gold-500 font-bold">
              {isArabic ? worker.professionAr : worker.professionEn}
            </p>

            {/* Badges / Quick Stats */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-sm text-onyx-300">
              <div className="flex items-center gap-1.5">
                <Star className="h-4.5 w-4.5 text-gold-500 fill-current" />
                <span className="font-bold text-white text-base">{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                <span className="text-onyx-500">({worker.ratingCount || 1} {isArabic ? "تقييم" : "reviews"})</span>
              </div>
              <span className="hidden sm:inline text-onyx-700">|</span>
              <div className="flex items-center gap-1.5">
                <Wrench className="h-4 w-4 text-gold-500" />
                <span className="font-bold text-white">{worker.totalJobs}</span>
                <span>{isArabic ? "عملية صيانة ناجحة" : "completed jobs"}</span>
              </div>
              <span className="hidden sm:inline text-onyx-700">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold-500" />
                <span>{isArabic ? "انضم" : "Joined"} {new Date(worker.joinedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short' })}</span>
              </div>
            </div>

            {/* Coverage Areas */}
            <div className="space-y-2">
              <span className="text-xs text-onyx-500 font-bold uppercase tracking-wider block">
                {isArabic ? "مناطق عمل وتغطية الأسطى" : "Service Coverage Area"}
              </span>
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                {worker.areas.map((a: string, idx: number) => (
                  <span key={idx} className="text-xs bg-onyx-800/80 text-onyx-300 px-3 py-1.5 rounded-lg border border-white/[0.03] flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gold-500" />
                    <span>{a}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Book CTA Column */}
          <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-3">
            <button
              onClick={handleBookClick}
              className="w-full md:w-56 btn-gold py-4 text-base font-black shadow-lg shadow-gold-500/15"
            >
              {isArabic ? "اطلب هذا الفني" : "Book Pro Now"}
            </button>
            <p className="text-xs text-onyx-500 font-medium">
              {isArabic ? "ضمان حقيقي ودفع آمن عبر المنصة" : "True guarantee & secure checkout"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left 2 Columns: Bio & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Bio Section */}
          <section className="onyx-card p-6 sm:p-8 border-white/5 bg-white/[0.01] rounded-3xl space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-gold-500" />
              <span>{isArabic ? "نبذة مهنية عن الفني" : "Technician Bio / Profile"}</span>
            </h2>
            <div className="h-0.5 w-16 bg-gold-500 rounded-full" />
            <p className="text-onyx-300 leading-relaxed font-light text-base whitespace-pre-line">
              {worker.bio || (isArabic 
                ? "لم يضف هذا الفني نبذة شخصية بعد. ولكنه فني محترف موثق ويقدم خدمات ممتازة في جميع مناطق التغطية المحددة." 
                : "This technician hasn't added a bio yet. They are a verified professional offering services in their coverage areas.")}
            </p>
          </section>

          {/* Reviews List */}
          <section className="onyx-card p-6 sm:p-8 border-white/5 bg-white/[0.01] rounded-3xl space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gold-500" />
              <span>{isArabic ? "آراء ومراجعات العملاء" : "Customer Reviews"}</span>
            </h2>
            <div className="h-0.5 w-16 bg-gold-500 rounded-full" />

            {worker.reviews.length === 0 ? (
              <div className="text-center py-12 text-onyx-500">
                <Star className="h-12 w-12 text-onyx-800 mx-auto mb-3" />
                <p className="text-sm font-medium">{isArabic ? "لا توجد تقييمات لهذا الفني بعد." : "No reviews for this pro yet."}</p>
                <p className="text-xs text-onyx-600 mt-1">{isArabic ? "كن أول من يكتب تقييماً!" : "Be the first to rate them!"}</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-white/5">
                {worker.reviews.map((review, idx) => (
                  <article key={review.id} className={cn("pt-4 flex items-start gap-4", idx === 0 && "pt-0")}>
                    {/* User avatar */}
                    <div className="h-10 w-10 rounded-full bg-onyx-800 border border-white/10 overflow-hidden flex items-center justify-center text-gold-500 text-sm font-bold flex-shrink-0">
                      {review.authorAvatar ? (
                        <img src={review.authorAvatar} alt={review.authorName} className="h-full w-full object-cover" />
                      ) : (
                        review.authorName.charAt(0)
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{review.authorName}</h4>
                        <span className="text-[10px] text-onyx-500">
                          {new Date(review.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>
                      
                      {/* Rating stars */}
                      <div className="flex items-center gap-0.5 text-gold-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-onyx-700")} />
                        ))}
                      </div>

                      <p className="text-sm text-onyx-300 font-light leading-relaxed">
                        {review.comment || (isArabic ? "تم التقييم بـ 5 نجوم بدون تعليق." : "Rated 5 stars without comment.")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right 1 Column: Rating Form */}
        <div className="space-y-8">
          {/* Rating Submittal Form Card */}
          <section className="onyx-card p-6 sm:p-8 border-white/5 bg-white/[0.01] rounded-3xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-gold-500" />
                <span>{isArabic ? "تقييم الأسطى ومراجعته" : "Rate Technician"}</span>
              </h3>
              <p className="text-xs text-onyx-500 leading-relaxed">
                {isArabic 
                  ? "شارك تجربتك لمساعدة العملاء الآخرين في اختيار الفني الأفضل" 
                  : "Share your experience to help others hire the best technicians."}
              </p>
            </div>
            
            <div className="h-0.5 w-16 bg-gold-500 rounded-full" />

            {reviewSuccess ? (
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-semibold text-center space-y-3">
                <p>🎉 {isArabic ? "تم إرسال تقييمك بنجاح!" : "Review submitted successfully!"}</p>
                <button 
                  onClick={() => setReviewSuccess(false)}
                  className="text-xs text-gold-500 font-bold hover:underline"
                >
                  {isArabic ? "إضافة تقييم آخر" : "Submit another review"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-onyx-400 block">
                    {isArabic ? "تقييمك للفني" : "Your Rating"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingValue = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewRating(ratingValue)}
                          className="text-gold-500 focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={cn("h-8 w-8", ratingValue <= newRating ? "fill-current" : "text-onyx-800")} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-onyx-400 block">
                    {isArabic ? "تعليقك ومراجعتك للفني" : "Review Description"}
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isArabic ? "اكتب تعليقك هنا عن جودة الخدمة والمواعيد..." : "Write your review about punctuality, quality, behavior..."}
                    rows={4}
                    className="w-full bg-onyx-900 border border-white/10 text-white rounded-xl p-3 text-sm placeholder-onyx-600 focus:outline-none focus:border-gold-500/50 resize-none leading-relaxed"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs text-red-500 font-medium">
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isArabic ? "إرسال التقييم" : "Submit Review"}</span>
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      {/* Booking Auth Prompt Modal */}
      {showBookingAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card border-white/10 bg-onyx-900 max-w-md w-full p-8 rounded-3xl shadow-2xl relative border animate-scaleUp">
            <button 
              onClick={() => setShowBookingAuthModal(false)}
              className="absolute top-4 right-4 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <div className="h-16 w-16 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
                <Users className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                {isArabic ? "طلب حجز مباشر" : "Direct Booking Request"}
              </h3>
              
              <p className="text-gold-500 font-bold mb-4 text-sm">
                {isArabic 
                  ? `حجز مع الفني: ${worker.name}` 
                  : `Booking with Pro: ${worker.name}`}
              </p>

              <p className="text-onyx-300 text-sm leading-relaxed mb-8">
                {isArabic
                  ? "لإتمام طلب الحجز المباشر مع الفني وإضافته تلقائياً لقائمة الفنيين المفضلين لديك لتسهيل التواصل لاحقاً، يرجى تسجيل الدخول أو إنشاء حساب عميل جديد."
                  : "To complete your direct booking request and automatically add this technician to your favorites list for easier future contact, please sign in or create a client account."}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login?redirect=${encodeURIComponent(
                    `/${locale}/client/new-request?workerId=${worker.id}&categoryId=${worker.categoryId}&serviceId=${worker.serviceId}`
                  )}`}
                  className="btn-gold py-3 text-sm font-black w-full text-center rounded-xl shadow-lg shadow-gold-500/10"
                >
                  {isArabic ? "تسجيل الدخول كعميل" : "Login as Client"}
                </Link>
                <Link
                  href={`/${locale}/register/client?redirect=${encodeURIComponent(
                    `/${locale}/client/new-request?workerId=${worker.id}&categoryId=${worker.categoryId}&serviceId=${worker.serviceId}`
                  )}`}
                  className="btn-onyx py-3 text-sm font-black w-full text-center border-white/10 text-white hover:bg-white/5 rounded-xl"
                >
                  {isArabic ? "إنشاء حساب عميل جديد" : "Register as Client"}
                </Link>
                <button
                  onClick={() => setShowBookingAuthModal(false)}
                  className="text-xs text-onyx-500 hover:text-onyx-300 transition-colors font-bold mt-4"
                >
                  {isArabic ? "إلغاء ومتابعة التصفح" : "Cancel and Continue Browsing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
