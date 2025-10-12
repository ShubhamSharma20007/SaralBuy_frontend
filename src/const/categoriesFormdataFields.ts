const commonFields = {
    title: '',
    subCategoryId: '',
    image: '',
    document: '',
    description: '',
    gst_requirement: '',
    paymentAndDelivery: {
        ex_deliveryDate: undefined as Date | undefined,
        paymentMode: '',  // if yes aalow the below field
        gstNumber: '',
        organizationName: '',
        organizationAddress: ''
    },
}

export const categoroiesFormDataFields = {
    autoMobile: {
        ...commonFields,
        brand: '',
        quantity: '',
        additionalDeliveryAndPackage: '',
        fuelType: '',
        model: '',
        color: '',
        transmission: '',
        productType: '',
        oldProductValue: {
            min: '',
            max: ''
        },
        conditionOfProduct: '',
    },
    furniture: {
        ...commonFields,
        brand: '',
        quantity: '',
        additionalDeliveryAndPackage: '',
        productType: '',
        oldProductValue: {
            min: '',
            max: ''
        },
        conditionOfProduct: '',
    },
    fashion:{
        ...commonFields,
        brand:'',
        quatity:'',
        additionalDeliveryAndPackage: '',
        gender:'',
        typeOfAccessories:''
    },
    sports:{
        ...commonFields,
        brand:'',
        quatity:'',
        additionalDeliveryAndPackage: '',
          productType: '',
        oldProductValue: {
            min: '',
            max: ''
        },
        conditionOfProduct: '',
    },
    home:{
        ...commonFields,
        brand:'',
        quatity:'',
        additionalDeliveryAndPackage: '',
         productType: '',
        oldProductValue: {
            min: '',
            max: ''
        },
        conditionOfProduct: '',
    },
    beauty:{
        ...commonFields,
        brand:'',
        quatity:'',
        additionalDeliveryAndPackage: '',
        typeOfAccessories:''
    },
    industrial:{
        ...commonFields,
        brand:'',
        quatity:'',
        additionalDeliveryAndPackage: '',
        toolType: '',
    },
    electronics:{
        ...commonFields,
        brand:'',
        minimumBudget: '',
        quantity:'',
         productType: '',
        oldProductValue: {
            min: '',
            max: ''
        },
        conditionOfProduct: '',
    },
    service:{
    ...commonFields,
    rateAService:'',
       
    }
}

  // Helper function to get category-specific fields based on what's rendered in UI
export const getCategorySpecificFields = (categoryName: string) => {
  categoryName = categoryName.toLowerCase();
  const baseFields = ['title', 'subCategoryId', 'description', 'paymentAndDelivery', 'gst_requirement', 'image', 'document' ];
  // budget'
  
  switch(categoryName) {
    case 'automobile':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'fuelType', 
        'model', 'color', 'transmission', 'productType', 'oldProductValue', 
        'productCondition'
      ];
    
    case 'furniture':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'productType', 
        'oldProductValue', 'productCondition', 'conditionOfProduct'
      ];
    
    case 'fashion':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'gender', 'typeOfAccessories'
      ];
    
    case 'sports':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'productType', 
        'oldProductValue', 'productCondition'
      ];
    
    case 'home':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'productType', 
        'oldProductValue', 'productCondition'
      ];
    
    case 'beauty':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'typeOfAccessories'
      ];
    
    case 'industrial':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'toolType'
      ];
    
    case 'electronics':
      return [
        ...baseFields,
        'brand', 'quantity', 'minimumBudget', 'productType', 'oldProductValue', 'productCondition'
      ];
    
    case 'service':
      return [
        ...baseFields,
        'rateAService'
      ];
    
    default:
       return []
  }
};