export const NotificationType = {
  BID: 'bid',
  CHAT_RATING: 'chat_rating',
  DEAL_REQUEST: 'deal_request',
  DEAL_ACCEPTED: 'deal_accepted',
  DEAL_REJECTED: 'deal_rejected',
  PRODUCT: 'product'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface UnifiedNotification {
  _id?: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: number;
  seen: boolean;
  createdAt?: string;

  // Chat/Deal related
  productId?: string;
  buyerId?: string;
  sellerId?: string;
  roomId?: string;
  
  // Type-specific fields
  chatId?: string;
  rating?: number;
  raterName?: string;
  ratedBy?: string;
  totalBids?: number;
  bidAmount?: number;
  requirementId?: string;
  message?: string;
  
  product?: {
    _id: string;
    title: string;
  };
   deal?: {
    _id: string;
    productId: string;
    buyerId: string;
    sellerId: string;
    roomId?: string;
    sellerDetails?: {
       sellerId: string;
    };
  };
  action?: 'accept' | 'reject' | 'request';
  
  // Keep flexible for other potential fields from API
  [key: string]: any;
}

export interface ChatNavigationParams {
  productId: string;
  buyerId: string;
  sellerId: string;
  roomId?: string;
}
