
import React from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dealId: string;
  budget: number;
  partnerName: string;
  onAction: (dealId: string, action: 'accept' | 'reject') => Promise<void> | void;
  loading?: boolean;
};

const ApprovalPopup: React.FC<Props> = ({ open, setOpen, dealId, budget, partnerName, onAction, loading }) => {
  
  const handleAction = (action: 'accept' | 'reject') => {
    if (onAction) {
      onAction(dealId, action);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-4xs">
        <div className="p-3 max-w-md inline-block space-y-5">
          <div className="space-y-2 grid">
            <DialogTitle className="text-gray-800 text-3xl font-extrabold text-center">Approved Deal</DialogTitle>
            <DialogDescription className='text-md text-gray-600 text-center'>
              <span className="font-semibold">{partnerName}</span> has requested to close the deal at <span className="font-bold text-orange-600">₹{budget}</span>.
            </DialogDescription>
            <DialogDescription className='text-sm text-gray-500 text-center'>
              Do you want to complete this deal or reject the request?
            </DialogDescription>
          </div>
          <div className="space-y-5 w-full">
            <div className="flex justify-center gap-4">
               <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 px-6 py-2 rounded font-semibold disabled:opacity-50"
                onClick={() => handleAction('reject')}
                disabled={loading}
              >
                {loading ? "Processing..." : "Reject Deal"}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                onClick={() => handleAction('accept')}
                disabled={loading}
              >
                {loading ? "Processing..." : "Complete Deal"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ApprovalPopup
