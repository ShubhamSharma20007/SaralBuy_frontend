import React, { useEffect, useRef } from "react";
import saralBuyLogo from "../../image/Logo/saralBuyLogo.png";
import { useFetch } from "@/helper/use-fetch";
import { Button } from "../ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp"; 
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import authService from "@/services/auth.service";
import { DialogTitle } from "@radix-ui/react-dialog";
import { getUserProfile } from "@/zustand/userProfile";
import { Spinner } from "../ui/shadcn-io/spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
// import { toast } from "sonner";

type Props={
  open:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;
  number?:string;
  sessionId?:string
  setSessionId?:React.Dispatch<React.SetStateAction<string>>
} 
const OtpPopup:React.FC<Props> = ({open,setOpen,number,sessionId,setSessionId}) => {
  const {fn,data,loading}= useFetch(authService.verifyOtp)
  const [value, setValue] = React.useState("")
  const countDown =60; 
  const [sentTimer,setResentTimer]=React.useState(countDown)
  const getProfile=  getUserProfile()
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timeout  |null>(null);
  const {fn:sendOtp,data:sendOtpResponse} = useFetch(authService.sendOtp)
  const handleVerify = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // if(!sessionId) return toast.error('sessionId is missing')
    await fn(number,value,sessionId);
  }

useEffect(() => {
  if (data) {
    getProfile.execute();
    setOpen(false);
    window.location.reload()
  }
}, [data]);

useEffect(() => {
  if (sentTimer === 0) {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return;
  }

  timer.current = setInterval(() => {
    setResentTimer((prev) => prev - 1);
  }, 1000);

  return () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
}, [sentTimer]);

async function callTimer() {
  if (timer.current) {
    clearInterval(timer.current);
  }
  setResentTimer(countDown);
}

 useEffect(()=>{
    if(sendOtpResponse){
      toast.success('OTP Resent successfully')
      setSessionId?.(sendOtpResponse?.sessionId)
    }
  },[sendOtpResponse])


useEffect(() => {
  if (getProfile.user) {
    const { firstName, lastName, email } = getProfile.user as any;
    if (!firstName && !lastName && !email) {
      navigate("/account");
    }
  }
}, [getProfile.user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full p-6 space-y-3">
    
        <div className="h-16 flex justify-center">
          <img
            src={saralBuyLogo}
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
       <div className="space-y-2">
         <DialogTitle className=" text-gray-700 text-3xl font-extrabold ">OTP Verification</DialogTitle>
         <p className="text-sm">Enter the OTP code sent on your number {number?.toString().slice(0,4)}******</p>
       </div>

        <form onSubmit={handleVerify} className="flex justify-center items-center flex-col space-y-5">
         <InputOTP maxLength={6}  value={value}
        onChange={(value) => setValue(value)}>
      <InputOTPGroup className="space-x-4">
        <InputOTPSlot
          index={0}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold h-10 w-10"
        />
        <InputOTPSlot
          index={1}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
        <InputOTPSlot
          index={2}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
        <InputOTPSlot
          index={3}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
         <InputOTPSlot
          index={4}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
         <InputOTPSlot
          index={5}
          className="bg-secondary rounded-md border-l border-accent shadow-none font-semibold"
        />
      </InputOTPGroup>
    </InputOTP>
 <div className="grid gap-3 w-full">
 <button
  type="button"
  disabled={sentTimer > 0}
  onClick={()=>{
    callTimer();
    sendOtp(number)
  }}
  className={`text-sm text-right w-full underline 
    ${sentTimer > 0 ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-orange-700"}`}
>
  Resend OTP {sentTimer > 0 ? `(${sentTimer}s)` : ""}
</button>

     <Button type="submit" disabled={loading|| value.length !== 6} className="w-full py-5 cursor-pointer  text-white font-bold rounded-sm" >
               {
                loading ? <Spinner className="w-5 h-5 animate-spin" /> : 'Continue'
                }
              </Button>
 </div>
        </form>
        
      </DialogContent>
    </Dialog>
  );
};

export default OtpPopup;
