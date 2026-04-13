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
      className="group relative overflow-hidden rounded-[1.8rem] border border-dark-200/70 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-md"
    >
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary-50 to-surface-peach">
        {store.shopImageUrl ? (
          <img src={store.shopImageUrl} alt={name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store className="h-14 w-14 text-primary-300" />
          </div>
        )}
        {/* Open/Closed badge */}
        <span className={cn(
          "absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
          store.isOpen ? "bg-success/90 text-white" : "bg-dark-400/80 text-white"
        )}>
          {store.isOpen ? (isArabic ? "مفتوح" : "Open") : (isArabic ? "مغلق" : "Closed")}
        </span>
        {/* Distance badge */}
        {store._distanceKm !== undefined && (
          <span className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary-700 shadow">
            <Navigation className="h-3 w-3" />
            {formatDistance(store._distanceKm, locale)}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-dark-950">{name}</h2>
            {store.category && (
              <p className="mt-0.5 text-sm text-primary-700 font-medium">{store.category}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-dark-700">
            <Star className="h-4 w-4 fill-sun-400 text-sun-400" />
            {store.rating > 0 ? store.rating.toFixed(1) : "—"}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-dark-500">
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
          <p className="mt-3 line-clamp-2 text-sm text-dark-500">{store.shopDescription}</p>
        )}

        <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
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
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-700">
            {isArabic ? "استعرض المتاجر" : "Browse Stores"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark-950">
            {isArabic ? "متاجر قطع الغيار" : "Parts Vendor Stores"}
          </h1>
          <p className="mt-2 text-dark-500">
            {isArabic
              ? "اختر متجرًا، استعرض المنتجات، واطلب مباشرة."
              : "Pick a store, browse products, and order directly."}
          </p>
        </div>

        {/* Location button */}
        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            userPos
              ? "bg-success/10 text-success"
              : "bg-primary-50 text-primary-700 hover:bg-primary-100"
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
        <div className="mb-4 flex items-center gap-2 rounded-[1.2rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          <WifiOff className="h-4 w-4 shrink-0" />
          {isArabic
            ? "لم يتم السماح بالوصول للموقع. تأكد من إذن المتصفح."
            : "Location access denied. Please allow it in your browser."}
        </div>
      )}

      {/* Search bar */}
      <div className="mb-6 relative">
        <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isArabic ? "ابحث باسم المتجر أو التصنيف أو المنطقة..." : "Search by store name, category or area..."}
          className="h-12 w-full rounded-[1.3rem] border border-dark-200 bg-white ps-11 pe-4 text-sm text-dark-950 shadow-soft placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>

      {/* Stores grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 animate-pulse rounded-[1.8rem] bg-surface-soft" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-dark-200 bg-surface-soft py-20 text-center">
          <Store className="h-12 w-12 text-dark-300" />
          <p className="mt-4 text-lg font-semibold text-dark-700">
            {stores.length === 0
              ? (isArabic ? "لا توجد متاجر بعد" : "No stores yet")
              : (isArabic ? "لا توجد نتائج للبحث" : "No results found")}
          </p>
        </div>
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
