import React, { useState } from 'react'
import Api from '../../../Service/api.js';

const Paypal_meathod = (props) => {

  const [paypalemail , Setpaypal] = useState("");

  function onchange_input(e) {
    Setpaypal(e.target.value)
  };

  async function send_paypal_info() {
    try {
      if (!paypalemail.trim()) return
      await Api.post("/profile/payment_method" , {
        type : "paypal",
        details : {
                    "paypalemail" : paypalemail.trim()
                }
      });
      if (props.onSaved) {
        await props.onSaved();
      }
      props.close();
    } catch (error) {
        console.log("Error sending Paypal data", error?.response?.data || error.message);
          return
    }
  }

  return (
    <div className='w-full h-fit flex flex-col mt-6 gap-2 justify-between'>
        <div className='w-full flex flex-col gap-2 h-fit'>
            <span className='text-gray-300'>PayPal email</span>
            <input onChange={onchange_input} value={paypalemail} required type="text" placeholder='you@paypal.com'  autoComplete='off' className='w-full p-4 h-11 text-xl border-2 rounded-xl text-amber-50 font-bold'/>
        </div>
        <div onClick={send_paypal_info} className='w-full h-fit p-3 text-xl cursor-pointer mt-4 font-bold bg-amber-50 text-black flex justify-center items-center rounded-xl'>Save</div>
    </div>
  )
}

export default Paypal_meathod