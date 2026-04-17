"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, User, Phone, Search, Loader2, Wrench, Star } from "lucide-react";
import { fetchApiData, postApiData } from "@/lib/api";
import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

type Worker = {
  id: string;
  orderQuota: number;
  trialExpiresAt: string | null;
  subscriptionExpiresAt: string | null;
  rating: number;
  totalJobsCompleted: number;
  verificationStatus: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
};

export function AdminWorkersManagement({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

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

  async function handleAddQuota(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/workers/${id}/quota`, {});
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, orderQuota: w.orderQuota + 10 } : w));
    } finally {
      setActionId(null);
    }
  }

  async function handleResetTrial(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/workers/${id}/reset-trial`, {});
      const now = new Date();
      const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, trialExpiresAt: newExpiry } : w));
    } finally {
      setActionId(null);
    }
  }

  const filtered = workers.filter(w => 
    w.user.firstName.toLowerCase().includes(search.toLowerCase()) || 
    w.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    w.user.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-950">{isArabic ? "إدارة الصنايعية" : "Worker Management"}</h1>
          <p className="text-sm text-dark-500">{isArabic ? `إجمالي الصنايعية: ${workers.length}` : `Total Workers: ${workers.length}`}</p>
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
          {filtered.map(worker => {
            const isTrialActive = worker.trialExpiresAt && new Date(worker.trialExpiresAt) > new Date();
            const trialDaysLeft = worker.trialExpiresAt ? Math.ceil((new Date(worker.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

            return (
              <div key={worker.id} className="bg-white rounded-2xl border border-dark-100 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-dark-950">{worker.user.firstName} {worker.user.lastName}</h3>
                      <div className="flex items-center gap-2 text-xs text-dark-500 mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{worker.user.phone}</span>
                        <span className="mx-1">•</span>
                        <div className="flex items-center gap-1 text-sun-600 font-bold">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{worker.rating}</span>
                        </div>
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
                        worker.orderQuota > 0 ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
                      )}>
                        {isArabic ? `رصيد: ${worker.orderQuota}` : `Quota: ${worker.orderQuota}`}
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-2">
                       <button 
                         onClick={() => handleAddQuota(worker.id)}
                         disabled={actionId === worker.id}
                         className="p-2 text-success hover:bg-success/10 rounded-lg transition disabled:opacity-50"
                         title={isArabic ? "إضافة +10 أوردرات" : "Add +10 Orders"}
                       >
                         {actionId === worker.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                       </button>
                       <button 
                         onClick={() => handleResetTrial(worker.id)}
                         disabled={actionId === worker.id}
                         className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition disabled:opacity-50"
                         title={isArabic ? "تجديد الفترة التجريبية" : "Reset Trial"}
                       >
                         <RotateCcw className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-50 flex justify-between items-center text-xs">
                   <div className="flex items-center gap-4">
                     <span className="text-dark-400">{isArabic ? "إجمالي الأوردرات المكتملة:" : "Total Completed Jobs:"} <strong className="text-dark-900">{worker.totalJobsCompleted}</strong></span>
                     <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        worker.verificationStatus === "VERIFIED" ? "bg-success/10 text-success" : "bg-sun-400/10 text-sun-700"
                     )}>
                       {worker.verificationStatus}
                     </span>
                   </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-dark-500">
               {isArabic ? "لا توجد نتائج بحث" : "No workers found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
