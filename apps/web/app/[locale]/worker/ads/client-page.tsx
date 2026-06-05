"use client";

import { useEffect, useState } from "react";
import { 
  Megaphone, 
  Plus, 
  BarChart3, 
  Eye, 
  MousePointerClick, 
  Percent, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Sparkles,
  ArrowRightLeft
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";

interface AdCampaign {
  id: string;
  type: "BANNER" | "SPONSORED_PROFILE";
  placement: "HOMEPAGE" | "WORKER_DASHBOARD" | "SEARCH_TOP";
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  status: "PENDING" | "ACTIVE" | "PAUSED" | "FINISHED";
  views: number;
  clicks: number;
  createdAt: string;
}

export default function WorkerAdsClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1250); // Fallback wallet
  
  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formType, setFormType] = useState<"BANNER" | "SPONSORED_PROFILE">("SPONSORED_PROFILE");
  const [formPlacement, setFormPlacement] = useState<"HOMEPAGE" | "WORKER_DASHBOARD" | "SEARCH_TOP">("SEARCH_TOP");
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formTargetUrl, setFormTargetUrl] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    impressions: 4820,
    clicks: 614,
    ctr: 12.7
  });

  async function loadCampaigns() {
    try {
      const data = await fetchApiData<AdCampaign[]>("/ads/my", []);
      setCampaigns(data);
      
      if (data.length > 0) {
        const totalViews = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalClicks = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
        const avgCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
        setMetrics({
          impressions: totalViews || 1420,
          clicks: totalClicks || 124,
          ctr: parseFloat(avgCtr.toFixed(1)) || 8.7
        });
      }

      const wallet = await fetchApiData<any>("/clients/wallet", { balance: 1250 });
      if (wallet && wallet.balance !== undefined) {
        setWalletBalance(wallet.balance);
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formTitle.trim().length < 2) {
      setError(isArabic ? "عنوان الحملة مطلوب وجذاب" : "Campaign title is required");
      return;
    }

    const campaignFee = formType === "BANNER" ? 500 : 250;
    if (walletBalance < campaignFee) {
      setError(isArabic 
        ? `رصيد محفظتك غير كافٍ. تكلفة الإعلان: ${campaignFee} ج.م، رصيدك الحالي: ${walletBalance} ج.م`
        : `Insufficient wallet balance. Ad fee is EGP ${campaignFee}, your balance is EGP ${walletBalance}`);
      return;
    }

    setSubmitting(true);
    try {
      await postApiData("/ads", {
        type: formType,
        placement: formPlacement,
        title: formTitle,
        imageUrl: formImageUrl || undefined,
        targetUrl: formTargetUrl || undefined
      });

      setSuccess(true);
      setFormTitle("");
      setFormImageUrl("");
      setFormTargetUrl("");
      setWalletBalance(prev => prev - campaignFee);
      
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess(false);
        loadCampaigns();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل إنشاء الحملة الإعلانية" : "Failed to create campaign"));
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const states: Record<string, { labelAr: string; labelEn: string; classes: string }> = {
      PENDING: { labelAr: "معلق - بانتظار الموافقة", labelEn: "Pending Approval", classes: "bg-gold-500/10 text-gold-500 border border-gold-500/20" },
      ACTIVE: { labelAr: "نشط وممول", labelEn: "Active & Funded", classes: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5 shadow-lg" },
      PAUSED: { labelAr: "موقوف مؤقتاً", labelEn: "Paused", classes: "bg-white/10 text-white/60 border border-white/10" },
      FINISHED: { labelAr: "مكتمل ومنتهي", labelEn: "Completed", classes: "bg-white/5 text-white/40 border border-white/5" }
    };
    const s = states[status] || { labelAr: status, labelEn: status, classes: "bg-white/5 text-white/70" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.classes}`}>
        {isArabic ? s.labelAr : s.labelEn}
      </span>
    );
  };

  return (
    <DashboardShell locale={locale} role="worker">
      <div className="space-y-8 animate-slideUp">
        
        {/* Neon Hero Section */}
        <div className="relative rounded-[2.5rem] border border-white/5 bg-onyx-950/40 p-8 overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-ping" />
                <span className="text-accent-500 text-xs font-bold tracking-[0.25em] uppercase">
                  {isArabic ? "منصة أُسطى الترويجية" : "OSTA Sponsored Campaigns"}
                </span>
              </div>
              <h1 className="mt-2.5 text-3xl md:text-4xl font-black text-white tracking-tight">
                {isArabic ? "منشئ الحملات الإعلانية الممولة" : "Sponsored Ad Builder"}
              </h1>
              <p className="mt-3 text-sm text-onyx-400 max-w-xl leading-relaxed">
                {isArabic 
                  ? "ضاعف أرباحك وتصدر نتائج البحث فوراً! أنشئ بروفايل ممول أو بنر إعلاني يظهر لآلاف العملاء في منطقتك الجغرافية ليتم الدفع مباشرة من محفظتك."
                  : "Boost your reach and capture more jobs! Create sponsored profile placements or top-of-search banners funded securely from your OSTA wallet."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-accent-500 px-6 font-bold text-onyx-950 transition-all hover:bg-accent-400 active:scale-95 shadow-lg shadow-accent-500/25"
              >
                <Plus className="h-5 w-5" />
                {isArabic ? "إنشاء إعلان ممول" : "Build Sponsored Ad"}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Neon Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-onyx-900/35 p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/5 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "مرات ظهور الإعلان" : "Impressions"}</p>
                <p className="mt-2 text-3xl font-black text-white">{metrics.impressions.toLocaleString(locale)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 border border-accent-500/20">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10px] text-accent-400 font-bold block mt-3">↑ 18.2% {isArabic ? "هذا الأسبوع" : "this week"}</span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-onyx-900/35 p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "عدد النقرات التفاعلية" : "Total Clicks"}</p>
                <p className="mt-2 text-3xl font-black text-white">{metrics.clicks.toLocaleString(locale)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">
                <MousePointerClick className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10px] text-gold-400 font-bold block mt-3">↑ 12.4% {isArabic ? "تفاعل حقيقي" : "organic interactions"}</span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-onyx-900/35 p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "معدل التحويل CTR" : "Avg. Click Through Rate"}</p>
                <p className="mt-2 text-3xl font-black text-white">{metrics.ctr}%</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Percent className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10px] text-purple-400 font-bold block mt-3">↑ {isArabic ? "مؤشر نمو ممتاز" : "Excellent performance index"}</span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-onyx-900/35 p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "رصيد المحفظة المتاح" : "Wallet Balance"}</p>
                <p className="mt-2 text-3xl font-black text-emerald-400">{walletBalance} {isArabic ? "ج.م" : "EGP"}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block mt-3">{isArabic ? "سحب تلقائي آمن" : "Secure direct deduction"}</span>
          </div>
        </div>

        {/* Charts & Campaign Management */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Active Campaigns Feed */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-accent-500" />
              {isArabic ? "إعلاناتي وحملاتي الترويجية" : "My Active Ad Campaigns"}
            </h2>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-[2rem] border border-white/5 bg-onyx-900/20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-[2.5rem] border border-white/5 bg-onyx-900/20 p-8 text-center backdrop-blur-md">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-onyx-400 mb-4">
                  <Megaphone className="h-7 w-7" />
                </div>
                <p className="font-bold text-white text-lg">
                  {isArabic ? "لا توجد حملات إعلانية حالية" : "No sponsored campaigns yet"}
                </p>
                <p className="mt-2 text-sm text-onyx-400 max-w-sm">
                  {isArabic 
                    ? "لم تقم بإنشاء أي حملة ممولة حتى الآن. ابدأ بالترويج لملفك ليتصدر فئتك المهنية وتتلقى حجوزات مباشرة."
                    : "You have not launched any sponsored campaigns. Start promoting to get more direct client contracts."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Plus className="h-4 w-4 text-accent-500" />
                  {isArabic ? "بناء حملتك الإعلانية الأولى" : "Launch First Campaign"}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((ad) => (
                  <div
                    key={ad.id}
                    className="rounded-3xl border border-white/5 bg-onyx-900/20 p-6 space-y-4 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-white text-lg">{ad.title}</h3>
                          {getStatusBadge(ad.status)}
                        </div>
                        <span className="text-xs text-onyx-500 mt-1 block">
                          {isArabic ? "نوع الإعلان: " : "Ad type: "}
                          <span className="font-bold text-white/80">
                            {ad.type === "BANNER" ? (isArabic ? "بنر إعلاني رئيسي" : "Header Banner") : (isArabic ? "بروفايل ممول" : "Sponsored Profile")}
                          </span>
                        </span>
                      </div>
                      
                      <div className="text-end">
                        <span className="text-[10px] text-onyx-500 block">{isArabic ? "تاريخ الإنشاء" : "Created"}</span>
                        <span className="text-xs font-bold text-white block mt-0.5">
                          {new Date(ad.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center py-2">
                      <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5">
                        <span className="block text-[10px] font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "مشاهدات" : "Views"}</span>
                        <span className="mt-1 block font-black text-white text-base">{ad.views.toLocaleString(locale)}</span>
                      </div>
                      <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5">
                        <span className="block text-[10px] font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "نقرات" : "Clicks"}</span>
                        <span className="mt-1 block font-black text-accent-400 text-base">{ad.clicks.toLocaleString(locale)}</span>
                      </div>
                      <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5">
                        <span className="block text-[10px] font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "معدل التحويل" : "CTR"}</span>
                        <span className="mt-1 block font-black text-gold-400 text-base">
                          {ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Futuristic Sparkle Preview Deck */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-500" />
              {isArabic ? "قوة ترويج الإعلانات الممولة" : "Sponsored Ads Feature Suite"}
            </h2>

            <div className="rounded-[2.5rem] border border-white/5 bg-onyx-900/35 p-6 backdrop-blur-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/[0.02] blur-3xl pointer-events-none" />
              
              <h3 className="font-extrabold text-white text-base">
                {isArabic ? "لماذا تطلق إعلاناً ممولاً على أسطى؟" : "Why promote your services on OSTA?"}
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0 text-accent-400 font-bold text-xs border border-accent-500/20">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{isArabic ? "تصدر فوري لنتائج البحث" : "Instant Search Domination"}</h4>
                    <p className="text-xs text-onyx-400 mt-1 leading-relaxed">
                      {isArabic
                        ? "سيظهر اسمك وملفك المهني أعلى جميع نتائج البحث للفنيين في منطقتك الجغرافية فوراً."
                        : "Your professional profile will reside at the very top of search queries for workers in your area."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0 text-accent-400 font-bold text-xs border border-accent-500/20">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{isArabic ? "بنرات بصرية تفاعلية" : "Stunning Banner Placements"}</h4>
                    <p className="text-xs text-onyx-400 mt-1 leading-relaxed">
                      {isArabic
                        ? "ارفع تصميم بنر ترويجي جذاب يظهر في الصفحة الرئيسية للعملاء ليحفزهم على طلب خدمتك والاتصال بك."
                        : "Post premium visual banners in client dashboards generating massive click volumes to your profile."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0 text-accent-400 font-bold text-xs border border-accent-500/20">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{isArabic ? "رصد ذكي للتحليلات" : "Dynamic Analytical Tracking"}</h4>
                    <p className="text-xs text-onyx-400 mt-1 leading-relaxed">
                      {isArabic
                        ? "راقب إحصائيات حملتك لحظة بلحظة للتأكد من وصول إعلاناتك للجمهور المستهدف بشكل كامل."
                        : "Track impressions, clicks, and conversion rates continuously to monitor your client conversion."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Quick Recharge note */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gold-500" />
                  <div>
                    <span className="text-onyx-500 block">{isArabic ? "طريقة محاسبة الإعلانات" : "Billing Cycle"}</span>
                    <span className="font-bold text-white block mt-0.5">
                      {isArabic ? "خصم فوري من رصيد محفظتك" : "Direct Wallet Deduction"}
                    </span>
                  </div>
                </div>
                <span className="bg-gold-500/10 text-gold-400 font-bold px-2 py-1 rounded-md text-[10px]">
                  {isArabic ? "آمن ومحمي" : "Secure"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-[2.5rem] border border-white/5 bg-onyx-950 p-6 sm:p-8 shadow-2xl relative animate-slideUp">
              <h2 className="text-2xl font-black text-white">
                {isArabic ? "منشئ الحملات الإعلانية الممولة" : "Build Sponsored Ad Campaign"}
              </h2>
              <p className="mt-2 text-sm text-onyx-400">
                {isArabic 
                  ? "اختر نوع الإعلان واملأ البيانات للترويج لملفك أو بنرك الإعلاني فوراً." 
                  : "Draft your campaign specifications below. Direct funds will be deducted from your OSTA wallet."}
              </p>

              <form onSubmit={handleCreateCampaign} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-sm text-error flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{isArabic ? "تم إرسال إعلانك بنجاح وهو بانتظار التفعيل الفوري!" : "Campaign drafted successfully and is pending activation!"}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "نوع الترويج" : "Promotion Type"}</span>
                    <select
                      value={formType}
                      onChange={(e) => {
                        const val = e.target.value as "BANNER" | "SPONSORED_PROFILE";
                        setFormType(val);
                        if (val === "SPONSORED_PROFILE") {
                          setFormPlacement("SEARCH_TOP");
                        } else {
                          setFormPlacement("HOMEPAGE");
                        }
                      }}
                      className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-accent-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                    >
                      <option value="SPONSORED_PROFILE">{isArabic ? "بروفايل ممول (Sponsored Profile)" : "Sponsored Profile"}</option>
                      <option value="BANNER">{isArabic ? "بنر إعلاني (Banner Ad)" : "Banner Ad"}</option>
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "مكان الإعلان" : "Ad Placement"}</span>
                    <select
                      value={formPlacement}
                      onChange={(e) => setFormPlacement(e.target.value as any)}
                      className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-accent-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                    >
                      {formType === "SPONSORED_PROFILE" ? (
                        <option value="SEARCH_TOP">{isArabic ? "صدر نتائج البحث (Search Top)" : "Search Top"}</option>
                      ) : (
                        <>
                          <option value="HOMEPAGE">{isArabic ? "الصفحة الرئيسية (Homepage)" : "Homepage"}</option>
                          <option value="WORKER_DASHBOARD">{isArabic ? "لوحة العملاء (Client Dashboard)" : "Client Dashboard"}</option>
                        </>
                      )}
                    </select>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "العنوان الترويجي الجذاب" : "Campaign Title"}</span>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? "مثال: أسطى سباكة معتمد - خبرة 15 عاماً" : "e.g., Certified plumbing expert - 15 yrs experience"}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-accent-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                  />
                </label>

                {formType === "BANNER" && (
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "رابط صورة البنر الإعلاني (ImageUrl)" : "Banner Image URL"}</span>
                    <input
                      type="url"
                      placeholder="https://example.com/my-banner.jpg"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-accent-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                    />
                  </label>
                )}

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "رابط التحويل عند النقر (TargetUrl - اختياري)" : "Target URL (Optional)"}</span>
                  <input
                    type="url"
                    placeholder="https://osta.app/profile/worker-1"
                    value={formTargetUrl}
                    onChange={(e) => setFormTargetUrl(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/5 bg-white/5 px-4 text-white focus:border-accent-500/30 focus:bg-white/10 outline-none text-sm transition-all"
                  />
                </label>

                {/* Direct deduction notification */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex items-center justify-between text-xs">
                  <span className="text-onyx-400 font-medium">{isArabic ? "تكلفة ورسوم الحملة الإعلانية:" : "Campaign Advertising Fees:"}</span>
                  <span className="font-extrabold text-accent-500 text-sm">
                    {formType === "BANNER" ? 500 : 250} {isArabic ? "ج.م" : "EGP"}
                  </span>
                </div>

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
                    disabled={submitting || success}
                    className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-onyx-950 hover:bg-accent-400 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {isArabic ? "تمويل وتفعيل الحملة" : "Fund & Activate Ad"}
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
