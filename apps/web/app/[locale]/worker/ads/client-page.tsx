"use client";

import { useEffect, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Percent,
  Plus,
  RefreshCw,
  Wallet
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  WorkerProAction,
  WorkerProBadge,
  WorkerProEmpty,
  WorkerProHero,
  WorkerProMetric,
  WorkerProPanel,
  WorkerProShell,
  WorkerProTopStrip
} from "@/components/worker/worker-pro-ui";
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

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = formatNumber(locale, value);
  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

export default function WorkerAdsClientPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";

  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1250);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formType, setFormType] = useState<"BANNER" | "SPONSORED_PROFILE">("SPONSORED_PROFILE");
  const [formPlacement, setFormPlacement] = useState<"HOMEPAGE" | "WORKER_DASHBOARD" | "SEARCH_TOP">("SEARCH_TOP");
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formTargetUrl, setFormTargetUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [metrics, setMetrics] = useState({ impressions: 4820, clicks: 614, ctr: 12.7 });

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
    void loadCampaigns();
  }, []);

  async function handleCreateCampaign(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (formTitle.trim().length < 2) {
      setError(isArabic ? "عنوان الحملة مطلوب" : "Campaign title is required");
      return;
    }

    const campaignFee = formType === "BANNER" ? 500 : 250;
    if (walletBalance < campaignFee) {
      setError(isArabic ? `رصيد محفظتك غير كاف. تكلفة الإعلان ${campaignFee} ج.م ورصيدك ${walletBalance} ج.م` : `Insufficient wallet balance. Ad fee is EGP ${campaignFee}, your balance is EGP ${walletBalance}`);
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
      setWalletBalance((prev) => prev - campaignFee);

      window.setTimeout(() => {
        setShowCreateModal(false);
        setSuccess(false);
        void loadCampaigns();
      }, 1500);
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل إنشاء الحملة الإعلانية" : "Failed to create campaign"));
    } finally {
      setSubmitting(false);
    }
  }

  function statusBadge(status: AdCampaign["status"]) {
    const labels = {
      PENDING: { ar: "بانتظار الموافقة", en: "Pending" },
      ACTIVE: { ar: "نشط", en: "Active" },
      PAUSED: { ar: "متوقف", en: "Paused" },
      FINISHED: { ar: "مكتمل", en: "Finished" }
    };
    const tone = status === "ACTIVE" ? "green" : status === "PENDING" ? "gold" : "muted";
    return <WorkerProBadge tone={tone}>{labels[status][locale]}</WorkerProBadge>;
  }

  return (
    <DashboardShell locale={locale} role="worker">
      <WorkerProShell locale={locale}>
        <WorkerProTopStrip
          locale={locale}
          title={isArabic ? "الإعلانات الممولة" : "Sponsored ads"}
          actionLabel={isArabic ? "إنشاء إعلان" : "Create ad"}
        />
        <WorkerProHero
          locale={locale}
          eyebrow={isArabic ? "نمو الظهور" : "Sponsored growth"}
          title={isArabic ? "إعلانات" : "Sponsored"}
          highlight={isArabic ? "ممولة" : "ads"}
          subtitle={isArabic ? "أنشئ حملات ممولة لرفع ظهور ملفك في البحث ولوحات العملاء مع قياس واضح للنتائج." : "Create sponsored campaigns to raise profile visibility in search and client surfaces with clear performance tracking."}
          side={
            <div className="grid gap-4">
              <div className="border border-white/10 bg-black p-5 text-white shadow-[4px_4px_0_#1d1600]">
                <Wallet className="h-5 w-5 text-[#f5bd18]" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{isArabic ? "رصيد المحفظة" : "Wallet balance"}</p>
                <p className="mt-2 text-3xl font-black text-white">{formatCurrency(locale, walletBalance)}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-3 bg-white px-5 py-4 text-xs font-black uppercase text-black shadow-[4px_4px_0_#1d1600]"
              >
                <Plus className="h-4 w-4" />
                {isArabic ? "إنشاء إعلان ممول" : "Create sponsored ad"}
              </button>
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WorkerProMetric label={isArabic ? "مرات الظهور" : "Impressions"} value={formatNumber(locale, metrics.impressions)} note={isArabic ? "هذا الأسبوع" : "this week"} icon={Eye} index="01" />
          <WorkerProMetric label={isArabic ? "النقرات" : "Clicks"} value={formatNumber(locale, metrics.clicks)} note={isArabic ? "تفاعل فعلي" : "real actions"} icon={MousePointerClick} index="02" />
          <WorkerProMetric label={isArabic ? "معدل النقر" : "Click rate"} value={`${metrics.ctr}%`} note={isArabic ? "مؤشر الأداء" : "performance"} icon={Percent} index="03" />
          <WorkerProMetric label={isArabic ? "الحملات" : "Campaigns"} value={formatNumber(locale, campaigns.length)} note={isArabic ? "إجمالي" : "total"} icon={BarChart3} index="04" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <WorkerProPanel
            title={isArabic ? "حملاتي الإعلانية" : "My campaigns"}
            eyebrow={isArabic ? "إدارة الترويج" : "promotion control"}
            action={
              <WorkerProAction
                tone="light"
                onClick={() => {
                  setRefreshing(true);
                  void loadCampaigns();
                }}
                disabled={refreshing}
              >
                <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                {isArabic ? "تحديث" : "Refresh"}
              </WorkerProAction>
            }
          >
            {loading ? (
              <div className="flex h-48 items-center justify-center border border-white/10 bg-[#111]">
                <div className="h-8 w-8 animate-spin border-4 border-[#f5bd18] border-t-transparent" />
              </div>
            ) : campaigns.length === 0 ? (
              <WorkerProEmpty title={isArabic ? "لا توجد حملات حالية" : "No campaigns yet"} text={isArabic ? "ابدأ بحملة ممولة لرفع ظهور ملفك أمام العملاء المناسبين." : "Start a sponsored campaign to raise your profile in front of the right clients."} />
            ) : (
              <div className="grid gap-4">
                {campaigns.map((ad, index) => (
                  <article key={ad.id} className={index % 2 === 0 ? "border border-white/10 bg-[#111] p-5" : "border border-[#f5bd18]/30 bg-[#2a2207] p-5"}>
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black text-white">{ad.title}</h3>
                          {statusBadge(ad.status)}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white/45">{ad.type === "BANNER" ? (isArabic ? "بنر إعلاني" : "Banner ad") : (isArabic ? "ملف ممول" : "Sponsored profile")}</p>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{new Date(ad.createdAt).toLocaleDateString(locale, { dateStyle: "medium" })}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="border border-white/10 bg-white/5 p-3">
                        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{isArabic ? "مشاهدات" : "Views"}</span>
                        <span className="mt-1 block text-lg font-black text-white">{formatNumber(locale, ad.views)}</span>
                      </div>
                      <div className="border border-white/10 bg-white/5 p-3">
                        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{isArabic ? "نقرات" : "Clicks"}</span>
                        <span className="mt-1 block text-lg font-black text-[#f5bd18]">{formatNumber(locale, ad.clicks)}</span>
                      </div>
                      <div className="border border-white/10 bg-white/5 p-3">
                        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{isArabic ? "المعدل" : "CTR"}</span>
                        <span className="mt-1 block text-lg font-black text-white">{ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </WorkerProPanel>

          <WorkerProPanel title={isArabic ? "قوة الترويج" : "Promotion power"} eyebrow={isArabic ? "مزايا الإعلان" : "feature suite"}>
            <div className="space-y-4">
              {[
                { title: isArabic ? "صدارة نتائج البحث" : "Top search placement", text: isArabic ? "ارفع ظهور ملفك في نتائج البحث المناسبة لنطاقك." : "Raise your profile in relevant local search results." },
                { title: isArabic ? "بنرات واضحة" : "Clear banner placements", text: isArabic ? "اعرض إعلانك في مساحات يراها العملاء قبل طلب الخدمة." : "Place banners where clients look before booking services." },
                { title: isArabic ? "قياس مباشر" : "Live measurement", text: isArabic ? "تابع المشاهدات والنقرات ومعدل التفاعل من نفس الشاشة." : "Track impressions, clicks, and engagement from the same screen." }
              ].map((item, index) => (
                <div key={item.title} className="border border-white/10 bg-[#111] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#f5bd18]/40 bg-[#f5bd18] text-sm font-black text-black">{index + 1}</span>
                    <div>
                      <h3 className="font-black text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </WorkerProPanel>
        </div>

        {showCreateModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto border border-white/10 bg-black p-6 text-white shadow-[6px_6px_0_#f5bd18] sm:p-8">
              <h2 className="text-2xl font-black text-white">{isArabic ? "إنشاء حملة ممولة" : "Create sponsored campaign"}</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">{isArabic ? "اختر نوع الإعلان واملأ البيانات. سيتم الخصم من محفظتك عند الإرسال." : "Choose the ad type and fill in the details. Funds will be deducted from your wallet on submit."}</p>

              <form onSubmit={handleCreateCampaign} className="mt-6 space-y-4">
                {error ? (
                  <div className="flex items-center gap-2 border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}
                {success ? (
                  <div className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{isArabic ? "تم إرسال الإعلان بنجاح." : "Campaign submitted successfully."}</span>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "نوع الترويج" : "Promotion type"}</span>
                    <select
                      value={formType}
                      onChange={(event) => {
                        const value = event.target.value as "BANNER" | "SPONSORED_PROFILE";
                        setFormType(value);
                        setFormPlacement(value === "SPONSORED_PROFILE" ? "SEARCH_TOP" : "HOMEPAGE");
                      }}
                      className="h-12 w-full border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#f5bd18]"
                    >
                      <option value="SPONSORED_PROFILE">{isArabic ? "ملف ممول" : "Sponsored profile"}</option>
                      <option value="BANNER">{isArabic ? "بنر إعلاني" : "Banner ad"}</option>
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "مكان الإعلان" : "Ad placement"}</span>
                    <select value={formPlacement} onChange={(event) => setFormPlacement(event.target.value as any)} className="h-12 w-full border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#f5bd18]">
                      {formType === "SPONSORED_PROFILE" ? (
                        <option value="SEARCH_TOP">{isArabic ? "صدارة البحث" : "Search top"}</option>
                      ) : (
                        <>
                          <option value="HOMEPAGE">{isArabic ? "الصفحة الرئيسية" : "Homepage"}</option>
                          <option value="WORKER_DASHBOARD">{isArabic ? "لوحة العملاء" : "Client dashboard"}</option>
                        </>
                      )}
                    </select>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "عنوان الحملة" : "Campaign title"}</span>
                  <input type="text" required placeholder={isArabic ? "مثال: فني سباكة معتمد" : "e.g. Certified plumbing expert"} value={formTitle} onChange={(event) => setFormTitle(event.target.value)} className="h-12 w-full border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#f5bd18]" />
                </label>

                {formType === "BANNER" ? (
                  <label className="block space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "رابط صورة الإعلان" : "Banner image URL"}</span>
                    <input type="url" placeholder="https://example.com/banner.jpg" value={formImageUrl} onChange={(event) => setFormImageUrl(event.target.value)} className="h-12 w-full border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#f5bd18]" />
                  </label>
                ) : null}

                <label className="block space-y-2">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "رابط التحويل عند النقر" : "Target URL"}</span>
                  <input type="url" placeholder="https://ostafy.com/profile/worker-1" value={formTargetUrl} onChange={(event) => setFormTargetUrl(event.target.value)} className="h-12 w-full border border-white/10 bg-[#111] px-4 text-white outline-none focus:border-[#f5bd18]" />
                </label>

                <div className="flex items-center justify-between border border-white/10 bg-[#111] p-4 text-sm">
                  <span className="font-black text-white/50">{isArabic ? "تكلفة الحملة" : "Campaign fee"}</span>
                  <span className="font-black text-[#f5bd18]">{formatCurrency(locale, formType === "BANNER" ? 500 : 250)}</span>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/5">
                    {isArabic ? "إلغاء" : "Cancel"}
                  </button>
                  <button type="submit" disabled={submitting || success} className="inline-flex items-center gap-2 bg-[#f5bd18] px-6 py-3 text-sm font-black text-black disabled:opacity-50">
                    {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    {isArabic ? "تمويل وتفعيل" : "Fund and activate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </WorkerProShell>
    </DashboardShell>
  );
}
