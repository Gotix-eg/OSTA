"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Facebook, Instagram, Send } from "lucide-react";
import type { Locale } from "@/lib/locales";

export function ContactForm({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [submitted, setSubmitted] = useState(false);

  const copy = {
    ar: {
      heroTitle: "تواصل معنا",
      heroSub: "دعم صناعي متميز لخدمات التجارة الراقية. تواصل مع خبراء أُسطفاي اليوم.",
      detailsTitle: "بيانات التواصل",
      phone: "واتساب",
      email: "البريد الإلكتروني",
      address: "العنوان",
      location: "القاهرة، مصر",
      followTitle: "تابعنا",
      formTitle: "أرسل لنا رسالة",
      nameLabel: "الاسم الكامل",
      namePlaceholder: "محمد أحمد",
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "+20 100 000 0000",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      subjectLabel: "الموضوع",
      subjectOptions: ["استفسار عام", "طلب خدمة", "شراكة موردين", "ملاحظات"],
      messageLabel: "الرسالة",
      messagePlaceholder: "اكتب تفاصيل طلبك هنا...",
      submitBtn: "إرسال الرسالة",
      successTitle: "تم الإرسال بنجاح!",
      successSub: "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
      anotherBtn: "إرسال رسالة أخرى",
      mapLabel: "ابحث عنا في القاهرة",
    },
    en: {
      heroTitle: "GET IN TOUCH",
      heroSub: "Premium industrial support for high-end trade services. Connect with the experts at OSTA today.",
      detailsTitle: "Contact Details",
      phone: "WhatsApp",
      email: "Email",
      address: "Address",
      location: "Cairo, Egypt",
      followTitle: "Follow Our Work",
      formTitle: "Send us a message",
      nameLabel: "Full Name",
      namePlaceholder: "John Doe",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+20 100 000 0000",
      emailLabel: "Email Address",
      emailPlaceholder: "john@example.com",
      subjectLabel: "Subject",
      subjectOptions: ["General Inquiry", "Service Request", "Vendor Partnership", "Feedback"],
      messageLabel: "Message",
      messagePlaceholder: "Describe your requirement...",
      submitBtn: "Send Message",
      successTitle: "Message Sent!",
      successSub: "Thanks for reaching out. We'll get back to you shortly.",
      anotherBtn: "Send another message",
      mapLabel: "Find us in Cairo",
    },
  };

  const c = copy[locale] ?? copy.en;

  const contactItems = [
    { label: c.phone, value: "+20 100 941 0112", href: "https://wa.me/201009410112", Icon: Phone },
    { label: c.email, value: "info@ostafy.com", href: "mailto:info@ostafy.com", Icon: Mail },
    { label: c.address, value: c.location, href: null, Icon: MapPin },
  ];

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      style={{ backgroundColor: "#f5bd18", minHeight: "100vh" }}
    >
      {/* ── Hero Header ── */}
      <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-6 md:px-12 md:pb-8 md:pt-10">
        <span className="mb-4 inline-flex bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
          {isArabic ? "الدعم" : "Support"}
        </span>
        <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight text-[#1a1c1c] md:text-7xl">
          {c.heroTitle}
        </h1>
        <p className="max-w-2xl text-sm font-bold leading-7 text-[#1a1c1c]/80 md:text-lg">
          {c.heroSub}
        </p>
      </div>

      {/* ── Main Grid ── */}
      <div className="mx-auto max-w-[1280px] px-4 pb-28 md:px-12 md:pb-12">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12 lg:gap-6">

          {/* ── Left: Contact Details (Dark Obsidian Card) ── */}
          <div
            className="flex flex-col justify-between p-6 md:p-14 lg:col-span-5"
            style={{ backgroundColor: "#1a1c1c", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div>
              <h2
                className="mb-6 text-2xl font-black uppercase md:mb-8 md:text-3xl"
                style={{ color: "#f5bd18" }}
              >
                {c.detailsTitle}
              </h2>

              <div className="space-y-5 md:space-y-8">
                {contactItems.map(({ label, value, href, Icon }) => {
                  const content = (
                    <div className="group flex cursor-pointer items-start gap-4 md:gap-5">
                      {/* Yellow icon box */}
                      <div
                        className="flex-shrink-0 p-3 flex items-center justify-center"
                        style={{ backgroundColor: "#f5bd18" }}
                      >
                        <Icon size={20} className="text-[#1a1c1c]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">
                          {label}
                        </p>
                        <p className="font-black text-white text-lg group-hover:text-gold transition-colors duration-200" dir="ltr">
                          {value}
                        </p>
                      </div>
                    </div>
                  );

                  return href ? (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    <div key={label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Social links */}
            <div className="mt-10">
              <p className="font-black text-xs uppercase tracking-widest text-white mb-4">
                {c.followTitle}
              </p>
              <div className="flex gap-3">
                {[
                  { href: "https://www.facebook.com/2ostafy/", Icon: Facebook },
                  { href: "https://instagram.com/osta.egypt", Icon: Instagram },
                ].map(({ href, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center text-white transition-all duration-200"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f5bd18";
                      (e.currentTarget as HTMLAnchorElement).style.color = "#1a1c1c";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Contact Form (White/Translucent) ── */}
          <div
            className="p-6 md:p-14 lg:col-span-7"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(26,28,28,0.1)",
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6">
                <div
                  className="w-20 h-20 flex items-center justify-center"
                  style={{ backgroundColor: "#1a1c1c" }}
                >
                  <Send size={32} className="text-gold" />
                </div>
                <h3 className="font-black text-[#1a1c1c] uppercase text-3xl">{c.successTitle}</h3>
                <p className="text-[#1a1c1c]/70 max-w-sm">{c.successSub}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-black uppercase text-sm px-8 py-4 transition-all duration-150"
                  style={{
                    backgroundColor: "#1a1c1c",
                    color: "#ffffff",
                    boxShadow: "4px 4px 0px #000000",
                  }}
                >
                  {c.anotherBtn}
                </button>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-2xl font-black uppercase text-[#1a1c1c] md:mb-8 md:text-3xl">
                  {c.formTitle}
                </h2>

                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  className="space-y-4 md:space-y-5"
                >
                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block font-black text-xs uppercase tracking-widest text-[#1a1c1c]/70">
                        {c.nameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={c.namePlaceholder}
                        className="h-[52px] w-full p-4 font-medium placeholder:text-[#1a1c1c]/30 transition-colors focus:outline-none"
                        style={{ backgroundColor: "#ffffff", border: "2px solid #1a1c1c" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#f5bd18")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1c1c")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-black text-xs uppercase tracking-widest text-[#1a1c1c]/70">
                        {c.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={c.phonePlaceholder}
                        dir="ltr"
                        className="h-[52px] w-full p-4 font-medium placeholder:text-[#1a1c1c]/30 transition-colors focus:outline-none"
                        style={{ backgroundColor: "#ffffff", border: "2px solid #1a1c1c" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#f5bd18")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1c1c")}
                      />
                    </div>
                  </div>

                  {/* Email + Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block font-black text-xs uppercase tracking-widest text-[#1a1c1c]/70">
                        {c.emailLabel}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={c.emailPlaceholder}
                        dir="ltr"
                        className="h-[52px] w-full p-4 font-medium placeholder:text-[#1a1c1c]/30 transition-colors focus:outline-none"
                        style={{ backgroundColor: "#ffffff", border: "2px solid #1a1c1c" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#f5bd18")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1c1c")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-black text-xs uppercase tracking-widest text-[#1a1c1c]/70">
                        {c.subjectLabel}
                      </label>
                      <select
                        className="h-[52px] w-full appearance-none p-4 font-medium transition-colors focus:outline-none"
                        style={{ backgroundColor: "#ffffff", border: "2px solid #1a1c1c" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#f5bd18")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1c1c")}
                      >
                        {c.subjectOptions.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="block font-black text-xs uppercase tracking-widest text-[#1a1c1c]/70">
                      {c.messageLabel}
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder={c.messagePlaceholder}
                      className="w-full p-4 font-medium placeholder:text-[#1a1c1c]/30 focus:outline-none resize-none transition-colors"
                      style={{ backgroundColor: "#ffffff", border: "2px solid #1a1c1c" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#f5bd18")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1c1c")}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="min-h-12 w-full px-8 text-sm font-black uppercase text-white transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 md:w-auto md:px-12"
                    style={{
                      backgroundColor: "#1a1c1c",
                      boxShadow: "4px 4px 0px #000000",
                    }}
                  >
                    {c.submitBtn}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── Map Section ── */}
        <div
          className="mt-6 overflow-hidden relative group"
          style={{
            height: "min(400px, 54vh)",
            backgroundColor: "#1a1c1c",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Overlay label */}
          <div className="absolute inset-0 bg-[#1a1c1c]/40 group-hover:bg-[#1a1c1c]/20 transition-colors z-10 flex items-center justify-center pointer-events-none">
            <div
              className="px-5 py-3 text-base font-black uppercase md:px-8 md:py-4 md:text-xl"
              style={{
                backgroundColor: "#f5bd18",
                color: "#1a1c1c",
                boxShadow: "4px 4px 0px #000000",
              }}
            >
              {c.mapLabel}
            </div>
          </div>

          {/* Map image */}
          <div
            className="w-full h-full bg-cover bg-center grayscale opacity-60 group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA0YwXLbNng_Wr44GR8VZg8-Fx3rvuDeqGUL4BTX0WuGWXDOVA_TcSa93dNwGWfslJq_WfUJ1G28wYv7KIy2Waxdz8MnqWl8UPtB6Jkbciu5IyEzklq0MAm-deQ_3rTcV2CmerFfG25M6oeoSJlYYqmc24OgUAztZy1uzt9CkQWsKPLI207G9HSaop6Lumf5lgf5r82kobW3TpQt_jT5ROeI17DRSN36ebcMa2tPaLASWDKCqBxlPKp5BdnEmzyFrjlyGtE2jLYol8')`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
