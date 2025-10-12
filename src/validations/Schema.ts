import { z } from "zod";

export const CategoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"), 
  subCategoryId: z.string().min(1, "Category is required"), 
  quantity: z.string().min(1, "Quantity is required"),
  minimumBudget: z.string().optional(),
  productType: z.string().optional(),
  // budget:z.coerce.number().refine((value)=> value >= 0, { message: "Budget must be greater than 0" }),
  
  oldProductValue: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }).optional(),

  productCondition: z.string().optional(),
  image: z.string().optional(),
  document: z.string().optional(),
  description: z.string().min(1, "Description is required"),

  paymentAndDelivery: z.object({
    ex_deliveryDate: z.date().optional(),
    paymentMode: z.string().optional(),
    gstNumber: z.string().optional(),
    organizationName: z.string().optional(),
    organizationAddress: z.string().optional(),
  }),

  draft: z.boolean().optional(),
  gst_requirement: z.string().optional(),


  brand: z.string().optional(),
  additionalDeliveryAndPackage: z.string().optional(),
  gender: z.string().optional(),
  typeOfAccessories: z.string().optional(),
  fuelType: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  transmission: z.string().optional(),
  conditionOfProduct: z.string().optional(),
  constructionToolType: z.string().optional(),
  toolType: z.string().optional(),
  rateAService: z.string().optional(),

});

export const ProfileSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(1, "Address is required").min(3, "Address is too short"),
  aadhaarNumber:z.string().refine((value)=> !value || /^[2-9]{1}[0-9]{11}$/.test(value),{
    message: 'Invalid Aadhaar Number'
  })
})

export const productOverviewBidSchema = z.object({
  budgetQuation: z.coerce.number({
    error:'Budget Quation is required'
  }).positive("Budget Quation must be positive"),
  availableBrand: z.string().min(1, "Available Brand is required"),
  earliestDeliveryDate: z.
  union([z.coerce.date(),z.undefined()]). // it can be date or undefined
  refine((value)=> value !== undefined,{   // firsty check if value is not undefined
    message: 'Earliest Delivery Date is required'
  })
});