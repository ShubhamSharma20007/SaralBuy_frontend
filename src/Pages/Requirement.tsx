import Banner from '@/Components/Banner/Banner';
import ItemCard from '@/Components/ItemCard'
import { useCategoriesStore } from '@/zustand/getCategories';

import { MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Requirement = () => {
 const { data} = useCategoriesStore();


  return (
    <div className="w-full max-w-7xl mx-auto px-4 min-h-screen relative">
      <Banner/>
     
        <h1 className="text-xl font-bold text-gray-700 mt-10 mb-4">Select a Category</h1>
     <div className="grid grid-cols-9 gap-5 ">
      {
        data &&  (data as any[])?.map((item:any)=><ItemCard key={item._id} {...item}/>)
      }
    </div>
    {/* looking for div */}
    <div className='bg-orange-50 p-7 rounded-[5px] my-6'>
      <h1 className='text-lg font-bold text-start'>Didn't Find What You'r Looking For?</h1>
      <div className='flex justify-between items-center m-1'>
        <p className='text-gray-500 text-sm'>What know not every category fit into a box. if your need doesn't match one of the listed options. Click <Link to={"/"} className='text-blue-600 underline'>Other </Link> to tell us more.</p>
        <MoveRight className="h-4 w-4 text-gray-600" />
      </div>
    </div>
   </div>
  )
}

export default Requirement