"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store, Star, MapPin, Package, Search,
  ChevronRight, ChevronLeft, Navigation, Loader2, WifiOff
} from "lucide-react";
import { fetchApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import {
  ClientStitchBadge,
  ClientStitchEmpty,
  ClientStitchHero,
  ClientStitchMetric
} from "@/components/client/client-stitch-ui";

type VendorStore = {
  id: string;
  shopName: string;
  shopNameAr: string | null;
  category: string | null;
  shopDescription: string | null;
  shopImageUrl: string | null;
  governorate: string;
  city: string;
  rating: number;
  ratingCount: number;
  totalOrders: number;
  isOpen: boolean;
  latitude: number | null;
  longitude: number | null;
  user: { firstName: string; lastName: string };
  _count: { products: number };
  _distanceKm?: number;
};

/** Haversine distance in km */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number, locale: Locale): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return locale === "ar" ? `${m} م` : `${m} m`;
  }
  return locale === "ar" ? `${km.toFixed(1)} كم` : `${km.toFixed(1)} km`;
}

function formatCount(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function StoreCard({
  store, locale, href,
}: {
  store: VendorStore; locale: Locale; href: string;
}) {
  const isArabic = locale === "ar";
  const name = isArabic && store.shopNameAr ? store.shopNameAr : store.shopName;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden border border-white/10 bg-black text-white shadow-[5px_5px_0_#1a1c1c] transition hover:-translate-y-1"
    >
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-[#121212]">
        {store.shopImageUrl ? (
          <img src={store.shopImageUrl} alt={name} className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store className="h-14 w-14 text-gold" />
          </div>
        )}
        {/* Open/Closed badge */}
        <span className={cn(
          "absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
          store.isOpen ? "bg-gold text-black" : "bg-black/80 text-white"
        )}>
          {store.isOpen ? (isArabic ? "مفتوح" : "Open") : (isArabic ? "مغلق" : "Closed")}
        </span>
        {/* Distance badge */}
        {store._distanceKm !== undefined && (
          <span className="absolute start-3 top-3 flex items-center gap-1 bg-black/80 px-2.5 py-1 text-xs font-black text-gold">
            <Navigation className="h-3 w-3" />
            {formatDistance(store._distanceKm, locale)}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black uppercase text-white">{name}</h2>
            {store.category && (
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-gold">{store.category}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-black text-gold">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {store.rating > 0 ? store.rating.toFixed(1) : "—"}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white/50">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {store.city || store.governorate}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            {isArabic ? `${store._count.products} منتج` : `${store._count.products} products`}
          </span>
        </div>

        {store.shopDescription && (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/55">{store.shopDescription}</p>
        )}

        <div className="mt-5 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-gold">
          {isArabic ? "تصفح المنتجات" : "Browse Products"}
          {isArabic ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>
    </Link>
  );
}

export function ClientStoresPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [stores, setStores] = useState<VendorStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch stores on mount
  useEffect(() => {
    fetchApiData<VendorStore[]>("/vendors/stores", []).then(data => {
      setStores(data);
      setLoading(false);
    });
    // Auto-request location silently
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { /* silent fail */ },
        { timeout: 5000 }
      );
    }
  }, []);

  // Manually request location
  function requestLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError(true);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  // Enrich stores with distance if we have location
  const enriched: VendorStore[] = stores.map(s => {
    if (userPos && s.latitude != null && s.longitude != null) {
      return { ...s, _distanceKm: haversine(userPos.lat, userPos.lng, s.latitude, s.longitude) };
    }
    return s;
  });

  // Sort by distance (if available), then open first, then rating
  const sorted = [...enriched].sort((a, b) => {
    if (a._distanceKm !== undefined && b._distanceKm !== undefined) {
      return a._distanceKm - b._distanceKm;
    }
    if (a._distanceKm !== undefined) return -1;
    if (b._distanceKm !== undefined) return 1;
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
    return b.rating - a.rating;
  });

  const filtered = sorted.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (s.shopNameAr || s.shopName).toLowerCase();
    return name.includes(q) || (s.category || "").toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <ClientStitchHero
        locale={locale}
        eyebrow={isArabic ? "سوق الموردين" : "Vendor market"}
        title={isArabic ? "المتاجر" : "STORES"}
        subtitle={
          isArabic
            ? "ابحث عن متاجر الخامات وقطع الغيار القريبة، وقارن التقييم والتوفر قبل الطلب."
            : "Find nearby material and parts vendors, then compare rating, stock, and availability before ordering."
        }
        icon={Store}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ClientStitchMetric label={isArabic ? "المتاجر" : "Stores"} value={formatCount(locale, filtered.length)} note={isArabic ? "نتائج ظاهرة" : "visible results"} icon={Store} />
        <ClientStitchMetric label={isArabic ? "المفتوحة الآن" : "Open now"} value={formatCount(locale, stores.filter((s) => s.isOpen).length)} note={isArabic ? "جاهزة للطلب" : "ready for orders"} icon={Package} />
        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          className={cn(
            "flex min-h-[5.6rem] items-center justify-center gap-2 border px-4 py-3 text-sm font-black uppercase tracking-wider shadow-[4px_4px_0_#1a1c1c] transition",
            userPos
              ? "border-emerald-700/30 bg-emerald-100 text-emerald-800"
              : "border-black/10 bg-white text-black hover:bg-gold"
          )}
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          {locating
            ? (isArabic ? "جاري تحديد موقعك..." : "Locating...")
            : userPos
              ? (isArabic ? "تم تحديد موقعك ✓" : "Location set ✓")
              : (isArabic ? "رتب حسب القرب" : "Sort by distance")}
        </button>
      </div>

      {locError && (
        <div className="flex items-center gap-2 border border-red-500/30 bg-black px-4 py-3 text-sm font-semibold text-red-300">
          <WifiOff className="h-4 w-4 shrink-0" />
          {isArabic
            ? "لم يتم السماح بالوصول للموقع. تأكد من إذن المتصفح."
            : "Location access denied. Please allow it in your browser."}
        </div>
      )}

      {/* Search bar */}
      <div className="relative border border-black/10 bg-black p-2 shadow-[4px_4px_0_#1a1c1c]">
        <Search className="absolute start-6 top-1/2 h-5 w-5 -translate-y-1/2 text-gold" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isArabic ? "ابحث باسم المتجر أو التصنيف أو المنطقة..." : "Search by store name, category or area..."}
          className="h-14 w-full border border-white/10 bg-[#121212] ps-12 pe-4 text-sm font-bold text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          isArabic ? "كل المتاجر" : "All stores",
          isArabic ? "كهرباء" : "Electrical",
          isArabic ? "سباكة" : "Plumbing",
          isArabic ? "تشطيبات" : "Finishing"
        ].map((label, index) => (
          <button key={label} className={index === 0 ? "bg-black px-4 py-2 text-xs font-black uppercase text-gold" : "border border-black/10 bg-white/60 px-4 py-2 text-xs font-black uppercase text-black"}>
            {label}
          </button>
        ))}
      </div>

      {/* Stores grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 animate-pulse border border-white/10 bg-black" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <ClientStitchEmpty>
          <Store className="mx-auto mb-4 h-12 w-12 text-gold" />
          <p className="text-lg font-black text-white">
            {stores.length === 0
              ? (isArabic ? "لا توجد متاجر بعد" : "No stores yet")
              : (isArabic ? "لا توجد نتائج للبحث" : "No results found")}
          </p>
        </ClientStitchEmpty>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              locale={locale}
              href={`/${locale}/client/stores/${store.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
