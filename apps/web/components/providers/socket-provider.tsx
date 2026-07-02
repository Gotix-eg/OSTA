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
        if (!cancelled) {
          setIsAuthenticated(response.ok);
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

    const apiVal = process.env.NEXT_PUBLIC_OSTA_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
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

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
      <ToastNotification />
    </SocketContext.Provider>
  );
}
