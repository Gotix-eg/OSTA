import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, ActivityIndicator, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

import { apiClient, unwrapApiData } from "../../api/client";
import { Screen } from "../../components/Screen";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/spacing";
import { useAuth } from "../../context/AuthContext";
import { activeChatRef } from "../../context/NotificationContext";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

export function ChatScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const conversationId = route.params?.conversationId; // The user ID we are chatting with
  const recipientName = route.params?.recipientName || "محادثة";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const lastFetchedTimeRef = useRef<string | null>(null);

  // Set current active chat user ID globally to suppress in-app notifications
  useEffect(() => {
    if (conversationId) {
      activeChatRef.currentUserId = conversationId;
    }
    return () => {
      activeChatRef.currentUserId = null;
    };
  }, [conversationId]);

  // Load message history on mount
  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }
    const otherUserId = conversationId;

    const fetchHistory = async () => {
      try {
        const response = await apiClient.get(`/chat/${otherUserId}`);
        const data = unwrapApiData<Message[]>(response.data);
        setMessages(data);
        
        if (data && data.length > 0) {
          lastFetchedTimeRef.current = data[data.length - 1]!.createdAt;
        }
      } catch (err: any) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [conversationId]);

  // Real-time polling for new messages every 3 seconds
  useEffect(() => {
    if (!conversationId) return;
    const otherUserId = conversationId;

    const interval = setInterval(async () => {
      try {
        const url = lastFetchedTimeRef.current
          ? `/chat/${otherUserId}?since=${lastFetchedTimeRef.current}`
          : `/chat/${otherUserId}`;
        const response = await apiClient.get(url);
        const newMsgs = unwrapApiData<Message[]>(response.data);
        
        if (newMsgs && newMsgs.length > 0) {
          setMessages(prev => {
            const combined = [...prev, ...newMsgs];
            // Filter duplicates by message ID
            const seen = new Set();
            return combined.filter(m => {
              if (seen.has(m.id)) return false;
              seen.add(m.id);
              return true;
            });
          });
          lastFetchedTimeRef.current = newMsgs[newMsgs.length - 1]!.createdAt;
        }
      } catch (err) {
        console.error("Chat polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Scroll to bottom when messages load or update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send Message
  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || !conversationId) return;

    const messageText = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Optimistically add to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user?.id || "",
      receiverId: conversationId,
      content: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const response = await apiClient.post(`/chat/${conversationId}`, {
        content: messageText
      });
      const sentMsg = unwrapApiData<Message>(response.data);
      
      // Replace optimistic message with actual backend response
      setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
      lastFetchedTimeRef.current = sentMsg.createdAt;
    } catch (err: any) {
      // Remove optimistic message if send failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputText(messageText); // restore text in input box
      Alert.alert("فشل الإرسال", err.message || "تعذر إرسال رسالتك حالياً.");
    } finally {
      setIsSending(false);
    }
  };

  const formatMsgTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <Screen 
      title={recipientName} 
      showBack={true} 
      scroll={false}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        
        {/* Messages List */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={theme.muted} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.emptyText}>ابدأ المحادثة الآن!</Text>
                <Text style={styles.emptySubText}>أرسل رسالة للاتفاق على المواعيد، الأسعار، أو تفاصيل الطلب.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMine = item.senderId === user?.id;
              return (
                <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.otherMessageRow]}>
                  <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
                    <Text style={[styles.messageText, isMine ? styles.myText : styles.otherText]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMine ? styles.myTimeText : styles.otherTimeText]}>
                      {formatMsgTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Tool bar */}
        <View style={styles.inputToolbar}>
          <TextInput
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor={theme.muted}
            value={inputText}
            onChangeText={setInputText}
            style={styles.inputField}
            multiline
            maxLength={1000}
          />
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" style={{ transform: [{ scaleX: -1 }] }} />
            )}
          </Pressable>
        </View>

      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>["theme"]) => StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: "space-between"
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  messagesList: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm
  },
  messageRow: {
    flexDirection: "row",
    width: "100%"
  },
  myMessageRow: {
    justifyContent: "flex-end"
  },
  otherMessageRow: {
    justifyContent: "flex-start"
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4
  },
  myBubble: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4
  },
  otherBubble: {
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.border
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  myText: {
    color: theme.primaryText,
    textAlign: "right"
  },
  otherText: {
    color: theme.text,
    textAlign: "right"
  },
  messageTime: {
    fontSize: 9,
    alignSelf: "flex-end"
  },
  myTimeText: {
    color: theme.primaryText + "CC"
  },
  otherTimeText: {
    color: theme.muted
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
    gap: spacing.xs
  },
  emptyText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  emptySubText: {
    color: theme.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.xl
  },
  inputToolbar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.surface,
    gap: spacing.sm
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: theme.backgroundRaised,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    color: theme.text,
    fontSize: 14,
    textAlign: "right"
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  sendBtnDisabled: {
    backgroundColor: theme.muted,
    opacity: 0.6
  }
});
