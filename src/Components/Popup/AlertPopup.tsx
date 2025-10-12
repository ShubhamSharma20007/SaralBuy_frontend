import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"

type Message = {
  title: string;
  message: string;
};

type Props={
  open:boolean;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;
  message:Message,
  triggerButton:React.ReactNode;
  deleteFunction:()=> void;
  loading:boolean
} 

const AlertPopup:React.FC<Props> =({open,setOpen,message,triggerButton,deleteFunction,loading})=>{
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger>{triggerButton}</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{message.title}</AlertDialogTitle>
      <AlertDialogDescription>
        {message.message}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
      <AlertDialogAction
      disabled={loading}
      onClick={deleteFunction}
      className="cursor-pointer bc  border-primary-btn border-2">Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    )
}

export default AlertPopup
