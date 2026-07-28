"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, ChevronLeft, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { fetchApiData, postApiData } from "@/lib/api";

interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
}

interface Contact {
  user: ChatUser;
  lastMessage: Message;
  unreadCount: number;
}

// Polling interval in ms — 2 seconds when chat is open (fast like Messenger)
const POLL_INTERVAL_MS = 2000;
// Contacts polling interval — every 5 seconds
const CONTACTS_POLL_MS = 5000;

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refs to avoid stale closures inside timers/socket handlers
  const activeChatRef = useRef<ChatUser | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set()); // Dedup by ID only
  const lastPollRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  activeChatRef.current = activeChat;

  const { socket, isConnected, userId: currentUserId } = useSocket();
  currentUserIdRef.current = currentUserId;

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // ─── External trigger (from request cards) ──────────────────────────────────
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.id) {
        setActiveChat(event.detail as ChatUser);
      }
      setIsOpen(true);
    };
    window.addEventListener("osta_open_chat", handleOpenChat);
    return () => window.removeEventListener("osta_open_chat", handleOpenChat);
  }, []);

  // ─── Load contacts ───────────────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    try {
      const data = await fetchApiData<Contact[]>("/chat/contacts/list", []);
      if (isMountedRef.current) setContacts(data);
    } catch { /* ignore */ }
  }, []);

  // ─── Merge new messages (dedup by ID) ───────────────────────────────────────
  const mergeMessages = useCallback((incoming: Message[]) => {
    if (!isMountedRef.current) return;
    const newOnes = incoming.filter(m => !messageIdsRef.current.has(m.id));
    if (newOnes.length === 0) return;
    newOnes.forEach(m => messageIdsRef.current.add(m.id));
    setMessages(prev => {
      // Replace any temp messages that now have a real ID
      const filtered = prev.filter(m => !m.id.startsWith("temp-") ||
        !newOnes.some(n => n.content === m.content && n.senderId === m.senderId));
      return [...filtered, ...newOnes].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  // ─── Poll messages for the active chat (incremental — only new messages) ───
  const pollMessages = useCallback(async () => {
    const chat = activeChatRef.current;
    if (!chat) return;
    try {
      // Use ?since= to only get messages newer than the last known message
      const ids = messageIdsRef.current;
      const msgs = await fetchApiData<Message[]>(`/chat/${chat.id}`, []);
      // Only merge ones we haven't seen yet
      const newOnes = msgs.filter(m => !ids.has(m.id));
      if (newOnes.length > 0) mergeMessages(newOnes);
    } catch { /* ignore */ }
    lastPollRef.current = Date.now();
  }, [mergeMessages]);

  // ─── Load messages when opening a chat (full load + reset dedup) ─────────────
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      messageIdsRef.current = new Set();
      return;
    }
    messageIdsRef.current = new Set();
    // Full initial load
    fetchApiData<Message[]>(`/chat/${activeChat.id}`, []).then(data => {
      if (!isMountedRef.current) return;
      data.forEach(m => messageIdsRef.current.add(m.id));
      setMessages(data);
    }).catch(() => {});
  }, [activeChat]);

  // ─── POLLING: runs while chat is open ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Poll messages every 2s when a chat is active
    const msgInterval = setInterval(() => {
      if (activeChatRef.current) pollMessages();
    }, POLL_INTERVAL_MS);

    // Poll contacts every 5s
    const contactInterval = setInterval(() => {
      if (!activeChatRef.current) loadContacts();
    }, CONTACTS_POLL_MS);

    return () => {
      clearInterval(msgInterval);
      clearInterval(contactInterval);
    };
  }, [isOpen, pollMessages, loadContacts]);

  // ─── Load contacts when chat panel opens ────────────────────────────────────
  useEffect(() => {
    if (isOpen && !activeChat) loadContacts();
  }, [isOpen, activeChat, loadContacts]);

  // ─── SOCKET: instant delivery on top of polling ──────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      const chat = activeChatRef.current;

      // Normalize: server sends full DB row with optional `sender` relation
      const normalized: Message = {
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        createdAt: msg.createdAt,
        isRead: msg.isRead ?? false,
      };

      // Add to current chat if it belongs there
      if (chat && (normalized.senderId === chat.id || normalized.receiverId === chat.id)) {
        mergeMessages([normalized]);
      }

      // Always update contacts badges
      loadContacts();
    };

    socket.on("new_message", handleNewMessage);
    return () => { socket.off("new_message", handleNewMessage); };
  }, [socket, mergeMessages, loadContacts]);

  // ─── Scroll to bottom on new messages ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Send message ────────────────────────────────────────────────────────────
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const uid = currentUserIdRef.current;
    if (!input.trim() || !activeChat || !uid) return;

    const content = input.trim();
    setInput("");

    // Optimistic temp message (use negative timestamp so it sorts last)
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      content,
      senderId: uid,
      receiverId: activeChat.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const sent = await postApiData<any, any>(`/chat/${activeChat.id}`, { content });
      if (sent?.id) {
        // Replace temp with real message
        messageIdsRef.current.add(sent.id);
        setMessages(prev =>
          prev.map(m => m.id === tempId ? { ...sent } : m)
        );
      }
      loadContacts();
    } catch (err) {
      // Remove failed temp message
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  }

  if (!currentUserId) return null;

  const unreadTotal = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 flex items-center justify-center bg-gold-500 text-onyx-950 shadow-2xl transition-all duration-300 ease-out active:scale-95
            md:bottom-6 md:right-6 md:top-auto md:left-auto md:w-14 md:h-14 md:rounded-full md:translate-x-0 md:translate-y-0
            bottom-auto top-[45%] left-0 w-12 h-14 rounded-r-2xl rounded-l-none -translate-x-[40%] hover:translate-x-0 focus:translate-x-0 active:translate-x-0"
        >
          <MessageSquare className="h-6 w-6 md:mr-0 mr-1" />
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 md:-top-1 md:-right-1 right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
              {unreadTotal}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed z-50 flex flex-col overflow-hidden border border-gold-700/15 bg-gold-100 shadow-2xl
              md:bottom-24 md:right-6 md:left-auto md:w-[350px] md:h-[500px] md:rounded-[2rem]
              bottom-0 left-0 right-0 w-full h-[80vh] rounded-t-[2.5rem] rounded-b-none"
          >
             {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gold-700/15 bg-onyx-900/5 px-4">
              <div className="flex items-center gap-3">
                {activeChat && (
                  <button onClick={() => setActiveChat(null)} className="rounded-full p-1.5 hover:bg-onyx-950/10 text-onyx-950 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h3 className="font-bold text-onyx-950">
                    {activeChat ? `${activeChat.firstName} ${activeChat.lastName}` : "المحادثات"}
                  </h3>
                  {activeChat && (
                    <div className="flex items-center gap-1.5">
                      {isConnected
                        ? <Wifi className="h-3 w-3 text-emerald-600" />
                        : <WifiOff className="h-3 w-3 text-amber-600" />
                      }
                      <span className={`text-[10px] ${isConnected ? "text-emerald-600" : "text-amber-600"}`}>
                        {isConnected ? "مباشر" : "متصل (تحديث كل 2ث)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 hover:bg-onyx-950/10 text-onyx-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-gold-100 p-4">
              {!activeChat ? (
                <div className="space-y-2">
                  {contacts.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-onyx-500">
                      <MessageSquare className="mb-2 h-8 w-8 opacity-20" />
                      <p className="text-sm">لا توجد محادثات سابقة</p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div
                        key={contact.user.id}
                        onClick={() => setActiveChat(contact.user)}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/5"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h4 className="truncate font-bold text-white text-sm">{contact.user.firstName} {contact.user.lastName}</h4>
                            <span className="text-[10px] text-onyx-500">
                              {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="truncate text-xs text-onyx-400 mt-1">
                            {contact.lastMessage.senderId === currentUserId ? "أنت: " : ""}{contact.lastMessage.content}
                          </p>
                        </div>
                        {contact.unreadCount > 0 && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-onyx-950">
                            {contact.unreadCount}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const isTemp = msg.id.startsWith("temp-");
                    return (
                      <div key={msg.id} className={`flex max-w-[80%] flex-col ${isMe ? "self-end" : "self-start"}`}>
                        <div className={`rounded-2xl p-3 text-sm transition-opacity ${isMe ? "bg-gold-800 text-onyx-950 rounded-br-sm shadow-md" : "bg-white text-onyx-950 rounded-bl-sm border border-gold-700/10 shadow-sm"} ${isTemp ? "opacity-60" : "opacity-100"}`}>
                          {msg.content}
                        </div>
                        <span className={`mt-1 text-[9px] text-onyx-600 ${isMe ? "text-right" : "text-left"}`}>
                          {isTemp ? "جاري الإرسال..." : new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            {activeChat && (
              <form onSubmit={sendMessage} className="shrink-0 border-t border-gold-700/15 bg-onyx-900/5 p-3 flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالة..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl bg-white border border-gold-700/15 px-4 text-sm text-onyx-950 placeholder-onyx-600 outline-none focus:border-gold-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-800 text-onyx-950 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
