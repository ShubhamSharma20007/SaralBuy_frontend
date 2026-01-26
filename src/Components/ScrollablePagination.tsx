import React, { useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import RequirementSlider from "@/Pages/profile/components/requirement-slide";
import bidService from "@/services/bid.service";
import { RequirementCardSkeleton } from "@/const/CustomSkeletons";
import productService from "@/services/product.service";
import TooltipComp from "@/utils/TooltipComp";
import { MoveRight, SquarePen, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

type Props = {
  state: any;
  target: string;
  limit: number;
  tab?: string;
  setState?:any
  setSelectedTileId?:React.Dispatch<React.SetStateAction<string>>;
  setOpen?:React.Dispatch<React.SetStateAction<boolean>>;  // this is for shadcn 
};

const ScrollablePagination: React.FC<Props> = ({ state, target, limit, tab = '' ,setState,setSelectedTileId,setOpen}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isInitialized = useRef(false);
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const fetchData = async (page: number, limit: number) => {
    if (target === "requirements") {
      return await bidService.getMyRequirements(page, limit);
    } else if (target === "drafts") {
      return await productService.getDrafts(page, limit);
    }
  };

  // useEffect(() => {
  //   if (state?.data?.length > 0 && !isInitialized.current) {
  //     setProducts(state.data);
  //     setState((prev:any)=>{
  //       return {...prev, data:state.data}
  //     })
  //     setPage(state.page);
  //     setHasMore(state.page < state.totalPages);
  //     isInitialized.current = true;
  //   } else if (state?.data?.length === 0 && state?.totalPages === 0 && !isInitialized.current) {
  //     setProducts([]);
  //     setHasMore(false);
  //     isInitialized.current = true;
  //   }
  // }, [state]);

  useEffect(() => {
  if (!Array.isArray(state?.data)) return;

  setProducts(state.data);


  if (!isInitialized.current) {
    setPage(state.page);
    setHasMore(state.page < state.totalPages);
    isInitialized.current = true;
  }
}, [state.data]);

  useEffect(() => {
    return () => {
      isInitialized.current = false;
      isFetching.current = false;
    };
  }, [target]);

  const fetchMoreData = async () => {
    if (!hasMore || isFetching.current) return;

    isFetching.current = true;

    try {
      const nextPage = page + 1;
      let res = await fetchData(nextPage, limit);

      if (res?.data && res.data.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map(p => p._id));
          const newItems = res.data.filter((item: any) => !existingIds.has(item._id));
          const updatedProducts = [...prev, ...newItems];
          setState((prev:any)=>{
            return {
              ...prev,
              data: updatedProducts,
              page: nextPage,
              totalPages: res.totalPages,
            }
          })
          return updatedProducts;
        });
        setPage(nextPage);
        setHasMore(nextPage < res.totalPages);
      } else {
        console.log('No more data available');
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching next page:", err);
      setHasMore(false);
    } finally {
      isFetching.current = false;
    }
  };
  return (
    <InfiniteScroll
      dataLength={products.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={new Array(3).fill(0).map((_, idx) => <RequirementCardSkeleton key={idx} />)}
      //   endMessage={
      //     products.length > 0 ? (
      //       <p className="text-center text-gray-500 py-4">
      //         No more requirements to load
      //       </p>
      //     ) : null
      //   }
      className="grid grid-cols-1 gap-4"
    >
      {products?.map((item: any, idx: number) => (
        <div key={item._id || idx} className="border-2 border-gray-300 p-4 rounded-md w-full relative">

        {
          target === 'requirements' && <div className='absolute top-1 left-1 z-10 bg-orange-50 text-orange-400 rounded-sm  p-1 cursor-pointer'
          onClick={()=>{
            setOpen?.(true)
            setSelectedTileId?.(item._id)
          }}
          >
            <TooltipComp
              hoverChildren={<X className='h-4 w-4' />}
              contentChildren={<p>Delete Requirement</p>}
            ></TooltipComp>
          </div>
          
        }
          {
            target === 'drafts' && (
              // <TooltipComp
              //     hoverChildren={<SquarePen className='h-4 w-4' />}
              //     contentChildren={<p>Edit Draft</p>}
              //   />
               <Button
            className='absolute bottom-5 right-5 z-10 cursor-pointer text-xs  bc'
                onClick={() => navigate('/update-draft/' + item._id)}
             size={'default'} >
              Edit Draft 
              <MoveRight className='w-5 h-5' />
            </Button>
            )
          }
         <div onClick={() =>{
          // if(target ==='drafts')  navigate('/update-draft/' + item._id);
         }}
         >
           <RequirementSlider product={item} target={target} tab={tab} />
         </div>
        </div>
      ))}
    </InfiniteScroll>
  );
};

export default ScrollablePagination;