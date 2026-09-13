import React, { useEffect, useState } from 'react'
import Payment_popup from './Payment_popup';
import Saved_payment from './Saved_payment/Saved_payment';
import Api from '../../Service/api';

const Invoicing = () => {

  const [invoicing_data  , Setinvoicingdata] = useState(null);

  const [invoicename , Setinvoicename] = useState("");
  const [address , Setaddress] = useState("");
  const [taxid , Settaxid] = useState(""); 

  const [selectedimage , Setimage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [payment_popup , Setpaymentpopup] = useState(false);
  const maxSignatureSize = 2 * 1024 * 1024;

  const [saved_payment_meathod , Setmeathod] = useState([]);

  function handle_invoicename_change(e) {
    Setinvoicename(e.target.value)
  }
  function handle_address_change(e) {
    Setaddress(e.target.value)
  }

  function handle_taxid_change(e) {
    Settaxid(e.target.value)
  }

  function onclick_add_payment(){
    Setpaymentpopup(true)
  };
  function close_popup() {
    Setpaymentpopup(false)
  };

  function handleimagechange(e){
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (file.size > maxSignatureSize) {
      Setimage(null);
      setPreviewUrl(null);
      setUploadError('Signature must be 2MB or smaller.');
      e.target.value = '';
      return;
    }

    Setimage(file);
    setUploadError('');
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function get_payment_meathods() {
      try {
        const get_meathods = await Api.get("/profile/get_meathods");
        const meathods = get_meathods.data.meathods || [];
        Setmeathod(meathods);
      } catch (error) {
        console.log("Error getting payments data from backend", error?.response?.data || error.message);
        Setmeathod([]);
        return
      }
    }

  async function handle_delete_payment_meathod(paymentId) {
    try {
      await Api.post("/profile/delete_meathod" , {
            id : paymentId
        });
        await get_payment_meathods();
    } catch (error) {
      console.log("Error deleting payment meathod", error?.response?.data || error.message);
        return
    }
  }

  async function handle_set_as_default(paymentId) {
    try {
      await Api.post("/profile/setdefault" , {
        id : paymentId
      });
      await get_payment_meathods();
    } catch (error) {
      console.log("Error making meathod as default");
      return
    }
  }

  useEffect(()=>{
    async function load_payment_meathods() {
      await get_payment_meathods();
    }

    load_payment_meathods();

  },[]);


  async function handle_onclick_save() {
    try {
      const trimmedInvoiceName = invoicename.trim();
      const trimmedAddress = address.trim();

      if (!trimmedInvoiceName || !trimmedAddress) {
        setUploadError('Name on invoice and address are required.');
        return;
      }

      if (!selectedimage && !invoicing_data?.signature_url) {
        setUploadError('Please select a signature image before saving.');
        return;
      }

      const formData = new FormData();
      if (selectedimage) {
        formData.append("signature" , selectedimage);
      }
      formData.append("invoice_name" , trimmedInvoiceName);
      formData.append("address" , trimmedAddress);
      formData.append("taxid" , taxid);
      await Api.post("/profile/save_data" , formData);
      await get_invoicing_details();
    } catch (error) {
      console.log("Error saving data to backend");
      return
    }
  }

  async function get_invoicing_details(req , res) {
    try {
      const get_invoicing_detail = await Api.get(`/profile/get_user_invoicing`);
      const data = get_invoicing_detail.data.invoicing_data;
      Setinvoicingdata(data);
    } catch (error) {
      console.log("Error getting user invoicing data from backend" , error?.response?.data || error.message);
      return
    }
  }

  useEffect(()=>{
    get_invoicing_details();
  },[]);

  useEffect(() => {
    if (!invoicing_data) {
      return;
    }

    Setinvoicename(invoicing_data.invoice_name || "");
    Setaddress(invoicing_data.address || "");
    Settaxid(invoicing_data.gst_number || "");
    setPreviewUrl(invoicing_data.signature_url || null);
  }, [invoicing_data]);
  
  return (
    <div className='w-full h-fit text-amber-50 flex justify-center'>
      {/* invoicing sec */}
        <div className="h-full w-3/5 bg-gray-800 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-1 border border-gray-100 flex flex-col items-center justify-center p-4 gap-8">
            {/* Name on invoice / company name */}
            <div className='w-full flex flex-col h-fit gap-2'>
                <span className='text-gray-400 text-xl'>Name on invoice</span>
                <input required onChange={handle_invoicename_change} value={invoicename} type="text" autoComplete='off' placeholder='Your name or company name' className='w-full h-12 p-2 border-2 border-gray-500 rounded-xl text-xl font-bold'/>
                <span className='text-sm text-gray-400'>Shown to clients on invoices.</span>
            </div>
            {/* Address */}
            <div className='w-full flex flex-col h-fit gap-2'>
                <span className='text-gray-400 text-xl'>Address</span>
                <input required onChange={handle_address_change} value={address} type="text" autoComplete='off' placeholder='Your name or company name' className='w-full h-12 p-2 border-2 border-gray-500 rounded-xl text-xl font-bold'/>
            </div>
            {/* Gst and logo */}
            <div className='w-full flex h-fit gap-2'>
                <div className='h-fit w-1/2 flex flex-col'>
                    <span className='text-gray-400 text-xl'>Gst/Tax id</span>
                    <input onChange={handle_taxid_change} value={taxid} type="text" autoComplete='off' placeholder='Gst or tax id (optional)' className='w-full h-12 p-2 border-2 border-gray-500 rounded-xl text-xl font-bold'/>
                </div>
                <div className='h-fit flex flex-col w-1/2'>
                      <span className='text-gray-400 text-xl'>Upload signature</span>
                      <label htmlFor='signature-upload' className='w-full h-12 px-4 border-2 border-gray-500 rounded-xl flex items-center gap-3 cursor-pointer text-gray-200 hover:border-gray-300 hover:bg-white/5 transition'>
                        <img src='/downloads.png' alt='' className='h-5 w-5 shrink-0 opacity-80' />
                        <span className='font-semibold truncate'>
                          {selectedimage ? selectedimage.name : 'Choose file'}
                        </span>
                      </label>
                      <input id='signature-upload' onChange={handleimagechange} type="file" accept='image/*' className='hidden'/>
                      <span className='mt-2 text-xs text-gray-400'>PNG, JPG or WEBP. Max size 2MB.</span>
                      {uploadError ? <span className='mt-1 text-sm text-red-400'>{uploadError}</span> : null}
                      {previewUrl && (
                        <div className='mt-4'>
                        <h4 className='mb-2 text-gray-300'>Preview:</h4>
                        <img 
                          src={previewUrl} 
                          alt="Selected Preview" 
                          style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px' }} 
                        />
                      </div>
                      )}
                </div>

                
            </div>

            {/* Payment options */}
            <div className='w-full h-fit flex flex-col'>
              <div className='w-full h-fit flex justify-between'>
                      <span className='text-xl text-gray-400'>Payment options</span>
                      <div className='w-fit h-fit p-4'>
                        <div onClick={onclick_add_payment} className='border-2 border-gray-400 text-gray-400 font-bold rounded-xl bg-gray-700/50 p-2 cursor-pointer'>+ Add meathod</div>
                      </div>
              </div>
            </div>

            {/* Seperation border */}
            <div className='w-full h-fit border-b-2 border-gray-500'></div>
             {/* Saved payment options */} 

             <div className='text-xl font-semibold text-gray-500 self-start'>Saved meathods</div>
              
              {saved_payment_meathod.length > 0 ? saved_payment_meathod.map((item) => (
                <Saved_payment key={item.id} item={item} onDelete={handle_delete_payment_meathod} setdefault={handle_set_as_default}/>
              )) : <div className='w-full rounded-xl border border-dashed border-gray-500 p-4 text-sm text-gray-400'>No payment methods saved yet.</div>}

               {/* save button */}
                <div onClick={handle_onclick_save} className='w-full h-12 bg-gray-300 cursor-pointer text-black rounded-xl flex justify-center items-center font-bold text-xl'>Save</div>
            
            {payment_popup ? <Payment_popup close={close_popup} onSaved={get_payment_meathods} /> : null}
        </div>
    </div>
  )
}

export default Invoicing