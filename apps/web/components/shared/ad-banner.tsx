"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Sparkles, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";

type AdPlacement = "HOMEPAGE" | "CLIENT_DASHBOARD" | "WORKER_DASHBOARD" | "VENDOR_DASHBOARD" | "SEARCH_TOP";

interface AdCampaign {
  id: string;
  title: string;
  imageUrl: string | null;
  targetUrl: string | null;
  type: "BANNER" | "SPONSORED_PROFILE";
}

interface AdBannerProps {
  placement: AdPlacement;
  locale: Locale;
  className?: string;
}

export function AdBanner({ placement, locale, className }: AdBannerProps) {
  const isArabic = locale === "ar";
  const ads = useLiveApiData<AdCampaign[]>(`/ads/serve?placement=${placement}`, []);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycle through ads if there are multiple
  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [ads.length]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  // Radical safety check - ensure currentAd exists before proceeding to render or logic
  if (!currentAd) return null;

  const handleAdClick = async () => {
    // Already guarded by the component-level check, but adding an extra one for logic safety
    if (!currentAd.targetUrl) return;

    // Record click asynchronously
    const apiUrl = process.env.NEXT_PUBLIC_OSTA_API_URL ?? "http://localhost:4000/api";
    try {
      fetch(`${apiUrl}/ads/${currentAd.id}/click`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to record ad click", err);
    }

    // Navigate to target URL
    window.open(currentAd.targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-dark-950/5 shadow-premium transition-all hover:shadow-2xl",
        className
      )}
    >
      <button 
        onClick={handleAdClick}
        className="relative block h-full w-full text-start outline-none"
      >
        <div className="flex flex-col md:flex-row md:items-center">
          {/* Image Area */}
          <div className="relative aspect-[21/9] w-full shrink-0 overflow-hidden md:aspect-square md:w-32 lg:w-48">
            {currentAd.imageUrl ? (
              <Image
                src={currentAd.imageUrl}
                alt={currentAd.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                <Megaphone className="h-8 w-8 text-primary-600/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col justify-center p-6 lg:p-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sun-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sun-700">
                <Sparkles className="h-2.5 w-2.5" />
                {isArabic ? "ممول" : "Sponsored"}
              </span>
              {ads.length > 1 && (
                <span className="text-[10px] text-onyx-500">
                  {currentIndex + 1} / {ads.length}
                </span>
              )}
            </div>
            
            <h3 className="mt-3 text-xl font-bold text-white line-clamp-2 md:text-2xl">
              {currentAd.title}
            </h3>
            
            <div className="mt-4 flex items-center gap-2 font-semibold text-primary-700 transition-colors group-hover:text-primary-800">
              <span className="text-sm">{isArabic ? "اكتشف المزيد" : "Learn more"}</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </div>
          </div>
        </div>
      </button>

      {/* Progress dots for multiple ads */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 end-6 flex gap-1.5">
          {ads.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === currentIndex ? "w-6 bg-primary-600" : "w-1.5 bg-dark-200"
              )} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
