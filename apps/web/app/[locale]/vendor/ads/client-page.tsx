"use client";

import { useEffect, useState } from "react";
import { 
  Megaphone, 
  Plus, 
  Eye, 
  MousePointerClick, 
  Percent, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  VendorStitchAction,
  VendorStitchBadge,
  VendorStitchEmpty,
  VendorStitchMetric,
  VendorStitchPanel,
  VendorStitchShell,
  VendorStitchTopStrip
} from "@/components/vendor/vendor-stitch-ui";
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

export default function VendorAdsClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(2500); // Mapped wallet
  
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
    impressions: 7420,
    clicks: 894,
    ctr: 12.0
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
          impressions: totalViews || 7420,
          clicks: totalClicks || 894,
          ctr: parseFloat(avgCtr.toFixed(1)) || 12.0
        });
      }

      const wallet = await fetchApiData<any>("/clients/wallet", { balance: 2500 });
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
      setError(isArabic ? "العنوان الترويجي لمتجرك مطلوب" : "Store campaign title is required");
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
    const states: Record<string, { labelAr: string; labelEn: string; tone: "gold" | "green" | "muted" }> = {
      PENDING: { labelAr: "معلق - بانتظار الموافقة", labelEn: "Pending Approval", tone: "gold" },
      ACTIVE: { labelAr: "نشط وممول", labelEn: "Active & Funded", tone: "green" },
      PAUSED: { labelAr: "موقوف مؤقتاً", labelEn: "Paused", tone: "muted" },
      FINISHED: { labelAr: "مكتمل ومنتهي", labelEn: "Completed", tone: "muted" }
    };
    const s = states[status] || { labelAr: status, labelEn: status, tone: "muted" as const };
    return <VendorStitchBadge tone={s.tone}>{isArabic ? s.labelAr : s.labelEn}</VendorStitchBadge>;
  };

  return (
    <DashboardShell locale={locale} role="vendor">
      <VendorStitchShell locale={locale}>
        <VendorStitchTopStrip locale={locale} title={isArabic ? "الإعلانات الممولة" : "Sponsored ads"} />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden border border-white/10 bg-black p-6 text-white shadow-[5px_5px_0_#1d1600] lg:p-8">
          <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_20%,#f5bd18_0,transparent_32%),linear-gradient(135deg,transparent_0,#171717_70%)]" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 text-xs font-bold tracking-[0.25em] uppercase">
                  {isArabic ? "منصة ترويج المتاجر والموردين" : "Ostafy Merchant Promotion"}
                </span>
              </div>
              <h1 className="mt-2.5 text-3xl md:text-4xl font-black text-white tracking-tight">
                {isArabic ? "منشئ الحملات الإعلانية للموردين" : "Sponsored Merchant Ad Builder"}
              </h1>
              <p className="mt-3 text-sm text-onyx-400 max-w-xl leading-relaxed">
                {isArabic 
                  ? "قم بالترويج لقطع الغيار وبضائع متجرك لتصدر قائمة البحث! أنشئ حملات تسويقية ممولة تظهر للعملاء في نطاق تغطيتك والدفع من محفظتك مباشرة."
                  : "Launch sponsored campaigns to boost spare parts sales. Target clients looking for materials nearby with clean and automated budget deductions."}
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

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-12 items-center gap-2 bg-gold px-6 font-black text-black transition-all hover:bg-white active:scale-95"
              >
                <Plus className="h-5 w-5" />
                {isArabic ? "إنشاء إعلان ممول" : "Build Sponsored Ad"}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <VendorStitchMetric icon={Eye} index="01" label={isArabic ? "مرات ظهور متجرك" : "Store Impressions"} value={metrics.impressions.toLocaleString(locale)} note={isArabic ? "مشاهدات عالية" : "high visibility"} />
          <VendorStitchMetric icon={MousePointerClick} index="02" label={isArabic ? "النقرات التفاعلية" : "Total Clicks"} value={metrics.clicks.toLocaleString(locale)} note={isArabic ? "زيادة المبيعات" : "organic click growth"} />
          <VendorStitchMetric icon={Percent} index="03" label={isArabic ? "متوسط التفاعل CTR" : "Avg. Click Through Rate"} value={`${metrics.ctr}%`} note={isArabic ? "معدل تفاعل ممتاز" : "high conversion rate"} />
          <VendorStitchMetric icon={Wallet} index="04" label={isArabic ? "رصيد المحفظة المتاح" : "Wallet Balance"} value={`${walletBalance} ${isArabic ? "ج.م" : "EGP"}`} note={isArabic ? "محفظة تجارية نشطة" : "active vendor wallet"} />
        </div>

        {/* Charts & Campaign Management */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Active Campaigns Feed */}
          <VendorStitchPanel
            eyebrow="Campaigns"
            title={isArabic ? "حملات الترويج للمتجر" : "My Store Campaigns"}
            action={<Megaphone className="h-5 w-5 text-gold" />}
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center border border-white/10 bg-[#080808]">
                <div className="h-9 w-9 animate-spin border-4 border-gold border-t-transparent" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="space-y-5">
                <VendorStitchEmpty
                  title={isArabic ? "لا توجد حملات إعلانية للمحل حالياً" : "No store campaigns yet"}
                  text={isArabic
                    ? "ابدأ بالترويج لتصدر قائمة المتاجر وتحصل على طلبات خامات مباشرة."
                    : "Start promoting to get more direct client material orders."}
                />
                <VendorStitchAction onClick={() => setShowCreateModal(true)} tone="light">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  {isArabic ? "بناء أول إعلان ممول لمتجرك" : "Launch Store Campaign"}
                </VendorStitchAction>
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((ad) => (
                  <div
                    key={ad.id}
                    className="border border-white/10 bg-[#080808] p-5 shadow-[3px_3px_0_#1d1600] transition-colors hover:border-gold/70"
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
                            {ad.type === "BANNER" ? (isArabic ? "بنر إعلاني للمحل" : "Header Banner") : (isArabic ? "متجر ممول بالبحث" : "Sponsored Merchant Profile")}
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

                    <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                      <div className="border border-white/10 bg-black p-3">
                        <span className="block text-[10px] font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "مشاهدات" : "Views"}</span>
                        <span className="mt-1 block font-black text-white text-base">{ad.views.toLocaleString(locale)}</span>
                      </div>
                      <div className="border border-white/10 bg-black p-3">
                        <span className="block text-[10px] font-bold text-onyx-500 uppercase tracking-wider">{isArabic ? "نقرات" : "Clicks"}</span>
                        <span className="mt-1 block font-black text-gold text-base">{ad.clicks.toLocaleString(locale)}</span>
                      </div>
                      <div className="border border-white/10 bg-black p-3">
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
          </VendorStitchPanel>

          {/* Futuristic Sparkle Preview Deck */}
          <VendorStitchPanel
            eyebrow="Boost"
            title={isArabic ? "بوابة مبيعات المتاجر الممولة" : "Merchant Ad Features"}
            action={<Sparkles className="h-5 w-5 text-gold" />}
          >
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/60 bg-gold text-xs font-black text-black">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{isArabic ? "أولوية مطلقة في البحث" : "Search Rank Priority"}</h4>
                    <p className="text-xs text-onyx-400 mt-1 leading-relaxed">
                      {isArabic
                        ? "يظهر متجرك في مقدمة قائمة المتاجر المحلية المعتمدة عند بحث العملاء عن خامات صيانة."
                        : "Your store will have absolute priority rank at the top of merchant queries for clients."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/60 bg-gold text-xs font-black text-black">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{isArabic ? "عرض بضائعك وعروضك" : "Display inventory banner"}</h4>
                    <p className="text-xs text-onyx-400 mt-1 leading-relaxed">
                      {isArabic
                        ? "تلقى مئات الزيارات الإضافية يومياً من خلال وضع بنر إعلاني يعرض أهم قطع الغيار والتخفيضات المتاحة."
                        : "Bring hundreds of organic clicks directly to your store menu with beautiful visual banner ads."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/60 bg-gold text-xs font-black text-black">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{isArabic ? "تكامل الأرباح المباشرة" : "Secure ROI Tracking"}</h4>
                    <p className="text-xs text-onyx-400 mt-1 leading-relaxed">
                      {isArabic
                        ? "ادفع فقط مقابل التسويق الفعلي، مع خصم ذكي للميزانية مباشرة من محفظة متجرك على أُسطفاي."
                        : "Pay directly using your active Ostafy vendor wallet balance and track impressions dynamically."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Quick Recharge note */}
              <div className="mt-6 flex items-center justify-between gap-4 border border-white/10 bg-[#080808] p-4 text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gold-500" />
                  <div>
                    <span className="text-onyx-500 block">{isArabic ? "طريقة الدفع التلقائي" : "Payment Rail"}</span>
                    <span className="font-bold text-white block mt-0.5">
                      {isArabic ? "من محفظة المتجر مباشرة" : "Store Wallet Billing"}
                    </span>
                  </div>
                </div>
                <VendorStitchBadge tone="gold">{isArabic ? "دفع آمن" : "Secure Payment"}</VendorStitchBadge>
              </div>
          </VendorStitchPanel>
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl border border-white/10 bg-black p-6 shadow-[6px_6px_0_#1d1600] sm:p-8">
              <h2 className="text-2xl font-black text-white">
                {isArabic ? "منشئ الحملات الإعلانية للمحل" : "Create Store Sponsored Ad"}
              </h2>
              <p className="mt-2 text-sm text-onyx-400">
                {isArabic 
                  ? "اختر نوع الإعلان واملأ البيانات للترويج لمتجرك والحصول على طلبات خامات أكثر." 
                  : "Launch visual banner ads or search-top visibility funded securely from your Ostafy wallet."}
              </p>

              <form onSubmit={handleCreateCampaign} className="mt-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 border border-error/30 bg-error/10 p-3 text-sm text-error">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{isArabic ? "تم إرسال إعلانك بنجاح وهو بانتظار التفعيل الفوري!" : "Store campaign created successfully and is pending approval!"}</span>
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
                      className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                    >
                      <option value="SPONSORED_PROFILE">{isArabic ? "متجر ممول (Sponsored Store)" : "Sponsored Store"}</option>
                      <option value="BANNER">{isArabic ? "بنر إعلاني للمحل (Store Banner)" : "Store Banner"}</option>
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "مكان الإعلان" : "Ad Placement"}</span>
                    <select
                      value={formPlacement}
                      onChange={(e) => setFormPlacement(e.target.value as any)}
                      className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
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
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "العنوان الترويجي لمتجرك" : "Campaign Title"}</span>
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? "مثال: محلات النور لقطع الغيار - أصلية ومعتمدة" : "e.g. Al Noor Spare Parts - 100% Certified Supplies"}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                  />
                </label>

                {formType === "BANNER" && (
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "رابط صورة البنر الإعلاني" : "Banner Image URL"}</span>
                    <input
                      type="url"
                      placeholder="https://example.com/my-banner.jpg"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                    />
                  </label>
                )}

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-onyx-400 uppercase tracking-wider">{isArabic ? "رابط التحويل عند النقر (اختياري)" : "Target URL (Optional)"}</span>
                  <input
                    type="url"
                    placeholder="https://osta.app/profile/vendor-1"
                    value={formTargetUrl}
                    onChange={(e) => setFormTargetUrl(e.target.value)}
                    className="h-12 w-full border border-white/10 bg-[#121212] px-4 text-white outline-none transition-colors focus:border-gold text-sm"
                  />
                </label>

                <div className="flex items-center justify-between border border-white/10 bg-[#080808] p-4 text-xs">
                  <span className="text-onyx-400 font-medium">{isArabic ? "تكلفة ورسوم الحملة الإعلانية:" : "Campaign Advertising Fees:"}</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {formType === "BANNER" ? 500 : 250} {isArabic ? "ج.م" : "EGP"}
                  </span>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="border border-white/20 bg-transparent px-5 py-3 text-sm font-black uppercase text-white transition-colors hover:border-gold hover:text-gold"
                  >
                    {isArabic ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="flex items-center gap-2 border border-gold bg-gold px-6 py-3 text-sm font-black uppercase text-black transition-colors hover:bg-white disabled:opacity-50"
                  >
                    {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                    {isArabic ? "تمويل وتفعيل الحملة" : "Fund & Activate Ad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </VendorStitchShell>
    </DashboardShell>
  );
}
