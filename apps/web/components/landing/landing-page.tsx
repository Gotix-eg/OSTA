"use client";

import { motion } from "framer-motion";
import {
  Star, ShieldCheck, Shield, Check, X, Search, DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";
import { getBrowserAuthState } from "@/lib/auth-client";
import { resolveApiBaseUrl } from "@/lib/api";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import { MobileHeroSlider } from "@/components/landing/mobile-hero-slider";

const serviceImages: Record<string, string> = {
  electrical: "https://lh3.googleusercontent.com/aida-public/AB6AXuChTug4Xa3ATzUKqNy7G76wapjHoS13_0giOPdgZyg5sMyfyS1BPleTfgcep3s8DKqeZ8mCcttXB_YXKsqn9XzLyFu6E3OEXW6p4WtccVVTpzOkPz0TqrTkSok5aUqsuqTjIeFDNtY5JFCTrgyYGSp840rFBaMBdkMnFDh3SGgVgNWdAxi0ytene1YgTpurVFCBeoLJMz2la9VCeaqyp0GlN4G3c1UkcOn-1c56tSY401lQ1OXlHiSIIU_QeKL_d-_h4Bmt-pvnfZg",
  electricity: "https://lh3.googleusercontent.com/aida-public/AB6AXuChTug4Xa3ATzUKqNy7G76wapjHoS13_0giOPdgZyg5sMyfyS1BPleTfgcep3s8DKqeZ8mCcttXB_YXKsqn9XzLyFu6E3OEXW6p4WtccVVTpzOkPz0TqrTkSok5aUqsuqTjIeFDNtY5JFCTrgyYGSp840rFBaMBdkMnFDh3SGgVgNWdAxi0ytene1YgTpurVFCBeoLJMz2la9VCeaqyp0GlN4G3c1UkcOn-1c56tSY401lQ1OXlHiSIIU_QeKL_d-_h4Bmt-pvnfZg",
  plumbing: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9XbarKd7rQKgRTM2Hzk9naU8iMkUDbh6pHfVRY1iLHWKMWWIhm_Mim9QkMqUrMyRCFPeQ9nTzVKPhYLPP8wMNTsrhKlAJxi7NC948G93xPBBAbb1YBH7WHGbhJmYU3pf0Yrr56hX2rsNn2UDUP_qiFfnKsKXltoEtNRIar1K_fEhwHcplZG7er1D11PMiUBgZWzyGVt0aqCmrN8fjsqnqtCBjp24msn0aTF28dVrosruN4KqVMDrnBKPZkYsAtDJENehKtQLQv5A",
  carpentry: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdtFKd2NwRiyi28iKlLYtc-E1-JMk0CR_kGnPAth4xUTPkJ-13jYhNfcDxPisTKesVah5oualQ26CwBxewPOALBwM3SbSXDxlTeLc4oKej-ez3OC437YueiGP2T774Agu89I29NEAIkrKArvd-J5p6bI1UunndB_Co4xafbLyxHScBpYHMd1ajeNyjrlq9j2OCOsFyH_JXEAN-WRSkKhRRszmHlDv40PDUoehzBarXwBUm-AD9vma0Qxyp4uc3GcfqWY-T-WYWTkk",
  ac: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvFMjd2ZtJaYv7nDjvS_gkgZJEtZkt8t4IYRggrKpGcqULySwW2zaa4zDemr22X5cwx5Ati0gtxbsBb13axmYy3f-w90ZmO_Xs6hCMCVFgE611SrRZntRCMIEEDnWjOPCsqjNmJ0qqiMRSoqq5P2jlji1As7oy_6cDAI8_uar3TPG2CM9CY53v5SGZ5W3xllmTsQGlFaJbSbSwNUcbb1V0uAeEH5EkGFEcj00JS7Wec0qjq-3PbN0hqM1esfxHX5Qqqc1yWyqiNes",
  "ac-maintenance": "https://lh3.googleusercontent.com/aida-public/AB6AXuDvFMjd2ZtJaYv7nDjvS_gkgZJEtZkt8t4IYRggrKpGcqULySwW2zaa4zDemr22X5cwx5Ati0gtxbsBb13axmYy3f-w90ZmO_Xs6hCMCVFgE611SrRZntRCMIEEDnWjOPCsqjNmJ0qqiMRSoqq5P2jlji1As7oy_6cDAI8_uar3TPG2CM9CY53v5SGZ5W3xllmTsQGlFaJbSbSwNUcbb1V0uAeEH5EkGFEcj00JS7Wec0qjq-3PbN0hqM1esfxHX5Qqqc1yWyqiNes",
  painting: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcJb2n56wQexHYRH4gH4fvGF2wPV_cVeslINqGn09LSGdNZasRBxwkhdMVw9f3s8EITjKLXgef4kHXxehQUtPeCDHi-8CqwiAqQ5acm2Rh22fB8XY7nu0ZqGtjIx0_69MqWdQ-LahX0HHm_6vAu7ycdMueBz2u8-OPZvghmu6iLH4oOoYlaC9CYNhl8fPGXKZnPeCp9azh00foyZCrqcAQUa6FHIXAkkXiNaHLY0b3RYIkMfNpaXHH0BRk-4GHYbSxs51-OUyQZjY",
  appliances: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUaJL8m48Bpe_ujODneuoPvDhfmC9U-Zof1pGoXVy11MeUd0XRYsVEFmXl_CHdnj6n8RbrD1wOlgE1kA7IG3s5mprEpYrgocNSvPhqy5uhDaQhZEqaJuck7qJZ1jR6r1bFPs6IU44hEor3AkW1KdTuFfAsh8CsbDieBqYLx2wNXuaLZl37PYkCkUCIWDG8qwLx8czzHu1d-qQv4WUtm0SOr3HbUStlA5shYeNw653FVGST0q9y0pT1gInSJ0yNH2xUyr1BM4IQxo4"
};

const fallbackServiceImage = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=900&auto=format&fit=crop";

function getServiceImage(craft: any) {
  const imageUrl = typeof craft?.imageUrl === "string" ? craft.imageUrl : "";
  const slug = typeof craft?.slug === "string" ? craft.slug : "";
  const icon = typeof craft?.icon === "string" ? craft.icon : "";
  return imageUrl || serviceImages[slug] || serviceImages[icon] || fallbackServiceImage;
}

function getServiceSlug(craft: any) {
  return typeof craft?.slug === "string" && craft.slug.trim() ? craft.slug : "services";
}

function getServiceName(craft: any, isArabic: boolean) {
  const nameAr = typeof craft?.nameAr === "string" ? craft.nameAr : "";
  const nameEn = typeof craft?.nameEn === "string" ? craft.nameEn : "";
  return isArabic ? (nameAr || nameEn || "خدمة") : (nameEn || nameAr || "Service");
}

export function LandingPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const liveCategories = useLiveApiData<any[]>("/services/categories", []);
  const safeCategories = Array.isArray(liveCategories) ? liveCategories.filter(Boolean) : [];
  
  const [slides, setSlides] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showWorkerAuthModal, setShowWorkerAuthModal] = useState<boolean>(false);

  useEffect(() => {
    const baseUrl = resolveApiBaseUrl();
    
    // Fetch slides from dynamic database API
    fetch(`${baseUrl}/public/slides`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setSlides(payload.data.filter((s: any) => s.isActive !== false));
        }
      })
      .catch(() => {});

    // Fetch campaigns from database API
    fetch(`${baseUrl}/public/campaigns`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setCampaigns(payload.data.filter((c: any) => c.isActive !== false));
        }
      })
      .catch(() => {});

    // Fetch workers/pros from database API
    fetch(`${baseUrl}/public/workers`)
      .then(r => r.json())
      .then(payload => {
        if (payload.success && Array.isArray(payload.data)) {
          setWorkers(payload.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleBookClick = (worker: any) => {
    getBrowserAuthState().then(({ isLoggedIn }) => {
      if (!isLoggedIn) {
        setSelectedWorkerForBooking(worker);
        setShowAuthModal(true);
      } else {
        window.location.href = `/${locale}/client/new-request?workerId=${worker.id}`;
      }
    });
  };

  // Fallback slides in case database is empty
  const defaultSlide = {
    titleAr: "اطلب أُسطفاي محترف بنقرة واحدة",
    titleEn: "Hire a Professional Ostafy in Seconds",
    descAr: "أول منصة تجمع أمهر الفنيين والمتاجر الموثقة في مصر. جودة مضمونة، أسعار عادلة، وتجربة مستخدم فاخرة.",
    descEn: "The first platform connecting skilled pros and verified stores in Egypt. Guaranteed quality, fair prices, and a premium experience.",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1600&auto=format&fit=crop"
  };

  const activeHeroSlide = slides[0] || defaultSlide;
  const mobileCategories = (safeCategories.length > 0 ? safeCategories.slice(0, 4) : [
    { id: "electricity", slug: "electricity", nameAr: "كهرباء", nameEn: "Electricity" },
    { id: "plumbing", slug: "plumbing", nameAr: "سباكة", nameEn: "Plumbing" },
    { id: "ac", slug: "ac", nameAr: "تكييف", nameEn: "Air Conditioning" },
    { id: "carpentry", slug: "carpentry", nameAr: "نجارة", nameEn: "Carpentry" }
  ]);

  const mobileFallbackPros = [
    {
      id: "fallback-electrician",
      nameAr: "أحمد حسن",
      nameEn: "Ahmed Hassan",
      professionAr: "كهربائي محترف",
      professionEn: "Master Electrician",
      rating: 4.9,
      jobs: 124,
      distanceAr: "قريب منك",
      distanceEn: "5.0 km away",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrP1yd3kdYkr-I3_KLKwkJpD7Zq1RpCOy8ez11g6uHVhJxb8sz6xIUUOSu7w3VVMb8-2DERi8UltiGnRjgDSnXhDkvtuOGpS3GQAaI81sjL92vUBGl3DhVoYey_NVsxLiRnDoEWmvSpyISj5mIJBsvPK03o2GnKCkR09DMfIqYBui9-r2qLmPcjJU6aegj6Pst8IDlz0hZXYyaj71Nj6O9Sc78C3qIw-BWfNzWb_tob7HYDfbjxpJ4YqQf9l-qfx5mbkhWNqkCspY"
    },
    {
      id: "fallback-plumber",
      nameAr: "سمير خليل",
      nameEn: "Samir Khalil",
      professionAr: "سباك أول",
      professionEn: "Senior Plumber",
      rating: 4.8,
      jobs: 98,
      distanceAr: "الأقرب",
      distanceEn: "2.3 km away",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUjS8cqQCINIOM84jIMf2dYmBT0ln1b8teCxZV19vnToAaTPbpuwJcvOdIoY4CVoKIiP3wxhHAWIUx1LH3Fn2E5A7C_CRnb4Z-V1EnnCgZj1rtmJmzhkKS-Cei1wxR6LKdtJ5-B01h1LI_R_UiWI7slUhfpK0xSOUbS4Pk4Pe6yHWxPC8p6z6Blicrzxq9mF29GthmdUjKgmWQPcHcqGLawfLjxgAHGwF6OW7sGJ8QtC23cWBNawb9fMXzgXuUFjpTY6GYovxVDIg"
    }
  ];

  type MobilePro = {
    id: string;
    raw?: any;
    nameAr: string;
    nameEn: string;
    professionAr: string;
    professionEn: string;
    rating: number;
    jobs: number;
    distanceAr: string;
    distanceEn: string;
    image: string;
  };

  const fallbackProImage = mobileFallbackPros[0]?.image ?? "";
  const mobilePros: MobilePro[] = workers.length > 0
    ? workers.slice(0, 4).map((worker, index) => ({
        id: worker.id,
        raw: worker,
        nameAr: worker.name,
        nameEn: worker.name,
        professionAr: worker.professionAr || "فني معتمد",
        professionEn: worker.professionEn || "Verified Pro",
        rating: worker.rating || 5,
        jobs: worker.totalJobs || 0,
        distanceAr: "داخل مصر",
        distanceEn: "Egypt",
        image: worker.avatarUrl && !worker.avatarUrl.includes("initials")
          ? worker.avatarUrl
          : mobileFallbackPros[index % mobileFallbackPros.length]?.image ?? fallbackProImage
      }))
    : mobileFallbackPros;

  const mobileCampaigns = campaigns.length > 0
    ? campaigns.slice(0, 2).map((campaign) => ({
        id: campaign.id,
        titleAr: campaign.titleAr,
        titleEn: campaign.titleEn,
        descAr: campaign.descAr,
        descEn: campaign.descEn,
        badgeAr: campaign.badgeAr || "عرض",
        badgeEn: campaign.badgeEn || "Promo",
        href: campaign.link || campaign.btn1Link || `/${locale}/services`
      }))
    : [
        {
          id: "mobile-offer-1",
          titleAr: "خصم 20%",
          titleEn: "20% OFF",
          descAr: "على أول خدمة سباكة",
          descEn: "First plumbing service",
          badgeAr: "كود: OSTA20",
          badgeEn: "Promo: OSTA20",
          href: `/${locale}/register/client`
        },
        {
          id: "mobile-offer-2",
          titleAr: "معاينة مجانية",
          titleEn: "FREE QUOTE",
          descAr: "للمشروعات والتركيبات الكبيرة",
          descEn: "Industrial installation projects",
          badgeAr: "لفترة محدودة",
          badgeEn: "Limited Time",
          href: `/${locale}/services`
        }
      ];

  return (
    <div className="bg-[#f9f9f9] max-md:bg-[#f5bd18] selection:bg-[#f5bd18] selection:text-[#1a1c1c] overflow-x-hidden">
      {/* Stitch mobile home — shown ONLY on mobile (< 768px) */}
      <div className="md:hidden min-h-screen bg-[#f5bd18] pb-24 text-[#1a1c1c]">
        <main>
          <MobileHeroSlider locale={locale} />

          <section className="relative z-10 mt-12 px-4">
            <div className="grid grid-cols-2 gap-4">
              {mobileCategories.map((craft) => {
                const imgUrl = getServiceImage(craft);
                const slug = getServiceSlug(craft);
                return (
                  <Link
                    key={craft?.id ?? slug}
                    href={`/${locale}/services/${slug}`}
                    className="group relative flex min-h-[132px] overflow-hidden border border-white/10 bg-black text-center text-white transition-transform active:scale-95"
                  >
                    <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-110" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
                    <span className="relative z-10 mt-auto w-full px-4 pb-5 text-sm font-black uppercase">
                      {getServiceName(craft, isArabic)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-12 px-4">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-black uppercase text-black">
              <span className="h-1 w-8 bg-black" />
              {isArabic ? "عروض خاصة" : "Special Offers"}
            </h2>
            <div className="flex snap-x gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch]">
              {mobileCampaigns.map((offer) => (
                <Link
                  key={offer.id}
                  href={offer.href.startsWith("http") ? offer.href : offer.href as `/${string}`}
                  className="min-w-[280px] snap-center overflow-hidden border border-white/10 bg-black text-start"
                >
                  <div className="flex h-40 items-center justify-center bg-zinc-900 p-4 text-center">
                    <div>
                      <h3 className="mb-1 text-3xl font-black text-[#f5bd18]">
                        {isArabic ? offer.titleAr : offer.titleEn}
                      </h3>
                      <p className="text-sm font-bold text-white/60">
                        {isArabic ? offer.descAr : offer.descEn}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black p-4">
                    <span className="bg-[#f5bd18] px-2 py-1 text-xs font-black uppercase text-black">
                      {isArabic ? offer.badgeAr : offer.badgeEn}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-12 mt-12">
            <div className="mb-3 flex items-end justify-between px-4">
              <h2 className="text-2xl font-black uppercase text-black">
                {isArabic ? "فنيون مميزون" : "Featured Pros"}
              </h2>
              <Link href={`/${locale}/workers`} className="text-sm font-black underline decoration-2">
                {isArabic ? "عرض الكل" : "View All"}
              </Link>
            </div>
            <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-6 [-webkit-overflow-scrolling:touch]">
              {mobilePros.map((worker) => (
                <article key={worker.id} className="min-w-[240px] snap-center space-y-4 border border-white/10 bg-black p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 border border-white/20 bg-zinc-800">
                      <img src={worker.image} alt={isArabic ? worker.nameAr : worker.nameEn} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 text-start">
                      <p className="truncate text-sm font-black">{isArabic ? worker.nameAr : worker.nameEn}</p>
                      <p className="text-xs font-bold text-[#f5bd18]">{isArabic ? worker.professionAr : worker.professionEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white/60">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#f5bd18] text-[#f5bd18]" />
                      {Number(worker.rating).toFixed(1)} ({worker.jobs})
                    </span>
                    <span>{isArabic ? worker.distanceAr : worker.distanceEn}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => worker.raw ? handleBookClick(worker.raw) : window.location.assign(`/${locale}/workers`)}
                    className="w-full bg-[#f5bd18] py-2 text-sm font-black uppercase text-black shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    {isArabic ? "الملف" : "Profile"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      <div className="hidden md:block">

      {/* Desktop Hero Section — ONLY on md+ */}
      <section className="hidden md:flex relative w-full h-[85vh] flex-col items-center justify-center text-center overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Master craftsman working" 
            className="w-full h-full object-cover opacity-80" 
            src={activeHeroSlide.imageUrl || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1600&auto=format&fit=crop"}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c1c]/70 via-[#1a1c1c]/50 to-[#1a1c1c]/90" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-12 space-y-8">
          <h1 className="font-display-lg text-5xl md:text-7xl text-white !leading-tight font-black tracking-tight">
            {isArabic ? (
              <>
                {activeHeroSlide.titleAr ? (
                  activeHeroSlide.titleAr.replace("أُسطفاي", "")
                ) : "اطلب محترف بنقرة واحدة"}
                <span className="inline-block bg-[#f5bd18] text-[#1a1c1c] px-4 pt-[0.3em] pb-1 mx-2">أُسطفاي</span>
              </>
            ) : (
              <>
                {activeHeroSlide.titleEn ? (
                  activeHeroSlide.titleEn.replace("Ostafy", "")
                ) : "Hire a Professional in Seconds"}
                <span className="inline-block bg-[#f5bd18] text-[#1a1c1c] px-4 py-1 mx-2">Ostafy</span>
              </>
            )}
            <span className="block mt-6 text-3xl md:text-4xl text-[#f5bd18]">
              {isArabic ? "خدمات وفنيين ومتاجر موثوقة في مصر" : "Egypt's Premium Service Network"}
            </span>
          </h1>
          <p className="text-white max-w-2xl mx-auto opacity-90 text-lg md:text-xl font-light leading-relaxed">
            {isArabic ? activeHeroSlide.descAr : activeHeroSlide.descEn || activeHeroSlide.desc}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href={`/${locale}/register/client`} 
              className="w-full md:w-auto bg-[#f5bd18] text-[#1a1c1c] font-black px-10 py-4 rounded-none sticker-shadow hover:scale-105 transition-all uppercase text-center"
            >
              {isArabic ? "اطلب فني" : "Order a Pro"}
            </Link>
            <Link 
              href={`/${locale}/register/worker`} 
              className="w-full md:w-auto border-2 border-white text-white font-black px-10 py-4 hover:bg-white hover:text-black transition-all uppercase text-center"
            >
              {isArabic ? "انضم كفني" : "Join as Pro"}
            </Link>
            <Link 
              href={`/${locale}/register/vendor`} 
              className="w-full md:w-auto border-2 border-white text-white font-black px-10 py-4 hover:bg-white hover:text-black transition-all uppercase text-center"
            >
              {isArabic ? "انضم كمتجر" : "Join as Vendor"}
            </Link>
          </div>
          <div className="pt-8 flex items-center justify-center gap-2">
            <div className="flex -space-x-4 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-full border-2 border-[#f5bd18] bg-neutral-800 overflow-hidden">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop" alt="" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#f5bd18] bg-neutral-800 overflow-hidden">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop" alt="" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#f5bd18] bg-neutral-800 overflow-hidden">
                <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop" alt="" />
              </div>
            </div>
            <span className="font-black text-white me-4 text-xs uppercase tracking-wider">
              {isArabic ? "انضم إلى أوائل المستخدمين الموثوقين" : "JOIN OUR TRUSTED EARLY USERS"}
            </span>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-24 bg-[#f3f3f4] max-md:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="mb-12 text-start">
            <h2 className="text-3xl md:text-5xl text-[#1a1c1c] font-black">
              {isArabic ? "الحرف المتخصصة" : "Specialized Crafts"}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {safeCategories.slice(0, 5).map((craft) => {
              const imgUrl = getServiceImage(craft);
              const slug = getServiceSlug(craft);
              return (
                <Link
                  key={craft?.id ?? slug}
                  href={`/${locale}/services/${slug}`}
                  className="group flex flex-col overflow-hidden border border-white/10 bg-[#1a1c1c] text-center cursor-pointer hover:border-[#f5bd18] transition-all duration-300 rounded-none"
                >
                  <div className="relative h-[180px] overflow-hidden">
                    <img src={imgUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col items-center py-2.5 px-4 border-t border-white/5 group-hover:border-[#f5bd18] transition-colors">
                    <h3 className="text-white font-bold text-base">
                      {getServiceName(craft, isArabic)}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href={`/${locale}/services`}
              className="bg-[#f5bd18] text-[#1a1c1c] px-8 py-3 text-xs font-black rounded-none sticker-shadow active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              {isArabic ? "عرض جميع التخصصات" : "View All Categories"}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      <section className="py-24 bg-[#1a1c1c] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#f5bd18] mb-2">
              {isArabic ? "إعلانات مميزة" : "Featured Ads"}
            </h2>
            <div className="w-24 h-1 bg-[#f5bd18] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns.length > 0 ? (
              campaigns.slice(0, 3).map((ad) => (
                <div key={ad.id} className="bg-black border border-white/10 p-8 flex flex-col justify-between min-h-[320px] sticker-shadow hover:border-[#f5bd18] transition-all group text-start rounded-none">
                  <div>
                    <span className="bg-[#f5bd18] text-[#1a1c1c] px-3 py-1 text-[10px] font-black uppercase mb-6 inline-block rounded-none">
                      {isArabic ? ad.badgeAr || "ممول" : ad.badgeEn || "PROMOTED"}
                    </span>
                    <h3 className="text-white text-xl font-black mb-2">
                      {isArabic ? ad.titleAr : ad.titleEn}
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      {isArabic ? ad.descAr : ad.descEn}
                    </p>
                  </div>
                  {ad.btn1Link && (
                    <Link 
                      href={ad.btn1Link.startsWith("http") ? ad.btn1Link : `/${locale}${ad.btn1Link.startsWith("/") ? "" : "/"}${ad.btn1Link}`} 
                      className="mt-8 w-full bg-[#f5bd18] text-[#1a1c1c] text-center font-black py-3 hover:scale-105 transition-transform uppercase rounded-none"
                    >
                      {isArabic ? ad.btn1TextAr || "عرض التفاصيل" : ad.btn1TextEn || "View Details"}
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="md:col-span-3 border-2 border-dashed border-white/20 p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 rounded-none">
                <span className="bg-[#f5bd18] text-[#1a1c1c] px-3 py-1 text-[10px] font-black uppercase inline-block rounded-none">
                  {isArabic ? "مساحة إعلانية" : "AD SPACE"}
                </span>
                <h3 className="text-white text-2xl md:text-3xl font-black">
                  {isArabic ? "هذا المكان لإعلانك" : "Your Ad Could Be Here"}
                </h3>
                <p className="text-neutral-400 text-sm max-w-xl">
                  {isArabic
                    ? "اعرض منتجاتك أو خدماتك أمام آلاف العملاء والفنيين على أُسطفاي. تواصل معنا لحجز هذه المساحة."
                    : "Reach thousands of clients and craftsmen on Ostafy. Contact us to book this spot."}
                </p>
                <Link
                  href={`/${locale}/contact`}
                  className="mt-4 bg-[#f5bd18] text-[#1a1c1c] font-black px-8 py-3 hover:scale-105 transition-transform uppercase rounded-none"
                >
                  {isArabic ? "تواصل للإعلان معنا" : "Advertise With Us"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Pros */}
      <section className="py-24 bg-[#f9f9f9] max-md:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="mb-12 text-start border-b border-neutral-200 pb-6">
            <h2 className="text-3xl md:text-5xl text-[#1a1c1c] font-black">
              {isArabic ? "الأسطوات" : "Profs"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(workers.length > 0 ? workers.slice(0, 8) : []).slice(0, 4).map((worker, index) => {
              const defaultAvatars = [
                "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
              ];
              const avatarImg = worker.avatarUrl && !worker.avatarUrl.includes("initials") 
                ? worker.avatarUrl 
                : defaultAvatars[index % defaultAvatars.length];
              return (
              <div 
                key={worker.id}
                className="group bg-white border border-[#e2e2e2] flex flex-col transition-all hover:-translate-y-2 hover:shadow-xl rounded-none text-start overflow-hidden"
              >
                <div className="h-64 overflow-hidden relative">
                  {worker.avatarUrl ? (
                    <img src={avatarImg} alt="" className="w-full h-full object-cover transition-all duration-500" />
                  ) : (
                    <img src={avatarImg} alt="" className="w-full h-full object-cover transition-all duration-500" />
                  )}
                  <div className={cn(
                    "absolute top-4 right-4 text-white text-[10px] px-2 py-1 flex items-center gap-1 font-bold rounded-none",
                    worker.isOnline ? "bg-green-500" : "bg-gray-400"
                  )}>
                    {worker.isOnline && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                    {worker.isOnline ? (isArabic ? "متاح" : "ONLINE") : (isArabic ? "غير متاح" : "OFFLINE")}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-[#1a1c1c] truncate">{worker.name}</h4>
                      <p className="text-xs text-neutral-500 uppercase font-black tracking-tight mt-0.5">
                        {isArabic ? worker.professionAr : worker.professionEn}
                      </p>
                    </div>
                    <div className="bg-[#f5bd18] text-[#1a1c1c] px-2 py-1 text-xs font-black">
                      {worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"} ★
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-500 mb-6 font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-[#775a00]" />
                      {worker.totalJobs || 120} {isArabic ? "عملية ناجحة" : "Jobs"}
                    </span>
                    <span className="font-bold">{isArabic ? "مصر" : "Egypt"}</span>
                  </div>
                  <button 
                    onClick={() => handleBookClick(worker)}
                    className="w-full bg-[#1a1c1c] text-white font-black py-3 hover:bg-[#f5bd18] hover:text-[#1a1c1c] transition-colors uppercase rounded-none sticker-shadow"
                  >
                    {isArabic ? "اطلب الفني الآن" : "Book Pro Now"}
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href={`/${locale}/workers`}
              className="bg-[#f5bd18] text-[#1a1c1c] px-8 py-3 text-xs font-black rounded-none sticker-shadow active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              {isArabic ? "عرض جميع الأسطوات" : "View All Technicians (More) ➔"}
            </Link>
          </div>
        </div>
      </section>

      {/* How OSTA Works */}
      <section className="py-24 bg-[#1a1c1c] text-center text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#f5bd18] mb-2">
              {isArabic ? "كيف يعمل أُسطفاي" : "How OSTA Works"}
            </h2>
            <div className="h-1 w-24 bg-[#f5bd18] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 bg-black border border-white/10 flex items-center justify-center mb-8 rotate-45 group-hover:rotate-0 transition-transform duration-500 rounded-none">
                <Search className="text-[#f5bd18] h-10 w-10 -rotate-45 group-hover:rotate-0 transition-transform" />
              </div>
              <h3 className="text-white text-xl font-bold mb-4">
                1. {isArabic ? "اختر التخصص" : "Request Service"}
              </h3>
              <p className="text-neutral-400 max-w-xs font-light">
                {isArabic ? "حدد احتياجات مشروعك وأرسل إشعارًا فوريًا للفنيين المعتمدين في منطقتك." : "Define your project needs and instantly notify verified pros in your area."}
              </p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 bg-black border border-white/10 flex items-center justify-center mb-8 rotate-45 group-hover:rotate-0 transition-transform duration-500 rounded-none">
                <DollarSign className="text-[#f5bd18] h-10 w-10 -rotate-45 group-hover:rotate-0 transition-transform" />
              </div>
              <h3 className="text-white text-xl font-bold mb-4">
                2. {isArabic ? "قارن الأسعار" : "Compare Quotes"}
              </h3>
              <p className="text-neutral-400 max-w-xs font-light">
                {isArabic ? "راجع عروض الأسعار التنافسية، وقارن تقييمات الفنيين وتصفح أعمالهم السابقة." : "Review multiple competitive bids, check worker ratings, and view previous work samples."}
              </p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 bg-black border border-white/10 flex items-center justify-center mb-8 rotate-45 group-hover:rotate-0 transition-transform duration-500 rounded-none">
                <ShieldCheck className="text-[#f5bd18] h-10 w-10 -rotate-45 group-hover:rotate-0 transition-transform" />
              </div>
              <h3 className="text-white text-xl font-bold mb-4">
                3. {isArabic ? "أنجز بأمان" : "Complete Safely"}
              </h3>
              <p className="text-neutral-400 max-w-xs font-light">
                {isArabic ? "يتم تحرير الأموال للفنيين فقط بعد إتمام العمل ورضاك التام عن الجودة." : "Funds are released only when you're 100% satisfied with the craftsmanship."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 px-4 bg-[#f9f9f9] max-md:bg-transparent relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex items-start gap-6 p-8 md:border-r border-[#e2e2e2] text-start">
              <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <Shield className="h-12 w-12 text-[#f5bd18] absolute inset-0" />
                <Check className="h-5 w-5 text-[#1a1c1c] relative" strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#1a1c1c] uppercase mb-2">
                  {isArabic ? "أمان كامل" : "Full Security"}
                </h4>
                <p className="text-neutral-500 text-sm font-light">
                  {isArabic ? "دفع محمي وفنيون تم التحقق من بياناتهم لكل مهمة." : "Escrow protection and background-verified professionals for every single task."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-8 md:border-r border-[#e2e2e2] text-start">
              <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <Shield className="h-12 w-12 text-[#f5bd18] absolute inset-0" />
                <Check className="h-5 w-5 text-[#1a1c1c] relative" strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#1a1c1c] uppercase mb-2">
                  {isArabic ? "ضمان الجودة" : "Quality Guarantee"}
                </h4>
                <p className="text-neutral-500 text-sm font-light">
                  {isArabic ? "ضمان 14 يومًا يضمن تنفيذ كل خدمة بمستوى احترافي." : "Our 14-day warranty ensures every job meets premium craftsmanship standards."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-8 text-start">
              <div className="relative h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <Shield className="h-12 w-12 text-[#f5bd18] absolute inset-0" />
                <Check className="h-5 w-5 text-[#1a1c1c] relative" strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#1a1c1c] uppercase mb-2">
                  {isArabic ? "سوق الخامات" : "Materials Market"}
                </h4>
                <p className="text-neutral-500 text-sm font-light">
                  {isArabic ? "وصول مباشر للخامات وقطع الغيار بأسعار مناسبة لمستخدمي أُسطفاي." : "Direct access to raw materials and parts at wholesale prices for OSTA users."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-[#f9f9f9] max-md:bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a1c1c] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 sticker-shadow rounded-none text-white text-start">
            <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                {isArabic ? "جاهز لتجربة خدمة احترافية؟" : "Ready to Experience Professionalism?"}
              </h2>
              <p className="text-neutral-400 text-lg font-light">
                {isArabic ? "انضم إلى أُسطفاي اليوم وابدأ في طلب أفضل الفنيين أو اعرض خدماتك لآلاف العملاء." : "Join the hub today and start hiring the best tradesmen in the region or list your services to reach thousands of clients."}
              </p>
            </div>
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
              <Link 
                href={`/${locale}/register/client`} 
                className="bg-[#f5bd18] text-[#1a1c1c] font-black px-12 py-5 text-center rounded-none sticker-shadow hover:scale-105 transition-all uppercase whitespace-nowrap"
              >
                {isArabic ? "اطلب فني الآن" : "Order a Pro Now"}
              </Link>
              <Link 
                href={`/${locale}/register/worker`} 
                className="border-2 border-[#f5bd18] text-[#f5bd18] font-black px-12 py-5 text-center rounded-none hover:bg-[#f5bd18] hover:text-[#1a1c1c] transition-all uppercase whitespace-nowrap"
              >
                {isArabic ? "سجل كفني" : "List Your Service"}
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#1a1c1c] text-white p-8 rounded-none border border-white/10 shadow-2xl text-center">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <ShieldCheck className="h-16 w-16 text-[#f5bd18] mx-auto mb-6" />
            <h3 className="text-2xl font-black mb-4">
              {isArabic ? "تسجيل الدخول مطلوب" : "Login Required"}
            </h3>
            <p className="text-neutral-400 mb-8">
              {isArabic 
                ? "يجب عليك تسجيل الدخول كعميل لتتمكن من حجز فني صيانة." 
                : "You must login as a client to book a professional craftsman."}
            </p>
            <div className="flex flex-col gap-4">
              <Link 
                href={`/login?redirect=/workers/${selectedWorkerForBooking?.id}`} 
                className="w-full bg-[#f5bd18] text-[#1a1c1c] font-black py-4 uppercase rounded-none text-center block"
              >
                {isArabic ? "تسجيل الدخول" : "Login Now"}
              </Link>
              <Link 
                href="/register/client" 
                className="w-full border-2 border-white text-white font-black py-4 uppercase rounded-none text-center block"
              >
                {isArabic ? "إنشاء حساب عميل" : "Create Client Account"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Worker Auth Prompt Modal */}
      {showWorkerAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#1a1c1c] text-white p-8 rounded-none border border-white/10 shadow-2xl text-center">
            <button 
              onClick={() => setShowWorkerAuthModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <ShieldCheck className="h-16 w-16 text-[#f5bd18] mx-auto mb-6" />
            <h3 className="text-2xl font-black mb-4">
              {isArabic ? "تسجيل الدخول كفني مطلوب" : "Worker Login Required"}
            </h3>
            <p className="text-neutral-400 mb-8">
              {isArabic 
                ? "يجب عليك تسجيل الدخول كفني صيانة لتتمكن من تقديم عروض الأسعار." 
                : "You must login as a professional craftsman to view and apply for client requests."}
            </p>
            <div className="flex flex-col gap-4">
              <Link 
                href={`/login?redirect=/orders`} 
                className="w-full bg-[#f5bd18] text-[#1a1c1c] font-black py-4 uppercase rounded-none text-center block"
              >
                {isArabic ? "تسجيل الدخول كفني" : "Login as Worker"}
              </Link>
              <Link 
                href="/register/worker" 
                className="w-full border-2 border-white text-white font-black py-4 uppercase rounded-none text-center block"
              >
                {isArabic ? "تسجيل فني جديد" : "Register as Worker"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
