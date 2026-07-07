/**
 * Expo Push Notification Utility
 * Sends push notifications to mobile devices via Expo's Push API.
 * Uses plain HTTP — no additional SDK needed on the server.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

/**
 * Send a push notification to a single Expo push token.
 */
export async function sendPushNotification(
  expoPushToken: string | null | undefined,
  payload: PushPayload
): Promise<void> {
  if (!expoPushToken) return;
  if (!expoPushToken.startsWith("ExponentPushToken[") && !expoPushToken.startsWith("ExpoPushToken[")) {
    console.warn("Invalid Expo push token:", expoPushToken);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: payload.sound ?? "default",
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    badge: payload.badge,
    channelId: payload.channelId ?? "default",
  };

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Expo push failed:", response.status, text);
    } else {
      const json = await response.json() as any;
      const result = json?.data;
      if (result?.status === "error") {
        console.error("Expo push error:", result.message, result.details);
      }
    }
  } catch (err) {
    console.error("Failed to send Expo push notification:", err);
  }
}

/**
 * Send push notifications to multiple tokens at once (batch).
 */
export async function sendPushNotificationBatch(
  tokens: (string | null | undefined)[],
  payload: PushPayload
): Promise<void> {
  const validTokens = tokens.filter(
    (t): t is string =>
      typeof t === "string" &&
      (t.startsWith("ExponentPushToken[") || t.startsWith("ExpoPushToken["))
  );
  if (validTokens.length === 0) return;

  const messages = validTokens.map((to) => ({
    to,
    sound: payload.sound ?? "default",
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    badge: payload.badge,
    channelId: payload.channelId ?? "default",
  }));

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Expo push batch failed:", response.status, text);
    }
  } catch (err) {
    console.error("Failed to send Expo push batch:", err);
  }
}
