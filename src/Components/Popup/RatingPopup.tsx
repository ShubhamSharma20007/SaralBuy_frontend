
import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import ReactStars from 'react-stars'
type Props={
  open:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;

} 
const RatingPopup:React.FC<Props> = ({open,setOpen}) => {
 const ratingChanged = (newRating:number) => {
  console.log(newRating)
}

  return (
     <Dialog  open={open} onOpenChange={setOpen}>
      <DialogContent className="w-4xs">
    <form  className=" p-3 max-w-md inline-block space-y-5 ">
    <div className="space-y-2 grid">
         <DialogTitle className=" text-gray-800 text-3xl font-extrabold text-center">Rating</DialogTitle>
         <DialogTitle className=" text-2xl  text-gray-700 text-center">{`How many starts would you give the user?`}</DialogTitle>
         <p className='text-md text-gray-600 text-center'>Please rate your experience with this user. Your feedback helps us maintain a safe and trustworthly community for eveyone.</p>
       </div>
        <div className="space-y-5 w-full">
        {/* starts */}

<div className='flex justify-center items-center'>
    <ReactStars
    className='flex gap-3'
  count={5}
  onChange={ratingChanged}
  size={40}
  half={false}
  char={'★'}
  color2={'#ffd700'} />
</div>
        </div>
    </form>
      </DialogContent>
    </Dialog>
  )
}

export default RatingPopup