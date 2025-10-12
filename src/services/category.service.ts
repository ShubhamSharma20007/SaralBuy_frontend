
import instance from "@/lib/instance";

class CategoryService{
    getCategories(){
        return instance.get('/category/get-category').then(res => res.data?.data|| res.data)
    }
    getCategoriesById(categoryId:string){
        return instance.get(`/category/get-category/${categoryId}`).then(res => res.data?.data|| res.data)
    }
}
export default new CategoryService();