import { io, Socket } from "socket.io-client";

import instance, { url } from "@/lib/instance"; 

class ChatService {
  private static instance: ChatService;
  public socket: Socket | null = null;
  private _currentRoomId: string | null = null;
  private _notificationListeners?: Array<(data: any) => void>;
  private _productNotificationListeners?: Array<(data: any) => void>;
  private _bidNotificationListeners?: Array<(data: any) => void>;
  private _recentChatListeners?: Array<(chat: any) => void>;
  private _newBidListeners?: Array<(data: any) => void>;
  private _userOnlineListeners?: Array<(data: any) => void>;
  private _userOfflineListeners?: Array<(data: any) => void>;
  private _chatRatingListeners?: Array<(data: any) => void>;
  private _closeDealRequestListeners?: Array<(data: any) => void>;
  private _dealResolutionListeners?: Array<(data: any) => void>;

  // Helper to generate consistent roomId (matches backend logic)
  public generateRoomId(productId: string, buyerId: string, sellerId: string) {
    const sortedIds = [buyerId, sellerId].sort();
    return `product_${productId}_buyer_${sortedIds[0]}_seller_${sortedIds[1]}`;
  }

  private constructor() { }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public connect() {
    if (!this.socket) {
      // import.meta.env.MODE === 'development' ? import.meta.env.VITE_BACKEND_URL :
      const socketUrl = import.meta.env.MODE === 'development'  ? import.meta.env.VITE_BACKEND_URL : '/'   ;
      // const socketUrl =import.meta.env.VITE_LIVE_BACKEND_SOCKET_URL;
      // const socketUrl = import.meta.env.NODE_ENV  ? import.meta.env.VITE_BACKEND_URL : import.meta.env.VITE_LIVE_BACKEND_SOCKET_URL
      console.log("[ChatService] Connecting to socket URL:", socketUrl);

      // this.socket = io(socketUrl, {
      //   transports: ["websocket", "polling"],
      //   withCredentials: true,
      //   forceNew: true,
      //   reconnection: true,
      //   // timeout: 5000,
      //   reconnectionAttempts: 5,
      //   reconnectionDelay: 1000,
        
      // });
      this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // Add timeout back
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
      this.socket.on("product_notification", (data) => {
        console.log("🛎️ Product notification received:", data);
        if (this._productNotificationListeners) {
          this._productNotificationListeners.forEach((cb) => cb(data));
        }
      });

      // Bid notification event handler registry
      this.socket.on("bid_notifications_list", (data) => {
        console.log("🔨 Bid notifications received:", data);
        if (this._bidNotificationListeners) {
          this._bidNotificationListeners.forEach((cb) => cb(data));
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
      // Listen for new_bid events
      this.socket.on("new_bid", (data) => {
        if (this._newBidListeners) {
          this._newBidListeners.forEach((cb) => cb(data));
        }
      });

      // Listen for user_online events
      this.socket.on("user_online", (data) => {
        console.log("🟢 User came online:", data);
        if (this._userOnlineListeners) {
          this._userOnlineListeners.forEach((cb) => cb(data));
        }
      });

      // Listen for user_offline events
      this.socket.on("user_offline", (data) => {
        console.log("🔴 User went offline:", data);
        if (this._userOfflineListeners) {
          this._userOfflineListeners.forEach((cb) => cb(data));
        }
      });

      // Listen for chat_rating_notification events
      this.socket.on("chat_rating_notification", (data) => {
        console.log("⭐ Chat rating notification received:", data);
        if (this._chatRatingListeners) {
          this._chatRatingListeners.forEach((cb) => cb(data));
        }
      });

      // Listen for close_deal_request events
      this.socket.on("close_deal_request", (data) => {
          console.log("📝 Close deal request received:", data);
          if (this._closeDealRequestListeners) {
              this._closeDealRequestListeners.forEach((cb) => cb(data));
          }
      });

      // Listen for close_deal_resolution events
      this.socket.on("close_deal_resolution", (data) => {
          console.log("⚖️ Deal resolution received:", data);
          if (this._dealResolutionListeners) {
              this._dealResolutionListeners.forEach((cb) => cb(data));
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

  // FIXED: Send message with buyerId parameter and optional attachment
  public sendMessage(
    productId: string, 
    sellerId: string, 
    message: string, 
    senderId: string, 
    senderType: string, 
    buyerId?: string,
    attachment?: {
      url: string;
      type: 'image' | 'document';
      mimeType: string;
      fileName: string;
      fileSize?: number;
    }
  ) {
    if (this.socket) {
      // Determine buyerId if not provided
      let finalBuyerId = buyerId;
      if (!finalBuyerId) {
        finalBuyerId = senderType === 'buyer' ? senderId : undefined;
      }

      this.socket.emit("send_message", {
        productId,
        sellerId,
        message,
        senderId,
        senderType,
        buyerId: finalBuyerId,
        attachment: attachment || undefined
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

  public offNewMessageNotification(cb: (data: any) => void) {
    if (this._notificationListeners) {
      this._notificationListeners = this._notificationListeners.filter((l) => l !== cb);
    }
  }

  // Register a callback for product notifications (for bell icon, etc)
  public onProductNotification(cb: (data: any) => void) {
    if (!this._productNotificationListeners) this._productNotificationListeners = [];
    this._productNotificationListeners.push(cb);
  }

  public offProductNotification(cb: (data: any) => void) {
    if (this._productNotificationListeners) {
      this._productNotificationListeners = this._productNotificationListeners.filter((l) => l !== cb);
    }
  }

  // Register a callback for bid notifications
  public onBidNotification(cb: (data: any) => void) {
    if (!this._bidNotificationListeners) this._bidNotificationListeners = [];
    this._bidNotificationListeners.push(cb);
  }

  public offBidNotification(cb: (data: any) => void) {
    if (this._bidNotificationListeners) {
      this._bidNotificationListeners = this._bidNotificationListeners.filter((l) => l !== cb);
    }
  }

  // Request bid notifications
  public getBidNotifications(userId: string) {
    if (this.socket && userId) {
      this.socket.emit("get_bid_notifications", { userId });
    }
  }

  // Mark bid notifications as read
  public markBidNotificationsRead(userId: string) {
    if (this.socket && userId) {
      this.socket.emit("mark_bid_notifications_read", { userId });
    }
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
  
  // Register a callback for new bid events
  public onNewBid(cb: (data: any) => void) {
    if (!this._newBidListeners) this._newBidListeners = [];
    this._newBidListeners.push(cb);
  }

  public offNewBid(cb: (data: any) => void) {
    if (this._newBidListeners) {
      this._newBidListeners = this._newBidListeners.filter((l) => l !== cb);
    }
  }

  // Register a callback for user_online events
  public onUserOnline(cb: (data: any) => void) {
    if (!this._userOnlineListeners) this._userOnlineListeners = [];
    this._userOnlineListeners.push(cb);
  }

  public offUserOnline(cb: (data: any) => void) {
    if (this._userOnlineListeners) {
      this._userOnlineListeners = this._userOnlineListeners.filter((l) => l !== cb);
    }
  }

  // Register a callback for user_offline events
  public onUserOffline(cb: (data: any) => void) {
    if (!this._userOfflineListeners) this._userOfflineListeners = [];
    this._userOfflineListeners.push(cb);
  }

  public offUserOffline(cb: (data: any) => void) {
    if (this._userOfflineListeners) {
      this._userOfflineListeners = this._userOfflineListeners.filter((l) => l !== cb);
    }
  }

  // Register a callback for chat_rating_notification events
  public onChatRating(cb: (data: any) => void) {
    if (!this._chatRatingListeners) this._chatRatingListeners = [];
    this._chatRatingListeners.push(cb);
  }

  public offChatRating(cb: (data: any) => void) {
    if (this._chatRatingListeners) {
      this._chatRatingListeners = this._chatRatingListeners.filter((l) => l !== cb);
    }
  }

  // Deal Notification Listeners
  public onCloseDealRequest(callback: (data: any) => void) {
    if (!this._closeDealRequestListeners) {
      this._closeDealRequestListeners = [];
    }
    this._closeDealRequestListeners.push(callback);
  }

  public offCloseDealRequest(callback: (data: any) => void) {
    this._closeDealRequestListeners = this._closeDealRequestListeners?.filter(cb => cb !== callback);
  }

  public onDealResolution(callback: (data: any) => void) {
    if (!this._dealResolutionListeners) {
      this._dealResolutionListeners = [];
    }
    this._dealResolutionListeners.push(callback);
  }

  public offDealResolution(callback: (data: any) => void) {
    this._dealResolutionListeners = this._dealResolutionListeners?.filter(cb => cb !== callback);
  }

  // --- ADD: Rate Chat API ---
  public rateChat(params: { chatId: string; rating: number; ratedBy: string }) {
    // POST /chat/rate { chatId, rating, ratedBy }
    return instance.post('/chat/rate', params, { withCredentials: true })
      .then(res => res.data?.data || res.data);
  }

  /**
   * Upload a chat attachment (image or document) via socket
   * @param file The file to upload
   * @param onSuccess Callback when upload succeeds
   * @param onError Callback when upload fails
   */
  public uploadAttachment(
    file: File,
    onSuccess: (data: { url: string; type: 'image' | 'document'; mimeType: string; fileName: string; fileSize: number }) => void,
    onError: (error: string) => void
  ) {
    if (!this.socket) {
      onError('Socket not connected');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      
      // Emit upload event
      this.socket!.emit('upload_chat_attachment', {
        fileBuffer: base64Data,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size
      });

      // Listen for success
      const successHandler = (data: any) => {
        onSuccess(data);
        this.socket?.off('upload_success', successHandler);
        this.socket?.off('upload_error', errorHandler);
      };

      // Listen for error
      const errorHandler = (data: any) => {
        onError(data.message || 'Upload failed');
        this.socket?.off('upload_success', successHandler);
        this.socket?.off('upload_error', errorHandler);
      };

      this.socket!.once('upload_success', successHandler);
      this.socket!.once('upload_error', errorHandler);
    };

    reader.onerror = () => {
      onError('Failed to read file');
    };

    reader.readAsDataURL(file);
  }
}

export default ChatService;
