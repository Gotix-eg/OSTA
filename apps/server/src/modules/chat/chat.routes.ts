import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { successResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { socketService } from "../../lib/socket.js";
import { z } from "zod";

const router = Router();
router.use(authenticate);

// GET /api/chat/:userId - Get chat history with a specific user
router.get("/:otherUserId", catchAsync(async (request: Request, response: Response) => {
  const currentUserId = request.auth!.userId;
  const otherUserId = request.params.otherUserId as string;
  const requestId = request.query.requestId as string | undefined;

  const whereClause: any = {
    OR: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  };

  if (requestId) {
    whereClause.requestId = requestId;
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
  });

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: currentUserId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  response.json(successResponse(messages, "Messages retrieved successfully"));
}));

const sendMessageSchema = z.object({
  content: z.string().min(1),
  requestId: z.string().optional(),
  type: z.string().default("text"),
  attachments: z.array(z.string()).optional(),
});

// POST /api/chat/:userId - Send a message to a specific user
router.post("/:receiverId", catchAsync(async (request: Request, response: Response) => {
  const senderId = request.auth!.userId;
  const receiverId = request.params.receiverId as string;
  const data = sendMessageSchema.parse(request.body);

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content: data.content,
      requestId: data.requestId,
      type: data.type,
      attachments: data.attachments || [],
    },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, role: true }
      }
    }
  });

  // Emit the message instantly to the receiver via WebSockets
  socketService.sendMessage(receiverId, message);

  // Send a system notification as fallback if they are offline (could be handled in background)
  try {
    socketService.sendNotification(receiverId, {
      id: Math.random().toString(),
      title: `رسالة جديدة من ${message.sender?.firstName || 'مستخدم'}`,
      body: data.content.substring(0, 50),
      type: "CHAT_MESSAGE",
      data: { senderId, requestId: data.requestId }
    });
  } catch (e) {
    // Ignore notification error
  }

  response.status(201).json(successResponse(message, "Message sent successfully"));
}));

// GET /api/chat/contacts/list - Get all recent contacts
router.get("/contacts/list", catchAsync(async (request: Request, response: Response) => {
  const currentUserId = request.auth!.userId;
  
  // A simplistic approach: find all messages where current user is sender or receiver
  // Then group by the other user. In a real large scale app, you'd use raw SQL or a dedicated Conversation table.
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } }
    }
  });

  const contactsMap = new Map();

  for (const msg of messages) {
    const isSender = msg.senderId === currentUserId;
    const otherUser = isSender ? msg.receiver : msg.sender;
    
    if (otherUser && !contactsMap.has(otherUser.id)) {
      contactsMap.set(otherUser.id, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: isSender ? 0 : (msg.isRead ? 0 : 1)
      });
    } else if (!isSender && !msg.isRead) {
      contactsMap.get(otherUser.id).unreadCount += 1;
    }
  }

  const contacts = Array.from(contactsMap.values());
  response.json(successResponse(contacts, "Contacts retrieved successfully"));
}));

export const chatRouter = router;
