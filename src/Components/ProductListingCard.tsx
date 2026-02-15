
import { format } from "date-fns";
import { Button } from "../Components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Authentication from "./auth/Authentication";
import { Merge } from "lucide-react";
const ProductListingCard = ({product}:{product:any}) => {
  // let {user} = getUserProfile();
  const [open,setOpen] = useState(false)
 const navigate = useNavigate()

  const handleSendOtp =()=>{
    // if(!user){
    //    setOpen(true);
    //    return;
    // }
    // if(!(user as any)?.firstName && !(user as any)?.lastName && !(user as any)?.email){
    //   return navigate('/profile')
    // }
    return navigate('/product-overview?productId=' + product._id);
  }
  return (
    <>
    <Authentication setOpen={setOpen} open={open}/>
      <div className='py-3 px-4 bg-white rounded-lg border shadow-sm '>
        <div className="flex justify-between items-center  mb-4 ">
        <span className="border-2 border-gray-600 rounded-full text-gray-700 inline-block p-1  text-center px-4 text-sm font-medium capitalize"> {product?.categoryId?.categoryName || 'No Type'}</span>
        {
          product?.isMergeQuote && <Merge className="w-9 h-9  bg-orange-100 text-orange-500 rounded-full p-2"/>
        }
      </div>
    
      {/* image */}
      <div className='flex flex-row justify-start items-center gap-x-8'>
        <div className="w-28 h-28 flex-shrink-0">
            <img
  
            src={product?.image || 'no-image.webp'}
            alt={product?.title}
            className="w-full h-full object-contain rounded-lg mix-blend-darken"
            />
            </div>
        
        {/* Content */}
            <div className="space-y-1">
            <h2 className="font-bold text-xl mb-2 text-gray-800  capitalize line-clamp-1">
            {product?.title}
            </h2>


            <div className="flex items-center text-sm text-gray-700 gap-2 space-y-1 capitalize">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
</svg> {product?.userId?.firstName+ " "+ product?.userId?.lastName || 'No Name found'}
            </div>
            <div className="flex items-center text-sm  text-gray-700 gap-2 line-clamp-1">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
  <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
</svg> {product?.userId?.address|| 'No Address found'}
            </div>
            <div className="flex items-center text-sm text-gray-700 gap-2 capitalize">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
  <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
</svg>{product?.quantity} units
            </div>
            </div>
      </div>
    <div
    className="flex flex-row items-center justify-between mt-3"
    >
{
  product?.createdAt && <p className="text-sm text-gray-600 font-semibold ">Date: {format(product?.createdAt, "dd/MM/yyyy")}</p>
}
     <Button onClick={handleSendOtp} variant="ghost" size="lg" className="border rounded-sm  font-semibold shadow-orange-500 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white cursor-pointer">
          
          {
            product?.isMergeQuote ? 'Chat Now' : 'Place Quote'
          }
          
    </Button>
    </div>
     </div>
    </>
  )
}

export default ProductListingCard