"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ImageOff, Minus, Plus, ShoppingCart,
  Star, MapPin, Store, Trash2, CheckCircle2, ChevronRight, ChevronLeft
} from "lucide-react";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type VendorInfo = {
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
  isOpen: boolean;
};

type Product = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  description: string | null;
  price: number;
  imageUrl: string | null;
  inStock: boolean;
};

type CartItem = { product: Product; qty: number };

function formatPrice(price: number, locale: Locale) {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(price);
  return locale === "ar" ? `${n} ج.م` : `EGP ${n}`;
}

function ProductCard({
  product,
  locale,
  cartQty,
  onAdd,
  onRemove,
}: {
  product: Product;
  locale: Locale;
  cartQty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const isArabic = locale === "ar";
  const name = isArabic ? product.nameAr : (product.nameEn || product.nameAr);

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-dark-200/70 bg-white shadow-soft transition hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-surface-soft">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dark-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="font-semibold text-dark-950 leading-snug">{name}</p>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-dark-500">{product.description}</p>
        )}
        <p className="mt-3 text-xl font-bold text-primary-700">{formatPrice(product.price, locale)}</p>

        {/* Cart controls */}
        <div className="mt-4">
          {cartQty === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              {isArabic ? "أضف للسلة" : "Add to Cart"}
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-full border border-primary-200 bg-primary-50 px-2 py-1">
              <button type="button" onClick={onRemove} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary-700 shadow-soft transition hover:bg-primary-100">
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-primary-700">{cartQty}</span>
              <button type="button" onClick={onAdd} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary-700 shadow-soft transition hover:bg-primary-100">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CartPanel({
  cart,
  locale,
  vendorId,
  vendorName,
  onClear,
  onRemoveItem,
  onChangeQty,
}: {
  cart: CartItem[];
  locale: Locale;
  vendorId: string;
  vendorName: string;
  onClear: () => void;
  onRemoveItem: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
}) {
  const isArabic = locale === "ar";
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "INSTAPAY">("CASH_ON_DELIVERY");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  async function handleOrder() {
    setSubmitting(true);
    setError(null);
    try {
      await postApiData(`/vendors/stores/${vendorId}/order`, {
        items: cart.map(item => ({ productId: item.product.id, qty: item.qty })),
        deliveryNotes: notes || undefined,
        paymentMethod,
      });
      setSuccess(true);
      onClear();
    } catch (e) {
      setError(e instanceof Error ? e.message : isArabic ? "حدث خطأ" : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-[1.6rem] border border-success/30 bg-success/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h3 className="mt-4 text-xl font-semibold text-dark-950">
          {isArabic ? "تم إرسال طلبك!" : "Order Placed!"}
        </h3>
        <p className="mt-2 text-sm text-dark-600">
          {isArabic
            ? "سيتواصل معك المتجر قريباً لتأكيد الطلب."
            : "The store will contact you soon to confirm your order."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.8rem] border border-dark-200/70 bg-white shadow-soft">
      <div className="border-b border-dark-100 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-dark-950 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary-600" />
            {isArabic ? "سلة المشتريات" : "Your Cart"}
          </h3>
          <button type="button" onClick={onClear} className="text-xs text-error hover:underline">
            {isArabic ? "إفراغ السلة" : "Clear"}
          </button>
        </div>
      </div>

      <div className="divide-y divide-dark-100 px-5">
        {cart.map(item => (
          <div key={item.product.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-dark-950 truncate">{isArabic ? item.product.nameAr : (item.product.nameEn || item.product.nameAr)}</p>
              <p className="text-xs text-dark-500">{formatPrice(item.product.price, locale)} × {item.qty}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => onChangeQty(item.product.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-200 text-dark-600 hover:bg-surface-soft">
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-sm font-semibold">{item.qty}</span>
              <button type="button" onClick={() => onChangeQty(item.product.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-dark-200 text-dark-600 hover:bg-surface-soft">
                <Plus className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onRemoveItem(item.product.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-error hover:bg-error/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 p-5">
        {/* Total */}
        <div className="flex items-center justify-between rounded-[1.2rem] bg-surface-soft px-4 py-3">
          <span className="font-semibold text-dark-700">{isArabic ? "الإجمالي" : "Total"}</span>
          <span className="text-xl font-bold text-primary-700">{formatPrice(total, locale)}</span>
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-dark-700">{isArabic ? "طريقة الدفع" : "Payment Method"}</p>
          <div className="grid grid-cols-2 gap-2">
            {(["CASH_ON_DELIVERY", "INSTAPAY"] as const).map(method => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  "rounded-[1rem] border px-3 py-2 text-sm font-medium transition",
                  paymentMethod === method
                    ? "border-primary-400 bg-primary-50 text-primary-700"
                    : "border-dark-200 bg-white text-dark-600 hover:border-dark-400"
                )}
              >
                {method === "CASH_ON_DELIVERY"
                  ? (isArabic ? "كاش عند الاستلام" : "Cash on Delivery")
                  : "Instapay"}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-dark-700">{isArabic ? "ملاحظات التوصيل (اختياري)" : "Delivery Notes (Optional)"}</span>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder={isArabic ? "العنوان، الطابق، أي تعليمات..." : "Address, floor, any instructions..."}
            className="w-full rounded-[1.1rem] border border-dark-200 bg-surface-soft px-4 py-3 text-sm text-dark-950 placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>

        {error && (
          <div className="rounded-[1rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
        )}

        <button
          type="button"
          onClick={handleOrder}
          disabled={submitting || cart.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (isArabic ? "جاري الإرسال..." : "Placing order...") : (isArabic ? "تأكيد الطلب" : "Place Order")}
        </button>
      </div>
    </div>
  );
}

export function ClientStoreDetailPage({ locale, vendorId }: { locale: Locale; vendorId: string }) {
  const isArabic = locale === "ar";
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    fetchApiData<{ vendor: VendorInfo; products: Product[] }>(
      `/vendors/stores/${vendorId}/products`,
      { vendor: null as any, products: [] }
    ).then(data => {
      if (data.vendor) setVendor(data.vendor);
      setProducts(data.products);
      setLoading(false);
    });
  }, [vendorId]);

  function getCartQty(productId: string) {
    return cart.find(i => i.product.id === productId)?.qty ?? 0;
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === productId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter(i => i.product.id !== productId);
      return prev.map(i => i.product.id === productId ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  function changeQty(productId: string, delta: number) {
    if (delta < 0) removeFromCart(productId);
    else {
      const product = products.find(p => p.id === productId);
      if (product) addToCart(product);
    }
  }

  const shopName = vendor
    ? (isArabic && vendor.shopNameAr ? vendor.shopNameAr : vendor.shopName)
    : "";

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-[1.8rem] bg-surface-soft" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 animate-pulse rounded-[1.6rem] bg-surface-soft" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/${locale}/client/stores`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-dark-500 hover:text-dark-950"
      >
        {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        {isArabic ? "العودة للمتاجر" : "Back to Stores"}
      </Link>

      {/* Store header */}
      {vendor && (
        <div className="mb-6 overflow-hidden rounded-[1.8rem] border border-dark-200/70 bg-white shadow-soft">
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary-50 to-surface-peach">
            {vendor.shopImageUrl
              ? <img src={vendor.shopImageUrl} alt={shopName} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center"><Store className="h-14 w-14 text-primary-300" /></div>
            }
            <span className={cn("absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-semibold", vendor.isOpen ? "bg-success/90 text-white" : "bg-dark-400/80 text-white")}>
              {vendor.isOpen ? (isArabic ? "مفتوح" : "Open") : (isArabic ? "مغلق" : "Closed")}
            </span>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-dark-950">{shopName}</h1>
                {vendor.category && <p className="mt-1 text-sm font-medium text-primary-700">{vendor.category}</p>}
                {vendor.shopDescription && <p className="mt-2 text-sm text-dark-500">{vendor.shopDescription}</p>}
              </div>
              <div className="flex items-center gap-4 text-sm text-dark-500">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-sun-400 text-sun-400" />
                  <strong className="text-dark-900">{vendor.rating > 0 ? vendor.rating.toFixed(1) : "—"}</strong>
                  {vendor.ratingCount > 0 && <span>({vendor.ratingCount})</span>}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {vendor.city || vendor.governorate}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Products */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-dark-950">
            {isArabic ? `المنتجات (${products.length})` : `Products (${products.length})`}
          </h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-dark-200 bg-surface-soft py-16 text-center">
              <Store className="h-10 w-10 text-dark-300" />
              <p className="mt-3 text-dark-500">
                {isArabic ? "لا توجد منتجات متاحة في هذا المتجر حالياً" : "No products available in this store yet"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  cartQty={getCartQty(product.id)}
                  onAdd={() => addToCart(product)}
                  onRemove={() => removeFromCart(product.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart sidebar */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          {cart.length > 0 ? (
            <CartPanel
              cart={cart}
              locale={locale}
              vendorId={vendorId}
              vendorName={shopName}
              onClear={() => setCart([])}
              onRemoveItem={id => setCart(prev => prev.filter(i => i.product.id !== id))}
              onChangeQty={changeQty}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-dark-200 bg-surface-soft p-8 text-center">
              <ShoppingCart className="h-10 w-10 text-dark-300" />
              <p className="mt-3 text-sm text-dark-500">
                {isArabic ? "السلة فارغة — اضغط على المنتج لإضافته" : "Cart is empty — tap a product to add it"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
