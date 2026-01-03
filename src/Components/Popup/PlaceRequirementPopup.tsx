import React from "react";
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

  function handleChange(e:React.FormEvent<HTMLInputElement>){
    const value = e.currentTarget.value.replace(/\D/g, "");
    setBidDuration(Number(value))
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    console.log(e.key)
  if (e.key.toLowerCase() === ".") {
    e.preventDefault();
  }
}
  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogContent style={{
        maxWidth:'470px'
      }}>
              <DialogHeader>
            <DialogTitle className="text-black text-3xl font-extrabold">Place Requirement</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              How Long Should Your Requirement Remain Active?  <small className="italic">(in Days)</small>
            </DialogDescription>
          </DialogHeader>
 <form className="py-2 max-w-md inline-block mb-0" onSubmit={(e)=>(handleSubmit(e))}>

        <div className="space-y-4 w-full">   
          <Input
            type="number"
            name="bidDuration"
            placeholder="Ex. 15"
            onKeyDown={handleKeyDown}
            value={bidDuration|| undefined}
            className="w-full py-5 rounded-md border border-gray-300"
            onChange={handleChange}
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
