"use client";

import { useEffect, useState } from "react";

import { Building2, CreditCard, Save, ShieldCheck, Sparkles, Users, Wallet, Wrench, Trash2, Loader2 } from "lucide-react";
import { patchApiData, deleteApiData } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
  DashboardBlock,
  EmptyState,
  MiniMetric,
  SoftBadge,
  SoftCard,
  SplitInfo
} from "@/components/dashboard/dashboard-subpage-primitives";
import { useLiveApiData } from "@/hooks/use-live-api-data";
import type { Locale } from "@/lib/locales";
import type { AdminClientsData, AdminFinanceData, AdminRequestsData, AdminSettingsData } from "@/lib/operations-data";

function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(locale: Locale, value: number) {
  const formatted = formatNumber(locale, value);
  return locale === "ar" ? `${formatted} ج.م` : `EGP ${formatted}`;
}

export function AdminClientsPage({ locale, initialData }: { locale: Locale; initialData: AdminClientsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/admin/clients", initialData);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (liveData) {
      setData(liveData);
    }
  }, [liveData]);

  // Wallet and Delete State
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletAction, setWalletAction] = useState<"add" | "deduct" | "set">("add");
  const [actionLoading, setActionLoading] = useState(false);

  async function handleDeleteClient() {
    if (!selectedClient) return;
    setActionLoading(true);
    try {
      await deleteApiData(`/admin/users/${selectedClient.id}`); // client.id is the User.id
      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== selectedClient.id),
        summary: {
          ...prev.summary,
          totalClients: prev.summary.totalClients - 1
        }
      }));
      setDeleteModalOpen(false);
      setSelectedClient(null);
    } catch (err) {
      alert(isArabic ? "فشل حذف العميل" : "Failed to delete client");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdjustWallet() {
    if (!selectedClient) return;
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

      const updatedProfile = await patchApiData<any, any>(`/admin/clients/${selectedClient.id}/wallet`, body);
      setData(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === selectedClient.id ? { ...c, walletBalance: updatedProfile.walletBalance } : c)
      }));
      setWalletModalOpen(false);
      setWalletAmount("");
      setSelectedClient(null);
    } catch (err) {
      alert(isArabic ? "فشل تعديل رصيد المحفظة" : "Failed to adjust wallet balance");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>


      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "إجمالي العملاء" : "Total clients"} value={formatNumber(locale, data.summary.totalClients)} note={isArabic ? "إجمالي القاعدة" : "full base"} icon={Users} tone="dark" />
        <MiniMetric label={isArabic ? "النشط هذا الأسبوع" : "Active this week"} value={formatNumber(locale, data.summary.activeThisWeek)} note={isArabic ? "الحركة الأسبوعية" : "weekly motion"} icon={Sparkles} tone="accent" />
        <MiniMetric label={isArabic ? "عملاء كبار" : "VIP clients"} value={formatNumber(locale, data.summary.vipClients)} note={isArabic ? "شريحة مميزة" : "premium segment"} icon={ShieldCheck} tone="sun" />
        <MiniMetric label={isArabic ? "متوسط التقييم" : "Avg rating"} value={formatNumber(locale, data.summary.averageRating)} note={isArabic ? "مؤشر الثقة" : "service trust"} icon={Wallet} tone="primary" />
      </div>

      <DashboardBlock title={isArabic ? "قائمة العملاء" : "Client roster"} eyebrow={isArabic ? "بطاقات الحسابات" : "account deck"}>
        {data.clients.length === 0 ? (
          <EmptyState>{isArabic ? "لا توجد سجلات عملاء" : "No client records"}</EmptyState>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.clients.map((client, index) => (
              <div key={client.id} className={index % 2 === 0 ? "onyx-card p-5" : "onyx-card bg-onyx-800/80 p-5"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{client.name}</h2>
                    <p className="mt-2 text-onyx-400">{client.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SoftBadge label={client.status} tone={client.status === "VIP" ? "sun" : "accent"} />
                    <button 
                      onClick={() => {
                        setSelectedClient(client);
                        setWalletAmount("");
                        setWalletAction("add");
                        setWalletModalOpen(true);
                      }}
                      className="h-10 w-10 rounded-xl bg-onyx-900 border border-onyx-700 flex items-center justify-center text-gold-500 hover:text-onyx-950 hover:bg-gold-500 transition-all"
                      title={isArabic ? "تعديل المحفظة" : "Adjust Wallet"}
                    >
                      <Wallet className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedClient(client);
                        setDeleteModalOpen(true);
                      }}
                      className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title={isArabic ? "حذف الحساب" : "Delete Account"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <SplitInfo
                    items={[
                      { label: isArabic ? "الطلبات" : "Requests", value: formatNumber(locale, client.requests) },
                      { label: isArabic ? "المحفظة" : "Wallet", value: formatCurrency(locale, client.walletBalance) }
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardBlock>

      {/* Wallet Adjustment Modal */}
      {walletModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card max-w-md w-full p-8 border-gold-500/30 space-y-6">
            <h3 className="text-2xl font-black text-white">
              {isArabic ? `تعديل محفظة: ${selectedClient.name}` : `Adjust Wallet: ${selectedClient.name}`}
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
                  setSelectedClient(null);
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
      {deleteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="onyx-card max-w-md w-full p-8 border-red-500/30 space-y-6">
            <h3 className="text-2xl font-black text-white">
              {isArabic ? "تأكيد حذف الحساب نهائياً" : "Confirm Permanent Delete"}
            </h3>
            <p className="text-onyx-300 text-sm leading-relaxed">
              {isArabic 
                ? `هل أنت متأكد من رغبتك في حذف حساب العميل "${selectedClient.name}" بالكامل؟ سيتم مسح هذا الحساب وكافة الطلبات والبيانات والتقييمات التابعة له ولا يمكن التراجع عن هذا القرار.` 
                : `Are you sure you want to permanently delete client "${selectedClient.name}"? This will delete their entire account, requests, and ratings. This action cannot be undone.`}
            </p>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedClient(null);
                }}
                disabled={actionLoading}
                className="btn-onyx py-3 px-6 text-sm font-bold"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteClient}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-6 text-sm font-bold transition-all"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isArabic ? "حذف نهائي" : "Delete Permanently")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminRequestsPage({ locale, initialData }: { locale: Locale; initialData: AdminRequestsData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/requests", initialData);

  return (
    <div>


      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "نشط الآن" : "Active"} value={formatNumber(locale, data.summary.active)} note={isArabic ? "طلبات حية" : "live jobs"} icon={Wrench} tone="primary" />
        <MiniMetric label={isArabic ? "المكتمل اليوم" : "Completed today"} value={formatNumber(locale, data.summary.completedToday)} note={isArabic ? "مخرجات التنفيذ" : "delivery output"} icon={ShieldCheck} tone="accent" />
        <MiniMetric label={isArabic ? "متنازع عليه" : "Disputed"} value={formatNumber(locale, data.summary.disputed)} note={isArabic ? "يحتاج انتباه" : "attention rail"} icon={Building2} tone="sun" />
        <MiniMetric label={isArabic ? "متوسط التذكرة" : "Avg ticket"} value={formatCurrency(locale, data.summary.averageTicket)} note={isArabic ? "كثافة التسعير" : "pricing density"} icon={CreditCard} tone="dark" />
      </div>

      <DashboardBlock title={isArabic ? "تدفق الطلبات" : "Request stream"} eyebrow={isArabic ? "بطاقات التشغيل" : "ops deck"}>
        <div className="grid gap-4">
          {data.requests.map((request, index) => (
            <div key={request.id} className={index % 2 === 0 ? "onyx-card p-5" : "onyx-card bg-onyx-800/80 p-5"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">{request.title}</h2>
                  <p className="mt-2 text-onyx-400">{request.city}</p>
                </div>
                <SoftBadge label={isArabic ? (request.status === "PENDING" ? "قيد المراجعة" : request.status === "IN_PROGRESS" ? "قيد التنفيذ" : "في الطريق") : request.status} tone={request.status === "PENDING" ? "sun" : request.status === "IN_PROGRESS" ? "accent" : "primary"} />
              </div>
              <div className="mt-4">
                <SplitInfo items={[{ label: "ID", value: request.id }, { label: isArabic ? "القيمة" : "Amount", value: formatCurrency(locale, request.amount) }]} />
              </div>
            </div>
          ))}
        </div>
      </DashboardBlock>
    </div>
  );
}

export function AdminFinancePage({ locale, initialData }: { locale: Locale; initialData: AdminFinanceData }) {
  const isArabic = locale === "ar";
  const data = useLiveApiData("/admin/finance", initialData);

  return (
    <div>


      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label={isArabic ? "الإيراد" : "Revenue"} value={formatCurrency(locale, data.summary.totalRevenue)} note={isArabic ? "إجمالي الحجم" : "gross volume"} icon={Wallet} tone="dark" />
        <MiniMetric label={isArabic ? "العمولات" : "Commissions"} value={formatCurrency(locale, data.summary.commissions)} note={isArabic ? "حصة المنصة" : "platform take"} icon={CreditCard} tone="primary" />
        <MiniMetric label={isArabic ? "الأموال المحجوزة" : "Escrow held"} value={formatCurrency(locale, data.summary.escrowHeld)} note={isArabic ? "أموال محمية" : "protected funds"} icon={ShieldCheck} tone="accent" />
        <MiniMetric label={isArabic ? "المفرج عنه هذا الأسبوع" : "Released this week"} value={formatCurrency(locale, data.summary.releasedThisWeek)} note={isArabic ? "حركة الإفراج" : "cash release"} icon={Sparkles} tone="sun" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardBlock title={isArabic ? "مصادر المال" : "Finance streams"} eyebrow={isArabic ? "طبقات التدفق" : "money layers"}>
          <div className="grid gap-4">
            {data.streams.map((item, index) => (
              <SoftCard key={item.label} className={index % 2 === 0 ? undefined : "bg-onyx-800/80"}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(locale, item.value)}</p>
                </div>
              </SoftCard>
            ))}
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "مسار التحويل" : "Payout rail"} eyebrow={isArabic ? "بطاقات الإفراج" : "release deck"}>
          <div className="grid gap-4">
            {data.payouts.map((item, index) => (
              <div key={item.id} className={index % 2 === 0 ? "onyx-card p-4" : "onyx-card bg-onyx-800/80 p-4"}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-onyx-400">{item.status}</p>
                  </div>
                  <p className="text-lg font-semibold text-white">{formatCurrency(locale, item.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardBlock>
      </div>
    </div>
  );
}

export function AdminSettingsPage({ locale, initialData }: { locale: Locale; initialData: AdminSettingsData }) {
  const isArabic = locale === "ar";
  const liveData = useLiveApiData("/admin/settings", initialData);
  const [data, setData] = useState(initialData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setData(liveData);
  }, [liveData]);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>


      {saved ? <div className="mb-4 rounded-[1.2rem] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{isArabic ? "تم الحفظ محليًا" : "Saved locally"}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardBlock title={isArabic ? "المنصة" : "Platform"} eyebrow={isArabic ? "إعدادات الهوية" : "brand controls"}>
          <div className="grid gap-4">
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "بريد الدعم" : "Support email"}</span><input value={data.platform.supportEmail} onChange={(event) => setData({ ...data, platform: { ...data.platform, supportEmail: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "خط الطوارئ" : "Emergency hotline"}</span><input value={data.platform.emergencyHotline} onChange={(event) => setData({ ...data, platform: { ...data.platform, emergencyHotline: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
            <label className="space-y-2"><span className="text-sm text-onyx-400">{isArabic ? "اللغة الافتراضية" : "Default language"}</span><input value={data.platform.defaultLanguage} onChange={(event) => setData({ ...data, platform: { ...data.platform, defaultLanguage: event.target.value } })} className="h-12 w-full rounded-[1rem] border border-onyx-700 bg-onyx-800/50 px-4" /></label>
          </div>
        </DashboardBlock>

        <DashboardBlock title={isArabic ? "التشغيل والإشراف" : "Operations + moderation"} eyebrow={isArabic ? "خيارات السياسات" : "policy toggles"}>
          <div className="grid gap-4">
            <label className="onyx-card flex items-center justify-between gap-4 p-4"><span className="font-medium text-white">{isArabic ? "إسناد تلقائي" : "Auto assignment"}</span><input type="checkbox" checked={data.operations.autoAssignmentEnabled} onChange={(event) => setData({ ...data, operations: { ...data.operations, autoAssignmentEnabled: event.target.checked } })} className="h-4 w-4" /></label>
            <label className="onyx-card flex items-center justify-between gap-4 p-4"><span className="font-medium text-white">{isArabic ? "توثيق يدوي إجباري" : "Manual verification required"}</span><input type="checkbox" checked={data.operations.manualVerificationRequired} onChange={(event) => setData({ ...data, operations: { ...data.operations, manualVerificationRequired: event.target.checked } })} className="h-4 w-4" /></label>
            <SplitInfo
              items={[
                { label: isArabic ? "التحويلات" : "Payouts", value: data.operations.payoutsSchedule },
                { label: isArabic ? "ساعات الشكاوى" : "Complaints hrs", value: formatNumber(locale, data.moderation.complaintEscalationHours) },
                { label: isArabic ? "أيام إعادة الفحص" : "Recheck days", value: formatNumber(locale, data.moderation.workerRecheckCycleDays) }
              ]}
            />
          </div>
        </DashboardBlock>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-dark-950 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          <Save className="h-4 w-4" />
          {isArabic ? "حفظ" : "Save"}
        </button>
      </div>
    </div>
  );
}
