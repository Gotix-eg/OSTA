import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Animated, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createNavigationContainerRef } from "@react-navigation/native";
import { io, Socket } from "socket.io-client";

import { useAuth } from "./AuthContext";
import { API_BASE_URL, getStoredAccessToken } from "../api/client";
import { useTheme } from "./ThemeContext";
import { spacing } from "../theme/spacing";

// Global reference to check who the user is currently chatting with to suppress in-app popups
export const activeChatRef = {
  currentUserId: null as string | null
};

// Global navigation container ref to navigate from outside the NavigationContainer
export const navigationRef = createNavigationContainerRef<any>();

type NotificationToast = {
  id: string;
  title: string;
  body: string;
  type: "CHAT_MESSAGE" | "SYSTEM" | string;
  senderId?: string;
  senderName?: string;
};

type NotificationContextValue = {
  showToast: (toast: Omit<NotificationToast, "id">) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [toast, setToast] = useState<NotificationToast | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Animated values for sliding down toast
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timeoutRef = useRef<any>(null);

  // Extract socket base URL (e.g., http://localhost:4000)
  const socketUrl = API_BASE_URL.replace("/api", "");

  const showToast = (newToast: Omit<NotificationToast, "id">) => {
    // Suppress chat toast if user is already chatting with the sender
    if (newToast.type === "CHAT_MESSAGE" && newToast.senderId === activeChatRef.currentUserId) {
      return;
    }

    // Cancel existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const toastWithId = { ...newToast, id: Math.random().toString() };
    setToast(toastWithId);

    // Slide in
    Animated.spring(slideAnim, {
      toValue: 50,
      useNativeDriver: true,
      tension: 40,
      friction: 8
    }).start();

    // Slide out after 4 seconds
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 4500);
  };

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setToast(null);
    });
  };

  // Socket Connection setup
  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const connectSocket = async () => {
      try {
        const token = await getStoredAccessToken();
        if (!token) return;

        // Initialize Socket.io connection with auth token
        const socket = io(socketUrl, {
          auth: { token },
          transports: ["websocket"]
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("Socket.io connected on mobile client for user", user.id);
        });

        // Listen for new system/general notifications
        socket.on("new_notification", (data: any) => {
          console.log("Received new notification via socket:", data);
          showToast({
            title: data.title || "إشعار جديد",
            body: data.body || "",
            type: data.type || "SYSTEM"
          });
        });

        // Listen for new chat messages
        socket.on("new_message", (msg: any) => {
          console.log("Received new message via socket:", msg);
          showToast({
            title: `رسالة جديدة من ${msg.sender?.firstName || "مستخدم"}`,
            body: msg.content || "",
            type: "CHAT_MESSAGE",
            senderId: msg.senderId,
            senderName: msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName || ""}` : "محادثة"
          });
        });

        socket.on("connect_error", (err) => {
          console.warn("Socket.io connection error on mobile:", err.message);
        });

      } catch (err) {
        console.error("Failed to setup socket.io client:", err);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const handleToastPress = () => {
    if (!toast) return;
    
    hideToast();

    // Navigate to Chat screen if message, otherwise navigate to Notifications list
    if (navigationRef.isReady()) {
      if (toast.type === "CHAT_MESSAGE" && toast.senderId) {
        navigationRef.navigate("Chat", {
          conversationId: toast.senderId,
          recipientName: toast.senderName || "محادثة"
        });
      } else {
        navigationRef.navigate("Notifications");
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}

      {/* Global In-app Toast Banner */}
      {toast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Pressable style={styles.toastContent} onPress={handleToastPress}>
            <View style={styles.toastIconWrapper}>
              <Ionicons 
                name={toast.type === "CHAT_MESSAGE" ? "chatbubbles" : "notifications"} 
                size={22} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.toastTextWrapper}>
              <Text style={styles.toastTitle} numberOfLines={1}>{toast.title}</Text>
              <Text style={styles.toastBody} numberOfLines={2}>{toast.body}</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={hideToast}>
              <Ionicons name="close" size={18} color={theme.muted} />
            </Pressable>
          </Pressable>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: "5%",
    right: "5%",
    width: "90%",
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.md,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10
      },
      android: {
        elevation: 8
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6
      }
    })
  },
  toastContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm
  },
  toastIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  toastTextWrapper: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.text,
    textAlign: "right"
  },
  toastBody: {
    fontSize: 12,
    color: theme.muted,
    textAlign: "right"
  },
  closeBtn: {
    padding: 4
  }
});
