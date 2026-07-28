"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  X,
  ShieldCheck,
  Loader2,
  Briefcase,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  CheckCircle2,
  FileText,
  Camera,
  User,
  Tag,
  Share2,
  Check,
  Play,
  ChevronDown,
  PhoneCall
} from "lucide-react";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { resolveApiBaseUrl } from "@/lib/api";
import { getBrowserAuthState } from "@/lib/auth-client";

interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface CertificateItem {
  id: string;
  title: string;
  year: string | null;
  imageUrl: string;
}

interface ServiceItem {
  id: string;
  name: string;
  price: string;
  note: string | null;
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
  yearsOfExperience: number;
  education: string[];
  achievements: string[];
  galleryImages: string[];
  galleryVideoUrl: string | null;
  contractInfo: string | null;
  certificates: CertificateItem[];
  serviceItems: ServiceItem[];
  joinedAt: string;
  reviews: ReviewItem[];
}

export function WorkerProfileDetail({ locale, workerId }: { locale: Locale; workerId: string }) {
  const isArabic = locale === "ar";
  const [worker, setWorker] = useState<WorkerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active section tracking for sticky sidebar navigation
  const [activeSection, setActiveSection] = useState<string>("about");

  // Expanded toggles for long sections
  const [showAllServices, setShowAllServices] = useState(false);

  // Share Toast
  const [copySuccess, setCopySuccess] = useState(false);

  // Lightbox Modal for gallery images
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Direct Booking States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showBookingAuthModal, setShowBookingAuthModal] = useState(false);

  useEffect(() => {
    getBrowserAuthState().then(({ isLoggedIn, role }) => {
      setIsLoggedIn(isLoggedIn);
      setIsClient(role === "CLIENT");
    });
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

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };



  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gold py-32 md:-mx-12 md:-my-12">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-ink" />
        <p className="text-sm font-bold text-ink">{isArabic ? "جاري تحميل الملف الشخصي للفني..." : "Loading technician profile..."}</p>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gold px-4 py-32 text-center md:-mx-12 md:-my-12">
        <div className="max-w-md border-2 border-ink bg-ink p-8 font-bold text-white">
          {error || (isArabic ? "لم يتم العثور على الفني" : "Technician not found")}
        </div>
        <Link href={`/${locale}/workers`} className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase text-ink hover:underline">
          {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {isArabic ? "العودة لدليل الفنيين" : "Back to Technicians"}
        </Link>
      </div>
    );
  }

  // Only render sections the worker has actually filled in
  const hasBio = Boolean(worker.bio && worker.bio.trim());
  const hasAreas = worker.areas.length > 0;
  const hasEducation = worker.education.length > 0;
  const hasExperience = worker.yearsOfExperience > 0 || worker.totalJobs > 0;
  const hasAchievements = worker.achievements.length > 0;
  const hasContract = Boolean(worker.contractInfo && worker.contractInfo.trim());
  const hasGalleryPhotos = worker.galleryImages.length > 0;
  const hasGalleryVideo = Boolean(worker.galleryVideoUrl && worker.galleryVideoUrl.trim());
  const hasMedia = hasGalleryPhotos || hasGalleryVideo;
  const hasDocuments = worker.certificates.length > 0;
  const hasServices = worker.serviceItems.length > 0;

  const displayedServices = showAllServices ? worker.serviceItems : worker.serviceItems.slice(0, 5);

  const navMenuItems = [
    { id: "about", label: isArabic ? "عن الفني" : "About", icon: User },
    hasMedia ? { id: "media", label: isArabic ? "الصور والفيديوهات" : "Photos & Video", icon: Camera } : null,
    hasDocuments ? { id: "documents", label: isArabic ? "الشهادات والوثائق" : "Documents", icon: FileText } : null,
    hasServices ? { id: "prices", label: isArabic ? "الخدمات والأسعار" : "Pricing", icon: Tag } : null,
    { id: "reviews", label: isArabic ? "التقييمات" : "Reviews", icon: Star, badge: worker.reviews.length || undefined }
  ].filter((item): item is { id: string; label: string; icon: typeof User; badge?: number } => item !== null);

  return (
    <div className="min-h-screen bg-gold pb-16 font-sans text-ink antialiased md:-mx-12 md:-my-12 md:pb-24">

      {/* Toast Notification */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border-2 border-gold bg-ink px-4 py-3 text-xs font-bold text-white shadow-xl">
          <Check className="h-4 w-4 text-gold" />
          <span>{isArabic ? "تم نسخ رابط الصفحة بنجاح!" : "Link copied to clipboard!"}</span>
        </div>
      )}

      {/* Black Hero Header */}
      <section className="relative overflow-hidden border-b-4 border-black bg-black px-4 py-8 text-white md:px-12 md:py-14">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/${locale}/workers`}
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gold hover:text-white"
          >
            {isArabic ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
            {isArabic ? "الأسطوات" : "Workers"}
          </Link>

          <div className="flex flex-col items-start gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 overflow-hidden border-2 border-white/15 bg-neutral-800 sm:h-36 sm:w-36">
                {worker.avatarUrl ? (
                  <img src={worker.avatarUrl} alt={worker.name} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white/40">
                    {worker.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -end-2 flex items-center gap-1 border-2 border-black bg-gold px-2 py-0.5 text-xs font-black text-ink shadow-md" title={isArabic ? "الهوية موثقة" : "Identity Verified"}>
                <ShieldCheck className="h-4 w-4 shrink-0 text-ink" strokeWidth={2.5} />
                <span className="text-[10px] uppercase tracking-wider">{isArabic ? "موثق" : "Verified"}</span>
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black uppercase leading-tight tracking-tight text-gold sm:text-4xl">
                    {worker.name}
                  </h1>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center p-1 text-gold transition-all hover:scale-110 hover:text-white active:scale-95"
                    title={isArabic ? "نسخ رابط الملف الشخصي" : "Copy profile link"}
                    aria-label={isArabic ? "نسخ رابط الملف الشخصي" : "Copy profile link"}
                  >
                    <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs font-bold text-white/60">
                  <span className={cn("inline-block h-2 w-2 rounded-full", worker.isOnline ? "bg-green-500" : "bg-white/30")} />
                  <span>{worker.isOnline ? (isArabic ? "متصل الآن" : "Online now") : (isArabic ? "غير متصل" : "Offline")}</span>
                </p>
              </div>

              {/* Rating & Reviews Line */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 bg-gold px-3 py-1 font-black text-ink">
                  <Star className="h-4 w-4 fill-current" />
                  {worker.rating > 0 ? worker.rating.toFixed(2) : (isArabic ? "جديد" : "New")}
                </span>

                <button
                  onClick={() => scrollToSection("reviews")}
                  className="flex items-center gap-1.5 font-bold text-white/70 underline decoration-white/30 underline-offset-4 hover:text-gold"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{worker.reviews.length} {isArabic ? "تقييم" : "reviews"}</span>
                </button>

                {worker.rating >= 4.5 && worker.reviews.length >= 5 && (
                  <span className="inline-flex items-center gap-1 border border-gold px-2.5 py-1 text-xs font-black uppercase tracking-wide text-gold">
                    <Sparkles className="h-3 w-3 fill-current" />
                    {isArabic ? "محل إشادة كبيرة" : "Highly praised"}
                  </span>
                )}
              </div>

              {/* Verification Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                  {isArabic ? "الهوية موثقة" : "Identity verified"}
                </span>
                {hasContract && (
                  <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                    {isArabic ? "عقد وضمان متاح" : "Contract & warranty available"}
                  </span>
                )}
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Body: Sidebar Nav + Content */}
      <section className="mx-auto max-w-5xl px-4 py-8 md:px-12 md:py-12">
        <div className="flex flex-col items-start gap-6 lg:flex-row">

          {/* Sticky Nav */}
          <aside className="z-10 w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
            <nav className="flex gap-1 overflow-x-auto border-2 border-ink bg-ink p-2 lg:flex-col lg:overflow-visible">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "flex shrink-0 items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wide transition-colors lg:w-full",
                      isActive ? "bg-gold text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span className={cn("text-[10px] font-black", isActive ? "text-ink/60" : "text-white/40")}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="w-full min-w-0 flex-1 space-y-4">

            {/* ── About: coverage, bio, education, experience, achievements, verified, contract ── */}
            <div id="about" className="scroll-mt-28 space-y-4">

              {hasAreas && (
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <MapPin className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "مناطق التغطية" : "Coverage Area"}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                    {worker.areas.map((area, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5">
                        <span>{area}</span>
                        {idx < worker.areas.length - 1 && <span className="text-white/30">•</span>}
                      </span>
                    ))}
                  </div>
                </article>
              )}

              {hasBio && (
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <User className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "نبذة عن الفني" : "About"}
                    </h2>
                  </div>
                  <p className="whitespace-pre-line text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                    {worker.bio}
                  </p>
                </article>
              )}

              {hasEducation && (
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <Award className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "الشهادات والتدريب" : "Education & Certifications"}
                    </h2>
                  </div>
                  <ul className="space-y-2.5 text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                    {worker.education.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )}

              {hasExperience && (
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <Briefcase className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "الخبرة الميدانية" : "Experience"}
                    </h2>
                  </div>
                  <ul className="space-y-2.5 text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                    {worker.yearsOfExperience > 0 && (
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-gold" />
                        <span>
                          {isArabic
                            ? `خبرة عمل بالمجال • ${worker.yearsOfExperience} سنوات`
                            : `Field experience • ${worker.yearsOfExperience} year${worker.yearsOfExperience === 1 ? "" : "s"}`}
                        </span>
                      </li>
                    )}
                    {worker.totalJobs > 0 && (
                      <li className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-gold" />
                        <span>
                          {isArabic
                            ? `${worker.totalJobs} مهمة منفذة عبر المنصة`
                            : `${worker.totalJobs} jobs completed on the platform`}
                        </span>
                      </li>
                    )}
                  </ul>
                </article>
              )}

              {hasAchievements && (
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <Sparkles className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "الإنجازات والجوائز" : "Achievements"}
                    </h2>
                  </div>
                  <ul className="space-y-2.5 text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                    {worker.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )}


              {hasContract && (
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <Calendar className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "العقد والضمان" : "Contract & Warranty"}
                    </h2>
                  </div>
                  <p className="whitespace-pre-line text-sm font-semibold leading-7 text-[#c6c6c6] md:text-base">
                    {worker.contractInfo}
                  </p>
                </article>
              )}
            </div>

            {/* ── Gallery: Photos & Videos ── */}
            {hasMedia && (
              <div id="media" className="scroll-mt-28 space-y-4">
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  {hasGalleryPhotos && (
                    <>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                          <Camera className="h-5 w-5" strokeWidth={2} />
                        </span>
                        <h2 className="flex items-center gap-2 text-base font-black uppercase text-white md:text-lg">
                          <span>{isArabic ? "معرض الأعمال" : "Photos"}</span>
                          <span className="text-xs font-bold text-white/40">({worker.galleryImages.length})</span>
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {worker.galleryImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveLightboxImage(imgUrl)}
                            className="group relative aspect-4/3 cursor-pointer overflow-hidden border border-white/10 bg-black focus:outline-none"
                          >
                            <img
                              src={imgUrl}
                              alt={`Portfolio image ${idx + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-gold opacity-0 transition-opacity group-hover:opacity-100">
                              <Camera className="h-6 w-6" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {hasGalleryVideo && (
                    <div className={cn("space-y-3", hasGalleryPhotos && "pt-6")}>
                      <h3 className="text-sm font-black uppercase text-white">
                        {isArabic ? "فيديو التوثيق" : "Video"}
                      </h3>
                      <a
                        href={worker.galleryVideoUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex aspect-video max-w-sm items-center justify-center overflow-hidden border border-white/10 bg-black"
                      >
                        <div className="flex h-12 w-12 items-center justify-center bg-gold text-ink shadow-lg transition-transform group-hover:scale-110">
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        </div>
                      </a>
                    </div>
                  )}
                </article>
              </div>
            )}

            {/* ── Documents & Certificates ── */}
            {hasDocuments && (
              <div id="documents" className="scroll-mt-28 space-y-4">
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <FileText className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="flex items-center gap-2 text-base font-black uppercase text-white md:text-lg">
                      <span>{isArabic ? "الشهادات والتراخيص الرسمية" : "Documents & Certificates"}</span>
                      <span className="text-xs font-bold text-white/40">({worker.certificates.length})</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {worker.certificates.map((cert) => (
                      <button
                        key={cert.id}
                        onClick={() => setActiveLightboxImage(cert.imageUrl)}
                        className="space-y-2 border border-white/10 bg-black/30 p-3 text-start"
                      >
                        <div className="aspect-4/3 overflow-hidden border border-white/10 bg-black">
                          <img src={cert.imageUrl} alt={cert.title} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="line-clamp-1 text-xs font-black text-white">{cert.title}</h4>
                          {cert.year && <p className="text-[11px] font-bold text-white/40">{cert.year}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </article>
              </div>
            )}

            {/* ── Services & Pricing ── */}
            {hasServices && (
              <div id="prices" className="scroll-mt-28 space-y-4">
                <article className="border-2 border-ink bg-ink p-5 md:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <Tag className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <h2 className="text-base font-black uppercase text-white md:text-lg">
                      {isArabic ? "قائمة الخدمات والأسعار" : "Services & Pricing"}
                    </h2>
                  </div>

                  <div className="space-y-1">
                    {displayedServices.map((service) => (
                      <div key={service.id} className="flex flex-col justify-between gap-1 border-b border-dashed border-white/10 py-3 sm:flex-row sm:items-baseline">
                        <div className="space-y-0.5">
                          <span className="block text-sm font-black text-white">{service.name}</span>
                          {service.note && <span className="block text-xs font-semibold text-white/40">{service.note}</span>}
                        </div>
                        <div className="shrink-0 text-sm font-black text-gold">
                          {/^\d+(\.\d+)?$/.test(service.price.trim()) ? `${service.price.trim()} ${isArabic ? "ج.م" : "EGP"}` : service.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {worker.serviceItems.length > 5 && (
                    <button
                      onClick={() => setShowAllServices(!showAllServices)}
                      className="mt-4 flex items-center gap-1 text-xs font-black uppercase tracking-wide text-gold hover:underline"
                    >
                      <span>{showAllServices ? (isArabic ? "عرض أقل" : "Show less") : (isArabic ? `جميع الخدمات والأسعار (${worker.serviceItems.length})` : `View all services (${worker.serviceItems.length})`)}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAllServices && "rotate-180")} />
                    </button>
                  )}
                </article>
              </div>
            )}

            {/* ── Reviews ── */}
            <div id="reviews" className="scroll-mt-28 space-y-4">
              <article className="border-2 border-ink bg-ink p-5 md:p-7">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-gold text-ink">
                      <Star className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div>
                      <h2 className="text-base font-black uppercase text-white md:text-lg">
                        {isArabic ? "آراء وتقييمات العملاء" : "Reviews"}
                      </h2>
                      <p className="text-xs font-semibold text-white/40">
                        {isArabic ? "مراجعات حقيقية من عملاء سابقين" : "Based on real client orders"}
                      </p>
                    </div>
                  </div>

                  {worker.reviews.length > 0 && (
                    <div className="flex items-center gap-3 border border-gold/40 bg-gold/10 px-4 py-2">
                      <span className="text-2xl font-black text-gold">
                        {worker.rating.toFixed(2)}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-0.5 text-gold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-white/40">
                          {worker.reviews.length} {isArabic ? "تقييم" : "reviews"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                {worker.reviews.length === 0 ? (
                  <div className="border border-dashed border-white/15 py-10 text-center">
                    <Star className="mx-auto mb-2 h-8 w-8 text-white/20" />
                    <p className="text-sm font-bold text-white/70">
                      {isArabic ? "لا توجد تقييمات مسجلة بعد لهذا الفني." : "No reviews yet for this technician."}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/40">
                      {isArabic ? "كن أول من يقيّم عمل الفني!" : "Be the first to leave a review!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 divide-y divide-white/10">
                    {worker.reviews.map((review) => (
                      <div key={review.id} className="space-y-2 pt-6 first:pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center bg-white/10 text-xs font-black text-white">
                              {review.authorAvatar ? (
                                <img src={review.authorAvatar} alt={review.authorName} className="h-full w-full object-cover" />
                              ) : (
                                review.authorName.charAt(0)
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white">{review.authorName}</h4>
                              <span className="text-[11px] font-semibold text-white/40">
                                {new Date(review.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-gold">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-current" : "text-white/15")} />
                            ))}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="pt-1 text-sm font-semibold leading-relaxed text-[#c6c6c6]">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>

          </main>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute right-4 top-4 p-2 text-white hover:text-gold"
          >
            <X className="h-8 w-8" />
          </button>
          <img src={activeLightboxImage} alt="Expanded preview" className="max-h-[85vh] max-w-full border border-white/10 object-contain shadow-2xl" />
        </div>
      )}

      {/* Booking Auth Prompt Modal */}
      {showBookingAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md border border-white/10 bg-[#1a1c1c] p-8 text-white shadow-2xl">
            <button
              onClick={() => setShowBookingAuthModal(false)}
              className="absolute right-4 top-4 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <ShieldCheck className="mx-auto mb-6 h-14 w-14 text-gold" />

              <h3 className="mb-4 text-xl font-black uppercase">
                {isArabic ? "طلب حجز مباشر مع الفني" : "Contact the Specialist"}
              </h3>

              <p className="mb-8 text-xs font-semibold leading-relaxed text-white/60">
                {isArabic
                  ? `لإرسال تفاصيل المهمة وتأكيد الطلب مع الفني ${worker.name}، يرجى تسجيل الدخول كعميل.`
                  : `To send job details and confirm your request with ${worker.name}, please sign in as a client.`}
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login?redirect=${encodeURIComponent(
                    `/${locale}/client/new-request?workerId=${worker.id}&categoryId=${worker.categoryId}&serviceId=${worker.serviceId}`
                  )}`}
                  className="w-full bg-gold py-3 text-center text-sm font-black uppercase tracking-wide text-ink shadow-lg"
                >
                  {isArabic ? "تسجيل الدخول كعميل" : "Login as Client"}
                </Link>
                <Link
                  href={`/${locale}/register/client?redirect=${encodeURIComponent(
                    `/${locale}/client/new-request?workerId=${worker.id}&categoryId=${worker.categoryId}&serviceId=${worker.serviceId}`
                  )}`}
                  className="w-full border-2 border-white py-3 text-center text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-white hover:text-ink"
                >
                  {isArabic ? "إنشاء حساب عميل جديد" : "Register as Client"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
