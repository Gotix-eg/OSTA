"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
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

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      // Play sound
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(e => console.log("Audio play blocked by browser"));
      } catch (e) {
        // ignore
      }

      const newToast: Toast = {
        id: data.id || Math.random().toString(),
        title: data.title || "إشعار جديد",
        body: data.body || "",
        type: data.type || "INFO"
      };

      setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
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
  );
}
