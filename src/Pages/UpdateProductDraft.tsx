import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {FileUp, MoveLeft, XIcon, CloudUpload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { DatePicker } from "@/utils/DatePicker";
import { Range } from "react-range";
import { CategoryFormSchema } from "@/validations/Schema";
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form";
import { Label } from "@/Components/ui/label";
import { toast } from "sonner";
import { useFetch } from "@/helper/use-fetch";
import productService from "@/services/product.service";
import categoryService from "@/services/category.service";
import { Spinner } from "@/Components/ui/shadcn-io/spinner";
import { SearchableDropdown } from "@/utils/searchableDropdown";
import { electronicCategories, constructionIndustrialCategories, fashionCategories, furnitureCategories, homeAppliancesCategories, beautyCategories, sportCategories, vehicleCategories, serviceCategories } from "@/const/categoriesData";
import { getCategorySpecificFields } from "@/const/categoriesFormdataFields";
import Authentication from "@/Components/auth/Authentication";
import { CategoryFormSkeleton } from "@/const/CustomSkeletons";

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
  industrial: "constructionFormImage.png"
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
    default:
      return []
  }
}




const UpdateProductDraftForm = ({
  formIndex,
  currentCategoryName,
  catByIdData,
  subCategroies,
  subCategoriesData,
  onFormDataChange,
  initialData = null
}: any) => {
  const [date, setDate] = useState(initialData?.paymentAndDelivery?.ex_deliveryDate ? new Date(initialData.paymentAndDelivery.ex_deliveryDate) : undefined);
  const [values, setValues] = useState([
    parseFloat(initialData?.oldProductValue?.min || "0"),
    parseFloat(initialData?.oldProductValue?.max || "2")
  ]);
  const [image, setImage] = useState(null);
  const [fileDoc, setFileDoc] = useState(null);
  const [brand, setbrand] = useState(initialData?.brand || '');
  console.log(brand, 2)
  const [brandRenderItems, setBrandRenderItems] = useState([]);
  const imageRef = useRef(null);
  const fileDocRef = useRef<HTMLInputElement>(null);

  const { watch, setValue, formState: { }, register, getValues, } = useForm({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      quantity: initialData?.quantity || '',
      subCategoryId: initialData?.subCategoryId || '',
      minimumBudget: initialData?.minimumBudget || '',
      productType: initialData?.productType || '',
      oldProductValue: {
        min: initialData?.oldProductValue?.min || '',
        max: initialData?.oldProductValue?.max || ''
      },
      productCondition: initialData?.productCondition || '',
      image: initialData?.image || '',
      document: initialData?.document || '',
      description: initialData?.description || '',
      paymentAndDelivery: {
        ex_deliveryDate: initialData?.paymentAndDelivery?.ex_deliveryDate || undefined,
        paymentMode: initialData?.paymentAndDelivery?.paymentMode || '',
        gstNumber: initialData?.paymentAndDelivery?.gstNumber || '',
        organizationName: initialData?.paymentAndDelivery?.organizationName || '',
        organizationAddress: initialData?.paymentAndDelivery?.organizationAddress || ''
      },
      draft: initialData?.draft || false,
      gst_requirement: initialData?.paymentAndDelivery?.gstNumber ? 'yes' : '',
      brand: initialData?.brand || '',
      additionalDeliveryAndPackage: initialData?.additionalDeliveryAndPackage || '',
      gender: initialData?.gender || '',
      typeOfAccessories: initialData?.typeOfAccessories || '',
      fuelType: initialData?.fuelType || '',
      model: initialData?.model || '',
      color: initialData?.color || '',
      transmission: initialData?.transmission || '',
      conditionOfProduct: initialData?.conditionOfProduct || '',
      toolType: initialData?.toolType || '',
      rateAService: initialData?.rateAService || '',
      // budget:initialData?.budget || ''
    }
  });

  const gstField = watch("gst_requirement");
  const productField = watch("productType");
  const selectedSubategoryId = watch("subCategoryId");
  const paymentMode = watch("paymentAndDelivery.paymentMode");
  const additionalDeliveryValue = watch("additionalDeliveryAndPackage");
  const genderValue = watch("gender");
  const typeOfAccessoriesValue = watch("typeOfAccessories");
  const fuelTypeValue = watch("fuelType");
  const modelValue = watch("model");
  const colorValue = watch("color");
  const transmissionValue = watch("transmission");
  const conditionOfProductValue = watch("conditionOfProduct");
  const toolTypeValue = watch("toolType");
  const rateAServiceValue = watch("rateAService");

  // Update parent with form data whenever form changes
  useEffect(() => {
    const subscription = watch(() => {
      const formData = {
        ...getValues(),
        image: image,
        document: fileDoc,
        formIndex: formIndex,
        _id: initialData?._id, // Include the ID for identification
        initialData: initialData
      };
      onFormDataChange(formIndex, formData);
    });
    return () => subscription.unsubscribe();
  }, [watch, image, fileDoc, formIndex, onFormDataChange, getValues, initialData]);

  useEffect(() => {
    setValue("oldProductValue.min", values[0].toString());
    setValue("oldProductValue.max", values[1].toString());
  }, [values, setValue]);

  useEffect(() => {
    setValue('brand', brand);
  }, [brand, setValue]);

  // Set initial brands when component mounts
  useEffect(() => {
    if (initialData?.subCategoryId && catByIdData) {
      const selectProductName = catByIdData?.subCategories.find((item: any) => item._id === initialData.subCategoryId)?.name || 'N/A';
      const brandsArray = subCategoriesData.find((item: any) =>
        item.category.replace(/\s+/g, '').toLowerCase() === selectProductName.replace(/\s+/g, '').toLowerCase()
      )?.brands;

      if (brandsArray?.length > 0) {
        setBrandRenderItems(brandsArray);
      }
    }
  }, [initialData, catByIdData, subCategoriesData]);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="md:col-span-1 lg:col-span-1 bg-transparent  border-0 p-6 xs:grid xs:grid-cols-2 gap-6 space-y-4">
          <div className="col-span-1 align-center sm:block flex flex-col justify-center">
            <h2 className="text-[15px] font-semibold mb-2 text-center">Product Form ({formIndex + 1})</h2>
            <p className="text-[13px] text-muted-foreground text-center">
              Update your product details below. Make sure all required fields are filled correctly.
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <Input
                type="text"
                placeholder="Title*"
                className="bg-white col-span-1 md:col-span-3"
                {...register('title')}
              />

              <Select
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
                  <SelectValue placeholder="Category*" />
                </SelectTrigger>
                <SelectContent>
                  {catByIdData && subCategroies.map((c: any) =>
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {currentCategoryName !== "service" && (
                <SearchableDropdown
                  disbaled={!selectedSubategoryId}
                  setValue={setbrand}
                  value={brand}
                  className="w-full"
                  dropdownTitle="Brands*"
                  renderItems={brandRenderItems}
                />
              )}
              {/* <Input
                  type="number"
                  placeholder="Product Budget*"
                  {...register('budget')}
                  className="bg-white"
                /> */}

              {currentCategoryName === "electronics" && (
                <div className="relative">
                  <p className="absolute top-1/2 left-2 text-sm  text-orange-600 font-semibold -translate-y-1/2">
                    ₹</p>
                  <Input
                    type="text"
                    placeholder="Enter a Minimum Budget"
                    {...register('minimumBudget')}
                    className="bg-white  pl-5"
                  />
                </div>
              )}

              {currentCategoryName !== "service" && (
                <Input
                  type="number"
                  placeholder="Quantity*"
                  {...register('quantity')}
                  className="bg-white col-span-1"
                />
              )}

              {currentCategoryName === "service" && (
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
              )}

              {(currentCategoryName === "automobile" || currentCategoryName === "furniture" ||
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
                )}

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
                  </SelectContent>
                </Select>
              )}

              {(currentCategoryName === "fashion" || currentCategoryName === "beauty") && (
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
              )}

              {currentCategoryName === "automobile" && (
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
                      <SelectItem value="cng">CNG</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={modelValue}
                    onValueChange={(value) => setValue("model", value)}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand_new">Brand New (Unused)</SelectItem>
                      <SelectItem value="like_new_used_3_months">Like New (Used &lt; 3 Months)</SelectItem>
                      <SelectItem value="gently_used_3_6_months">Gently Used (3 - 6 Months)</SelectItem>
                      <SelectItem value="used_6_12_months">Used (6 - 12 Months)</SelectItem>
                      <SelectItem value="1_year_old">1 Year Old</SelectItem>
                      <SelectItem value="2_year_old">2 Year Old</SelectItem>
                      <SelectItem value="3_year_old">3 Year Old</SelectItem>
                      <SelectItem value="4_year_old">4 Year Old</SelectItem>
                      <SelectItem value="5_year_old">5 Year Old</SelectItem>
                      <SelectItem value="more_than_5_year_old">More Than 5 Years Old</SelectItem>
                      <SelectItem value="vintage_10_plus_years_old">Vintage (10+ Years Old)</SelectItem>
                      <SelectItem value="unknown">Unknown / Not Sure</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={colorValue}
                    onValueChange={(value) => setValue("color", value)}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                    </SelectContent>
                  </Select>

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
                </>
              )}

              {(currentCategoryName === "furniture" || currentCategoryName === "sports" ||
                currentCategoryName === "automobile" || currentCategoryName === "home" ||
                currentCategoryName === "electronics") && (
                  <>
                    {(productField === 'new_product' || productField === '') && (
                      <Select
                        value={productField}
                        onValueChange={(value) => setValue("productType", value)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Product Type" />
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
                            <Label className="font-medium text-gray-500">Old Product</Label>
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
                              <Label className="text-gray-600 text-sm">Min.</Label>
                              <div className="flex items-center gap-1 border rounded px-2 py-1">
                                {values[0].toString().padStart(2, "0")} yr
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 border rounded px-2 py-1">
                                {values[1]} yr
                              </div>
                              <Label className="text-gray-600 text-sm">Max.</Label>
                            </div>
                          </div>
                        </div>
                        <Select onValueChange={(val) => setValue('productCondition', val)}>
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Product Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="like_new">Like New</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}

              {productField === 'new_product' && currentCategoryName === "furniture" && (
                <Select
                  value={conditionOfProductValue}
                  onValueChange={(value) => setValue("conditionOfProduct", value)}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Condition of Product" />
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div
                onClick={() => (imageRef as any)?.current?.click()}
                className="border-2 border-dashed relative border-gray-300 rounded-lg flex bg-transparent flex-col items-center justify-center p-6 cursor-pointer h-32"
              >
                <CloudUpload className="h-6 w-6 mb-2 text-gray-500" />
                <span className="text-sm text-muted-foreground">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={imageRef}
                  onChange={(e: any) => {
                    if (e.target.files?.[0]) {
                      const newImage = e.target.files[0];
                      setImage(newImage);
                      const currentFormData = {
                        ...getValues(),
                        image: newImage,
                        document: fileDoc,
                        formIndex: formIndex,
                        _id: initialData?._id
                      };
                      onFormDataChange(formIndex, currentFormData);
                    }
                  }}
                />
                {image && (
                  <p className="text-xs mt-2 text-green-600 text-center">{(image as any)?.name}</p>
                )}
                {
                  image && <div className="absolute h-16 w-16 right-2 top-2 rounded-lg shadow  select-none z-10">
                    <img src={URL.createObjectURL(image)} className="h-full w-full object-contain" alt="" />
                  </div>
                }
                {!image && initialData?.image && (
                  <>
                    <div className="absolute h-16 w-16 right-2 top-2 rounded-lg shadow  select-none z-10">
                      <img src={image || initialData?.image!} className=" w-full h-full object-contain " />
                    </div>
                  </>
                )}
              </div>
              <div
                onClick={() => fileDocRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg flex bg-transparent flex-col items-center justify-center p-6 cursor-pointer"
              >
                <FileUp className="h-6 w-6 mb-2 text-gray-500" />
                <span className="text-sm text-muted-foreground">
                  Browse From Device (doc/pdf)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  ref={fileDocRef}
                  onChange={(e: any) => {
                    if (e.target.files?.[0]) {
                      const newDocument = e.target.files[0];
                      setFileDoc(newDocument);

                      const currentFormData = {
                        ...getValues(),
                        image: image,
                        document: newDocument,
                        formIndex: formIndex,
                        _id: initialData?._id
                      };
                      onFormDataChange(formIndex, currentFormData);
                    }
                  }}
                />
                {fileDoc && (
                  <p className="text-xs mt-2 text-green-600">{(fileDoc as any).name}</p>
                )}
                {!fileDoc && initialData?.document && (
                  <p className="text-xs mt-2 text-blue-600">Current document uploaded</p>
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment & Delivery Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <DatePicker
                date={date}
                title="Delivery Date"
                disabledBeforeDate={new Date(new Date().getTime() - 24 * 60 * 60 * 1000)}
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
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
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
                    placeholder="GST Number"
                    {...register("paymentAndDelivery.gstNumber")}
                    className="bg-white"
                  />
                  <Input
                    type="text"
                    placeholder="Organization Name"
                    {...register("paymentAndDelivery.organizationName")}
                    className="bg-white"
                  />
                  <Input
                    type="text"
                    placeholder="Organization Address"
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

const UpdateDraft = () => {
  const { productId } = useParams();
  const { fn: getDraft, data: getDraftRes, loading: getDraftLoading } = useFetch(productService.getDraftById);
  const [draftState, setDraftState] = useState<any>(null);
  const navigate = useNavigate();
  const [subCategroies, setSubCategoies] = useState([]);
  const [forms, setForms] = useState<any>([]); // Array to track form indices
  const [formsData, setFormsData] = useState({}); // Store all forms data
  const { fn: getCatByIdFn, data: catByIdData } = useFetch(categoryService.getCategoriesById);
  const [currentCategoryName, setCurrentCategoryName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { fn, data, loading } = useFetch(productService.updateDrafts)
  const [subCategoriesData, setSubCategoriesData] = useState([]);
  const [resetForms, _] = useState(false);

  useEffect(() => {
    if (productId) {
      getDraft(productId);
    }
  }, [productId]);


  useEffect(() => {
    if (getDraftRes) {
      console.log(getDraftRes)
      const firstDraft = getDraftRes
      setDraftState(firstDraft);
      setCurrentCategoryName(firstDraft?.categoryId?.categoryName);

      // Get category data
      if (firstDraft?.categoryId?._id) {
        getCatByIdFn(firstDraft.categoryId._id);
      }

      if (firstDraft?.subProducts && firstDraft?.subProducts.length > 0) {

        const formIndices = firstDraft.subProducts.map((_: any, index: number) => index);
        setForms(formIndices);
      } else {
        setForms([0]);
      }
    }
  }, [getDraftRes]);



  const isValidForms = (formsDataObj: any) => {
    const formsArray = Object.values(formsDataObj);
    console.log(formsArray)

    for (let i = 0; i < formsArray.length; i++) {
      const form = formsArray[i] as any;

      if (!form.title || form.title.trim() === '') {
        toast.error(`Title is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
        return false;
      }

      if (!form.subCategoryId || form.subCategoryId.trim() === '') {
        toast.error(`Category is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
        return false;
      }

      if (currentCategoryName?.toLowerCase() !== 'service' && (!form.brand || form.brand.trim() === '')) {
        toast.error(`Brand is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
        return false;
      }
      //  if (!form.budget || form.budget.trim() === '') {
      //   toast.error(`Budget is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
      //   return false;
      // }

      if (currentCategoryName?.toLowerCase() !== 'service' && (!form.quantity || form.quantity.toString().trim() === '')) {
        toast.error(`Quantity is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
        return false;
      }

      // if (!form.image && (!form.initialData?.image || form.initialData?.image.trim() === '')) {
      //   toast.error(`Image is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
      //   return false;
      // }

      if (!form.description || form.description.trim() === '') {
        toast.error(`Description is required${formsArray.length > 1 ? ` in product form (${i + 1})` : ''}`);
        return false;
      }
    }

    return true;
  };


  useEffect(() => {
    if (catByIdData) {
      try {
        const decodedCategoryName = currentCategoryName!.toLowerCase();
        setSubCategoriesData(getSubCategories(decodedCategoryName) as any);
        setCurrentCategoryName(decodedCategoryName || null);
      } catch (e) {
        console.error("Error decoding category name:", e);
        setCurrentCategoryName(null);
      }
      setSubCategoies(catByIdData?.subCategories || []);
    }
  }, [catByIdData]);

  useEffect(() => {
    if (catByIdData) {
      setSubCategoies(catByIdData.subCategories || []);
    }
  }, [catByIdData]);

  const handleFormDataChange = (formIndex: number, data: any) => {
    setFormsData(prev => ({
      ...prev,
      [formIndex]: data
    }));
  };
  const handleSubmitAllForms = async () => {
    if (!isValidForms(formsData)) {
      return;
    }
    const allowedFields = getCategorySpecificFields(currentCategoryName!);
    const formDataToSend = new FormData();
    const productsData = [] as any

    Object.entries(formsData).forEach(([_, formData]: any) => {

      const productData: any = {
        _id: formData._id // Include ID for update
      };

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

      // Handle file uploads with unique keys for each form
      if (formData.image && allowedFields.includes('image')) {
        formDataToSend.append(`image`, formData.image);
      }
      if (formData.document && allowedFields.includes('document')) {
        formDataToSend.append(`document`, formData.document);
      }
    });

    formDataToSend.append('products', JSON.stringify(productsData));
    formDataToSend.append('draft', 'false');
    console.log(productsData)
    // Determine if multiple products
    const isMultiple = forms.length > 1;
    await fn(formDataToSend, isMultiple);

  };

  useEffect(() => {
    if (data) {
      toast.success(`Draft updated successfully`)
      navigate(-1)
    }
  }, [data])


  const getInitialDataForForm = (formIndex: number) => {
    console.log("Getting initial data for form:", formIndex);
    console.log("Draft state:", draftState);

    if (!draftState) return null;

    if (draftState.subProducts && draftState.subProducts.length > 0) {
      // Return subProduct data for this form index
      const subProduct = draftState.subProducts[formIndex];
      console.log(`Form ${formIndex} initial data (subProduct):`, subProduct);
      return subProduct || null;
    } else {
      // Return main draft data for single form
      const mainData = formIndex === 0 ? draftState : null;
      console.log(`Form ${formIndex} initial data (main):`, mainData);
      return mainData;
    }
  };


  return (
    <>
      <Authentication setOpen={setOpen} open={open} />


      <div className="w-full max-w-7xl mx-auto p-4 min-h-screen">
        {
          getDraftLoading ? <CategoryFormSkeleton /> :
            <>
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
                        {currentCategoryName === "beauty" ? 'Personal Care' : currentCategoryName === "electronics" ? 'Electronics Appliances' : currentCategoryName === "sports" ? 'Sports & Stationary' : currentCategoryName === 'home' ? 'Home Appliances' : currentCategoryName === 'industrial' ? "Industrial & Construction Material" : currentCategoryName}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Render all forms */}
              <div className="space-y-8">
                {forms.map((_: any, formIndex: number) => (
                  <div key={formIndex} >
                    <UpdateProductDraftForm
                      formIndex={formIndex}
                      currentCategoryName={currentCategoryName}
                      catByIdData={catByIdData}
                      subCategroies={subCategroies}
                      subCategoriesData={subCategoriesData}
                      onFormDataChange={handleFormDataChange}
                      initialData={getInitialDataForForm(formIndex)}
                      resetForm={resetForms}
                    />
                    {
                      forms.length > -1 && formIndex < forms.length - 1 && <div className="bg-gray-400 w-full h-[2px] my-5"></div>
                    }
                  </div>
                ))}
              </div>


              {/* Global Actions - Single Submit and Draft buttons for all forms */}
              <div className="flex justify-end gap-3 my-5">
                <Button
                  type="button"
                  disabled={loading}
                  className="text-white w-32 cursor-pointer bc border-primary-btn border-2 "
                  onClick={handleSubmitAllForms}
                >
                  {loading ? (
                    <Spinner className="w-5 h-5 animate-spin" />
                  ) : (
                    `Submit ${Object.keys(formsData).length > 1 ? 'All' : ''}`
                  )}
                </Button>
              </div>
            </>
        }
      </div>



    </>
  );
};

export default UpdateDraft;