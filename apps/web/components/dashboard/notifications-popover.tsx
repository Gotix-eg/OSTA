"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { fetchApiData, patchApiData } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
};

export function NotificationsPopover({ locale }: { locale: "ar" | "en" }) {
  const isArabic = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentRole = (pathname || "/").split("/")[2]; // Assuming standard is /[locale]/[role]/...

  const getRelativeTime = (date: string, locale: "ar" | "en") => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const elapsed = new Date(date).getTime() - Date.now();
    const days = Math.round(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.round(elapsed / (1000 * 60 * 60));
    const minutes = Math.round(elapsed / (1000 * 60));
    if (Math.abs(days) > 0) return rtf.format(days, "day");
    if (Math.abs(hours) > 0) return rtf.format(hours, "hour");
    return rtf.format(minutes, "minute");
  };

  const fetchNotifications = async () => {
    try {
      const data = await fetchApiData<Notification[]>("/notifications", []);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000); // Check for new notifications every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await patchApiData(`/notifications/${id}/read`, {});
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Revert on failure
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await patchApiData(`/notifications/read-all`, {});
    } catch (error) {
      console.error("Failed to mark all as read", error);
      fetchNotifications();
    }
  };

  const getLinkForNotification = (n: Notification) => {
    // Fallback if no specific link logic exists
    if (currentRole === "vendor") return `/${locale}/vendor/requests`;
    if (currentRole === "client") {
        if (n.data?.customRequestId) return `/${locale}/client/my-requests?tab=custom_requests`;
        return `/${locale}/client/requests`;
    }
    return "#";
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl transition-all duration-500 hover:bg-white/10"
      >
        <Bell className="h-5 w-5 text-white/70 group-hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute end-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-onyx-950 ring-2 ring-onyx-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full z-[999] mt-4 w-80 overflow-hidden glass-card p-0 lg:w-96",
            "end-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-5 py-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">
              {isArabic ? "الإشعارات" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold uppercase tracking-widest text-gold-500 hover:text-accent-gold"
              >
                {isArabic ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-onyx-500">
                <Bell className="mb-4 h-12 w-12 opacity-10" />
                <p className="text-xs font-medium">{isArabic ? "لا توجد إشعارات حالياً" : "No notifications yet"}</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={getLinkForNotification(n)}
                    onClick={() => {
                        markAsRead(n.id);
                        setIsOpen(false);
                    }}
                    className={cn(
                      "group relative flex items-start px-5 py-4 transition-all duration-500 hover:bg-white/5",
                      !n.isRead ? "bg-gold-500/5" : ""
                    )}
                  >
                    {!n.isRead && (
                      <span className="absolute top-6 h-2 w-2 rounded-full bg-gold-500 shadow-glow" style={{ [isArabic ? "right" : "left"]: "12px" }} />
                    )}
                    
                    <div className={cn("min-w-0 flex-1", !n.isRead ? (isArabic ? "pr-5" : "pl-5") : "")}>
                      <div className="flex justify-between items-start mb-2">
                          <p className={cn("text-sm font-bold text-white/90 group-hover:text-gold-500 transition-colors", !n.isRead ? "text-white" : "text-white/60")}>
                            {n.title}
                          </p>
                          <span className="text-[10px] font-medium text-onyx-500 whitespace-nowrap pt-0.5 ms-3">
                             {getRelativeTime(n.createdAt, locale)}
                          </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-onyx-400">
                        {n.body}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
