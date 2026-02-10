import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog"
import { Input } from "@/Components/ui/input"
import { CircleAlert } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onConfirm: (amount: number) => void
  loading?: boolean
}

const BudgetInputDialog: React.FC<Props> = ({ open, setOpen, onConfirm, loading }) => {
  const [amount, setAmount] = useState("")

  const handleConfirm = () => {
    const numAmount = Number(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid budget amount")
      return
    }
    onConfirm(numAmount)
    setAmount("") 
  }

  const handleCancel = () => {
    setAmount("")
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-3">
            <div className="bg-orange-100 rounded-full p-1">
              <CircleAlert className="text-yellow-500" />
            </div>
            Close Deal
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enter the agreed budget amount to close the deal
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-2">
          <Input
            type="number"
            placeholder="Enter budget amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)

            }}
            min="0"
            step="0.01"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={handleConfirm}
            className="bg-orange-600 cursor-pointer hover:bg-orange-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Closing..." : "Confirm & Close Deal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default BudgetInputDialog