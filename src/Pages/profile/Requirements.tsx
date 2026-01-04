import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { ListFilter } from 'lucide-react';
import "keen-slider/keen-slider.min.css"
import { useEffect, useState } from 'react';
import { useFetch } from '@/helper/use-fetch';
import productService from '@/services/product.service';
import bidService from '@/services/bid.service';
import { SliderSkeleton } from '@/const/CustomSkeletons';
import ScrollablePagination from '@/Components/ScrollablePagination';
const limit = 10;
const Requirement = () => {
  const [tab, setTab] = useState('requirements')
  const { fn: getDrafts, data: getDraftsRes, loading: getDraftLoading } = useFetch(productService.getDrafts)
  const { fn: getMyRequirements, data: getMyRequirementsRes, loading: getMyRequirementsLoading } = useFetch(bidService.getMyRequirements)
  const [drafts, setDrafts] = useState<any>([])
 
  useEffect(() => {
    if (tab === 'requirements') {
      getMyRequirements(1, limit)
    } else {
      getDrafts(1,limit)
    }
  }, [tab])

  useEffect(() => {
    if (getDraftsRes && getDraftsRes?.data?.length > 0) {
      setDrafts(getDraftsRes?.data || [])
    }
  }, [getDraftsRes]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className='grid space-y-5 w-full'>
        <div className='flex justify-between items-center font-semibold w-full mb-3'>
          <p className="font-bold text-xl whitespace-nowrap tracking-tight text-gray-600">
            Requirements
          </p>
          <Button variant={'ghost'} size={'icon'} className='w-24 flex gap-2 items-center justify-center text-sm font-medium text-gray-700 bg-transparent border-1 hover:bg-transparent cursor-pointer border-gray-700'>
            Date
            <ListFilter className='w-5 h-5' />
          </Button>
        </div>

        {/* tabs */}
        <Tabs defaultValue="requirements" className='grid space-y-2 w-full overflow-hidden' onValueChange={(val) => setTab(val)}>
          <TabsList className='bg-transparent'>
            <TabsTrigger value="requirements" className='cursor-pointer min-w-32'>
              Your Requirements
            </TabsTrigger>
            <TabsTrigger value="drafts" className='cursor-pointer min-w-32'>
              Drafts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requirements" className='w-full overflow-hidden'>
            {getMyRequirementsLoading ? (
              new Array(5).fill(0).map((_, idx) => <SliderSkeleton key={idx} />)
            ) : getMyRequirementsRes?.data?.length > 0 ? (
              <ScrollablePagination
                target="requirements"
                state={getMyRequirementsRes}
                limit={limit}
              />
            ) : (
              <div className='w-full h-[300px] flex flex-col items-center justify-center'>
                <img src="/empty-cart.webp" width="10%" alt="No data" />
                <p className="text-gray-500 text-sm">No Requirements Found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className='w-full overflow-hidden'>
            {getDraftLoading ? (
              new Array(5).fill(0).map((_, idx) => <SliderSkeleton key={idx} />)
            ) : drafts.length > 0 ? (
               <ScrollablePagination
                target="drafts"
                state={getDraftsRes}
                limit={limit}
              />
              // drafts.map((item: any, idx: number) => (
              //   <div key={idx} className='border-2 border-gray-300 p-4 rounded-md w-full mb-2 relative'>
              //     <div 
              //       className='absolute top-1 left-1 z-10 bg-orange-50 text-orange-400 rounded-sm p-1 cursor-pointer'
              //       onClick={() => navigate('/update-draft/' + item._id)}
              //     >
              //       <TooltipComp
              //         hoverChildren={<SquarePen className='h-4 w-4' />}
              //         contentChildren={<p>Edit Draft</p>}
              //       />
              //     </div>
                  
              //     <RequirementSlider product={item} tab={tab} target="drafts" />
              //   </div>
              // ))
            ) : (
              <div className='w-full h-[300px] flex flex-col items-center justify-center'>
                <img src="/empty-cart.webp" width="10%" alt="No data" />
                <p className="text-gray-500 text-sm">No Drafts Found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Requirement