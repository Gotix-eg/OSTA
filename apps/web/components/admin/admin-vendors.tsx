"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, User, Phone, Search, Loader2, Store } from "lucide-react";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type Vendor = {
  id: string;
  shopName: string;
  shopNameAr: string | null;
  orderQuota: number;
  trialExpiresAt: string | null;
  subscriptionExpiresAt: string | null;
  totalOrders: number;
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
    console.log("AdminVendorsManagement: Fetching vendors...");
    fetchApiData<{ data: Vendor[] }>("/admin/vendors", { data: [] }).then(res => {
      console.log("AdminVendorsManagement: Received data:", res);
      // Ensure we extract data if it's wrapped in an envelope or just an array
      const vendorList = Array.isArray(res) ? res : (res as any).data || [];
      setVendors(vendorList);
      setLoading(false);
    }).catch(err => {
      console.error("AdminVendorsManagement: Fetch error:", err);
      setLoading(false);
    });
  }, []);

  async function handleAddQuota(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/vendors/${id}/quota`, {});
      setVendors(prev => prev.map(v => v.id === id ? { ...v, orderQuota: v.orderQuota + 10 } : v));
    } finally {
      setActionId(null);
    }
  }

  async function handleResetTrial(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/vendors/${id}/reset-trial`, {});
      const now = new Date();
      const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setVendors(prev => prev.map(v => v.id === id ? { ...v, trialExpiresAt: newExpiry } : v));
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-950">{isArabic ? "إدارة المتاجر" : "Vendor Management"}</h1>
          <p className="text-sm text-dark-500">{isArabic ? `إجمالي المتاجر: ${vendors.length}` : `Total Vendors: ${vendors.length}`}</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <input 
            type="text" 
            placeholder={isArabic ? "بحث بالاسم أو الرقم..." : "Search by name or phone..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-dark-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(vendor => {
            const isTrialActive = vendor.trialExpiresAt && new Date(vendor.trialExpiresAt) > new Date();
            const trialDaysLeft = vendor.trialExpiresAt ? Math.ceil((new Date(vendor.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

            return (
              <div key={vendor.id} className="bg-white rounded-2xl border border-dark-100 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark-950">{isArabic ? (vendor.shopNameAr || vendor.shopName) : vendor.shopName}</h3>
                      <div className="flex items-center gap-2 text-xs text-dark-500 mt-1">
                        <User className="h-3 w-3" />
                        <span>{vendor.user.firstName} {vendor.user.lastName}</span>
                        <span className="mx-1">•</span>
                        <Phone className="h-3 w-3" />
                        <span>{vendor.user.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isTrialActive ? (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        {isArabic ? `${trialDaysLeft} يوم تجربة` : `${trialDaysLeft}d Trial`}
                      </span>
                    ) : (
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full border",
                        vendor.orderQuota > 0 ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
                      )}>
                        {isArabic ? `رصيد: ${vendor.orderQuota}` : `Quota: ${vendor.orderQuota}`}
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-2">
                       <button 
                         onClick={() => handleAddQuota(vendor.id)}
                         disabled={actionId === vendor.id}
                         className="p-2 text-success hover:bg-success/10 rounded-lg transition disabled:opacity-50"
                         title={isArabic ? "إضافة +10 أوردرات" : "Add +10 Orders"}
                       >
                         {actionId === vendor.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                       </button>
                       <button 
                         onClick={() => handleResetTrial(vendor.id)}
                         disabled={actionId === vendor.id}
                         className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition disabled:opacity-50"
                         title={isArabic ? "تجديد الفترة التجريبية" : "Reset Trial"}
                       >
                         <RotateCcw className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-50 flex justify-between items-center text-xs">
                   <span className="text-dark-400">{isArabic ? "إجمالي الأوردرات المكتملة:" : "Total Completed Orders:"} <strong className="text-dark-900">{vendor.totalOrders}</strong></span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-dark-500">
               {isArabic ? "لا توجد نتائج بحث" : "No vendors found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
