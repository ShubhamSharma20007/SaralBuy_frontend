
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { dateFormatter } from '@/helper/dateFormatter';
// import { fallBackName } from '@/helper/fallBackName';
import { useFetch } from '@/helper/use-fetch';
import bidService from '@/services/bid.service';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonTable } from '@/const/CustomSkeletons';
import TableListing from '@/Components/TableLisiting';
import { useDebounce } from 'use-debounce';
import AlertPopup from '@/Components/Popup/AlertPopup';
import TooltipComp from '@/utils/TooltipComp';
import { toast } from 'sonner';
import { fallBackName } from '@/helper/fallBackName';
import { mergeName } from '@/helper/mergeName';

const BidListing = () => {
    const [data, setData] = useState([])
    const [open, setOpen] = useState(false);
    const [currentBidId, setCurrentBidId] = useState<string | null>('')
    const message = {
        title: 'Warning',
        message: 'This action cannot be undone. This Quote will permanently delete your account.',
    }
    const navigate = useNavigate()
    const { fn: fetchBidsFn, data: fetchBidsResponse, loading: bidLoading } = useFetch(bidService.getAllBids)
    const { fn: deleteBidFn, data: deletBidResponse, loading: deleteBidloading } = useFetch(bidService.deleteBid)
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [value, { isPending }] = useDebounce(search, 600);
    console.log(fetchBidsResponse, 234)
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "avtar",
            header: "",
            cell: ({ row }) => {
                return <div className=" ">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={row.original.avatar} alt="product image" className='rounded-full w-full h-full object-cover' />
                        <AvatarFallback className="bg-gray-200 rounded-full flex w-full h-full  items-center justify-center text-sm font-semibold">
                            {fallBackName(row.original?.product)}
                            {/* <img src='/no-image.webp'></img> */}
                        </AvatarFallback>
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
            accessorKey: "buyer",
            header: "Buyer",
        },
        {
            accessorKey: "product",
            header: "Product",
        },
        // {
        //     accessorKey: "min_budget",
        //     header: "Min. Budget",
        // },
        {
            accessorKey: "your_budget",
            header: "Quoted Price",
        },

        {
            accessorKey: "delivery",
            header: "Delivery",
            cell: ({ row }) => {
                return (
                    <span className="whitespace-nowrap text-sm">
                        {row.getValue("date")}
                    </span>
                );
            },
        },


        {
            accessorKey: "location",
            header: "Location",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const diff = row.getValue("status") as number;
                if (diff <= 0) {
                    return <Badge className="bg-red-100 text-red-500 rounded-full px-2 w-20">Inactive</Badge>
                } else {
                    return <Badge className="bg-green-100 text-green-500 rounded-full capitalize px-3 w-20">Active</Badge>
                }
            }
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                return <div className="flex items-center gap-2">
                    <Button className="text-sm cursor-pointer text-gray-600 underline" variant={"link"} onClick={() => {
                        navigate('/bid-overview/' + row.original?._id);
                    }}>View</Button>
                    {/* <p onClick={() => {
                        // Store chat IDs in localStorage for persistence across refresh
                        localStorage.setItem('chatIds', JSON.stringify({
                            productId: row.original?.productId,
                            buyerId: row.original?.productBuyerId,
                            sellerId: user._id
                        }));
                        navigate('/chat', {
                            state: {
                                productId: row.original?.productId,
                                buyerId: row.original?.productBuyerId,
                                sellerId: user._id
                            }
                        });
                    }}>Chat now</p> */}
                    <TooltipComp
                        hoverChildren={<div
                            onClick={() => {
                                if (deleteBidloading) return;
                                setCurrentBidId(row.original?._id)
                                // handleDeleteBid(row.original?._id)
                                setOpen(true)
                            }}
                            className="hover:bg-red-100 p-1 rounded-md ease-in-out transition-all duration-300">
                            <Trash2Icon className="h-4 w-4  text-red-500 cursor-pointer rounded-full" /></div>}
                        contentChildren={<p>Delete Bid</p>}
                    ></TooltipComp>

                </div>
            }
        },
    ];
    useEffect(() => { fetchBidsFn(limit, page, value) }, [limit, page, value])

    useEffect(() => {
        if (fetchBidsResponse) {
            const { bids, total: totalCount, limit: pageLimit } = fetchBidsResponse;
            const formattedData = bids.map((item: any) => {
                let mainProductId = item.product?.product?._id || item.product?._id;
                let mainProductBuyerId = item.product?.product?.userId || item.product?.userId;
                const createdAt = new Date(item.createdAt).getTime();
                const durationDays = Number(item.product?.bidActiveDuration);
                const expiryTime = createdAt + durationDays * 24 * 60 * 60 * 1000;
                const now = Date.now();
                const diff = expiryTime - now;
                return {
                    _id: item._id,
                    date: dateFormatter(item.createdAt),
                    buyer: mergeName(item.buyer),
                    avatar: item?.product?.image,
                    product: item.product.title,
                    productId: mainProductId,
                    productBuyerId: mainProductBuyerId,
                    delivery: dateFormatter(item.earliestDeliveryDate || item.product?.paymentAndDelivery?.ex_deliveryDate) || 'N/A',
                    location: item?.location || item.product?.paymentAndDelivery?.organizationAddress || 'N/A',
                    min_budget: item?.product?.minimumBudget,
                    your_budget: item?.budgetQuation,
                    status: diff
                };
            });

            setData(formattedData);
            setTotal(totalCount);
            setLimit(pageLimit);
        }
    }, [fetchBidsResponse]);


    async function handleDeleteBid(id: string) {
        // if (!currentBidId) return;
        await deleteBidFn(id);
    }

    useEffect(() => {
        if (deletBidResponse) {

            toast.success('Bid deleted successfully')
            //  remove the bid from the list
            const updatedData = data.filter((item: any) => item._id !== currentBidId);
            setData(updatedData);
            setCurrentBidId(null)
        }
    }, [deletBidResponse])

    return (
        <>
            <AlertPopup
                loading={deleteBidloading}
                setOpen={setOpen} open={open} message={message}
                deleteFunction={() => {
                    handleDeleteBid(currentBidId!)
                }}
            />
            {
                (bidLoading && !fetchBidsResponse) ? <SkeletonTable /> : <TableListing
                    data={data}
                    columns={columns}
                    filters={true}
                    title="Quotes Received"
                    colorPalette="gray"
                    page={page}
                    setPage={setPage}
                    total={total}
                    limit={limit}
                    setSearch={setSearch}
                    search={search}
                    isPending={isPending}
                />

            }
        </>
    )
}

export default BidListing