"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  UploadCloud,
  ExternalLink,
  Image as ImageIcon,
  Search,
  Copy,
  Check,
  RefreshCw,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Users,
  Wrench,
  ShoppingBag,
  Sparkles,
  Eye,
  X,
  Plus,
  ShieldCheck,
  FileText,
  Camera,
  Layers,
  Phone,
  Mail,
  Loader2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { patchApiData } from "@/lib/api";

interface MediaFile {
  id: string;
  url: string;
  titleAr: string;
  titleEn: string;
  category: string;
  field?: string;
  uploadedAt?: string | Date | null;
}

interface EntityFolder {
  id: string;
  userId: string;
  type: "worker" | "client" | "vendor" | "system";
  name: string;
  phone: string;
  email?: string | null;
  profession?: string | null;
  status?: string | null;
  avatarUrl?: string | null;
  category?: string | null;
  filesCount: number;
  files: MediaFile[];
}

interface AvatarTemplate {
  id: string;
  url: string;
  category?: string;
}

interface RawBlobItem {
  url: string;
  downloadUrl?: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

function formatFileSize(bytes: number) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function AdminMediaView({ locale }: { locale: string }) {
  const isArabic = locale === "ar";
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "workers" | "clients" | "vendors" | "system" | "avatars" | "general">("all");
  
  // Folders data
  const [workersFolders, setWorkersFolders] = useState<EntityFolder[]>([]);
  const [clientsFolders, setClientsFolders] = useState<EntityFolder[]>([]);
  const [vendorsFolders, setVendorsFolders] = useState<EntityFolder[]>([]);
  const [systemFolders, setSystemFolders] = useState<EntityFolder[]>([]);
  const [avatarTemplates, setAvatarTemplates] = useState<AvatarTemplate[]>([]);
  const [rawBlobs, setRawBlobs] = useState<RawBlobItem[]>([]);

  // Cleanup state
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{
    deletedCount: number;
    freedMB: string;
    remainingCount: number;
  } | null>(null);

  // Navigation
  const [selectedFolder, setSelectedFolder] = useState<EntityFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Folder direct upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetField, setTargetField] = useState("avatarUrl");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const result = await res.json();
      if (result.success) {
        if (Array.isArray(result.data)) {
          setRawBlobs(result.data);
        }
        if (result.folders) {
          setWorkersFolders(result.folders.workers || []);
          setClientsFolders(result.folders.clients || []);
          setVendorsFolders(result.folders.vendors || []);
          setSystemFolders(result.folders.system || []);
          setAvatarTemplates(result.folders.avatars || []);
        }
      }
    } catch (error) {
      console.error("Failed to load media folders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanupOrphans() {
    if (!confirm(isArabic 
      ? "هل أنت متأكد من فحص التخزين السحابي وحذف كافة الملفات المهملة واليتيمة غير المرتبطة بأي حساب أو منتج؟" 
      : "Are you sure you want to scan and purge all orphaned and unlinked media files?")) {
      return;
    }
    setCleaningOrphans(true);
    try {
      const res = await fetch("/api/admin/media?action=cleanup-orphans", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data) {
        setCleanupResult({
          deletedCount: data.data.deletedCount,
          freedMB: data.data.freedMB,
          remainingCount: data.data.remainingCount
        });
        await fetchMedia();
      } else {
        alert(isArabic ? "فشلت عملية التنظيف" : "Cleanup failed");
      }
    } catch (e) {
      console.error("Cleanup error:", e);
      alert(isArabic ? "خطأ أثناء تنظيف الملفات" : "Error purging orphaned files");
    } finally {
      setCleaningOrphans(false);
    }
  }

  function handleCopy(url: string) {
    void navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  async function handleDeleteRawBlob(url: string) {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف هذا الملف نهائياً؟" : "Delete this file permanently?")) return;
    try {
      const res = await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRawBlobs(prev => prev.filter(b => b.url !== url));
      } else {
        alert(isArabic ? "فشل الحذف" : "Delete failed");
      }
    } catch (e) {
      console.error(e);
      alert(isArabic ? "خطأ أثناء الحذف" : "Error deleting file");
    }
  }

  async function handleDeleteEntityFile(folder: EntityFolder, file: MediaFile) {
    if (!confirm(isArabic ? `هل تريد حذف مستند "${file.titleAr}" من مجلد ${folder.name}؟` : `Delete document "${file.titleEn}" from ${folder.name}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: folder.type,
          entityId: folder.id,
          field: file.field,
          url: file.url
        })
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        const updatedFiles = folder.files.filter(f => f.id !== file.id);
        const updatedFolder = { ...folder, files: updatedFiles, filesCount: updatedFiles.length };
        setSelectedFolder(updatedFolder);

        if (folder.type === "worker") {
          setWorkersFolders(prev => prev.map(w => w.id === folder.id ? updatedFolder : w));
        } else if (folder.type === "client") {
          setClientsFolders(prev => prev.map(c => c.id === folder.id ? updatedFolder : c));
        } else if (folder.type === "vendor") {
          setVendorsFolders(prev => prev.map(v => v.id === folder.id ? updatedFolder : v));
        }
      } else {
        alert(isArabic ? "فشل الحذف" : "Delete failed");
      }
    } catch (e) {
      console.error("Delete entity file error", e);
      alert(isArabic ? "حدث خطأ أثناء الحذف" : "Error deleting file");
    }
  }

  async function handleDirectUploadToFolder(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedFolder) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `${selectedFolder.type}s/${selectedFolder.id}`);
      formData.append("purpose", targetField);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      const newUrl = uploadData.url || uploadData.data?.url;

      if (!newUrl) throw new Error("Upload failed");

      if (selectedFolder.type === "worker") {
        await patchApiData(`/admin/workers/${selectedFolder.id}`, {
          [targetField]: newUrl
        });
      }

      setUploadModalOpen(false);
      await fetchMedia();
      alert(isArabic ? "تم رفع وحفظ المستند داخل المجلد بنجاح!" : "File uploaded & saved to folder successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || (isArabic ? "فشل الرفع" : "Upload failed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleGeneralUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "general");
        await fetch("/api/upload", { method: "POST", body: formData });
      }
      await fetchMedia();
    } catch (e) {
      console.error(e);
      alert(isArabic ? "فشل الرفع" : "Upload failed");
    } finally {
      setUploading(false);
      if (generalFileInputRef.current) generalFileInputRef.current.value = "";
    }
  }

  // Filter folders by search query
  const filterFolders = (folders: EntityFolder[]) => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase().trim();
    return folders.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.phone && f.phone.includes(q)) ||
      (f.profession && f.profession.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q))
    );
  };

  const filteredWorkers = filterFolders(workersFolders);
  const filteredClients = filterFolders(clientsFolders);
  const filteredVendors = filterFolders(vendorsFolders);
  const filteredSystem = filterFolders(systemFolders);

  const filteredRawBlobs = rawBlobs.filter(b =>
    !searchQuery.trim() || b.pathname.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const totalEntityFiles =
    workersFolders.reduce((acc, f) => acc + f.filesCount, 0) +
    clientsFolders.reduce((acc, f) => acc + f.filesCount, 0) +
    vendorsFolders.reduce((acc, f) => acc + f.filesCount, 0) +
    systemFolders.reduce((acc, f) => acc + f.filesCount, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <FolderOpen className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {isArabic ? "معرض الوسائط والمستندات المنظم" : "Organized Media & Documents"}
            </h1>
          </div>
          <p className="text-onyx-300 text-xs md:text-sm">
            {isArabic
              ? "مجلدات مخصصة لكل فني، عميل، ومتجر لتنظيم وسهولة العثور على صور الهوية والفيش والسيلفي والملفات."
              : "Dedicated folders for every technician, client, and vendor to easily find IDs, records, selfies & docs."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Purge / Cleanup Orphaned Files */}
          <button
            type="button"
            onClick={handleCleanupOrphans}
            disabled={cleaningOrphans || loading}
            className="px-4 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title={isArabic ? "فحص وحذف الملفات المهملة واليتيمة" : "Purge Orphaned Junk Files"}
          >
            {cleaningOrphans ? <Loader2 className="h-4 w-4 animate-spin text-red-400" /> : <Trash2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isArabic ? "حذف الملفات المهملة" : "Purge Junk Files"}</span>
          </button>

          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-3 bg-onyx-900 border border-white/10 rounded-2xl text-onyx-300 hover:text-white hover:bg-onyx-800 transition-all shadow-md"
            title={isArabic ? "تحديث القائمة" : "Refresh"}
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <input
            type="file"
            ref={generalFileInputRef}
            onChange={handleGeneralUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => generalFileInputRef.current?.click()}
            disabled={uploading}
            className="px-5 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-onyx-950 font-black text-xs shadow-lg shadow-gold-500/20 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            <span>{isArabic ? "رفع وسائط عامة" : "Upload General Media"}</span>
          </button>
        </div>
      </div>

      {/* Cleanup Result Alert Banner */}
      {cleanupResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-400 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {isArabic
                ? `اكتمل الفحص والتنظيف بنجاح! تم مسح ${cleanupResult.deletedCount} ملفات مهملة وغير مرتبطة بالكامل، وتوفير ${cleanupResult.freedMB} ميجابايت من المساحة. إجمالي الملفات النشطة والمصنفة المتبقية: ${cleanupResult.remainingCount} ملف.`
                : `Purge complete! Deleted ${cleanupResult.deletedCount} orphaned files, freed ${cleanupResult.freedMB} MB. Remaining active files: ${cleanupResult.remainingCount}.`}
            </span>
          </div>
          <button onClick={() => setCleanupResult(null)} className="text-onyx-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation if inside folder */}
      {selectedFolder && (
        <div className="bg-onyx-900/80 border border-gold-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold min-w-0">
            <button
              onClick={() => setSelectedFolder(null)}
              className="text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Folder className="h-3.5 w-3.5" />
              <span>{isArabic ? "المعرض الرئيسي" : "Media Root"}</span>
            </button>
            <span className="text-onyx-600">/</span>
            <span className="text-onyx-400">
              {selectedFolder.type === "worker"
                ? (isArabic ? "الفنيين والصنايعية" : "Workers")
                : selectedFolder.type === "client"
                  ? (isArabic ? "العملاء" : "Clients")
                  : selectedFolder.type === "vendor"
                    ? (isArabic ? "المتاجر والموردين" : "Vendors")
                    : (isArabic ? "أصول النظام" : "System")}
            </span>
            <span className="text-onyx-600">/</span>
            <span className="text-white font-black truncate">{selectedFolder.name}</span>
          </div>

          <button
            onClick={() => setSelectedFolder(null)}
            className="px-3 py-1 rounded-xl bg-onyx-800 hover:bg-onyx-700 text-onyx-300 hover:text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            {isArabic ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            <span>{isArabic ? "رجوع لكل المجلدات" : "Back to Folders"}</span>
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      {!selectedFolder && (
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {[
            { key: "all", labelAr: "نظرة عامة والكل", labelEn: "Overview & All", count: totalEntityFiles + rawBlobs.length, icon: Layers },
            { key: "workers", labelAr: "فولدرات الفنيين والصنايعية", labelEn: "Workers Folders", count: workersFolders.length, icon: Wrench },
            { key: "clients", labelAr: "فولدرات العملاء", labelEn: "Clients Folders", count: clientsFolders.length, icon: Users },
            { key: "vendors", labelAr: "فولدرات المتاجر والموردين", labelEn: "Vendors Folders", count: vendorsFolders.length, icon: ShoppingBag },
            { key: "system", labelAr: "سلايدر النظام والحملات", labelEn: "System & Marketing", count: systemFolders.reduce((acc, f) => acc + f.filesCount, 0), icon: Sparkles },
            { key: "avatars", labelAr: "مكتبة الصور الشخصية", labelEn: "Avatar Templates", count: avatarTemplates.length, icon: Camera },
            { key: "general", labelAr: "ملفات عامة بدون تصنيف", labelEn: "General Uploads", count: rawBlobs.length, icon: ImageIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border",
                  isActive
                    ? "bg-gold-500 text-onyx-950 border-gold-400 shadow-md shadow-gold-500/20"
                    : "bg-onyx-900/60 text-onyx-400 border-white/5 hover:bg-onyx-800 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black",
                  isActive ? "bg-onyx-950/20 text-onyx-950" : "bg-onyx-950 text-gold-400"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-onyx-400" />
        <input
          type="text"
          placeholder={isArabic ? "ابحث باسم الفني أو العميل أو المتجر أو رقم الهاتف أو اسم الملف..." : "Search by name, phone, trade, or file..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-onyx-950 border border-white/10 rounded-2xl pr-11 pl-4 py-3.5 text-white placeholder-onyx-500 text-xs sm:text-sm outline-none focus:border-gold-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-onyx-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* CASE 1: INSIDE A SPECIFIC FOLDER VIEW                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedFolder ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Folder Header Card */}
          <div className="bg-onyx-900 border border-gold-500/30 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-onyx-950 border-2 border-gold-500/40 overflow-hidden shrink-0 shadow-lg">
                <img
                  src={selectedFolder.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedFolder.name)}&background=1f1f23&color=eab308&bold=true`}
                  alt={selectedFolder.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{selectedFolder.name}</h2>
                  {selectedFolder.status && (
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                      selectedFolder.status === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {selectedFolder.status === "VERIFIED" ? (isArabic ? "موثق" : "Verified") : (isArabic ? "قيد التوثيق" : "Pending")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-onyx-400 flex flex-wrap items-center gap-2">
                  {selectedFolder.profession && <span className="text-gold-400 font-bold">{selectedFolder.profession}</span>}
                  {selectedFolder.phone && <span dir="ltr" className="font-mono text-white">• {selectedFolder.phone}</span>}
                  {selectedFolder.email && <span>• {selectedFolder.email}</span>}
                </p>
                <p className="text-[11px] text-onyx-500">
                  {isArabic
                    ? `إجمالي المستندات والصور في هذا المجلد: ${selectedFolder.files.length}`
                    : `Total documents in folder: ${selectedFolder.files.length}`}
                </p>
              </div>
            </div>

            {/* Folder Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              {selectedFolder.type === "worker" && (
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-onyx-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "رفع مستند جديد لهذا الفني" : "Upload Document"}</span>
                </button>
              )}

              <a
                href={selectedFolder.type === "worker" ? `/${locale}/workers/${selectedFolder.id}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-onyx-950 border border-white/10 hover:border-gold-500 text-onyx-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{isArabic ? "الملف الشخصي" : "View Profile"}</span>
              </a>
            </div>
          </div>

          {/* Files Grid inside Folder */}
          {selectedFolder.files.length === 0 ? (
            <div className="onyx-card py-16 text-center text-onyx-500 space-y-2">
              <FolderOpen className="h-12 w-12 mx-auto text-onyx-700 stroke-[1.2]" />
              <p className="text-sm font-bold text-white">{isArabic ? "المجلد فارغ حالياً" : "This folder is currently empty"}</p>
              <p className="text-xs text-onyx-400">{isArabic ? "لم يرفع صاحب هذا الحساب أي مستندات أو صور بعد." : "No documents uploaded yet."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedFolder.files.map(file => (
                <div
                  key={file.id}
                  className="bg-onyx-950 border border-white/10 rounded-2xl overflow-hidden hover:border-gold-500/40 transition-all flex flex-col justify-between group shadow-lg"
                >
                  {/* File Preview */}
                  <div
                    onClick={() => setLightboxUrl(file.url)}
                    className="relative aspect-video w-full bg-black cursor-pointer overflow-hidden flex items-center justify-center border-b border-white/5"
                  >
                    <img
                      src={file.url}
                      alt={file.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                      <Eye className="h-4 w-4" />
                      <span>{isArabic ? "معاينة كاملة" : "Full View"}</span>
                    </div>

                    <span className="absolute top-2 right-2 bg-onyx-950/80 backdrop-blur-md text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-lg text-[9px] font-black">
                      {isArabic ? file.titleAr : file.titleEn}
                    </span>
                  </div>

                  {/* File Footer */}
                  <div className="p-3 space-y-2">
                    <p className="text-xs font-bold text-white truncate" title={file.titleAr}>
                      {isArabic ? file.titleAr : file.titleEn}
                    </p>
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                      <button
                        onClick={() => handleCopy(file.url)}
                        className="p-1.5 rounded-lg bg-onyx-900 border border-white/5 hover:bg-gold-500 hover:text-black text-onyx-300 transition"
                        title={isArabic ? "نسخ الرابط" : "Copy Link"}
                      >
                        {copiedUrl === file.url ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-onyx-900 border border-white/5 hover:bg-gold-500 hover:text-black text-onyx-300 transition"
                        title={isArabic ? "فتح الرابط" : "Open URL"}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteEntityFile(selectedFolder, file)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition"
                        title={isArabic ? "حذف المستند" : "Delete Document"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────── */
        /* CASE 2: ROOT BROWSER VIEW (CATEGORIZED FOLDERS & STATS)      */
        /* ──────────────────────────────────────────────────────────── */
        <div className="space-y-8 animate-fadeIn">
          {/* TAB: ALL (OVERVIEW WITH SUMMARY FOLDERS) */}
          {activeTab === "all" && (
            <div className="space-y-8">
              {/* Category summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab("workers")}
                  className="bg-onyx-900/60 border border-white/10 hover:border-gold-500/50 p-5 rounded-3xl transition-all cursor-pointer group shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-12 w-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-black transition-colors">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-white">{workersFolders.length}</span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-gold-400 transition-colors">
                    {isArabic ? "مجلدات الفنيين والصنايعية" : "Workers Folders"}
                  </h3>
                  <p className="text-xs text-onyx-400 mt-1">
                    {isArabic
                      ? `يشمل بطاقات الرقم القومي والفيش والسيلفي ومستندات المرافق.`
                      : `Includes national ID cards, criminal records, selfies & utility bills.`}
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("clients")}
                  className="bg-onyx-900/60 border border-white/10 hover:border-blue-500/50 p-5 rounded-3xl transition-all cursor-pointer group shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-white">{clientsFolders.length}</span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
                    {isArabic ? "مجلدات العملاء" : "Clients Folders"}
                  </h3>
                  <p className="text-xs text-onyx-400 mt-1">
                    {isArabic ? "صور الحسابات الشخصية ومرفقات طلبات الصيانة." : "Client avatars and service request photos."}
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("vendors")}
                  className="bg-onyx-900/60 border border-white/10 hover:border-emerald-500/50 p-5 rounded-3xl transition-all cursor-pointer group shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-white">{vendorsFolders.length}</span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                    {isArabic ? "مجلدات المتاجر والموردين" : "Vendors Folders"}
                  </h3>
                  <p className="text-xs text-onyx-400 mt-1">
                    {isArabic ? "السجلات التجارية، البطاقات الضريبية، وشعارات المتاجر." : "Commercial registers, tax cards & logos."}
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("system")}
                  className="bg-onyx-900/60 border border-white/10 hover:border-amber-500/50 p-5 rounded-3xl transition-all cursor-pointer group shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-white">{systemFolders.reduce((acc, f) => acc + f.filesCount, 0)}</span>
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                    {isArabic ? "سلايدر وحملات النظام" : "System & Marketing"}
                  </h3>
                  <p className="text-xs text-onyx-400 mt-1">
                    {isArabic ? "سلايدر الصفحة الرئيسية وبانرات الإعلانات الممولة." : "Hero sliders and sponsored campaign banners."}
                  </p>
                </div>
              </div>

              {/* Workers Folders Section Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gold-500" />
                    <span>{isArabic ? "فولدرات الفنيين الموثقين والجدد" : "Technicians Folders"}</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab("workers")}
                    className="text-xs text-gold-400 font-bold hover:underline"
                  >
                    {isArabic ? "عرض الكل" : "View All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredWorkers.slice(0, 8).map(w => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedFolder(w)}
                      className="bg-onyx-900/60 border border-white/10 hover:border-gold-500/50 p-4 rounded-2xl transition-all cursor-pointer group shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-onyx-950 border border-gold-500/30 overflow-hidden shrink-0">
                          <img
                            src={w.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=1f1f23&color=eab308&bold=true`}
                            alt={w.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-gold-400 transition-colors">
                            {w.name}
                          </p>
                          <p className="text-[10px] text-onyx-400 truncate">{w.profession || (isArabic ? "صنايعي" : "Technician")}</p>
                          <p className="text-[10px] text-gold-500 font-bold mt-0.5">
                            {isArabic ? `${w.filesCount} مستندات` : `${w.filesCount} files`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WORKERS */}
          {activeTab === "workers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gold-500" />
                    <span>{isArabic ? "مجلدات الصنايعية والفنيين" : "Technicians & Workers Folders"}</span>
                  </h2>
                  <p className="text-xs text-onyx-400 mt-0.5">
                    {isArabic ? "اضغط على أي فولدر لاستعراض بطاقة الرقم القومي، الفيش، السيلفي، والصورة الشخصية." : "Click any folder to view documents."}
                  </p>
                </div>
                <span className="text-xs text-onyx-400 font-bold">
                  {isArabic ? `إجمالي الفولدرات: ${filteredWorkers.length}` : `Total: ${filteredWorkers.length}`}
                </span>
              </div>

              {filteredWorkers.length === 0 ? (
                <div className="onyx-card py-16 text-center text-onyx-500">
                  <Wrench className="h-10 w-10 mx-auto text-onyx-700 mb-2 stroke-[1.2]" />
                  <p className="text-sm font-bold text-white">{isArabic ? "لا توجد مجلدات تطابق بحثك" : "No folders found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredWorkers.map(w => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedFolder(w)}
                      className="bg-onyx-900/60 border border-white/10 hover:border-gold-500/50 p-4 rounded-2xl transition-all cursor-pointer group shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-onyx-950 border border-gold-500/30 overflow-hidden shrink-0">
                          <img
                            src={w.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=1f1f23&color=eab308&bold=true`}
                            alt={w.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-gold-400 transition-colors">
                            {w.name}
                          </p>
                          <p className="text-[10px] text-onyx-400 truncate">{w.profession || "صنايعي"}</p>
                          <p className="text-[10px] text-onyx-500 dir-ltr font-mono">{w.phone}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-gold-400 font-bold bg-gold-500/10 px-2 py-0.5 rounded-md border border-gold-500/20">
                          {isArabic ? `${w.filesCount} مستندات` : `${w.filesCount} files`}
                        </span>
                        <span className="text-onyx-400 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          <span>{isArabic ? "فتح المجلد" : "Open"}</span>
                          {isArabic ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CLIENTS */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{isArabic ? "مجلدات العملاء والمستندات" : "Clients Folders"}</span>
                  </h2>
                </div>
                <span className="text-xs text-onyx-400 font-bold">
                  {isArabic ? `إجمالي الفولدرات: ${filteredClients.length}` : `Total: ${filteredClients.length}`}
                </span>
              </div>

              {filteredClients.length === 0 ? (
                <div className="onyx-card py-16 text-center text-onyx-500">
                  <Users className="h-10 w-10 mx-auto text-onyx-700 mb-2 stroke-[1.2]" />
                  <p className="text-sm font-bold text-white">{isArabic ? "لا توجد مجلدات عملاء تطابق بحثك" : "No client folders found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedFolder(c)}
                      className="bg-onyx-900/60 border border-white/10 hover:border-blue-500/50 p-4 rounded-2xl transition-all cursor-pointer group shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-onyx-950 border border-blue-500/30 overflow-hidden shrink-0">
                          <img
                            src={c.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1e293b&color=38bdf8&bold=true`}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-blue-400 transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-onyx-400 dir-ltr font-mono">{c.phone}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                          {isArabic ? `${c.filesCount} ملفات` : `${c.filesCount} files`}
                        </span>
                        <span className="text-onyx-400 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          <span>{isArabic ? "فتح المجلد" : "Open"}</span>
                          {isArabic ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: VENDORS */}
          {activeTab === "vendors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-500" />
                    <span>{isArabic ? "مجلدات المتاجر والموردين" : "Vendors Folders"}</span>
                  </h2>
                </div>
                <span className="text-xs text-onyx-400 font-bold">
                  {isArabic ? `إجمالي الفولدرات: ${filteredVendors.length}` : `Total: ${filteredVendors.length}`}
                </span>
              </div>

              {filteredVendors.length === 0 ? (
                <div className="onyx-card py-16 text-center text-onyx-500">
                  <ShoppingBag className="h-10 w-10 mx-auto text-onyx-700 mb-2 stroke-[1.2]" />
                  <p className="text-sm font-bold text-white">{isArabic ? "لا توجد مجلدات متاجر تطابق بحثك" : "No vendor folders found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredVendors.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedFolder(v)}
                      className="bg-onyx-900/60 border border-white/10 hover:border-emerald-500/50 p-4 rounded-2xl transition-all cursor-pointer group shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-onyx-950 border border-emerald-500/30 overflow-hidden shrink-0">
                          <img
                            src={v.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=064e3b&color=34d399&bold=true`}
                            alt={v.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-emerald-400 transition-colors">
                            {v.name}
                          </p>
                          <p className="text-[10px] text-onyx-400 truncate">{v.category || "متجر"}</p>
                          <p className="text-[10px] text-onyx-500 dir-ltr font-mono">{v.phone}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {isArabic ? `${v.filesCount} ملفات` : `${v.filesCount} files`}
                        </span>
                        <span className="text-onyx-400 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          <span>{isArabic ? "فتح المجلد" : "Open"}</span>
                          {isArabic ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SYSTEM MARKETING ASSETS */}
          {activeTab === "system" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold-500" />
                    <span>{isArabic ? "أصول وسلايدر النظام والحملات الإعلانية" : "System & Marketing Assets"}</span>
                  </h2>
                  <p className="text-xs text-onyx-400 mt-0.5">
                    {isArabic ? "صور سلايدر الصفحة الرئيسية، وبانرات الإعلانات الممولة المعتمدة." : "Homepage sliders and sponsored campaign banners."}
                  </p>
                </div>
                <span className="text-xs text-onyx-400 font-bold">
                  {isArabic ? `إجمالي الأصول: ${systemFolders.reduce((acc, f) => acc + f.filesCount, 0)}` : `Total: ${systemFolders.reduce((acc, f) => acc + f.filesCount, 0)}`}
                </span>
              </div>

              {systemFolders.length === 0 ? (
                <div className="onyx-card py-16 text-center text-onyx-500">
                  <Sparkles className="h-10 w-10 mx-auto text-onyx-700 mb-2 stroke-[1.2]" />
                  <p className="text-sm font-bold text-white">{isArabic ? "لا توجد أصول نظام حالياً" : "No system assets found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {systemFolders.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder)}
                      className="bg-onyx-900/60 border border-white/10 hover:border-gold-500/50 p-5 rounded-3xl transition-all cursor-pointer group shadow-xl hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-white">{folder.filesCount}</span>
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                        {folder.name}
                      </h3>
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-gold-400 font-bold bg-gold-500/10 px-2 py-0.5 rounded-md border border-gold-500/20">
                          {isArabic ? `${folder.filesCount} ملفات` : `${folder.filesCount} files`}
                        </span>
                        <span className="text-onyx-400 group-hover:text-white transition-colors flex items-center gap-1 font-bold">
                          <span>{isArabic ? "فتح واستعراض" : "Open Folder"}</span>
                          {isArabic ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: AVATAR LIBRARY */}
          {activeTab === "avatars" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-gold-500" />
                    <span>{isArabic ? "مكتبة الصور الشخصية المعتمدة (Avatars)" : "Avatar Library Templates"}</span>
                  </h2>
                  <p className="text-xs text-onyx-400 mt-0.5">
                    {isArabic ? "صور معتمدة يمكن تخصيصها لأي صنايعي حسب مهنته." : "Approved avatars for workers."}
                  </p>
                </div>
                <a
                  href={`/${locale}/admin/avatars`}
                  className="px-3.5 py-1.5 rounded-xl bg-gold-500 text-onyx-950 font-bold text-xs hover:bg-gold-400 transition"
                >
                  {isArabic ? "إدارة مكتبة الصور الشخصية" : "Manage Avatars"}
                </a>
              </div>

              {avatarTemplates.length === 0 ? (
                <div className="onyx-card py-16 text-center text-onyx-500">
                  <Sparkles className="h-10 w-10 mx-auto text-onyx-700 mb-2 stroke-[1.2]" />
                  <p className="text-sm font-bold text-white">{isArabic ? "لا توجد صور شخصية معتمدة بالمكتبة بعد" : "No avatars in library"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {avatarTemplates.map(av => (
                    <div
                      key={av.id}
                      className="bg-onyx-900 border border-white/5 rounded-2xl p-2 flex flex-col items-center gap-2 group hover:border-gold-500/40 transition"
                    >
                      <div
                        onClick={() => setLightboxUrl(av.url)}
                        className="h-20 w-20 rounded-xl overflow-hidden bg-black cursor-pointer"
                      >
                        <img src={av.url} alt="Avatar" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-[10px] text-onyx-400 font-bold truncate max-w-full">
                        {av.category || (isArabic ? "عام" : "General")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: GENERAL / RAW BLOBS */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gold-500" />
                    <span>{isArabic ? "كل ملفات التخزين السحابي العامة" : "General Cloud Media"}</span>
                  </h2>
                </div>
                <span className="text-xs text-onyx-400 font-bold">
                  {isArabic ? `إجمالي الملفات: ${filteredRawBlobs.length}` : `Total: ${filteredRawBlobs.length}`}
                </span>
              </div>

              {filteredRawBlobs.length === 0 ? (
                <div className="onyx-card py-16 text-center text-onyx-500">
                  <ImageIcon className="h-10 w-10 mx-auto text-onyx-700 mb-2 stroke-[1.2]" />
                  <p className="text-sm font-bold text-white">{isArabic ? "لم نجد أي ملفات عامة" : "No files found"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredRawBlobs.map(blob => {
                    const filename = blob.pathname.split("/").pop() || blob.pathname;
                    return (
                      <div
                        key={blob.url}
                        className="bg-onyx-950 border border-white/5 rounded-2xl overflow-hidden hover:border-gold-500/30 transition flex flex-col justify-between group"
                      >
                        <div
                          onClick={() => setLightboxUrl(blob.url)}
                          className="aspect-video w-full bg-black cursor-pointer overflow-hidden flex items-center justify-center border-b border-white/5"
                        >
                          <img src={blob.url} alt={filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-2.5 space-y-1">
                          <p className="text-xs text-white truncate font-medium" title={filename}>{filename}</p>
                          <div className="flex items-center justify-between text-[10px] text-onyx-400">
                            <span>{formatFileSize(blob.size)}</span>
                            <button
                              onClick={() => handleDeleteRawBlob(blob.url)}
                              className="text-red-400 hover:text-white p-1"
                              title={isArabic ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: DIRECT UPLOAD INTO SPECIFIC FOLDER                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {uploadModalOpen && selectedFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-onyx-950 border border-gold-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-gold-500" />
                  <span>{isArabic ? `رفع مستند لمجلد: ${selectedFolder.name}` : `Upload to ${selectedFolder.name}`}</span>
                </h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="text-onyx-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-onyx-300 block mb-1.5">
                  {isArabic ? "اختر نوع المستند المراد رفعه:" : "Select Document Type:"}
                </label>
                <select
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  className="w-full bg-onyx-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-gold-500"
                >
                  <option value="avatarUrl">{isArabic ? "👤 الصورة الشخصية للفني (Avatar)" : "Profile Avatar"}</option>
                  <option value="nationalIdFront">{isArabic ? "🪪 وجه بطاقة الرقم القومي" : "National ID Front"}</option>
                  <option value="nationalIdBack">{isArabic ? "🪪 ظهر بطاقة الرقم القومي" : "National ID Back"}</option>
                  <option value="selfieWithId">{isArabic ? "🤳 سيلفي الفني مع البطاقة" : "Selfie with ID"}</option>
                  <option value="criminalRecord">{isArabic ? "📄 صحيفة الحالة الجنائية (الفيش)" : "Criminal Record"}</option>
                  <option value="utilityBillUrl">{isArabic ? "🧾 إيصال المرافق" : "Utility Bill"}</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-white/10 hover:border-gold-500/50 rounded-2xl p-6 text-center transition-all bg-onyx-900/40">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDirectUploadToFolder}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                      <span className="text-xs font-bold text-gold-500">{isArabic ? "جاري الرفع والحفظ..." : "Uploading..."}</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{isArabic ? "اضغط لاختيار صورة من جهازك" : "Browse from device"}</p>
                        <p className="text-[10px] text-onyx-400 mt-0.5">{isArabic ? "JPG, PNG, WebP (بحد أقصى 5MB)" : "Max 5MB"}</p>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxUrl}
              alt="Zoomed"
              className="max-h-[85vh] max-w-full rounded-2xl border border-white/20 shadow-2xl object-contain"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 bg-onyx-900 text-white p-2.5 rounded-full border border-white/20 hover:bg-gold-500 hover:text-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
