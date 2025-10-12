
import requirementService from "@/services/requirement.service";
import RecentProductCard from "./RecentProductCard";
import { useFetch } from "@/helper/use-fetch";
import { useEffect } from "react";



const Requirement = () => {
  const {fn:recenReqFn,data:recentReqRes} = useFetch(requirementService.getRecentRequiremnts);
  useEffect(()=>{
    recenReqFn()
  },[])

  return (
    <div className={` px-8 sm:px-16 relative bg-no-repeat z-0 bg-cover  py-10  min-h-82 bg-[url('./grid.png')]`}>
     <div className="absolute inset-0 bg-gray-200/80 -z-[1]"></div>
  <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
       <p className={`font-bold text-3xl  text-orange-700 border-l-5 border-orange-700 pl-3 tracking-tight`}>
      Recent Requirements
      </p>
     {/* {
      seeAllButton &&   <button className="text-md text-orange-600 hover:underline font-semibold">
          See All
        </button>
     } */}
  </div>

      {/* Card */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5 max-w-7xl mx-auto sm:px-4">
    {
      recentReqRes && recentReqRes.map((item:any)=><RecentProductCard item={item}/>)
    }

    </div>
    </div>
  );
};

export default Requirement;