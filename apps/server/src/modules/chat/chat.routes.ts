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

// ⚠️ IMPORTANT: /contacts/list MUST come before /:otherUserId
// because Express matches routes in declaration order and "contacts" would
// otherwise be captured as an otherUserId parameter.

// GET /api/chat/contacts/list - Get all recent contacts
router.get("/contacts/list", catchAsync(async (request: Request, response: Response) => {
  const currentUserId = request.auth!.userId;

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
    } else if (otherUser && !isSender && !msg.isRead) {
      const existing = contactsMap.get(otherUser.id);
      if (existing) existing.unreadCount += 1;
    }
  }

  const contacts = Array.from(contactsMap.values());
  response.json(successResponse(contacts, "Contacts retrieved successfully"));
}));

// GET /api/chat/:userId - Get chat history with a specific user
// Supports ?since=ISO_DATE for incremental polling (returns only new messages)
router.get("/:otherUserId", catchAsync(async (request: Request, response: Response) => {
  const currentUserId = request.auth!.userId;
  const otherUserId = request.params.otherUserId as string;
  const requestId = request.query.requestId as string | undefined;
  const since = request.query.since as string | undefined; // ISO date for incremental fetch

  const whereClause: any = {
    OR: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  };

  if (requestId) {
    whereClause.requestId = requestId;
  }

  // Incremental polling: only return messages newer than ?since=
  if (since) {
    const sinceDate = new Date(since);
    if (!isNaN(sinceDate.getTime())) {
      whereClause.createdAt = { gt: sinceDate };
    }
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
  });

  // Mark unread messages as read (only when doing full load, not incremental)
  if (!since) {
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
  }

  response.json(successResponse(messages, "Messages retrieved successfully"));
}));

function containsPhoneNumber(text: string): boolean {
  const arabicNumerals = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let normalized = text;
  for (let i = 0; i < 10; i++) {
    const regex = arabicNumerals[i];
    if (regex) {
      normalized = normalized.replace(regex, String(i));
    }
  }
  const clean = normalized.replace(/[\s\-\.\(\)\+\*\_]/g, "");
  return /\d{8,}/.test(clean);
}

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

  if (containsPhoneNumber(data.content)) {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true, clientProfile: { select: { id: true } }, workerProfile: { select: { id: true } } }
    });
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true, clientProfile: { select: { id: true } }, workerProfile: { select: { id: true } } }
    });

    let hasAcceptedRequest = false;

    if (data.requestId) {
      const requestRecord = await prisma.serviceRequest.findUnique({
        where: { id: data.requestId }
      });
      if (requestRecord && ["WORKER_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CONFIRMED_BY_CLIENT"].includes(requestRecord.status)) {
        hasAcceptedRequest = true;
      }
    } else if (sender && receiver) {
      const clientId = sender.role === "CLIENT" ? sender.clientProfile?.id : receiver.clientProfile?.id;
      const workerId = sender.role === "WORKER" ? sender.workerProfile?.id : receiver.workerProfile?.id;

      if (clientId && workerId) {
        const activeRequest = await prisma.serviceRequest.findFirst({
          where: {
            clientId,
            workerId,
            status: {
              in: ["WORKER_EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CONFIRMED_BY_CLIENT"]
            }
          }
        });
        if (activeRequest) {
          hasAcceptedRequest = true;
        }
      }
    }

    if (!hasAcceptedRequest) {
      throw new ApiError(400, "غير مسموح بمشاركة أرقام الهاتف قبل قبول الطلب من الطرفين لحمايتك.");
    }
  }

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
  // Also emit back to sender so their other open tabs/devices get updated
  socketService.sendMessage(senderId, message);

  // Send a system notification as fallback if they are offline
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

export const chatRouter = router;
