import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select"; // Adjust path based on your structure
import { Button } from "../ui/button";
import { Spinner } from "../ui/shadcn-io/spinner";
import { Input } from "../ui/input";

type Props={
  open:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  value?:string;
  handleCreteBid:()=>void;
  createBidLoading:boolean
  [key:string]:any

} 
const SellerVerificationPopup:React.FC<Props> = ({open,setOpen,setValue,value,handleCreteBid,createBidLoading,setBusinessDets,businessDets}) => {
  return (
    <>    
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-4xs">
    <form onSubmit={(e)=>{
        e.preventDefault();
        handleCreteBid();
    }} className="p-2 max-w-md inline-block space-y-5 ">
    <div className="space-y-2">
         <DialogHeader className=" text-black text-3xl font-extrabold ">Seller Verification</DialogHeader>
         <DialogTitle className=" text-sm text-gray-600"> Placing Bid as an Individual or Business Owner?</DialogTitle>
       </div>
     <div className="space-y-3">
    <Select onValueChange={(value) => setValue?.(value)} value={value}>
      <SelectTrigger id="userType" className="w-full py-5 rounded-md border border-gray-300">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent >
        <SelectItem value="individual" className="dropdown-hover py-2">Individual</SelectItem>
        <SelectItem value="business" className="dropdown-hover py-2">Business Owner</SelectItem>
      </SelectContent>
    </Select>
    {
      value === "business" && (
        <div className="grid space-y-2 mt-4">
        <Input
        value={businessDets.company_name}
        onChange={(e)=>{setBusinessDets({...businessDets, company_name: e.target.value})}}
        className="w-full py-5 rounded-md border border-gray-300" name="company_name" placeholder="Company Name"/>
        <Input  
         value={businessDets.company_reg_num}
          onChange={(e)=>{setBusinessDets({...businessDets, company_reg_num: e.target.value})}}
        className="w-full py-5 rounded-md border border-gray-300" name="company_reg_num" placeholder="Company Reg. Number"/>
        <Input
             value={businessDets.gst_num}
          onChange={(e)=>{setBusinessDets({...businessDets, gst_num: e.target.value})}}
        className="w-full py-5 rounded-md border border-gray-300" name="gst_num" placeholder="GSTIN Number"/>
        </div>
      )
    }

         <Button 
         disabled={!value || createBidLoading}
         type="submit" className="w-full rounded-sm py-5  text-white font-bold cursor-pointer" >
            {
              createBidLoading ? <Spinner className="w-5 h-5 animate-spin" /> : 'Place Bid'
            }
          </Button>
  </div>
    </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SellerVerificationPopup;
