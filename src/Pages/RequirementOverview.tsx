import TableListing from '@/Components/TableLisiting'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/Components/ui/breadcrumb'
import { Button } from '@/Components/ui/button'
import { dateFormatter } from '@/helper/dateFormatter'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import type { ColumnDef } from '@tanstack/react-table'
import { Banknote, CalendarDays, MoveLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import requirementService from '@/services/requirement.service'
import { Skeleton } from '@/Components/ui/skeleton'
import { CategoryFormSkeleton } from '@/const/CustomSkeletons'

const RequirementOverview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { requirementId } = useParams<{ requirementId: string }>()
  const productData = location.state?.products || []
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [bidData, setBidData] = useState<any[]>([])
  const [iterateData, setIterateData] = useState<any[]>([])
  const [requirementData, setRequirementData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>('');
  let intervalRef = useRef<any|null>(null)


  useEffect(() => {
    const fetchRequirementData = async () => {
      if (requirementId) {
        try {
          const data = await requirementService.getRequirementById(requirementId)
          setRequirementData(data)
          setLoading(false)
        } catch (error) {
          console.error("Error fetching requirement data:", error)
          setLoading(false)
        }
      }
    }

    fetchRequirementData()
  }, [requirementId])

  useEffect(() => {
    if (requirementData) {
      // Use fetched data if available, otherwise fall back to location state
      const dataToUse = requirementData || (productData && productData.length > 0 ? productData[0] : null)

      if (dataToUse) {
        setCurrentProduct(dataToUse)

        // Create array with main product and subProducts
        if (dataToUse.product) {
          const allProducts = [
            dataToUse.product,
            ...(dataToUse.product.subProducts || [])
          ]
          setIterateData(allProducts)
        }

        // Transform sellers data into bid table format
        if (dataToUse.sellers && dataToUse.sellers.length > 0) {
          const transformedBids = dataToUse.sellers.map((seller: any) => ({
            avtar: seller.seller?.profileImage,
            date: seller.date ? dateFormatter(seller.date) : (seller.createdAt ? dateFormatter(seller.createdAt) : (dataToUse.createdAt ? dateFormatter(dataToUse.createdAt) : 'N/A')),
            bid_buy: `${seller.seller?.firstName || ''} ${seller.seller?.lastName || ''}`.trim() || "Anonymous Seller",
            bid_amount: seller.budgetAmount ? `₹${seller.budgetAmount}` : "N/A",
            chat_message: seller.message || "Interested in your requirement",
            action: "chat",
            sellerId: seller.seller?._id || seller._id || seller.userId,
            location: seller.seller?.currentLocation || seller.seller?.address,
            status: seller.seller?.status
          }))
          setBidData(transformedBids)
        }
      }
    }
  }, [requirementData, productData])
  const handleChatNavigate = (sellerId?: string, sellerName?: string, sellerAvatar?: string) => {
    if (currentProduct) {
      localStorage.setItem('chatIds', JSON.stringify({
        productId: currentProduct.product?._id,
        buyerId: currentProduct.buyer?._id,
        sellerId: sellerId
      }))

      navigate('/chat', {
        state: {
          productId: currentProduct.product?._id,
          buyerId: currentProduct.buyer?._id,
          sellerId: sellerId,
          partnerName: sellerName,
          partnerAvatar: sellerAvatar
        }
      })
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "avtar",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const image = row.original.avtar
        const name = row.original.bid_buy || "NA"
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()

        return (
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={image} alt={name} className='rounded-full w-full h-full object-cover' />
              <AvatarFallback className="bg-gray-200 rounded-full flex w-full h-full  items-center justify-center text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )
      }
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "bid_buy",
      header: "Seller",
    },
    {
      accessorKey: "bid_amount",
      header: "Quoted Price",
    },
    // {
    //   accessorKey: "chat_message",
    //   header: "Chat Message",
    // },
    {
      accessorKey: "location",
      header: "Location",
    },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     return (row.original?.status === 'active' ? <Badge className="bg-green-100 text-green-500 rounded-full capitalize px-3 w-20">Active</Badge> : <Badge className="bg-red-100 text-red-500 rounded-full px-2 w-20">Inactive</Badge>)
    //   }
    // },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          className="text-sm cursor-pointer text-orange-600 underline"
          variant="link"
          onClick={() => handleChatNavigate(row.original.sellerId, row.original.bid_buy, row.original.avtar)}
        >
          Chat Now
        </Button>
      )
    },
  ]

  useEffect(() => {
    if (!requirementData?.createdAt || !requirementData?.product?.bidActiveDuration) return;


    const createdAt = new Date(requirementData.createdAt).getTime();
    const durationDays = Number(requirementData.product.bidActiveDuration);
    const expiryTime = createdAt + durationDays * 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    // Initial call
    updateTimer();

    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [requirementData]);

  if (loading) {
    return (
      <CategoryFormSkeleton />
    )
  }

  if (!currentProduct) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
        <div className="text-center">No product data available</div>
      </div>
    )
  }


  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 p-4">
      <Breadcrumb className="sm:block hidden">
        <BreadcrumbList>
          <BreadcrumbItem className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(-1)}>
            <MoveLeft className="h-4 w-4" />
            <BreadcrumbPage className="capitalize font-semibold text-gray-500 text-[15px]">
              Requirement Detail's
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Display all products (main + sub-products) */}
      {iterateData.map((item: any, idx: number) => (
        <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-6  p-4">
          {/* Image */}
          <div className="lg:col-span-4 bg-gray-100 flex justify-center items-center rounded-lg p-4 h-48">
            <img
              src={item.image || "/no-image.webp"}
              alt={item.title || "Product"}
              className="object-contain h-full w-full rounded-lg mix-blend-darken"

            />
          </div>

          {/* Product Info */}
          <div className="lg:col-span-8 p-4 space-y-2">
            <h2 className="text-sm font-medium mb-2">
              Date: {dateFormatter(item.createdAt) || 'N/A'}
            </h2>
            {loading || !timeLeft ? (
              <Skeleton className="h-8 w-24 rounded-full float-end" />
            ) : timeLeft !== 'Expired' ? (
              <Button
                variant="ghost"
                className="float-end border rounded-full hover:bg-orange-700 hover:text-white text-sm bg-orange-700 text-white"
              >
                {timeLeft}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="float-end border rounded-full hover:bg-orange-700 hover:text-white text-sm bg-orange-700 text-white"
              >
                Expired
              </Button>

            )}

            <h2 className="text-xl font-bold capitalize">
              {item.title || 'N/A'}
            </h2>

            <p className="text-sm text-gray-600">
              {item.description || 'No description available'}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 pr-3 border-r-2 py-1">
                <div className='flex gap-1 items-center'>
                  <Banknote className="w-5 h-5" />
                  <span className="capitalize">Quantity:</span>
                </div>
                <span className='font-semibold'>{item.quantity || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className='flex gap-1 items-center'>
                  <CalendarDays className="w-4 h-4" />
                  <span className="capitalize">Delivery By:</span>
                </div>
                <span className='font-semibold'>
                  {item.paymentAndDelivery?.ex_deliveryDate
                    ? dateFormatter(item.paymentAndDelivery.ex_deliveryDate)
                    : 'N/A'}
                </span>
              </div>
            </div>

            {item.brand && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Brand:</span>
                <span className="text-gray-600 capitalize">{item.brand}</span>
              </div>
            )}

            {item.conditionOfProduct && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Condition:</span>
                <span className="text-gray-600 capitalize">{item.conditionOfProduct.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Table Listing */}

      <div className='bg-orange-50 p-4 rounded-md'>
        <TableListing
          data={bidData}
          columns={columns}
          filters={false}
          // (${bidData.length})
          title={`Quote Recevied `}
          target="requirementOverview"
          colorPalette="orange"
        />
      </div>
    </div>
  )
}

export default RequirementOverview