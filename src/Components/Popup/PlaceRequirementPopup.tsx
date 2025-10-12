import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Spinner } from "../ui/shadcn-io/spinner";

type Props={
  open:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>
  createProductFn:(isDraft: boolean) => Promise<void>;
  bidDuration:number|undefined;
  setBidDuration:React.Dispatch<React.SetStateAction<number | undefined>>;
  loading:boolean;
  buttonType:boolean|null;
} 
const PlaceRequirementPopup:React.FC<Props> = ({open,setOpen,createProductFn,bidDuration,setBidDuration,loading,buttonType}) => {

  async function handleSubmit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Number(e.currentTarget?.bidDuration.value);
    if(value <= 0){
      toast.error("Bid duration must be greater than 0");
      return;
    }
    setBidDuration(value)
    if(bidDuration){
    await createProductFn(false);
    setOpen(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent style={{
        maxWidth:'400px'
      }}>
              <DialogHeader>
            <DialogTitle className="text-black text-3xl font-extrabold">Place Requirement</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              How Long Should You Bid Remain Active ? <small className="italic">(in Days)</small>
            </DialogDescription>
          </DialogHeader>
 <form className="py-2 max-w-md inline-block mb-0" onSubmit={(e)=>(handleSubmit(e))}>

        <div className="space-y-4 w-full">   
          <Input
            type="number"
            name="bidDuration"
            placeholder="Enter your bid"
            value={bidDuration|| undefined}
            className="w-full py-5 rounded-md border border-gray-300"
            onChange={(e) => setBidDuration(Number(e.target.value))}
          />
          <Button 
          disabled={(bidDuration&& bidDuration <= 0) || loading }
          type="submit" className="w-full rounded-sm py-5  text-white font-bold cursor-pointer" >
           {
            loading && !buttonType ? <Spinner className="w-5 h-5 animate-spin" /> : 'Place Requirement '
           } 
          </Button>
        </div>
</form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceRequirementPopup;
