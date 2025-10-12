import { dateFormatter } from '@/helper/dateFormatter'
import { Button } from './ui/button'
import { List, MapPin, User } from 'lucide-react'
import React from 'react'
import { mergeName } from '@/helper/mergeName'
import { useNavigate } from 'react-router-dom'

const DyanmicHomeCard = ({ bg, item }: { bg: string, item: any }) => {
    const navigate  = useNavigate()
    return (
        <div className={` px-8 sm:px-16 relative bg-no-repeat z-0 bg-cover  py-10  min-h-82 `}>
            <div className={`absolute inset-0 bg-${bg}-200/80 -z-[1]`}></div>
            <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
                <p className={`font-bold text-3xl  text-${bg || 'orange'}-700 border-l-5 border-${bg || 'orange'}-700 pl-3 tracking-tight capitalize`}>
                    {item?.categoryName}
                </p>
                {/* {
      seeAllButton &&   <button className="text-md text-orange-600 hover:underline font-semibold">
          See All
        </button>
     } */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5 max-w-7xl mx-auto sm:px-4">
                {
                    item?.products?.map((item: any, idx:number) => <div className={`p-5 ${bg ? 'bg-white' : 'bg-orange-50'} rounded-[5px] shadow-none outline-none border-none`}>
                        <div className='flex justify-between items-center'>
                            <p className="text-sm text-gray-600 font-semibold ">Dated: {dateFormatter(item?.createdAt)}</p>
                            <Button
                                onClick={
                                    ()=>{
                                        navigate(`/product-overview?productId=${item?._id}`)
                                    }
                                    }
                                variant="ghost" size="lg" className="border  shadow-orange-700 border-orange-700 text-orange-700 hover:bg-orange-700 hover:text-white cursor-pointer">
                                Place Quotation
                            </Button>
                        </div>

                        {/* image */}
                        <div className='flex  justify-between mt-5 items-center flex-row-reverse'>
                            <div className="w-24 h-24 flex-shrink-0">
                                <img

                                    src={item?.image || '/no-image.webp'}
                                    alt={'No Image'}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-1">
                                <h2 className="font-bold text-md text-gray-700  capitalize">
                                   {item?.title}
                                </h2>


                                <div className="flex items-center text-sm text-gray-700 gap-2">
                                    {/* user */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                    </svg> <span className='capitalize'>{mergeName(item?.userInfo)}</span>

                                </div>
                                <div className="flex items-center text-sm text-gray-700 gap-2">
                                    {/* map */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                                        <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                                    </svg>  <span className='capitalize'>{item?.userInfo?.currentLocation || item?.userInfo?.address}</span>

                                </div>
                                <div className="flex items-center text-sm text-gray-700 gap-2">
                                    {/* list */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                                        <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                    </svg>

                                    3 units  <span className='capitalize'>{item?.userInfo?.quantity}</span>
                                </div>
                            </div>
                        </div>
                        <div
                            className="flex flex-row items-center justify-between mt-3"
                        >

                        </div>
                    </div>)
                }


            </div>
        </div>
    )
}

export default DyanmicHomeCard