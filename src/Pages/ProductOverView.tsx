import { Box, Home, Paperclip, } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../Components/ui/breadcrumb";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { DatePicker } from "@/utils/DatePicker";
import { useFetch } from "@/helper/use-fetch";
import productService from "@/services/product.service";
import { useEffect, useState, type FormEvent, type FormEventHandler } from "react";
import cartService from "@/services/cart.service";
import { mergeName } from "@/helper/mergeName";
import { currencyConvertor } from "@/helper/currencyConvertor";
import { dateFormatter } from "@/helper/dateFormatter";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getUserProfile } from "@/zustand/userProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { productOverviewBidSchema } from "@/validations/Schema";
import bidService from "@/services/bid.service";
import { useNavigate, useSearchParams } from 'react-router-dom';
import SellerVerificationPopup from "@/Components/Popup/SellerVerificationPopup";
import { Spinner } from "@/Components/ui/shadcn-io/spinner";
import Authentication from "@/Components/auth/Authentication";
// import fileDownload from "js-file-download";
// import instance from "@/lib/instance";
import { CategoryFormSkeleton } from "@/const/CustomSkeletons";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";

//  for other brand value condition

function otherBrandValue(obj: any) {
  if (obj?.brand === 'others' && obj.hasOwnProperty('brandName')) {
    return obj.brandName
  }
  return obj?.brand
}
const ProductOverview = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const bidId = searchParams.get('bidId');
  const userProfile = getUserProfile()
  const { fn: getProductById, data: productResponse, error, setData: setProductResponse, loading: productViewLoading } = useFetch(productService.getProductById);
  const { fn: bidOverviewFn, data: bidOverviewRes, loading: bidOverLoading } = useFetch(bidService.bidOverViewbyId)
  const { fn: updateUserBidDets, data: updateUserBidDetsRes, loading: updateUserBidDetsLoading } = useFetch(bidService.updateUserBidDets)
  const { fn: getBidByProductIdFn, data: getBidByProductIdRes, loading: getBidByProductIdLoading } = useFetch(bidService.getbidByProductId)
  const { fn: createBidFn, data: createBidRes, loading: createBidLoading } = useFetch(bidService.createBid);
  const { fn: createRequirementFn } = useFetch(bidService.createRequirement);
  const { fn: addToCartFn, data: addToCartRes, loading: addToCartLoading } = useFetch(cartService.addToCart)
  const [open, setOpen] = useState(false)
  const [sellerVerification, setSellerVerification] = useState(false)
  const [businessType, setBusinessType] = useState('')
  const [businessDets, setBusinessDets] = useState({
    company_name: '',
    company_reg_num: '',
    gst_num: ''
  })

  const navigate = useNavigate()


  const { handleSubmit, formState: { errors }, register, reset, control, getValues,setValue } = useForm({
    resolver: zodResolver(productOverviewBidSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      budgetQuation: '', // this is quotedPrice
      // availableBrand: '',
      earliestDeliveryDate: undefined, // this is deliveryTimeLine
      sellerType:'',
      priceBasis:'',
      taxes:'',
      location:'',
      freightTerms:'',
      paymentTerms:'',
      buyerNote:''
    }
  })

  // Add to Cart Handler
  const handleAddToCart = async (productId: string) => {
    await addToCartFn(productId)
  };

  useEffect(() => {
    if (addToCartRes) {
      if (addToCartRes && (addToCartRes?.message as string).match(/already/) !== null) {
        toast.warning(addToCartRes.message)
      } else {
        toast.success(addToCartRes.message)
      }
    }
  }, [addToCartRes])


  useEffect(() => {
    if (productId) {
      getProductById(productId)
    } else if (bidId) {
      bidOverviewFn(bidId)
    } else {
      toast.error('Invalid request')
    }
  }, [productId, bidId])

  useEffect(() => {
    if (productResponse && Array.isArray(productResponse)) {
      const mainProduct = productResponse[0];
      const products =
        mainProduct?.subProducts?.length > 0
          ? mainProduct.subProducts
          : [mainProduct];

      setProductResponse({
        ...mainProduct,
        products,
      });
      console.log(productResponse)
    }
  }, [productResponse]);


  // useEffect(()=>{
  //   if(bidOverviewRes)    console.log(setBidOverviewRes({...bidOverviewRes,myName:'Shubham'}))
  // },[bidOverviewLoading])


  async function handleCreteBid() {
    if (!productResponse) return;
    if (productResponse?.mainProduct?.userId?._id === userProfile?.user?._id) return;
    const formData = getValues();
    //  validation
    if (businessType === "business" && !businessDets.company_name.trim()) {
      toast.error('company name is required')
      return;
    }
    const buyerId = productResponse?.mainProduct.userId?._id;
    const productId = productResponse?.mainProduct._id;
    const sellerId = userProfile?.user._id;
    const budgetAmount = Number(getValues().budgetQuation) || 0;
    let obj = {
      ...getValues(),
      status: "active",
      businessType,
      ...(businessType === "business" && { businessDets })
    }
    if (!businessType) {
      toast.error('business is required !');
      setSellerVerification(true)
    }
    try {
       await createBidFn(buyerId, productId, obj)

     
    } catch (err) {
      console.log(err);
      toast.error('Failed to place Quote');
    }
  }

  async function onSubmit(data: any) {
    const user = userProfile?.user;
    const currentFormData = getValues();
    if (!user?._id) {
      localStorage.setItem("preLoginBidForm", JSON.stringify(currentFormData));
      return setOpen(true);
    }
    if (!productResponse && !bidOverviewRes) return console.log("product && Quote not found in frontend");

    if (productResponse) {
      setSellerVerification(true);
    } else {
      await updateUserBidDets(bidId, data)
    }
  }


  useEffect(() => {
    if (updateUserBidDetsRes) {
      toast.success('Quote updated successfully')
      setBusinessType('')
    }
  }, [updateUserBidDetsRes])


  // useEffect(() => {
  //   if (createBidRes) {
  //     if(productResponse.mainProduct){
  //     setProductResponse(()=>{
  //       return{
  //         ...productResponse,
  //         mainProduct:{
  //           ...productResponse.mainProduct,
  //           totalBidCount:productResponse.mainProduct.totalBidCount+1
  //         }
  //       }
  //     })
  //     }else{
  //       console.log('main product to missing update bid count')
  //     }
  //     toast.success('Bid created successfully')
  //     setSellerVerification(false)
  //     setBusinessType('')
  //     reset({
  //       firstName: userProfile.user.firstName,
  //       lastName: userProfile.user.lastName,
  //       budgetQuation: '',
  //       availableBrand: '',
  //       earliestDeliveryDate: undefined
  //     });
  //   }
  // }, [createBidRes])

  // Replace the existing useEffect for createBidRes with this updated version:

  useEffect(() => {
    if (createBidRes) {
      if (productResponse?.mainProduct) {
        setProductResponse((prev: any) => {
          // Update mainProduct totalBidCount
          const updatedMainProduct = {
            ...prev.mainProduct,
            totalBidCount: prev.mainProduct.totalBidCount + 1
          };


          const updatedSubProducts = prev.subProducts?.map((product: any) => ({
            ...product,
            totalBidCount: (product.totalBidCount || 0) + 1
          }));

          return {
            ...prev,
            mainProduct: updatedMainProduct,
            subProducts: updatedSubProducts,
            products: updatedSubProducts // Update products array as well
          };
        });
      } else {
        console.log('main product is missing to update bid count');
      }


       const buyerId = productResponse?.mainProduct.userId?._id;
    const productId = productResponse?.mainProduct._id;
    const sellerId = userProfile?.user._id;
    const budgetAmount = Number(getValues().budgetQuation) || 0;
      createRequirementFn({   
        productId,
        sellerId,
        buyerId,
        budgetAmount
      });

        toast.success('Quote created successfully');
      setSellerVerification(false);
      setBusinessType('');
      reset({
        firstName: userProfile.user.firstName,
        lastName: userProfile.user.lastName,
        budgetQuation: '', // this is quotedPrice
        // availableBrand: '',
        earliestDeliveryDate: undefined, // this is deliveryTimeLine
        taxes:'',
        buyerNote:'',
        freightTerms:'',
        location:'',
        paymentTerms:'',
        priceBasis:'',
        // quotedPrice:"",
        sellerType:''
        
      });

    }

    
   
  }, [createBidRes]);


  useEffect(() => {
    if (userProfile?.user) {
      const savedData = localStorage.getItem("preLoginBidForm");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        reset({
          ...parsedData,
          firstName: bidOverviewRes ? bidOverviewRes?.seller?.firstName : userProfile.user.firstName,
          lastName: bidOverviewRes ? bidOverviewRes?.seller?.lastName : userProfile.user.lastName,
        });

        localStorage.removeItem("preLoginBidForm");
      } else {
        reset({
          firstName: bidOverviewRes ? bidOverviewRes?.seller?.firstName : userProfile.user.firstName,
          lastName: bidOverviewRes ? bidOverviewRes?.seller?.lastName : userProfile.user.lastName,
          budgetQuation: bidOverviewRes ? bidOverviewRes?.budgetQuation : '',
          // availableBrand: bidOverviewRes ? bidOverviewRes?.availableBrand : '',
          earliestDeliveryDate: bidOverviewRes ? bidOverviewRes?.earliestDeliveryDate : undefined,
          sellerType: bidOverviewRes ? bidOverviewRes?.sellerType : '',
          priceBasis: bidOverviewRes ? bidOverviewRes?.priceBasis : '',
          taxes: bidOverviewRes ? bidOverviewRes?.taxes : '',
          location: bidOverviewRes ? bidOverviewRes?.location : '',
          freightTerms: bidOverviewRes ? bidOverviewRes?.freightTerms : '',
          paymentTerms: bidOverviewRes ? bidOverviewRes?.paymentTerms : '',
          buyerNote: bidOverviewRes ? bidOverviewRes?.buyerNote : '',
        });
      }
    }
  }, [userProfile, reset, bidOverviewRes]);


  useEffect(() => {
    if (error === 'invalid product ID') {
      //  send to 404 page (API error)
    }
  }, [])



  useEffect(() => {
    for (let i = 0; i < Object.entries(errors).length; i++) {
      toast.error(Object.entries(errors)[i][1]?.message)
      break;
    }
  }, [errors])

  const handleDocumentDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleBidView = async (productId: string) => {
    await getBidByProductIdFn(productId)
  }


  useEffect(() => {
    if (getBidByProductIdRes) {
      const { _id } = getBidByProductIdRes;
      navigate('/bid-overview/' + _id)
    }
  }, [getBidByProductIdRes])


  const SellerForm = () => {
    return (
      <form className="lg:col-span-5 bg-gray-200/80 rounded-lg p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <h3 className="font-semibold text-orange-600">Seller Quotation Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {
            userProfile?.user?._id && (
              <>
                <div>
                  <Label htmlFor="firstName" className="mb-2 text-sm">First Name</Label>
                  <Input disabled type="text" placeholder="First Name" id="firstName" {...register("firstName")} className="bg-white  select-none" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="mb-2 text-sm">Last Name</Label>
                  <Input disabled type="text" placeholder="Last Name" id="lastName" {...register("lastName")} className="bg-white  select-none" />
                </div>
              </>
            )
          }
          {/* <div>
            <Label htmlFor="bq" className="mb-2 text-sm">Budget Quotation</Label>
            <Input type="number" placeholder="₹ 00" id="bq" className="bg-white" {...register('budgetQuation')} />
          </div> */}
          {/* <div>
            <Label htmlFor="ab" className="mb-2 text-sm">Available Brand</Label>
            <Input type="text" placeholder="Brand XYZ" className="bg-white" {...register('availableBrand')} />
          </div> */}
          {/* <div >

            <Label htmlFor="ab" className="mb-2 text-sm">Earliest Deliver By</Label>
            <Controller
              control={control}
              name="earliestDeliveryDate"
              render={({ field }) => (
                <DatePicker
                  disabledBeforeDate={new Date(new Date().getTime())}
                  date={field.value}
                  title="DD-MM-YYYY"
                  className="w-full"
                  setDate={(val) => field.onChange(val)}
                />
              )}
            />

          </div> */}
          {/*  Seller Type */}
          <div>
  <Label className="mb-2 text-sm">Seller Type</Label>
  <Controller
    name="sellerType"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Seller Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
           <SelectItem value="manufacturer">Manufacturer</SelectItem>
            <SelectItem value="trader_wholesaler">Trader / Wholesaler</SelectItem>
            <SelectItem value="distributor">Distributor</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
  />
</div>

          <div>
            <Label htmlFor="ab" className="mb-2 text-sm">Quoted Price(₹)</Label>
            <Input type="number" placeholder="Quoted Price" className="bg-white" {...register('budgetQuation')} />
          </div>
          {/* Price Basis */}
         <div>
  <Label className="mb-2 text-sm">Price Basis</Label>
  <Controller
    name="priceBasis"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Price Basis" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="per_unit">Per Unit</SelectItem>
            <SelectItem value="per_kg">Per Kg</SelectItem>
            <SelectItem value="per_lot">Per Lot</SelectItem>
            <SelectItem value="per_piece">Per Piece</SelectItem>
            <SelectItem value="per_service">Per Service</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
  />
</div>

{/* Taxes */}
           <div>
  <Label className="mb-2 text-sm">Taxes</Label>
  <Controller
    name="taxes"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Taxes" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="inclusive_gst">Inclusive of GST</SelectItem>
            <SelectItem value="exclusive_gst">Exclusive of GST</SelectItem>
            <SelectItem value="gst_rate">GST Rate (%)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
  />
</div>

            <div>
            <Label htmlFor="ab" className="mb-2 text-sm">Location</Label>
            <Input type="text" placeholder="Location"  className="bg-white" {...register('location')} />
          </div>
           {/* <div>
            <Label htmlFor="ab" className="mb-2 text-sm">Available Qty. / Cap.</Label>
            <Input type="number" placeholder="Enter MOQ"  className="bg-white" {...register('availableBrand')} />
          </div> */}
           <div >

            <Label htmlFor="ab" className="mb-2 text-sm">Delivery Timeline</Label>
            <Controller
              control={control}
              name="earliestDeliveryDate"
              render={({ field }) => (
                <DatePicker
                  disabledBeforeDate={new Date(new Date().getTime())}
                  date={field.value}
                  title="DD-MM-YYYY"
                  className="w-full"
                  setDate={(val) => field.onChange(val)}
                />
              )}
            />
          </div>
          {/* Freight Terms */}
          <div>
  <Label className="mb-2 text-sm">Freight Terms</Label>
  <Controller
    name="freightTerms"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Freight Terms" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="ex_works">Ex-Works</SelectItem>
            <SelectItem value="fob">FOB</SelectItem>
            <SelectItem value="delivered">Delivered (DAP / DDP)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
  />
</div>
{/* Payment Terms */}
           <div>
  <Label className="mb-2 text-sm">Payment Terms</Label>
  <Controller
    name="paymentTerms"
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Select Payment Terms" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="advance">Advance</SelectItem>
            <SelectItem value="partial_advance">Partial Advance</SelectItem>
            <SelectItem value="on_delivery">On Delivery</SelectItem>
            <SelectItem value="credit">Credit (X days)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
  />
</div>

             <div className="w-full col-span-2">
            <Label htmlFor="ab" className="mb-2 text-sm">Buyer Note</Label>
          <Textarea {...register('buyerNote')} placeholder="Short message (hard limit: 300 characters)"  className="bg-white w-full" />
          </div>
        </div>
        {
          !bidOverviewRes ? (
            <Button
              type="submit"
              disabled={productResponse?.mainProduct?.userId?._id === userProfile?.user?._id || createBidLoading}
              variant={'ghost'} className="w-32 float-end border text-xs bg-orange-700  transition-all ease-in-out duration-300 hover:bg-orange-600 text-white hover:text-white cursor-pointer">
              Place Quote
            </Button>
          ) :
            (
              <Button
                type="submit"
                disabled={updateUserBidDetsLoading}
                variant={'ghost'} className="w-32 float-end border shadow-orange-500 border-orange-500 bg-orange-600  transition-all ease-in-out duration-300 hover:bg-orange-500 text-white hover:text-white cursor-pointer">
                {
                  updateUserBidDetsLoading ?
                    <Spinner className="w-5 h-5 animate-spin" />
                    :
                    'Update Bid'
                }
              </Button>
            )
        }
        <div>

        </div>
      </form>
    )
  }

  const MergeBidForm =()=>{
     const {user} = getUserProfile()
      const [mergeFormState,setMergeFormState]= useState({
          message:''
        })

      function handleSendMessage(e:FormEvent<HTMLFormElement>){
        e.preventDefault();
        const currentProduct = productResponse?.mainProduct;
        const sellerId = user._id;
        const buyerId = currentProduct?.userId?._id
        console.log(user,currentProduct,324)
        
        
      localStorage.setItem('chatIds', JSON.stringify({
        productId: currentProduct._id,
        buyerId: buyerId,
        sellerId: sellerId
      }))

      navigate('/chat', {
        state: {
          productId: currentProduct._id,
          buyerId: buyerId,
          sellerId: sellerId,
          partnerName: mergeName(user),
          partnerAvatar: user?.profileImage,
          message:mergeFormState.message
        }
      })
  

      }

    return(
         <form className="lg:col-span-5 bg-gray-200/80 rounded-lg p-6 space-y-4 my-auto h-fit" onSubmit={handleSendMessage}>
        <h3 className="font-semibold text-orange-600">Merge Quote</h3>
       <div className="w-full col-span-2">
            <Label htmlFor="ab" className="mb-2 text-sm">
              Note for Buyer
            </Label>
          <Textarea
          value={mergeFormState.message}
          onInput={(e)=>{
            setMergeFormState({message:e.currentTarget.value})
          }}
           placeholder="Short message (hard limit: 300 characters)"  className="bg-white w-full min-h-32"  />
          </div>
            <Button
              type="submit"
             disabled={productResponse?.mainProduct?.userId?._id === userProfile?.user?._id  || mergeFormState.message.trim().length < 2}
              variant={'ghost'} className="w-32 float-end border text-xs bg-orange-700  transition-all ease-in-out duration-300 hover:bg-orange-600 text-white hover:text-white cursor-pointer">
              Chat Now
            </Button>
      </form>
    )
  }

   const  isMergeQuote =  productResponse?.mainProduct?.isMergeQuote ;

  return (

    <>
      {
        (bidOverLoading || productViewLoading) ? <div className="max-w-7xl mx-auto p-4 ">
          <CategoryFormSkeleton />
        </div> :
          <div className="w-full max-w-7xl mx-auto p-4 min-h-screen">

            {
              <Authentication setOpen={setOpen} open={open} />
            }
            <SellerVerificationPopup
              businessDets={businessDets}
              setBusinessDets={setBusinessDets}
              setOpen={setSellerVerification} open={sellerVerification} setValue={setBusinessType} value={businessType} handleCreteBid={handleCreteBid} createBidLoading={createBidLoading} />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem className="flex items-center gap-2 cursor-pointer " onClick={() => navigate(-1)}>
                  <Home className="h-4 w-4" />
                  <BreadcrumbSeparator />
                  <BreadcrumbPage className="capitalize font-regular text-gray-500">
                    Product
                  </BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage className="capitalize font-regular text-gray-500">
                    {bidOverviewRes ? bidOverviewRes?.product?.title : productResponse?.mainProduct?.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/*  for single product */}
            {
              (productResponse?.subProducts?.length === 0 || bidOverviewRes)
                ?
                // Single Product
                <div className="">
                  {/* Content */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Image */}
                    <div className="lg:col-span-4 bg-gray-100 flex justify-center items-center rounded-lg p-4 max-h-64 ">
                      <img
                        src={(bidOverviewRes ? bidOverviewRes?.product?.image : productResponse?.mainProduct?.image) || '/no-image.webp'}
                        alt="Product"

                        className="object-contain h-full w-full mix-blend-darken"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="lg:col-span-8 bg-transparent rounded-lg p-4 space-y-4">
                      <h2 className="text-sm font-medium mb-2">
                        Date : {dateFormatter(bidOverviewRes ? bidOverviewRes?.product?.createdAt : productResponse?.mainProduct?.createdAt)}
                      </h2>

                      <h2 className="text-xl font-bold capitalize">
                        {
                          bidOverviewRes ? bidOverviewRes?.product?.title : productResponse?.mainProduct?.title}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {productResponse?.mainProduct?.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1 pr-3 border-r-2 py-1 min-w-32 max-w-[25%]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                          </svg>
                          <span className="capitalize">{mergeName(bidOverviewRes ? bidOverviewRes?.buyer : productResponse?.mainProduct?.userId) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1  pr-3 border-r-2 py-1 min-w-32   max-w-[50%]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                            <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                          </svg>
                          <span className=" line-clamp-2">{bidOverviewRes ? bidOverviewRes?.buyer?.address : productResponse?.mainProduct?.userId?.address || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 py-1 min-w-32 max-w-[25%]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                            <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                          </svg>
                          <span className="capitalize">{bidOverviewRes ? bidOverviewRes?.product?.quantity : productResponse?.mainProduct?.quantity || 'N/A'} units</span>
                        </div>
                      </div>


                      {/* Buttons */}
                      {
                        !isMergeQuote &&   <div className="flex items-center gap-4 mt-5 ">
                        <Button
                          disabled={getBidByProductIdLoading || (bidOverviewRes ? bidOverviewRes.product?.totalBidCount : productResponse?.mainProduct?.totalBidCount) === 0}
                          // onClick={()=>{
                          //   console.log( productResponse?.mainProduct?._id,123)
                          //   alert('asd')
                          //  navigate('/bid-overview/' + (bidOverviewRes ? bidOverviewRes?.product?._id : productResponse?.mainProduct?._id))
                          // }}
                          onClick={() => handleBidView(bidOverviewRes ? bidOverviewRes?.product?._id : productResponse?.mainProduct?._id)}
                          variant="outline" className="min-w-32 text-sm border-gray-400 bg-transparent border-[2px] flex items-center gap-2 hover:bg-transparent  cursor-pointer">
                          <img src="/icons/Layer_1.png" className="w-4 h-4 " />
                          Total Quote :<span className="font-semibold">{bidOverviewRes ? bidOverviewRes.product?.totalBidCount : productResponse?.mainProduct?.totalBidCount || 0}</span>
                        </Button>
                        {
                          !bidOverviewRes && (
                            <Button
                              className="min-w-32 border-[2px] border-orange-500 text-orange-500 hover:bg-orange-600 hover:text-white transition-all ease-in-out duration-300 cursor-pointer"
                              variant="outline"
                              onClick={() => handleAddToCart(productResponse?.mainProduct?._id)}
                              disabled={
                                addToCartLoading ||
                                productResponse?.mainProduct?.userId?._id === userProfile?.user?._id
                              }
                            >
                              {addToCartLoading ? <Spinner className="w-5 h-5 animate-spin" /> : "Add to Cart"}
                            </Button>
                          )
                        }
                      </div>
                      }
                   
                    </div>
                  </div>

                  {/* Requirement + Form */}
                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 ">
                    {/* Left: Requirement Spec */}
                    <div className="lg:col-span-7  rounded-lg p-6 space-y-3 ">
                      <h3 className="font-semibold text-orange-600 text-xl">Requirement Specifications</h3>
                      <div className="text-sm space-y-2 text-gray-600 ">
                        <p className="flex items-center justify-between py-2 border-b-2 capitalize "><span className="font-semibold">Product Condition:</span> {(bidOverviewRes ? bidOverviewRes?.product?.subCategory?.name : productResponse?.mainProduct?.categoryId?.categoryName) || "N/A"}</p>
                        <p className="flex items-center justify-between py-2 border-b-2 capitalize "><span className="font-semibold">Brand:</span> {(bidOverviewRes ? otherBrandValue(bidOverviewRes?.product) : otherBrandValue(productResponse?.mainProduct)) || "N/A"}</p>
                        {productResponse?.mainProduct?.categoryId?.categoryName === "industrial" && (

                          <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Construction Tool Type:</span> Industrial Tool</p>
                        )}
                        {
                          (bidOverviewRes?.product?.minimumBudget || productResponse?.mainProduct?.minimumBudget) && (

                            <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Budget:</span> {currencyConvertor(bidOverviewRes ? bidOverviewRes?.product?.minimumBudget
                              : productResponse?.mainProduct?.minimumBudget)}</p>
                          )
                        }



                        {/* <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Budget:</span> {currencyConvertor(bidOverviewRes ? bidOverviewRes?.product?.budget
                        : productResponse?.mainProduct?.budget || 0) || 'N/A'}</p> */}


                        {/* <p className="flex items-center justify-between py-2 border-b-2 capitalize "><span className="font-semibold capitalize">Additional Delivery & Packaging:</span> {(bidOverviewRes ? bidOverviewRes?.product?.additionalDeliveryAndPackage : productResponse?.mainProduct?.additionalDeliveryAndPackage) || "N/A"}</p> */}

                        <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Required Delivery Date:</span> {dateFormatter(bidOverviewRes ? bidOverviewRes?.product?.paymentAndDelivery?.ex_deliveryDate : productResponse?.mainProduct?.paymentAndDelivery?.ex_deliveryDate) || 'N/A'}</p>

                        {
                          (bidOverviewRes ? bidOverviewRes?.product?.color : productResponse?.mainProduct?.color) && <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Color:</span> {(bidOverviewRes ? bidOverviewRes?.product?.color : productResponse?.mainProduct?.color) || 'N/A'}</p>

                        }

                        {
                          (bidOverviewRes ? bidOverviewRes?.product?.typeOfVehicle : productResponse?.mainProduct?.typeOfVehicle) && <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Type of Vehicle:</span> {(bidOverviewRes ? bidOverviewRes?.product?.typeOfVehicle : productResponse?.mainProduct?.typeOfVehicle) || 'N/A'}</p>

                        }


                        {
                          (bidOverviewRes ? bidOverviewRes?.product?.typeOfProduct : productResponse?.mainProduct?.typeOfProduct) && <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Type of Product:</span> {(bidOverviewRes ? bidOverviewRes?.product?.typeOfProduct : productResponse?.mainProduct?.typeOfProduct) || 'N/A'}</p>

                        }


                        <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Payment Mode:</span> {(bidOverviewRes ? bidOverviewRes?.product?.paymentAndDelivery?.paymentMode : productResponse?.mainProduct?.paymentAndDelivery?.paymentMode) || 'N/A'}</p>
                        {/* <p className="flex items-center justify-between py-2 border-b-2  "><span className="font-semibold">Supporting Documents:</span>{(productResponse?.mainProduct?.document || bidOverviewRes?.product?.document) ? <a download target="_blank" href={productResponse?.mainProduct?.document || bidOverviewRes?.product?.document} className="flex gap-1 items-center hover:underline cursor-pointer"><Paperclip className="w-4 h-4 text-orange-600" />Download Document</a> : 'N/A'}</p> */}
                        <p className="flex items-center justify-between py-2 border-b-2  "><span className="font-semibold">Supporting Documents:</span>{(productResponse?.mainProduct?.document || bidOverviewRes?.product?.document) ? <p
                          onClick={() => handleDocumentDownload(
                            productResponse?.mainProduct?.document || bidOverviewRes?.product?.document,
                          )}
                          className="flex gap-1 items-center hover:underline cursor-pointer"><Paperclip className="w-4 h-4 text-orange-600" />Download Document</p> : 'N/A'}</p>

                      </div>
                    </div>

                    {/* Right: Form */}
                    {
                      isMergeQuote ? <MergeBidForm></MergeBidForm> : <SellerForm/>
                    }
                  </div>
                </div>
                :
                //  Multiple products
                productResponse?.subProducts && productResponse?.subProducts.map((item: any, idx: any) => {
                  const isLast = idx === productResponse?.subProducts?.length - 1;
                  return (
                    <>
                      {/* Content */}
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Image */}
                        <div className="lg:col-span-4 bg-gray-100 flex justify-center items-center rounded-lg p-4 max-h-64 ">
                          <img
                            src={(bidOverviewRes ? bidOverviewRes?.product?.image : item?.image) || '/no-image.webp'}
                            alt="Product"

                            className="object-contain h-full w-full mix-blend-darken"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="lg:col-span-8 rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-sm font-medium mb-2">
                              Date : {dateFormatter(bidOverviewRes ? bidOverviewRes?.product?.createdAt : item?.createdAt)}
                            </h2>
                            <div className="flex gap-1 items-center">
                              <Box className="w-5 h-5 text-orange-500" />
                              <p className="text-gray-500 text-sm font-semibold">Product ({idx + 1})</p>
                            </div>
                          </div>

                          <h2 className="text-xl font-bold capitalize">
                            {
                              bidOverviewRes ? bidOverviewRes?.product?.title : item?.title}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {item?.description}
                          </p>

                          {/* Meta Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1 pr-3 border-r-2 py-1 min-w-32 max-w-[25%]">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                              </svg>
                              <span className="capitalize">{mergeName(bidOverviewRes ? bidOverviewRes?.buyer : item?.userId) || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1  pr-3 border-r-2 py-1 min-w-32   max-w-[50%]">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                              </svg>
                              <span className=" line-clamp-2">{bidOverviewRes ? bidOverviewRes?.buyer?.address : item?.userId?.address || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1 py-1 min-w-32 max-w-[25%]">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-gray-500">
                                <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                              </svg>
                              <span className="capitalize">{bidOverviewRes ? bidOverviewRes?.product?.quantity : item?.quantity || 'N/A'} units</span>
                            </div>
                          </div>

                          {/* Buttons */}
                          {
                            idx === 0 && (
                              <div className="flex items-center gap-4 mt-5 ">
                                <Button
                                  disabled={getBidByProductIdLoading || (bidOverviewRes ? bidOverviewRes.product?.totalBidCount : item?.totalBidCount) === 0}

                                  onClick={() => handleBidView(bidOverviewRes ? bidOverviewRes?.product?._id : item?._id)}


                                  //     onClick={()=>{
                                  //       console.log(bidOverviewRes ? bidOverviewRes?.product?._id : item?._id,12)
                                  //   navigate('/bid-overview/'+(bidOverviewRes ? bidOverviewRes?.product?._id : item?._id))
                                  // }}
                                  variant="outline" className="min-w-32 text-sm border-gray-400 bg-transparent border-[2px] flex items-center gap-2 hover:bg-transparent  cursor-pointer ">
                                  <img src="/icons/Layer_1.png" className="w-4 h-4 " />
                                  Total Quote :<span className="font-semibold">{bidOverviewRes ? bidOverviewRes.product?.totalBidCount : item?.totalBidCount || 0}</span>

                                </Button>
                                {
                                  !bidOverviewRes && (
                                    <Button
                                      className="min-w-32 border-[2px] border-orange-500 text-orange-500 hover:bg-orange-600 hover:text-white transition-all ease-in-out duration-300 cursor-pointer"
                                      variant="outline"
                                      onClick={() => handleAddToCart(item?._id)}
                                      disabled={
                                        addToCartLoading ||
                                        item?.userId?._id === userProfile?.user?._id
                                      }
                                    >
                                      {addToCartLoading ? <Spinner className="w-5 h-5 animate-spin" /> : "Add to Cart"}
                                    </Button>
                                  )
                                }
                              </div>
                            )
                          }
                        </div>
                      </div>

                      {/* Requirement + Form */}
                      <div className={`mt-5 grid grid-cols-1 lg:${isLast ? 'grid-cols-12' : 'grid-cols-1'} gap-6`}>
                        <div className={`grid lg:${isLast ? 'col-span-7' : 'col-span-1'}  rounded-lg  space-y-3 `}>
                          <h3 className="font-semibold text-orange-600 text-xl">Requirement Specifications</h3>
                          <div className="text-sm space-y-2 text-gray-600 ">
                            <p className="flex items-center justify-between py-2 border-b-2 capitalize "><span className="font-semibold">Product Condition:</span> {(bidOverviewRes ? bidOverviewRes?.product?.subCategory?.name : item?.categoryId?.categoryName) || "N/A"}</p>
                            <p className="flex items-center justify-between py-2 border-b-2 capitalize "><span className="font-semibold">Brand:</span> {(bidOverviewRes ? otherBrandValue(bidOverviewRes?.product) : otherBrandValue(item)) || "N/A"}</p>
                            {item?.categoryId?.categoryName === "industrial" && (

                              <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Construction Tool Type:</span> Industrial Tool</p>
                            )}
                            {
                              (bidOverviewRes?.product?.minimumBudget || item?.minimumBudget) && (

                                <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Budget:</span> {currencyConvertor(bidOverviewRes ? bidOverviewRes?.product?.minimumBudget
                                  : item?.minimumBudget)}</p>
                              )
                            }

                            {/* <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Budget:</span> {currencyConvertor(bidOverviewRes ? bidOverviewRes?.product?.budget
                            : item?.budget || 0) || 'N/A'}</p> */}


                            {/* <p className="flex items-center justify-between py-2 border-b-2 capitalize "><span className="font-semibold capitalize">Additional Delivery & Packaging:</span> {(bidOverviewRes ? bidOverviewRes?.product?.additionalDeliveryAndPackage : item?.additionalDeliveryAndPackage) || "N/A"}</p> */}

                            <p className="flex items-center justify-between py-2 border-b-2 "><span className="font-semibold">Required Delivery Date:</span> {dateFormatter(bidOverviewRes ? bidOverviewRes?.product?.paymentAndDelivery?.ex_deliveryDate : item?.paymentAndDelivery?.ex_deliveryDate) || 'N/A'}</p>




                            {
                              (bidOverviewRes ? bidOverviewRes?.product?.color : item?.color) && <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Color:</span> {(bidOverviewRes ? bidOverviewRes?.product?.color : item?.color) || 'N/A'}</p>

                            }

                            {
                              (bidOverviewRes ? bidOverviewRes?.product?.typeOfVehicle : item?.typeOfVehicle) && <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Type of Vehicle:</span> {(bidOverviewRes ? bidOverviewRes?.product?.typeOfVehicle : item?.typeOfVehicle) || 'N/A'}</p>

                            }


                            {
                              (bidOverviewRes ? bidOverviewRes?.product?.typeOfProduct : item?.typeOfProduct) && <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Type of Product:</span> {(bidOverviewRes ? bidOverviewRes?.product?.typeOfProduct : item?.typeOfProduct) || 'N/A'}</p>

                            }


                            <p className="flex items-center justify-between py-2 border-b-2 capitalize"><span className="font-semibold">Payment Mode:</span> {bidOverviewRes ? bidOverviewRes?.product?.paymentAndDelivery?.paymentMode : item?.paymentAndDelivery?.paymentMode || 'N/A'}</p>

                            <p className="flex items-center justify-between py-2 border-b-2  "
                            ><span className="font-semibold">Supporting Documents:</span>{(item?.document || bidOverviewRes?.product?.document) ? <span
                              onClick={() => {
                                handleDocumentDownload(item?.document || bidOverviewRes?.product?.document)
                              }}
                              className="flex gap-1 items-center hover:underline cursor-pointer"><Paperclip className="w-4 h-4 text-orange-600" /> {item?.document || bidOverviewRes?.product?.document}</span> : 'N/A'}</p>

                          </div>
                        </div>
                        {
                          idx === productResponse?.products?.length - 1 && (
                            // <form className="lg:col-span-5  bg-gray-200/80 rounded-lg p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                            //   <h3 className="font-semibold text-orange-600">Fill the Details to Place Bid</h3>
                            //   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            //     {
                            //       userProfile?.user?._id && (
                            //         <>
                            //           <div>
                            //             <Label htmlFor="firstName" className="mb-2 text-sm">First Name</Label>
                            //             <Input disabled type="text" placeholder="First Name" id="firstName" {...register("firstName")} className="bg-white  select-none" />
                            //           </div>
                            //           <div>
                            //             <Label htmlFor="lastName" className="mb-2 text-sm">Last Name</Label>
                            //             <Input disabled type="text" placeholder="Last Name" id="lastName" {...register("lastName")} className="bg-white  select-none" />
                            //           </div>
                            //         </>
                            //       )
                            //     }
                            //     <div>
                            //       <Label htmlFor="bq" className="mb-2 text-sm">Budget Quotation</Label>
                            //       <Input type="number" placeholder="₹ 00" id="bq" className="bg-white" {...register('budgetQuation')} />
                            //     </div>
                            //     <div>
                            //       <Label htmlFor="ab" className="mb-2 text-sm">Available Brand</Label>
                            //       <Input type="text" placeholder="Brand XYZ" id="ab" className="bg-white" {...register('availableBrand')} />
                            //     </div>
                            //     <div className="col-span-2">
                            //       <Label htmlFor="ab" className="mb-2 text-sm">Earliest Deliver By</Label>
                            //       <Controller
                            //         control={control}
                            //         name="earliestDeliveryDate"
                            //         render={({ field }) => (
                            //           <DatePicker
                            //             disabledBeforeDate={new Date(new Date().getTime())}
                            //             date={field.value}
                            //             title="DD-MM-YYYY"
                            //             className="w-full"
                            //             setDate={(val) => field.onChange(val)}
                            //           />
                            //         )}
                            //       />
                            //     </div>

                            //   </div>
                            //   {
                            //     !bidOverviewRes ? (
                            //       <Button
                            //         disabled={productResponse?.mainProduct?.userId?._id === userProfile?.user?._id || createBidLoading}
                            //         variant={'ghost'} className="w-32 float-end border text-xs bg-orange-700  transition-all ease-in-out duration-300 hover:bg-orange-600 text-white hover:text-white cursor-pointer">
                            //         Place Bid
                            //       </Button>
                            //     ) :
                            //       (
                            //         <Button
                            //           disabled={updateUserBidDetsLoading}
                            //           variant={'ghost'} className="w-32 float-end border shadow-orange-500 border-orange-500 bg-orange-600  transition-all ease-in-out duration-300 hover:bg-orange-500 text-white hover:text-white cursor-pointer">
                            //           {
                            //             updateUserBidDetsLoading ?
                            //               <Spinner className="w-5 h-5 animate-spin" />
                            //               :
                            //               'Update Bid'
                            //           }
                            //         </Button>
                            //       )
                            //   }
                            // </form>
                            <SellerForm />
                          )
                        }
                      </div>
                      {
                        productResponse?.subProducts.length > -1 && idx < productResponse?.subProducts.length - 1 && <div className="bg-gray-400 w-full h-[2px] my-5"></div>
                      }
                    </>
                  )
                })
            }




          </div>
      }

    </>

  );
};

export default ProductOverview;
