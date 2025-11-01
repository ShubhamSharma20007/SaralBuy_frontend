import React, { useState, useEffect, useRef } from 'react'
import ChatService from '../services/chat.service'
import { Search, Send, Menu, Circle, List, Paperclip } from 'lucide-react'
import { Input } from '../Components/ui/input'
import { Button } from '../Components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../Components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '../Components/ui/sheet'
import { Badge } from '../Components/ui/badge'
import { fallBackName } from '@/helper/fallBackName'
import { getUserProfile } from "@/zustand/userProfile"
import { useChatStore } from '@/zustand/chatStore'
import { useLocation } from 'react-router-dom'
import { toast } from "sonner"
import requirementService from '@/services/requirement.service'

// Sidebar component to display recent chats
const ContactsList = ({
  onSelectContact,
  contacts,
  selectedContactId,
  currentUserId,
}: {
  onSelectContact: (contact: any) => void;
  contacts: any[];
  selectedContactId: string | null;
  currentUserId?: string | null;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredContacts = contacts.filter(
    (c) =>
      c &&
      c.name &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-chat-sidebar border-r-0 border-chat-border">
      <div className="p-4 border-b border-chat-border">
        <h2 className="text-lg font-semibold mb-2 text-gray-600">Messaging</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search in dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-chat-border"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No Contact Found</p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const unreadCount = contact.buyerId === currentUserId
              ? (contact.buyerUnreadCount || 0)
              : (contact.sellerUnreadCount || 0);
            const isSelected = contact.roomId === selectedContactId;
            
            return (
              <div
                key={contact.roomId}
                onClick={() => {
                  if (!isSelected) onSelectContact(contact);
                }}
                className={`px-2 py-1 border-chat-border hover:bg-chat-message-bg cursor-pointer transition-colors ${
                  isSelected ? 'bg-orange-50' : ''
                }`}
              >
                <div className={`flex items-start space-x-3 bg-white p-3 rounded-md ${
                  isSelected ? 'border-2 border-orange-500' : ''
                }`}>
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback>{fallBackName(contact.name)}</AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-chat-online border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-600 truncate">{contact.name}</h3>
                      <span className="text-xs text-muted-foreground ml-2">
                        {contact.lastMessage && contact.lastMessage.timestamp
                          ? new Date(contact.lastMessage.timestamp).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-muted-foreground font-medium truncate mt-1">
                        {contact.lastMessage && contact.lastMessage.message
                          ? contact.lastMessage.message
                          : "No messages yet"}
                      </p>
                      {!isSelected && unreadCount > 0 && (
                        <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface ChatAreaProps {
  selectedContact: any;
  userType: "seller" | "buyer";
  userId: string; // for socket join (buyerId)
  currentUserId: string; // actual logged-in user (senderId)
  productId: string;
  buyerId: string;
  sellerId: string;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onSidebarContactUpdate: (roomId: string, updater: (prev: any) => any) => void;
}

const ChatArea = ({
  selectedContact,
  userType,
  userId, // for socket join (buyerId)
  currentUserId, // actual logged-in user (senderId)
  productId,
  buyerId,
  sellerId,
  messages,
  setMessages,
  onSidebarContactUpdate,
}: ChatAreaProps) => {
  const [messageText, setMessageText] = useState('');
  const [chatService] = useState(() => ChatService.getInstance());
  const [isClosingDeal, setIsClosingDeal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null);

  useEffect(() => {
    // Use IDs from selectedContact when available, otherwise fall back to props
    const actualProductId = selectedContact?.productId || productId;
    const actualSellerId = selectedContact?.sellerId || sellerId;
    const actualBuyerId = selectedContact?.buyerId || buyerId;

    if (!actualProductId || !actualSellerId || !userType || !actualBuyerId) {
      console.error('Missing required parameters:', {
        actualProductId,
        actualSellerId,
        actualBuyerId,
        userType,
      });
      return;
    }

    // Join room using actual IDs
    chatService.joinRoom(currentUserId, actualProductId, actualSellerId, userType, actualBuyerId);

    // Use the new getChatHistory method with actual IDs
    chatService.getChatHistory(actualProductId, actualSellerId, actualBuyerId, (data: any) => {
      if (data && Array.isArray(data.messages)) {
        const mappedMessages = data.messages.map((msg: any, idx: number) => ({
          id: msg._id || idx + "_" + (msg.timestamp || ""),
          text: msg.message,
          senderId: msg.senderId,
          senderType: msg.senderType,
          time: msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString()
            : "",
        }));
        setMessages(mappedMessages);
        // Update sidebar contact info with proper unread counts
        if (typeof onSidebarContactUpdate === "function" && selectedContact) {
          onSidebarContactUpdate(selectedContact.roomId, (prev: any) => ({
            ...prev,
            lastMessage: data.lastMessage,
            buyerUnreadCount: data.buyerUnreadCount || 0,
            sellerUnreadCount: data.sellerUnreadCount || 0,
          }));
        }
      }
    });
    // Listen for real-time unread count updates
    const handleLastMessageUpdate = (data: any) => {
      if (data && selectedContact && data.roomId === selectedContact.roomId) {
        if (typeof onSidebarContactUpdate === "function") {
          onSidebarContactUpdate(selectedContact.roomId, (prev: any) => ({
            ...prev,
            lastMessage: data.lastMessage,
            buyerUnreadCount: data.buyerUnreadCount !== undefined ? data.buyerUnreadCount : prev.buyerUnreadCount,
            sellerUnreadCount: data.sellerUnreadCount !== undefined ? data.sellerUnreadCount : prev.sellerUnreadCount,
          }));
        }
      }
    };
    if (chatService.socket) {
      chatService.socket.on("chat_last_message_update", handleLastMessageUpdate);
    }
    return () => {
      if (chatService.socket) {
        chatService.socket.off("chat_last_message_update", handleLastMessageUpdate);
      }
    };
  }, [userId, selectedContact, userType, currentUserId]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Use IDs from selectedContact when possible
      const actualBuyerId = selectedContact?.buyerId || buyerId;
      const actualSellerId = selectedContact?.sellerId || sellerId;
      const actualProductId = selectedContact?.productId || productId;

      // senderId should be the actual logged-in user id
      const senderId = currentUserId || (userType === "buyer" ? actualBuyerId : actualSellerId);

      chatService.sendMessage(
        actualProductId,
        actualSellerId,
        messageText,
        senderId,
        userType,
        actualBuyerId
      );
      
      const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        senderId: senderId,
        senderType: userType,
        time: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');

      // Update sidebar contact info for this chat immediately
      if (typeof onSidebarContactUpdate === "function" && selectedContact) {
        onSidebarContactUpdate(selectedContact.roomId, (prev: any) => ({
          ...prev,
          lastMessage: {
            message: messageText,
            timestamp: new Date().toISOString(),
            senderId: senderId,
            senderType: userType,
          },
          // Reset unread count for the current user
          buyerUnreadCount: userType === "buyer" ? 0 : prev.buyerUnreadCount,
          sellerUnreadCount: userType === "seller" ? 0 : prev.sellerUnreadCount,
        }));
      }

      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  };

  const handleCloseDeal = async () => {
    // Always use IDs from selectedContact for robustness
    const sc = selectedContact;
    if (!sc?.productId || !sc?.sellerId || !sc?.buyerId) {
      toast.error("Missing required parameters to close deal.");
      return;
    }
    let amount = budgetAmount;
    if (amount === null || isNaN(amount)) {
      const input = window.prompt("Enter the agreed budget amount to close the deal:");
      if (!input) return;
      amount = Number(input);
      if (isNaN(amount)) {
        toast.error("Invalid budget amount.");
        return;
      }
      setBudgetAmount(amount);
    }
    setIsClosingDeal(true);
    try {
      await requirementService.closeDeal({
        productId: sc.productId,
        sellerId: sc.sellerId,
        buyerId: sc.buyerId,
        finalBudget: amount!,
      });
      toast.success("Deal closed successfully!");
    } catch (err: any) {
      toast.error("Failed to close deal.");
    } finally {
      setIsClosingDeal(false);
    }
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-sm">Choose a contact from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  // Prevent self-chat: use selectedContact IDs when available
  const actualBuyerId = selectedContact?.buyerId || buyerId;
  const actualSellerId = selectedContact?.sellerId || sellerId;
  const isSelfChat = (currentUserId === actualBuyerId && currentUserId === actualSellerId) || actualBuyerId === actualSellerId;

  return (
    <div className="flex-1 flex flex-col border-1 rounded-md w-full">
      {/* Chat Header */}
      <div className="border-b border-chat-border bg-background">
        {/* <div className='bg-gray-100 flex justify-between items-center'>
          <p></p>
        </div> */}
        <div className="flex justify-between items-center space-x-2 bg-gray-100 p-2">
          <p className="text-sm text-muted-foreground font-semibold">
            {selectedContact.productName || 'Product Discussion'}
          </p>
          <div className="flex items-center justify-end mt-1">
            <List className='w-4 h-4' />
            <Badge variant="secondary" className="text-sm">Active</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-orange-50">
          <div className='flex justify-between items-center w-full'>
            <div className="relative flex items-center gap-3 justify-between w-full ">
             <div className='flex items-center gap-3'>
               <Avatar className="h-10 w-10">
                <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
              </Avatar>
          
                <div className='flex items-center space-x-4'>
                  <h3 className="font-semibold text-gray-700">{selectedContact.name}</h3>
                  <div className="flex items-center gap-1">
                    <Circle className="h-2 w-2 overflow-hidden bg-green-600 rounded-full border-0 text-transparent" />
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </div>
             </div>
      
             <div>
              
            <div className='flex items-center gap-3 '>
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600 hover:text-orange-600 bg-transparent cursor-pointer hover:bg-transparent border-orange-600 w-20 sm:w-32 text-sm font-medium "
                onClick={handleCloseDeal}
                disabled={isClosingDeal}
              >
                {isClosingDeal ? "Closing..." : "Close Deal"}
              </Button>
              {/* <LayoutGrid className='w-5 h-5 text-gray-600' /> */}
            </div>
             </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 chat-messages-container">
        {isSelfChat ? (
          <div className="text-center text-red-500 font-semibold">
            Cannot send messages to yourself. Buyer and seller must be different users.
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === userId && message.senderType === userType;
            return (
              <div
                key={message.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 ${
                    isMine
                      ? 'bg-gray-500 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg'
                      : 'bg-gray-600 text-white rounded-tr-lg rounded-bl-lg rounded-br-lg'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {message.time || (message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : "")}
                  {" "}• {isMine ? 'You' : message.senderType}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-chat-border bg-background">
        <div className="flex items-center space-x-5">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="p-5 bg-gray-100 rounded-full text-sm placeholder:text-sm placeholder:font-medium tracking-wide focus-visible:ring-0 border-0"
              disabled={isSelfChat}
            />
          </div>
          <div className={`p-1 rounded-full border-2 border-gray-500 ${isSelfChat ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}>
            <Paperclip className='w-4 h-4 text-gray-700'/>
          </div>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="cursor-pointer w-12"
            disabled={isSelfChat}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const location = useLocation();
  const { user } = getUserProfile();

  // Set active user in localStorage when Chatbot is mounted, clear on unmount
  React.useEffect(() => {
    localStorage.setItem('chatbot_active_user', 'true');
    return () => {
      localStorage.removeItem('chatbot_active_user');
    };
  }, []);

  // Get IDs from location.state or localStorage
  let productId = location.state?.productId;
  let buyerId = location.state?.buyerId;
  let sellerId = location.state?.sellerId;

  if (!productId || !buyerId || !sellerId) {
    try {
      const stored = localStorage.getItem('chatIds');
      if (stored) {
        const ids = JSON.parse(stored);
        productId = productId || ids.productId;
        buyerId = buyerId || ids.buyerId;
        sellerId = sellerId || ids.sellerId;
      }
    } catch (e) {
      console.error('Error parsing chatIds from localStorage:', e);
    }
  }

  const currentUserId = user?._id;
  const [recentChats, setRecentChats] = useState<any[]>([]);
  // Subscribe to Zustand chat store so socket-driven recent_chat_update updates UI
  useEffect(() => {
    // subscribe(listener) where listener receives the whole state
    const unsub = useChatStore.subscribe((state) => {
      setRecentChats(state.recentChats || []);
    });
    // initialize from store if present
    setRecentChats(useChatStore.getState().recentChats || []);
    return () => {
      try { unsub(); } catch (e) { /* ignore */ }
    };
  }, []);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const lastMarkedRef = useRef<Record<string, number>>({});

  // ⭐ Determine userType from selectedContact when available, otherwise fall back to URL/localStorage IDs
  const userType: 'buyer' | 'seller' = selectedContact
    ? (currentUserId === selectedContact.buyerId ? 'buyer' : 'seller')
    : (currentUserId === buyerId ? 'buyer' : 'seller');

  // Use the actual logged-in user id as socket user id
  const socketUserId = currentUserId;

  // Step 1: Fetch recent chats on mount
  useEffect(() => {
    if (!currentUserId) return;

    const chatService = ChatService.getInstance();
    chatService.connect();
    
    setIsLoadingChats(true);
    chatService.getRecentChats(currentUserId, (data) => {
      console.log("Recent chats received:", data);
      
      if (data && Array.isArray(data.chats)) {
        // Transform recent chats to match contact format
        const transformedChats = data.chats.map((chat: any) => {
          // Extract product ID from chat object
          const chatProductId = chat.product?._id || chat.productId;
          
          // Extract seller and buyer IDs
          const chatSellerId = chat.seller?._id || chat.sellerId;
          const chatBuyerId = chat.buyer?._id || chat.buyerId;
          
          // Determine the opposite party's name based on userType
          // If current user is buyer, show seller's name; if seller, show buyer's name
          let displayName = 'Unknown';
          let displayAvatar = '';
          
          if (chat.userType === 'buyer') {
            // Current user is buyer, show seller info
            displayName = (chat.seller?.firstName && chat.seller?.lastName)
              ? `${chat.seller.firstName} ${chat.seller.lastName}`
              : chat.seller?.firstName || chat.seller?.lastName || 'Seller';
            displayAvatar = chat.seller?.profileImage || '';
          } else if (chat.userType === 'seller') {
            // Current user is seller, show buyer info
            displayName = (chat.buyer?.firstName && chat.buyer?.lastName)
              ? `${chat.buyer.firstName} ${chat.buyer.lastName}`
              : chat.buyer?.firstName || chat.buyer?.lastName || 'Buyer';
            displayAvatar = chat.buyer?.profileImage || '';
          }
          
          return {
            roomId: chat.roomId,
            productId: chatProductId,
            sellerId: chatSellerId,
            buyerId: chatBuyerId,
            name: displayName,
            avatar: displayAvatar,
            isOnline: true,
            lastMessage: chat.lastMessage,
            messageCount: chat.messageCount || 0,
            buyerUnreadCount: chat.buyerUnreadCount || 0,
            sellerUnreadCount: chat.sellerUnreadCount || 0,
            productName: chat.product?.title || 'Product Discussion',
            userType: chat.userType, // Keep track of userType for this chat
          };
        });
        
        console.log("Transformed chats:", transformedChats);
        setRecentChats(transformedChats);
        // Populate Zustand store so socket updates (recent_chat_update) reflect in UI
        try {
          useChatStore.getState().setRecentChats(transformedChats);
        } catch (e) {
          console.error('Failed to set recent chats in store:', e);
        }
        
        // Step 2: Check if URL params match any recent chat
        if (productId && sellerId && buyerId) {
          const matchingChat = transformedChats.find(
            (chat: any) =>
              chat.productId === productId &&
              chat.sellerId === sellerId &&
              chat.buyerId === buyerId
          );
          
          if (matchingChat) {
            // Found existing chat - select it
            console.log("Found matching recent chat, loading it");
            setSelectedContact(matchingChat);
          } else {
            // No matching recent chat - create new contact for this conversation
            console.log("No matching recent chat, creating new conversation");
            // Ensure correct assignment of buyerId and sellerId based on userType
            let finalBuyerId = buyerId;
            let finalSellerId = sellerId;
            if (userType === 'buyer') {
              finalBuyerId = currentUserId;
            } else if (userType === 'seller') {
              finalSellerId = currentUserId;
            }
            // Prevent both IDs from being the same
            if (finalBuyerId === finalSellerId) {
              console.error("Cannot create chat: buyerId and sellerId are the same!", { finalBuyerId, finalSellerId });
              return;
            }
            const newContact = {
              roomId: `product_${productId}_buyer_${buyerId}_seller_${sellerId}`,
              productId,
              sellerId: sellerId,
              buyerId: buyerId,
              name: userType === 'buyer' ? 'Seller' : 'Buyer',
              avatar: '',
              isOnline: true,
              lastMessage: null,
              buyerUnreadCount: 0,
              sellerUnreadCount: 0,
              productName: 'Product Discussion',
              userType: userType,
            };
            
            // Add to recent chats only if it's not already there (update store too)
            setRecentChats((prev) => {
              const exists = prev.some(chat => chat.roomId === newContact.roomId);
              if (exists) return prev;
              const updated = [newContact, ...prev];
              try { useChatStore.getState().setRecentChats(updated); } catch (e) { console.error(e); }
              return updated;
            });
            setSelectedContact(newContact);
          }
        } else if (transformedChats.length > 0) {
          // No URL params but we have chats - select first one
          setSelectedContact(transformedChats[0]);
        }
      } else {
        // No recent chats
        if (productId && sellerId && buyerId) {
          // Still allow user to start new chat
          console.log("No recent chats, but IDs provided - creating new conversation");
          // Ensure correct assignment of buyerId and sellerId based on userType
          let finalBuyerId = buyerId;
          let finalSellerId = sellerId;
          if (userType === 'buyer') {
            finalBuyerId = currentUserId;
          } else if (userType === 'seller') {
            finalSellerId = currentUserId;
          }
          // Prevent both IDs from being the same
          if (finalBuyerId === finalSellerId) {
            console.error("Cannot create chat: buyerId and sellerId are the same!", { finalBuyerId, finalSellerId });
            return;
          }
          const newContact = {
            roomId: `product_${productId}_buyer_${buyerId}_seller_${sellerId}`,
            productId,
            sellerId: sellerId,
            buyerId: buyerId,
            name: userType === 'buyer' ? 'Seller' : 'Buyer',
            avatar: '',
            isOnline: true,
            lastMessage: null,
            messageCount: 0,
            buyerUnreadCount: 0,
            sellerUnreadCount: 0,
            productName: 'Product Discussion',
            userType: userType,
          };
          
          setRecentChats([newContact]);
          try { useChatStore.getState().setRecentChats([newContact]); } catch (e) { console.error(e); }
          setSelectedContact(newContact);
        }
      }
      
      setIsLoadingChats(false);
    });
  }, [currentUserId, productId, sellerId, buyerId, userType]);

  // Step 3: Set up message listeners
  useEffect(() => {
    if (!currentUserId) return;

    const chatService = ChatService.getInstance();
    chatService.connect();

    const handleReceiveMessage = (data: any) => {
      console.log('Received message:', data);
    
      const roomIdFromData = data.roomId || `product_${data.productId}_buyer_${data.buyerId}_seller_${data.sellerId}`;
      
      // Update recent chats with proper unread counts
      setRecentChats((prev) =>
        prev.map((chat) => {
          if (chat.roomId === roomIdFromData) {
            // Always update last message
            let lastMessage = data.lastMessage || {
              message: data.message,
              timestamp: data.timestamp,
              senderId: data.senderId,
              senderType: data.senderType
            };
    
            // Use backend-provided unread counts if available
            let buyerUnreadCount = typeof data.buyerUnreadCount === "number"
              ? data.buyerUnreadCount
              : chat.buyerUnreadCount;
            let sellerUnreadCount = typeof data.sellerUnreadCount === "number"
              ? data.sellerUnreadCount
              : chat.sellerUnreadCount;
    
            // If this message is for the currently selected chat, user is reading it
            if (selectedContact && roomIdFromData === selectedContact.roomId) {
              // User is viewing this chat, so reset their unread count
              if (currentUserId === chat.buyerId) {
                buyerUnreadCount = 0;
              } else if (currentUserId === chat.sellerId) {
                sellerUnreadCount = 0;
              }
            } else {
              // User is not viewing this chat, increment unread count for the recipient
              if (data.senderType === "seller" && currentUserId === chat.buyerId) {
                buyerUnreadCount = (chat.buyerUnreadCount || 0) + 1;
              } else if (data.senderType === "buyer" && currentUserId === chat.sellerId) {
                sellerUnreadCount = (chat.sellerUnreadCount || 0) + 1;
              }
            }
    
            return {
              ...chat,
              lastMessage,
              buyerUnreadCount,
              sellerUnreadCount,
            };
          }
          return chat;
        })
      );
    
      // Only add to messages if the message belongs to the currently selected chat
      if (selectedContact && roomIdFromData === selectedContact.roomId) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              (msg.id && data.id && msg.id === data.id) ||
              (msg.text === data.message &&
                msg.senderId === data.senderId &&
                msg.time === (data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : ""))
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              id: data.id || Date.now().toString() + Math.random(),
              text: data.message,
              senderId: data.senderId,
              senderType: data.senderType,
              time: data.timestamp
                ? new Date(data.timestamp).toLocaleTimeString()
                : new Date().toLocaleTimeString(),
            },
          ];
        });
      }
    
      // Show notification if message is not from current chat
      if (!selectedContact || roomIdFromData !== selectedContact.roomId) {
        toast.info(`New message from ${data.senderType}`, {
          description: data.message,
          duration: 3000,
        });
      }
    };

    const handleLastMessageUpdate = (data: any) => {
      if (data && data.lastMessage) {
        const roomIdFromData = data.roomId || `product_${data.productId}_buyer_${data.buyerId}_seller_${data.sellerId}`;
        setRecentChats((prev) =>
          prev.map((chat) =>
            chat.roomId === roomIdFromData
              ? { ...chat, lastMessage: data.lastMessage }
              : chat
          )
        );
      }
    };

    if (chatService.socket) {
      chatService.socket.on("receive_message", handleReceiveMessage);
      chatService.socket.on("chat_last_message_update", handleLastMessageUpdate);
    }

    return () => {
      if (chatService.socket) {
        chatService.socket.off("receive_message", handleReceiveMessage);
        chatService.socket.off("chat_last_message_update", handleLastMessageUpdate);
      }
    };
  }, [currentUserId, selectedContact]);

  // Clear chatIds from localStorage when leaving
  useEffect(() => {
    // Handler to clear chatIds
    const clearChatIds = () => {
      localStorage.removeItem('chatIds');
    };
  
    // Remove on unmount
    return () => {
      clearChatIds();
    };
  }, []);
  
  // Also clear chatIds on page unload or tab close
  useEffect(() => {
    const clearChatIds = () => {
      localStorage.removeItem('chatIds');
    };
  
    window.addEventListener('beforeunload', clearChatIds);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        clearChatIds();
      }
    });
  
    return () => {
      window.removeEventListener('beforeunload', clearChatIds);
      document.removeEventListener('visibilitychange', clearChatIds);
    };
  }, []);

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    setMessages([]); // Clear messages when switching contacts
  
    // Reset unread count for the current user in the selected chat
    setRecentChats((prev) =>
      prev.map((chat) => {
        if (chat.roomId === contact.roomId) {
          const updatedChat = { ...chat };
          if (currentUserId === chat.buyerId) {
            updatedChat.buyerUnreadCount = 0;
          }
          if (currentUserId === chat.sellerId) {
            updatedChat.sellerUnreadCount = 0;
          }

          // join room for presence
          const chatService = ChatService.getInstance();
          if (chatService.socket) {
            chatService.socket.emit("join_room", {
              userId: currentUserId,
              productId: contact.productId,
              sellerId: contact.sellerId,
              userType: contact.userType,
              buyerId: contact.buyerId,
            });
          }

          // schedule mark-as-read with throttle to avoid race between tabs
          setTimeout(() => {
            const roomId = contact.roomId;
            const now = Date.now();
            const last = lastMarkedRef.current[roomId] || 0;
            if (now - last < 3000) return; // throttle

            const isBuyer = currentUserId === contact.buyerId;
            const unreadCount = isBuyer ? contact.buyerUnreadCount : contact.sellerUnreadCount;
            if (!unreadCount) return;

            const sendMark = () => {
              const cs = ChatService.getInstance();
              if (cs.socket) {
                cs.socket.emit('mark_as_read', {
                  userId: currentUserId,
                  roomId,
                  productId: contact.productId,
                  sellerId: contact.sellerId,
                  buyerId: contact.buyerId,
                });
                lastMarkedRef.current[roomId] = Date.now();
                // local update for immediate UI
                setRecentChats((prev) =>
                  prev.map((ch) =>
                    ch.roomId === roomId
                      ? {
                          ...ch,
                          buyerUnreadCount: isBuyer ? 0 : ch.buyerUnreadCount,
                          sellerUnreadCount: !isBuyer ? 0 : ch.sellerUnreadCount,
                        }
                      : ch
                  )
                );
                try { useChatStore.getState().updateRecentChat({ ...contact, buyerUnreadCount: isBuyer ? 0 : contact.buyerUnreadCount, sellerUnreadCount: !isBuyer ? 0 : contact.sellerUnreadCount }); } catch (e) { /* ignore */ }
              }
            };

            if (document.visibilityState === 'visible' && document.hasFocus()) {
              sendMark();
            } else {
              const onVisible = () => {
                if (document.visibilityState === 'visible' && document.hasFocus()) {
                  sendMark();
                  window.removeEventListener('focus', onVisible);
                  document.removeEventListener('visibilitychange', onVisible);
                }
              };
              window.addEventListener('focus', onVisible);
              document.addEventListener('visibilitychange', onVisible);
            }
          }, 500);

          return updatedChat;
        }
        return chat;
      })
    );
  };

  const handleSidebarContactUpdate = (roomId: string, updater: (prev: any) => any) => {
    setRecentChats((prev) =>
      prev.map((chat) => (chat.roomId === roomId ? updater(chat) : chat))
    );
  };

  // Error handling
  if (!currentUserId) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="h-screen flex items-center justify-center">
          <div className="text-center text-red-500 text-lg font-semibold">
            Error: Please log in to access chat
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="h-screen border-chat-border rounded-lg overflow-hidden my-5">
        <div className="flex h-full gap-2">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-80 bg-gray-100 border-1 rounded-md">
            {isLoadingChats ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading chats...</p>
              </div>
            ) : (
              <ContactsList
                onSelectContact={handleSelectContact}
                contacts={recentChats}
                selectedContactId={selectedContact?.roomId || null}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {/* Mobile Menu Button and Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden sm:p-4 py-2 border-chat-border bg-chat-sidebar">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Messages</h2>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <ContactsList
                      onSelectContact={(contact) => {
                        handleSelectContact(contact);
                        setIsMobileMenuOpen(false);
                      }}
                      contacts={recentChats}
                      selectedContactId={selectedContact?.roomId || null}
                      currentUserId={currentUserId}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Chat Area */}
            {selectedContact ? (
              <ChatArea
                selectedContact={selectedContact}
                userType={userType}
                userId={socketUserId}
                currentUserId={currentUserId}
                productId={selectedContact.productId}
                buyerId={selectedContact.buyerId}
                sellerId={selectedContact.sellerId}
                messages={messages}
                setMessages={setMessages}
                onSidebarContactUpdate={handleSidebarContactUpdate}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-medium mb-2">
                    {isLoadingChats ? 'Loading...' : ''}
                  </h3>
                  <p className="text-sm">
                    {recentChats.length === 0
                      ?   <div className='flex justify-center items-center h-full flex-col space-y-2'>
                        <img src="no-chat.webp" alt="" className='h-28 w-28' />
                        <p className='text-center text-lg capitalize'>No chats available</p>
                      </div> 
                      : 'Choose a contact from the sidebar to start messaging'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;