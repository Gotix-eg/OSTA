"use client";

import React, { useState, useEffect } from "react";
import { fetchApiData, postApiData } from "@/lib/api";
import { Users, DollarSign, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import type { Locale } from "@/lib/locales";

interface AdminSummary {
  totalRevenue: number;
  pendingVerifications: number;
  activeRequests: number;
  openComplaints: number;
}

interface PendingWorker {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  status: string;
  submittedAt: string;
}

export function AdminDashboardView({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [pendingWorkers, setPendingWorkers] = useState<PendingWorker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await fetchApiData<any>("/admin/dashboard", null);
      if (data) {
        setSummary(data.summary);
        setPendingWorkers(data.verificationQueue);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id: string, isVendor: boolean = false) {
    if (!confirm(isArabic ? "هل أنت متأكد من اعتماد هذا الحساب؟" : "Are you sure you want to verify this user?")) return;
    try {
      const endpoint = isVendor ? `/admin/vendors/${id}/verify` : `/admin/workers/${id}/verify`;
      await postApiData(endpoint, {});
      alert(isArabic ? "تم الاعتماد بنجاح" : "Verified successfully!");
      loadDashboard();
    } catch (e) {
      alert(isArabic ? "حدث خطأ أثناء الاعتماد" : "Error verifying user.");
    }
  }

  if (loading) return <div className="text-white text-center py-20">{isArabic ? "جاري التحميل..." : "Loading..."}</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-eyebrow">OSTA ADMIN</p>
        <h1 className="text-3xl font-bold text-white mb-2">{isArabic ? "لوحة الإدارة الشاملة" : "Platform Command Center"}</h1>
        <p className="text-onyx-300">{isArabic ? "مراقبة أداء المنصة واعتماد الفنيين والموردين." : "Monitor platform performance and approve worker and vendor accounts."}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="onyx-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-gold-500">
            <DollarSign className="w-16 h-16" />
          </div>
          <span className="text-onyx-400 text-sm font-medium">{isArabic ? "إجمالي الإيرادات" : "Total revenue"}</span>
          <span className="text-4xl font-bold text-white mt-2">
            EGP {summary?.totalRevenue?.toLocaleString() || 0}
          </span>
        </div>

        <div className="onyx-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-gold-500">
            <Users className="w-16 h-16" />
          </div>
          <span className="text-onyx-400 text-sm font-medium">{isArabic ? "الاعتمادات المعلقة" : "Pending verifications"}</span>
          <span className="text-4xl font-bold text-white mt-2">
            {summary?.pendingVerifications || 0}
          </span>
        </div>

        <div className="onyx-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-gold-500">
            <Activity className="w-16 h-16" />
          </div>
          <span className="text-onyx-400 text-sm font-medium">{isArabic ? "الطلبات النشطة" : "Active requests"}</span>
          <span className="text-4xl font-bold text-white mt-2">
            {summary?.activeRequests || 0}
          </span>
        </div>

        <div className="onyx-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-error">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <span className="text-onyx-400 text-sm font-medium">{isArabic ? "الشكاوى المفتوحة" : "Open complaints"}</span>
          <span className="text-4xl font-bold text-error mt-2">
            {summary?.openComplaints || 0}
          </span>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="onyx-card p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="text-gold-500" /> {isArabic ? "الفنيين والموردين قيد الاعتماد" : "Worker and vendor verification queue"}
        </h2>

        {pendingWorkers.length === 0 ? (
          <div className="text-center py-10 text-onyx-400">{isArabic ? "لا توجد اعتمادات معلقة حالياً." : "No pending verifications right now."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-onyx-300">
              <thead className="bg-onyx-800 text-xs text-white uppercase">
                <tr>
                  <th className="px-6 py-4">{isArabic ? "الاسم" : "Name"}</th>
                  <th className="px-6 py-4">{isArabic ? "رقم الهاتف" : "Phone"}</th>
                  <th className="px-6 py-4">{isArabic ? "التخصص" : "Specialty"}</th>
                  <th className="px-6 py-4">{isArabic ? "تاريخ التقديم" : "Submitted"}</th>
                  <th className="px-6 py-4 text-center">{isArabic ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {pendingWorkers.map((w) => (
                  <tr key={w.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{w.name}</td>
                    <td className="px-6 py-4">{w.phone}</td>
                    <td className="px-6 py-4">{w.specialty}</td>
                    <td className="px-6 py-4">{w.submittedAt}</td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleVerify(w.id)}
                        className="flex items-center gap-1 rounded-lg bg-success/20 px-3 py-2 text-success hover:bg-success hover:text-white transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> {isArabic ? "اعتماد كفني" : "Verify worker"}
                      </button>
                      <button
                        onClick={() => handleVerify(w.id, true)}
                        className="flex items-center gap-1 rounded-lg bg-gold-500/20 px-3 py-2 text-gold-500 hover:bg-gold-500 hover:text-onyx-950 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> {isArabic ? "اعتماد كمورد" : "Verify vendor"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
