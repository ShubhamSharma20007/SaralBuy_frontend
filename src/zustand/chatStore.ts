import { create } from "zustand";

interface ChatSummary {
  roomId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  lastMessage: any;
  messageCount: number;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  // Add other fields as needed
  name?: string;
  avatar?: string;
  buyer?: any;
  seller?: any;
  userType?: string;
}

interface ChatState {
  recentChats: ChatSummary[];
  updateRecentChat: (chat: ChatSummary) => void;
  setRecentChats: (chats: ChatSummary[]) => void;
  activeRoomId?: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  markAsRead: (roomId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  recentChats: [],
  updateRecentChat: (chat) =>
    set((state) => {
      const idx = state.recentChats.findIndex((c) => c.roomId === chat.roomId);
      if (idx !== -1) {
        const updated = [...state.recentChats];
        updated[idx] = { ...updated[idx], ...chat };
        return { recentChats: updated };
      } else {
        return { recentChats: [chat, ...state.recentChats] };
      }
    }),
  setRecentChats: (chats) => set({ recentChats: chats }),
  activeRoomId: null,
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),
  markAsRead: (roomId, userId) =>
    set((state) => ({
      recentChats: state.recentChats.map((c) => {
        if (c.roomId === roomId) {
          const isBuyer = c.buyerId === userId;
          const isSeller = c.sellerId === userId;
          return {
            ...c,
            buyerUnreadCount: isBuyer ? 0 : c.buyerUnreadCount,
            sellerUnreadCount: isSeller ? 0 : c.sellerUnreadCount,
          };
        }
        return c;
      }),
    })),
}));