import React, { useState } from 'react'
import Api from '../../../Service/api.js';

const Upi_payment = (props) => {
  const [upiid , Setupiid] = useState("");

  function set_upi_id(e) {
    Setupiid(e.target.value)
  }

  async function send_upi_info() {
    try {
      if (!upiid.trim()) return
      await Api.post("/profile/payment_method" , {
        type : "upi",
        details : {
                    "upiid" : upiid.trim()
                }        
      })
      if (props.onSaved) {
        await props.onSaved();
      }
      props.close();
    } catch (error) {
        console.log("Error sending UPI data", error?.response?.data || error.message);
          return
    }
  }
  return (
    <div className='w-full h-fit flex flex-col mt-6 gap-2 justify-between'>
        <div className='w-full flex flex-col gap-2 h-fit'>
            <span className='text-gray-300'>UPI ID</span>
            <input onChange={set_upi_id} value={upiid} type="text" placeholder='Abc9101@sbi'  autoComplete='off' className='w-full p-4 h-11 text-xl border-2 rounded-xl text-amber-50 font-bold'/>
        </div>
        <div onClick={send_upi_info} className='w-full cursor-pointer h-fit p-3 text-xl mt-4 font-bold bg-amber-50 text-black flex justify-center items-center rounded-xl'>Save</div>
    </div>
  )
}

export default Upi_payment