
import instance from "@/lib/instance";

class AuthService{
    sendOtp(pNo:string){
        return instance.post('/user/send-otp',{
            pNo
        }).then(res => res.data?.data|| res.data)
    };
    verifyOtp(pNo:string,otp:string,sessionId:string){
        return instance.post('/user/verify-otp',{
            pNo,
            otp,
            sessionId
        },{
            withCredentials:true
        }).then(res => res.data?.data|| res.data)
    };
    userProfile(){
        return instance.get('/user/profile',{
            withCredentials:true
        }).then(res => res.data?.data|| res.data)
    }

}
export default new AuthService();