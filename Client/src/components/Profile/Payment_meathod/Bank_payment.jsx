import React, { useState } from 'react';
import Api from '../../../Service/api.js';

const Payment_meathod = (props) => {

    const [accountname , Setaccountname] = useState("");
    const [accountnumber , Setaccountnumber] = useState("");
    const [ifsccode , Setifsccode] = useState("");

    function onchange_account_name(e){
        Setaccountname(e.target.value)
    };
    function onchnage_account_number(e) {
        Setaccountnumber(e.target.value)      
    };
    function onchange_ifsc_code(e) {
        Setifsccode(e.target.value)        
    };

    async function onclick_save_btn() {
        if(!accountname  || !accountnumber || !ifsccode) return 
        try {
            await Api.post("/profile/payment_method" , {
                type : "bank",
                details : {
                    "accountname" : accountname , 
                    "accountnumber" : accountnumber,
                    "ifsccode" : ifsccode
                }
                
            });
            if (props.onSaved) {
                await props.onSaved();
            }
            props.close();
            
        } catch (error) {
            console.log("Error sending bank payement data", error?.response?.data || error.message);
            return
        }
    }

  return (
    <div className='w-full h-fit flex flex-col mt-6 gap-2 justify-between'>
        <div  className='w-full flex flex-col gap-2 h-fit'>
            <span className='text-gray-300'>Account holder name</span>
            <input required onChange={onchange_account_name} value={accountname} type="text" placeholder='Enter account holder name'  autoComplete='off' className='w-full p-4 h-11 text-xl border-2 rounded-xl text-amber-50 font-bold'/>
        </div>
        <div className='w-full flex flex-col gap-2 h-fit'>
            <span className='text-gray-300'>Account number</span>
            <input required onChange={onchnage_account_number} value={accountnumber} type="number" inputMode='number' placeholder='XXXXXXXX4579'  autoComplete='off' className='w-full p-4 h-11 text-xl border-2 rounded-xl text-amber-50 font-bold'/>
        </div>
        <div className='w-full flex flex-col gap-2 h-fit'>
            <span className='text-gray-300'>IFSC Code</span>
            <input required onChange={onchange_ifsc_code} value={ifsccode} type="text" placeholder='SBI00012345'  autoComplete='off' className='w-full p-4 h-11 text-xl border-2 rounded-xl text-amber-50 font-bold'/>
        </div>
        <div onClick={onclick_save_btn} className='w-full h-fit p-3 text-xl mt-4 cursor-pointer font-bold bg-amber-50 text-black flex justify-center items-center rounded-xl'>Save</div>
    </div>
  )
}

export default Payment_meathod