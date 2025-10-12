import TableListing from '@/Components/TableLisiting'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/Components/ui/breadcrumb'
import { Button } from '@/Components/ui/button'
import { dateFormatter } from '@/helper/dateFormatter'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import type { ColumnDef } from '@tanstack/react-table'
import { Banknote, CalendarDays, MoveLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const RequirementOverview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const productData = location.state?.products || []
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [bidData, setBidData] = useState<any[]>([])
  const [iterateData, setIterateData] = useState<any[]>([])
console.log(productData,"productData")
  useEffect(() => {
    if (productData && productData.length > 0) {
      const product = productData[0] // Get the first product from array
      setCurrentProduct(product)
      
      // Create array with main product and subProducts (similar to static implementation)
      if (product.product) {
        const allProducts = [
          product.product,
          ...(product.product.subProducts || [])
        ]
        setIterateData(allProducts)
      }
      
      // Transform sellers data into bid table format
      if (product.sellers && product.sellers.length > 0) {
        const transformedBids = product.sellers.map((seller: any) => ({
          avtar: seller.seller?.profileImage || "https://github.com/shubhamsharma20007.png", // Use seller's profile image or default
          date: seller.date ? dateFormatter(seller.date) : (seller.createdAt ? dateFormatter(seller.createdAt) : (product.createdAt ? dateFormatter(product.createdAt) : 'N/A')),
          bid_buy: `${seller.seller?.firstName || ''} ${seller.seller?.lastName || ''}`.trim() || "Anonymous Seller",
          bid_amount: seller.budgetAmount ? `₹${seller.budgetAmount}` : "N/A",
          chat_message: seller.message || "Interested in your requirement",
          action: "chat",
          sellerId: seller.seller?._id || seller._id || seller.userId
        }))
        setBidData(transformedBids)
      }
    }
  }, [productData])
console.log(currentProduct,"curr")
  const handleChatNavigate = (sellerId?: string) => {
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
          sellerId: sellerId
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
              <AvatarImage src={image} alt={name} className='rounded-full' />
              <AvatarFallback className="bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">
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
      header: "Bid By",
    },
    {
      accessorKey: "bid_amount",
      header: "Bid Amount",
    },
    {
      accessorKey: "chat_message",
      header: "Chat Message",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          className="text-sm cursor-pointer text-orange-600 underline"
          variant="link"
          onClick={() => handleChatNavigate(row.original.sellerId)}
        >
          Chat Now
        </Button>
      )
    },
  ]

  if (!currentProduct) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
        <div className="text-center">No product data available</div>
      </div>
    )
  }

  console.log(iterateData,32)

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
              src={ item.image ||"/no-image.webp"}
              alt={item.title || "Product"}
              className="object-contain h-full w-full rounded-lg"
           
            />
          </div>

          {/* Product Info */}
          <div className="lg:col-span-8 p-4 space-y-2">
            <h2 className="text-sm font-medium mb-2">
              Date: {dateFormatter(item.createdAt) || 'N/A'}
            </h2>

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
          title={`Available Bids `}
          target="requirementOverview"
          colorPalette="orange"
        />
      </div>
    </div>
  )
}

export default RequirementOverview