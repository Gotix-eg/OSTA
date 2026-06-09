"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ToastNotification } from "@/components/shared/toast-notification";

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

  useEffect(() => {
    // Read the auth token cookie manually
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };
    
    const token = getCookie("osta_access_token") || 
                  (typeof window !== "undefined" ? (window.localStorage.getItem("osta_access_token") || window.sessionStorage.getItem("osta_access_token")) : undefined);
    if (!token) {
      console.log("Socket: No token found. Connection skipped.");
      return;
    }

    const apiVal = process.env.NEXT_PUBLIC_OSTA_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const socketUrl = apiVal.replace("/api", "");

    console.log("Connecting to socket server at:", socketUrl);

    const socketInstance = io(socketUrl, {
      auth: { token },
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
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
      <ToastNotification />
    </SocketContext.Provider>
  );
}
