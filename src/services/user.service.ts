import instance from "@/lib/instance";

class UserService{
    updateProfile(obj:any){
        return instance.post('/user/update-profile',obj,{
            withCredentials:true
        }).then(res => res.data?.data|| res.data)
    }
    logout(){
        return instance.get('/user/logout',{
            withCredentials:true
        }).then(res => res.data?.data|| res.data)
    }
}

export default new UserService();