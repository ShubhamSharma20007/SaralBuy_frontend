import React, { useState } from 'react'
import LoginPopup from '../Popup/LoginPopup'
import OtpPopup from '../Popup/OTPPopup';
type Props = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}
const Authentication = ({open,setOpen}:Props) => {
    const [otpPopup, setOtpPopup] = useState(false);
    const [number, setNumber] = useState('');
    const [sessionId,setSessionId]= useState('')
  return (
    <React.Fragment> 
      <LoginPopup open={open} setOpen={setOpen} setNumber={setNumber} setOtpPopup={setOtpPopup} setSessionId={setSessionId} />
      <OtpPopup open={otpPopup} setOpen={setOtpPopup} number={number} sessionId={sessionId}/>
    </React.Fragment>
  )
}

export default Authentication