"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ToastNotification } from "@/components/shared/toast-notification";
import { resolveApiBaseUrl } from "@/lib/api";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch(`${resolveApiBaseUrl()}/auth/me`, {
          credentials: "include",
          headers: { Accept: "application/json" }
        });
        const payload = response.ok ? await response.json() : null;
        const user = payload?.data?.user ?? payload?.data;
        if (!cancelled) {
          setIsAuthenticated(Boolean(user?.id));
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      }
    };

    void checkSession();
    const intervalId = setInterval(checkSession, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const apiVal = process.env.NEXT_PUBLIC_OSTA_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiVal) {
      console.warn("Socket connection skipped: NEXT_PUBLIC_OSTA_API_URL is not configured");
      setSocket(null);
      setIsConnected(false);
      return;
    }
    const socketUrl = apiVal.replace("/api", "");

    console.log("Connecting to socket server at:", socketUrl);

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected successfully!");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated]);

  // ==============================================================
  // تسجيل رمز التنبيهات (Expo Push Token) للخادم عند تسجيل الدخول
  // ==============================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    const getPushTokenAndRegister = async () => {
      const win = window as any;
      const pushToken = win.EXPO_PUSH_TOKEN;
      if (!pushToken) {
        // Request the token from Native if not set yet
        try {
          if (win.ReactNativeWebView) {
            win.ReactNativeWebView.postMessage(JSON.stringify({ type: "GET_PUSH_TOKEN" }));
          }
        } catch (e) {
          // ignore
        }
        return;
      }

      const registeredKey = `osta_push_registered_${pushToken}`;
      if (localStorage.getItem(registeredKey) === "true") {
        return; // Registered in this session already
      }

      try {
        const response = await fetch(`${resolveApiBaseUrl()}/notifications/register-push`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ token: pushToken }),
          credentials: "include",
        });

        if (response.ok) {
          localStorage.setItem(registeredKey, "true");
          console.log("Push token registered successfully:", pushToken);
        }
      } catch (error) {
        console.error("Failed to register push token:", error);
      }
    };

    // Try registering right away
    void getPushTokenAndRegister();

    // Listen for push token messages injected from Native WebView
    const handleWebViewMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "SET_PUSH_TOKEN" && data.token) {
          (window as any).EXPO_PUSH_TOKEN = data.token;
          void getPushTokenAndRegister();
        }
      } catch {
        // Not JSON message
      }
    };

    window.addEventListener("message", handleWebViewMessage);
    return () => {
      window.removeEventListener("message", handleWebViewMessage);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
      <ToastNotification />
    </SocketContext.Provider>
  );
}
