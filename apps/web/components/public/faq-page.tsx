"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageCircle } from "lucide-react";
import { publicPageCopy } from "@/lib/public-pages-copy";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

export function FaqPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const content = publicPageCopy[locale].pages.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div dir={isArabic ? "rtl" : "ltr"} style={{ backgroundColor: "#f5bd18", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section className="mx-auto flex max-w-3xl flex-col items-start px-4 py-8 text-start md:items-center md:px-12 md:py-20 md:text-center">
        <span className="mb-4 inline-flex border-2 border-[#1a1c1c] bg-[#1a1c1c] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-gold">
          {content.eyebrow}
        </span>
        <h1 className="mb-4 text-4xl font-black uppercase leading-tight tracking-tight text-[#1a1c1c] md:text-6xl">
          {content.title}
        </h1>
        <p className="max-w-xl text-base font-semibold leading-7 text-[#1a1c1c]/80 md:text-lg">
          {content.description}
        </p>
      </section>

      {/* ── Accordion ── */}
      <section className="mx-auto max-w-3xl px-4 pb-14 md:px-12 md:pb-24">
        <div className="flex flex-col gap-3 md:gap-4">
          {content.sections.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.title} className="border-2 border-[#1a1c1c] bg-[#1a1c1c]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-start md:px-6"
                >
                  <span className="text-base font-black text-white md:text-lg">
                    {item.title}
                  </span>
                  <Plus
                    className={cn(
                      "h-5 w-5 shrink-0 text-gold transition-transform duration-300",
                      isOpen && "rotate-45"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-white/10 px-5 py-4 text-sm font-semibold leading-7 text-[#c6c6c6] md:px-6 md:text-base">
                        {item.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Still have questions CTA ── */}
      <section className="mx-auto max-w-3xl px-4 pb-24 md:px-12 md:pb-28">
        <div className="flex flex-col items-start gap-5 border-2 border-[#1a1c1c] bg-[#1a1c1c] p-6 text-start md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-gold text-[#1a1c1c]">
              <MessageCircle className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white md:text-xl">
                {isArabic ? "لسه عندك سؤال؟" : "Still have questions?"}
              </h2>
              <p className="text-sm font-semibold text-[#c6c6c6]">
                {isArabic ? "فريق الدعم جاهز يساعدك في أي وقت." : "Our support team is ready to help you out."}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="inline-block w-full shrink-0 border-2 border-gold px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-gold transition-all duration-150 hover:bg-gold hover:text-[#1a1c1c] md:w-auto"
          >
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </Link>
        </div>
      </section>
    </div>
  );
}
