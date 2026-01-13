
// Notification.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components/ui/button';
import { ListFilter } from 'lucide-react';
import RequirementService from '../../services/requirement.service';
import { sortByDate } from '@/helper/sortByDate';


interface BidNotification {
  id?: string;
  requirementId?: string;
  productId?: string;
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
  date?: string;
  [key: string]: any;
}

const Notification = () => {
  const [notifications, setNotifications] = useState<BidNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const[_,setIsAscSorting] = useState(false) 
  useEffect(() => {
    setLoading(true);
    RequirementService.getBidNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, []);


    const handleSorting = () => {
    setIsAscSorting((prev:boolean) => {
      const isAsc = !prev;
        setNotifications((prevState: any) => {
        if (!Array.isArray(prevState)) return prevState;
        const sorted = sortByDate(prevState, isAsc,'bidDate');
        return sorted
      });
      return isAsc
    });
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
        <div className="text-center text-gray-500">No notifications found.</div>
      )}
      {!loading && !error && notifications?.flatMap((notif, idx) => {
        // Capitalize first letter of product title
        const productTitle =
          notif.product?.title
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
              notif.productId
                ? notif.productId
                : notif.product && (notif.product as { _id?: string })._id
                  ? (notif.product as { _id: string })._id
                  : '';

            return (
              <div key={`${notif.requirementId}-${bidIdx}`}>
                <div className={`p-4 grid ${bidIdx % 2 === 0 ? 'bg-orange-100/50' : 'bg-transparent'} rounded-md space-y-2`}>
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
          notif.productId
            ? notif.productId
            : notif.product && (notif.product as { _id?: string })._id
              ? (notif.product as { _id: string })._id
              : '';

        return (
          <div key={notif.requirementId}>
            <div className={`p-4 grid ${idx % 2 === 0 ? 'bg-orange-100/50' : 'bg-transparent'} rounded-md space-y-2`}>
              <div className='grid grid-cols-3 items-center gap-5'>
                <p className='text-md font-bold text-gray-800 capitalize col-span-2'>
                  New Quote Received
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
      })}
    </div>
  );
}

export default Notification
