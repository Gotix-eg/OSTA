"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, Save, ArrowRight, ArrowLeft, Check, Image as ImageIcon,
  Edit2, Eye, EyeOff, ShieldCheck
} from "lucide-react";
import { fetchApiData, putApiData } from "@/lib/api";
import { ImageUpload } from "@/components/shared/image-upload";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type ServiceCategory = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};



export function AdminServicesPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    imageUrl: "",
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await fetchApiData<ServiceCategory[]>("/admin/services/categories", []);
      setCategories(res);
      if (res.length > 0 && !selectedId) {
        const firstCat = res[0];
        if (firstCat) {
          selectCategory(firstCat);
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }

  function selectCategory(cat: ServiceCategory) {
    setSelectedId(cat.id);
    setFormData({
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      imageUrl: cat.imageUrl || "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive
    });
    setFeedback(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    try {
      setSaving(true);
      setFeedback(null);

      const updated = await putApiData<ServiceCategory, any>(
        `/admin/services/categories/${selectedId}`,
        {
          nameAr: formData.nameAr,
          nameEn: formData.nameEn,
          imageUrl: formData.imageUrl || null,
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive
        }
      );

      setCategories(prev => prev.map(c => c.id === selectedId ? updated : c).sort((a, b) => a.sortOrder - b.sortOrder));
      setFeedback({
        type: "success",
        message: isArabic ? "تم حفظ التغييرات بنجاح!" : "Changes saved successfully!"
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: isArabic ? "فشل حفظ التغييرات. يرجى المحاولة مرة أخرى." : "Failed to save changes. Please try again."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 animate-slideUp">
      {/* Title block */}
      <div className="onyx-card p-8 border-gold-500/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isArabic ? "إدارة تصنيفات الخدمات" : "Service Category Management"}
          </h1>
          <p className="text-onyx-400 text-sm font-medium">
            {isArabic 
              ? "تحكم في أسماء تصنيفات الخدمات، وأيقوناتها، وصورها المرفقة في واجهة المنصة."
              : "Manage names, icons, and display images of service categories across the frontend."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8">
          {/* List of categories */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white px-2">
              {isArabic ? "قائمة التصنيفات" : "Categories List"}
            </h2>
            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
              {categories.map((cat) => {
                const isSelected = selectedId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat)}
                    className={cn(
                      "w-full text-start p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                      isSelected 
                        ? "bg-gold-500/10 border-gold-500/50 text-white" 
                        : "bg-onyx-900/40 border-onyx-800 text-onyx-300 hover:border-gold-500/30 hover:bg-onyx-900/60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-bold text-white">
                          {isArabic ? cat.nameAr : cat.nameEn}
                        </div>
                        <div className="text-xs text-onyx-500">
                          {cat.slug}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!cat.isActive && (
                        <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                          {isArabic ? "معطل" : "Inactive"}
                        </span>
                      )}
                      {isArabic ? (
                        <ArrowLeft className={cn("h-4 w-4 opacity-0 transition-opacity duration-300", isSelected ? "opacity-100 text-gold-500" : "group-hover:opacity-50")} />
                      ) : (
                        <ArrowRight className={cn("h-4 w-4 opacity-0 transition-opacity duration-300", isSelected ? "opacity-100 text-gold-500" : "group-hover:opacity-50")} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit form */}
          <div>
            {selectedId ? (
              <div className="onyx-card p-8 border-gold-500/10 space-y-6">
                <div className="flex justify-between items-center border-b border-onyx-800 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Edit2 className="h-5 w-5 text-gold-500" />
                    {isArabic ? "تعديل بيانات التصنيف" : "Edit Category Data"}
                  </h2>
                  <span className="text-xs font-mono text-onyx-500">ID: {selectedId}</span>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  {feedback && (
                    <div className={cn(
                      "p-4 rounded-xl border flex items-center gap-3 text-sm",
                      feedback.type === "success" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                      {feedback.type === "success" ? <Check className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 shrink-0" />}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  {/* Name inputs */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400">
                        {isArabic ? "الاسم بالعربية" : "Name (Arabic)"}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-onyx-900/50 border border-onyx-700 rounded-2xl px-5 py-3.5 text-white focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 transition-all outline-none"
                        value={formData.nameAr}
                        onChange={e => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400">
                        {isArabic ? "الاسم بالإنجليزية" : "Name (English)"}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-onyx-900/50 border border-onyx-700 rounded-2xl px-5 py-3.5 text-white focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 transition-all outline-none"
                        value={formData.nameEn}
                        onChange={e => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400">
                      {isArabic ? "ترتيب الظهور" : "Sort Order"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-onyx-900/50 border border-onyx-700 rounded-2xl px-5 py-3.5 text-white focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 transition-all outline-none"
                      value={formData.sortOrder}
                      onChange={e => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-onyx-400 mb-2">
                      {isArabic ? "صورة الخلفية للتصنيف" : "Display Background Image"}
                    </label>
                    <ImageUpload
                      label={isArabic ? "اختر صورة التصنيف" : "Choose Category Image"}
                      value={formData.imageUrl}
                      onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      isArabic={isArabic}
                    />
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-onyx-800 bg-onyx-900/20">
                    <div>
                      <div className="font-bold text-white">
                        {isArabic ? "حالة التصنيف" : "Category Status"}
                      </div>
                      <p className="text-xs text-onyx-500 mt-1">
                        {isArabic 
                          ? "تعطيل التصنيف سيخفيه من الصفحة الرئيسية ومن صفحات حجز الخدمات."
                          : "Disabling will hide it from the landing page and booking wizards."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                        formData.isActive 
                          ? "bg-gold-500/10 border-gold-500/20 text-gold-500 hover:bg-gold-500/20" 
                          : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                      )}
                    >
                      {formData.isActive ? (
                        <>
                          <Eye className="h-4 w-4" />
                          {isArabic ? "نشط" : "Active"}
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          {isArabic ? "معطل" : "Inactive"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-4 border-t border-onyx-800">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-gold px-8 py-3.5 flex items-center gap-3 font-bold shadow-lg"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      {isArabic ? "حفظ التغييرات" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="onyx-card p-16 border-onyx-800/50 flex flex-col items-center justify-center text-center text-onyx-500 gap-4">
                <ImageIcon className="h-16 w-16 text-onyx-700 animate-pulse" />
                <p className="text-lg">
                  {isArabic 
                    ? "اختر تصنيفاً من القائمة الجانبية لتعديل بياناته وصورته."
                    : "Select a service category from the side list to edit its options."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
