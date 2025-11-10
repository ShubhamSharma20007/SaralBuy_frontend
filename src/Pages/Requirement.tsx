import Banner from '@/Components/Banner/Banner';
import ItemCard from '@/Components/ItemCard'
import { useCategoriesStore } from '@/zustand/getCategories';

import { MoveRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/ui/accordion"
const Requirement = () => {
  const { data } = useCategoriesStore();
  const [currentWinSize, setCurrentWinSize] = useState(window.innerWidth)
  const navigate = useNavigate()
  useEffect(() => {
    const handleResize = () => {
      setCurrentWinSize(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }

  }, [window.innerWidth])
  return (
    <div className="w-full max-w-7xl mx-auto px-4 min-h-screen relative">
      <Banner />

      <h1 className="text-xl font-bold te xt-gray-700 mt-10 mb-4">Select a Category</h1>
      {
        currentWinSize >= 768 ?
          <div className="grid grid-cols-9 gap-5 ">
            {
              data && (data as any[])?.map((item: any) => <ItemCard key={item._id} {...item} />)
            }
          </div> : <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            {
              data && data?.map((item: any) => <AccordionItem value={item?._id} key={item._id}>
                <AccordionTrigger className='capitalize'>
                 <div className='flex items-center gap-x-4'>
                   <img src={item?.image}  className='max-w-24' />
                  {item?.categoryName}
                 </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <p className="list-disc list-inside space-y-2 pl-3">
                    {item?.subCategories?.map((sub: any) => (

                      <p
                      
                        onClick={() => {
                          navigate(`/category/${item?._id}/${sub._id}`)
                        }}
                        key={sub?._id} className=" capitalize underline text-blue-500 text-md">
                        {sub?.name}
                      </p>
                    ))}
                  </p>

                </AccordionContent>
              </AccordionItem>)
            }

          </Accordion>
      }
      {/* looking for div */}
      <div className='bg-orange-50 p-7 rounded-[5px] my-6'>
        <h1 className='text-lg font-bold text-start'>Did not find what you are looking for</h1>
        <div className='flex justify-between items-center m-1'>
          <p className='text-gray-500 text-sm'>What know not every category fit into a box. if your need doesn't match one of the listed options. Click <Link to={"/"} className='text-blue-600 underline'>Other </Link> to tell us more.</p>
          <MoveRight className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  )
}

export default Requirement