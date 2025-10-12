//Styles
// import Brands from "@/Components/Brands";
import "../Styling/Home/homePage.css";
import Banner from "@/Components/Banner/Banner";

import RequirementHome from "@/Components/RequirementHome";
import SwiperSlider from "@/Components/SwiperSlider";
import TrendingCategory from "@/Components/TrendingCategory";
import { dateFormatter } from "@/helper/dateFormatter";
import { useEffect, useState } from "react";
import { useFetch } from "@/helper/use-fetch";
import bidService from "@/services/bid.service";
import { Skeleton } from "@/Components/ui/skeleton";
import productService from "@/services/product.service";
import DyanmicHomeCard from "@/Components/DyanmicHomeCard";
import { useCategoriesStore } from "@/zustand/getCategories";
import Brands from "@/Components/Brands";



const ItemSkeleton = () => (
  <div className="flex flex-col space-y-5">
    <div className="space-y-2 flex justify-between items">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
    </div>
    <Skeleton className="h-full w-full rounded-xl" />

  </div>
)


const Home = () => {

 const { data:categories} = useCategoriesStore();
  const { fn: getLatestThreeBidsFn, data: getLatestBidandDrafts, loading: bidResponseLoading } = useFetch(bidService.getThreeLatestBids);
  const {fn,data}= useFetch(productService.getHomeCards)
  const [bids, setBids] = useState<any>([])
  const [drafts, setDrafts] = useState([

  ])



  useEffect(() => {
 getLatestThreeBidsFn()
 fn()
  }, [])

  useEffect(() => {
    if (getLatestBidandDrafts) {
      console.log(getLatestBidandDrafts)
      // bids
      const formattedBids = getLatestBidandDrafts?.bids.map((bid: any) => ({
        _id: bid._id,
        productId:bid?.productId?._id,
        date: dateFormatter(bid.createdAt),
        category: bid.productId?.categoryId?.categoryName || "N/A",
        title: bid.productId?.title || "Untitled",
        deliveryDate: dateFormatter(bid.earliestDeliveryDate),
        totalBids: bid?.productId?.totalBidCount || 0,
        image: bid.productId?.image || "/no-image.webp",
      }));
      setBids(formattedBids);

      //  drafts
      const formattedDrafts = getLatestBidandDrafts?.drafts.map((draft: any) => ({
        _id: draft._id,
        date: dateFormatter(draft.createdAt),
        category: draft?.categoryId?.categoryName || "N/A",
        title: draft.title,
        deliveryDate: dateFormatter(draft.earliestDeliveryDate),
        totalBids: draft?.totalBidCount || 0,
        image: draft?.image || "/no-image.webp",
      }));
      setDrafts(formattedDrafts);

    }
  }, [getLatestBidandDrafts]);

  return (
    <main className="relative min-h-screen ">
      <div className="w-full max-w-7xl mx-auto px-4">
        <Banner />
        {/* bid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 mt-10 gap-3">
          {
            bidResponseLoading ?
              <ItemSkeleton />
              :
              bids.length > 0 ? <SwiperSlider key={'bid'} title="Your Bids" target="bids" color="gray" data={bids} /> : <SwiperSlider title="Your Bids" target="bids" color="gray" data={[]} />
          }
          {
            bidResponseLoading ?
              <ItemSkeleton />
              :
              drafts.length > 0 ? <SwiperSlider key={'draft'} title="Your Drafts" target="drafts" color="orange" data={drafts} /> : <SwiperSlider title="Your Drafts" target="draft" color="orange" data={[]} />
          }
          {/* {
            drafts.length > 0 && <SwiperSlider key={'draft'} title="Your Drafts" target="drafts" color="orange" data={drafts} />
          } */}
        </div>
      </div>
      {/* requirement  */}
      <div className="mt-10">
        <RequirementHome />
      </div>
      {/* trending Section */}
      <div className="mt-10 relative mx-auto px-4 w-full pt-10">
        
        <TrendingCategory  categories={categories}/>
        <img src="All In One Market Place that Fits You.png" className="absolute -top-5 mt-7 left-0 w-full">

        </img>

      </div>

      {/* requirement  */}
      <div >
        {/* <Requirement title="Electronics" color="orange" /> */}
      </div>
       {/* dyanmic data */}
      {
        data && data.map((item:any,idx:number)=><DyanmicHomeCard key={idx+1} bg={idx === 0 ?'gray' :''} item={item}/>)
      }
      {/* brands */}
      <Brands ></Brands>
     

    </main>);
};

export default Home;
