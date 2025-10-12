
import instance from "@/lib/instance";

class ProductService{
  addProduct(categoryId:string,subCategoryId:string,productObj:any,isMultiple:boolean){
    return instance.post(`/product/add-product/${categoryId}/${subCategoryId}/${isMultiple}`,productObj,{
      withCredentials:true
    }).then(res => res.data?.data|| res.data)
  }
    getSeachProduct(productName:string){
        return instance.get('/product/get-product/'+productName).then(res => res.data?.data|| res.data)
    }
    getProductById(productId:string){
        return instance.get('/product/get-product-by-id/'+productId).then(res => res.data?.data|| res.data)
    }
   getProductByTitle(
    title: string,
    page: number = 1,
    limit: number = 10,
    filters: { category?: string; min_budget?: number; max_budget?: number; sort?: string } = {}
  ) {
    return instance.get("/product/get-products-by-title/search", {
      params: {
        title,
        page,
        limit,
        ...filters,
      },
    });
  }
getDrafts(){
  return instance.get('/product/get-draft-products',{
    withCredentials:true
  }).then(res => res.data?.data|| res.data)
}

getDraftById(productId:string){
  return instance.get('/product/get-draft-product/'+productId,{
    withCredentials:true
  }).then(res => res.data?.data|| res.data)
}
updateDrafts(payload:any[],isMultiple:boolean){
  return instance.patch(`/product/updatedraft/${isMultiple}`,payload,{
    withCredentials:true
  }).then(res => res.data?.data|| res.data)
};

getHomeCards(){
  return instance.get('/product/get-home-products').then(res => res.data?.data|| res.data)
}


}
export default new ProductService();