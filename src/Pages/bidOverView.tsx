import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Banknote, CalendarDays, Camera, House, List, MapPin, User, UserRound } from 'lucide-react';
import { Avatar, AvatarImage } from "@/Components/ui/avatar";

import { Button } from "@/Components/ui/button";
import { CategoryFormSkeleton, SkeletonTable } from "@/const/CustomSkeletons";
import TableListing from "@/Components/TableLisiting";
import type { ColumnDef } from "@tanstack/react-table";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { useFetch } from "@/helper/use-fetch";
import bidService from "@/services/bid.service";
import { useEffect, useRef, useState } from "react";
import { dateFormatter } from "@/helper/dateFormatter";
import { mergeName } from "@/helper/mergeName";
import { currencyConvertor } from "@/helper/currencyConvertor";
import { Skeleton } from "@/Components/ui/skeleton";
const BidOverview = () => {
  const {bidId} = useParams();
  const {fn:bidFn,data:bidRes,loading} = useFetch(bidService.getBidById)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total,setTotal] = useState(0)
  const [sellers,setSellers] = useState<any>([])
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState<string>('');
  let intervalRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(()=>{
    
    bidFn(bidId,limit,page)
  },[bidId,limit,page])

const bidsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "avatar",
    header: "",
    cell: ({row}) => {
      return <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
        <Avatar className="w-10 h-10 flex justify-center items-center rounded-full">
          <AvatarImage src={row.original?.avatar} alt="@shadcn" className="h-full w-full rounded-full" />
          <AvatarFallback>{
            'SS'
            // fallBackName(row.original?.bid_to)
          }</AvatarFallback>
        </Avatar>

      </div>
    }
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "bid_by",
    header: "Bid By",
  },
 
  {
    accessorKey: "budget",
    header: "Budget",
  },
{
    accessorKey: "bid_budget",
    header: "Bid Budget",
  },

];

console.log(bidRes,123)
useEffect(()=>{
  if(bidRes){
      const {totalSellers: totalCount, limit: pageLimit,page } = bidRes;
       const budget = bidRes?.product?.minimumBudget|| 0;
       const mappedSellers = bidRes?.sellers?.map((item: any) => ({
      id: item?._id,
      avatar: item?.seller?.profileImage,
      date: dateFormatter(item?.createdAt),
      bid_by: mergeName(item?.seller),
      budget: currencyConvertor(budget),
      bid_budget: currencyConvertor(item?.budgetQuation),
    })) || [];
    setSellers(mappedSellers);
      setTotal(totalCount)
      setLimit(pageLimit)
      setPage(page)
  } 
},[bidRes])

useEffect(() => {
  if (!bidRes?.createdAt || !bidRes?.product?.bidActiveDuration) return;

  const createdAt = new Date(bidRes.createdAt).getTime();
  const durationDays = Number(bidRes.product.bidActiveDuration); 
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
}, [bidRes?.createdAt, bidRes?.product?.bidActiveDuration]);



  return (
    <>
    {
      loading ? <div className="w-full max-w-7xl mx-auto py-6 space-y-6 px-4"> <CategoryFormSkeleton></CategoryFormSkeleton></div> :<div className="w-full max-w-7xl mx-auto py-6 space-y-6 px-4">
      {/* Breadcrumb */}
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem className="flex items-center gap-2 cursor-pointer" onClick={()=>navigate(-1)}>
            <BreadcrumbPage className="capitalize font-regular text-gray-500"><House className="w-5 h-5" /></BreadcrumbPage>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="capitalize font-regular text-gray-500">Bid Overview</BreadcrumbPage>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="capitalize font-regular text-orange-600 font-semibold">{bidRes?.product?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8">
        <div className="grid gap-8 md:grid-cols-[270px_1fr]">
          {/* Sidebar */}
          <div className="hidden md:block space-y-2 bg-gray-200/50 p-4 rounded-md sticky max-h-fit">
            <div className='flex justify-center items-center mt-2 mb-12 relative'>
              <div className='relative'>
                <Avatar className='w-28 h-28 border-gray-600 border-3 flex '>
                  
                  
                      <AvatarImage src={bidRes?.product?.image|| '/no-image.webp'} className="w-full h-full object-contain rounded-full" />
                  

                  {/* {
                  !updateProfileLoading && user?.profileImage && <AvatarFallback>{fallBackName(`${user?.firstName} ${user?.lastName}`)}</AvatarFallback>
                } */}
                </Avatar>
                {/* <input type="file" name="image" hidden id="" ref={avatarRef} onChange={handleUpdateProfile} /> */}
                {/* <button
                  // disabled={updateProfileLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    // if(avatarRef){
                    //   avatarRef.current?.click()
                    // }
                  }} className="absolute bottom-4 cursor-pointer right-0 bg-gray-500 p-1 rounded-full shadow-md hover:bg-gray-400">
                  <Camera className='w-4 h-4 text-white' />
                </button> */}
              </div>
            </div>

            <div className="grid gap-1 text-gray-600 px-3 space-y-3 ">
              <p className="text-left    text-sm rounded-md  text-gray-600 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
</svg>
                <span>{mergeName(bidRes?.buyer)}</span>
              </p>
              <p className="text-left   text-sm rounded-md  text-gray-600 flex items-center gap-2  ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
</svg>
                <span className="">{bidRes?.buyer?.currentLocation}</span>
              </p>
              <p className="text-left text-sm rounded-md  text-gray-600 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
  <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
</svg>
                <span>{bidRes?.product?.quantity} units</span>
              </p>
              
              <p className="text-left  text-sm rounded-md  text-gray-600 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Delivery By: <span className="font-semibold pl-1">{dateFormatter(bidRes?.product?.paymentAndDelivery?.ex_deliveryDate) || 'N/A'}</span></span>
              </p>

              <p className="text-left  text-sm rounded-md  text-gray-600 flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                <span>Budget: <span className="font-semibold pl-1">{bidRes?.product?.minimumBudget ? 'Rs '+ currencyConvertor(bidRes?.product?.minimumBudget) : 'N/A'}</span></span>
              </p>

            </div>
            {/* <Button variant="ghost" size="lg" className="border w-full mt-5 shadow-orange-500 border-orange-600 text-orange-600 rounded-[5px]  hover:bg-orange-500 hover:text-white cursor-pointer transition-all duration-300 ease-in-out underline-0">
              Add To Cart
            </Button> */}
          </div>

          {/* Main Content */}
          <div className="space-y-10">
            <section className="">
              <div className="grid space-y-2">
                <h2 className="text-sm font-[500] mb-2">
                  Date: {dateFormatter(bidRes?.createdAt)}
                </h2>
                <div className="flex justify-between items-center gap-10">
                  <h2 className="text-xl font-bold capitalize item-center">
                   {bidRes?.product?.title}
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
                <span className="text-red-500 text-sm font-medium float-end">Expired</span>
              )}

                </div>
                <p className="text-sm text-gray-500 mt-2 ">
                 {bidRes?.product?.description}
                </p>
              </div>
              <div className="mt-10 ">
                 <p className="font-bold text-lg whitespace-nowrap   tracking-tight text-orange-700/90">
            Bids Placed
          </p>
          {/* table */}
          {
             loading ? <SkeletonTable /> : <TableListing 
             data={sellers} 
             columns={bidsColumns} 
             filters={false} 
             colorPalette={'gray'}
                page={page}
                    setPage={setPage}
                    total={total}
                    limit={limit}
                   />
          }
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    }
    </>
  );
};

export default BidOverview;
