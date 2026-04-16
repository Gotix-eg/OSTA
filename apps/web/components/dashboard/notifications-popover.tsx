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

  const currentRole = pathname.split("/")[2]; // Assuming standard is /[locale]/[role]/...

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
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-dark-200/80 bg-white/85 shadow-soft transition hover:bg-dark-50"
      >
        <Bell className="h-5 w-5 text-dark-600" />
        {unreadCount > 0 && (
          <span className="absolute end-2 top-2 z-10 flex h-3 w-3 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full z-[999] mt-2 w-80 overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-xl lg:w-96",
            "end-0" // Always align to the 'end' of the button (logical left in RTL, right in LTR)
          )}
        >
          <div className="flex items-center justify-between border-b border-dark-100 bg-dark-50/50 px-4 py-3">
            <h3 className="font-semibold text-dark-800">
              {isArabic ? "الإشعارات" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                {isArabic ? "تحديد الكل كمقروء" : "Mark all as read"}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-dark-500">
                <Bell className="mb-2 h-10 w-10 opacity-20" />
                <p className="text-sm">{isArabic ? "لا توجد إشعارات حالياً" : "No notifications yet"}</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-dark-100">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={getLinkForNotification(n)}
                    onClick={() => {
                        markAsRead(n.id);
                        setIsOpen(false);
                    }}
                    className={cn(
                      "group relative flex items-start px-4 py-3 transition hover:bg-dark-50",
                      !n.isRead ? "bg-primary-50/40" : ""
                    )}
                  >
                    {!n.isRead && (
                      <span className="absolute top-4 h-2 w-2 rounded-full bg-primary-600" style={{ [isArabic ? "right" : "left"]: "10px" }} />
                    )}
                    
                    <div className={cn("min-w-0 flex-1", !n.isRead ? (isArabic ? "pr-4" : "pl-4") : "")}>
                      <div className="flex justify-between items-start mb-1">
                          <p className={cn("text-sm font-semibold text-dark-900 group-hover:text-primary-600 transition", !n.isRead ? "text-primary-800" : "")}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-dark-400 whitespace-nowrap pt-0.5 mr-2">
                             {getRelativeTime(n.createdAt, locale)}
                          </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-dark-500">
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
