import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router';
import Api from '../../../Service/api';

const Genetated_main_sec = (props) => {  

  const status_bg_color = {'Draft' : '#2A2A2A' , 'Sent' : '#3573b8' , 'Paid' : '#173F3B' , 'Overdue' : '#4A2318' , 'Cancelled' : '#2F2C2D'};

  const status_icon = {'Draft' : '/Invoice_icon/draft.png' , 'Sent' : '/Invoice_icon/paper-plane-solid-full.svg' , 'Paid' : '/Invoice_icon/accept.png' , 'Overdue' : '/Invoice_icon/overdue.png' , 'Cancelled' : '/Invoice_icon/ban-solid-full.svg'};

  const [invoice , Setinvoice] = useState();
  const [items , Setitems] = useState([]);
  const status = invoice?.status ?? 'Draft';

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=>{
      async function get_description_items() {
        if (!invoice?.id) {
          Setitems([]);
          return;
        }

        try {
          const get_items = await Api.get(`/invoice/get_items/${invoice.id}`);
          const items_data = get_items?.data?.items ?? [];
          Setitems(items_data.filter(Boolean));
        } catch (error) {
          console.log('Error getting invoice items', error);
          Setitems([]);
        }
      }

      get_description_items();
    }, [invoice?.id]);

    useEffect(()=>{
      if(location?.state?.invoice){
        Setinvoice(location.state.invoice);
      }
    },[location.state]);

    function download_cancel_btn(params) {
      return(
        <>
          <div onClick={download_pdf} className='w-fit h-fit p-3 bg-[#1F212F] rounded-xl flex gap-3 cursor-pointer '>
          <div className='w-5 h-5 self-center bg-[url("/downloads.png")] bg-contain bg-no-repeat'></div>
          <span className='font-semibold text-gray-500 text-xl'>PDF</span>
        </div>
        
        {/* cancel btn */}
        {invoice?.status != "Paid" ?  <div onClick={cancel_invoice} className='w-fit h-fit p-3 rounded-xl flex gap-3 cursor-pointer '>
          <div className='w-5 h-5 self-center bg-[url("/prohibition.png")] bg-contain bg-no-repeat'></div>
          <span className='font-semibold text-gray-500 text-xl'>Cancel</span>
        </div> : null}
        

        {/* Delete btn */}
        <div onClick={delete_invoice} className='w-fit h-fit p-3 rounded-xl flex gap-3 cursor-pointer mr-4 ml-4'>
          <div className='w-5 h-5 bg-[url("/delete.png")] bg-contain bg-no-repeat'></div>
        </div>
        </>     
      )
      
    }

    function button() {
      if (invoice?.status == "Draft"){
        return (
          <div className='w-full h-fit flex gap-2'>
            <div onClick={mark_as_sent} className='w-fit h-fit p-3 bg-amber-600 rounded-xl flex gap-1 cursor-pointer'>
              <div className='w-6 h-6 bg-[url("/Invoice_icon/accept.png")] bg-contain bg-no-repeat'></div>
              <span className='font-semibold'>Mark as Sent</span>
            </div>
            <div onClick={send_invoice} className='w-fit p-3 h-fit bg-amber-400 rounded-xl flex gap-1 cursor-pointer'>
              <span className='w-6 h-6 bg-[url("/Invoice_icon/paper-plane-solid-full.svg")] bg-contain bg-no-repeat'></span>
              <span className='font-semibold'>Send invoice</span>
            </div>
            {/* Download */}
            {download_cancel_btn()}
          </div>
        )
      }
      if(invoice?.status == "Sent"){
        return(
          <div className='w-full h-fit flex gap-2'>
            <div onClick={mark_as_paid} className='w-fit h-fit p-3 bg-blue-400 rounded-xl flex gap-1 cursor-pointer'>
              <div className='w-5 h-5 bg-[url("/check.png")] bg-contain bg-no-repeat'></div>
              <span className='font-semibold'>Mark as paid</span>
            </div>
            {/* Download and cancel */}
            {download_cancel_btn()}
          </div>
        )
      }

       if (invoice?.status == "Paid"){
        return(
          <div className='w-full h-fit flex gap-2'>
          {download_cancel_btn()}
        </div>
        )       
       }
       if (invoice?.status == "Cancelled"){
        return(
          <div onClick={delete_invoice} className='w-fit h-fit p-3 rounded-xl flex gap-3    cursor-pointer mr-4 ml-4'>
            <div className='w-5 h-5 bg-[url("/delete.png")] bg-contain bg-no-repeat'></div>
        </div>
        )
            
       }
    }

    function project_name() {
      if(invoice?.project_name == "-"){
        return ""
      }
      return invoice?.project_name
    }

    async function send_invoice() {
      try {
        if (!invoice?.id) return;

        const response = await Api.post("/invoice/send_invoice", {
          invoice_id: invoice.id,
        }, {
          timeout: 30000,
        });

        if (response?.data?.success) {
          Setinvoice((prev) => ({
            ...prev,
            status: 'Sent',
          }));
          navigate("/invoices");
        }
      } catch (error) {
        console.log('Error sending invoice' , error);
        alert('Invoice could not be sent. Please try again or check your email configuration.');
      }
    }

    async function download_pdf() {
      try {
        if (!invoice?.id) return;

        const response = await Api.get(`/invoice/download_pdf/${invoice.id}`, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.invoice_number || invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.log('Error downloading invoice PDF');
      }
    }


    async function mark_as_sent() {
      try {
        const mark_sent = await Api.post("/invoice/mark_sent",  {
          invoice_id : invoice.id,
        });

        Setinvoice((prev) => ({
          ...prev,
          status: 'Sent',
        }));
        navigate("/invoices");
      } catch (error) {
        console.log("Error updating and marking as sent")
      }
    }

    async function mark_as_paid() {
      try {
        const mark_paid = await Api.post('/invoice/mark_paid' , {
          invoice_id : invoice.id
        });
        Setinvoice((prev) => ({
          ...prev,
          status: 'Paid',
        })); 
        navigate("/invoices");
      } catch (error) {
        console.log("Error updating the status to paid" , error)
        return
      }
    }

    async function cancel_invoice() {
      try {
        const cancel_invoice = await Api.post("/invoice/cancel" , {
          invoice_id : invoice.id
        });
        Setinvoice((prev) => ({
          ...prev,
          status: 'Cancelled',
        })); 
        navigate("/invoices");
      } catch (error) {
        console.log("Failed to cancel the invoice")
        return
      };
    }

    async function delete_invoice() {
      try {
        await Api.post('/invoice/delete_invoice' , {
          invoice_id : invoice.id
        });
        navigate("/invoices");
      } catch (error) {
        console.log("Error deleting the invoice")
        return
      };
    }



  return (
    <div className='w-full h-full flex flex-col p-6 gap-6'>
        {/* Back to invoice section */}
        <div onClick={()=> navigate("/invoices")} className='w-fit flex h-fit gap-3 cursor-pointer'>
            <span className='text-gray-400 text-xl'>{"<"}</span>
            <span className='text-gray-400 text-xl'>Back to invoices</span>
        </div>
        {/* Upper section */}
        <div className='w-full flex h-fit items-start justify-between gap-6'>
          <div className='w-full flex h-fit items-center gap-6 justify-between'>
            <div className='w-fit h-fit flex items-center  gap-6'>
                <span className='whitespace-nowrap text-4xl text-gray-50 font-extrabold'>{invoice?.invoice_number}</span>
                {/* Status */}
                  <div className='w-fit h-full min-h-18 gap-2 flex flex-col justify-center items-center'>
                      <div className={`w-fit h-fit p-2 pl-2 justify-center items-center flex gap-1 pr-2 rounded-xl`} style={{ backgroundColor: status_bg_color[status] || '#2A2B2D' }}>
                        {status_icon[status] ? (
                          <img src={status_icon[status]} alt={`${status} status`} className='h-4 w-4 object-contain' />
                        ) : null}
                          <span className='text-md text-gray-400'>{status}</span>
                      </div>
                  </div>
            </div>
              
            {/* Buttons */}
            <div className='w-fit flex h-fit items-center gap-6'>
              {button()}
            </div>
          </div>
          
        </div>
        {/* Invoice section */}
        <div className='w-full h-fit min-h-3/5 p-6 flex flex-col gap-2 bg-gray-100/90 rounded-2xl'>
        <div className='w-full h-fit flex justify-between'>
          <div className='w-fit flex flex-col gap-2'>
            <span className='text-4xl tracking-tighter font-semibold text-gray-700'>Invoice</span>
            <span className='whitespace-nowrap text-md font-extrabold tracking-tighter text-gray-700'>{invoice?.invoice_number ?? 'No invoice number'}</span>
          </div>
          <div className='w-fit flex flex-col gap-3'>
            <div className='w-fit flex gap-2'>
              <span className='text-xl font-bold text-gray-700'>Issued:</span>
              <span className='text-xl font-bold text-gray-700'>{invoice?.issue_date}</span>
            </div>
            <div className='w-fit flex gap-2'>
              <span className='text-xl font-bold text-gray-700'>Due:</span>
              <span className='text-xl font-bold text-gray-700'>{invoice?.due_date}</span>
            </div>
          </div>
        </div>
          {/* Upper Border */}
          <div className='w-full border-b-2 border-gray-500 mt-2'></div>

          {/* Invoice content */}
          <div className='w-full flex h-fit flex-col mt-4 gap-8 '>
            <div className='w-full h-fit flex flex-col'>
              <span className='text-lg text-gray-600'>Billed to</span>
              <span className='text-2xl text-gray-800 font-semibold'>{invoice?.client_name}</span>
              <span className='text-md text-gray-600'>{project_name()}</span>
            </div>
            {/* Description */}
            <div className="w-full grid grid-cols-8 h-fit">
            <span className="col-span-5 text-xl text-gray-600 ml-6">
              Description
            </span>

            {/* Qty | Rate | Amount */}
            <div className="col-span-3 grid grid-cols-3">
              <span className="text-xl text-gray-600 text-center">Qty</span>
              <span className="text-xl text-gray-600 text-center">Rate</span>
              <span className="text-xl text-gray-600 text-center">Amount</span>
            </div>
          </div>  
            
          </div>
            {/* Description border */}
            <div className='w-full border-b-2 border-gray-400'>
            </div>
            {/* items */}

            {items.map((item)=>{
              return (
              <div key={item.id} className='w-full grid grid-cols-8 h-fit'>
                <span className='col-span-5 text-xl text-gray-600 ml-6'>{item.description}</span>
                <div className='col-span-3 grid grid-cols-3'>
                  <span className='text-xl text-gray-600 text-center'>{item.quantity}</span>
                  <span className='text-xl text-gray-600 text-center'>{item.rate}</span>
                  <span className='text-xl text-gray-600 text-center'>{item.amount}</span>
                </div>
              </div>
              )
            })}
            {/* Total */}
            <div className='w-full grid grid-cols-8 mt-6'>
              {/* Total border */}
              <div className='col-start-6 col-end-9 border-b-2 border-gray-700'></div>
              {/* total amount */}
              <span className='text-2xl text-gray-800 font-medium col-start-6 text-center'>Total</span>
              <span className='text-2xl text-gray-800 font-medium col-start-8 text-center'>{invoice?.total_amount || 'NaN'}</span>
              
            </div>

            {/* Lower Border */}
          <div className='w-full border-b-2 border-gray-500 mt-2'></div>

          {/* Notes */}

          <div className='w-full h-fit'>
            <span className='text-lg text-gray-600'>{invoice?.notes || ""}</span>
          </div>

        </div>
    </div>
  )
}

export default Genetated_main_sec