import React, { useEffect } from "react";
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

type Props={
  open:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;
  number?:string;
  sessionId?:string
} 
const OtpPopup:React.FC<Props> = ({open,setOpen,number,sessionId}) => {
  const {fn,data,loading}= useFetch(authService.verifyOtp)
    const [value, setValue] = React.useState("")
  const getProfile=  getUserProfile()
  const navigate = useNavigate();
  const handleVerify = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!sessionId) return toast.error('sessionId is missing')
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
         <p className="text-sm">Enter the OTP code send on your number {number?.toString().slice(0,4)}******</p>
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
     <Button type="submit" disabled={loading|| value.length !== 6} className="w-full py-5 cursor-pointer  text-white font-bold rounded-sm" >
               {
                loading ? <Spinner className="w-5 h-5 animate-spin" /> : 'Continue'
                }
              </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OtpPopup;
