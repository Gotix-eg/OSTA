"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { fetchApiData } from "@/lib/api";
import { useSocket } from "@/components/providers/socket-provider";

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

export function HeaderChatButton({ locale }: { locale: "ar" | "en" }) {
  const isArabic = locale === "ar";
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  const fetchUnreadCount = async () => {
    try {
      const data = await fetchApiData<Contact[]>("/chat/contacts/list", []);
      if (data) {
        const total = data.reduce((sum, c) => sum + c.unreadCount, 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error("Failed to fetch chat contacts", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket]);

  const handleClick = () => {
    window.dispatchEvent(new Event("osta_open_chat"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-xl transition-all duration-500 hover:bg-white/10"
      title={isArabic ? "المحادثات" : "Chats"}
    >
      <MessageSquare className="h-5 w-5 text-white/70 hover:text-white" />
      {unreadCount > 0 && (
        <span className="absolute end-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-onyx-950 ring-2 ring-onyx-950">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
