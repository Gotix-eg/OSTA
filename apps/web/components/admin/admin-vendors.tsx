"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, Store, Phone, User, ShieldCheck, RotateCcw, Plus } from "lucide-react";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type Vendor = {
  id: string;
  shopName: string;
  shopNameAr: string | null;
  orderQuota: number;
  trialExpiresAt: string | null;
  verificationStatus: string;
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
        
        <div className="relative w-full md:w-96">
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
                      <div className="flex items-center gap-6 text-onyx-400 text-sm font-medium">
                        <span className="flex items-center gap-2"><User className="h-4 w-4 text-gold-500/60" /> {vendor.user.firstName}</span>
                        <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-500/60" /> {vendor.user.phone}</span>
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
                      <div className={cn(
                        "px-5 py-3 rounded-2xl border flex flex-col items-center min-w-[100px]",
                        vendor.orderQuota > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                      )}>
                        <span className="text-[10px] font-bold text-onyx-400 uppercase tracking-tighter mb-0.5">{isArabic ? "رصيد المبيعات" : "Order Quota"}</span>
                        <span className={cn("text-xl font-black", vendor.orderQuota > 0 ? "text-emerald-400" : "text-red-400")}>
                          {vendor.orderQuota}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
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
                       <button className="h-12 w-12 rounded-2xl bg-onyx-800 border border-onyx-700 flex items-center justify-center text-onyx-400 hover:text-white hover:border-onyx-500 transition-all">
                          <RotateCcw className="h-5 w-5" />
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
    </div>
  );
}
