
import instance from "@/lib/instance";

class CartService{
  addToCart(productId:string){
    return instance.post('/cart/add',{productId},{
      withCredentials:true
    }).then(res => res.data)
  };
    getCart(){
    return instance.get('/cart/get-cart',{
      withCredentials:true
    }).then(res => res.data?.data || res.data)
  };
   removeCart(cartId:string,productId:string){
    return instance.post(`/cart/remove-cart/${cartId}/${productId}`,{},{
      withCredentials:true
    }).then(res => res.data?.data || res.data)
  }
}
export default new CartService();