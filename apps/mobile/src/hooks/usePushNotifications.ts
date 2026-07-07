/**
 * usePushNotifications hook
 * Registers the device for Expo push notifications, saves the token to the server,
 * and sets up handlers for when notifications are received or tapped.
 */
import { useEffect, useRef } from "react";
import { Platform, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

import { apiClient } from "../api/client";
import { navigationRef } from "../context/NotificationContext";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on real devices
  if (!Device.isDevice) {
    console.log("Push notifications skipped: not a real device.");
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission denied.");
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "الإشعارات",
      description: "إشعارات عامة من أُسطى",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#C0392B",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("chat", {
      name: "رسائل الشات",
      description: "إشعارات الرسائل الجديدة",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 100, 150],
      lightColor: "#6C63FF",
      sound: "default",
    });
  }

  // Get the Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn("No EAS projectId found in app config.");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (err) {
    console.error("Failed to get Expo push token:", err);
    return null;
  }
}

export function usePushNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const tokenSentRef = useRef(false);

  useEffect(() => {
    // Register and save token to server
    registerForPushNotifications().then(async (token) => {
      if (token && !tokenSentRef.current) {
        tokenSentRef.current = true;
        try {
          await apiClient.post("/notifications/push-token", { token });
          console.log("Push token saved to server:", token);
        } catch (err) {
          console.error("Failed to save push token:", err);
        }
      }
    });

    // Listener: notification received while app is open (foreground)
    // expo-notifications will show it automatically (configured above)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Push notification received (foreground):", notification);
    });

    // Listener: user TAPPED a notification (from background or killed state)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      console.log("Push notification tapped, data:", data);

      if (!navigationRef.isReady()) return;

      // Navigate based on notification type
      if (data?.type === "CHAT_MESSAGE" && data?.senderId) {
        navigationRef.navigate("Chat", {
          conversationId: data.senderId,
          recipientName: data.senderName || "محادثة",
        });
      } else if (data?.type === "REQUEST_STATUS" && data?.requestId) {
        navigationRef.navigate("RequestDetails", { requestId: data.requestId });
      } else {
        navigationRef.navigate("Notifications");
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
