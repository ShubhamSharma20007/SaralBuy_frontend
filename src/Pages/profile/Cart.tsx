import { Button } from '@/Components/ui/button'
import { SliderSkeleton } from '@/const/CustomSkeletons'
import TooltipComp from '@/utils/TooltipComp'
import { ListFilter, X } from 'lucide-react'
import RequirementSlider from './components/requirement-slide'
import { useEffect } from 'react'
import cartService from '@/services/cart.service'
import { useFetch } from '@/helper/use-fetch'
import { toast } from 'sonner'

const Cart = () => {
  const {fn:getCartFn,data:getCartRes,loading:getCartLoading,setData:setCartItems} = useFetch(cartService.getCart)
  const {fn:removeCartFn,data:removeCartRes,loading:removeCartLoading} = useFetch(cartService.removeCart)
useEffect(()=>{
  getCartFn()
},[])


function handleCart(cartId: string, productId: string) {
  console.log(cartId, productId);

  setCartItems((prevCart: any) => {
    if (!prevCart?.cartItems) return prevCart;
    return {
      ...prevCart,
      cartItems: prevCart.cartItems.filter(
        (item: any) => item.product._id !== productId
      ),
    };
  });

  removeCartFn(cartId, productId)
}

useEffect(() => {
    if (removeCartRes) {
      toast.success(removeCartRes?.message || 'Cart item removed successfully');
    }
  }, [removeCartRes])
  return (
     <div className="w-full max-w-7xl mx-auto  space-y-6 ">
      <div className='grid space-y-5 w-full'>
        <div className='flex justify-between items-center font-semibold w-full'>
          <p className="font-bold text-xl whitespace-nowrap   tracking-tight text-gray-600">
           Your Cart
          </p>
          <Button variant={'ghost'} size={'icon'} className=' w-24 flex gap-2 items-center justify-center text-sm font-medium  text-gray-700 bg-transparent border-1 hover:bg-transparent cursor-pointer border-gray-700'>
            Date
            <ListFilter className='w-5 h-5' />
          </Button>
        </div>
        {/*  cart list */}
         {
              getCartLoading ?
                new Array(3).fill(0).map(_ => <SliderSkeleton />) :
            getCartRes && getCartRes.cartItems?.length > 0 ? getCartRes?.cartItems?.map((item: any, idx: number) => (
                  <div key={item?.product?._id} className='border-2 border-gray-300 p-4 rounded-md w-full mb-2 relative'>
                    <div className='absolute top-1 left-1 z-10 bg-orange-50 text-orange-400 rounded-sm  p-1 cursor-pointer'
                      onClick={()=>handleCart(getCartRes?._id,item?.product?._id)}
                    >
                      <TooltipComp
                        hoverChildren={<X className='h-4 w-4' />}
                        contentChildren={<p>Remove Cart</p>}
                      ></TooltipComp>
                    </div>

                    <RequirementSlider product={item} target="carts" key={idx} />
                  </div>
                )) : <div className='w-full h-[300px]  flex flex-col items-center justify-center'>
                    <img src="/observed.svg" width="10%" />
                    <p className="text-gray-500 text-sm">No Cart's Found</p>
                </div>
            }
       
      </div>
    </div>
  )
}

export default Cart