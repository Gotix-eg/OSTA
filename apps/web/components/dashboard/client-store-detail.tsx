"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ImageOff, Minus, Plus, ShoppingCart,
  Star, MapPin, Store, Trash2, CheckCircle2, ChevronRight, ChevronLeft,
  MessageSquarePlus, Send, Loader2
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
    <article className="group overflow-hidden border border-white/10 bg-black text-white shadow-[5px_5px_0_#1a1c1c] transition hover:-translate-y-0.5 hover:border-[#f5bd18]/60">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-[#121212]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/25">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <span className={cn("absolute end-3 top-3 border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]", product.inStock ? "border-[#f5bd18] bg-[#f5bd18] text-black" : "border-white/15 bg-black text-white/45")}>
          {product.inStock ? (isArabic ? "متاح" : "In stock") : (isArabic ? "غير متاح" : "Out")}
        </span>
      </div>

      <div className="p-4">
        <p className="font-black leading-snug text-white group-hover:text-[#f5bd18]">{name}</p>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-white/50">{product.description}</p>
        )}
        <p className="mt-4 text-2xl font-black text-[#f5bd18]">{formatPrice(product.price, locale)}</p>

        {/* Cart controls */}
        <div className="mt-4">
          {cartQty === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              disabled={!product.inStock}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-white py-2.5 text-sm font-black text-black shadow-[3px_3px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              {isArabic ? "أضف للسلة" : "Add to Cart"}
            </button>
          ) : (
            <div className="flex items-center justify-between border border-[#f5bd18] bg-[#f5bd18] px-2 py-1 text-black">
              <button type="button" onClick={onRemove} className="flex h-8 w-8 items-center justify-center bg-black text-[#f5bd18] transition hover:bg-white hover:text-black">
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-black">{cartQty}</span>
              <button type="button" onClick={onAdd} className="flex h-8 w-8 items-center justify-center bg-black text-[#f5bd18] transition hover:bg-white hover:text-black">
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
      <div className="border border-emerald-400/30 bg-black p-6 text-center text-white shadow-[5px_5px_0_#1a1c1c]">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
        <h3 className="mt-4 text-xl font-black text-white">
          {isArabic ? "تم إرسال طلبك!" : "Order Placed!"}
        </h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-white/55">
          {isArabic
            ? "سيتواصل معك المتجر قريباً لتأكيد الطلب."
            : "The store will contact you soon to confirm your order."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-black text-white shadow-[5px_5px_0_#1a1c1c]">
      <div className="border-b border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-black text-white">
            <ShoppingCart className="h-5 w-5 text-[#f5bd18]" />
            {isArabic ? "سلة المشتريات" : "Your Cart"}
          </h3>
          <button type="button" onClick={onClear} className="border-b border-red-300 text-xs font-black text-red-300">
            {isArabic ? "إفراغ السلة" : "Clear"}
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/10 px-5">
        {cart.map(item => (
          <div key={item.product.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{isArabic ? item.product.nameAr : (item.product.nameEn || item.product.nameAr)}</p>
              <p className="text-xs font-semibold text-white/45">{formatPrice(item.product.price, locale)} × {item.qty}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => onChangeQty(item.product.id, -1)} className="flex h-7 w-7 items-center justify-center border border-white/10 text-white/65 hover:border-[#f5bd18] hover:text-[#f5bd18]">
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-sm font-black">{item.qty}</span>
              <button type="button" onClick={() => onChangeQty(item.product.id, 1)} className="flex h-7 w-7 items-center justify-center border border-white/10 text-white/65 hover:border-[#f5bd18] hover:text-[#f5bd18]">
                <Plus className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onRemoveItem(item.product.id)} className="flex h-7 w-7 items-center justify-center text-red-300 hover:bg-red-400/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 p-5">
        {/* Total */}
        <div className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3">
          <span className="font-black text-white/65">{isArabic ? "الإجمالي" : "Total"}</span>
          <span className="text-xl font-black text-[#f5bd18]">{formatPrice(total, locale)}</span>
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "طريقة الدفع" : "Payment Method"}</p>
          <div className="grid grid-cols-2 gap-2">
            {(["CASH_ON_DELIVERY", "INSTAPAY"] as const).map(method => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={cn(
                  "border px-3 py-2 text-sm font-black transition",
                  paymentMethod === method
                    ? "border-[#f5bd18] bg-[#f5bd18] text-black"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
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
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{isArabic ? "ملاحظات التوصيل" : "Delivery Notes"}</span>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder={isArabic ? "العنوان، الطابق، أي تعليمات..." : "Address, floor, any instructions..."}
            className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white placeholder:text-white/30 focus:border-[#f5bd18] focus:outline-none"
          />
        </label>

        {error && (
          <div className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>
        )}

        <button
          type="button"
          onClick={handleOrder}
          disabled={submitting || cart.length === 0}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-white py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="-m-4 min-h-screen bg-[#f5bd18] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
        <div className="h-40 animate-pulse border border-white/10 bg-black shadow-[6px_6px_0_#1a1c1c]" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 animate-pulse border border-white/10 bg-black shadow-[5px_5px_0_#1a1c1c]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-screen bg-[#f5bd18] p-4 text-black sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
      {/* Back link */}
      <Link
        href={`/${locale}/client/stores`}
        className="mb-6 inline-flex min-h-12 items-center gap-2 bg-black px-5 text-sm font-black uppercase text-white shadow-[4px_4px_0_#ffffff] transition hover:-translate-y-0.5"
      >
        {isArabic ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        {isArabic ? "العودة للمتاجر" : "Back to Stores"}
      </Link>

      {/* Store header */}
      {vendor && (
        <div className="mb-6 overflow-hidden border border-white/10 bg-black text-white shadow-[6px_6px_0_#1a1c1c]">
          <div className="relative h-48 overflow-hidden bg-[#121212] md:h-64">
            {vendor.shopImageUrl
              ? <img src={vendor.shopImageUrl} alt={shopName} className="h-full w-full object-cover grayscale brightness-75 contrast-125" />
              : <div className="flex h-full w-full items-center justify-center"><Store className="h-16 w-16 text-[#f5bd18]" /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
            <span className={cn("absolute end-4 top-4 border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]", vendor.isOpen ? "border-[#f5bd18] bg-[#f5bd18] text-black" : "border-white/15 bg-black text-white/55")}>
              {vendor.isOpen ? (isArabic ? "مفتوح" : "Open") : (isArabic ? "مغلق" : "Closed")}
            </span>
            <div className="absolute bottom-5 start-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f5bd18]">{isArabic ? "متجر معتمد" : "Verified store"}</p>
              <h1 className="mt-2 text-4xl font-black leading-none text-white md:text-6xl">{shopName}</h1>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {vendor.category && <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f5bd18]">{vendor.category}</p>}
                {vendor.shopDescription && <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-white/60">{vendor.shopDescription}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-white/55">
                <span className="flex items-center gap-1 border border-white/10 bg-white/5 px-3 py-2">
                  <Star className="h-4 w-4 fill-[#f5bd18] text-[#f5bd18]" />
                  <strong className="text-white">{vendor.rating > 0 ? vendor.rating.toFixed(1) : "—"}</strong>
                  {vendor.ratingCount > 0 && <span>({vendor.ratingCount})</span>}
                </span>
                <span className="flex items-center gap-1 border border-white/10 bg-white/5 px-3 py-2">
                  <MapPin className="h-4 w-4 text-[#f5bd18]" />
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
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-black">
            {isArabic ? `المنتجات (${products.length})` : `Products (${products.length})`}
          </h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-white/15 bg-black py-16 text-center text-white shadow-[5px_5px_0_#1a1c1c]">
              <Store className="h-10 w-10 text-[#f5bd18]" />
              <p className="mt-3 text-sm font-black text-white/60">
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

        {/* Sidebar */}
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {/* Custom Request Form */}
          <CustomRequestForm locale={locale} vendorId={vendorId} />

          {/* Cart */}
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
            <div className="flex flex-col items-center justify-center border border-dashed border-white/15 bg-black p-8 text-center text-white shadow-[5px_5px_0_#1a1c1c]">
              <ShoppingCart className="h-10 w-10 text-[#f5bd18]" />
              <p className="mt-3 text-sm font-semibold leading-6 text-white/50">
                {isArabic ? "السلة فارغة — اضغط على المنتج لإضافته" : "Cart is empty — tap a product to add it"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================
// Custom Request Form
// =============================================

function CustomRequestForm({ locale, vendorId }: { locale: Locale; vendorId: string }) {
  const isArabic = locale === "ar";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (message.trim().length < 5) {
      setError(isArabic ? "يرجى كتابة 5 حروف على الأقل" : "Please write at least 5 characters");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await postApiData(`/vendors/stores/${vendorId}/custom-request`, {
        message,
        clientPhone: phone || undefined,
      });
      setSuccess(true);
      setMessage("");
      setPhone("");
    } catch (e) {
      setError(e instanceof Error ? e.message : isArabic ? "حدث خطأ" : "An error occurred");
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="border border-emerald-400/30 bg-black p-5 text-center text-white shadow-[5px_5px_0_#1a1c1c]">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300" />
        <p className="mt-3 font-black text-white">
          {isArabic ? "تم إرسال طلبك بنجاح!" : "Request sent successfully!"}
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-white/55">
          {isArabic ? "المتجر هيتواصل معاك قريباً." : "The store will contact you soon."}
        </p>
        <button
          type="button"
          onClick={() => { setSuccess(false); setOpen(false); }}
          className="mt-4 border-b border-[#f5bd18] text-sm font-black text-[#f5bd18]"
        >
          {isArabic ? "حسناً" : "OK"}
        </button>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-black text-white shadow-[5px_5px_0_#1a1c1c]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-5"
      >
        <div className="flex h-10 w-10 items-center justify-center border border-[#f5bd18] bg-[#121212] text-[#f5bd18]">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div className="flex-1 text-start">
          <p className="font-black text-white">
            {isArabic ? "اطلب من المتجر" : "Request from Store"}
          </p>
          <p className="mt-1 text-xs font-semibold text-white/45">
            {isArabic ? "اكتب طلبك وأبعته للمحل مباشرة" : "Write what you need and send it directly"}
          </p>
        </div>
        <ChevronRight className={cn("h-5 w-5 text-white/45 transition", open && "rotate-90 text-[#f5bd18]")} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-white/10 p-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
              {isArabic ? "وصف الطلب *" : "Request Description *"}
            </span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder={isArabic
                ? "مثال: عاوز فلتر زيت لموتوسيكل هوندا 2020 + شمعات..."
                : "e.g. I need an oil filter for Honda 2020 + spark plugs..."}
              className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white placeholder:text-white/30 focus:border-[#f5bd18] focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
              {isArabic ? "رقم التلفون (اختياري)" : "Phone Number (Optional)"}
            </span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={isArabic ? "01xxxxxxxxx" : "01xxxxxxxxx"}
              className="h-11 w-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white placeholder:text-white/30 focus:border-[#f5bd18] focus:outline-none"
            />
          </label>

          {error && (
            <div className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-white py-3 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "إرسال الطلب" : "Send Request")}
          </button>
        </div>
      )}
    </div>
  );
}
