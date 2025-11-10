const commonFields = {
    title: '',
    subCategoryId: '',
    image: '',
    document: '',
    description: '',
    gst_requirement: '',
    budgetRange: '', // Added budget range to all forms
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
        quantity: '', // Will be handled as free text in the form
        fuelType: '',
        model: '',
        color: '',
        transmission: '',
        productCondition: '', // Renamed from productType for consistency
        oldProductValue: {
            min: '',
            max: ''
        },
    },
    furniture: {
        ...commonFields,
        brand: '',
        quantity: '',
        productCondition: '',
        oldProductValue: {
            min: '',
            max: ''
        },
    },
    fashion:{
        ...commonFields,
        brand:'',
        quantity:'',
        gender:'',
        typeOfAccessories:''
    },
    sports:{
        ...commonFields,
        brand:'',
        quantity:'',
        productCondition: '',
        oldProductValue: {
            min: '',
            max: ''
        },
    },
    home:{
        ...commonFields,
        brand:'',
        quantity:'',
        productCondition: '',
        oldProductValue: {
            min: '',
            max: ''
        },
    },
    beauty:{
        ...commonFields,
        brand:'',
        quantity:'',
        typeOfAccessories:''
    },
    industrial:{
        ...commonFields,
        brand:'',
        quantity:'',
        toolType: '',
    },
    electronics:{
        ...commonFields,
        brand:'',
        quantity:'',
        productCondition: '',
        oldProductValue: {
            min: '',
            max: ''
        },
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