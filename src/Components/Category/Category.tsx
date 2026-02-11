import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../Components/ui/breadcrumb";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Textarea } from "../../Components/ui/textarea";
import { PlusIcon, FileUp, MoveLeft, XIcon, Trash2, CloudUpload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import { DatePicker } from "../../utils/DatePicker";
import { Range } from "react-range";

import { CategoryFormSchema } from "@/validations/Schema";
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useFetch } from "@/helper/use-fetch";
import productService from "@/services/product.service";
import categoryService from "@/services/category.service";
import { Spinner } from "../ui/shadcn-io/spinner";
import { getUserProfile } from "@/zustand/userProfile";
import { SearchableDropdown } from "@/utils/searchableDropdown";
import { electronicCategories, constructionIndustrialCategories, fashionCategories, furnitureCategories, homeAppliancesCategories, beautyCategories, sportCategories, vehicleCategories, serviceCategories, otherCategories } from "@/const/categoriesData";
import { getCategorySpecificFields } from "@/const/categoriesFormdataFields";
import Authentication from "../auth/Authentication";
import PlaceRequirementPopup from "../Popup/PlaceRequirementPopup";
import { ImageSizeIncrease } from "@/helper/imageSizer";
import TooltipComp from "@/utils/TooltipComp";

const innerFormImages = {
  automobile: "automobileFormImage.png",
  fashion: "fashionFormImage.png",
  electronics: "electronicsFormImage.png",
  home: "homeapplianceFormImage.png",
  sports: "sportsFormImage.png",
  furniture: "furnitureFormImage.png",
  health: "healthFormImage.png",
  beauty: "beautyFormImage.png",
  service: "servicesFormImage.png",
  industrial: "constructionFormImage.png",
  others: 'otherImage.webp'
} as any

function getSubCategories(categoryName: string) {
  switch (categoryName) {
    case "automobile":
      return vehicleCategories;
    case "fashion":
      return fashionCategories;
    case "electronics":
      return electronicCategories;
    case "home":
      return homeAppliancesCategories;
    case "sports":
      return sportCategories;
    case "furniture":
      return furnitureCategories;
    case "beauty":
      return beautyCategories;
    case "industrial":
      return constructionIndustrialCategories;
    case "service":
      return serviceCategories;
    case "others":
      return otherCategories;
    default:
      return []
  }
}


const CategoryForm = ({
  formIndex,
  currentCategoryName,
  catByIdData,
  subCategroies,
  subCategoriesData,
  onFormDataChange,
  onRemoveForm,
  showRemoveButton = false,
  resetForm = false,
  subCategoryId
}: any) => {
  const [date, setDate] = useState(undefined);
  const [values, setValues] = useState([0, 2]);
  const [image, setImage] = useState(null);
  const [fileDoc, setFileDoc] = useState(null);
  const [brand, setbrand] = useState('');
  const [brandRenderItems, setBrandRenderItems] = useState([]);
  const imageRef = useRef(null);
  const fileDocRef = useRef<HTMLInputElement>(null);

  const { watch, setValue, formState: { }, register, getValues, reset: resetFormHook } = useForm({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      title: '',
      quantity: '',
      subCategoryId: '',
      minimumBudget: '',
      productType: '',
      oldProductValue: {
        min: '',
        max: ''
      },
      productCondition: '',
      // categoryId : '',
      image: '',
      document: '',
      description: '',
      paymentAndDelivery: {
        ex_deliveryDate: undefined,
        paymentMode: '',
        gstNumber: '',
        organizationName: '',
        organizationAddress: ''
      },
      draft: false,
      gst_requirement: '',
      brand: '',
      additionalDeliveryAndPackage: '',
      gender: '',
      typeOfAccessories: '',
      fuelType: '',
      model: '',
      color: '',
      transmission: '',
      conditionOfProduct: '',
      toolType: '',
      rateAService: '',
      brandName: '', // only  applicable  for other brand field in brand section
      typeOfVehicle: '',
      typeOfProduct: ''

    }
  });

  const gstField = watch("gst_requirement");
  const productField = watch("productType");
  // const selectedSubategryId = watch("subCategoryId");
  const paymentMode = watch("paymentAndDelivery.paymentMode");
  // const additionalDeliveryValue = watch("additionalDeliveryAndPackage");
  const genderValue = watch("gender");
  // const typeOfAccessoriesValue = watch("typeOfAccessories");
  const fuelTypeValue = watch("fuelType");
  // const modelValue = watch("model");
  const colorValue = watch("color");
  const transmissionValue = watch("transmission");
  const conditionOfProductValue = watch("conditionOfProduct");
  const toolTypeValue = watch("toolType");
  const rateAServiceValue = watch("rateAService");
  const [subCatgoryName, setSubcategoryName] = useState('')
  // Update parent with form data whenever form changes
  useEffect(() => {
    const subscription = watch(() => {
      const formData = {
        ...getValues(),
        image: image,
        document: fileDoc,
        formIndex: formIndex
      };
      onFormDataChange(formIndex, formData);
    });
    return () => subscription.unsubscribe();
  }, [watch, image, fileDoc, formIndex, onFormDataChange, getValues]);

  useEffect(() => {
    setValue("oldProductValue.min", values[0].toString());
    setValue("oldProductValue.max", values[1].toString());
  }, [values, setValue]);

  useEffect(() => {
    setValue('brand', brand);
  }, [brand, setValue]);


  useEffect(() => {
    if (resetForm) {
      resetFormHook();
      setDate(undefined);
      setValues([0, 2]);
      setImage(null);
      setFileDoc(null);
      setbrand('');
      setBrandRenderItems([]);

      // Clear file inputs
      if (imageRef.current) (imageRef as any).current.value = '';
      if (fileDocRef.current) fileDocRef.current.value = '';
    }
  }, [resetForm, resetFormHook]);



  function populateBrands() {
    if (subCategoryId) {
      const selectProductName = catByIdData?.subCategories.find((item: any) => item._id === subCategoryId)?.name || 'N/A';
      const brandsArray = subCategoriesData.find((item: any) =>
        item.category.replace(/\s+/g, '').toLowerCase() === selectProductName.replace(/\s+/g, '').toLowerCase()
      )?.brands;
      setSubcategoryName(selectProductName)
      if (brandsArray?.length > 0) {
        setBrandRenderItems(brandsArray);
      }
      setValue('subCategoryId', subCategoryId);
    }
  }

  useEffect(() => {
    populateBrands()
  }, [subCategoryId, catByIdData, subCategoriesData])


  useEffect(() => {
    if (brand !== 'other') {
      setValue('brandName', '')
    }
  }, [brand])


  return (
    <div className=" relative">

      {showRemoveButton && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 cursor-pointer"
          onClick={() => onRemoveForm(formIndex)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="md:col-span-1 lg:col-span-1 bg-transparent  border-0 p-6 xs:grid xs:grid-cols-2 gap-6 space-y-4">
          <div className="col-span-1 align-center sm:block flex flex-col justify-center">
            <h2 className="text-[15px] font-semibold mb-2 text-center">
              {/* {`Tell us about the ${currentCategoryName ? currentCategoryName.charAt(0).toUpperCase() + currentCategoryName.slice(1) : 'Product'} You need`} */}
              Tell us about your need
            </h2>
            <p className="text-[13px] text-muted-foreground text-center">
              Please help us tailor the experience by filling out the form below.
              If this isn't the category you meant to choose, you can go back and
              select another one.
            </p>
          </div>
          <div className="col-span-1 w-full">
            <img
              src={'/categoryFormImages/' + innerFormImages[currentCategoryName]}
              alt=""
              loading="lazy"
              className="m-auto w-full"
            />
          </div>
        </div>

        <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
          <div className=" rounded-[5px] p-6  bg-gray-200/50">
          {/* Product Details */}
            {/* <h3 className="text-lg font-semibold text-gray-700 mb-4">Service Details</h3> */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <Input
                type="text"
                placeholder="Title* (Give a short title for your post - specify your required product in 3–4 words)"
                className="bg-white col-span-1 md:col-span-3"
                {...register('title')}
              />

              {/* <Select
                value={selectedSubategoryId}
                onValueChange={(value) => {
                  const selectProductName = catByIdData?.subCategories.find((item: any) => item._id === value)?.name || 'N/A';
                  const brandsArray = subCategoriesData.find((item: any) =>
                    item.category.replace(/\s+/g, '').toLowerCase() === selectProductName.replace(/\s+/g, '').toLowerCase()
                  )?.brands;

                  if (brandsArray?.length > 0) {
                    setBrandRenderItems(brandsArray);
                  }
                  setValue('subCategoryId', value);
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Category*"  />
                </SelectTrigger>
                <SelectContent >
                  {catByIdData && subCategroies.map((c: any) =>
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  )}
                 {
          subCategroies
            .filter((c: any) => c._id.toString() === subCategoryId)
            .map((c: any) => (
              <SelectItem key={c._id} value={c._id} >
                {c.name}
              </SelectItem>
            ))
              }

                </SelectContent>
              </Select> */}
              <Select defaultValue={subCategoryId} disabled>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Category*" />
                </SelectTrigger>

                <SelectContent>
                  {subCategroies.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>


              {currentCategoryName !== "service" && currentCategoryName !== "others" && (
                <SearchableDropdown
                  // disbaled={!selectedSubategoryId}
                  setValue={setbrand}
                  value={brand}
                  className="w-full"
                  dropdownTitle="Brands*"
                  renderItems={brandRenderItems}
                />
              )}
              
              {
                currentCategoryName === "others" && (
                  <Input
                    type="text"
                    placeholder="Brand Name..."
                    value={brand}
                    onChange={(e) => {
                      setbrand(e.target.value)
                    }}
                    className="bg-white"
                  />
                )
              }
              {
                currentCategoryName !== 'others' && brand === 'others' && (
                  <Input
                    type="text"
                    placeholder="Specific Brand Name..."
                    {...register('brandName')}
                    className="bg-white"
                  />
                )
              }
              {/* {currentCategoryName === "electronics" && ( */}
              <div className="relative">
                <p className="absolute top-1/2 left-2 text-sm  text-orange-600 font-semibold -translate-y-1/2">
                  ₹</p>
                <Input
                  type="text"
                  placeholder="Enter a Budget range"
                  {...register('minimumBudget')}
                  className="bg-white  pl-5"
                />
              </div>
              {/* )} */}

              {currentCategoryName !== "service" && (
                <Input
                  type="string"
                  placeholder="Quantity*"
                  {...register('quantity')}
                  className="bg-white col-span-1"
                />
              )}

              {/* {currentCategoryName === "service" && (
                <Select
                  value={rateAServiceValue}
                  onValueChange={(value) => setValue("rateAService", value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Rate a Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="bad">Bad</SelectItem>
                  </SelectContent>
                </Select>
              )} */}

              {/* {(currentCategoryName === "automobile" || currentCategoryName === "furniture" ||
                currentCategoryName === "sports" || currentCategoryName === "fashion" ||
                currentCategoryName === "home" || currentCategoryName === "beauty" ||
                currentCategoryName === "industrial") && (
                  <Select
                    value={additionalDeliveryValue}
                    onValueChange={(value) => setValue("additionalDeliveryAndPackage", value)}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Additional Delivery & Packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                )} */}

              {currentCategoryName === "fashion" && (
                <Select
                  value={genderValue}
                  onValueChange={(value) => setValue("gender", value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* {(currentCategoryName === "fashion" || currentCategoryName === "beauty") && (
                <Select
                  value={typeOfAccessoriesValue}
                  onValueChange={(value) => setValue("typeOfAccessories", value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Type of Accessories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="footwear">Footwear</SelectItem>
                    <SelectItem value="headware">Headware</SelectItem>
                    <SelectItem value="eyeware">Eyeware</SelectItem>
                    <SelectItem value="belts">Belts</SelectItem>
                    <SelectItem value="scarves_&_wraps">Scarves & Wraps</SelectItem>
                    <SelectItem value="watches">Watches</SelectItem>
                  </SelectContent>
                </Select>
              )} */}

              {currentCategoryName === "automobile" && !['accessories', 'bicycles',].includes(subCatgoryName.toLowerCase()) && (
                <>
                  <Select
                    value={fuelTypeValue}
                    onValueChange={(value) => setValue("fuelType", value)}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="electric">Diesel</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="electric">LPG</SelectItem>
                    </SelectContent>
                  </Select>
                  {
                    !subCatgoryName.toLowerCase().includes('accessories') && (
                      // <Select
                      //               value={modelValue}
                      //               onValueChange={(value) => setValue("model", value)}
                      //             >
                      //               <SelectTrigger className="w-full bg-white">
                      //                 <SelectValue placeholder="Model" />
                      //               </SelectTrigger>
                      //               <SelectContent>
                      //                 <SelectItem value="brand_new">Brand New (Unused)</SelectItem>
                      //                 <SelectItem value="like_new_used_3_months">Like New (Used &lt; 3 Months)</SelectItem>
                      //                 <SelectItem value="gently_used_3_6_months">Gently Used (3 - 6 Months)</SelectItem>
                      //                 <SelectItem value="used_6_12_months">Used (6 - 12 Months)</SelectItem>
                      //                 <SelectItem value="1_year_old">1 Year Old</SelectItem>
                      //                 <SelectItem value="2_year_old">2 Year Old</SelectItem>
                      //                 <SelectItem value="3_year_old">3 Year Old</SelectItem>
                      //                 <SelectItem value="4_year_old">4 Year Old</SelectItem>
                      //                 <SelectItem value="5_year_old">5 Year Old</SelectItem>
                      //                 <SelectItem value="more_than_5_year_old">More Than 5 Years Old</SelectItem>
                      //                 <SelectItem value="vintage_10_plus_years_old">Vintage (10+ Years Old)</SelectItem>
                      //                 <SelectItem value="unknown">Unknown / Not Sure</SelectItem>
                      //               </SelectContent>
                      //             </Select>
                      <Input
                        type="text"
                        placeholder="Model"
                        // value={modelValue}
                        // onChange={(e)=>{
                        //   setValue('model',e.target.value)
                        // }}
                        {...register('model')}
                        className="bg-white col-span-1"
                      />
                    )
                  }

                  {
                    !subCatgoryName.toLowerCase().includes('accessories') && (
                      //    <Select
                      //   value={colorValue}
                      //   onValueChange={(value) => setValue("color", value)}
                      // >
                      //   <SelectTrigger className="w-full bg-white">
                      //     <SelectValue placeholder="Color" />
                      //   </SelectTrigger>
                      //   <SelectContent>
                      //     <SelectItem value="red">Red</SelectItem>
                      //     <SelectItem value="blue">Blue</SelectItem>
                      //     <SelectItem value="black">Black</SelectItem>
                      //     <SelectItem value="white">White</SelectItem>
                      //     <SelectItem value="silver">Silver</SelectItem>
                      //   </SelectContent>
                      // </Select>
                      <Input
                        type="text"
                        placeholder="Color"
                        value={colorValue}
                        onChange={(e) => {
                          setValue('color', e.target.value)
                        }}
                      />
                    )
                  }

                  {
                    !['scooters', 'accessories', 'bicycles',].includes(subCatgoryName.toLowerCase()) && (
                      <Select
                        value={transmissionValue}
                        onValueChange={(value) => setValue("transmission", value)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  }
                </>
              )}

              {/*  this model for only  mobile */}
              {
                subCatgoryName.toLowerCase() === 'mobile' && (
                  <Input
                    type="text"
                    placeholder="Model"
                    {...register('model')}
                    className="bg-white col-span-1"
                  />
                )
              }

              {(currentCategoryName === "furniture" || currentCategoryName === "sports" ||
                currentCategoryName === "automobile" || currentCategoryName === "home" ||
                currentCategoryName === "electronics") &&
                currentCategoryName !== "service" &&
                currentCategoryName !== "others" && (
                  <>
                    {(productField === 'new_product' || productField === '') && (
                      <Select
                        value={productField}
                        onValueChange={(value) => setValue("productType", value)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Product Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_product">New Product</SelectItem>
                          <SelectItem value="old_product">Old Product</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {productField === 'old_product' && (
                      <>
                        <div className="w-full max-w-md border-[1.5px] border-gray-200 rounded-lg bg-white p-3">
                          <div className="flex justify-between items-center mb-3">
                            <Label className="font-medium text-gray-500 ">Old Product <sup className="hidden sm:block">(in Years)</sup></Label>
                            <XIcon
                              className="w-4 h-4 text-gray-400 cursor-pointer"
                              onClick={() => setValue('productType', 'new_product')}
                            />
                          </div>
                          <Range
                            values={values}
                            step={0.1}
                            min={0}
                            max={20}
                            onChange={(vals) => setValues(vals)}
                            renderTrack={({ props, children }) => (
                              <div
                                {...props}
                                className="h-1 w-full bg-gray-300 rounded relative"
                              >
                                <div
                                  className="absolute h-1 bg-orange-600 rounded"
                                  style={{
                                    left: `${(values[0] / 20) * 100}%`,
                                    width: `${((values[1] - values[0]) / 20) * 100}%`,
                                  }}
                                />
                                {children}
                              </div>
                            )}
                            renderThumb={({ props }) => (
                              <div
                                {...props}
                                className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center shadow"
                              />
                            )}
                          />
                          <div className="flex justify-between items-center mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Label className="text-gray-600 text-sm hidden sm:block">Min.</Label>
                              <div className="flex items-center gap-1 border rounded px-2 py-1">
                                {values[0].toString().padStart(2, "0")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 border rounded px-2 py-1">
                                {values[1]}
                              </div>
                              <Label className="text-gray-600 text-sm hidden sm:block">Max.</Label>
                            </div>
                          </div>
                        </div>
                        {/* <Select onValueChange={(val) => setValue('productCondition', val)}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Product Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="like_new">Like New</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                          </SelectContent>
                        </Select> */}
                      </>
                    )}
                  </>
                )}


              {
                currentCategoryName === 'others' && (
                  <>

                    {/* <Input
                      type="text"
                      placeholder="Product Type"
                      {...register('productType')}
                      className="bg-white"
                    /> */}

                    <Input
                      type="text"
                      placeholder="Product Condition"
                      {...register('productCondition')}
                      className="bg-white"
                    />
                  </>

                )
              }

              {productField === 'new_product' && currentCategoryName === "furniture" && (
                <Select
                  value={conditionOfProductValue}
                  onValueChange={(value) => setValue("conditionOfProduct", value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Product Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="for_parts_or_repair">For Parts Or Repair</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="vintage">Vintage (Used)</SelectItem>
                    <SelectItem value="antique">Antique</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {/* // this is a subcatgory Name */}
              {subCatgoryName === 'Commercial and other Vehicle' && currentCategoryName === 'automobile' &&
                <Input
                  type="text"
                  placeholder="Type of Vehicle"
                  {...register('typeOfVehicle')}
                  className="bg-white"
                />
              }


                <Input
                  type="text"
                  placeholder={currentCategoryName === 'service' ? 'Service Type' :'Product Type'}
                  {...register('typeOfProduct')}
                  className="bg-white"
                />
              
              {currentCategoryName === "industrial" && (
                <Select
                  value={toolTypeValue}
                  onValueChange={(value) => setValue("toolType", value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Tool Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industrial_tool">Industrial Tool</SelectItem>
                    <SelectItem value="machinery_tool">Machinery Type</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="rounded-[5px] p-6  bg-gray-200/50">
            <div className="mb-4">
              <h3 className="text-lg font-semibold  text-gray-700">Other Details</h3>
              <sup className="italic text-gray-500">Product Image and document are not mandatory.</sup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              <div
                onClick={() => (imageRef as any)?.current?.click()}
                className="border-2 border-dashed relative border-gray-300 rounded-lg flex bg-transparent flex-col items-center justify-center p-6 cursor-pointer h-32"
              >
                <CloudUpload className="h-6 w-6 mb-2 text-gray-500" />
                <span className="text-sm text-muted-foreground font-semibold">Upload Image</span>
                <p className="text-xs text-gray-500 ">to upload your image (max 2 MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={imageRef}
                  onChange={(e: any) => {
                    if (e.target.files?.[0]) {
                      const newImage = e.target.files[0];

                      if (newImage.size > 2 * 1024 * 1024) {
                        toast.info("Image size should not exceed 2MB");
                        return;
                      }
                      setImage(newImage);
                      const currentFormData = {
                        ...getValues(),
                        image: newImage,
                        document: fileDoc,
                        formIndex: formIndex
                      };
                      onFormDataChange(formIndex, currentFormData);
                    }
                  }}
                />
                {image && (
                  <p className="text-xs mt-2 text-green-600">{(image as any)?.name}</p>
                )}
                
              {image && (
  <div 
    className="absolute h-16 w-16 right-2 top-2 rounded-lg shadow select-none z-10 group"
    onMouseEnter={(e: any) => ImageSizeIncrease(e.currentTarget.querySelector('img'))}
    onMouseLeave={(e: any) => ImageSizeIncrease(e.currentTarget.querySelector('img'))}
  >
    <img 
      src={URL.createObjectURL(image)} 
      className="h-full w-full bg-white object-contain imageSizer rounded-sm"  
      alt="" 
    />
    {/* Overlay with X icon */}
    <div 
      className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200  flex items-center justify-center cursor-pointer rounded-lg"
      onClick={(e) => {
        e.stopPropagation();
        setImage(null);
        if (imageRef.current) (imageRef as any).current.value = '';
        const currentFormData = {
          ...getValues(),
          image: null,
          document: fileDoc,
          formIndex: formIndex
        };
        onFormDataChange(formIndex, currentFormData);
      }}
    >
      <XIcon className="h-6 w-6 text-white" />
    </div>
  </div>
)}
              </div>

             <div
  onClick={() => fileDocRef.current?.click()}
  className="border-2 border-dashed relative border-gray-300 rounded-lg flex bg-transparent flex-col items-center justify-center p-6 cursor-pointer"
>
  <FileUp className="h-6 w-6 mb-2 text-gray-500" />
  <span className="text-sm text-muted-foreground text-center ">
    <span className="font-semibold">Browse From Device</span> <br />
    <span className="text-xs">to upload your doc/pdf (max 5 MB)</span>
  </span>

  <input
    type="file"
    accept=".pdf,.doc,.docx"
    hidden
    ref={fileDocRef}
    onChange={(e: any) => {
      if (e.target.files?.[0]) {
        const newDocument = e.target.files[0];
        if (newDocument.size === 0) {
          toast.error("Invalid Doc");
          return;
        }
        if (newDocument.size > 5 * 1024 * 1024) {
          toast.info("Document size should not exceed 5MB");
          return;
        }
        setFileDoc(newDocument);
        const currentFormData = {
          ...getValues(),
          image: image,
          document: newDocument,
          formIndex: formIndex
        };
        onFormDataChange(formIndex, currentFormData);
      }
    }}
  />
  
  {fileDoc && (
    <p className="text-xs mt-2 text-green-600">{(fileDoc as any).name}</p>
  )}

  {/* Delete button overlay for document */}
  {fileDoc && (

    <div className='absolute top-2 right-2 z-10 bg-orange-100 text-orange-500 rounded-sm  p-1 cursor-pointer'
           onClick={(e) => {
        e.stopPropagation();
        setFileDoc(null);
        if (fileDocRef.current) fileDocRef.current.value = '';
        const currentFormData = {
          ...getValues(),
          image: image,
          document: null,
          formIndex: formIndex
        };
        onFormDataChange(formIndex, currentFormData);
      }}
          >
            <TooltipComp
              hoverChildren={<X className='h-4 w-4' />}
              contentChildren={<p>Remove Doc</p>}
            ></TooltipComp>
          </div>
  
  )}
</div>
            </div>
            <Textarea
              placeholder="Description*"
              {...register("description")}
              className="bg-white min-h-24"
            />
          </div>

          <div className="rounded-[5px] p-6  bg-gray-200/50">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Payment & Delivery Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <DatePicker
                date={date}
                title="Delivery Date"
                disabledBeforeDate={new Date(new Date().getTime())}
                setDate={(val: any) => {
                  if (val) {
                    setDate(val);
                    setValue("paymentAndDelivery.ex_deliveryDate", val);
                  }
                }}
              />

              <Select
                value={paymentMode}
                onValueChange={(value) => setValue('paymentAndDelivery.paymentMode', value)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Banking or Online mode</SelectItem>
                  <SelectItem value="upi">Any</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={gstField}
                onValueChange={(value) => setValue('gst_requirement', value)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="GST Input Required" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>

              {gstField === "yes" && (
                <>
                  <Input
                    type="text"
                    placeholder="GST Number (15 characters - Format: 22AAAAA0000A1Z5)"
                    {...register("paymentAndDelivery.gstNumber")}
                    className="bg-white"
                    maxLength={15}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setValue("paymentAndDelivery.gstNumber", value, {
                        shouldValidate: true
                      });
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="Enity Name"
                    {...register("paymentAndDelivery.organizationName")}
                    className="bg-white"
                  />
                  <Input
                    type="text"
                    placeholder="Entity Address"
                    {...register("paymentAndDelivery.organizationAddress")}
                    className="bg-white"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//  const hasValidForms = formsArray.some((formData:any) => 
//     formData.title && formData.description && formData.subCategoryId  && formData.image && formData.brand
//   );




// Main Category Component
const Category = () => {
  const navigate = useNavigate();
  const { categoryId, subCategoryId } = useParams();
  const [subCategroies, setSubCategoies] = useState([]);
  const [forms, setForms] = useState([0]); // Array to track form indices
  const [formsData, setFormsData] = useState({}); // Store all forms data
  const { fn, data: productCreateData, loading } = useFetch(productService.addProduct);
  const { fn: getCatByIdFn, data: catByIdData } = useFetch(categoryService.getCategoriesById);
  const [currentCategoryName, setCurrentCategoryName] = useState<string | null>(null);
  let { user } = getUserProfile();
  const [open, setOpen] = useState(false);
  const [subCategoriesData, setSubCategoriesData] = useState([]);
  const [resetForms, setResetForms] = useState(false);
  const [buttonType, setButtonType] = useState<boolean | null>(null)
  const [bidDuration, setBidDuration] = useState<number | undefined>(undefined)
  const [bidPopUpOpen, setBidPopUpOpen] = useState(false)
  useEffect(() => {
    (async () => {
      await getCatByIdFn(categoryId);
    })();
  }, [categoryId]);

  useEffect(() => {
    if (catByIdData) {
      try {
        const decodedCategoryName = decodeURIComponent(catByIdData?.categoryName).toLowerCase();
        setSubCategoriesData(getSubCategories(decodedCategoryName) as any);
        setCurrentCategoryName(decodedCategoryName || null);
      } catch (e) {
        console.error("Error decoding category name:", e);
        setCurrentCategoryName(null);
      }
      setSubCategoies(catByIdData?.subCategories || []);
    }
  }, [catByIdData]);


  const isValidForms = (forms: any[], isDraft: boolean) => {
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    for (let i = 0; i < forms.length; i++) {
      if (!forms[i].title) {
        toast.error(`Title is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`)
        return false
      }
      // this is name of category
      else if (!forms[i].subCategoryId && !isDraft) {
        toast.error(`Category is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`)
        return false
      }
      else if (!forms[i].brand && currentCategoryName?.toLowerCase() !== 'service' && !isDraft) {
        toast.error(`Brand is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`)
        return false
      }
      // else if (!forms[i].budget  && !isDraft) {
      //   toast.error(`Budget is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`)
      //   return false
      // }
      else if (!forms[i].quantity && currentCategoryName?.toLowerCase() !== 'service' && !isDraft) {
        toast.error(`Quantity is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`)
        return false
      }
      // else if (!forms[i].image && !isDraft) {
      //   toast.error(`Image is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`);
      //   return false;
      // }
      else if (!forms[i].description && !isDraft) {
        toast.error(`Description is required ${forms.length > 1 ? `in product form(s) ${i + 1}` : ''}`)
        return false
      }

      else if (forms[i].gst_requirement === 'yes' && forms[i].paymentAndDelivery?.gstNumber && !isDraft) {
        const gstNumber = forms[i].paymentAndDelivery.gstNumber.trim();
        if (!gstRegex.test(gstNumber)) {
          toast.error(`Invalid GST Number format in form ${forms.length > 1 ? `${i + 1}` : ''}. Must be 15 characters (Format: 22AAAAA0000A1Z5)`);
          return false;
        }
      }

    }
    return true
  }

  const handleAddForm = () => {
    const formsArray = Object.values(formsData) as any
    if (formsArray.length > 4) {
      toast.info("You can submit a maximum of 5 product forms at a time.");
      return
    }
    const newFormIndex = forms.length > 0 ? Math.max(...forms) + 1 : 0;
    setForms(prev => [...prev, newFormIndex]);
  };

  const handleRemoveForm = (formIndex: number) => {
    if (forms.length > 1) {
      setForms(prev => prev.filter(index => index !== formIndex));
      setFormsData(prev => {
        const newData = { ...prev } as any;
        delete newData[formIndex];
        return newData;
      });
    }
  };

  const handleFormDataChange = (formIndex: number, data: any) => {
    setFormsData(prev => ({
      ...prev,
      [formIndex]: data
    }));
  };

  const handleSubmitAllForms = async (isDraft: boolean, isPlaceRequirementPopup?: boolean) => {
    

    if (!user) {
      setOpen(true);
      return;
    }

    // check the user deatils exisiting or not
    if(!user?.firstName?.trim() || !user?.lastName?.trim() || !user?.email?.trim() || !user?.phone?.trim()){
      toast.info('Please update your profile first before add the quotes')
      navigate('/account')
      return;
    }
    

    setButtonType(isDraft ? true : false)
    const formsArray = Object.values(formsData) as any;
    const hasValidForms = isValidForms(formsArray, isDraft);


    if (!hasValidForms) return

    if (hasValidForms && isPlaceRequirementPopup) {
      setBidPopUpOpen(true);
      return;
    }


    const invalidForms: any[] = [];
    const formsMissingImage: any[] = [];
    formsArray.forEach((formData: any, index: number) => {
      if (!formData.title || !formData.description || !formData.subCategoryId) {
        invalidForms.push(index + 1);
      }
    });

    if (invalidForms.length > 0 && !isDraft) {
      // Create detailed error message
      let errorMessage = "Please fill required fields:\n";

      invalidForms.forEach(({ formNumber, missingFields }) => {
        errorMessage += `Form ${formNumber}: ${missingFields.join(', ')}\n`;
      });

      if (formsMissingImage.length > 0) {
        errorMessage += `\nImage is required for form(s): ${formsMissingImage.join(', ')}`;
      }

      toast.error(errorMessage);
      return;
    }

    const allowedFields = getCategorySpecificFields(currentCategoryName!);
    const isMultiple = formsArray.length > 1;

    try {
      if (isMultiple) {
        // Create a single FormData for multiple products
        const formDataToSend = new FormData();
        const productsData = [];
        for (const [_, formData] of formsArray.entries() as any) {
          if (formData.quantity) {
            const qty = formData.quantity.toString().trim();
            if (!/^\d+$/.test(qty) || parseInt(qty) < 1) {
              toast.error(`Invalid Quantity in Form ${_ + 1}`);
              return;
            }
          }
          if (formData.minimumBudget) {
            const minBudget = formData.minimumBudget.toString().trim();
            if (!/^\d+$/.test(minBudget) || parseInt(minBudget) < 1) {
              toast.error(`Invalid Budget range in Form ${_ + 1}`);
              return;
            }
          }

          const productData: any = {};

          allowedFields.forEach(field => {
            if (field === 'image' || field === 'document') {
              return;
            }
            if ((field === 'oldProductValue' || field === 'productCondition') && formData.productType !== 'old_product') {
              return;
            }

            const value = formData[field];
            if (value !== undefined && value !== null) {
              if (typeof value === "object") {
                productData[field] = JSON.stringify(value);
              } else {
                productData[field] = value;
              }
            } else {
              productData[field] = '';
            }
          });

          productsData.push(productData);

          if (formData.image && allowedFields.includes('image')) {
            formDataToSend.append(`image`, formData.image);
          }
          if (formData.document && allowedFields.includes('document')) {
            formDataToSend.append(`document`, formData.document);
          }
        }


        formDataToSend.append('products', JSON.stringify(productsData));
        formDataToSend.append('draft', isDraft ? 'true' : 'false');
        formDataToSend.append('bidActiveDuration', bidDuration ? bidDuration.toString() : '0');


        // Send all products at once
        await fn(categoryId, formsArray[0].subCategoryId || subCategoryId, formDataToSend, true);
      } else {

        const formData = formsArray[0];
        console.log(formData)
        const formDataToSend = new FormData();
        if (formData["quantity"]) {
          const qty = formData["quantity"].toString().trim();

          if (!/^\d+$/.test(qty) || parseInt(qty) < 1) {
            toast.error("Invalid Quantity");
            return;
          }
        }

        if (formData.minimumBudget) {
          const qty = formData["minimumBudget"].toString().trim();

          if (!/^\d+$/.test(qty) || parseInt(qty) < 1) {
            toast.error("Invalid Budget range");
            return;
          }
        }


        allowedFields.forEach(field => {
          if (field === 'image' || field === 'document') {
            // Handle files separately
            return;
          }

          if ((field === 'oldProductValue' || field === 'productCondition') && formData.productType !== 'old_product') {
            return;
          }

          const value = formData[field];
          if (value !== undefined && value !== null) {
            if (typeof value === "object") {
              formDataToSend.append(field, JSON.stringify(value));
            } else {
              formDataToSend.append(field, value as any);
            }
          } else {
            formDataToSend.append(field, '');
          }
        });

        if (formData.image && allowedFields.includes('image')) {
          formDataToSend.append("image", formData.image);
        }
        if (formData.document && allowedFields.includes('document')) {
          formDataToSend.append("document", formData.document);
        }

        formDataToSend.append('draft', isDraft ? 'true' : 'false');
        formDataToSend.append('bidActiveDuration', bidDuration ? bidDuration.toString() : '0');

        await fn(categoryId, formData.subCategoryId || subCategoryId, formDataToSend, false);
      }

      toast.success(`${formsArray.length} product form(s) ${isDraft ? 'saved as draft' : 'submitted'} successfully!`)

      setResetForms(true);
      setTimeout(() => {
        setForms([0]);
        setFormsData({});
        setResetForms(false);
      }, 100);
      // window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error submitting forms:", error);
      toast.error(`Failed to ${isDraft ? 'save draft' : 'submit forms'}. Please try again.`);
    }
  };

  useEffect(() => {
    if (productCreateData) {
      // toast.success("Product Created Successfully");
      // Reset forms
      // setButtonType(null)
      // setForms([0]);
      // setFormsData({});
      if (!buttonType) {
        navigate('/')
      }
      window.location.reload()
    }
  }, [productCreateData]);


  return (
    <>
      <Authentication setOpen={setOpen} open={open} />
      <PlaceRequirementPopup buttonType={buttonType} loading={loading} open={bidPopUpOpen} setOpen={setBidPopUpOpen} setBidDuration={setBidDuration} bidDuration={bidDuration} createProductFn={handleSubmitAllForms as any} />
      <div className="w-full max-w-7xl mx-auto p-4">
        {/* Breadcrumb + Action */}
        <div className="flex flex-row sm:justify-between justify-end items-center gap-3 mb-6">
          <Breadcrumb className="sm:block hidden">
            <BreadcrumbList>
              <BreadcrumbItem className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(-1)}>
                <MoveLeft className="h-4 w-4" />
                <BreadcrumbPage className="capitalize font-semibold text-gray-500">
                  Selected Product
                </BreadcrumbPage>
                <BreadcrumbSeparator />
                <BreadcrumbPage className="capitalize font-semibold text-orange-600">
                  {currentCategoryName === "beauty" ? 'Personal Care' : currentCategoryName === "electronics" ? 'Mobile, Tablet and Wearables' : currentCategoryName === "sports" ? 'Sports & Stationery' : currentCategoryName === 'home' ? 'Home Appliances' : currentCategoryName === 'industrial' ? "Industrial & Construction Material" : currentCategoryName === 'furniture' ? 'furniture and decor' : currentCategoryName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* <Button

            className="bg-orange-700 cursor-pointer w-32 text-[12px] hover:bg-orange-600 text-white  flex items-center gap-1 underline"
            onClick={handleAddForm}
          >
            <PlusIcon className="h-3 w-3" />Add Product
          </Button> */}
        </div>

        {/* Forms Counter */}
        {/* <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            Total Forms: {forms.length} | Filled Forms: {Object.keys(formsData).length}
          </p>
        </div> */}

        {/* Render all forms */}
        <div className="space-y-6">
          {forms.map((formIndex, arrayIndex) => (
            <>
              <CategoryForm
                key={formIndex}
                formIndex={formIndex}
                currentCategoryName={currentCategoryName}
                catByIdData={catByIdData}
                subCategroies={subCategroies}
                subCategoriesData={subCategoriesData}
                onFormDataChange={handleFormDataChange}
                onRemoveForm={handleRemoveForm}
                showRemoveButton={arrayIndex > 0}
                resetForm={resetForms}
                subCategoryId={subCategoryId}
              />
              {
                forms.length > -1 && arrayIndex < forms.length - 1 && <div className="bg-gray-400 w-full h-[2px] my-5"></div>
              }
            </>
          ))}

        </div>

        {/* Global Actions - Single Submit and Draft buttons for all forms */}
        <div className="flex justify-end gap-3 my-5">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="w-32 cursor-pointer border-[#2C3E50] "
            onClick={() => handleSubmitAllForms(true)}
          >
            {loading && buttonType ? <Spinner className="w-5 h-5 animate-spin" /> : ' Save as Draft'}

          </Button>
          <Button
            type="button"
            disabled={loading}
            className="text-white w-32 cursor-pointer bc   border-primary-btn border-2"
            onClick={() => handleSubmitAllForms(false, true)}
          // loading && !buttonType ? <Spinner className="w-5 h-5 animate-spin" /> : 
          >
            {`Submit ${Object.keys(formsData).length > 1 ? 'All' : ''}`}
          </Button>
        </div>

        {/* Debug Panel - Remove in production */}
        {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-700 mb-2">Debug Info (Remove in Production)</h4>
          <p className="text-sm text-gray-600 mb-2">Forms Array: [{forms.join(', ')}]</p>
          <p className="text-sm text-gray-600">Forms Data Keys: [{Object.keys(formsData).join(', ')}]</p>
          <details className="mt-2">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">View Forms Data</summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(formsData, null, 2)}
            </pre>
          </details>
        </div> */}
      </div>
    </>
  );
};

export default Category;