import instance from "@/lib/instance";

class BannerService {
      getBanners(){
        return instance.get('/banner/get-banners').then(res => res.data?.data|| res.data)
    };
}
export default new BannerService();