"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search, Loader2, Store, Phone, User, ShieldCheck, RotateCcw, Plus, PackageCheck, Trash2, Wallet, Eye, X,
  Key, Copy, Check, MessageCircle, Send, RefreshCw, Sparkles
} from "lucide-react";
import { fetchApiData, postApiData, patchApiData, deleteApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { egyptianGovernorates, majorCities, vendorCategories } from "@/lib/geo-data";

type Vendor = {
  id: string;
  userId: string;
  shopName: string;
  shopNameAr: string | null;
  orderQuota: number;
  totalOrders: number;
  trialExpiresAt: string | null;
  verificationStatus: string;
  walletBalance: number;
  taxCardUrl?: string | null;
  commercialRegisterUrl?: string | null;
  shopImageUrl?: string | null;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
};

export function AdminVendorsManagement({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  // New state for Wallet and Delete features
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedVendorDocs, setSelectedVendorDocs] = useState<Vendor | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletAction, setWalletAction] = useState<"add" | "deduct" | "set">("add");
  const [actionLoading, setActionLoading] = useState(false);

  // Manual Vendor Creation State (CS / Admin)
  const [addVendorModalOpen, setAddVendorModalOpen] = useState(false);
  const [addingVendor, setAddingVendor] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    shopName: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    category: "plumbing",
    governorate: "cairo",
    city: "new-cairo",
    address: "",
    orderQuota: 20,
    verificationStatus: "VERIFIED" as "VERIFIED" | "PENDING"
  });

  // Password Reset State (CS / Admin)
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // WhatsApp Credentials Sharing Modal State
  const [shareCredentialsModalOpen, setShareCredentialsModalOpen] = useState(false);
  const [shareCredentialsData, setShareCredentialsData] = useState<{
    shopName: string;
    ownerName: string;
    phone: string;
    password: string;
    isReset?: boolean;
    quota?: number;
  } | null>(null);
  const [copiedStatus, setCopiedStatus] = useState(false);

  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!newVendorData.shopName || !newVendorData.firstName || !newVendorData.phone || !newVendorData.password) {
      alert(isArabic ? "برجاء ملء جميع الحقول الإلزامية (اسم المتجر، اسم المالك، الهاتف، كلمة المرور)" : "Please fill all required fields");
      return;
    }
    setAddingVendor(true);
    try {
      const res = await postApiData<Vendor, typeof newVendorData>("/admin/vendors", newVendorData);
      const createdVendor = (res as any)?.data || res;
      setVendors(prev => [createdVendor, ...prev]);
      setAddVendorModalOpen(false);
      setShareCredentialsData({
        shopName: newVendorData.shopName,
        ownerName: `${newVendorData.firstName} ${newVendorData.lastName}`.trim(),
        phone: newVendorData.phone,
        password: newVendorData.password,
        quota: newVendorData.orderQuota,
        isReset: false
      });
      setShareCredentialsModalOpen(true);
    } catch (err: any) {
      alert(err?.message || (isArabic ? "فشل إنشاء حساب المتجر" : "Failed to create vendor"));
    } finally {
      setAddingVendor(false);
    }
  }

  async function handleResetVendorPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendor || !newPasswordInput) return;
    setResettingPassword(true);
    try {
      await postApiData(`/admin/vendors/${selectedVendor.id}/reset-password`, {
        newPassword: newPasswordInput
      });
      setResetPasswordModalOpen(false);
      setShareCredentialsData({
        shopName: selectedVendor.shopName,
        ownerName: `${selectedVendor.user.firstName} ${selectedVendor.user.lastName}`.trim(),
        phone: selectedVendor.user.phone,
        password: newPasswordInput,
        isReset: true
      });
      setShareCredentialsModalOpen(true);
    } catch (err: any) {
      alert(err?.message || (isArabic ? "فشل تعيين كلمة المرور" : "Failed to reset password"));
    } finally {
      setResettingPassword(false);
    }
  }

  function getVendorWhatsAppMessage(data: { shopName: string; ownerName: string; phone: string; password: string; isReset?: boolean; quota?: number }) {
    if (data.isReset) {
      return `أهلاً بك يا فندم في منصة أوسطى 🏪
تمت إعادة تعيين كلمة المرور لمتجركم (${data.shopName}) بواسطة الدعم الفني:

🔑 كلمة المرور الجديدة: ${data.password}
📲 رقم الهاتف: ${data.phone}

رابط تسجيل الدخول لحساب المتجر:
https://osta.gotix.me/ar/login

بالتوفيق ومبيعات موفقة دائماً! فريق منصة أوسطى 🌟`;
    }

    return `أهلاً بكم في منصة أوسطى للمتاجر وموردي الخامات 🏪
تم تسجيل وتفعيل حساب متجركم (${data.shopName}) بنجاح بواسطة فريق خدمة العملاء!

📲 بيانات تسجيل الدخول:
رقم الهاتف: ${data.phone}
كلمة المرور: ${data.password}

رابط الدخول لداشبورد المتجر:
https://osta.gotix.me/ar/login

🎁 تم تزويد متجركم بـ ${data.quota || 20} عملية بيع وطلب مبدئي مجاناً لتبدأوا في عرض المنتجات واستقبال طلبات الصنايعية والعملاء فوراً.
بالتوفيق ورزق مبارك إن شاء الله! 🌟`;
  }

  useEffect(() => {
    fetchApiData<{ data: Vendor[] }>("/admin/vendors", { data: [] }).then(res => {
      const vendorList = Array.isArray(res) ? res : (res as any).data || [];
      setVendors(vendorList);
      setLoading(false);
    }).catch(err => {
      console.error("AdminVendorsManagement: Fetch error:", err);
      setLoading(false);
    });
  }, []);

  async function handleVerify(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/vendors/${id}/verify`, {});
      const now = new Date();
      const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setVendors(prev => prev.map(v => v.id === id ? { ...v, verificationStatus: "VERIFIED", trialExpiresAt } : v));
    } finally {
      setActionId(null);
    }
  }

  async function handleAddQuota(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/vendors/${id}/quota`, { amount: 10 });
      setVendors(prev => prev.map(v => v.id === id ? { ...v, orderQuota: v.orderQuota + 10 } : v));
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteVendor() {
    if (!selectedVendor) return;
    setActionLoading(true);
    try {
      await deleteApiData(`/admin/users/${selectedVendor.userId}`);
      setVendors(prev => prev.filter(v => v.id !== selectedVendor.id));
      setDeleteModalOpen(false);
      setSelectedVendor(null);
    } catch (err) {
      alert(isArabic ? "فشل حذف المتجر" : "Failed to delete vendor");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdjustWallet() {
    if (!selectedVendor) return;
    const amountNum = parseFloat(walletAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert(isArabic ? "يرجى إدخال مبلغ صحيح" : "Please enter a valid amount");
      return;
    }
    setActionLoading(true);
    try {
      const body: any = {};
      if (walletAction === "set") {
        body.balance = amountNum;
      } else if (walletAction === "add") {
        body.amount = amountNum;
      } else {
        body.amount = -amountNum;
      }

      const updatedVendor = await patchApiData<any, any>(`/admin/vendors/${selectedVendor.id}/wallet`, body);
      setVendors(prev => prev.map(v => v.id === selectedVendor.id ? { ...v, walletBalance: updatedVendor.walletBalance } : v));
      setWalletModalOpen(false);
      setWalletAmount("");
      setSelectedVendor(null);
    } catch (err) {
      alert(isArabic ? "فشل تعديل الرصيد" : "Failed to adjust wallet balance");
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = vendors.filter(v => 
    v.shopName.toLowerCase().includes(search.toLowerCase()) || 
    (v.shopNameAr && v.shopNameAr.includes(search)) ||
    v.user.phone.includes(search)
  );

  return (
    <div className="space-y-8 animate-slideUp">
      <div className="onyx-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-gold-500/10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isArabic ? "إدارة المتاجر" : "Vendor Management"}
          </h1>
          <p className="text-onyx-400 text-sm font-medium">
            {isArabic ? `إجمالي المتاجر: ${vendors.length}` : `Total Vendors: ${vendors.length}`}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setNewVendorData({
                shopName: "",
                firstName: "",
                lastName: "",
                phone: "",
                password: Math.floor(100000 + Math.random() * 900000).toString(),
                category: "plumbing",
                governorate: "cairo",
                city: "new-cairo",
                address: "",
                orderQuota: 20,
                verificationStatus: "VERIFIED"
              });
              setAddVendorModalOpen(true);
            }}
            className="btn-gold flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-sm shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span>{isArabic ? "إضافة متجر جديد" : "Add New Store"}</span>
          </button>

          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-onyx-500" />
            <input 
              type="text" 
              placeholder={isArabic ? "بحث باسم المتجر أو المالك..." : "Search by store or owner..."}
              className="w-full bg-onyx-900/50 border border-onyx-700 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-gold-500/50 focus:ring-4 focus:ring-gold-500/5 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map(vendor => {
            const isTrialActive = vendor.trialExpiresAt && new Date(vendor.trialExpiresAt) > new Date();
            const trialDaysLeft = vendor.trialExpiresAt ? Math.ceil((new Date(vendor.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

            return (
              <div key={vendor.id} className="onyx-card p-6 group hover:border-gold-500/30 transition-all duration-500 bg-onyx-800/30 backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-2xl bg-onyx-900 border border-onyx-700 flex items-center justify-center text-gold-500 group-hover:border-gold-500/50 group-hover:bg-gold-500/10 transition-all duration-500">
                        <Store className="h-10 w-10" />
                      </div>
                      {vendor.verificationStatus === "VERIFIED" && (
                        <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gold-500 flex items-center justify-center border-4 border-onyx-950 shadow-lg">
                          <ShieldCheck className="h-3.5 w-3.5 text-onyx-950" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-gold-500 transition-colors mb-2">
                        {isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-onyx-400 text-sm font-medium">
                        <span className="flex items-center gap-2"><User className="h-4 w-4 text-gold-500/60" /> {vendor.user.firstName}</span>
                        <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-500/60" /> {vendor.user.phone}</span>
                        <span className="flex items-center gap-2 bg-onyx-800 px-3 py-1 rounded-full text-onyx-300">
                          <PackageCheck className="h-3.5 w-3.5 text-gold-500/70" />
                          {vendor.totalOrders || 0} {isArabic ? "أوردر مكتمل" : "completed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col items-end gap-2">
                      {isTrialActive ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gold-500/60 px-2 py-0.5 rounded border border-gold-500/20 bg-gold-500/5">
                          {isArabic ? `${trialDaysLeft} يوم تجربة` : `${trialDaysLeft}d Trial`}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
                          {isArabic ? "متجر معتمد" : "Verified Store"}
                        </span>
                      )}
                      <div className="flex gap-3">
                        <div className={cn(
                          "px-5 py-3 rounded-2xl border flex flex-col items-center min-w-[100px]",
                          vendor.orderQuota > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                        )}>
                          <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-tighter mb-0.5">{isArabic ? "رصيد المبيعات" : "Order Quota"}</span>
                          <span className={cn("text-xl font-black", vendor.orderQuota > 0 ? "text-emerald-400" : "text-red-400")}>
                            {vendor.orderQuota}
                          </span>
                        </div>

                        <div className="px-5 py-3 rounded-2xl border border-gold-500/20 bg-gold-500/5 flex flex-col items-center min-w-[100px]">
                          <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-tighter mb-0.5">{isArabic ? "رصيد المحفظة" : "Wallet Balance"}</span>
                          <span className="text-xl font-black text-gold-400">
                            {vendor.walletBalance ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <button 
                         onClick={() => setSelectedVendorDocs(vendor)}
                         className="h-12 px-4 rounded-2xl bg-onyx-800 border border-onyx-700 flex items-center justify-center text-onyx-300 hover:text-white transition-all font-bold text-xs"
                         title={isArabic ? "عرض المستندات" : "View Documents"}
                       >
                         <Eye className="h-4 w-4 mr-2" />
                         {isArabic ? "المستندات" : "Docs"}
                       </button>
                       {vendor.verificationStatus !== "VERIFIED" ? (
                         <button 
                           onClick={() => handleVerify(vendor.id)}
                           disabled={actionId === vendor.id}
                           className="btn-gold py-3 px-8 text-sm font-black shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                         >
                           {actionId === vendor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                           {isArabic ? "توثيق المتجر" : "Verify Store"}
                         </button>
                       ) : (
                         <button 
                           onClick={() => handleAddQuota(vendor.id)}
                           disabled={actionId === vendor.id}
                           className="btn-onyx py-3 px-6 text-sm font-black border-gold-500/20 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 transition-all"
                         >
                           {actionId === vendor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                           {isArabic ? "إضافة رصيد (10)" : "Add Quota (10)"}
                         </button>
                       )}
                       
                       <button 
                         onClick={() => {
                           setSelectedVendor(vendor);
                           setWalletAmount("");
                           setWalletAction("add");
                           setWalletModalOpen(true);
                         }}
                         className="h-12 w-12 rounded-2xl bg-onyx-800 border border-onyx-700 flex items-center justify-center text-gold-500 hover:text-onyx-950 hover:bg-gold-500 transition-all"
                         title={isArabic ? "تعديل المحفظة" : "Adjust Wallet"}
                       >
                         <Wallet className="h-5 w-5" />
                       </button>

                       <button 
                         type="button"
                         onClick={() => {
                           setSelectedVendor(vendor);
                           setNewPasswordInput(Math.floor(100000 + Math.random() * 900000).toString());
                           setResetPasswordModalOpen(true);
                         }}
                         className="h-12 w-12 rounded-2xl bg-onyx-800 border border-onyx-700 flex items-center justify-center text-emerald-400 hover:text-onyx-950 hover:bg-emerald-500 transition-all cursor-pointer"
                         title={isArabic ? "إعادة تعيين كلمة المرور ومشاركتها عبر واتساب" : "Reset Password & Share WhatsApp"}
                       >
                         <Key className="h-5 w-5" />
                       </button>

                       <button 
                         onClick={() => {
                           setSelectedVendor(vendor);
                           setDeleteModalOpen(true);
                         }}
                         className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                         title={isArabic ? "حذف الحساب" : "Delete Account"}
                       >
                         <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="onyx-card p-20 text-center text-onyx-500 font-medium border-dashed border-onyx-700">
               {isArabic ? "لا توجد نتائج بحث" : "No vendors found"}
            </div>
          )}
        </div>
      )}

      {/* Wallet Adjustment Modal */}
      {walletModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card max-w-md w-full p-8 border-gold-500/30 space-y-6">
            <h3 className="text-2xl font-black text-white">
              {isArabic ? `تعديل محفظة: ${selectedVendor.shopName}` : `Adjust Wallet: ${selectedVendor.shopName}`}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-onyx-400 mb-2 block">
                  {isArabic ? "نوع الإجراء" : "Action Type"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletAction("add")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-sm font-bold transition-all",
                      walletAction === "add" ? "bg-gold-500 text-onyx-950 border-gold-500" : "bg-onyx-900 border-onyx-700 text-white"
                    )}
                  >
                    {isArabic ? "إضافة رصيد" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAction("deduct")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-sm font-bold transition-all",
                      walletAction === "deduct" ? "bg-red-500 text-white border-red-500" : "bg-onyx-900 border-onyx-700 text-white"
                    )}
                  >
                    {isArabic ? "خصم رصيد" : "Deduct"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAction("set")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-sm font-bold transition-all",
                      walletAction === "set" ? "bg-emerald-500 text-white border-emerald-500" : "bg-onyx-900 border-onyx-700 text-white"
                    )}
                  >
                    {isArabic ? "تعيين رصيد" : "Set"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-onyx-400 mb-2 block">
                  {isArabic ? "المبلغ (ج.م)" : "Amount (EGP)"}
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 outline-none"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setWalletModalOpen(false);
                  setSelectedVendor(null);
                }}
                disabled={actionLoading}
                className="btn-onyx py-3 px-6 text-sm font-bold"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleAdjustWallet}
                disabled={actionLoading}
                className="btn-gold py-3 px-6 text-sm font-bold"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isArabic ? "تأكيد التعديل" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card max-w-md w-full p-8 border-red-500/30 space-y-6">
            <h3 className="text-2xl font-black text-white">
              {isArabic ? "تأكيد حذف الحساب نهائياً" : "Confirm Permanent Delete"}
            </h3>
            <p className="text-onyx-300 text-sm leading-relaxed">
              {isArabic 
                ? `هل أنت متأكد من رغبتك في حذف حساب المتجر "${selectedVendor.shopName}" بالكامل؟ سيتم مسح هذا الحساب وكافة المنتجات والطلبات والبيانات التابعة له ولا يمكن التراجع عن هذا القرار.` 
                : `Are you sure you want to permanently delete store "${selectedVendor.shopName}"? This will delete their entire account, products, orders, and ratings. This action cannot be undone.`}
            </p>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedVendor(null);
                }}
                disabled={actionLoading}
                className="btn-onyx py-3 px-6 text-sm font-bold"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteVendor}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-6 text-sm font-bold transition-all"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isArabic ? "حذف نهائي" : "Delete Permanently")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Documents Modal */}
      {selectedVendorDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-onyx-900 border border-white/5 rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 space-y-8 text-start relative">
            <button
              onClick={() => setSelectedVendorDocs(null)}
              className="absolute top-6 end-6 text-onyx-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                {isArabic ? "مستندات توثيق المتجر" : "Store Verification Documents"}
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                {isArabic ? (selectedVendorDocs.shopNameAr || selectedVendorDocs.shopName) : selectedVendorDocs.shopName}
              </h2>
              <p className="text-onyx-400 text-sm mt-1">
                {isArabic ? `المالك: ${selectedVendorDocs.user.firstName} ${selectedVendorDocs.user.lastName}` : `Owner: ${selectedVendorDocs.user.firstName} ${selectedVendorDocs.user.lastName}`}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: isArabic ? "البطاقة الضريبية" : "Tax Card Document", url: selectedVendorDocs.taxCardUrl },
                { label: isArabic ? "السجل التجاري" : "Commercial Register Document", url: selectedVendorDocs.commercialRegisterUrl }
              ].map((doc, idx) => (
                <div key={idx} className="onyx-card p-6 flex flex-col justify-between min-h-[200px] bg-onyx-950/20 border-white/5">
                  <div>
                    <span className="text-xs font-bold text-onyx-400 uppercase">{doc.label}</span>
                    <p className="text-[10px] text-onyx-600 mt-1">
                      {doc.url ? (isArabic ? "ملف مرفوع" : "Uploaded") : (isArabic ? "لم يتم رفعه بعد" : "Not uploaded")}
                    </p>
                  </div>

                  {doc.url ? (
                    <div className="mt-6 space-y-3">
                      {doc.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || doc.url.startsWith("data:image") ? (
                        <div className="h-32 w-full rounded-xl overflow-hidden border border-white/5 bg-onyx-900 flex items-center justify-center">
                          <img src={doc.url} alt={doc.label} className="h-full w-full object-cover" />
                        </div>
                      ) : null}

                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gold-500 bg-gold-500/10 border border-gold-500/20 rounded-xl hover:bg-gold-500 hover:text-onyx-950 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        {isArabic ? "عرض بالحجم الكامل" : "View Fullscreen"}
                      </a>
                    </div>
                  ) : (
                    <div className="mt-6 py-6 text-center text-xs text-onyx-600 border border-dashed border-white/5 rounded-xl">
                      {isArabic ? "مستند فارغ" : "Empty document"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedVendorDocs.verificationStatus !== "VERIFIED" && (
              <div className="border-t border-white/5 pt-6 flex justify-end gap-4">
                <button
                  onClick={() => {
                    handleVerify(selectedVendorDocs!.id);
                    setSelectedVendorDocs(null);
                  }}
                  disabled={actionId === selectedVendorDocs.id}
                  className="btn-gold py-3 px-8 text-sm font-black shadow-lg"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {isArabic ? "توثيق المتجر وتفعيله" : "Verify Store"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Manual Vendor Creation Modal (CS / Admin) */}
      {addVendorModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="onyx-card max-w-2xl w-full p-8 border-gold-500/30 bg-[#121214] shadow-2xl space-y-6 my-8 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Store className="h-6 w-6 text-gold-500" />
                  <span>{isArabic ? "إضافة متجر جديد (خدمة العملاء)" : "Manual Store Registration"}</span>
                </h3>
                <p className="text-xs text-onyx-400 mt-1">
                  {isArabic
                    ? "تسجيل بيانات متجر أو مورد خامات وتفعيل حسابه فوراً مع تجهيز رسالة الترحيب للواتساب"
                    : "Register full store profile, verify immediately and generate WhatsApp credentials"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddVendorModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-onyx-800 text-onyx-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-onyx-300 mb-1">
                  {isArabic ? "اسم المتجر / المعرض *" : "Shop Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={newVendorData.shopName}
                  onChange={(e) => setNewVendorData({ ...newVendorData, shopName: e.target.value })}
                  placeholder={isArabic ? "معرض الأمل للأدوات الصحية" : "Store Name"}
                  className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "اسم المالك (الأول) *" : "Owner First Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newVendorData.firstName}
                    onChange={(e) => setNewVendorData({ ...newVendorData, firstName: e.target.value })}
                    placeholder={isArabic ? "أحمد" : "First name"}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "اسم العائلة *" : "Owner Last Name *"}
                  </label>
                  <input
                    type="text"
                    value={newVendorData.lastName}
                    onChange={(e) => setNewVendorData({ ...newVendorData, lastName: e.target.value })}
                    placeholder={isArabic ? "محمود" : "Last name"}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "رقم الهاتف (موبايل) *" : "Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={newVendorData.phone}
                    onChange={(e) => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-gold-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "نشاط وتصنيف المتجر *" : "Category *"}
                  </label>
                  <select
                    value={newVendorData.category}
                    onChange={(e) => setNewVendorData({ ...newVendorData, category: e.target.value })}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  >
                    {vendorCategories.map(c => (
                      <option key={c.value} value={c.value}>
                        {isArabic ? c.labelAr : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-onyx-300 mb-1">
                  {isArabic ? "كلمة المرور الأولية *" : "Initial Password *"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newVendorData.password}
                    onChange={(e) => setNewVendorData({ ...newVendorData, password: e.target.value })}
                    placeholder={isArabic ? "كلمة مرور الحساب" : "Account password"}
                    className="flex-1 bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-gold-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setNewVendorData({ ...newVendorData, password: Math.floor(100000 + Math.random() * 900000).toString() })}
                    className="px-3 py-2.5 rounded-xl bg-onyx-800 hover:bg-onyx-700 text-gold-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isArabic ? "توليد كلمة سر" : "Generate"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "المحافظة" : "Governorate"}
                  </label>
                  <select
                    value={newVendorData.governorate}
                    onChange={(e) => {
                      const gov = e.target.value;
                      const defaultCity = majorCities[gov]?.[0]?.value || "new-cairo";
                      setNewVendorData({ ...newVendorData, governorate: gov, city: defaultCity });
                    }}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  >
                    {egyptianGovernorates.map(g => (
                      <option key={g.value} value={g.value}>
                        {isArabic ? g.labelAr : g.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "المدينة / الحي" : "City / District"}
                  </label>
                  <select
                    value={newVendorData.city}
                    onChange={(e) => setNewVendorData({ ...newVendorData, city: e.target.value })}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  >
                    {(majorCities[newVendorData.governorate] || majorCities["cairo"] || []).map(c => (
                      <option key={c.value} value={c.value}>
                        {isArabic ? c.labelAr : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "العنوان بالتفصيل (الشارع / المعلم)" : "Detailed Address"}
                  </label>
                  <input
                    type="text"
                    value={newVendorData.address}
                    onChange={(e) => setNewVendorData({ ...newVendorData, address: e.target.value })}
                    placeholder={isArabic ? "شارع التسعين - بجوار مول..." : "Street / Landmark"}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-onyx-300 mb-1">
                    {isArabic ? "رصيد عمليات البيع المبدئي" : "Initial Order Quota"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newVendorData.orderQuota}
                    onChange={(e) => setNewVendorData({ ...newVendorData, orderQuota: parseInt(e.target.value) || 0 })}
                    className="w-full bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">
                    {isArabic ? "تفعيل وتوثيق المتجر فوراً" : "Auto-Verify & Activate Store"}
                  </span>
                  <span className="text-xs text-onyx-400 block mt-0.5">
                    {isArabic ? "يمنح المتجر فترة تجريبية 30 يوماً ويظهر لعملاء المنطقة فوراً" : "Grants 30d trial & immediate store activation"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newVendorData.verificationStatus === "VERIFIED"}
                  onChange={(e) => setNewVendorData({
                    ...newVendorData,
                    verificationStatus: e.target.checked ? "VERIFIED" : "PENDING"
                  })}
                  className="h-5 w-5 accent-gold-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAddVendorModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-onyx-800 text-onyx-300 hover:text-white text-sm font-bold transition-colors cursor-pointer"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={addingVendor}
                  className="btn-gold px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-gold-500/20 cursor-pointer disabled:opacity-50"
                >
                  {addingVendor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{isArabic ? "إنشاء المتجر وتجهيز رسالة الواتساب 🚀" : "Create Store & Open WhatsApp"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Manual Password Reset Modal (CS / Admin) */}
      {resetPasswordModalOpen && selectedVendor && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="onyx-card max-w-md w-full p-6 border-emerald-500/30 bg-[#121214] shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-emerald-400" />
                  <span>{isArabic ? "إعادة تعيين كلمة مرور المتجر" : "Reset Store Password"}</span>
                </h3>
                <p className="text-xs text-onyx-400 mt-0.5">
                  {selectedVendor.shopName} ({selectedVendor.user.phone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-onyx-800 text-onyx-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetVendorPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-onyx-300 mb-1">
                  {isArabic ? "كلمة المرور الجديدة للمتجر *" : "New Store Password *"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="123456"
                    className="flex-1 bg-onyx-900 border border-onyx-700 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(Math.floor(100000 + Math.random() * 900000).toString())}
                    className="px-3 py-2.5 rounded-xl bg-onyx-800 hover:bg-onyx-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isArabic ? "توليد" : "Gen"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-onyx-800 text-onyx-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-onyx-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {resettingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                  <span>{isArabic ? "تحديث وتجهيز رسالة الواتساب 🔑" : "Update & Prepare WhatsApp"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* WhatsApp Ready-to-Send Credentials Modal */}
      {shareCredentialsModalOpen && shareCredentialsData && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="onyx-card max-w-lg w-full p-6 border-emerald-500/40 bg-[#121214] shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {shareCredentialsData.isReset
                      ? (isArabic ? "تم إعادة تعيين كلمة المرور بنجاح!" : "Password Reset Successfully!")
                      : (isArabic ? "تم إنشاء وتفعيل حساب المتجر بنجاح!" : "Store Account Created Successfully!")}
                  </h3>
                  <p className="text-xs text-onyx-400">
                    {isArabic ? "جاهز للإرسال لإدارة المتجر بنقرة واحدة عبر واتساب" : "Ready to send to store via WhatsApp"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareCredentialsModalOpen(false)}
                className="h-8 w-8 rounded-lg bg-onyx-800 text-onyx-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-onyx-400">
                <span>{isArabic ? "نص الرسالة المجهز للمتجر:" : "Prepared WhatsApp Message:"}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getVendorWhatsAppMessage(shareCredentialsData));
                    setCopiedStatus(true);
                    setTimeout(() => setCopiedStatus(false), 2500);
                  }}
                  className="flex items-center gap-1 text-gold-400 hover:text-gold-300 font-bold transition-colors cursor-pointer"
                >
                  {copiedStatus ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedStatus ? (isArabic ? "تم النسخ بنجاح! ✅" : "Copied! ✅") : (isArabic ? "نسخ النص" : "Copy Text")}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-onyx-950 border border-onyx-800 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto selection:bg-emerald-500 selection:text-black">
                {getVendorWhatsAppMessage(shareCredentialsData)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/${shareCredentialsData.phone.replace(/\D/g, "")}?text=${encodeURIComponent(getVendorWhatsAppMessage(shareCredentialsData))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isArabic ? "إرسال للمتجر عبر واتساب مباشرة 💬" : "Send via WhatsApp Directly 💬"}</span>
              </a>

              <button
                type="button"
                onClick={() => setShareCredentialsModalOpen(false)}
                className="py-3 px-5 rounded-xl bg-onyx-800 hover:bg-onyx-700 text-onyx-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isArabic ? "تم الانتهاء" : "Done"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
