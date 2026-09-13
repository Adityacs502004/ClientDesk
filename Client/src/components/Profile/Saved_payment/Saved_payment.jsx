import React, { useEffect, useRef, useState } from 'react';
import Api from '../../../Service/api';

const Saved_payment = ({ item, onDelete , setdefault}) => {
    const [editpopup , Seteditpopup] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      function handleOutsideClick(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          Seteditpopup(false);
        }
      }

      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    function onclick_edit_payment(){
        Seteditpopup(!editpopup);
    }


  let details = item?.details;
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch {
      details = {};
    }
  }
  const label = item?.type === 'bank' ? 'Bank account' : item?.type === 'upi' ? 'UPI' : item?.type === 'paypal' ? 'PayPal' : 'Payment method';


  function get_account_detail() {
    if (item?.type == 'bank') {
        return details?.accountnumber || 'Account number not added';
    }

    const upi_or_paypal = details?.upiid || details?.paypalemail;
    return upi_or_paypal || 'Payment ID not added';
  }

  function get_secondary_details() {
    if (item?.type === 'bank') {
      return [
        details?.accountname ? `Account holder: ${details.accountname}` : null,
        details?.bankname ? `Bank: ${details.bankname}` : null,
        details?.ifsccode ? `IFSC: ${details.ifsccode}` : null,
      ].filter(Boolean);
    }

    if (item?.type === 'upi') {
      return details?.upiid ? [`UPI ID: ${details.upiid}`] : [];
    }

    if (item?.type === 'paypal') {
      return details?.paypalemail ? [`PayPal: ${details.paypalemail}`] : [];
    }

    return [];
  }


  return (
     <div className='w-full min-h-[140px] flex items-center bg-gray-400 rounded-xl'>
              <div className='w-full h-full flex items-center gap-3 p-3 justify-between'>
                <div className='w-full h-fit flex items-center gap-4'>
                  <div className='h-8 w-8 bg-[url("/Payment_icon/bank.png")] bg-contain bg-no-repeat'></div>
                <div className='w-fit h-fit flex flex-col gap-2'>
                    <div className='w-fit h-fit flex gap-8'>
                        <div className='text-gray-800 text-xl'>{label}</div>
                        {item?.is_default ? <div className='w-fit h-fit p-1 rounded-lg bg-green-400 flex gap-2'>
                            <div className='w-6 h-6 ml-2 bg-[url("/star-medal.png")] bg-contain bg-no-repeat'></div>
                            <span className='text-md text-amber-50 mr-2'>Default</span>
                        </div> : null}
                    </div>

                  <div className='flex flex-col gap-1 text-gray-800 text-sm'>
                    {get_secondary_details().map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                    <div className='font-semibold text-gray-900 break-all'>{get_account_detail()}</div>
                  </div>
                </div>
                </div>
                <div ref={menuRef} className='relative w-fit h-fit flex flex-col'>
                  <button type='button' onClick={onclick_edit_payment} className='text-2xl text-gray-800 font-extrabold cursor-pointer'>...</button>
                  {editpopup ? <div className='absolute right-0 top-full z-20 mt-2 w-50 flex flex-col rounded-xl  bg-gray-600 shadow-lg overflow-hidden'>
                <div onClick={()=> {
                    setdefault?.(item.id)
                    onclick_edit_payment();
                }} className='w-full cursor-pointer h-fit border-b border-2 border-gray-400 flex justify-center gap-2 items-center'>
                    <div className='w-8 h-8 bg-[url("/star.png")] bg-contain bg-no-repeat'></div>
                    <div className='text-lg text-gray-100 font-semibold'>Set as Default</div>
                </div>
                <button type='button' onClick={() => onDelete?.(item.id)} className='w-full cursor-pointer h-fit border-b border-2 border-gray-400 flex justify-center gap-4 items-center'>
                    <div className='w-8 h-8 bg-[url("/delete.png")] bg-contain bg-no-repeat'></div>
                    <div className='text-xl text-red-400 font-semibold'>Delete</div>
                </button>
            </div> : null}
                </div>
                

                                
              </div>
             </div>
  )
}

export default Saved_payment