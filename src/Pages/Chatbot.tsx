import React, { useState, useEffect, useRef } from 'react'
import ChatService from '../services/chat.service'
import { Search, Send, Menu, Paperclip, Star } from 'lucide-react'
import RatingPopup from '../Components/Popup/RatingPopup';
import ApprovalPopup from '../Components/Popup/ApprovalPopup';
import { Input } from '../Components/ui/input'
import { Button } from '../Components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../Components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '../Components/ui/sheet'
import { fallBackName } from '@/helper/fallBackName'
import { getUserProfile } from "@/zustand/userProfile"
import { useChatStore } from '@/zustand/chatStore'
import { useLocation } from 'react-router-dom'
import { toast } from "sonner"
import requirementService from '@/services/requirement.service'
import BudgetInputDialog from '@/Components/BudgetPopup';
import { mergeName } from '@/helper/mergeName';
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
  const { isUserOnline } = useChatStore();
  
  const filteredContacts = contacts
    .filter(
      (c) =>
        c &&
        c.name &&
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by last message timestamp (latest first)
      const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return timeB - timeA; // Descending order (latest first)
    });

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
            
            // Check if the other person is online
            const otherPersonId = contact.userType === 'buyer' ? contact.sellerId : contact.buyerId;
            const isOnline = isUserOnline(otherPersonId);
            
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
                    {/* Online/Offline indicator - green for online, red for offline */}
                    {isOnline ? (

                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-600 truncate">{contact.name}</h3>
                        {/* <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span> */}
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                      <span className="text-xs text-muted-foreground ml-2">
                        {contact.lastMessage && contact.lastMessage.timestamp
                          ? new Date(contact.lastMessage.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : ""}
                      </span>
                      {contact.chatrating > 0 && (
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                            <span className="text-xs font-medium">{contact.chatrating}</span>
                          </div>
                        )}
                      </div>
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
  setSelectedContact: React.Dispatch<any>;
  isOnline: boolean;
  mergeQuoteMessage?:string
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
  setSelectedContact,
  isOnline,
  mergeQuoteMessage
}: ChatAreaProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const [chatService] = useState(() => ChatService.getInstance());
  const [isClosingDeal, setIsClosingDeal] = useState(false);
  const [isDealClosed, setIsDealClosed] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<number | null>(null);
const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  // Rating popup state
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const {user} = getUserProfile();
  // Store last closed chatId for rating
  const [lastClosedChatId, setLastClosedChatId] = useState<string | null>(null);
 const initialGreetingSentRef = useRef<Set<string>>(new Set());
  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAttachment, setUploadedAttachment] = useState<{
    url: string;
    type: 'image' | 'document';
    mimeType: string;
    fileName: string;
    fileSize: number;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Smooth scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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
          attachment: msg.attachment || null,
          timestamp:msg.timestamp
        }));
        console.log(mappedMessages,324)
        setMessages(mappedMessages);

         const roomId = selectedContact?.roomId || chatService.generateRoomId(actualProductId, actualBuyerId, actualSellerId);
         if (mappedMessages.length === 0 && !initialGreetingSentRef.current.has(roomId)) {
          initialGreetingSentRef.current.add(roomId);
          
          setTimeout(() => {
            const senderId = currentUserId || (userType === "buyer" ? actualBuyerId : actualSellerId);
            
            console.log("Auto-sending initial greeting for new chat:", roomId);
            const greetingMsg = mergeQuoteMessage ||  `Hi this side ${mergeName(user)}. How i can help you?`
            chatService.sendMessage(
              actualProductId,
              actualSellerId,
              greetingMsg,
              senderId,
              userType,
              actualBuyerId,
              undefined
            );
            
            const greetingMessage = {
              id: Date.now().toString(),
              text: greetingMsg,
              senderId: senderId,
              senderType: userType,
              time: new Date().toLocaleTimeString(),
              isOptimistic: true,
              attachment: null,
            };
            
            setMessages([greetingMessage]);
            
            // Update sidebar contact info
            if (typeof onSidebarContactUpdate === "function" && selectedContact) {
              onSidebarContactUpdate(selectedContact.roomId, (prev: any) => ({
                ...prev,
                lastMessage: {
                  message: greetingMsg,
                  timestamp: new Date().toISOString(),
                  senderId: senderId,
                  senderType: userType,
                },
                buyerUnreadCount: userType === "buyer" ? 0 : prev.buyerUnreadCount,
                sellerUnreadCount: userType === "seller" ? 0 : prev.sellerUnreadCount,
              }));
            }
          }, 500); // Small delay to ensure socket is ready
        }
        
        // Scroll to bottom after messages are loaded
        setTimeout(() => scrollToBottom(), 100);
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

  // Approval popup state
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [waitingSellerApproval, setWaitingSellerApproval] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isDealRejected, setIsDealRejected] = useState(false);
  const [closedDealId, setClosedDealId] = useState<string | null>(null);
  const [finalBudget, setFinalBudget] = useState<number>(0);

  // Check if deal is already closed or pending approval
  const checkDealStatus = async () => {
    const actualProductId = selectedContact?.productId || productId;
    
    // Reset state if no product is selected
    if (!actualProductId) {
      setIsDealClosed(false);
      setWaitingSellerApproval(false);
      return;
    }

    try {
      const response = await requirementService.checkClosedDeal({
        productId: actualProductId,
        sellerId: selectedContact?.sellerId || sellerId,
        buyerId: selectedContact?.buyerId || buyerId
      });
      
      console.log("checkDealStatus response:", response);
      
      if (response && response.exists) {
        setIsDealClosed(true);
        setClosedDealId(response.closedDeal?._id);
        
        // Check for waiting approval
        if (response.closedDeal?.closedDealStatus === 'waiting_seller_approval') {
           setWaitingSellerApproval(true);
           setFinalBudget(response.closedDeal?.finalBudget || 0);
        } else if (response.closedDeal?.closedDealStatus === 'rejected') {
           setWaitingSellerApproval(false);
           setIsDealRejected(true);
           setIsDealClosed(false); 
        } else {
           setWaitingSellerApproval(false);
           setIsDealRejected(false);
        }
        
        // Update user role from response if available
        if (response.userRole?.isSeller) {
           setIsSeller(true);
           setIsBuyer(false);
        } else if (response.userRole?.isBuyer) {
           setIsSeller(false);
           setIsBuyer(true);
        } else {
           // Fallback
           setIsSeller(false);
           setIsBuyer(false);
        }
        
      } else {
        setIsDealClosed(false);
        setWaitingSellerApproval(false);
        // Fallback or keep previous role assumption? 
        // Better to re-verify role if needed, but usually static per chat
      }
    } catch (error) {
      console.error("Error fetching requirement status:", error);
    }
  };

  const handleDealApproval = async (dealId: string, action: 'accept' | 'reject') => {
    setApprovalLoading(true);
    try {
       await requirementService.respondToCloseDeal({ dealId, action });
       toast.success(`Deal ${action}ed successfully`);
       setShowApprovalPopup(false);
       
       // Refresh status
       await checkDealStatus();
       
       if (action === 'accept') {
           // Maybe trigger rating popup for seller?
           // For now just refresh status
           setLastClosedChatId(selectedContact._id);
           setShowRatingPopup(true);
       }
    } catch (error: any) {
        toast.error(error.message || "Failed to respond to deal");
    } finally {
        setApprovalLoading(false);
    }
  };

  // Socket listener for deal resolution
  useEffect(() => {
    const handleDealResolution = (data: any) => {
        console.log("ChatArea received close_deal_resolution:", data);
        const { action, message } = data;
        
        toast.info(message || `Deal was ${action}ed`);
        checkDealStatus(); // Refresh status to update UI
    };

    const handleCloseDealRequest = (data: any) => {
        console.log("ChatArea received close_deal_request:", data);
        toast.info("Buyer requested to close the deal");
        checkDealStatus(); // Refresh status to update UI for seller
    };

    if (chatService.socket) {
        chatService.socket.on("close_deal_resolution", handleDealResolution);
        chatService.socket.on("close_deal_request", handleCloseDealRequest);
    }

    return () => {
        if (chatService.socket) {
            chatService.socket.off("close_deal_resolution", handleDealResolution);
            chatService.socket.off("close_deal_request", handleCloseDealRequest);
        }
    };
  }, [checkDealStatus]);

  useEffect(() => {
    checkDealStatus();
  }, [selectedContact, productId]);

  // Sync isDealClosed state when selectedContact.isDealClosed is updated via socket event
  useEffect(() => {
    if (selectedContact?.isDealClosed) {
      setIsDealClosed(true);
    }
  }, [selectedContact?.isDealClosed]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/tiff', 'image/bmp', 'image/avif',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      toast.error('Invalid file type. Only images and documents are allowed.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }

    // Upload file immediately
    handleFileUpload(file);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    
    chatService.uploadAttachment(
      file,
      (data) => {
        setUploadedAttachment(data);
        setIsUploading(false);
        // toast.success('File uploaded successfully');
      },
      (error) => {
        setIsUploading(false);
        toast.error(error || 'Failed to upload file');
        setSelectedFile(null);
        setAttachmentPreview(null);
      }
    );
  };

  // Clear attachment
  const clearAttachment = () => {
    setSelectedFile(null);
    setAttachmentPreview(null);
    setUploadedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() && !uploadedAttachment) return;

    // Use IDs from selectedContact when possible
    const actualBuyerId = selectedContact?.buyerId || buyerId;
    const actualSellerId = selectedContact?.sellerId || sellerId;
    const actualProductId = selectedContact?.productId || productId;

    // senderId should be the actual logged-in user id
    const senderId = currentUserId || (userType === "buyer" ? actualBuyerId : actualSellerId);

    chatService.sendMessage(
      actualProductId,
      actualSellerId,
      messageText || (uploadedAttachment ? `Sent ${uploadedAttachment.type === 'image' ? 'an image' : 'a document'}` : ''),
      senderId,
      userType,
      actualBuyerId,
      uploadedAttachment || undefined
    );
    
    const newMessage = {
      id: Date.now().toString(),
      text: messageText || (uploadedAttachment ? `Sent ${uploadedAttachment.type === 'image' ? 'an image' : 'a document'}` : ''),
      senderId: senderId,
      senderType: userType,
      time: new Date().toLocaleTimeString(),
      isOptimistic: true,
      attachment: uploadedAttachment || null,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setMessageText('');
    clearAttachment();

    // Update sidebar contact info for this chat immediately
    if (typeof onSidebarContactUpdate === "function" && selectedContact) {
      onSidebarContactUpdate(selectedContact.roomId, (prev: any) => ({
        ...prev,
        lastMessage: {
          message: messageText || (uploadedAttachment ? `Sent ${uploadedAttachment.type === 'image' ? 'an image' : 'a document'}` : ''),
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
  };


  const processDealClose = async (amount: number) => {
  const sc = selectedContact;
  if (!sc?.productId || !sc?.sellerId || !sc?.buyerId) {
    toast.error("Missing required parameters to close deal.");
    return;
  }

  setBudgetAmount(amount);
  setIsClosingDeal(true);
  
  try {
    await requirementService.closeDeal({
      productId: sc.productId,
      sellerId: sc.sellerId,
      buyerId: sc.buyerId,
      finalBudget: amount,
    });
    
    toast.success("Deal closed successfully!");
    setShowBudgetDialog(false); // Close dialog
    checkDealStatus();

    console.log("handleCloseDeal: selectedContact (sc):", sc);
    console.log("handleCloseDeal: sc._id:", sc._id);

    let chatIdForRating = sc._id;
    if (!chatIdForRating) {
      console.log("Chat ID missing, attempting to fetch from recent chats...");
      chatService.getRecentChats(currentUserId, (data) => {
        if (data && Array.isArray(data.chats)) {
          const foundChat = data.chats.find((c: any) =>
            (c.roomId === sc.roomId) ||
            (c.product?._id === sc.productId && c.seller?._id === sc.sellerId && c.buyer?._id === sc.buyerId)
          );
          if (foundChat) {
            console.log("Found chat for rating:", foundChat);
            setLastClosedChatId(foundChat._id);
            setSelectedContact((prev: any) => ({
              ...prev,
              _id: foundChat._id
            }));
            setShowRatingPopup(true);
          } else {
            console.warn("Could not find chat in recent chats after deal close.");
            toast.error("Could not find chat data for rating.");
          }
        }
      });
    } else {
      setLastClosedChatId(chatIdForRating);
      setShowRatingPopup(true);
    }
  } catch (err: any) {
    toast.error("Failed to close deal.");
  } finally {
    setIsClosingDeal(false);
  }
};

  // const handleCloseDeal = async () => {
  //   // Always use IDs from selectedContact for robustness
  //   const sc = selectedContact;
  //   if (!sc?.productId || !sc?.sellerId || !sc?.buyerId) {
  //     toast.error("Missing required parameters to close deal.");
  //     return;
  //   }
  //   let amount = budgetAmount;
  //   if (amount === null || isNaN(amount)) {
  //     const input = window.prompt("Enter the agreed budget amount to close the deal:");
  //     if (!input) return;
  //     amount = Number(input);
  //     if (isNaN(amount)) {
  //       toast.error("Invalid budget amount.");
  //       return;
  //     }
  //     setBudgetAmount(amount);
  //   }
  //   setIsClosingDeal(true);
  //   try {
  //     await requirementService.closeDeal({
  //       productId: sc.productId,
  //       sellerId: sc.sellerId,
  //       buyerId: sc.buyerId,
  //       finalBudget: amount!,
  //     });
      
  //     toast.success("Deal closed successfully!");
      
  //     // Re-check deal status immediately
  //     checkDealStatus();
      
  //     // Debug log for chat object and _id
  //     console.log("handleCloseDeal: selectedContact (sc):", sc);
  //     console.log("handleCloseDeal: sc._id:", sc._id);
      
  //     // If sc._id is missing (optimistic chat), try to find it from recent chats
  //     let chatIdForRating = sc._id;
  //     if (!chatIdForRating) {
  //       console.log("Chat ID missing, attempting to fetch from recent chats...");
  //       // Retrieve recent chats to find the newly created/updated chat
  //       chatService.getRecentChats(currentUserId, (data) => {
  //         if (data && Array.isArray(data.chats)) {
  //            const foundChat = data.chats.find((c: any) => 
  //              (c.roomId === sc.roomId) || 
  //              (c.product?._id === sc.productId && c.seller?._id === sc.sellerId && c.buyer?._id === sc.buyerId)
  //            );
  //            if (foundChat) {
  //              console.log("Found chat for rating:", foundChat);
  //              setLastClosedChatId(foundChat._id);
  //              // Also update selectedContact with the real ID so future actions work
  //              setSelectedContact((prev: any) => ({ ...prev, _id: foundChat._id }));

  //              // Only open rating popup if we found a valid chat ID
  //              setShowRatingPopup(true);
  //            } else {
  //              console.warn("Could not find chat in recent chats after deal close.");
  //              toast.error("Could not find chat data for rating.");
  //            }
  //         }
  //       });
  //     } else {
  //       setLastClosedChatId(chatIdForRating);
  //       setShowRatingPopup(true);
  //     }
  //   } catch (err: any) {
  //     toast.error("Failed to close deal.");
  //   } finally {
  //     setIsClosingDeal(false);
  //   }
  // };

  const handleCloseDeal = async () => {
  // Always use IDs from selectedContact for robustness
  const sc = selectedContact;
  if (!sc?.productId || !sc?.sellerId || !sc?.buyerId) {
    toast.error("Missing required parameters to close deal.");
    return;
  }

  let amount = budgetAmount;
  if (amount === null || isNaN(amount)) {
    // Show dialog instead of window.prompt
    setShowBudgetDialog(true);
    return;
  }

  await processDealClose(amount);
};


  // Handle rating submit
  const handleSubmitRating = async (chatId: string, rating: number) => {
    if (!chatId) return;
    setRatingLoading(true);
    try {
      await chatService.rateChat({ chatId, rating, ratedBy: currentUserId });
      toast.success("Thank you for your feedback!");
      setShowRatingPopup(false);
      setLastClosedChatId(null);

      // Update sidebar contact info with new rating
      onSidebarContactUpdate(selectedContact.roomId, (prev: any) => ({
        ...prev,
        chatrating: rating
      }));
    } catch (err: any) {
      toast.error("Failed to submit rating.");
    } finally {
      setRatingLoading(false);
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
    <>
    <BudgetInputDialog
  open={showBudgetDialog}
  setOpen={setShowBudgetDialog}
  onConfirm={processDealClose}
  loading={isClosingDeal}
/>
      <div className="flex-1 flex flex-col border-1 rounded-md w-full min-h-0">
        {/* Chat Header */}
        <div className="border-b border-chat-border bg-background">
          {/* <div className='bg-gray-100 flex justify-between items-center'>
            <p></p>
          </div> */}
          <div className="flex justify-between items-center space-x-2 bg-gray-100 p-2">
            <p className="text-sm text-muted-foreground font-semibold">
             Product Name :  {selectedContact.productName || 'Product Discussion'} 
            </p>
            {/* <div className="flex items-center justify-end mt-1">
              <List className='w-4 h-4' />
              <Badge variant="secondary" className="text-sm">Active</Badge>
            </div> */}
          </div>
          <div className="flex items-center space-x-3 p-3 bg-orange-50">
            <div className='flex justify-between items-center w-full'>
              <div className="relative flex items-center gap-3 justify-between w-full ">
                <div className='flex items-center gap-3'>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <h3 className="font-semibold text-gray-700">{selectedContact.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className='flex items-center gap-3 '>
                    {(userType === 'buyer' || isDealClosed || isDealRejected) && (
                      <Button
                        variant={(waitingSellerApproval && isSeller) ? "default" : (isDealRejected ? "destructive" : "outline")}
                        size="sm"
                        className={`${
                            (waitingSellerApproval && isSeller) || (waitingSellerApproval && isBuyer) 
                                ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600" 
                                : isDealRejected 
                                    ? "bg-red-100 text-red-600 border-red-200 hover:bg-red-100 cursor-not-allowed"
                                    : "text-orange-600 hover:text-orange-600 bg-transparent cursor-pointer hover:bg-transparent border-orange-600"
                        } w-24 sm:w-auto px-4 text-sm font-medium cursor-pointer`}
                        onClick={waitingSellerApproval && isSeller ? () => setShowApprovalPopup(true) : handleCloseDeal}
                        disabled={isClosingDeal || (isDealClosed && !(waitingSellerApproval && isSeller)) || messages.length === 0 || isDealRejected}
                      >
                        {isClosingDeal 
                          ? "Closing..." 
                          : (waitingSellerApproval && isSeller) 
                            ? "Closed deal request" 
                            : (waitingSellerApproval && isBuyer)
                              ? "Deal in Progress"
                              : isDealRejected
                                ? "Deal Rejected"
                                : isDealClosed 
                                  ? "Deal Closed" 
                                  : "Close Deal"}
                      </Button>
                    )}
                    {/* <LayoutGrid className='w-5 h-5 text-gray-600' /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 chat-messages-container">
        {isSelfChat ? (
          <div className="text-center text-red-500 font-semibold">
            Cannot sent messages to yourself. Buyer and seller must be different users.
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine = message.senderId === userId && message.senderType === userType;
            
            // Helper function to format date
            const getDateLabel = (timestamp: string | Date) => {
              const messageDate = new Date(timestamp);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              // Reset time to compare dates only
              const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
              const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const yesterdayDateOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
              
              if (messageDateOnly.getTime() === todayDateOnly.getTime()) {
                return 'Today';
              } else if (messageDateOnly.getTime() === yesterdayDateOnly.getTime()) {
                return 'Yesterday';
              } else {
                return messageDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                });
              }
            };
            
            // Check if we need to show date separator
            const showDateSeparator = index === 0 || (
              message.timestamp && messages[index - 1]?.timestamp &&
              new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString()
            );
            
            return (
              <React.Fragment key={message.id}>
                {/* Date Separator */}
                {showDateSeparator && (message.timestamp || message.time) && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {message.timestamp ? getDateLabel(message.timestamp) : getDateLabel(new Date())}
                    </div>
                  </div>
                )}
                
                <div
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 ${
                      isMine
                        ? 'bg-gray-500 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg'
                        : 'bg-gray-600 text-white rounded-tr-lg rounded-bl-lg rounded-br-lg'
                    }`}
                  >
                    {/* Display attachment if present */}
                    {message.attachment && message.attachment.url && message.attachment.type && (
                      <div className="mb-2">
                        {message.attachment.type === 'image' ? (
                          <img 
                            src={message.attachment.url} 
                            alt={message.attachment.fileName}
                            className="max-w-full h-auto rounded-md cursor-pointer  w-32"
                            onClick={() => window.open(message.attachment.url, '_blank')}
                          />
                        ) : (
                          <a 
                            href={message.attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">{message.attachment.fileName}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {message.text && <p className="text-sm">{message.text}</p>}
                  </div>
                <span className="text-xs text-muted-foreground mt-1">
                {message.timestamp ? (
                  <>
                    {/* ({new Date(message.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })})
                    {" • "} */}
                    {new Date(message.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </>
                ) : message.time ? (
                  new Date(`1970-01-01T${message.time}`).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                ) : ""}
              </span>

                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-chat-border bg-background">
        {/* Attachment Preview */}
        {(selectedFile || uploadedAttachment) && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {attachmentPreview ? (
                  <img src={attachmentPreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : ''}
                  </p>
                  {isUploading && <p className="text-xs text-orange-500">Uploading...</p>}
                  {uploadedAttachment && !isUploading && <p className="text-xs text-green-500">Ready to send</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAttachment}
                disabled={isUploading}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-5">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isUploading && handleSendMessage()}
              className="h-12 px-5 bg-white rounded-full text-sm placeholder:text-muted-foreground tracking-wide focus-visible:ring-1 focus-visible:ring-orange-500 border border-gray-300"
              disabled={isSelfChat || isUploading}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div 
            className={`p-2 rounded-full border-2 border-gray-500 ${
              isSelfChat || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'
            }`}
            onClick={() => !isSelfChat && !isUploading && fileInputRef.current?.click()}
          >
            <Paperclip className='w-4 h-4 text-gray-700'/>
          </div>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="cursor-pointer w-12"
            disabled={isSelfChat || isUploading || (!messageText.trim() && !uploadedAttachment)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </div>
      {/* Rating Popup */}
      <RatingPopup
        open={showRatingPopup}
        setOpen={setShowRatingPopup}
        chatId={lastClosedChatId || selectedContact?._id || ""}
        onSubmit={handleSubmitRating}
        loading={ratingLoading}
      />
      
      {/* Approval Popup */}
      <ApprovalPopup 
        open={showApprovalPopup}
        setOpen={setShowApprovalPopup}
        dealId={closedDealId || ""}
        budget={finalBudget}
        partnerName={selectedContact?.name || "Buyer"}
        onAction={handleDealApproval}
        loading={approvalLoading}
      />
    </>
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
  let mergeQuoteMessage = location.state.message

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
  const [temporaryChats, setTemporaryChats] = useState<any[]>([]);
  // Subscribe to Zustand chat store so socket-driven recent_chat_update updates UI
  useEffect(() => {
    // subscribe(listener) where listener receives the whole state
    const unsub = useChatStore.subscribe((state) => {
      console.log(state.recentChats,234324)
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
    
    // Calculate userType locally for initialization logic to avoid dependency loop
    const initUserType = (currentUserId === buyerId) ? 'buyer' : 'seller';

    setIsLoadingChats(true);
    chatService.getRecentChats(currentUserId, (data) => {
      
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
            _id: chat._id,
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
            chatrating: chat.chatrating, // Add chatrating
          };
        });
        

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
            setSelectedContact(matchingChat);
          } else {
            // No matching recent chat - create new contact for this conversation
            console.log("No matching recent chat, creating new conversation");
            // Ensure correct assignment of buyerId and sellerId based on userType
            let finalBuyerId = buyerId;
            let finalSellerId = sellerId;
            if (initUserType === 'buyer') {
              finalBuyerId = currentUserId;
            } else if (initUserType === 'seller') {
              finalSellerId = currentUserId;
            }
            // Prevent both IDs from being the same
            if (finalBuyerId === finalSellerId) {
              console.error("Cannot create chat: buyerId and sellerId are the same!", { finalBuyerId, finalSellerId });
              return;
            }
            // Use passed name/avatar if available, otherwise fallback
            const passedName = location.state?.partnerName;
            const passedAvatar = location.state?.partnerAvatar;

            const newContact = {
              roomId: chatService.generateRoomId(productId, buyerId, sellerId),
              productId,
              sellerId: sellerId,
              buyerId: buyerId,
              name: passedName || (initUserType === 'buyer' ? 'Seller' : 'Buyer'),
              avatar: passedAvatar || '',
              isOnline: true,
              lastMessage: null,
              buyerUnreadCount: 0,
              sellerUnreadCount: 0,
              productName: 'Product Discussion',
              userType: initUserType,
            };
            
            // Do NOT add to recent chats yet (prevent empty chat creation)
            // Just select it so user can see header and type message
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
          if (initUserType === 'buyer') {
            finalBuyerId = currentUserId;
          } else if (initUserType === 'seller') {
            finalSellerId = currentUserId;
          }
           // Prevent both IDs from being the same
           if (finalBuyerId === finalSellerId) {
            console.error("Cannot create chat: buyerId and sellerId are the same!", { finalBuyerId, finalSellerId });
            return;
          }
          // Use passed name/avatar if available
          const passedName = location.state?.partnerName;
          const passedAvatar = location.state?.partnerAvatar;

          const newContact = {
            roomId: chatService.generateRoomId(productId, buyerId, sellerId),
            productId,
            sellerId: sellerId,
            buyerId: buyerId,
            name: passedName || (userType === 'buyer' ? 'Seller' : 'Buyer'),
            avatar: passedAvatar || '',
            isOnline: true,
            lastMessage: null,
            messageCount: 0,
            buyerUnreadCount: 0,
            sellerUnreadCount: 0,
            productName: 'Product Discussion',
            userType: initUserType,
          };
          
          // Do NOT add to recentChats store yet
          setSelectedContact(newContact);
        }
      }
      
      setIsLoadingChats(false);
    });
  }, [currentUserId, productId, sellerId, buyerId]);

  // Step 3: Set up message listeners
  useEffect(() => {
    if (!currentUserId) return;

    const chatService = ChatService.getInstance();
    chatService.connect();

    const handleReceiveMessage = (data: any) => {
      console.log('Received message in Chatbot:', data);
    
      let roomIdFromData = data.roomId;
      if (!roomIdFromData && data.productId && data.buyerId && data.sellerId) {
         roomIdFromData = chatService.generateRoomId(data.productId, data.buyerId, data.sellerId);
      }
      
      console.log('Processed roomId:', roomIdFromData);

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
        console.log('Updating messages state for current room');
        setMessages((prev) => {
          // Check for optimistic message to replace
          const optimisticIndex = prev.findIndex(msg => 
            msg.isOptimistic && 
            msg.text === data.message && 
            msg.senderId === data.senderId &&
            msg.senderType === data.senderType
          );

          if (optimisticIndex !== -1) {
             const newMessages = [...prev];
             newMessages[optimisticIndex] = {
               ...newMessages[optimisticIndex],
               id: data.id || newMessages[optimisticIndex].id,
               time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : newMessages[optimisticIndex].time,
               isOptimistic: false, // Clear flag
             };
             return newMessages;
          }

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
              attachment: data.attachment || null,
            },
          ];
        });
      } else {
         console.log('Message not for current room:', { roomIdFromData, selectedRoomId: selectedContact?.roomId });
      }
    
      // Show notification if message is not from current chat
      if (!selectedContact || roomIdFromData !== selectedContact.roomId) {
        toast.info(`New message from ${data.senderType}`, {
          description: data.message,
          duration: 3000,
        });
      }
       setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
    };

    const handleLastMessageUpdate = (data: any) => {
      if (data && data.lastMessage) {
        let roomIdFromData = data.roomId;
        if (!roomIdFromData && data.productId && data.buyerId && data.sellerId) {
            roomIdFromData = chatService.generateRoomId(data.productId, data.buyerId, data.sellerId);
        }
        setRecentChats((prev) =>
          prev.map((chat) =>
            chat.roomId === roomIdFromData
              ? { ...chat, lastMessage: data.lastMessage }
              : chat
          )
        );
      }
    };

    // Handler for deal_closed event from backend
    const handleDealClosed = (data: any) => {
      console.log("Chatbot received deal_closed:", data);
      
      const { productId: closedProductId, buyerId: closedBuyerId, sellerId: closedSellerId, closedDeal, finalBudget } = data;
      
      // Generate roomId for the closed deal
      const closedRoomId = chatService.generateRoomId(closedProductId, closedBuyerId, closedSellerId);
      
      // Update the recentChats to mark this chat as deal closed
      setRecentChats((prev) =>
        prev.map((chat) => {
          if (chat.roomId === closedRoomId) {
            return { ...chat, isDealClosed: true, closedDeal };
          }
          return chat;
        })
      );
      
      // Show toast notification to inform the user
      const closedAt = closedDeal?.closedAt ? new Date(closedDeal.closedAt).toLocaleString() : 'just now';
      toast.success(`Deal closed!`, {
        description: `Final budget: ₹${finalBudget}. Closed at ${closedAt}`,
        duration: 5000,
      });
      
      // If current chat is the one that was closed, update selectedContact
      if (selectedContact && selectedContact.roomId === closedRoomId) {
        setSelectedContact((prev: any) => ({ ...prev, isDealClosed: true, closedDeal }));
      }
    };

    // Unified handler for recent_chat_update
    const handleRecentChatUpdate = (data: any) => {
        console.log("Chatbot received recent_chat_update:", data);
        
        let roomIdFromData = data.roomId;
        if (!roomIdFromData && data.productId && data.buyerId && data.sellerId) {
            roomIdFromData = chatService.generateRoomId(data.productId, data.buyerId, data.sellerId);
        }

        // If this update matches the current room, try to append the lastMessage
        if (selectedContact && roomIdFromData === selectedContact.roomId && data.lastMessage) {
            console.log("Updating messages from recent_chat_update");
            setMessages((prev) => {
                const msg = data.lastMessage;
                
                // Check for optimistic message to replace
                const optimisticIndex = prev.findIndex(m => 
                    m.isOptimistic && 
                    m.text === msg.message && 
                    m.senderId === msg.senderId &&
                    m.senderType === msg.senderType
                );

                if (optimisticIndex !== -1) {
                    const newMessages = [...prev];
                    newMessages[optimisticIndex] = {
                        ...newMessages[optimisticIndex],
                        id: msg._id || newMessages[optimisticIndex].id,
                        time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : newMessages[optimisticIndex].time,
                        isOptimistic: false,
                    };
                    return newMessages;
                }

                // Check if message already exists
                const exists = prev.some((m) => 
                   (m.id && msg._id && m.id === msg._id) ||
                   (m.text === msg.message && m.senderId === msg.senderId && m.time === (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""))
                );
                
                if (exists) return prev;
                
                return [...prev, {
                    id: msg._id || Date.now().toString() + Math.random(),
                    text: msg.message,
                    senderId: msg.senderId,
                    senderType: msg.senderType,
                    time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
                    attachment: msg.attachment || null,
                }];
            });
        }
        
        // Also update the sidebar list (reusing logic implicitly by just calling setRecentChats if needed, 
        // but recent_chat_update usually updates the store which updates recentChats via subscription.
        // However, we might want to ensure it updates locally immediately too check handleLastMessageUpdate redundancy).
        // Actually, handleLastMessageUpdate logic is similar. let's keep it separate or merge?
        // The store subscription in line 508 handles the list update usually.
        // But let's be safe and allow this to update recentChats too if the store didn't yet.
        // (Optional: depending on if store update is fast enough).
    };

    // Handler for chat_rating_notification event from backend
    const handleChatRating = (data: any) => {
      console.log("Chatbot received chat_rating_notification:", data);
      
      const { chatId, roomId, rating, ratedBy, raterName, message } = data;
      
      // Update the recentChats to reflect the new rating
      setRecentChats((prev) =>
        prev.map((chat) => {
          if (chat._id === chatId || chat.roomId === roomId) {
            return { ...chat, chatrating: rating };
          }
          return chat;
        })
      );
      
      // If current chat is the one that was rated, update selectedContact
      if (selectedContact && (selectedContact._id === chatId || selectedContact.roomId === roomId)) {
        setSelectedContact((prev: any) => ({ ...prev, chatrating: rating }));
      }
      
      // Show toast notification only to the other party
      // if (currentUserId && ratedBy && currentUserId !== ratedBy) {
      //   toast.info(`Rating Update`, {
      //     description: message || `${raterName} rated this chat ${rating} stars`,
      //     duration: 4000,
      //   });
      // }
    };



    if (chatService.socket) {
      chatService.socket.on("receive_message", handleReceiveMessage);
      chatService.socket.on("chat_last_message_update", handleLastMessageUpdate);
      chatService.socket.on("recent_chat_update", handleRecentChatUpdate);
      chatService.socket.on("deal_closed", handleDealClosed);
      chatService.socket.on("chat_rating_notification", handleChatRating); 
    }

    return () => {
      if (chatService.socket) {
        chatService.socket.off("receive_message", handleReceiveMessage);
        chatService.socket.off("chat_last_message_update", handleLastMessageUpdate);
        chatService.socket.off("recent_chat_update", handleRecentChatUpdate);
        chatService.socket.off("deal_closed", handleDealClosed);
        chatService.socket.off("chat_rating_notification", handleChatRating);
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
    setRecentChats((prev) => {
      const index = prev.findIndex((chat) => chat.roomId === roomId);
      if (index !== -1) {
         // Chat exists, update it
         const updatedChats = [...prev];
         updatedChats[index] = updater(updatedChats[index]);
         // Sync with store (wrapped in setTimeout to avoid render-phase update)
         setTimeout(() => {
           try { useChatStore.getState().setRecentChats(updatedChats); } catch (e) { }
         }, 0);
         return updatedChats;
      } else {
         // Chat does not exist in list (newly created)
         if (selectedContact && selectedContact.roomId === roomId) {
             console.log("Adding new chat to sidebar list:", roomId);
             const newChat = updater(selectedContact);
             const updatedChats = [newChat, ...prev];
             setTimeout(() => {
               try { useChatStore.getState().setRecentChats(updatedChats); } catch (e) { }
             }, 0);
             return updatedChats;
         }
         return prev;
      }
    });
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
    <div className="w-full max-w-7xl mx-auto px-4 mb-5">
      <div className="h-[calc(100vh-100px)] border-chat-border rounded-lg overflow-hidden mt-5">
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
          <div className="flex-1 flex flex-col min-h-0">
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
                setSelectedContact={setSelectedContact}
                isOnline={(() => {
                  const { isUserOnline } = useChatStore.getState();
                  const otherPersonId = userType === 'buyer' ? selectedContact.sellerId : selectedContact.buyerId;
                  return isUserOnline(otherPersonId);
                })()}
                mergeQuoteMessage={mergeQuoteMessage}
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
