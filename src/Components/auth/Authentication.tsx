import React, { useState } from 'react'
import LoginPopup from '../Popup/LoginPopup'
import OtpPopup from '../Popup/OTPPopup';
type Props = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}
const Authentication = ({ open, setOpen }: Props) => {
  const [otpPopup, setOtpPopup] = useState(false);
  const [number, setNumber] = useState("");
  const [sessionId, setSessionId] = useState("");

  return (
    <>
      {open && (
        <LoginPopup
          open={open}
          setOpen={setOpen}
          setNumber={setNumber}
          setOtpPopup={setOtpPopup}
          setSessionId={setSessionId}
        />
      )}

      {otpPopup && (
        <OtpPopup
          open={otpPopup}
          setOpen={setOtpPopup}
          number={number}
          sessionId={sessionId}
          setSessionId={setSessionId}
        />
      )}
    </>
  );
};

export default Authentication;
