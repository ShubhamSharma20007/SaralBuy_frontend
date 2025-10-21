
import instance from "@/lib/instance";

class BidService{
    createBid(buyerId:string,productId:string,dataObj:any){
        return instance.post(`/bid/create/${buyerId}/${productId}`,dataObj,{
            withCredentials:true
        }).then(res => res.data?.data|| res.data)
    }
    getAllBids(limit = 10, page = 1, search = "",sortBy = "desc" ){
        return instance.get('/bid/get-all-bid',{withCredentials:true,params:{
            limit,
            page, 
            search,
            sortBy
        }}).then(res => res.data?.data|| res.data)
    }
    bidOverViewbyId(bidId:string){
        return instance.get(`/bid/bid-overview/${bidId}`,{withCredentials:true}).then(res => res.data?.data|| res.data)
    };
    updateUserBidDets(id:string,dataObj:any){
        return instance.put(`/bid/update-bid-user-dets/${id}`,dataObj,{withCredentials:true}).then(res => res.data?.data|| res.data)
    }
    getThreeLatestBids(){
        return instance.get('/bid/get-three-latest-bid-and-draft',{withCredentials:true}).then(res => res.data?.data|| res.data)
    }

    createRequirement(params: { productId: string; sellerId: string;buyerId:string, budgetAmount: number }) {
        return instance.post('/requirement/create', params, { withCredentials: true })
            .then(res => res.data?.data || res.data);
    }

    getMyRequirements(page = 1,limit=10) {
        return instance.get('/requirement/my-requirements', { withCredentials: true ,params:{
            page,
            limit
        }})
            .then(res => res.data?.data || res.data);
    }
    getBidById(id:string,limit = 10, page = 1, search = "",sortBy = "desc" ){
        return instance.get(`/bid/bid-details/${id}`,{withCredentials:true,params:{
            limit,
            page, 
            search,
            sortBy
        }}).then(res => res.data?.data|| res.data)

    };
    getbidByProductId(productId:string){
        return instance.get(`/bid/get-bid-by-productId/${productId}`).then(res => res.data?.data|| res.data)
    }
    deleteBid(productId:string){
        return instance.delete(`/bid/delete-bid/${productId}`,{
            withCredentials:true
        }).then(res => res.data?.data|| res.data)
    }
}
export default new BidService();