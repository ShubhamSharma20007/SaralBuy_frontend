import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ChatService from '@/services/chat.service';
import RequirementService from '@/services/requirement.service';
import { getUserProfile } from '@/zustand/userProfile';
import { useChatStore } from '@/zustand/chatStore';
import { NotificationType } from '@/types/notification.types';
import type { UnifiedNotification } from '@/types/notification.types';
import { NotificationNormalizer, NotificationDeduplicator, NotificationSorter } from '@/utils/notification.utils';

export function useNotifications() {
  const navigate = useNavigate();
  const { user } = getUserProfile();
  
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Add new notifications with automatic deduplication
   */
  const addNotifications = useCallback((rawNotifs: any[]) => {
    // Normalize each notification
    const normalized = rawNotifs
        .map(n => NotificationNormalizer.normalize(n))
        .filter((n): n is UnifiedNotification => n !== null);

    setNotifications(prev => {
        // Merge with existing notifications
        const merged = NotificationDeduplicator.merge(prev, normalized);
        // Sort by timestamp
        return NotificationSorter.sort(merged);
    });
  }, []);
  
  /**
   * Mark notifications as seen via API
   */
  const markAsSeen = useCallback(async (notificationIds: string[]) => {
    if (!notificationIds.length) return;

    // Optimistically update local state to mark as seen
    setNotifications(prev => 
        prev.map(n => 
            (n._id && notificationIds.includes(n._id)) 
                ? { ...n, seen: true } 
                : n
        )
    );

    try {
        await RequirementService.markNotificationsSeen(notificationIds);
    } catch (err) {
        console.error('Failed to mark notifications as seen:', err);
    }
  }, []);
  
  /**
   * Remove a single notification
   */
  const removeNotification = useCallback((notif: UnifiedNotification) => {
    setNotifications(prev => prev.filter(n => NotificationDeduplicator.generateKey(n) !== NotificationDeduplicator.generateKey(notif)));
  }, []);
  
  /**
   * Generate roomId from product, buyer, and seller IDs
   * Format: product_{productId}_buyer_{buyerId}_seller_{sellerId}
   */
  const generateRoomId = (productId: string, buyerId: string, sellerId: string): string => {
    return `product_${productId}_buyer_${buyerId}_seller_${sellerId}`;
  };

  /**
   * Handle notification click - navigate to appropriate page
   */
  const handleNotificationClick = useCallback((notif: UnifiedNotification) => {
    // Mark as seen if has _id (call API)
    if (notif._id && !notif.seen) {
        markAsSeen([notif._id]);
    } else if (!notif._id && !notif.seen) {
        // Real-time notification without _id - mark optimistically locally
        // These are new notifications that haven't been saved to DB yet
        setNotifications(prev => 
            prev.map(n => 
                (n === notif || (n.timestamp === notif.timestamp && n.type === notif.type)) 
                    ? { ...n, seen: true } 
                    : n
            )
        );
    }
    
    // Remove if type is PRODUCT
    if (notif.type === NotificationType.PRODUCT) {
       removeNotification(notif);
    }
    
    // Navigate based on type:
    switch (notif.type) {
      case NotificationType.BID:
        // Extract IDs from notification
        let bidProductId = notif.productId;
        let bidBuyerId = notif.buyerId;
        let bidSellerId = notif.sellerId;

        if (!bidBuyerId && user?._id) {
            bidBuyerId = user._id;
        }

        // If missing IDs, try to find in recentChats
        if (!bidProductId || !bidBuyerId || !bidSellerId) {
            const recentChats = useChatStore.getState().recentChats;
            const matchingChat = recentChats.find(c => 
                (c.productId as any)?._id === bidProductId || c.productId === bidProductId
            );
            if (matchingChat) {
                bidProductId = (matchingChat.productId as any)?._id || matchingChat.productId;
                bidBuyerId = (matchingChat.buyerId as any)?._id || matchingChat.buyerId;
                bidSellerId = (matchingChat.sellerId as any)?._id || matchingChat.sellerId;
            }
        }

        if (bidProductId && bidBuyerId && bidSellerId) {
            const roomId = generateRoomId(bidProductId, bidBuyerId, bidSellerId);
            const chatParams = { productId: bidProductId, buyerId: bidBuyerId, sellerId: bidSellerId, roomId };
            localStorage.setItem('chatIds', JSON.stringify(chatParams));
            navigate('/chat', { state: chatParams });
        } else {
            navigate('/chat');
        }
        break;
        
      case NotificationType.CHAT_RATING:
      case NotificationType.DEAL_REQUEST:
      case NotificationType.DEAL_ACCEPTED:
      case NotificationType.DEAL_REJECTED:
        
        // 1. Extract IDs from notification
        let productId = notif.productId || notif.deal?.productId;
        let buyerId = notif.buyerId || notif.deal?.buyerId;
        let sellerId = notif.sellerId || notif.deal?.sellerId || notif.deal?.sellerDetails?.sellerId;

        console.log('🔍 Extracted IDs from notification:', { productId, buyerId, sellerId });

        // 2. Validate (if missing or invalid, find in recentChats)
        if (!productId || !buyerId || !sellerId || buyerId === sellerId) {
            console.warn('⚠️ Missing or invalid IDs, attempting lookup in recentChats', { productId, buyerId, sellerId });
            
            const recentChats = useChatStore.getState().recentChats;
            const matchingChat = recentChats.find(c => 
                (c.productId as any)?._id === productId || c.productId === productId
            );
            
            if (matchingChat) {
                console.log('✅ Found matching chat in recentChats:', matchingChat);
                productId = (matchingChat.productId as any)?._id || matchingChat.productId;
                buyerId = (matchingChat.buyerId as any)?._id || matchingChat.buyerId;
                sellerId = (matchingChat.sellerId as any)?._id || matchingChat.sellerId;
            } else {
                console.warn('❌ No matching chat found, falling back to generic /chat');
                navigate('/chat');
                return;
            }
        }

        // At this point we have valid IDs
        const validProductId = productId as string;
        const validBuyerId = buyerId as string;
        const validSellerId = sellerId as string;

        // 3. Generate roomId ourselves (same format as chat system)
        const roomId = generateRoomId(validProductId, validBuyerId, validSellerId);
        console.log('🔑 Generated roomId:', roomId);

        // 4. Build final params
        const chatParams = {
            productId: validProductId,
            buyerId: validBuyerId,
            sellerId: validSellerId,
            roomId,
        };

        console.log('🚀 Final chat params:', chatParams);

        // 5. Store in localStorage (for fallback)
        localStorage.setItem('chatIds', JSON.stringify(chatParams));

        // 6. Navigate to chat (EXACTLY like message chat)
        navigate('/chat', {
            state: chatParams
        });
        break;
        
      case NotificationType.PRODUCT:
        // Validate productId exists
        if (!notif.productId) {
            toast.error('Product information missing');
            return;
        }
        // Navigate to /product-overview?productId=...
        navigate(`/product-overview?productId=${encodeURIComponent(notif.productId)}`);
        break;
    }
  }, [navigate, markAsSeen, removeNotification, user?._id]);
  
  /**
   * Fetch initial notifications from API
   */
  const fetchInitialNotifications = useCallback(async () => {
    if (!user?._id) return;

    setIsLoading(true);
    try {
        const data = await RequirementService.getBidNotifications();
        if (Array.isArray(data)) {
            addNotifications(data);
        }
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
    } finally {
        setIsLoading(false);
    }
  }, [user?._id, addNotifications]);
  
  /**
   * Setup socket listeners for real-time notifications
   */
  useEffect(() => {
    if (!user?._id) return;
    
    // Get chat service instance
    const chatService = ChatService.getInstance();
    
    // Connect logic is already in ChatService.connect(), but calling it here ensures it's connected
    chatService.connect(); 
    chatService.identify(user._id);
    
    // Fetch initial notifications
    fetchInitialNotifications();
    
    // Define socket handlers
    const handlers = {
      bidList: (data: any) => {
        if (Array.isArray(data)) addNotifications(data);
      },
      
      newBid: (data: any) => {
        console.log('📩 New bid received:', data);
        addNotifications([data]);
      },
      
      chatRating: (data: any) => {
        console.log('⭐ Chat rating received:', data);
        // Don't show notification to person who gave the rating
        if (user._id === data.ratedBy) return;
        
        // Ensure proper fields are mapped for normalization
        addNotifications([data]);
        
        toast.info('Chat Rated', { 
            description: data.message || `${data.raterName} rated ${data.rating} stars` 
        });
      },
      
      dealRequest: (data: any) => {
        console.log('📝 Deal request received:', data);
        addNotifications([data]);
      },
      
      dealResolution: (data: any) => {
        console.log('⚖️ Deal resolution received:', data);
        addNotifications([data]);
        if (data.action === 'accept') {
          toast.success('Deal Accepted', { description: data.message });
        } else {
          toast.error('Deal Rejected', { description: data.message });
        }
      },
      
      productNotif: (data: any) => {
        console.log('📦 Product notification received:', data);
        addNotifications([data]);
      }
    };
    
    // Register all socket listeners
    chatService.onBidNotification(handlers.bidList);
    chatService.onNewBid(handlers.newBid);
    chatService.onChatRating(handlers.chatRating);
    chatService.onCloseDealRequest(handlers.dealRequest);
    chatService.onDealResolution(handlers.dealResolution);
    chatService.onProductNotification(handlers.productNotif);
    
    // Cleanup on unmount
    return () => {
      chatService.offBidNotification(handlers.bidList);
      chatService.offNewBid(handlers.newBid);
      chatService.offChatRating(handlers.chatRating);
      chatService.offCloseDealRequest(handlers.dealRequest);
      chatService.offDealResolution(handlers.dealResolution);
      chatService.offProductNotification(handlers.productNotif);
    };
  }, [user?._id, addNotifications, fetchInitialNotifications]);
  
  // Calculate unseen count
  const unseenCount = notifications.filter(n => !n.seen).length;
  
  return {
    notifications,           // All notifications (sorted, deduplicated)
    isLoading,              // Loading state
    unseenCount,            // Count of unseen notifications
    handleNotificationClick, // Navigate + mark as seen
    markAsSeen,             // Mark notifications as seen
    removeNotification,     // Remove notification
    refresh: fetchInitialNotifications, // Manual refresh
  };
}
