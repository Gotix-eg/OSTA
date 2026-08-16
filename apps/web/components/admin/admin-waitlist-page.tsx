"use client";

import { useEffect, useState } from "react";
import { fetchApiData } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/locales";

interface WaitlistEntry {
  id: string;
  role: string;
  email: string | null;
  phone: string;
  createdAt: string;
}

export function AdminWaitlistPage({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetchApiData<WaitlistEntry[]>("/waitlist", []);
        if (res) {
          setEntries(res);
        }
      } catch (err) {
        console.error("Failed to load waitlist", err);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {isArabic ? "قائمة الانتظار" : "Waitlist"}
        </h1>
        <p className="text-white/60 text-sm">
          {isArabic
            ? "الموردين والعملاء الذين سجلوا اهتمامهم أثناء فترة الصيانة."
            : "Vendors and clients who registered their interest during maintenance."}
        </p>
      </div>

      <div className="overflow-hidden border border-white/10 bg-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-white/5 text-xs uppercase text-white/70">
              <tr>
                <th className="px-6 py-4">{isArabic ? "الدور" : "Role"}</th>
                <th className="px-6 py-4">{isArabic ? "رقم الهاتف" : "Phone"}</th>
                <th className="px-6 py-4">{isArabic ? "البريد الإلكتروني" : "Email"}</th>
                <th className="px-6 py-4">{isArabic ? "تاريخ التسجيل" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                    {isArabic ? "لا توجد أي تسجيلات بعد" : "No entries yet"}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-gold">
                      {entry.role === "VENDOR" ? (isArabic ? "مورد" : "Vendor") : (isArabic ? "عميل" : "Client")}
                    </td>
                    <td className="px-6 py-4" dir="ltr">{entry.phone}</td>
                    <td className="px-6 py-4 text-white/80">{entry.email || "—"}</td>
                    <td className="px-6 py-4 text-white/60">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }).format(new Date(entry.createdAt))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
