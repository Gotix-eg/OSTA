"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus, User, Phone, Mail, Search, Loader2, Wrench, Star,
  ShieldCheck, Trash2, Wallet, Eye, X, Edit, Users,
  CheckCircle2, XCircle, Clock3, AlertTriangle, ExternalLink, Settings, UserCheck, Sparkles
} from "lucide-react";
import { fetchApiData, postApiData, patchApiData, deleteApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { workerProfessions } from "@/lib/geo-data";
import { ImageCropModal } from "@/components/shared/avatar-crop-modal";
import { WorkerVerificationWizard, type WorkerForWizard } from "./worker-verification-wizard";
import { WorkerHistoryLogs } from "./worker-history-logs";

type Worker = {
  id: string;
  userId: string;
  orderQuota: number;
  trialExpiresAt: string | null;
  subscriptionExpiresAt: string | null;
  rating: number;
  totalJobsCompleted: number;
  verificationStatus: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  walletBalance: number;
  nationalIdNumber?: string | null;
  nationalIdFront?: string | null;
  nationalIdBack?: string | null;
  selfieWithId?: string | null;
  criminalRecord?: string | null;
  utilityBillUrl?: string | null;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
  yearsOfExperience?: number;
  profession?: string | null;
  bio?: string | null;
  createdAt?: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
    avatarUrl?: string | null;
    lastLoginAt?: string | null;
  };
};

export type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "NO_BALANCE" | "REJECTED";

function formatApprovalDateTime(dateStr?: string | null, isArabic: boolean = true) {
  if (!dateStr) return isArabic ? "غير موثق بعد" : "N/A";
  try {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const time = d.toLocaleTimeString(isArabic ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${date} ${isArabic ? "الساعة" : "at"} ${time}`;
  } catch (e) {
    return dateStr;
  }
}

function getWorkerPhoto(worker: Worker): string {
  if (worker.user.avatarUrl) return worker.user.avatarUrl;
  if (worker.selfieWithId) return worker.selfieWithId;
  if (worker.nationalIdFront) return worker.nationalIdFront;

  const initials = encodeURIComponent(`${worker.user.firstName || ""} ${worker.user.lastName || ""}`.trim() || "Worker");
  return `https://ui-avatars.com/api/?name=${initials}&background=1f1f23&color=eab308&bold=true&size=128`;
}

export function AdminWorkersManagement({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>("ALL");
  const [actionId, setActionId] = useState<string | null>(null);

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeLightboxDoc, setActiveLightboxDoc] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ key: string; url: string; label: string } | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [wizardWorker, setWizardWorker] = useState<WorkerForWizard | null>(null);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProfession, setEditProfession] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editYearsOfExperience, setEditYearsOfExperience] = useState<number | "">(0);
  const [editQuota, setEditQuota] = useState<number | "">(0);
  const [editStatus, setEditStatus] = useState<string>("PENDING");

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchApiData<{ data: Worker[] }>("/admin/workers", { data: [] }).then(res => {
      const workerList = Array.isArray(res) ? res : (res as any).data || [];
      setWorkers(workerList);
      setLoading(false);
    }).catch(err => {
      console.error("AdminWorkersManagement: Fetch error:", err);
      setLoading(false);
    });
  }, []);

  // Verification decision (Verify or Reject)
  async function handleDecision(id: string, status: "VERIFIED" | "REJECTED") {
    setActionId(id);
    try {
      await patchApiData(`/admin/workers/${id}/verify`, { status });
      const now = new Date();
      const trialExpiresAt = status === "VERIFIED" ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, verificationStatus: status, trialExpiresAt } : w));
      if (selectedWorker && selectedWorker.id === id) {
        setSelectedWorker(prev => prev ? { ...prev, verificationStatus: status, trialExpiresAt } : null);
      }
      setDetailsModalOpen(false);
    } catch (err) {
      alert(isArabic ? "فشل تحديث حالة التوثيق" : "Failed to update verification status");
    } finally {
      setActionId(null);
    }
  }

  async function handleAddQuota(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/workers/${id}/quota`, { amount: 10 });
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, orderQuota: w.orderQuota + 10 } : w));
    } finally {
      setActionId(null);
    }
  }

  async function handlePhotoEditConfirm(blob: Blob) {
    if (!editingDoc || !selectedWorker) return;
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", new File([blob], "edited-doc.jpg", { type: "image/jpeg" }));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Failed to upload edited photo");
      const uploadData = await uploadRes.json();
      const newUrl = uploadData.url;

      const patchRes = await patchApiData(`/admin/workers/${selectedWorker.id}`, {
        [editingDoc.key]: newUrl
      });
      
      if (patchRes.ok && patchRes.data) {
        setWorkers(prev => prev.map(w => w.id === selectedWorker.id ? { ...w, ...patchRes.data } : w));
        setSelectedWorker({ ...selectedWorker, ...patchRes.data });
      }
    } catch (err) {
      alert(isArabic ? "فشل تحديث الصورة" : "Failed to update photo");
    } finally {
      setActionLoading(false);
      setEditingDoc(null);
    }
  }

  async function handleDeleteWorker() {
    if (!selectedWorker) return;
    setActionLoading(true);
    try {
      await deleteApiData(`/admin/users/${selectedWorker.userId}`);
      setWorkers(prev => prev.filter(w => w.id !== selectedWorker.id));
      setDeleteModalOpen(false);
      setSelectedWorker(null);
    } catch (err) {
      alert(isArabic ? "فشل حذف الصنايعي" : "Failed to delete worker");
    } finally {
      setActionLoading(false);
    }
  }

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const total = workers.length;
    const active = workers.filter(w => w.verificationStatus === "VERIFIED").length;
    const pending = workers.filter(w => w.verificationStatus !== "VERIFIED" && w.verificationStatus !== "REJECTED").length;
    const noBalance = workers.filter(w => w.orderQuota <= 0).length;
    const rejected = workers.filter(w => w.verificationStatus === "REJECTED").length;
    return { total, active, pending, noBalance, rejected };
  }, [workers]);

  // Filtered workers list
  const filtered = useMemo(() => {
    return workers.filter(w => {
      const matchesSearch =
        w.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        w.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        w.user.phone.includes(search) ||
        (w.nationalIdNumber && w.nationalIdNumber.includes(search));

      let matchesFilter = true;
      if (activeStatusFilter === "ACTIVE") {
        matchesFilter = w.verificationStatus === "VERIFIED";
      } else if (activeStatusFilter === "PENDING") {
        matchesFilter = w.verificationStatus !== "VERIFIED" && w.verificationStatus !== "REJECTED";
      } else if (activeStatusFilter === "NO_BALANCE") {
        matchesFilter = w.orderQuota <= 0;
      } else if (activeStatusFilter === "REJECTED") {
        matchesFilter = w.verificationStatus === "REJECTED";
      }

      return matchesSearch && matchesFilter;
    });
  }, [workers, search, activeStatusFilter]);

  // Toggle filter on second click
  const toggleFilter = (filter: StatusFilter) => {
    setActiveStatusFilter(prev => (prev === filter ? "ALL" : filter));
  };

  const openEditModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setEditFirstName(worker.user.firstName);
    setEditLastName(worker.user.lastName);
    setEditPhone(worker.user.phone);
    setEditProfession(worker.profession || "");
    setEditBio(worker.bio || "");
    setEditYearsOfExperience(worker.yearsOfExperience ?? 0);
    setEditQuota(worker.orderQuota ?? 0);
    setEditStatus(worker.verificationStatus || "PENDING");
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-slideUp">
      {/* Header Card & Search */}
      <div className="onyx-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-gold-500/10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isArabic ? "إدارة الصنايعية" : "Worker Management"}
          </h1>
          <p className="text-onyx-400 text-sm font-medium">
            {isArabic
              ? `إجمالي الكوادر: ${metrics.total} صنايعي (${metrics.active} نشط • ${metrics.pending} بانتظار الموافقة • ${metrics.noBalance} بدون رصيد)`
              : `Total Workforce: ${metrics.total} (${metrics.active} active • ${metrics.pending} to approve • ${metrics.noBalance} no balance)`}
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-onyx-500" />
          <input
            type="text"
            placeholder={isArabic ? "بحث بالاسم، الرقم القومي أو الهاتف..." : "Search by name, ID or phone..."}
            className="w-full bg-onyx-900/50 border border-onyx-700 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Interactive Statistics Metric Blocks */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => toggleFilter("ALL")}
          className={cn(
            "onyx-card p-6 text-start flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.02]",
            activeStatusFilter === "ALL"
              ? "border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/10 ring-2 ring-gold-500/30"
              : "border-white/5 hover:border-gold-500/30"
          )}
        >
          <div>
            <span className="text-xs font-bold text-onyx-400 block">{isArabic ? "إجمالي الصنايعية" : "Total Workers"}</span>
            <span className="text-3xl font-black text-white mt-1 block">{metrics.total}</span>
            <span className="text-[11px] text-onyx-500 mt-1 block font-medium">
              {isArabic ? "عرض كافة الكوادر" : "View all professionals"}
            </span>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-2xl border flex items-center justify-center transition-colors",
            activeStatusFilter === "ALL" ? "bg-gold-500 text-onyx-950 border-gold-400" : "bg-onyx-800 border-onyx-700 text-white"
          )}>
            <Users className="h-6 w-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("ACTIVE")}
          className={cn(
            "onyx-card p-6 text-start flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.02]",
            activeStatusFilter === "ACTIVE"
              ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
              : "border-emerald-500/20 hover:border-emerald-500/40"
          )}
        >
          <div>
            <span className="text-xs font-bold text-emerald-400 block">{isArabic ? "عمال نشطون (موثقون)" : "Active Workers"}</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{metrics.active}</span>
            <span className="text-[11px] text-emerald-500/80 mt-1 block font-medium">
              {isArabic ? "حسابات جاهزة للعمل" : "Verified & active"}
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("PENDING")}
          className={cn(
            "onyx-card p-6 text-start flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.02]",
            activeStatusFilter === "PENDING"
              ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30"
              : metrics.pending > 0 ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50" : "border-white/5 hover:border-amber-500/30"
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 block">{isArabic ? "بانتظار الموافقة" : "Workers to Approve"}</span>
              {metrics.pending > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span className="text-3xl font-black text-amber-400 mt-1 block">{metrics.pending}</span>
            <span className="text-[11px] text-amber-500/80 mt-1 block font-medium">
              {isArabic ? "تحتاج فحص وتفعيل" : "Requires review"}
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock3 className="h-6 w-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter("NO_BALANCE")}
          className={cn(
            "onyx-card p-6 text-start flex items-center justify-between transition-all duration-300 cursor-pointer hover:scale-[1.02]",
            activeStatusFilter === "NO_BALANCE"
              ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/30"
              : metrics.noBalance > 0 ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40" : "border-white/5 hover:border-rose-500/30"
          )}
        >
          <div>
            <span className="text-xs font-bold text-rose-400 block">{isArabic ? "صنايعية بدون رصيد" : "Workers without Balance"}</span>
            <span className="text-3xl font-black text-rose-400 mt-1 block">{metrics.noBalance}</span>
            <span className="text-[11px] text-rose-500/80 mt-1 block font-medium">
              {isArabic ? "رصيد المهام أو المحفظة 0" : "Quota or wallet is 0"}
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </button>
      </div>

      {/* Filter Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-onyx-900/40 p-3 rounded-2xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-onyx-400 me-2">{isArabic ? "التصفية الحالية:" : "Filter View:"}</span>

          {[
            { id: "ALL", labelAr: "الكل", labelEn: "All", count: metrics.total },
            { id: "ACTIVE", labelAr: "نشط وموثق", labelEn: "Active", count: metrics.active },
            { id: "PENDING", labelAr: "بانتظار الموافقة", labelEn: "Pending Approval", count: metrics.pending },
            { id: "NO_BALANCE", labelAr: "بدون رصيد", labelEn: "No Balance", count: metrics.noBalance },
            { id: "REJECTED", labelAr: "مرفوضين", labelEn: "Rejected", count: metrics.rejected }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => toggleFilter(tab.id as StatusFilter)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeStatusFilter === tab.id
                  ? "bg-gold-500 text-onyx-950 shadow-md shadow-gold-500/10"
                  : "text-onyx-400 hover:text-white hover:bg-onyx-800/50 border border-transparent"
              )}
            >
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeStatusFilter === tab.id
                  ? "bg-onyx-950/20 text-onyx-950"
                  : "bg-onyx-800 text-onyx-300"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeStatusFilter !== "ALL" && (
          <button
            type="button"
            onClick={() => setActiveStatusFilter("ALL")}
            className="text-xs font-bold text-gold-500 hover:underline flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            {isArabic ? "إلغاء الفلتر" : "Reset Filter"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(worker => {
            const isTrialActive = worker.trialExpiresAt && new Date(worker.trialExpiresAt) > new Date();
            const trialDaysLeft = worker.trialExpiresAt ? Math.ceil((new Date(worker.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
            const isPendingVerification = worker.verificationStatus !== "VERIFIED" && worker.verificationStatus !== "REJECTED";
            const isNoBalance = worker.orderQuota <= 0 || (worker.walletBalance ?? 0) <= 0;
            const workerPhotoUrl = getWorkerPhoto(worker);

            return (
              <div key={worker.id} className={cn(
                "onyx-card p-3.5 group transition-all duration-300 bg-onyx-800/30 backdrop-blur-xl border flex flex-col gap-3",
                isPendingVerification ? "border-amber-500/30 hover:border-amber-500/50" :
                  isNoBalance ? "border-rose-500/30 hover:border-rose-500/50" :
                    "border-white/5 hover:border-gold-500/40"
              )}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-onyx-900 border border-onyx-700 overflow-hidden group-hover:border-gold-500/50 transition-all duration-500 flex items-center justify-center">
                        <img
                          src={workerPhotoUrl}
                          alt={`${worker.user.firstName} ${worker.user.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {worker.verificationStatus === "VERIFIED" ? (
                        <div className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-onyx-950" title="Verified">
                          <ShieldCheck className="h-2.5 w-2.5 text-onyx-950" />
                        </div>
                      ) : worker.verificationStatus === "REJECTED" ? (
                        <div className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-red-500 flex items-center justify-center border-2 border-onyx-950" title="Rejected">
                          <XCircle className="h-2.5 w-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-amber-500 flex items-center justify-center border-2 border-onyx-950" title="Pending Verification">
                          <Clock3 className="h-2.5 w-2.5 text-onyx-950" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h3 className="text-sm font-black text-white group-hover:text-gold-500 transition-colors truncate">
                          {worker.user.firstName} {worker.user.lastName}
                        </h3>

                        {worker.verificationStatus === "VERIFIED" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            {isArabic ? "موثق" : "Verified"}
                          </span>
                        ) : worker.verificationStatus === "REJECTED" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 shrink-0">
                            <XCircle className="h-3 w-3" />
                            {isArabic ? "مرفوض" : "Rejected"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 shrink-0 animate-pulse">
                            <Clock3 className="h-3 w-3" />
                            {isArabic ? "بانتظار" : "Pending"}
                          </span>
                        )}

                        {isNoBalance && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-0.5 shrink-0">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {isArabic ? "بدون رصيد" : "No Balance"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-onyx-400 text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gold-500/60" />
                          <span dir="ltr" className="font-mono font-bold text-white">{worker.user.phone}</span>
                        </span>

                        {worker.user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gold-500/60" />
                            <span dir="ltr" className="font-mono text-white">{worker.user.email}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-gold-500">
                          <Wrench className="h-3 w-3" />
                          {(() => {
                            const prof = workerProfessions.find(p => p.value === worker.profession);
                            return isArabic ? (prof?.labelAr || worker.profession || "غير محدد") : (prof?.labelEn || worker.profession || "Unassigned");
                          })()}
                        </span>

                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-gold-500 text-gold-500" /> {worker.rating}
                        </span>

                        <span>{worker.totalJobsCompleted} {isArabic ? "مكتمل" : "done"}</span>

                        <span>{isArabic ? `خبرة ${worker.yearsOfExperience ?? 0}س` : `${worker.yearsOfExperience ?? 0}y exp`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 md:justify-end">
                    {isTrialActive ? (
                      <span className="text-[9px] font-black uppercase tracking-wide text-gold-500/80 px-2 py-1 rounded-md border border-gold-500/20 bg-gold-500/10 whitespace-nowrap">
                        {isArabic ? `${trialDaysLeft}ي تجربة` : `${trialDaysLeft}d trial`}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wide text-emerald-500/80 px-2 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 whitespace-nowrap">
                        {isArabic ? "نشط" : "Active"}
                      </span>
                    )}

                    <div className={cn(
                      "px-2.5 py-1 rounded-lg border flex items-center gap-1.5",
                      worker.orderQuota > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                    )}>
                      <span className="text-[9px] font-bold text-onyx-400 uppercase">{isArabic ? "رصيد" : "Quota"}</span>
                      <span className={cn("text-sm font-black", worker.orderQuota > 0 ? "text-emerald-400" : "text-red-400")}>
                        {worker.orderQuota}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-end gap-1.5">
                  {/* Wizard Verification Button */}
                  {worker.verificationStatus !== "VERIFIED" && (
                    <button
                      type="button"
                      onClick={() => setWizardWorker({
                        id: worker.id,
                        userId: worker.userId,
                        name: `${worker.user.firstName} ${worker.user.lastName}`,
                        phone: worker.user.phone,
                        email: worker.user.email,
                        avatarUrl: worker.user.avatarUrl,
                        profession: worker.profession,
                        bio: worker.bio,
                        status: worker.verificationStatus,
                        nationalIdNumber: worker.nationalIdNumber,
                        nationalIdFront: worker.nationalIdFront,
                        nationalIdBack: worker.nationalIdBack,
                        selfieWithId: worker.selfieWithId,
                        criminalRecord: worker.criminalRecord,
                        utilityBillUrl: worker.utilityBillUrl,
                        guarantorName: worker.guarantorName,
                        guarantorPhone: worker.guarantorPhone,
                        experienceYears: worker.yearsOfExperience,
                        rating: worker.rating,
                        stepVerifications: (worker as any).stepVerifications
                      })}
                      title={isArabic ? "معالج توثيق وتوقيع الحساب" : "Verification Wizard"}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/20 border border-gold-500/40 text-gold-400 font-black text-xs hover:bg-gold-500 hover:text-onyx-950 transition-all shadow-md cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isArabic ? "التوثيق" : "Verification"}</span>
                    </button>
                  )}

                  {/* Impersonate & Edit as Worker Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await postApiData(`/admin/workers/${worker.id}/impersonate`, {});
                        window.location.assign(`/${locale}/worker/profile`);
                      } catch (err) {
                        alert(isArabic ? "فشل الدخول بحساب الصنايعي" : "Failed to switch to worker account");
                      }
                    }}
                    title={isArabic ? "دخول وتعديل كصنايعي" : "Edit as Worker"}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gold-500 text-onyx-950 font-black text-xs hover:bg-gold-400 transition-all shadow-md"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">{isArabic ? "دخول كصنايعي" : "Edit as Worker"}</span>
                  </button>

                  {/* Review & Approve Documents / Add Quota Button */}
                  {worker.verificationStatus !== "VERIFIED" ? (
                    <button
                      onClick={() => {
                        setSelectedWorker(worker);
                        setShowDecisionPanel(true);
                        setDetailsModalOpen(true);
                      }}
                      title={isArabic ? "فحص وتوثيق المستندات" : "Review & Approve Documents"}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 text-onyx-950 font-black text-xs hover:bg-amber-400 transition-all shadow-md cursor-pointer"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">{isArabic ? "فحص وتوثيق" : "Review Docs"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddQuota(worker.id)}
                      disabled={actionId === worker.id}
                      title={isArabic ? "إضافة رصيد (10)" : "Add Quota (+10)"}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-onyx-900 border border-gold-500/20 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 transition-all text-xs font-bold"
                    >
                      {actionId === worker.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      <span className="hidden lg:inline">{isArabic ? "إضافة رصيد" : "Add Quota"}</span>
                    </button>
                  )}

                  {/* Documents Button - Only rendered for already VERIFIED workers */}
                  {worker.verificationStatus === "VERIFIED" && (
                    <button
                      onClick={() => {
                        setSelectedWorker(worker);
                        setShowDecisionPanel(false);
                        setDetailsModalOpen(true);
                      }}
                      className="h-8 w-8 rounded-lg bg-onyx-900 border border-onyx-700 flex items-center justify-center text-gold-500 hover:text-onyx-950 hover:bg-gold-500 transition-all shrink-0"
                      title={isArabic ? "عرض المستندات والملف" : "View Docs & Profile"}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Public Profile Link Button */}
                  <a
                    href={`/${locale}/workers/${worker.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 rounded-lg bg-onyx-900 border border-onyx-700 flex items-center justify-center text-onyx-300 hover:text-gold-500 hover:border-gold-500/40 transition-all shrink-0"
                    title={isArabic ? "معاينة الصفحة العامة" : "View Public Page"}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {/* Quick Edit Profile Settings Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(worker)}
                    className="h-8 w-8 rounded-lg bg-onyx-900 border border-onyx-700 flex items-center justify-center text-onyx-300 hover:text-gold-500 hover:border-gold-500/40 transition-all shrink-0"
                    title={isArabic ? "تعديل سريع" : "Quick Edit"}
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete Account Button */}
                  <button
                    onClick={() => {
                      setSelectedWorker(worker);
                      setDeleteModalOpen(true);
                    }}
                    className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shrink-0"
                    title={isArabic ? "حذف الحساب" : "Delete Account"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="onyx-card p-20 text-center text-onyx-500 font-medium border-dashed border-onyx-700">
              {isArabic ? "لا توجد نتائج مطابقة لبحثك أو الفئة المختارة" : "No workers found matching your filter or search criteria"}
            </div>
          )}
        </div>
      )}



      {/* Delete Confirmation Modal - Rendered at document.body via Portal */}
      {mounted && deleteModalOpen && selectedWorker && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-onyx-900 border border-red-500/30 rounded-[2rem] max-w-md w-full p-8 space-y-6 text-start shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white">
              {isArabic ? "تأكيد حذف الحساب نهائياً" : "Confirm Permanent Delete"}
            </h3>
            <p className="text-onyx-300 text-sm leading-relaxed">
              {isArabic
                ? `هل أنت متأكد من رغبتك في حذف حساب الصنايعي "${selectedWorker.user.firstName} ${selectedWorker.user.lastName}" بالكامل؟ سيتم مسح هذا الحساب وكافة البيانات وسجلات التشغيل والتقييمات التابعة له ولا يمكن التراجع عن هذا القرار.`
                : `Are you sure you want to permanently delete worker "${selectedWorker.user.firstName} ${selectedWorker.user.lastName}"? This will delete their entire account, logs, and ratings. This action cannot be undone.`}
            </p>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedWorker(null);
                }}
                disabled={actionLoading}
                className="btn-onyx py-3 px-6 text-sm font-bold"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteWorker}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-6 text-sm font-bold transition-all"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isArabic ? "حذف نهائي" : "Delete Permanently")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Worker Details & Documents Modal - Rendered at document.body via Portal */}
      {mounted && detailsModalOpen && selectedWorker && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-onyx-900 border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 space-y-8 text-start relative">
            <button
              onClick={() => {
                setDetailsModalOpen(false);
                setSelectedWorker(null);
              }}
              className="absolute top-6 end-6 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-onyx-950 border border-gold-500/30 shrink-0">
                <img
                  src={getWorkerPhoto(selectedWorker)}
                  alt={`${selectedWorker.user.firstName} ${selectedWorker.user.lastName}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                    {isArabic ? "بيانات ومستندات التوثيق" : "Verification Data & Documents"}
                  </span>
                  {selectedWorker.verificationStatus === "VERIFIED" ? (
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {isArabic ? "حساب موثق" : "Verified"}
                    </span>
                  ) : selectedWorker.verificationStatus === "REJECTED" ? (
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      {isArabic ? "حساب مرفوض" : "Rejected"}
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {isArabic ? "قيد التوثيق" : "Pending"}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black text-white mt-1">
                  {selectedWorker.user.firstName} {selectedWorker.user.lastName}
                </h2>
                <p className="text-onyx-400 text-sm mt-1">
                  {(() => {
                    const prof = workerProfessions.find(p => p.value === selectedWorker.profession);
                    return isArabic ? (prof?.labelAr || selectedWorker.profession || "غير محدد") : (prof?.labelEn || selectedWorker.profession || "Unassigned");
                  })()} • <span dir="ltr" className="font-mono font-bold text-white tracking-wider">{selectedWorker.user.phone}</span> {selectedWorker.user.email ? `• (${selectedWorker.user.email})` : ""}
                </p>
              </div>
            </div>

            <div className={showDecisionPanel ? "grid md:grid-cols-2 gap-8" : "grid grid-cols-1 gap-8"}>
              <div className="space-y-6 bg-onyx-950/40 p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="h-4 w-1 bg-gold-500 rounded-full" />
                  {isArabic ? "المعلومات الشخصية والضامن" : "Personal Info & Guarantor"}
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2.5 border-b border-white/5">
                    <span className="text-onyx-400">{isArabic ? "الرقم القومي" : "National ID Number"}</span>
                    <span className="text-white font-mono font-bold">{selectedWorker.nationalIdNumber || (isArabic ? "غير متوفر" : "N/A")}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-onyx-400">{isArabic ? "سنوات الخبرة" : "Years of Experience"}</span>
                    <span className="text-white font-bold">{selectedWorker.yearsOfExperience ?? 0} {isArabic ? "سنوات" : "years"}</span>
                  </div>
                </div>
              </div>

              {showDecisionPanel && (
                <div className="flex flex-col justify-between p-6 bg-onyx-950/40 rounded-3xl border border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <div className="h-4 w-1 bg-gold-500 rounded-full" />
                      {isArabic ? "لوحة قرار التوثيق" : "Verification Decision Panel"}
                    </h3>
                    <p className="text-xs text-onyx-400 mt-2 leading-relaxed">
                      {isArabic
                        ? "يرجى الفحص الدقيق للمستندات المرفقة (البطاقة، الفيش، وسيلفي البطاقة) وتأكيد مطابقة البيانات قبل الموافقة."
                        : "Please verify uploaded documents (ID, selfie, criminal record) before granting verification."}
                    </p>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => void handleDecision(selectedWorker.id, "REJECTED")}
                      disabled={actionId === selectedWorker.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {actionId === selectedWorker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {isArabic ? "رفض التوثيق" : "Reject Verification"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDecision(selectedWorker.id, "VERIFIED")}
                      disabled={actionId === selectedWorker.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-500 py-3 text-sm font-black text-onyx-950 shadow-lg hover:bg-gold-400 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {actionId === selectedWorker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      {isArabic ? "توثيق وتفعيل" : "Verify & Approve"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="h-4 w-1.5 bg-gold-500 rounded-full" />
                {isArabic ? "المستندات والملفات المرفوعة" : "Uploaded Files & Documents"}
              </h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { key: "nationalIdFront", label: isArabic ? "صورة البطاقة (الأمام)" : "National ID Front", url: selectedWorker.nationalIdFront },
                  { key: "nationalIdBack", label: isArabic ? "صورة البطاقة (الخلف)" : "National ID Back", url: selectedWorker.nationalIdBack },
                  { key: "selfieWithId", label: isArabic ? "سيلفي مع البطاقة" : "Selfie with ID", url: selectedWorker.selfieWithId },
                  { key: "criminalRecord", label: isArabic ? "الفيش والتشبيه" : "Criminal Record (Fish)", url: selectedWorker.criminalRecord },
                  { key: "utilityBillUrl", label: isArabic ? "إيصال المرافق" : "Utility Bill", url: selectedWorker.utilityBillUrl }
                ].map((doc, idx) => (
                  <div key={idx} className="bg-onyx-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[220px] space-y-3 hover:border-gold-500/40 transition-all shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{doc.label}</span>
                      {doc.url && (
                        <button
                          type="button"
                          onClick={() => setEditingDoc({ key: doc.key, url: doc.url!, label: doc.label })}
                          className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-0.5 hover:bg-gold hover:text-black transition flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          {isArabic ? "تعديل" : "Edit"}
                        </button>
                      )}
                    </div>

                    {doc.url ? (
                      <div className="space-y-2.5">
                        {/* Snapshot Image Preview (Clickable for Lightbox Fullsize View) */}
                        <div
                          onClick={() => setActiveLightboxDoc(doc.url || null)}
                          className="h-36 w-full rounded-xl overflow-hidden border border-white/10 bg-onyx-900 flex items-center justify-center relative group cursor-pointer"
                          title={isArabic ? "اضغط للتكبير بالحجم الكامل" : "Click to view full size"}
                        >
                          <img
                            src={doc.url}
                            alt={doc.label}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                            <Eye className="h-4 w-4 text-gold-500" />
                            <span>{isArabic ? "عرض بالحجم الكامل" : "View Full Size"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-onyx-500 border border-dashed border-white/10 rounded-xl bg-onyx-900/40">
                        {isArabic ? "لم يتم رفع هذا المستند بعد" : "No document uploaded"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <WorkerHistoryLogs 
              workerId={selectedWorker.id} 
              createdAt={selectedWorker.createdAt} 
              lastLoginAt={selectedWorker.user.lastLoginAt} 
              locale={locale} 
            />

            <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedWorker(null);
                }}
                className="btn-onyx py-3 px-8 text-sm font-bold"
              >
                {isArabic ? "إغلاق" : "Close"}
              </button>
            </div>
        </div>

        {/* Photo Edit Modal */}
        {editingDoc && (
          <ImageCropModal
            imageSrc={editingDoc.url}
            isArabic={isArabic}
            onCancel={() => setEditingDoc(null)}
            onConfirm={handlePhotoEditConfirm}
            aspectRatio={undefined}
            titleAr={`تعديل ${editingDoc.label}`}
            titleEn={`Edit ${editingDoc.label}`}
          />
        )}
      </div>,
      document.body
    )}

      {/* Admin Edit Worker Profile & Settings Modal - Rendered at document.body via Portal */}
      {mounted && editModalOpen && selectedWorker && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-onyx-900 border border-gold-500/30 rounded-[2rem] max-w-lg w-full p-8 space-y-6 text-start shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Settings className="h-6 w-6 text-gold-500" />
                {isArabic ? "تعديل إعدادات وملف الفني" : "Edit Worker Profile & Settings"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedWorker(null);
                }}
                className="h-10 w-10 rounded-xl bg-onyx-800 border border-onyx-700 flex items-center justify-center text-onyx-400 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-start">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                    {isArabic ? "الاسم الأول" : "First Name"}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                    {isArabic ? "الاسم الأخير" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="text"
                  className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm font-mono text-start"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                    {isArabic ? "المهنة / التخصص" : "Profession / Specialty"}
                  </label>
                  <select
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-3 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                  >
                    <option value="">{isArabic ? "اختر مهنة..." : "Select profession..."}</option>
                    {workerProfessions.map(p => (
                      <option key={p.value} value={p.value} className="bg-onyx-900 text-white">
                        {isArabic ? p.labelAr : p.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                    {isArabic ? "سنوات الخبرة" : "Years of Experience"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm"
                    value={editYearsOfExperience}
                    onChange={(e) => setEditYearsOfExperience(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                    {isArabic ? "رصيد المهام (Order Quota)" : "Order Quota"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-4 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm"
                    value={editQuota}
                    onChange={(e) => setEditQuota(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                    {isArabic ? "حالة التوثيق" : "Verification Status"}
                  </label>
                  <select
                    className="w-full bg-onyx-950 border border-onyx-700 rounded-xl px-3 py-2.5 text-white focus:border-gold-500/50 outline-none text-sm"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="VERIFIED" className="bg-onyx-900 text-white">{isArabic ? "موثق ومفعل (Verified)" : "Verified"}</option>
                    <option value="UNDER_REVIEW" className="bg-onyx-900 text-white">{isArabic ? "قيد المراجعة والتدقيق (Under Review)" : "Under Review"}</option>
                    <option value="DOCUMENTS_SUBMITTED" className="bg-onyx-900 text-white">{isArabic ? "مستندات مرفوعة (Docs Submitted)" : "Docs Submitted"}</option>
                    <option value="PENDING" className="bg-onyx-900 text-white">{isArabic ? "قيد الانتظار / بانتظار الهوية (Pending)" : "Pending"}</option>
                    <option value="REJECTED" className="bg-onyx-900 text-white">{isArabic ? "مرفوض التوثيق (Rejected)" : "Rejected"}</option>
                    <option value="SUSPENDED" className="bg-onyx-900 text-white">{isArabic ? "حساب موقوف مؤقتاً (Suspended)" : "Suspended"}</option>
                    <option value="BANNED" className="bg-onyx-900 text-white">{isArabic ? "حساب محظور نهائياً (Banned)" : "Banned"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-onyx-300 mb-1.5 block">
                  {isArabic ? "نبذة عن الفني (Bio)" : "Bio / Description"}
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-onyx-950 border border-onyx-700 rounded-xl p-3 text-white focus:border-gold-500/50 outline-none text-xs leading-relaxed"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder={isArabic ? "وصف لخبرة وتخصصات الصنايعي..." : "Worker bio..."}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedWorker(null);
                }}
                disabled={actionLoading}
                className="btn-onyx py-3 px-6 text-sm font-bold"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editFirstName.trim() || !editLastName.trim() || !editPhone.trim()) {
                    alert(isArabic ? "يرجى تعبئة كافة الحقول المطلوبة" : "Please fill out all required fields");
                    return;
                  }
                  setActionLoading(true);
                  try {
                    const updated = await patchApiData<any, any>(`/admin/workers/${selectedWorker.id}`, {
                      firstName: editFirstName,
                      lastName: editLastName,
                      phone: editPhone,
                      profession: editProfession,
                      bio: editBio,
                      yearsOfExperience: Number(editYearsOfExperience || 0),
                      orderQuota: Number(editQuota || 0),
                      verificationStatus: editStatus
                    });
                    setWorkers(prev => prev.map(w => w.id === selectedWorker.id ? {
                      ...w,
                      profession: updated.profession,
                      bio: updated.bio,
                      yearsOfExperience: updated.yearsOfExperience,
                      orderQuota: updated.orderQuota,
                      verificationStatus: updated.verificationStatus,
                      user: {
                        ...w.user,
                        firstName: updated.user.firstName,
                        lastName: updated.user.lastName,
                        phone: updated.user.phone
                      }
                    } : w));
                    setEditModalOpen(false);
                    setSelectedWorker(null);
                  } catch (err) {
                    alert(isArabic ? "فشل تعديل البيانات والملف" : "Failed to update profile & settings");
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                className="btn-gold py-3 px-6 text-sm font-bold"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isArabic ? "حفظ كافة التعديلات" : "Save All Changes")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Full Size Document Preview Modal */}
      {activeLightboxDoc && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveLightboxDoc(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveLightboxDoc(null)}
              className="absolute -top-12 right-0 text-white hover:text-gold-500 transition-colors flex items-center gap-1.5 text-sm font-bold bg-onyx-900 border border-white/20 px-4 py-2 rounded-xl cursor-pointer shadow-2xl"
            >
              <X className="h-5 w-5 text-gold-500" />
              <span>{isArabic ? "إغلاق المعاينة" : "Close Preview"}</span>
            </button>
            <img
              src={activeLightboxDoc}
              alt="Document Fullsize"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain border-2 border-gold-500/40 shadow-2xl bg-onyx-950"
            />
          </div>
        </div>,
        document.body
      )}

      {/* Verification Wizard Modal */}
      {wizardWorker && (
        <WorkerVerificationWizard
          locale={locale}
          worker={wizardWorker}
          isOpen={Boolean(wizardWorker)}
          onClose={() => setWizardWorker(null)}
          onWorkerUpdated={(updated) => {
            setWorkers(prev => prev.map(w => w.id === updated.id ? { ...w, ...updated } : w));
            setWizardWorker(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
          }}
        />
      )}
    </div>
  );
}
