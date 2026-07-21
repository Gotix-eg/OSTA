import { Scale, Fingerprint, FileCheck2, KeyRound, Share2, ShieldAlert, Mail, Clock3 } from "lucide-react";
import { publicPageCopy } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";

const sectionIcons = [Scale, Fingerprint, FileCheck2, KeyRound, Share2, ShieldAlert];

export function PrivacyPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const content = publicPageCopy[locale].pages.privacy;

  const quickFacts = [
    {
      Icon: Scale,
      label: isArabic ? "القانون الحاكم" : "Governing Law",
      value: isArabic ? "قانون رقم ١٥١ لسنة ٢٠٢٠" : "Law No. 151 of 2020"
    },
    {
      Icon: Clock3,
      label: isArabic ? "الإبلاغ عن تسريب البيانات" : "Breach Notification",
      value: isArabic ? "خلال ٧٢ ساعة" : "Within 72 hours"
    },
    {
      Icon: Mail,
      label: isArabic ? "مسؤول حماية البيانات" : "Data Protection Officer",
      value: "dpo@ostafy.com"
    }
  ];

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ backgroundColor: "#f5bd18", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section className="mx-auto flex max-w-3xl flex-col items-start px-4 py-8 text-start md:items-center md:px-12 md:py-20 md:text-center">
        <h1 className="mb-4 text-4xl font-black uppercase leading-tight tracking-tight text-[#1a1c1c] md:text-6xl">
          {content.title}
        </h1>
        <p className="max-w-2xl text-base font-semibold leading-7 text-[#1a1c1c]/80 md:text-lg">
          {content.description}
        </p>
      </section>

      {/* ── Quick facts ── */}
      <section className="mx-auto max-w-4xl px-4 pb-10 md:px-12">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          {quickFacts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-3 border-2 border-[#1a1c1c] bg-[#1a1c1c] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-[#1a1c1c]">
                <fact.Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{fact.label}</p>
                <p className="truncate text-sm font-bold text-white">{fact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── Sections ── */}
      <section className="mx-auto max-w-3xl px-4 pb-14 md:px-12 md:pb-24">
        <div className="flex flex-col gap-4 md:gap-5">
          {content.sections.map((item, index) => {
            const Icon = sectionIcons[index] ?? Scale;
            return (
              <article
                key={item.title}
                id={`privacy-section-${index + 1}`}
                className="scroll-mt-24 border-2 border-[#1a1c1c] bg-[#1a1c1c] p-5 md:p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-[#1a1c1c]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h2 className="text-base font-black text-white md:text-lg">{item.title}</h2>
                </div>
                <p className="text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── DPO contact CTA ── */}
      <section className="mx-auto max-w-3xl px-4 pb-24 md:px-12 md:pb-28">
        <div className="flex flex-col items-start gap-5 border-2 border-[#1a1c1c] bg-[#1a1c1c] p-6 text-start md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-gold text-[#1a1c1c]">
              <Mail className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white md:text-xl">
                {isArabic ? "تحتاج تمارس حقوقك في بياناتك؟" : "Need to exercise your data rights?"}
              </h2>
              <p className="text-sm font-semibold text-[#c6c6c6]">
                {isArabic ? "راسل مسؤول حماية البيانات مباشرة على dpo@ostafy.com" : "Reach our Data Protection Officer directly at dpo@ostafy.com"}
              </p>
            </div>
          </div>
          <a
            href="mailto:dpo@ostafy.com"
            className="inline-block w-full shrink-0 border-2 border-gold px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-gold transition-all duration-150 hover:bg-gold hover:text-[#1a1c1c] md:w-auto"
          >
            {isArabic ? "راسل المسؤول" : "Email the DPO"}
          </a>
        </div>
      </section>
    </div>
  );
}
