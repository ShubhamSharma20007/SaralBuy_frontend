
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { useNavigate } from "react-router-dom";


import "keen-slider/keen-slider.min.css"


import { SkeletonTable } from '@/const/CustomSkeletons';
import TableListing from '@/Components/TableLisiting';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/Components/ui/button";
import requirementService from "@/services/requirement.service";
import { useFetch } from "@/helper/use-fetch";
import { dateFormatter } from "@/helper/dateFormatter";
import { mergeName } from "@/helper/mergeName";
import { fallBackName } from "@/helper/fallBackName";



const Deal = () => {
  const navigate = useNavigate()
  const columnsCompletedReq: ColumnDef<any>[] = [
    {
      accessorKey: "avtar",
      header: "",
      cell: ({ row }) => {
        return <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
          <Avatar className="w-10 h-10 ">
            <AvatarImage src={row.original.avatar}  className='rounded-full w-full h-full object-cover' />
            <AvatarFallback  className="bg-gray-200 rounded-full flex w-full h-full  items-center justify-center text-sm font-semibold">{fallBackName(row.original.finalized_with)}</AvatarFallback>
          </Avatar>

        </div>
      }
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "finalized_with",
      header: "Awarded To",
    },
    {
      accessorKey: "requirement",
      header: "Requirement",
    },
    // {
    //   accessorKey: "your_budget",
    //   header: "Budget",
    // },
    {
      accessorKey: "final_budget",
      header: "Final Budget",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex items-center gap-2">
          <Button className="text-sm cursor-pointer text-gray-600 underline" variant={"link"} onClick={() => {
            navigate('/product-overview?productId=' + row.original?.productId);
          }}>View</Button>

        </div>
      }
    },
  ];

  const columnsApproveBids: ColumnDef<any>[] = [
    {
      accessorKey: "avtar",
      header: "",
      cell: ({ row }) => {

        return <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 ">
          <Avatar className="w-10 h-10">
            <AvatarImage src={row.original.avatar} alt="@shadcn" className='rounded-full w-full h-full object-cover' />
            <AvatarFallback className="bg-gray-200 rounded-full flex w-full h-full  items-center justify-center text-sm font-semibold">{fallBackName(row.original.bid_to)}</AvatarFallback>
          </Avatar>

        </div>
      }
    },
  {
  accessorKey: "date",
  header: "Date",
  cell: ({ row }) => {
    return (
      <span className="whitespace-nowrap text-sm">
        {row.getValue("date")}
      </span>
    );
  },
},

    {
      accessorKey: "bid_to",
      header: "Buyer",
    },
    {
      accessorKey: "product",
      header: "Product",
    },
    // {
    //   accessorKey: "min_budget",
    //   header: "Min Budget",
    // },
    {
      accessorKey: "your_budget",
      header: "Final Price",
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex items-center gap-2">
          <Button className="text-sm cursor-pointer text-gray-600 underline" variant={"link"} onClick={() => {
            navigate('/product-overview?productId=' + row.original?.productId);
          }}>View</Button>

        </div>
      }
    },
  ];

  const [tab, setTab] = useState('approved_bids')
  const { fn: pendingApprovedFn, data: pendingApprovedData, loading: approvedLoading } = useFetch(requirementService.getApprovedPendingRequirements)
  const { fn: completedApproveFn, data: completedApproveData, loading: completedLoading } = useFetch(requirementService.getCompletedApprovedRequirements)
  const [completeRequirements, setCompleteRequirements] = useState<any>([])
  const [approvedRequirements, setApprovedRequirements] = useState<any>([])
  useEffect(() => {
    if (tab === 'approved_bids') {
      pendingApprovedFn()
    } else {
      completedApproveFn()
    }
  }, [tab])


  useEffect(() => {
    if (completedApproveData?.data) {
      if (completedApproveData.data.length > 0) {
        const formattedData = completedApproveData.data.map((item: any) => ({
          _id: item._id,
          productId: item?.product?._id,
          avatar: item?.product?.image,
          date: dateFormatter(item?.createdAt),
          finalized_with: mergeName(item?.seller),
          requirement: item?.product?.title,
          your_budget: item?.product?.minimumBudget,
          final_budget: item?.finalBudget,
        }))
        setCompleteRequirements(formattedData)
      }
    }
    if (pendingApprovedData?.data) {
      if (pendingApprovedData.data.length > 0) {
        const formattedData = pendingApprovedData.data.map((item: any) => ({
          _id: item._id,
          productId: item?.product?._id,
          avatar: item?.product?.image,
          bid_to: mergeName(item?.sellerDetails?.sellerId),
          date: dateFormatter(item?.date),
          product: item?.product?.title,
          min_budget: item?.minBudget,
          your_budget: item?.sellerDetails?.budgetAmount
        }))
        setApprovedRequirements(formattedData)
      }
    }
  }, [pendingApprovedData, completedApproveData])


  return (
    <div className="w-full max-w-7xl mx-auto  space-y-6 ">
      <div className='grid space-y-5 w-full'>
        <div className='flex justify-between items-center font-semibold w-full mb-3'>
          <p className="font-bold text-xl whitespace-nowrap   tracking-tight text-gray-600">
            Closed Deals
          </p>
        </div>

        {/* tabs */}
        <Tabs defaultValue="approved_bids" className='grid space-y-2 w-full bg-transparent overflow-hidden' onValueChange={(val) => setTab(val)} >
          <TabsList className='bg-transparent'>
            <TabsTrigger value="approved_bids" className={`cursor-pointer min-w-40`}>Deals Awarded</TabsTrigger>
            <TabsTrigger value="completed_requirements" className={`cursor-pointer `}><span className="hidden sm:inline-block">Requirements </span> Awarded</TabsTrigger>
          </TabsList>

          <TabsContent value="approved_bids" className='w-full overflow-hidden '>

            {
              approvedLoading ? <SkeletonTable /> : <TableListing data={approvedRequirements} columns={columnsApproveBids} filters={false} colorPalette={'gray'} />
            }
          </TabsContent>

          <TabsContent value="completed_requirements" className='w-full overflow-hidden'>
            {
              completedLoading ? <SkeletonTable /> : <TableListing data={completeRequirements} columns={columnsCompletedReq} filters={false} colorPalette={'gray'} />
            }
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

export default Deal