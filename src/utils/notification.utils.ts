import { type UnifiedNotification, NotificationType } from '@/types/notification.types';

export class NotificationNormalizer {
  /**
   * Converts raw API/socket data to UnifiedNotification format
   * Detects type from title and field structure
   */
  static normalize(rawNotif: any): UnifiedNotification | null {
    if (!rawNotif) return null;

    // Determine title to use for detection
    const title = rawNotif.title || '';
    const titleLower = title.toLowerCase();
    
    // Detect type
    const type = this.detectType(titleLower, rawNotif);
    
    // Base notification object
    const baseNotif: UnifiedNotification = {
      ...rawNotif,
      type: type, // Explicitly set detected type
      title: title || this.getDefaultTitle(type, rawNotif),
      description: rawNotif.description || this.getDefaultDescription(type, rawNotif),
      timestamp: rawNotif.timestamp || (rawNotif.createdAt ? new Date(rawNotif.createdAt).getTime() : Date.now()),
      seen: rawNotif.seen || false,
      // Ensure specific fields are mapped correctly if they exist in nested structures
      productId: rawNotif.productId?._id || rawNotif.productId, 
      buyerId: rawNotif.buyerId?._id || rawNotif.buyerId,
      sellerId: rawNotif.sellerId?._id || rawNotif.sellerId,
    };

    // Specific field normalization based on type or data structure
    if (rawNotif.deal) {
        baseNotif.deal = rawNotif.deal;
        // Map deal fields to top level for easier access if missing
        if (!baseNotif.productId) baseNotif.productId = rawNotif.deal.productId;
        if (!baseNotif.buyerId) baseNotif.buyerId = rawNotif.deal.buyerId;
        if (!baseNotif.sellerId) baseNotif.sellerId = rawNotif.deal.sellerId || rawNotif.deal.sellerDetails?.sellerId;
        if (!baseNotif.roomId) baseNotif.roomId = rawNotif.deal.roomId;
    }
    
    // Handle socket-specific structures that might differ from API
    if (type === NotificationType.BID && rawNotif.latestBid) {
        baseNotif.timestamp = rawNotif.latestBid.date || baseNotif.timestamp;
    }

    return baseNotif;
  }
  
  private static detectType(titleLower: string, rawNotif: any): NotificationType {
    // 1. Chat Rating
    if (
        titleLower.includes("chat rated") || 
        titleLower.includes("rated chat") || 
        titleLower.includes("rated your conversation") ||
        rawNotif.chatId // Socket event often has chatId
    ) {
        return NotificationType.CHAT_RATING;
    }

    // 2. Deal Accepted
    if (
        titleLower.includes("deal accepted") || 
        titleLower.includes("accepted your close deal") ||
        (rawNotif.action === 'accept' && rawNotif.deal)
    ) {
        return NotificationType.DEAL_ACCEPTED;
    }

    // 3. Deal Rejected
    if (
        titleLower.includes("deal rejected") || 
        titleLower.includes("rejected your close deal") ||
        (rawNotif.action === 'reject' && rawNotif.deal)
    ) {
        return NotificationType.DEAL_REJECTED;
    }

    // 4. Deal Request
    if (
        (titleLower.includes("deal") && (titleLower.includes("request") || titleLower.includes("close") || titleLower.includes("closed"))) ||
        this.typeFromDealAction(rawNotif) === NotificationType.DEAL_REQUEST
    ) {
        return NotificationType.DEAL_REQUEST;
    }

    // 5. Bid
    if (
        titleLower.includes("bid") || 
        titleLower.includes("quote") || 
        rawNotif.totalBids !== undefined ||
        rawNotif.bidAmount !== undefined ||
        rawNotif.latestBid !== undefined
    ) {
        return NotificationType.BID;
    }

    // 6. Product (Fallback if generic product info exists)
    if (rawNotif.productId && !rawNotif.buyerId && !rawNotif.sellerId) {
        return NotificationType.PRODUCT;
    }

    // Default to BID if we can't be sure, but log it maybe? 
    // Stick to BID as a safe default for now as it's the most common "actionable" item.
    return NotificationType.BID; 
  }

  private static typeFromDealAction(rawNotif: any): NotificationType | null {
    if (rawNotif.deal && !rawNotif.action) return NotificationType.DEAL_REQUEST; // Default deal object often means request
    if (rawNotif.type === 'request' && rawNotif.deal) return NotificationType.DEAL_REQUEST;
    return null;
  }

  private static getDefaultTitle(type: NotificationType, rawNotif: any): string {
      switch (type) {
          case NotificationType.CHAT_RATING: return `Chat rated ${rawNotif.rating || ''} stars`;
          case NotificationType.DEAL_ACCEPTED: return "Deal Accepted";
          case NotificationType.DEAL_REJECTED: return "Deal Rejected";
          case NotificationType.DEAL_REQUEST: return "Deal Requested";
          case NotificationType.BID: return "New Quote";
          case NotificationType.PRODUCT: return "Product Notification";
          default: return "New Notification";
      }
  }

  private static getDefaultDescription(_type: NotificationType, rawNotif: any): string {
       // Placeholder descriptions if missing
       return rawNotif.message || "You have a new notification";
  }
}

export class NotificationDeduplicator {
  /**
   * Generates unique key for deduplication
   * Format: "type-primaryId-secondaryId"
   */
  static generateKey(notif: UnifiedNotification): string {
    const type = notif.type;
    
    switch (type) {
      case NotificationType.BID:
        // BID: bid-{productId}-{_id || timestamp}
        // Using requirementId if available + productId is also good.
        const bidId = notif._id || notif.timestamp || Date.now();
        return `bid-${notif.productId}-${bidId}`;

      case NotificationType.CHAT_RATING:
        // CHAT_RATING: rating-{chatId}-{timestamp}
        const ratingId = notif.chatId || notif._id || notif.roomId; 
        return `rating-${ratingId}-${notif.timestamp}`;

      case NotificationType.DEAL_ACCEPTED:
      case NotificationType.DEAL_REJECTED:
      case NotificationType.DEAL_REQUEST:
        // DEAL_*: deal-{type}-{productId}-{buyerId}-{sellerId}
        const dealProductId = notif.deal?.productId || notif.productId;
        const dealBuyerId = notif.deal?.buyerId || notif.buyerId;
        const dealSellerId = notif.deal?.sellerId || notif.sellerId || notif.deal?.sellerDetails?.sellerId;
        return `deal-${type}-${dealProductId}-${dealBuyerId}-${dealSellerId}`;

      case NotificationType.PRODUCT:
        // PRODUCT: product-{productId}-{timestamp}
        return `product-${notif.productId}-${notif.timestamp}`;
    
      default:
        return `generic-${notif._id || notif.timestamp}`;
    }
  }
  
  /**
   * Removes duplicates from array, keeps most recent
   */
  static deduplicate(notifications: UnifiedNotification[]): UnifiedNotification[] {
    const uniqueMap = new Map<string, UnifiedNotification>();

    notifications.forEach(notif => {
        const key = this.generateKey(notif);
        const existing = uniqueMap.get(key);

        if (!existing) {
            uniqueMap.set(key, notif);
        } else {
            // Keep the one with the later timestamp/receivedAt
            const existingTime = existing.timestamp || 0;
            const newTime = notif.timestamp || 0;
            if (newTime > existingTime) {
                uniqueMap.set(key, notif);
            }
        }
    });

    return Array.from(uniqueMap.values());
  }
  
  /**
   * Merges new notifications with existing, deduplicates
   */
  static merge(existing: UnifiedNotification[], incoming: UnifiedNotification[]): UnifiedNotification[] {
    const combined = [...incoming, ...existing]; // Put incoming first
    return this.deduplicate(combined);
  }
}

export class NotificationSorter {
  static sort(notifications: UnifiedNotification[]): UnifiedNotification[] {
    // Sort by timestamp descending (newest first)
    return notifications.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
    });
  }
}
