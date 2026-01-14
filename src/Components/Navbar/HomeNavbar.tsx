  import { Bell, Box, CircleUserRound, Gavel, Handshake, MapPin, Menu, MessageCircle, MessageCircleMore, MessageSquareText, Package, SearchIcon, ShoppingCart, UserRound } from "lucide-react";

  import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
  } from "../../Components/ui/accordion";
  import { Button } from "../../Components/ui/button";
  import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "../../Components/ui/sheet";
  import { useDebounce } from 'use-debounce';
  import { Skeleton } from "../ui/skeleton";
  import { toast } from "sonner";
  //Logo and Icons
  import saralBuyLogo from "../../image/Logo/saralBuyLogo.png";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { Input } from "../ui/input";
  import { Card } from "../ui/card";
  import { useFetch } from "@/helper/use-fetch";
  import ProductService from "@/services/product.service";
  import { useEffect, useRef, useState } from "react";
  import { getLocation } from "@/helper/locationAPI";
  import { getUserProfile } from "@/zustand/userProfile";
  // import userService from "@/services/user.service";
  import ChatService from "@/services/chat.service";
  import { useChatStore } from "@/zustand/chatStore";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/Components/ui/popover"

  import { Badge } from "../ui/badge";
  import { format } from "date-fns";
  interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
  }


  const menu: MenuItem[] = [
      {
      title: "Account",
      url: "/account",
      icon: <CircleUserRound className="w-5 h-5"/>
    },
    {
      title: "Messages",
      url: "/chat",
      icon: <MessageCircleMore className="w-5 h-5"/>
    },
      {
      title: "Notifications",
      url: "/account/notification",
      icon: <Bell className="w-5 h-5" />,
    },
      {
      title: "Cart",
      url: "/account/cart",
      icon: <ShoppingCart className="w-5 h-5" />,
    },

  ];


  const accountMenu =[
    {
      title: "Profile",   
      url:"/account/",
      icon:<CircleUserRound className="w-5 h-5"/>
    },
    {
      title:'Cart',
      url:"/account/cart",
      icon:<ShoppingCart className="w-5 h-5" />,
    },
    {
      title:'Biding History',
      url:"/account/bid",
       icon:<Gavel className="w-5 h-5" />,
    },
    {
      title:"Requirements",
      url:"/account/requirements",
       icon:<Package className="w-5 h-5" />,
    },
    {
      title :"Deals",
      url:"/account/deal",
       icon:<Handshake className="w-5 h-5" />,
    },
    {
      title:'Notifications',
      url:'/account/notification',
       icon:<Bell className="w-5 h-5" />,
    }
  ]



  type ProductsType = { title: string, image: string, _id: string, description: string }




  const HomeNavbar = () => {
    const navigate = useNavigate()

    const { user } = getUserProfile();
    // Chat store
    const { recentChats, setRecentChats, markAsRead } = useChatStore();
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const location = useLocation();
    const isChatActive = location.pathname === '/chat' || (typeof window !== 'undefined' && localStorage.getItem('chatbot_active_user') === 'true');
    const unreadChatsCount = isChatActive ? 0 : recentChats
      .filter(chat => chat.lastMessage)
      .reduce((acc, chat) => {
       const isBuyer = chat.buyerId === user?._id;
       const isSeller = chat.sellerId === user?._id;
       const unreadCount = isBuyer ? chat.buyerUnreadCount : (isSeller ? chat.sellerUnreadCount : 0);
       return acc + (unreadCount > 0 ? 1 : 0);
    }, 0);

    // Bid notifications
    const [bidNotifications, setBidNotifications] = useState<any[]>([]);

    // Product notifications
    const [productNotifications, setProductNotifications] = useState<any[]>([]);
    const [showProductNotifDropdown, setShowProductNotifDropdown] = useState(false);
    const { fn, data } = useFetch(ProductService.getSeachProduct)
    const [text, setText] = useState('');
    const [products, setProducts] = useState<ProductsType[]>([]);
    const [value, { isPending, flush }] = useDebounce(text, 500);
    const [currenLocation, setCurrentLocation] = useState('')
    const [showDropdown, setShowDropdown] = useState(false);
    const productsRef = useRef<HTMLDivElement>(null);
    const [openSheet, setOpenSheet] = useState(false);
    // const { fn: updateProfile } = useFetch(userService.updateProfile)
    const handleRaiseAReuirement = () => {
      navigate("/requirement");
      setOpenSheet(false);
    };
    const handleProfileClick = () => {
      navigate("/account");
    };
    const handleInputValue = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setText(value)
    }

    // --- Chat notification logic ---
    useEffect(() => {
      const chatService = ChatService.getInstance();
      chatService.connect();
      
      const fetchRecentChats = () => {
        if (user?._id) {
          chatService.identify(user._id);
          chatService.getBidNotifications(user._id);
          
          // Fetch recent chats to populate store
          chatService.getRecentChats(user._id, (data) => {
            if (data && Array.isArray(data.chats)) {
              // Transform chats to include all necessary fields
              const transformedChats = data.chats.map((chat: any) => ({
                _id: chat._id,
                roomId: chat.roomId,
                productId: chat.product?._id || chat.productId,
                sellerId: chat.seller?._id || chat.sellerId,
                buyerId: chat.buyer?._id || chat.buyerId,
                name: chat.name || (chat.userType === 'buyer' 
                  ? `${chat.seller?.firstName || ''} ${chat.seller?.lastName || ''}`.trim() || 'Seller'
                  : `${chat.buyer?.firstName || ''} ${chat.buyer?.lastName || ''}`.trim() || 'Buyer'),
                avatar: chat.userType === 'buyer' ? chat.seller?.profileImage : chat.buyer?.profileImage,
                lastMessage: chat.lastMessage,
                messageCount: chat.messageCount || 0,
                buyerUnreadCount: chat.buyerUnreadCount || 0,
                sellerUnreadCount: chat.sellerUnreadCount || 0,
                productName: chat.product?.title || 'Product Discussion',
                userType: chat.userType,
                buyer: chat.buyer,
                seller: chat.seller,
              }));
              
              setRecentChats(transformedChats);
            }
          });
        }
      };

      // Initial fetch
      fetchRecentChats();

      // Refetch when page becomes visible (user comes back to tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && user?._id) {
          fetchRecentChats();
        }
      };

      // Refetch when window gains focus
      const handleFocus = () => {
        if (user?._id) {
          fetchRecentChats();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      // We rely on chatService.ts handling 'recent_chat_update' to update the store
      // But we call identify above to ensure socket is ready

      const handleProductNotification = (data: any) => {
        setProductNotifications((prev) => {
          // Remove existing if present to move to top
          const filtered = prev.filter(
            (n) =>
              !(n.productId === data.productId &&
                n.title === data.title &&
                n.description === data.description)
          );
          return [
            {
              productId: data.productId,
              title: data.title,
              description: data.description,
              receivedAt: Date.now(),
            },
            ...filtered,
          ];
        });
      };

      const handleBidNotificationList = (data: any) => {
        setBidNotifications(data);
      };

      const handleNewBid = (data: any) => {
        console.log("socket NEW BID received in Navbar:", data);
        setBidNotifications((prev) => {
          // Only prevent exact duplicate BID IDs (same event received twice)
          // Do NOT block if it's a different bid for the same product
          const isExactDuplicate = prev.some((n) => n.bidId === data.bidId);
          
          if (isExactDuplicate) {
             console.log("Duplicate bidId ignored:", data.bidId);
             return prev;
          }

          // Just add the new notification to the top
          return [
            {
              requirementId: data.requirementId,
              product: { title: data.productTitle, _id: data.productId },
              totalBids: data.totalBids || 1, 
              latestBid: { date: Date.now() },
              allBids: [], 
              ...data
            },
            ...prev,
          ];
        });
      };

      const handleNewMessage = (data: any) => {
        console.log("New Message Notification in Navbar:", data);
        console.log("Available fields:", Object.keys(data));
        
        // Extract senderType and message from lastMessage object
        const senderType = data.lastMessage?.senderType;
        const message = data.lastMessage?.message || 'New message';
        
        console.log("Sender type:", senderType);
        console.log("Message:", message);
        
        // Determine sender's name - check multiple sources
        let senderName = 'User';
        
        // First, try direct fields from notification
        if (data.senderName) {
          senderName = data.senderName;
          console.log("Using senderName:", senderName);
        } else if (senderType === 'buyer' && data.buyerName) {
          senderName = data.buyerName;
          console.log("Using buyerName:", senderName);
        } else if (senderType === 'seller' && data.sellerName) {
          senderName = data.sellerName;
          console.log("Using sellerName:", senderName);
        } 
        // If not found, try to get from recentChats store
        else if (data.roomId) {
          const chat = recentChats.find(c => c.roomId === data.roomId);
          console.log("Found chat in recentChats:", chat);
          if (chat) {
            // Show the sender's name (the person who sent the message)
            if (senderType === 'buyer') {
              // Message is from buyer - show buyer's name
              // Use chat.name if current user is NOT the buyer (meaning chat.name is the buyer's name)
              // Otherwise extract from buyer object
              senderName = chat.buyerId !== user?._id 
                ? chat.name || 'Buyer'
                : (chat.buyer?.firstName || chat.buyer?.lastName 
                    ? `${chat.buyer?.firstName || ''} ${chat.buyer?.lastName || ''}`.trim() 
                    : 'Buyer');
            } else if (senderType === 'seller') {
              // Message is from seller - show seller's name
              // Use chat.name if current user is NOT the seller (meaning chat.name is the seller's name)
              // Otherwise extract from seller object
              senderName = chat.sellerId !== user?._id
                ? chat.name || 'Seller'
                : (chat.seller?.firstName || chat.seller?.lastName
                    ? `${chat.seller?.firstName || ''} ${chat.seller?.lastName || ''}`.trim()
                    : 'Seller');
            }
            console.log("Using name from recentChats:", senderName);
          }
        }
        // Final fallback to senderType
        else if (senderType) {
          senderName = senderType.charAt(0).toUpperCase() + senderType.slice(1);
          console.log("Using senderType fallback:", senderName);
        }
        
        console.log("Final sender name:", senderName);
        
        toast.message(`New message from ${senderName}`, {
           description: message,
           action: {
             label: 'View',
             onClick: () => {
               if (data.productId && data.buyerId && data.sellerId) {
                 localStorage.setItem('chatIds', JSON.stringify({
                   productId: data.productId,
                   buyerId: data.buyerId,
                   sellerId: data.sellerId,
                   roomId: data.roomId,
                 }));
                 navigate('/chat', {
                   state: {
                     productId: data.productId,
                     buyerId: data.buyerId,
                     sellerId: data.sellerId,
                     roomId: data.roomId,
                   }
                 });
               } else {
                 navigate('/chat');
               }
             }
           },
        });
      };

      // Listen for product notifications
      chatService.onProductNotification(handleProductNotification);

      // Listen for bid notifications
      chatService.onBidNotification(handleBidNotificationList);

      // Listen for new bid events (real-time)
      chatService.onNewBid(handleNewBid);

      // Listen for new message notifications
      chatService.onNewMessageNotification(handleNewMessage);

      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('focus', handleFocus);
          chatService.offProductNotification(handleProductNotification);
          chatService.offBidNotification(handleBidNotificationList);
          chatService.offNewBid(handleNewBid);
          chatService.offNewMessageNotification(handleNewMessage);
      };
    }, [user?._id]);
/* Removed effect that clears bid notifications on dropdown open */

console.log(bidNotifications,"bidNotifications")
    // Show/hide chat notification dropdown (do NOT clear notifications here)
    const handleBellClick = () => {
      setShowNotifDropdown((prev) => !prev);
      // Do not clear notifications here; let user see them in dropdown
    };

    // Show/hide product notification dropdown
    // const handleProductBellClick = () => {
    //   setShowProductNotifDropdown((prev) => !prev);
    //   // Do not clear product notifications here; let user see them in dropdown
    // };

    // Remove notification on click and optionally navigate to chat
    // Notification click: navigate to chat with all IDs, then clear notification
    const handleNotificationClick = (notif: any) => {
      // Optimistically mark as read locally
      if (notif.roomId && user?._id) {
          markAsRead(notif.roomId, user._id);
      }
      setShowNotifDropdown(false);

      // Defensive: Try to get all required IDs
      let { productId, buyerId, sellerId, roomId } = notif;

      // Try to infer missing IDs from lastMessage or user context
      if (!buyerId) {
        // Try from lastMessage or current user
        buyerId = notif.lastMessage?.buyerId || (user?.role === "buyer" ? user._id : undefined);
      }
      if (!sellerId) {
        sellerId = notif.lastMessage?.sellerId || (user?.role === "seller" ? user._id : undefined);
      }
      if (!productId) {
        productId = notif.lastMessage?.productId;
      }

      // If any required ID is missing, show alert and do not navigate
      if (!productId || !buyerId || !sellerId) {
        alert("Error: Missing chat parameters. Please try again later or contact support.");
        console.warn("Missing chat parameters", { productId, buyerId, sellerId, notif });
        return;
      }

      // Store IDs in localStorage for Chatbot fallback
      localStorage.setItem('chatIds', JSON.stringify({
        productId,
        buyerId,
        sellerId,
        roomId,
      }));

      // Navigate to chat with state (for immediate use)
      navigate('/chat', {
        state: {
          productId,
          buyerId,
          sellerId,
          roomId,
        }
      });
    };

    async function getGeoLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const location = await getLocation(longitude, latitude)
            setCurrentLocation(location)
            // await updateProfile({ currentLocation: location })


          },
          (err) => console.log(err),
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }



    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key.toLowerCase();
      if (key === 'enter' && value.trim() !== '') {
        setShowDropdown(false);
        setProducts([]);
        setText('');
        flush();
        navigate(`/product-listing?title=${encodeURIComponent(value)}&key=enter`);
      }
    }


    useEffect(() => {
      if (value.trim().length > 1) {
        fn(value);
        setShowDropdown(true);
      } else {
        setProducts([]);
        setShowDropdown(false)
      }
    }, [value]);

    useEffect(() => {
      setProducts(data)
    }, [data])
    useEffect(() => {
      if ((!user?.currenLocation || user?.currenLocation === '') && user) {
        getGeoLocation();
      } else {
        setCurrentLocation(user?.currenLocation)
      }
    }, [user])


    useEffect(() => {
      function handleOutsideClick(event: MouseEvent) {
        if (showDropdown && productsRef.current) {
          if (!productsRef.current.contains(event.target as Node)) {
            setShowDropdown(false);
            setText('');
            setProducts([]);
          }
        }
      }

      window.addEventListener('click', handleOutsideClick);

      return () => {
        window.removeEventListener('click', handleOutsideClick);
      };
    }, [showDropdown, productsRef]);
    return (
    <section className="bg-gray-100">
      <div className="mb-2 relative z-9 max-w-7xl mx-auto">
        <div className="p-3 sticky top-0">
          {/* Desktop Menu */}
          <nav className="hidden justify-evenly lg:flex items-center gap-5 ">
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to={'/'} className="flex items-center gap-2">
                
                <img
                  src={saralBuyLogo}
                  className="max-h-20 mix-blend-darken  dark:invert"
                  alt={'company logo'}
                />
              </Link>
              <div className="flex items-center relative ">
                <MapPin className="w-4 h-4  text-orange-500 rounded-full  absolute top-1/2 left-3  -translate-1/2"></MapPin>
                <Input readOnly placeholder="Location..." className="border-b-[1.5px] bg-transparent pl-6 text-sm border-x-0 border-t-0 shadow-none rounded-none  border-b-black focus-visible:ring-0 focus:outline-0 focus:shadow-none " defaultValue={currenLocation} />
                {/* <NavigationMenu>
                  <NavigationMenuList>
                    {menu.map((item) => renderMenuItem(item))}
                  </NavigationMenuList>
                </NavigationMenu> */}
              </div>
            </div>
            {/* search */}
            <div className="relative w-1/2">
              <Input
                type="text"
                onInput={handleInputValue}
                value={text}
                onKeyPress={handleKeyPress}
                placeholder="Looking For..."
                className="pl-2 shadow-none rounded-sm w-full float-end focus-visible:ring-0 border border-gray-300  focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
              <SearchIcon className="absolute right-2.5 top-2.5 h-4 w-4 pointer-events-none opacity-50" />

              {/* Search Dropdown */}
              {showDropdown && (
                <div
                  ref={productsRef}
                  className="absolute right-0  w-full top-full mt-2 z-[99] max-h-[300px]  overflow-y-auto bg-white rounded-lg shadow-lg p-2 space-y-2">
                  {isPending() ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-md w-full" />
                    ))
                  ) : products?.length > 0 ? (
                    products.map((p: ProductsType) => (
                      <Card
                        key={p._id}
                        className="p-2 rounded-xl shadow-md bg-white cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setShowDropdown(false);
                          setProducts([]);
                          setText('');
                          flush();
                          navigate(`/product-listing?_id=${encodeURIComponent(p._id)}&title=${encodeURIComponent(p.title)}`);
                        }}

                      >
                        <div className="flex gap-4">
                          <img
                            className="w-14 h-14 object-contain rounded-lg mix-blend-darken"
                            src={p.image || '/no-image.webp'}
                            alt={p.title}
                          />
                          <div className="flex-1">
                            <p className="text-md font-semibold text-orange-600 ">{p.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-2 text-center">No results found.</p>
                  )}
                </div>
              )}
            </div>


            <div className="flex gap-5 items-center space-x-1">
            
  {/*  messaging */}
             {
              user &&  <Popover
                open={showNotifDropdown}
                onOpenChange={setShowNotifDropdown}
              >
                <PopoverTrigger>
                    <div
                      className="cursor-pointer relative  bg-transparent border-0 shadow-none"
                      onClick={() => {
                         // If no chats, navigate to chat page anyway
                         if (recentChats.length === 0) {
                            navigate('/chat');
                         } else {
                            handleBellClick();
                         }
                      }}
                    >
                      <MessageSquareText className="w-5 h-5 text-gray-600" />
                      {unreadChatsCount > 0 && (
                        <Badge
                          className="h-5 min-w-5 text-xs rounded-full px-1.5 py-0.5 flex items-center justify-center absolute -top-2 -right-2 shadow-md"
                          variant="destructive"
                        >
                          {unreadChatsCount}
                        </Badge>
                      )}
                    </div>
                </PopoverTrigger>

              <PopoverContent className="mt-2 w-80  empty:p-0 p-0 rounded-xl shadow-lg border border-gray-200 bg-white">
      {showNotifDropdown && (
      <>
        {recentChats.filter(chat => chat.lastMessage).length === 0 ? (
          <p className="text-sm text-center text-gray-500 py-4">
            No active conversations
          </p>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto overflow-x-hidden custom-scrollbar w-full grid space-y-1 p-2">
              {recentChats
                .filter(chat => chat.lastMessage) // Only show chats with messages
                .sort((a, b) => {
                  // Sort by last message timestamp (latest first)
                  const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                  const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                  return timeB - timeA; // Descending order (latest first)
                })
                .slice(0, 5) // Show only the latest 5 chats
                .map((chat, idx) => {
                 // Determine visual urgency if unread
                 const isBuyer = chat.buyerId === user?._id;
                 const isSeller = chat.sellerId === user?._id;
                 const unreadCount = isBuyer ? chat.buyerUnreadCount : (isSeller ? chat.sellerUnreadCount : 0);
                 const isUnread = unreadCount > 0;

                 return (
                <div
                  key={idx}
                  onClick={() => handleNotificationClick(chat)}
                  className={`flex w-full items-center gap-3 p-2 rounded-lg transition cursor-pointer ${isUnread ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="bg-orange-500 p-2 rounded-full text-white flex items-center justify-center shadow-sm flex-shrink-0 relative">
                    <MessageCircle className="w-4 h-4 " />
                    {isUnread && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-md mb-1 flex justify-between">
                      <span>{(() => {
                          if (chat.name) return chat.name;
                          // Fallback derivation
                          const isBuyer = chat.buyerId === user?._id;
                          const partner = isBuyer ? chat.seller : chat.buyer;
                          if (partner?.firstName || partner?.lastName) {
                              return `${partner.firstName || ''} ${partner.lastName || ''}`.trim();
                          }
                          return isBuyer ? "Seller" : "Buyer";
                      })()}</span>
                      {isUnread && <span className="text-xs bg-red-100 text-red-600 px-1.5 rounded-full">{unreadCount}</span>}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm flex-1 min-w-0 truncate ${isUnread ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                        {chat.lastMessage?.message || "Attachment"}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {chat.lastMessage?.timestamp
                          ? format(new Date(chat.lastMessage.timestamp), "hh:mm a").toLowerCase()
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
            
            {/* View All Button */}
            {recentChats.filter(chat => chat.lastMessage).length > 5 && (
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate('/chat');
                  }}
                  className="w-full text-center text-sm font-medium text-orange-600 hover:text-orange-700 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  View All Chats
                </button>
              </div>
            )}
          </>
        )}
      </>
    )}
  </PopoverContent>
              </Popover>
             }



  {/*  product + bid notification */}

  <Popover open={showProductNotifDropdown} onOpenChange={setShowProductNotifDropdown}>
    <PopoverTrigger>
      <div
      
        className="cursor-pointer relative  bg-transparent border-0 shadow-none"
      >
        <Bell className="w-5 h-5 text-gray-600 " />
        {(productNotifications.length > 0 || bidNotifications.length > 0) && (
          <Badge
            className="h-5 min-w-5 text-xs rounded-full px-1.5 py-0.5 flex items-center justify-center absolute -top-2 -right-2 shadow-md"
            variant="destructive"
          >
            {productNotifications.length + bidNotifications.length}
          </Badge>
        )}
      </div>
    </PopoverTrigger>

    <PopoverContent className="mt-2 w-80 p-2 rounded-xl shadow-lg border border-gray-200 bg-white empty:p-0">
      {productNotifications.length === 0 && bidNotifications.length === 0 ? (
        <p className="text-sm text-center text-gray-500 py-4">
          No new notifications
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {/* Bid Notifications */}
          {bidNotifications.length > 0 &&
  bidNotifications.map((notif, idx) => (
    <div
      key={`bid-${idx}`}
      onClick={() => {
        setBidNotifications((prev) => prev.filter((_, i) => i !== idx));
        if (notif.requirementId) {
            navigate(`/account/requirements`);
        }
        setShowProductNotifDropdown(false);
      }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer border-b last:border-b-0"
    >
      <div className="bg-orange-500 p-2 rounded-full text-white flex-shrink-0">
        <Gavel className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          {notif.product?.title || "New Quote"}
        </p>

        <p className="text-sm text-gray-600 truncate">
         You have new Quote on your requirement.
        </p>

        {notif.latestBid?.date && (
          <span className="text-xs text-gray-400">
            {format(new Date(notif.latestBid.date), "hh:mm a").toLowerCase()}
          </span>
        )}
      </div>
    </div>
  ))}


          {/* Product Notifications */}
          {productNotifications.map((notif, idx) => (
            <div
              key={`prod-${idx}`}
              onClick={() => {
                // Remove from list
                setProductNotifications((prev) =>
                  prev.filter((_, i) => i !== idx)
                );
                // Navigate
                if (notif.productId) {
                  navigate(
                    `/product-overview?productId=${encodeURIComponent(
                      notif.productId
                    )}`
                  );
                } else {
                  toast.error("Product ID missing in notification.");
                }
                // Close Popover
                setShowProductNotifDropdown(false);
              }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer border-b last:border-b-0"
            >
              <div className="bg-orange-500 p-2 rounded-full text-white flex-shrink-0">
                <Box className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{notif.title}</p>
                <p className="text-sm text-gray-600 truncate">
                  {notif.description}
                </p>
                <span className="text-xs text-gray-400">
                  {notif.receivedAt
                    ? format(new Date(notif.receivedAt), "hh:mm a").toLowerCase()
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PopoverContent>
  </Popover>




              {/* Bell icon for product notifications */}
          

            <div  className="cursor-pointer  bg-transparent border-0 shadow-none"
            onClick={()=>{
              navigate('/account/cart')
            }}
            >
                  <ShoppingCart className="w-5 h-5 text-gray-600 " />
                </div>
  </div>
              <Button onClick={handleRaiseAReuirement} variant="link" size="lg" className="border  shadow-orange-500 border-orange-600 text-orange-600 rounded-[5px] transition-all duration-300 ease-in-out underline hover:bg-orange-500 hover:text-white cursor-pointer">
              Post a requirement
              </Button>
              <Button onClick={handleProfileClick} size="icon" className="cursor-pointer bc">
                <UserRound className="w-5 h-5" />
              </Button>
          
          </nav>

          {/* Mobile Menu */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between ">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <img
                  src={saralBuyLogo}
                  className="max-h-14 dark:invert"
                  alt={'company logo'}
                />
              </Link>

              {/* search */}
            <div className="relative w-1/2">
              <Input
                type="text"
                onInput={handleInputValue}
                value={text}
                onKeyPress={handleKeyPress}
                placeholder="Looking For..."
                className="pl-2 shadow-none rounded-sm w-full float-end focus-visible:ring-0 border border-gray-300  focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
              <SearchIcon className="absolute right-2.5 top-2.5 h-4 w-4 pointer-events-none opacity-50" />

              {/* Search Dropdown */}
              {showDropdown && (
                <div
                  ref={productsRef}
                  className="absolute right-0 w-[300px]  sm:w-full top-full mt-2 z-[99] max-h-[300px] overflow-y-auto bg-white rounded-lg shadow-lg p-2 space-y-2">
                  {isPending() ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-md w-full" />
                    ))
                  ) : products?.length > 0 ? (
                    products.map((p: ProductsType) => (
                      <Card
                        key={p._id}
                        className="p-2 rounded-xl shadow-md bg-white cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setShowDropdown(false);
                          setProducts([]);
                          setText('');
                          flush();
                          navigate(`/product-listing?_id=${encodeURIComponent(p._id)}&title=${encodeURIComponent(p.title)}`);
                        }}

                      >
                        <div className="flex gap-4">
                          <img
                            className="w-14 h-14 object-contain rounded-lg mix-blend-darken"
                            src={p.image || '/no-image.webp'}
                            alt={p.title}
                          />
                          <div className="flex-1">
                            <p className="text-md font-semibold text-orange-600 ">{p.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-2 text-center">No results found.</p>
                  )}
                </div>
              )}
            </div>
              {/*  for Home.tsx (main sheet) */}
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
              
                <Button variant="outline" size="icon" >
                    <Menu className="size-4" />
                  </Button>
              
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      {/* <Link to="/" className="flex items-center gap-2">
                        <img
                          src={saralBuyLogo}
                          className="max-h-12 dark:invert mix-blend-darken"
                          alt={'company logo'}
                        />
                      </Link> */}
                       <div className="flex items-center relative ">
                <MapPin className="w-4 h-4  text-orange-500 rounded-full  absolute top-1/2 left-3  -translate-1/2"></MapPin>
                <Input readOnly placeholder="Location..." className="border-b-[1.5px] max-w-[85%] bg-transparent pl-6 text-sm border-x-0 border-t-0 shadow-none rounded-none  border-b-black focus-visible:ring-0 focus:outline-0 focus:shadow-none " defaultValue={currenLocation} />
                {/* <NavigationMenu>
                  <NavigationMenuList>
                    {menu.map((item) => renderMenuItem(item))}
                  </NavigationMenuList>
                </NavigationMenu> */}
              </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-1 flex-col gap-3 px-4">
                    {
                      location.pathname.startsWith('/account') ?  <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                       {accountMenu.map((item) => renderMobileMenuItem(item,setOpenSheet,navigate))}
                    </Accordion> :  <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item,setOpenSheet,navigate))}
                    </Accordion> 
                    }
                  

                    <div className="flex flex-col gap-3">

                    </div>
                  </div>
                  <SheetFooter>
                    <Button
                      onClick={handleRaiseAReuirement}
                      variant="link"
                      size="lg"
                      className="border shadow-orange-500 border-orange-500 text-orange-500 transition-all ease-in-out duration-300 hover:bg-orange-500 hover:text-white cursor-pointer"
                    >
                      Post a requirement
                    </Button>

                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </section>
    );
  };




const renderMobileMenuItem = (item: MenuItem, setOpenSheet: any, navigate: any) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
      </AccordionItem>
    );
  }

  return (
    <p
      key={item.title}
      onClick={() => {
        navigate(item.url);
        setOpenSheet(false);
      }}
      className="text-md font-semibold cursor-pointer text-gray-700 flex items-center gap-2"
    >
    {item.icon}
     {item.title}
    </p>
  );
};


  // const SubMenuLink = ({ item }: { item: MenuItem }) => {
  //   return (
  //     <Link
  //       className="hover:bg-muted hover:text-accent-foreground flex select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
  //       to={item.url}
  //     >
  //       <div className="text-foreground">{item.icon}</div>
  //       <div>
  //         <div className="text-sm font-semibold">{item.title}</div>
  //         {item.description && (
  //           <p className="text-muted-foreground text-sm leading-snug">
  //             {item.description}
  //           </p>
  //         )}
  //       </div>
  //     </Link>
  //   );
  // };

  export default HomeNavbar;
