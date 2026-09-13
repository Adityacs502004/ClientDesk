import React, { useState } from 'react'
import Bank_payment from './Payment_meathod/Bank_payment'
import Upi_payment from './Payment_meathod/Upi_payment'
import Paypal_meathod from './Payment_meathod/Paypal_meathod'

const Payment_popup = (props) => {

  const [selected_section , Setsection] = useState("Bank");
  

  function handle_close() {
    props.close()
  }
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4' onClick={handle_close}>
        <div className='absolute inset-0 bg-black/60 backdrop-blur-sm'></div>
        <div onClick={(event) => event.stopPropagation()} className='relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#2C2C2A]/95 p-6 shadow-2xl shadow-black/40'>

            <div className='w-full h-fit flex items-center justify-between gap-4'>
                <div className='text-amber-50 font-semibold text-2xl '>Add Payment</div>
                <button type='button' onClick={handle_close} className='cursor-pointer w-10 h-10 rounded-xl bg-[url("/close_otp_box.png")] bg-contain bg-no-repeat bg-center shrink-0' aria-label='Close payment popup'></button>
            </div>

            <div className='mt-6 text-gray-300'>
              Add your payment method details here.
            </div>

            {/* payment meathods */}

            <div className='w-full mt-4 gap-[15%] h-fit flex justify-between'>
              <div onClick={()=>Setsection("Bank")} className={`w-1/3 h-fit text-gray-400 border-2 border-gray-400 p-2 ${selected_section == "Bank" ? 'bg-gray-700' : null} flex justify-center cursor-pointer font-bold rounded-xl`}>Bank</div>
              <div onClick={()=>{Setsection("Upi")}} className={`w-1/3 h-fit text-gray-400 border-2 border-gray-400 ${selected_section == "Upi" ? 'bg-gray-700' : null} p-2 flex justify-center cursor-pointer font-bold rounded-xl`}>Upi</div>
              <div onClick={()=>{Setsection("Paypal")}} className={`w-1/3 h-fit text-gray-400 border-2 ${selected_section == "Paypal" ? 'bg-gray-700' : null} border-gray-400 p-2 cursor-pointer flex justify-center font-bold rounded-xl`}>Paypal</div>
            </div>

            {/* Payment option details */}
            {selected_section == "Bank" ? <Bank_payment  close={handle_close} onSaved={props.onSaved}/> : null}
            {selected_section == "Upi" ? <Upi_payment  close={handle_close} onSaved={props.onSaved}/> : null}
            {selected_section == "Paypal" ? <Paypal_meathod  close={handle_close} onSaved={props.onSaved}/> : null}
            
        </div>
    </div>
  )
}

export default Payment_popup