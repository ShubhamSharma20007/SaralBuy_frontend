
  // Helper function to get category-specific fields based on what's rendered in UI
export const getCategorySpecificFields = (categoryName: string) => {
  categoryName = categoryName.toLowerCase();
  const baseFields = ['title', 'subCategoryId', 'description', 'paymentAndDelivery', 'gst_requirement', 'image', 'document','brandName','minimumBudget' ];
  // budget'
  
  switch(categoryName) {
    case 'automobile':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'fuelType', 
        'model', 'color', 'transmission', 'productType', 'oldProductValue', 'typeOfVehicle','typeOfProduct'
        // 'productCondition'
      ];
    
    case 'furniture':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'productType', 
        'oldProductValue', 'conditionOfProduct','typeOfProduct'
        // 'productCondition'
      ];
    
    case 'fashion':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'gender', 'typeOfAccessories','typeOfProduct'
      ];
    
    case 'sports':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'productType', 'typeOfProduct',
        'oldProductValue', 
        // 'productCondition'
      ];
    
    case 'home':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'productType', 'typeOfProduct',
        'oldProductValue',
        //  'productCondition'
      ];
    
    case 'beauty':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'typeOfAccessories','typeOfProduct'
      ];
    
    case 'industrial':
      return [
        ...baseFields,
        'brand', 'quantity', 'additionalDeliveryAndPackage', 'toolType','typeOfProduct'
      ];
    
    case 'electronics':
      return [
        ...baseFields,
        'brand', 'quantity', 'productType', 'oldProductValue', 'typeOfProduct', "model"
        // 'productCondition'
      ];
    
    case 'service':
      return [
        ...baseFields,
        'rateAService','typeOfProduct'
      ];
    case 'others':
      return[
        ...baseFields.filter(item=>item !== 'brandName'),
        'brand', 'quantity','productType','typeOfProduct','productCondition'
       
      ];
    
    default:
       return []
  }
};