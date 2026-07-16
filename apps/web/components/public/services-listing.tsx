"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";

interface ServiceCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string;
  imageUrl?: string | null;
}

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

const serviceDescriptions: Record<string, { ar: string; en: string }> = {
  electrical: { ar: "إصلاح الدوائر الكهربائية، وتركيبات الإضاءة الذكية بوعي وأمان تام.", en: "Expert wiring, circuit repairs, and smart home installations by certified masters." },
  electricity: { ar: "إصلاح الدوائر الكهربائية، وتركيبات الإضاءة الذكية بوعي وأمان تام.", en: "Expert wiring, circuit repairs, and smart home installations by certified masters." },
  plumbing: { ar: "كشف التسريبات، وتركيب الأنابيب، وصيانة شبكات الصرف الصحي والضغط العالي.", en: "Leak detection, pipe installation, and high-pressure system maintenance." },
  carpentry: { ar: "تصنيع وتركيب الأثاث الخشبي الفاخر وأعمال النجارة المعمارية المتينة.", en: "Custom furniture, structural woodwork, and restorative craftsmanship." },
  ac: { ar: "صيانة وتركيب أجهزة التكييف والتهوية لبيئة حرارية مثالية متوازنة.", en: "Climate control solutions, maintenance, and ventilation optimization." },
  "ac-maintenance": { ar: "صيانة وتركيب أجهزة التكييف والتهوية لبيئة حرارية مثالية متوازنة.", en: "Climate control solutions, maintenance, and ventilation optimization." },
  painting: { ar: "تشطيبات دهانات وتأثيرات ديكورية ممتازة بمواد عالية الجودة والمقاومة.", en: "Premium interior and exterior finishing with high-durability coatings." },
  appliances: { ar: "إصلاح وصيانة الأجهزة المنزلية والمطابخ الذكية بمعدات فنية موثوقة.", en: "Repair and installation of modern smart appliances and industrial kitchens." }
};

export function ServicesListing({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const categories = useLiveApiData<ServiceCategory[]>("/services/categories", []);

  const [searchQuery, setSearchQuery] = useState("");
  const safeCategories = Array.isArray(categories) ? categories.filter(Boolean) : [];

  const filteredCategories = safeCategories.filter(cat => {
    const name = isArabic ? (cat.nameAr || cat.nameEn || "") : (cat.nameEn || cat.nameAr || "");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen w-full bg-[#f5bd18] px-4 pb-28 pt-6 text-[#1a1c1c] md:px-12 md:py-24">
      {/* Hero Search Section */}
      <div className="mx-auto mb-8 max-w-7xl space-y-5 text-start md:mb-16 md:space-y-8 md:text-center">
        <span className="inline-flex bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#f5bd18]">
          {isArabic ? "الخدمات" : "Services"}
        </span>
        <h1 className="font-display-lg text-4xl font-black leading-tight text-[#1a1c1c] md:text-6xl">
          {isArabic ? "ماذا يمكننا أن نفعل لك؟" : "What can we do for you?"}
        </h1>
        <p className="max-w-2xl text-base font-bold leading-7 text-[#1a1c1c]/75 md:mx-auto md:text-lg md:leading-8">
          {isArabic
            ? "اختر الخدمة المناسبة، وابحث عن فنيين موثوقين بالقرب منك."
            : "Choose the right service and find verified professionals near you."}
        </p>
        <div className="group relative mx-auto max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-4 z-25 flex items-center rtl:left-auto rtl:right-4">
            <Search className="h-5 w-5 text-[#1a1c1c] md:h-6 md:w-6" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full border-2 border-[#1a1c1c] bg-white px-12 text-sm font-black text-black placeholder:text-[#1a1c1c]/40 transition-all focus:outline-none focus:ring-0 md:h-auto md:border-4 md:py-5 md:pl-14 md:pr-24 md:text-lg"
            placeholder={isArabic ? "ابحث عن خدمة (سباكة، كهرباء، نجارة)..." : "Search for experts (e.g., Plumbing, Electrician)..."}
          />
          <button className="absolute right-2 top-1/2 h-10 -translate-y-1/2 bg-[#1a1c1c] px-4 text-xs font-black uppercase text-white transition-colors hover:bg-[#1a1c1c]/80 rtl:left-2 rtl:right-auto md:right-4 md:px-6 md:text-sm">
            {isArabic ? "ابدأ" : "GO"}
          </button>
        </div>
      </div>

      {/* Services Bento/Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {filteredCategories.map((cat) => {
          const imgUrl = cat.imageUrl || serviceImages[cat.slug] || serviceImages[cat.icon] || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop";
          const desc = serviceDescriptions[cat.slug] || serviceDescriptions[cat.icon] || { ar: "صيانة منزلية عالية الجودة وأعمال تشطيبات معتمدة.", en: "High-quality home maintenance and verified craftsmanship." };
          return (
            <div key={cat.id} className="group flex min-h-[320px] flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-black text-white md:min-h-[460px] md:p-6">
              <div>
                <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden md:mb-6 md:aspect-video">
                  <img 
                    src={imgUrl} 
                    alt="" 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />
                  {cat.slug === "electrical" && (
                    <div className="absolute top-4 left-4 bg-[#f5bd18] text-[#1a1c1c] px-3 py-1 text-xs font-black rounded-none">
                      {isArabic ? "عاجل" : "URGENT"}
                    </div>
                  )}
                  {cat.slug === "appliances" && (
                    <div className="absolute top-4 left-4 bg-white text-[#1a1c1c] px-3 py-1 text-xs font-black rounded-none">
                      {isArabic ? "مميز" : "FEATURED"}
                    </div>
                  )}
                </div>
                <div className="px-5 pb-5 md:px-0 md:pb-0">
                <h3 className="mb-2 text-2xl font-black text-white">
                  {isArabic ? cat.nameAr : cat.nameEn}
                </h3>
                <p className="mb-5 text-sm font-semibold leading-relaxed text-neutral-400 md:mb-6 md:font-light">
                  {isArabic ? desc.ar : desc.en}
                </p>
                </div>
              </div>
              <Link 
                href={`/${locale}/services/${cat.slug}`} 
                className="mx-5 mb-5 flex min-h-11 items-center gap-2 bg-[#f5bd18] px-4 text-xs font-black uppercase tracking-wider text-black transition-all group-hover:gap-4 md:mx-0 md:mb-0 md:bg-transparent md:px-0 md:text-[#f5bd18]"
              >
                {isArabic ? "استكشف الخدمة" : "EXPLORE"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* CTA Banner */}
      <div className="max-w-7xl mx-auto mt-16 bg-[#1a1c1c] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 text-white text-start rounded-none">
        <div>
          <h2 className="text-2xl font-black text-[#f5bd18] mb-2">
            {isArabic ? "هل أنت فني محترف؟" : "Are you a master technician?"}
          </h2>
          <h3 className="text-2xl font-black text-white">
            {isArabic ? "انضم إلى شبكة فنيين أُسطفاي" : "Join the OSTA craftsman network"}
          </h3>
          <p className="text-neutral-400 mt-4 text-sm font-light">
            {isArabic
              ? "وسع شغلك، واستقبل طلبات مناسبة، وابنِ سمعتك مع عملاء حقيقيين."
              : "Grow your business, receive qualified requests, and build your reputation with real clients."}
          </p>
        </div>
        <Link 
          href={`/${locale}/register/worker`} 
          className="bg-white text-[#1a1c1c] font-black px-12 py-4 sticker-shadow hover:bg-neutral-100 transition-all whitespace-nowrap text-center rounded-none"
        >
          {isArabic ? "سجل الآن" : "REGISTER NOW"}
        </Link>
      </div>
    </div>
  );
}
