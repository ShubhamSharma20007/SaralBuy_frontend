
// Notification.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components/ui/button';
import { ArrowUpDown, ListFilter, Trash2, Star, FileText, CheckCircle, XCircle, Handshake, Gavel } from 'lucide-react';
import RequirementService from '../../services/requirement.service';
import { sortByDate } from '@/helper/sortByDate';
import AlertPopup from '@/Components/Popup/AlertPopup';


interface BidNotification {
  id?: string;
  requirementId?: string;
  productId?: any;
  product?: {
    title?: string;
    _id?: string;
  };
  latestBid?: {
    seller?: {
      firstName?: string;
      lastName?: string;
    };
    date?: string;
  };
  title?: string;
  message?: string;
  description?: string;
  date?: string;
  createdAt?: string;
  seen?: boolean;
  [key: string]: any;
}

const Notification = () => {
  const [notifications, setNotifications] = useState<BidNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const[_,setIsAscSorting] = useState(false)
  const message = {
    title: 'Warning',
    message: 'This action cannot be undone. This will permanently delete your notification.',
  } 
  useEffect(() => {
    setLoading(true);
    RequirementService.getBidNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        error = error?.response?.data?.message || error?.response?.data?.error?.message || error.message as string || error;
            console.log(error)
            if(error === "Token not found"){
                // error = 'Session expired, please login again'
                window.dispatchEvent(new CustomEvent('session-expired'))
            }
        setLoading(false);
      });
  }, []);


    const handleSorting = () => {
    setIsAscSorting((prev:boolean) => {
      const isAsc = !prev;
        setNotifications((prevState: any) => {
        if (!Array.isArray(prevState)) return prevState;
        const sorted = [...prevState].sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return isAsc ? aDate - bDate : bDate - aDate;
        });
        return sorted;
      });
      return isAsc
    });
  };

  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;
    
    setDeleteLoading(true);
    try {
      await RequirementService.deleteNotification(notificationToDelete);
      // Remove the deleted notification from state
      setNotifications(prev => prev.filter(n => n._id !== notificationToDelete));
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError('Failed to delete notification');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  console.log({notifications})
  return (
    <div className='grid space-y-5'>
      <div className={`flex justify-between items-center mb-3`}>
        <p className="font-bold text-xl whitespace-nowrap tracking-tight text-gray-600">
          Notifications
        </p>
        <Button onClick={handleSorting} variant={'ghost'} size={'icon'} className='w-24 flex gap-2 items-center justify-center text-sm font-medium text-gray-700 bg-transparent border-1 hover:bg-transparent cursor-pointer border-gray-700'>
          Date
          <ListFilter className='w-5 h-5' />
        </Button>
      </div>
      {/* notification's */}
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && notifications.length === 0 && (

        <div className="text-center text-gray-500 h-[60vh] flex  justify-center items-center flex-col" >
          <img alt="" className="h-28 w-28" src="/empty-cart.webp"></img>
            <p className='text-gray-500 text-sm'> No notifications found.</p>
          </div>
      )}
      {!loading && !error && notifications?.flatMap((notif, idx) => {
        // Check notification type based on title
        // Check most specific patterns first to avoid misidentification
        const titleLower = notif.title?.toLowerCase() || '';
        const isChatRating = titleLower.includes('rated chat');
        const isDealAccepted = titleLower.includes('deal accepted');
        const isDealRejected = titleLower.includes('deal rejected');
        const isDealRequest = titleLower.includes('close deal request') || titleLower.includes('deal request');
        const isDeal = isDealRequest || isDealAccepted || isDealRejected;
        
        if (isChatRating) {
          // Render chat rating notification
          return (
            <div key={notif._id}>
              <div className={`p-4 grid ${idx % 2 === 0 ? 'bg-orange-100/50' : 'bg-transparent'} rounded-md space-y-2 relative group`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteClick(notif._id || '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className='grid grid-cols-3 items-center gap-5'>
                  <p className='text-md font-bold text-gray-800 capitalize col-span-2 flex items-center gap-2'>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {notif.title}
                  </p>
                </div>
                <div className="grid grid-cols-3 items-center gap-5">
                  <p className="text-sm font-medium text-gray-600 line-clamp-2 col-span-2">
                    {notif.description}
                  </p>
                  <p
                    className="text-sm text-gray-600 col-span-1 text-right underline cursor-pointer"
                    onClick={() => {
                      navigate('/chat');
                    }}
                  >
                    View
                  </p>
                </div>
              </div>
              <div className='border-b-2 pt-2 mx-[0.5px]'></div>
            </div>
          );
        }
        
        if (isDeal) {
          // Render deal notification
          const bgColor = isDealRequest ? 'bg-blue-100/50' : isDealAccepted ? 'bg-green-100/40' : 'bg-red-100/40';
          const iconColor = isDealRequest ? 'text-blue-500' : isDealAccepted ? 'text-green-500' : 'text-red-500';
          const fillColor = isDealRequest ? 'fill-blue-500' : isDealAccepted ? 'fill-green-500' : 'fill-red-500';

          return (
            <div key={notif._id}>
              <div className={`p-4 grid ${idx % 2 === 0 ? 'bg-orange-100/50' : 'bg-transparent'} rounded-md space-y-2 relative group`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteClick(notif._id || '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className='grid grid-cols-3 items-center gap-5'>
                  <p className='text-md font-bold text-gray-800 capitalize col-span-2 flex items-center gap-2'>
                    {isDealRequest && <FileText className={`w-5 h-5 ${iconColor} ${fillColor}`} />}
                    {isDealAccepted && <CheckCircle className={`w-5 h-5 ${iconColor}`} />}
                    {isDealRejected && <XCircle className={`w-5 h-5 ${iconColor}`} />}
                    {notif.title}
                  </p>
                </div>
                <div className="grid grid-cols-3 items-center gap-5">
                  <p className="text-sm font-medium text-gray-600 line-clamp-2 col-span-2">
                    {notif.description}
                  </p>
                  <p
                    className="text-sm text-gray-600 col-span-1 text-right underline cursor-pointer"
                    onClick={() => {
                      navigate('/chat');
                    }}
                  >
                    View
                  </p>
                </div>
              </div>
              <div className='border-b-2 pt-2 mx-[0.5px]'></div>
            </div>
          );
        }
        
        // Capitalize first letter of product title
        const productTitle =
          (notif.productId && typeof notif.productId === 'object' && (notif.productId as any).title)
            ? (notif.productId as any).title.charAt(0).toUpperCase() + (notif.productId as any).title.slice(1)
            : notif.product?.title
            ? notif.product.title.charAt(0).toUpperCase() + notif.product.title.slice(1)
            : 'Product';

        // If there are multiple bids, show each as a separate notification
        if (Array.isArray(notif.allBids) && notif.allBids.length > 0) {
          return notif.allBids.map((bid, bidIdx) => {
            const sellerName =
              bid.seller
                ? `${bid.seller.firstName} ${bid.seller.lastName}`
                : 'Seller';

            const bidDate =
              bid.date
                ? new Date(bid.date).toLocaleDateString()
                : '';

            // For navigation, prefer notif.productId, else notif.product._id
            const productId =
              notif.productId && typeof notif.productId === 'object'
                ? (notif.productId as { _id?: string })._id
                : typeof notif.productId === 'string'
                ? notif.productId
                : notif.product && (notif.product as { _id?: string })._id
                  ? (notif.product as { _id: string })._id
                  : '';

            return (
              <div key={`${notif._id}-${bidIdx}`}>
                <div className={`p-4 grid ${bidIdx % 2 === 0 ? 'bg-orange-100/50' : 'bg-transparent'} rounded-md space-y-2 relative group`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-100 p-1 rounded-md ease-in-out transition-all duration-300 absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-600 cursor-pointer"
                    onClick={() => handleDeleteClick(notif._id || '')}
                  >
                    <Trash2 className=" h-4 w-4  text-red-500 cursor-pointer rounded-full" />
                  </Button>
                  <div className='grid grid-cols-3 items-center gap-5'>
                    <p className='text-md font-bold text-gray-800 capitalize col-span-2'>
                      New Bid Received
                    </p>
                    <p className='text-sm text-orange-500 col-span-1 text-right'>
                      {bidDate}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-5">
                    <p className="text-sm font-medium text-gray-600 line-clamp-1 col-span-2">
                      You have got a new Quote on <span className="font-semibold decoration-red-500">
                        {productTitle}
                      </span> by <span className="font-semibold decoration-red-500">
                        {sellerName}
                      </span>.
                    </p>
                    <p
                      className="text-sm text-gray-600 col-span-1 text-right underline cursor-pointer"
                      onClick={() => {
                        if (productId) {
                          navigate(
                            `/product-overview?productId=${encodeURIComponent(productId)}`
                          );
                        }
                      }}
                    >
                      View
                    </p>
                  </div>
                </div>
                <div className='border-b-2 pt-2 mx-[0.5px]'></div>
              </div>
            );
          });
        }

        // Fallback: show as single notification if no allBids
        const sellerName =
          notif.latestBid?.seller
            ? `${notif.latestBid.seller.firstName} ${notif.latestBid.seller.lastName}`
            : 'Seller';

        const bidDate =
          notif.latestBid?.date
            ? new Date(notif.latestBid.date).toLocaleDateString()
            : '';

        const productId =
          notif.productId && typeof notif.productId === 'object'
            ? (notif.productId as { _id?: string })._id
            : typeof notif.productId === 'string'
            ? notif.productId
            : notif.product && (notif.product as { _id?: string })._id
              ? (notif.product as { _id: string })._id
              : '';

        return (
          <div key={notif._id}>
            <div className={`p-4 grid ${idx % 2 === 0 ? 'bg-orange-100/50' : 'bg-transparent'} rounded-md space-y-2 relative group`}>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-red-100 p-1 rounded-md ease-in-out transition-all duration-300 absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => handleDeleteClick(notif._id || '')}
              >
                <Trash2 className="h-4 w-4  text-red-500 cursor-pointer rounded-full" />
              </Button>
              <div className='grid grid-cols-3 items-center gap-5'>
                <p className='text-md font-bold text-gray-800 capitalize col-span-2 flex items-center gap-2'>
                   {
                    notif.title === 'Deal Closed' ? 
                     <Handshake className="w-5 h-5 text-yellow-500 fill-yellow-500" />: <Gavel className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                   }
                    {notif.title}
                  </p>
  
                <p className='text-sm text-orange-500 col-span-1 text-right'>
                  {bidDate}
                </p>
              </div>
              <div className="grid grid-cols-3 items-center gap-5">
                {
                  notif.title?.match(/Deal Closed/) ?
                  <p className="text-sm font-medium text-gray-600 line-clamp-1 col-span-2">
                    {notif.description}
                  </p>
                  :
                  <p className="text-sm font-medium text-gray-600 line-clamp-1 col-span-2">
                  You have got a new Quote on <span className="font-semibold decoration-red-500">
                    {productTitle}
                  </span> by <span className="font-semibold decoration-red-500">
                    {sellerName}
                  </span>.
                </p>
                }
                <p
                  className="text-sm text-gray-600 col-span-1 text-right underline cursor-pointer"
                  onClick={() => {
                    if (productId) {
                      navigate(
                        `/product-overview?productId=${encodeURIComponent(productId)}`
                      );
                    }
                  }}
                >
                  View
                </p>
              </div>
            </div>
            <div className='border-b-2 pt-2 mx-[0.5px]'></div>
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <AlertPopup
        loading={deleteLoading}
        setOpen={setDeleteDialogOpen}
        open={deleteDialogOpen}
        message={message}
        deleteFunction={handleDeleteConfirm}
      />
    </div>
  );
}

export default Notification
