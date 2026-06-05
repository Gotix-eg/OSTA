"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, ChevronLeft } from "lucide-react";
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

export function FloatingChatWidget() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket } = useSocket();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchApiData<any>("/auth/me", null);
        if (data && data.id) setCurrentUserId(data.id);
      } catch (e) {
        // ignore
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (isOpen && !activeChat) {
      loadContacts();
    }
  }, [isOpen, activeChat]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (msg: Message) => {
      // If chat is open with the sender, add to messages
      if (activeChat && (msg.senderId === activeChat.id || msg.receiverId === activeChat.id)) {
        setMessages(prev => [...prev, msg]);
      }
      // Reload contacts to update last message & unread counts
      loadContacts();
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, activeChat]);

  async function loadContacts() {
    try {
      const data = await fetchApiData<Contact[]>("/chat/contacts/list", []);
      setContacts(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadMessages(otherUserId: string) {
    try {
      const data = await fetchApiData<Message[]>(`/chat/${otherUserId}`, []);
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeChat || !currentUserId) return;

    const tempMsg: Message = {
      id: Math.random().toString(),
      content: input,
      senderId: currentUserId,
      receiverId: activeChat.id,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, tempMsg]);
    setInput("");

    try {
      await postApiData(`/chat/${activeChat.id}`, { content: tempMsg.content });
      loadContacts();
    } catch (e) {
      console.error(e);
    }
  }

  if (!currentUserId) return null;

  const unreadTotal = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-onyx-950 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageSquare className="h-6 w-6" />
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {unreadTotal}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-onyx-950 shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-onyx-900/50 px-4">
              <div className="flex items-center gap-3">
                {activeChat && (
                  <button onClick={() => setActiveChat(null)} className="rounded-full p-1.5 hover:bg-white/10 text-white transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h3 className="font-bold text-white">
                    {activeChat ? `${activeChat.firstName} ${activeChat.lastName}` : "المحادثات"}
                  </h3>
                  {activeChat && <span className="text-[10px] text-onyx-400">متصل الآن</span>}
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 hover:bg-white/10 text-onyx-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-onyx-950/50 p-4">
              {!activeChat ? (
                // Contacts List
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
                              {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                // Messages List
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex max-w-[80%] flex-col ${isMe ? "self-end" : "self-start"}`}>
                        <div className={`rounded-2xl p-3 text-sm ${isMe ? "bg-gold-500 text-onyx-950 rounded-br-sm" : "bg-onyx-800 text-white rounded-bl-sm border border-white/5"}`}>
                          {msg.content}
                        </div>
                        <span className={`mt-1 text-[9px] text-onyx-500 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Footer / Input */}
            {activeChat && (
              <form onSubmit={sendMessage} className="shrink-0 border-t border-white/10 bg-onyx-900/50 p-3 flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالة..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl bg-onyx-950 border border-white/10 px-4 text-sm text-white outline-none focus:border-gold-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-onyx-950 disabled:opacity-50"
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
