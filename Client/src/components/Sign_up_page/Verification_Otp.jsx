import React, { useEffect, useState } from 'react';
import { InputOtp } from 'primereact/inputotp';
import { Button } from 'primereact/button';
import Api from '../../Service/api';
import { useNavigate } from 'react-router';
import useAuth from '../Hooks/useAuth';

export default function SampleDemo({SetShowotp , email}) {
    
    const [Otp_input, setOtpInput] = useState();
    const [resendLockedUntil, setResendLockedUntil] = useState(null);
    const [display_msg , setdisplay_msg] = useState({
        success : false, 
        msg: ""
    });
    const navigate = useNavigate();
    const { refreshAuth } = useAuth();

    useEffect(() => {
        const interval = setInterval(() => {
            if (!resendLockedUntil) return;

            const remainingMs = new Date(resendLockedUntil).getTime() - Date.now();
            if (remainingMs <= 0) {
                setResendLockedUntil(null);
                setdisplay_msg({ success: true, msg: 'Resend OTP is available again.' });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [resendLockedUntil]);

    const getLockedCountdownText = () => {
        if (!resendLockedUntil) return '';

        const remainingMs = Math.max(new Date(resendLockedUntil).getTime() - Date.now(), 0);
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const customInput = ({events, props}) => {
        return <><input {...events} {...props} type="text" className="custom-otp-input-sample" />
            {props['data-index'] === 2 && <div className="px-3">
                <i className="pi pi-minus" />
            </div>}
        </>
    };
    async function Resend_otp() {
        if (resendLockedUntil && new Date(resendLockedUntil).getTime() > Date.now()) {
            const remaining = getLockedCountdownText();
            setdisplay_msg({ success: false, msg: `Resend is locked for ${remaining}.` });
            return;
        }

        try {
            const resend_otp = await Api.post('/api/register/otp',{
                resend : true,
                email : email,
                submitted_otp : Otp_input
            });
            if(resend_otp.data.success){
                setdisplay_msg({success : true , msg : `${resend_otp.data.message}`});
                setResendLockedUntil(null);
            }
            else{
                if (resend_otp.data.locked_until) {
                    setResendLockedUntil(resend_otp.data.locked_until);
                }
                setdisplay_msg({success : false , msg : resend_otp.data.message});
            }
        } catch (error) {
            const serverMessage = error?.response?.data?.message;
            const lockedUntil = error?.response?.data?.locked_until;

            if (lockedUntil) {
                setResendLockedUntil(lockedUntil);
            }

            setdisplay_msg({success : false , msg : serverMessage || "Error resending otp. Please try again."});
            console.log("Error resending otp:", error);
        }
    }
    async function Submit_otp() {
        try {
            const submit_otp = await Api.post('/api/register/otp' , {
                resend : false,
                email : email,
                submitted_otp : Otp_input
            });
            if(submit_otp.data.success){
                SetShowotp(false);
                await refreshAuth();
                navigate('/dashboard');
            }
            else{
                setdisplay_msg({success : false , msg : submit_otp.data.message});
            }
        } catch (error) {
            setdisplay_msg({success : false , msg : "Error verifying otp. Please try again."});
            console.log("Error verifying otp:", error);
        }
        console.log(Otp_input);
    }
   

    return (
      <>
        <div className="fixed inset-0 bg-black/70"></div>

        <div className="fixed inset-0 flex items-center justify-center"></div>
        
          <div className='popup h-fit w-3/7 p-4 flex flex-col items-center bg-gray-600/90 absolute left-2/7 top-2/7 rounded-2xl '>
        
        <div className='w-full h-fit flex relative justify-center mb-2'>
            <div className='h-25 w-25 bg-[url("/verify.png")]  bg-contain bg-no-repeat'></div>
        </div>
        
        <div className="card flex justify-center">
            <style scoped>
                {`
                    .custom-otp-input-sample {
                        width: 48px;
                        height: 48px;
                        font-size: 24px;
                        appearance: none;
                        text-align: center;
                        transition: all 0.2s;
                        border-radius: 0;
                        border: 1px solid var(--surface-400);
                        background: transparent;
                        outline-offset: -2px;
                        outline-color: transparent;
                        border-right: 0 none;
                        transition: outline-color 0.3s;
                        color: white;
                    }

                    .custom-otp-input-sample:focus {
                        outline: 2px solid var(--primary-color);
                    }

                    .custom-otp-input-sample:first-child,
                    .custom-otp-input-sample:nth-child(5) {
                        border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                    }

                    .custom-otp-input-sample:nth-child(3),
                    .custom-otp-input-sample:last-child {
                        border-top-right-radius: 12px;
                        border-bottom-right-radius: 12px;
                        border-right-width: 1px;
                        border-right-style: solid;
                        border-color: var(--surface-400);
                    }
                `}
            </style>
            <div className="flex flex-col items-center">
                <p className="font-bold text-xl mb-2">Authenticate Your Account</p>
                <p className="text-color-secondary block mb-5">Please enter the code sent to your email.</p>
                <InputOtp value={Otp_input} onChange={(e) => setOtpInput(e.value)} length={6} inputTemplate={customInput} style={{gap: 0}}/>
                <div className="flex justify-between mt-5 self-stretch items-center">
                    <Button
                        label={resendLockedUntil ? `Resend in ${getLockedCountdownText()}` : 'Resend Code'}
                        onClick={Resend_otp}
                        link
                        className="p-0"
                        style={{ backgroundColor: 'white', opacity: resendLockedUntil ? 0.6 : 1, pointerEvents: resendLockedUntil ? 'none' : 'auto' }}
                        disabled={Boolean(resendLockedUntil)}
                    ></Button>
                    <Button onClick={Submit_otp} name='submit_otp' label="Submit Code"></Button>
                </div>
                {display_msg.msg && (display_msg.success ? <div className='text-green-700 mt-4 font-black'>{display_msg.msg}</div> : <div className='text-red-500 mt-4 font-black'>{display_msg.msg}</div>)}
            </div>
        </div>

      </div>
      </>
      
        
        
    );
}
        