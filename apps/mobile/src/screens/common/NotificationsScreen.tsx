import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import { apiClient } from "../../api/client";
import { spacing } from "../../theme/spacing";
import { useAuth } from "../../context/AuthContext";
import { GuestGate } from "../../components/GuestGate";
import { Screen } from "../../components/Screen";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    senderId?: string;
    senderName?: string;
    type?: string;
    requestId?: string;
  };
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function notifIcon(type: string) {
  switch (type) {
    case "CHAT_MESSAGE": return "chatbubbles";
    case "REQUEST_ACCEPTED": return "checkmark-circle";
    case "REQUEST_REJECTED": return "close-circle";
    case "ORDER_STATUS": return "receipt";
    case "PAYMENT": return "card";
    default: return "notifications";
  }
}

function notifColor(type: string, primary: string) {
  switch (type) {
    case "CHAT_MESSAGE": return "#6C63FF";
    case "REQUEST_ACCEPTED": return "#22c55e";
    case "REQUEST_REJECTED": return "#ef4444";
    case "ORDER_STATUS": return "#f59e0b";
    case "PAYMENT": return "#10b981";
    default: return primary;
  }
}

export function NotificationsScreen() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const { resetUnreadCount } = useNotifications();
  const navigation = useNavigation<any>();
  const styles = makeStyles(theme);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiClient.get("/notifications");
      setNotifications(res.data?.data || []);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchNotifications();
    // Mark all as read when screen opens
    resetUnreadCount();
  }, [token, fetchNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  if (!token) {
    return (
      <Screen title="الإشعارات" showBack={false}>
        <GuestGate message="يرجى تسجيل الدخول لمتابعة عروض الفنيين والإشعارات الفورية لطلباتك." />
      </Screen>
    );
  }

  const handleNotifPress = async (notif: Notification) => {
    // Mark as read locally
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    // Mark as read on server
    try { await apiClient.patch(`/notifications/${notif.id}/read`); } catch {}

    const isChatType = notif.type === "CHAT_MESSAGE" || notif.data?.type === "CHAT_MESSAGE";
    const senderId = notif.data?.senderId;

    if (isChatType && senderId) {
      navigation.navigate("Chat", {
        conversationId: senderId,
        recipientName: notif.data?.senderName || "محادثة"
      });
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const color = notifColor(item.type, theme.primary);
    const icon = notifIcon(item.type);

    return (
      <Pressable
        style={[styles.item, !item.isRead && styles.itemUnread]}
        onPress={() => handleNotifPress(item)}
        android_ripple={{ color: theme.border }}
      >
        {/* Unread dot */}
        {!item.isRead && <View style={styles.unreadDot} />}

        <View style={[styles.iconBox, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>

        <View style={styles.textBox}>
          <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.muted} />
          <Text style={styles.emptyText}>لا توجد إشعارات</Text>
          <Text style={styles.emptySubText}>ستظهر هنا إشعاراتك الجديدة</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.md,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    padding: 4,
    transform: [{ scaleX: -1 }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
  },
  item: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: theme.background,
    gap: spacing.sm,
    position: "relative",
  },
  itemUnread: {
    backgroundColor: theme.primary + "08",
  },
  unreadDot: {
    position: "absolute",
    left: spacing.md,
    top: "50%",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginTop: -4,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBox: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
    textAlign: "right",
  },
  titleUnread: {
    fontWeight: "700",
    color: theme.text,
  },
  body: {
    fontSize: 13,
    color: theme.muted,
    textAlign: "right",
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: theme.muted,
    textAlign: "right",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginTop: spacing.md,
  },
  emptySubText: {
    fontSize: 14,
    color: theme.muted,
  },
});
