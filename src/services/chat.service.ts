import { io, Socket } from "socket.io-client";

// Don't import the zustand hook at module top-level — update the store dynamically

import instance from "@/lib/instance"; // <-- ADD THIS LINE

class ChatService {
  private static instance: ChatService;
  public socket: Socket | null = null;
  private _currentRoomId: string | null = null;
  private _notificationListeners?: Array<(data: any) => void>;
  private _productNotificationListeners?: Array<(data: any) => void>;
  private _recentChatListeners?: Array<(chat: any) => void>;

  // Helper to generate consistent roomId (matches backend logic)
  private generateRoomId(productId: string, buyerId: string, sellerId: string) {
    const sortedIds = [buyerId, sellerId].sort();
    return `product_${productId}_buyer_${sortedIds[0]}_seller_${sortedIds[1]}`;
  }

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public connect() {
    if (!this.socket) {
      const socketUrl =  import.meta.env.MODE === 'development' ? import.meta.env.VITE_BACKEND_URL :  import.meta.env.VITE_LIVE_BACKEND_SOCKET_URL
      // console.log("[ChatService] Connecting to socket URL:", socketUrl);

      this.socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        forceNew: true,
        reconnection: true,
        timeout: 5000,
      });

      this.socket.on("connect", () => {
        // console.log("✅ Socket connected:", this.socket?.id, "at", socketUrl);
        // Re-identify user on reconnect if userId is set
        if (this._identifiedUserId) {
          this.identify(this._identifiedUserId);
        }
      });

      this.socket.on("disconnect", (_: string) => {
        // console.log("❌ Socket disconnected:", this.socket?.id, `(${reason})`);
      });

      this.socket.on("connect_error", (err) => {
        console.error("🚫 Socket connection error:", err);
      });

      // ✅ Match backend events
      this.socket.on("receive_message", (data) => {
        console.log("📨 Message received:", data);
      });

      this.socket.on("user_typing", (data) => {
        console.log("⌨️ Typing status:", data);
      });

      this.socket.on("user_joined", (data) => {
        console.log("🙋 User joined:", data);
      });

      this.socket.on("user_left", (data) => {
        console.log("👋 User left:", data);
      });

      this.socket.on("room_joined", (data) => {
        console.log("✅ Room joined:", data);
      });

      this.socket.on("error", (data) => {
        console.error("⚠️ Socket error:", data);
      });

      // Notification event handler registry
      this._notificationListeners = [];
      this.socket.on("new_message_notification", (data) => {
        // Only emit/listen if user is NOT active in Chatbot (i.e., not on Chatbot page)
        const isActiveUser = typeof window !== "undefined" && localStorage.getItem('chatbot_active_user') === 'true';
        if (!isActiveUser) {
        console.log("🔔 New message notification (user NOT active):", data);
        if (this._notificationListeners) {
          this._notificationListeners.forEach((cb) => cb(data));
          }
        } else {
          // Optionally, you can log or ignore notifications when user is active
          // console.log("🔕 Skipping notification: user is active in Chatbot");
        }
      });

      // Product notification event handler registry
      this._productNotificationListeners = [];
      this.socket.on("product_notification", (data) => {
        console.log("🛎️ Product notification received:", data);
        if (this._productNotificationListeners) {
          this._productNotificationListeners.forEach((cb) => cb(data));
        }
      });
    // Listen for recent_chat_update, notify in-memory listeners and try to update Zustand dynamically
    this.socket.on("recent_chat_update", async (chatSummary) => {
      console.log("🟢 recent_chat_update received:", chatSummary);
      if (this._recentChatListeners) {
        this._recentChatListeners.forEach((cb) => {
          try { cb(chatSummary); } catch (e) { console.error("recentChat listener error:", e); }
        });
      }
      try {
        const chatStoreModule = await import("@/zustand/chatStore");
        if (chatStoreModule && chatStoreModule.useChatStore) {
          chatStoreModule.useChatStore.getState().updateRecentChat(chatSummary);
        }
      } catch (err) {
        console.debug("Could not update Zustand chat store dynamically:", err);
      }
    });
    }
    return this.socket;
  }

  // Leave the current room if joining a new one
  public leaveRoom(roomId?: string) {
    if (this.socket && (roomId || this._currentRoomId)) {
      const leaveRoomId = roomId || this._currentRoomId;
      if (leaveRoomId) {
        // console.log(`[ChatService] Leaving room:`, leaveRoomId);
        this.socket.emit("leave_room", { roomId: leaveRoomId });
        this._currentRoomId = null;
      }
    }
  }

  // Join room with proper parameters including buyerId, and leave previous room if needed
  public joinRoom(userId: string, productId: string, sellerId: string, userType: "buyer" | "seller", buyerId?: string) {
    if (this.socket) {
      // Determine buyerId if not provided
      let finalBuyerId = buyerId;
      if (!finalBuyerId) {
        finalBuyerId = userType === 'buyer' ? userId : undefined;
      }
      // Compute the new roomId using sorted IDs
      const newRoomId = this.generateRoomId(productId, finalBuyerId!, sellerId);
      // Leave previous room if different
      if (this._currentRoomId && this._currentRoomId !== newRoomId) {
        this.leaveRoom(this._currentRoomId);
      }
      
      // console.log(`[ChatService] Joining room:`, {
      //   userId,
      //   productId,
      //   sellerId,
      //   userType,
      //   buyerId: finalBuyerId
      // });
      
      this.socket.emit("join_room", {
        userId,
        productId,
        sellerId,
        userType,
        buyerId: finalBuyerId
      });
      this._currentRoomId = newRoomId;
    }
  }

  // FIXED: Send message with buyerId parameter
  public sendMessage(productId: string, sellerId: string, message: string, senderId: string, senderType: string, buyerId?: string) {
    if (this.socket) {
      // Determine buyerId if not provided
      let finalBuyerId = buyerId;
      if (!finalBuyerId) {
        finalBuyerId = senderType === 'buyer' ? senderId : undefined;
      }
      // Compute the roomId using sorted IDs (for logging/debug)
      const roomId = this.generateRoomId(productId, finalBuyerId!, sellerId);
      
      // console.log(`[ChatService] Sending message:`, {
      //   productId,
      //   sellerId,
      //   message,
      //   senderId,
      //   senderType,
      //   buyerId: finalBuyerId,
      //   roomId
      // });
      
      this.socket.emit("send_message", {
        productId,
        sellerId,
        message,
        senderId,
        senderType,
        buyerId: finalBuyerId
      });
    }
  }

  // Add this method to ChatService class
public getChatHistory(productId: string, sellerId: string, buyerId: string, callback: (data: any) => void) {
  if (this.socket) {
    this.socket.emit("get_chat_history", { productId, sellerId, buyerId });

    const handler = (data: any) => {
      callback(data);
      this.socket?.off("chat_history", handler);
    };

    this.socket.on("chat_history", handler);
  }
}

  // FIXED: Typing indicator with buyerId
  public sendTyping(productId: string, userId: string, sellerId: string, isTyping: boolean, buyerId?: string) {
    if (this.socket) {
      const event = isTyping ? "typing_start" : "typing_stop";
      
      // console.log(`[ChatService] Typing ${isTyping ? 'started' : 'stopped'}:`, {
      //   productId,
      //   userId,
      //   sellerId,
      //   buyerId
      // });
      
      this.socket.emit(event, { 
        productId, 
        userId, 
        sellerId,
        buyerId
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      // console.log("[ChatService] Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
    }
  }
  // Identify the user to the backend for notification mapping
  private _identifiedUserId?: string;
  public identify(userId: string) {
    if (this.socket && userId) {
      this._identifiedUserId = userId;
      this.socket.emit("identify", { userId });
      // console.log("[ChatService] Identified as user:", userId);
    }
  }

  // Register a callback for new message notifications (for navbar bell, etc)
  public onNewMessageNotification(cb: (data: any) => void) {
    if (!this._notificationListeners) this._notificationListeners = [];
    this._notificationListeners.push(cb);
  }

  // Register a callback for product notifications (for bell icon, etc)
  public onProductNotification(cb: (data: any) => void) {
    if (!this._productNotificationListeners) this._productNotificationListeners = [];
    this._productNotificationListeners.push(cb);
  }
  /**
   * Get all recent chats for a user.
   * @param userId The current user's ID.
   * @param callback Function to call with the recent chats data.
   */
  public getRecentChats(userId: string, callback: (data: any) => void) {
    if (this.socket && userId) {
      // Emit the event to request recent chats
      this.socket.emit("get_recent_chats", { userId });

      // Handler for the response
      const handler = (data: any) => {
        callback(data);
        // Remove this handler after first call to avoid memory leaks
        this.socket?.off("recent_chats", handler);
      };

      // Listen for the response
      this.socket.on("recent_chats", handler);
    } else {
      console.error("[ChatService] Socket not connected or userId missing for getRecentChats");
    }
  }

  // --- ADD: Rate Chat API ---
  public rateChat(params: { chatId: string; rating: number }) {
    // POST /chat/rate { chatId, rating }
    return instance.post('/chat/rate', params, { withCredentials: true })
      .then(res => res.data?.data || res.data);
  }
}

export default ChatService;
