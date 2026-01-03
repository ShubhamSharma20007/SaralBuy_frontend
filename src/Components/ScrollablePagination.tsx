import { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import RequirementSlider from "@/Pages/profile/components/requirement-slide";
import bidService from "@/services/bid.service";
import { RequirementCardSkeleton } from "@/const/CustomSkeletons";
import productService from "@/services/product.service";
import TooltipComp from "@/utils/TooltipComp";
import { SquarePen, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  state: any;
  target: string;
  limit: number;
  tab?: string
};

const ScrollablePagination: React.FC<Props> = ({ state, target, limit, tab = '' }) => {
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

  useEffect(() => {
    if (state?.data?.length > 0 && !isInitialized.current) {
      setProducts(state.data);
      setPage(state.page);
      setHasMore(state.page < state.totalPages);
      isInitialized.current = true;
    } else if (state?.data?.length === 0 && state?.totalPages === 0 && !isInitialized.current) {
      setProducts([]);
      setHasMore(false);
      isInitialized.current = true;
    }
  }, [state]);

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

          <div className='absolute top-1 left-1 z-10 bg-orange-50 text-orange-400 rounded-sm  p-1 cursor-pointer'
          >
            <TooltipComp
              hoverChildren={<X className='h-4 w-4' />}
              contentChildren={<p>Delete Requirement</p>}
            ></TooltipComp>
          </div>
          {
            target === 'drafts' && (
              <div
                className='absolute top-1 left-1 z-10 bg-orange-50 text-orange-400 border-[2px] shadow shadow-orange-200 border-dotted rounded-sm p-1 cursor-pointer'
                onClick={() => navigate('/update-draft/' + item._id)}
              >
                <TooltipComp
                  hoverChildren={<SquarePen className='h-4 w-4' />}
                  contentChildren={<p>Edit Draft</p>}
                />
              </div>
            )
          }
          <RequirementSlider product={item} target={target} tab={tab} />
        </div>
      ))}
    </InfiniteScroll>
  );
};

export default ScrollablePagination;