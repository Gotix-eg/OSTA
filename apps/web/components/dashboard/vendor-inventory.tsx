"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Plus, Trash2, Check, X, ShoppingBag, ImageOff, Upload, Loader2 } from "lucide-react";
import { fetchApiData, postApiData, patchApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type VendorProduct = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  inStock: boolean;
  stockQty?: number | null;
  createdAt: string;
};

type FormState = {
  nameAr: string;
  nameEn: string;
  description: string;
  price: string;
  imageUrl: string;
  inStock: boolean;
  stockQty: string;
};

const emptyForm: FormState = {
  nameAr: "",
  nameEn: "",
  description: "",
  price: "",
  imageUrl: "",
  inStock: true,
  stockQty: "",
};

function formatPrice(price: number, locale: Locale) {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(price);
  return locale === "ar" ? `${n} ج.م` : `EGP ${n}`;
}

// Compress an image file in-browser using a canvas and return a base64 JPEG
function compressImage(file: File, maxPx = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) { height = Math.round((height * maxPx) / width); width = maxPx; }
          else { width = Math.round((width * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ImageUploader({
  locale,
  value,
  onChange,
}: {
  locale: Locale;
  value: string;
  onChange: (url: string) => void;
}) {
  const isArabic = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(isArabic ? "يرجى اختيار صورة فقط" : "Please select an image file");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError(isArabic ? "الصورة يجب أن تكون أقل من 15MB" : "Image must be less than 15MB");
      return;
    }

    setUploadError(null);
    setProcessing(true);
    try {
      const base64 = await compressImage(file);
      onChange(base64);
    } catch {
      setUploadError(isArabic ? "فشل معالجة الصورة" : "Failed to process image");
    } finally {
      setProcessing(false);
    }
  }

  function handleRemove() {
    onChange("");
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-dark-700">
        {isArabic ? "صورة المنتج - اختياري" : "Product Image - Optional"}
      </span>

      {value ? (
        <div className="relative overflow-hidden rounded-[1.2rem] border border-dark-200 bg-surface-soft">
          <img src={value} alt="preview" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-error shadow transition hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-[1.2rem] border-2 border-dashed border-dark-200 bg-surface-soft py-8 text-dark-500 transition hover:border-primary-400 hover:text-primary-700 disabled:opacity-60"
        >
          {processing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
          <span className="text-sm font-medium">
            {processing
              ? (isArabic ? "جاري معالجة الصورة..." : "Processing...")
              : (isArabic ? "اضغط لرفع صورة المنتج" : "Click to upload product image")}
          </span>
          <span className="text-xs text-dark-400">
            {isArabic ? "PNG، JPG، WEBP — حتى 15MB" : "PNG, JPG, WEBP — up to 15MB"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError && (
        <p className="text-xs text-error">{uploadError}</p>
      )}
    </div>
  );
}

function ProductCard({
  product,
  locale,
  onDelete,
  onToggleStock,
}: {
  product: VendorProduct;
  locale: Locale;
  onDelete: (id: string) => void;
  onToggleStock: (id: string, inStock: boolean) => void;
}) {
  const isArabic = locale === "ar";
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(isArabic ? "هل تريد حذف هذا المنتج؟" : "Delete this product?")) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_OSTA_API_URL ?? "http://localhost:4000/api"}/vendors/products/${product.id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) onDelete(product.id);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle() {
    await patchApiData(`/vendors/products/${product.id}`, { inStock: !product.inStock });
    onToggleStock(product.id, !product.inStock);
  }

  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-dark-200/70 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-surface-soft">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.nameAr} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dark-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        <span className={cn(
          "absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
          product.inStock ? "bg-success/90 text-white" : "bg-error/90 text-white"
        )}>
          {product.inStock ? (isArabic ? "متاح" : "In Stock") : (isArabic ? "نفذ" : "Out of Stock")}
        </span>
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-dark-950">{product.nameAr}</p>
        {product.nameEn && <p className="text-sm text-dark-400">{product.nameEn}</p>}
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-dark-500">{product.description}</p>
        )}
        <p className="mt-3 text-2xl font-bold text-primary-700">{formatPrice(product.price, locale)}</p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
              product.inStock
                ? "bg-error/10 text-error hover:bg-error/20"
                : "bg-success/10 text-success hover:bg-success/20"
            )}
          >
            {product.inStock ? (
              <><X className="h-4 w-4" />{isArabic ? "وقف البيع" : "Mark Out"}</>
            ) : (
              <><Check className="h-4 w-4" />{isArabic ? "متاح للبيع" : "Mark In"}</>
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error transition hover:bg-error/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function AddProductModal({
  locale,
  onClose,
  onAdded,
}: {
  locale: Locale;
  onClose: () => void;
  onAdded: (product: VendorProduct) => void;
}) {
  const isArabic = locale === "ar";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!form.nameAr.trim()) { setError(isArabic ? "اسم المنتج مطلوب" : "Product name required"); return; }
    const priceNum = parseFloat(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) { setError(isArabic ? "أدخل سعر صحيح" : "Enter a valid price"); return; }

    setIsSubmitting(true);
    setError(null);
    try {
      const product = await postApiData<VendorProduct, Record<string, any>>("/vendors/products", {
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim() || undefined,
        description: form.description.trim() || undefined,
        price: priceNum,
        imageUrl: form.imageUrl || undefined,
        inStock: form.inStock,
        stockQty: form.stockQty ? parseInt(form.stockQty) : undefined,
      });
      onAdded(product);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : isArabic ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-dark-950/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-dark-100 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark-950">
              {isArabic ? "إضافة منتج جديد" : "Add New Product"}
            </h2>
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-soft text-dark-500 hover:text-dark-950">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-4 p-6">
            {/* Image uploader */}
            <ImageUploader
              locale={locale}
              value={form.imageUrl}
              onChange={url => setForm({ ...form, imageUrl: url })}
            />

            {/* Name Arabic */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-dark-700">{isArabic ? "اسم المنتج (عربي) *" : "Product Name (Arabic) *"}</span>
              <input
                type="text"
                value={form.nameAr}
                onChange={e => setForm({ ...form, nameAr: e.target.value })}
                placeholder={isArabic ? "مثال: زيت موتور 5L" : "e.g. Motor Oil 5L"}
                className="h-11 w-full rounded-[1.1rem] border border-dark-200 bg-surface-soft px-4 text-sm text-dark-950 placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </label>

            {/* Name English */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-dark-700">{isArabic ? "اسم المنتج (إنجليزي) - اختياري" : "Product Name (English) - Optional"}</span>
              <input
                type="text"
                value={form.nameEn}
                onChange={e => setForm({ ...form, nameEn: e.target.value })}
                className="h-11 w-full rounded-[1.1rem] border border-dark-200 bg-surface-soft px-4 text-sm text-dark-950 placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </label>

            {/* Price */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-dark-700">{isArabic ? "السعر (ج.م) *" : "Price (EGP) *"}</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="h-11 w-full rounded-[1.1rem] border border-dark-200 bg-surface-soft px-4 text-sm text-dark-950 placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </label>

            {/* Description */}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-dark-700">{isArabic ? "وصف المنتج - اختياري" : "Description - Optional"}</span>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-[1.1rem] border border-dark-200 bg-surface-soft px-4 py-3 text-sm text-dark-950 placeholder:text-dark-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </label>

            {/* In Stock toggle */}
            <label className="flex items-center gap-3 rounded-[1.2rem] border border-dark-200 bg-surface-soft px-4 py-3">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={e => setForm({ ...form, inStock: e.target.checked })}
                className="h-4 w-4 rounded border-dark-300 text-primary-600"
              />
              <span className="text-sm font-medium text-dark-700">{isArabic ? "متاح للبيع الآن" : "Available for sale now"}</span>
            </label>

            {error && (
              <div className="rounded-[1rem] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-dark-100 p-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-dark-200 py-3 text-sm font-semibold text-dark-700 transition hover:border-dark-400">
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {isSubmitting ? (isArabic ? "جاري الإضافة..." : "Adding...") : (isArabic ? "إضافة المنتج" : "Add Product")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorInventoryPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApiData<VendorProduct[]>("/vendors/products", []).then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  function handleDelete(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  function handleToggleStock(id: string, inStock: boolean) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock } : p));
  }

  function handleAdded(product: VendorProduct) {
    setProducts(prev => [product, ...prev]);
  }

  const inStockCount = products.filter(p => p.inStock).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-700">
            {isArabic ? "إدارة المخزون" : "Inventory Management"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark-950">
            {isArabic ? "منتجات متجرك" : "Your Products"}
          </h1>
          <p className="mt-2 text-dark-500">
            {isArabic
              ? `${products.length} منتج — ${inStockCount} متاح للبيع`
              : `${products.length} products — ${inStockCount} in stock`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          {isArabic ? "إضافة منتج" : "Add Product"}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: isArabic ? "إجمالي المنتجات" : "Total Products", value: products.length },
          { label: isArabic ? "متاح للبيع" : "In Stock", value: inStockCount },
          { label: isArabic ? "نفذ من المخزون" : "Out of Stock", value: products.length - inStockCount },
        ].map(item => (
          <div key={item.label} className="rounded-[1.4rem] border border-dark-200/70 bg-white p-4 shadow-soft">
            <p className="text-xs uppercase tracking-[0.22em] text-dark-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-dark-950">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 animate-pulse rounded-[1.6rem] bg-surface-soft" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-dark-200 bg-surface-soft py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-dark-300" />
          <p className="mt-4 text-lg font-semibold text-dark-700">
            {isArabic ? "لا توجد منتجات بعد" : "No products yet"}
          </p>
          <p className="mt-2 text-sm text-dark-500">
            {isArabic ? "ابدأ بإضافة منتجاتك وأسعارها" : "Start by adding your products and prices"}
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            {isArabic ? "إضافة أول منتج" : "Add First Product"}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              onDelete={handleDelete}
              onToggleStock={handleToggleStock}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddProductModal locale={locale} onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}
    </div>
  );
}
