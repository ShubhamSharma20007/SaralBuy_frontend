import React, { useState } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import { CircleChevronLeft, CircleChevronRight, MoveRight } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import ProductCard from './product-card';
import { useNavigate } from 'react-router-dom';
import { dateFormatter } from '@/helper/dateFormatter';
import { toast } from 'sonner';

function Arrow({ disabled, left, onClick }: {
  disabled: boolean
  left?: boolean
  onClick: (e: any) => void
}) {
  const disabledClass = disabled
    ? " opacity-50 cursor-not-allowed"
    : " cursor-pointer hover:text-gray-700";

  return (
    <div className={`absolute top-1/2 transform -translate-y-1/2 z-10 ${left ? 'left-2' : 'right-2'}`}>
      {left ? (
        <CircleChevronLeft
          onClick={disabled ? undefined : onClick}
          className={`h-7 w-7 text-gray-600 bg-white rounded-full shadow-md ${disabledClass}`}
        />
      ) : (
        <CircleChevronRight
          onClick={disabled ? undefined : onClick}
          className={`h-7 w-7 text-gray-600 bg-white rounded-full shadow-md ${disabledClass}`}
        />
      )}
    </div>
  );
}
const RequirementSlider = ({ product, tab, target }: { product: any, tab?: string, target: string }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();
 const modifiedProducts = target ==='drafts' ? [product, ...(product?.subProducts || [])] : [product, ...(product?.product?.subProducts || [])];
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: {
      perView: 2,
      spacing: 12,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  const handleNavigate = (productData: any) => {
    if (target === 'drafts' || target === 'carts') return;
    // Navigate with product data in state
    navigate('/account/requirements/' + productData._id, {
      state: { product: productData, sellerId: product.seller?._id, products }
    });
  };

// only for allow arrow if more than 2 products
  const products = product?.subProducts?.length > 0 ? [product, ...product.subProducts] : [product];
function handleSubmitDraft(targetProduct: any) {
  const resArr = targetProduct?.subProducts?.length > 0 ? targetProduct.subProducts : [targetProduct];

  // Check if any item is invalid
  const hasInvalid = resArr.some((item: any) =>
    !item.description || !item.image || item.quantity <= 0 || !item.categoryId
  );

  if (hasInvalid) {
    toast.error('Please complete all required fields in the draft before proceeding.');
    return;
  }
  // DO THE API CALL HERE
  // toast.success('Draft submitted successfully!');
}
 

  return (
    <div className='flex justify-between items-center gap-4 w-full'>
      <div ref={sliderRef} className="keen-slider w-full max-w-4xl relative">
        {modifiedProducts.map((prt: any) => (
          <div
            key={prt._id}
            className={`keen-slider__slide ${target === 'requirement' ? 'cursor-pointer' : ''}`}
            onClick={() => handleNavigate(prt)}
          >
            <ProductCard product={prt} target={target} />
          </div>
        ))}

        {loaded && instanceRef.current && (products.length > 2 || modifiedProducts?.length > 2 )&& (
          <>
            <Arrow

              left
              onClick={(e: any) => {
                e.stopPropagation();
                instanceRef.current?.prev();
              }}
              disabled={currentSlide === 0}
              
            />
            <Arrow
              onClick={(e: any) => {
                e.stopPropagation();
                instanceRef.current?.next();
              }}
              disabled={currentSlide === instanceRef.current.track.details?.slides.length - 1}
            />
          </>
        )}
      </div>

      {/* Right Side Info */}
      <div className='flex-1 flex justify-between items-end flex-col space-y-10'>
        <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
          Dated: {dateFormatter(product?.createdAt || product?.product?.createdAt)  || 'N/A'}
        </p>
        <div>
          {target === "requirements" ? (
            <Button size={'default'} className='cursor-pointer text-xs  bc'>
              Total Bids: <span className='font-bold'>{product?.product?.totalBidCount || 0}</span>
              <MoveRight className='w-5 h-5' />
            </Button>
          ) : target === "drafts" ? (
            <Button size={'default'} className='cursor-pointer text-xs bc' onClick={()=>{
              handleSubmitDraft(product)
            }}>
              Submit Draft
            </Button>
          ) :
            target === "carts" ? (
            <Button size={'default'} className='cursor-pointer text-xs bc '
            onClick={()=>{
              navigate(`/product-overview?productId=${product?.product?._id}`)
            }}
            >
              Place Bid
            </Button>
          ) :
          null}
        </div>
      </div>
    </div>
  );
};


export default RequirementSlider;

