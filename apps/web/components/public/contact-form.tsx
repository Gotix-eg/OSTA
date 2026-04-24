"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/locales";

export function ContactForm({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="animate-fadeIn grid lg:grid-cols-3 gap-12 pb-20">
      {/* ── Contact Info ── */}
      <div className="space-y-6">
        <div className="onyx-card p-10 border-gold-500/10 relative overflow-hidden h-full flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-20 w-20 text-gold-500" /></div>
           
           <div className="space-y-8 relative z-10">
              <span className="inline-flex rounded-full bg-gold-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 border border-gold-500/20">
                {isArabic ? "تواصل معنا" : "Get in Touch"}
              </span>
              <h2 className="text-4xl font-black text-white leading-tight">
                {isArabic ? "نحن هنا لمساعدتك دائماً" : "We're Always Here to Help"}
              </h2>
              <p className="text-onyx-400 leading-relaxed">
                {isArabic 
                  ? "لديك استفسار؟ شكوى؟ أو اقتراح؟ فريق الدعم متاح على مدار الساعة للإجابة عليك." 
                  : "Have a question, complaint, or suggestion? Our support team is available 24/7 to assist you."}
              </p>
           </div>

           <div className="space-y-6 mt-12 relative z-10">
              <div className="flex items-center gap-4 group">
                 <div className="h-12 w-12 rounded-xl bg-onyx-900 border border-onyx-700 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-onyx-950 transition-all duration-500 shadow-gold/5 group-hover:shadow-gold/20">
                    <Phone className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-xs text-onyx-500 font-bold uppercase tracking-widest">{isArabic ? "اتصل بنا" : "Call Us"}</p>
                    <p className="text-white font-bold tracking-wider">+20 100 000 0000</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="h-12 w-12 rounded-xl bg-onyx-900 border border-onyx-700 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-onyx-950 transition-all duration-500 shadow-gold/5 group-hover:shadow-gold/20">
                    <Mail className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-xs text-onyx-500 font-bold uppercase tracking-widest">{isArabic ? "راسلنا" : "Email Us"}</p>
                    <p className="text-white font-bold tracking-wider">support@osta.eg</p>
                 </div>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="h-12 w-12 rounded-xl bg-onyx-900 border border-onyx-700 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-onyx-950 transition-all duration-500 shadow-gold/5 group-hover:shadow-gold/20">
                    <MapPin className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-xs text-onyx-500 font-bold uppercase tracking-widest">{isArabic ? "مقرنا" : "Location"}</p>
                    <p className="text-white font-bold tracking-wider">{isArabic ? "القاهرة، مصر" : "Cairo, Egypt"}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── Contact Form ── */}
      <div className="lg:col-span-2">
        <div className="onyx-card p-10 border-gold-500/10">
          {submitted ? (
            <div className="text-center py-20 space-y-6">
              <div className="h-20 w-20 bg-success/10 border border-success/30 rounded-full flex items-center justify-center mx-auto">
                 <Send className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-3xl font-black text-white">{isArabic ? "تم الإرسال بنجاح!" : "Message Sent!"}</h3>
              <p className="text-onyx-400">{isArabic ? "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن." : "Thanks for reaching out. We'll get back to you shortly."}</p>
              <button onClick={() => setSubmitted(false)} className="btn-onyx">{isArabic ? "إرسال رسالة أخرى" : "Send another message"}</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "الاسم الكامل" : "Full Name"}</span>
                  <input type="text" required className="h-14 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 text-white transition-all focus:border-gold-500/50 outline-none" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "رقم الهاتف" : "Phone Number"}</span>
                  <input type="tel" required className="h-14 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 text-white transition-all focus:border-gold-500/50 outline-none" />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "البريد الإلكتروني" : "Email Address"}</span>
                <input type="email" required className="h-14 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 text-white transition-all focus:border-gold-500/50 outline-none" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "الموضوع" : "Subject"}</span>
                <input type="text" required className="h-14 w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 text-white transition-all focus:border-gold-500/50 outline-none" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-onyx-300 tracking-wide">{isArabic ? "رسالتك" : "Your Message"}</span>
                <textarea required rows={5} className="w-full rounded-2xl border border-onyx-700 bg-onyx-800/50 px-5 py-4 text-white transition-all focus:border-gold-500/50 outline-none resize-none" />
              </label>

              <button type="submit" className="btn-gold w-full h-16 text-lg flex items-center justify-center gap-3">
                {isArabic ? "إرسال الرسالة" : "Send Message"}
                <MessageSquare className="h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
