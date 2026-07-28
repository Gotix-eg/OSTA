"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, ChevronLeft, ChevronRight, CheckCircle2, ImageOff, Loader2,
  MapPin, Menu, MessageSquarePlus, Minus, Plus, Send, ShoppingCart,
  Store, Trash2, Verified
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
    <article className="group overflow-hidden rounded-[32px] bg-black text-white transition active:scale-[0.98] lg:rounded-none lg:border lg:border-white/10 lg:shadow-[5px_5px_0_#1a1c1c] lg:hover:-translate-y-0.5 lg:hover:border-gold/60">
      <div className="relative h-64 w-full overflow-hidden bg-[#121212] lg:h-48">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={name} className="h-full w-full object-cover transition duration-500 lg:grayscale lg:group-hover:scale-110 lg:group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/25">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <span className={cn("absolute end-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] lg:rounded-none", product.inStock ? "bg-gold text-black" : "border border-white/15 bg-black text-white/45")}>
          {product.inStock ? (isArabic ? "متاح" : "In stock") : (isArabic ? "غير متاح" : "Out")}
        </span>
      </div>

      <div className="p-6 text-start lg:p-4">
        <p className="text-xl font-black leading-snug text-gold lg:text-base lg:text-white lg:group-hover:text-gold">{name}</p>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white/55 lg:text-xs">{product.description}</p>
        )}
        <p className="mt-4 text-2xl font-black text-white lg:text-gold">{formatPrice(product.price, locale)}</p>

        <div className="mt-6 lg:mt-4">
          {cartQty === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              disabled={!product.inStock}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-sm font-black text-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 lg:rounded-none lg:bg-white lg:shadow-[3px_3px_0_#f5bd18] lg:active:translate-x-1 lg:active:translate-y-1 lg:active:scale-100 lg:active:shadow-none"
            >
              <Plus className="h-4 w-4" />
              {isArabic ? "أضف للسلة" : "Add to Cart"}
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-gold px-2 py-1 text-black lg:rounded-none lg:border lg:border-gold">
              <button type="button" onClick={onRemove} className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-gold transition hover:bg-white hover:text-black lg:rounded-none">
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-black">{cartQty}</span>
              <button type="button" onClick={onAdd} className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-gold transition hover:bg-white hover:text-black lg:rounded-none">
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
  onClear,
  onRemoveItem,
  onChangeQty,
}: {
  cart: CartItem[];
  locale: Locale;
  vendorId: string;
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
      <div className="rounded-[20px] border border-emerald-400/30 bg-black p-6 text-center text-white shadow-[5px_5px_0_#1a1c1c] lg:rounded-none">
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
    <div className="flex flex-col rounded-[20px] border border-white/10 bg-black text-white shadow-[5px_5px_0_#1a1c1c] lg:h-[calc(100vh-250px)] lg:rounded-none">
      <div className="border-b border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-black text-white">
            <ShoppingCart className="h-5 w-5 text-gold" />
            {isArabic ? "سلة المشتريات" : "Your Cart"}
          </h3>
          <button type="button" onClick={onClear} className="border-b border-red-300 text-xs font-black text-red-300">
            {isArabic ? "إفراغ السلة" : "Clear"}
          </button>
        </div>
      </div>

      <div className="custom-scrollbar flex-1 divide-y divide-white/10 overflow-y-auto px-5">
        {cart.map(item => (
          <div key={item.product.id} className="flex items-center gap-3 py-3">
            <div className="h-14 w-14 shrink-0 bg-white/10">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={isArabic ? item.product.nameAr : (item.product.nameEn || item.product.nameAr)} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/25">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{isArabic ? item.product.nameAr : (item.product.nameEn || item.product.nameAr)}</p>
              <p className="text-xs font-semibold text-white/45">{formatPrice(item.product.price, locale)} × {item.qty}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => onChangeQty(item.product.id, -1)} className="flex h-7 w-7 items-center justify-center border border-white/10 text-white/65 hover:border-gold hover:text-gold">
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-sm font-black">{item.qty}</span>
              <button type="button" onClick={() => onChangeQty(item.product.id, 1)} className="flex h-7 w-7 items-center justify-center border border-white/10 text-white/65 hover:border-gold hover:text-gold">
                <Plus className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onRemoveItem(item.product.id)} className="flex h-7 w-7 items-center justify-center text-red-300 hover:bg-red-400/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-white/10 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-white/55">
            <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-bold text-white/55">
            <span>{isArabic ? "مصاريف الشحن" : "Delivery"}</span>
            <span>{formatPrice(cart.length > 0 ? 50 : 0, locale)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-lg font-black text-white">
            <span>{isArabic ? "الإجمالي" : "Total"}</span>
            <span className="text-gold">{formatPrice(total + (cart.length > 0 ? 50 : 0), locale)}</span>
          </div>
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
                    ? "border-gold bg-gold text-black"
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
            className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white placeholder:text-white/30 focus:border-gold focus:outline-none"
          />
        </label>

        {error && (
          <div className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>
        )}

        <button
          type="button"
          onClick={handleOrder}
          disabled={submitting || cart.length === 0}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-gold py-3 text-sm font-black text-black shadow-[4px_4px_0_#2a2a2a] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
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

  if (loading) {
    return (
      <div className="-m-4 min-h-screen bg-gold p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
        <div className="h-40 animate-pulse border border-white/10 bg-black shadow-[6px_6px_0_#1a1c1c]" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 animate-pulse border border-white/10 bg-black shadow-[5px_5px_0_#1a1c1c]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-screen bg-gold pb-24 text-black sm:-m-6 lg:-m-8 lg:p-8 lg:pb-8">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-gold p-4 lg:hidden">
        <Link href={`/${locale}/client/stores`} className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-gold shadow-lg">
            {isArabic ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </span>
          <span className="text-lg font-black">{isArabic ? "العودة للمتاجر" : "Back to Stores"}</span>
        </Link>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-gold">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {vendor && (
        <section className="px-4 lg:px-0">
          <div className="relative mb-6 hidden overflow-hidden border border-white/10 bg-black p-8 text-white shadow-[6px_6px_0_#1a1c1c] lg:block">
            <div className="absolute inset-0 opacity-25">
              {vendor.shopImageUrl ? (
                <img src={vendor.shopImageUrl} alt={shopName} className="h-full w-full object-cover grayscale brightness-75 contrast-125" />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(245,189,24,0.35),transparent_35%),linear-gradient(135deg,#181818,#000)]" />
              )}
            </div>
            <div className="relative z-10 flex min-h-32 items-end justify-between gap-6">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className={cn("px-2 py-1 text-xs font-black uppercase", vendor.isOpen ? "bg-gold text-black" : "border border-white/15 bg-black text-white/55")}>
                    {vendor.isOpen ? (isArabic ? "مفتوح" : "Open") : (isArabic ? "مغلق" : "Closed")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-white/55">
                    <MapPin className="h-4 w-4" />
                    {vendor.city || vendor.governorate}
                  </span>
                </div>
                <h1 className="text-5xl font-black leading-none text-white">{shopName}</h1>
                {vendor.category && <p className="mt-3 text-lg font-black text-gold">{vendor.category}</p>}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="inline-flex min-h-12 items-center gap-2 bg-white px-6 text-sm font-black text-black shadow-[4px_4px_0_#f5bd18]">
                  <MessageSquarePlus className="h-4 w-4" />
                  {isArabic ? "تواصل مع المتجر" : "Chat with Store"}
                </button>
                <a href="#store-request" className="inline-flex min-h-12 items-center border-2 border-white px-6 text-sm font-black text-white transition hover:bg-white/10">
                  {isArabic ? "اطلب من المتجر" : "Request from Store"}
                </a>
              </div>
            </div>
          </div>

          <div className="relative mb-6 rounded-[32px] border border-black/10 bg-black/10 p-8 text-center lg:hidden">
            {vendor.shopImageUrl
              ? <img src={vendor.shopImageUrl} alt={shopName} className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover" />
              : <Building2 className="mx-auto mb-4 h-16 w-16 text-black" />
            }
            <span className={cn("absolute end-10 top-24 rounded-full px-4 py-1 text-xs font-black", vendor.isOpen ? "bg-emerald-400 text-white" : "bg-black text-white/60")}>
              {vendor.isOpen ? (isArabic ? "مفتوح" : "Open") : (isArabic ? "مغلق" : "Closed")}
            </span>
            <h1 className="text-3xl font-black">{shopName}</h1>
            {vendor.category && <p className="mt-2 font-semibold text-black/70">{vendor.category}</p>}
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black/60">
              <span>{vendor.city || vendor.governorate}</span>
              <MapPin className="h-4 w-4" />
            </div>
          </div>
        </section>
      )}

      <div className="px-4 lg:px-0">
        <div className="mb-6 grid gap-4 lg:hidden">
          <a href="#store-request" className="flex items-center justify-between rounded-[20px] border border-black/20 bg-black/10 p-5 text-start">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-gold">
                <MessageSquarePlus className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-lg font-black">{isArabic ? "اطلب من المتجر" : "Request from Store"}</span>
                <span className="mt-1 block text-sm font-semibold text-black/60">
                  {isArabic ? "اكتب طلبك وأبعته للمحل مباشرة" : "Write what you need and send it directly"}
                </span>
              </span>
            </div>
            {isArabic ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </a>
          {cart.length === 0 && (
            <div className="flex min-h-28 flex-col items-center justify-center rounded-[20px] border border-black/20 bg-black/10 p-6 text-center text-black/45">
              <ShoppingCart className="mb-2 h-10 w-10" />
              <p className="font-semibold">{isArabic ? "السلة فارغة - اضغط على المنتج لإضافته" : "Cart is empty - tap a product to add it"}</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <aside className="order-2 space-y-4 xl:order-1 xl:sticky xl:top-6 xl:self-start">
            {cart.length > 0 ? (
              <CartPanel
                cart={cart}
                locale={locale}
                vendorId={vendorId}
                onClear={() => setCart([])}
                onRemoveItem={id => setCart(prev => prev.filter(i => i.product.id !== id))}
                onChangeQty={changeQty}
              />
            ) : (
              <div className="hidden flex-col items-center justify-center border-2 border-dashed border-black/10 bg-black p-8 text-center text-white shadow-[5px_5px_0_#1a1c1c] xl:flex">
                <ShoppingCart className="h-10 w-10 text-gold" />
                <p className="mt-3 text-sm font-semibold leading-6 text-white/50">
                  {isArabic ? "أضف المزيد من المنتجات" : "Add more products"}
                </p>
              </div>
            )}
            {vendor && (
              <div className="hidden border border-white/10 bg-black p-4 text-white shadow-[5px_5px_0_#1a1c1c] xl:block">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-gold text-black">
                    <Verified className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black">{isArabic ? "بائع موثوق" : "Trusted seller"}</p>
                    <p className="text-sm font-semibold text-white/45">
                      {isArabic ? "متجر معتمد على أُسطفاي" : "Verified OSTA store"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <main className="order-1 xl:order-2">
            <div className="mb-6 hidden items-center justify-between bg-black/5 p-4 lg:flex">
              <h2 className="text-xl font-black text-black">
                {isArabic ? "المنتجات المتاحة" : "Available Products"}
              </h2>
              <div className="flex gap-2">
                <input
                  readOnly
                  value=""
                  placeholder={isArabic ? "ابحث في المنتجات..." : "Search products..."}
                  className="min-h-11 min-w-[250px] border border-black/20 bg-black/10 px-4 text-sm font-semibold text-black placeholder:text-black/50 focus:border-black focus:outline-none"
                />
                <button type="button" className="flex h-11 w-11 items-center justify-center bg-black text-white">
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>

            <h2 className="mb-6 text-xl font-black text-black lg:hidden">
            {isArabic ? `المنتجات (${products.length})` : `Products (${products.length})`}
          </h2>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] bg-black py-16 text-center text-white lg:rounded-none lg:border lg:border-dashed lg:border-white/15 lg:shadow-[5px_5px_0_#1a1c1c]">
              <Store className="h-10 w-10 text-gold" />
              <p className="mt-3 text-sm font-black text-white/60">
                {isArabic ? "لا توجد منتجات متاحة في هذا المتجر حالياً" : "No products available in this store yet"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
          </main>
        </div>

        <div id="store-request" className="mt-6">
          <CustomRequestForm locale={locale} vendorId={vendorId} />
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
      <div className="rounded-[20px] border border-emerald-400/30 bg-black p-5 text-center text-white shadow-[5px_5px_0_#1a1c1c] lg:rounded-none">
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
          className="mt-4 border-b border-gold text-sm font-black text-gold"
        >
          {isArabic ? "حسناً" : "OK"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-black/20 bg-black/10 text-black lg:rounded-none lg:border-white/10 lg:bg-black lg:text-white lg:shadow-[5px_5px_0_#1a1c1c]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-gold lg:h-10 lg:w-10 lg:rounded-none lg:border lg:border-gold lg:bg-[#121212]">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div className="flex-1 text-start">
          <p className="font-black text-black lg:text-white">
            {isArabic ? "اطلب من المتجر" : "Request from Store"}
          </p>
          <p className="mt-1 text-xs font-semibold text-black/55 lg:text-white/45">
            {isArabic ? "اكتب طلبك وأبعته للمحل مباشرة" : "Write what you need and send it directly"}
          </p>
        </div>
        <ChevronRight className={cn("h-5 w-5 text-black/45 transition lg:text-white/45", open && "rotate-90 text-black lg:text-gold")} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-black/10 p-5 lg:border-white/10">
          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-black/55 lg:text-white/45">
              {isArabic ? "وصف الطلب *" : "Request Description *"}
            </span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder={isArabic
                ? "مثال: عاوز فلتر زيت لموتوسيكل هوندا 2020 + شمعات..."
                : "e.g. I need an oil filter for Honda 2020 + spark plugs..."}
              className="w-full rounded-xl border border-black/10 bg-white/45 px-4 py-3 text-sm font-semibold text-black placeholder:text-black/35 focus:border-black focus:outline-none lg:rounded-none lg:border-white/10 lg:bg-white/5 lg:text-white lg:placeholder:text-white/30 lg:focus:border-gold"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-black/55 lg:text-white/45">
              {isArabic ? "رقم التلفون (اختياري)" : "Phone Number (Optional)"}
            </span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={isArabic ? "01xxxxxxxxx" : "01xxxxxxxxx"}
              className="h-11 w-full rounded-xl border border-black/10 bg-white/45 px-4 text-sm font-semibold text-black placeholder:text-black/35 focus:border-black focus:outline-none lg:rounded-none lg:border-white/10 lg:bg-white/5 lg:text-white lg:placeholder:text-white/30 lg:focus:border-gold"
            />
          </label>

          {error && (
            <div className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-black text-gold transition active:scale-95 disabled:opacity-60 lg:rounded-none lg:bg-white lg:text-black lg:shadow-[4px_4px_0_#f5bd18] lg:active:translate-x-1 lg:active:translate-y-1 lg:active:scale-100 lg:active:shadow-none"
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
