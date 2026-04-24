"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, User, Phone, Search, Loader2, Wrench, Star, ShieldCheck } from "lucide-react";
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

  async function handleVerify(id: string) {
    setActionId(id);
    try {
      await postApiData(`/admin/workers/${id}/verify`, {});
      const now = new Date();
      const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setWorkers(prev => prev.map(w => w.id === id ? { ...w, verificationStatus: "VERIFIED", trialExpiresAt } : w));
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
    <div className="space-y-8 animate-slideUp">
      <div className="onyx-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-gold-500/10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isArabic ? "إدارة الصنايعية" : "Worker Management"}
          </h1>
          <p className="text-onyx-400 text-sm font-medium">
            {isArabic ? `إجمالي الكوادر: ${workers.length}` : `Total Workforce: ${workers.length}`}
          </p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-onyx-500" />
          <input 
            type="text" 
            placeholder={isArabic ? "بحث بالاسم أو رقم الهاتف..." : "Search by name or phone..."}
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
          {filtered.map(worker => {
            const isTrialActive = worker.trialExpiresAt && new Date(worker.trialExpiresAt) > new Date();
            const trialDaysLeft = worker.trialExpiresAt ? Math.ceil((new Date(worker.trialExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

            return (
              <div key={worker.id} className="onyx-card p-6 group hover:border-gold-500/30 transition-all duration-500">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-onyx-800 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform duration-500">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-gold-500 transition-colors">
                        {worker.user.firstName} {worker.user.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-onyx-400 mt-2 text-sm">
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {worker.user.phone}</span>
                        <span className="flex items-center gap-1.5 text-gold-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current" /> {worker.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isTrialActive ? (
                      <div className="px-4 py-2 bg-gold-500/10 text-gold-500 text-xs font-black uppercase tracking-widest rounded-xl border border-gold-500/20">
                        {isArabic ? `${trialDaysLeft} يوم تجربة` : `${trialDaysLeft}d Trial`}
                      </div>
                    ) : (
                      <div className={cn(
                        "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border",
                        worker.orderQuota > 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {isArabic ? `رصيد: ${worker.orderQuota}` : `Quota: ${worker.orderQuota}`}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                       {worker.verificationStatus !== "VERIFIED" && (
                         <button 
                           onClick={() => handleVerify(worker.id)}
                           disabled={actionId === worker.id}
                           className="btn-gold py-2 px-6 text-sm"
                         >
                           {actionId === worker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                           {isArabic ? "توثيق الحساب" : "Verify Pro"}
                         </button>
                       )}
                       <button className="btn-onyx p-3 border-onyx-700">
                          <RotateCcw className="h-5 w-5 text-onyx-400" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="onyx-card p-20 text-center text-onyx-500 font-medium border-dashed border-onyx-700">
               {isArabic ? "لا توجد نتائج مطابقة لبحثك" : "No matching professionals found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
