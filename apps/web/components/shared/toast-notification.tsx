"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";

interface Toast {
  id: string;
  title: string;
  body: string;
  type?: string;
}

export function ToastNotification() {
  const { socket } = useSocket();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

  // 1. Register Service Worker and check Notification permission on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register PWA Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Check browser notification support & status
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    // Detect if device is mobile
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth <= 768;

    // Show prompt ONLY on mobile devices if permission is still default and user hasn't dismissed it recently
    if (isMobileDevice && Notification.permission === "default") {
      const dismissedAt = localStorage.getItem("osta_notification_prompt_dismissed");
      const hoursSinceDismissed = dismissedAt
        ? (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60)
        : 999;

      if (hoursSinceDismissed > 24) {
        // Show prompt after 2 seconds
        const timer = setTimeout(() => setShowPermissionPrompt(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Helper to trigger native device/mobile notification
  const triggerNativeNotification = async (title: string, body: string, id: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          vibrate: [200, 100, 200],
          tag: id || "osta-notification",
          renotify: true,
          data: { url: window.location.origin },
        } as any);
      } else {
        new Notification(title, {
          body,
          icon: "/icon-192.png",
        });
      }
    } catch (e) {
      console.warn("Native Notification trigger fallback:", e);
      try {
        new Notification(title, {
          body,
          icon: "/icon-192.png",
        });
      } catch (err) {
        // Ignore fallback errors
      }
    }
  };

  // 2. Request Notification Permission
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      setShowPermissionPrompt(false);

      if (res === "granted") {
        await triggerNativeNotification(
          "أُسطفاي - تم التفعيل بنجاح! 🔔",
          "ستصلك إشعارات الطلبات والرسائل مباشرة على شاشة الموبايل.",
          "welcome-notification"
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const dismissPrompt = () => {
    setShowPermissionPrompt(false);
    localStorage.setItem("osta_notification_prompt_dismissed", Date.now().toString());
  };

  // 3. Listen to Socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      const title = data.title || "إشعار جديد";
      const body = data.body || "";
      const id = data.id || Math.random().toString();

      // Play audio alert using Web Audio API (no file needed)
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(880, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
        }
      } catch (e) {
        // ignore audio errors
      }

      // Add to in-app toast stack
      const newToast: Toast = { id, title, body, type: data.type || "INFO" };
      setToasts((prev) => [newToast, ...prev].slice(0, 5));

      // Trigger Native Mobile Device Push Notification
      void triggerNativeNotification(title, body, id);

      // Auto-remove in-app toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {/* Native Mobile Notification Permission Prompt Banner */}
      <AnimatePresence>
        {showPermissionPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-4 right-4 z-[10000] mx-auto max-w-md rounded-2xl border border-gold-500/40 bg-onyx-950/95 p-4 shadow-2xl backdrop-blur-xl md:left-auto md:right-6 md:w-96"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/30 border border-gold-500/40 text-gold-400 shadow-inner">
                <Bell className="h-6 w-6 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">تفعيل إشعارات الموبايل 🔔</h4>
                <p className="mt-1 text-xs text-onyx-300 leading-relaxed">
                  فّعل الإشعارات ليصلك كل جديد فوراً على شاشة الموبايل حتى أثناء إغلاق الموقع.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={requestNotificationPermission}
                    className="flex-1 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-3 py-2 text-xs font-bold text-onyx-950 shadow-md transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    تفعيل الإشعارات
                  </button>
                  <button
                    onClick={dismissPrompt}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-onyx-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
              <button
                onClick={dismissPrompt}
                className="text-onyx-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Floating Toasts */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border border-white/10 bg-onyx-900/90 p-4 shadow-2xl backdrop-blur-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-500">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{toast.title}</h4>
                <p className="mt-1 text-xs text-onyx-300 leading-relaxed">{toast.body}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-onyx-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
