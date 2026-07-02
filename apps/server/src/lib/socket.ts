import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Extended socket interface to store user info
export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: string;
  };
}

class SocketService {
  private io: Server | null = null;
  
  // Map of userId -> Set of socketIds (to handle multiple devices per user)
  private connectedUsers: Map<string, Set<string>> = new Map();

  public init(server: HttpServer): void {
    const ALLOWED_ORIGINS = [
      "http://localhost:3000",
      "http://localhost:3001",
      env.APP_URL,
      "https://web-gold-nu-39.vercel.app",
    ].filter(Boolean) as string[];

    this.io = new Server(server, {
      cors: {
        origin: ALLOWED_ORIGINS,
        credentials: true
      }
    });

    const getCookie = (cookieHeader: string | undefined, name: string) => {
      if (!cookieHeader) return undefined;

      return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`))
        ?.slice(name.length + 1);
    };

    // Socket.io middleware for JWT authentication
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1] ||
        getCookie(socket.handshake.headers?.cookie, "osta_access_token");
      
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        socket.user = {
          id: decoded.sub,
          role: decoded.role
        };
        next();
      } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      if (!socket.user) return;
      
      const userId = socket.user.id;
      console.log(`Socket connected: ${socket.id} (User: ${userId})`);

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)?.add(socket.id);
      
      // Also join a room for this user for easy broadcasting
      socket.join(`user:${userId}`);

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
        
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }
      });
    });
  }

  /**
   * Send a real-time notification to a specific user
   */
  public sendNotification(userId: string, data: any): void {
    if (!this.io) return;
    
    // Broadcast to the user's specific room
    this.io.to(`user:${userId}`).emit("new_notification", data);
  }

  /**
   * Send a real-time chat message to a specific user
   */
  public sendMessage(userId: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit("new_message", data);
  }

  public getIo(): Server {
    if (!this.io) {
      throw new Error("SocketService not initialized");
    }
    return this.io;
  }
}

export const socketService = new SocketService();
