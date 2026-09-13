import React, { useState } from 'react'
import { useEffect } from 'react';
import Inputbox from './Inputbox/Inputbox';
import { useRef } from 'react';
import Api from '../../../Service/api';


const Pop_up = (props) => {

  const [isOpen , SetisOpen] = useState(false);
  const options = ["Lead" , "Active" , "Past"];
  const [data , Setdata] = useState(props.initialData ||{
    name : "",
    Outstanding: "",
    email : "",
    status : "",
    tags : ""
  });
  const dropdownref = useRef(null)
  const [showInvoiceManager, SetShowInvoiceManager] = useState(false);
  const [invoices, SetInvoices] = useState([]);
  const [selectedInvoices, SetSelectedInvoices] = useState([]);
  const [clientsList, SetClientsList] = useState([]);
  const [reassignTarget, SetReassignTarget] = useState(null);

  async function Save_client() {
    try {
      const send_data = await Api.post('/client/save_client_data' , {
        name : data.name,
        email : data.email,
        status : data.status,
        tags : data.tags
      });
      if(send_data.data.success){
        await props.fetch_client();
        props.close()
      }
      else{
        console.log(send_data.data.message)
        return null;        
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  useEffect(()=>{
    function handleOutsideClick(e) {
      if(dropdownref.current && !dropdownref.current.contains(e.target)){
        SetisOpen(false)
      }
    }
    document.addEventListener('mousedown' , handleOutsideClick);
    return ()=> document.removeEventListener('mousedown' , handleOutsideClick);
  },[])

  function handleinput(e){
    Setdata({...data , [e.target.name] : e.target.value})
    console.log(data)
  }

  function dropdown(){
    return(
      <div className='h-30 w-full text-2xl flex flex-col pl-4 rounded-xl bg-gray-700 absolute top-12 left-0 text-amber-50 font-bold'>
        {options.map((selected_status , index)=>(
          <div onClick={Select_status} key={index} className='h-10 w-full'>{selected_status}</div>
        ))}
      </div>
    )
  }
   
  

  function handle_dropdownClick() {
    SetisOpen(!isOpen);
  }

  function Select_status(e) {
    Setdata({ ...data, status: e.target.innerText });
  }

  async function handle_delete_click() {
    try {
      if (typeof props.delete_client !== 'function') {
        return;
      }
     
      const deleted = await props.delete_client(props.initialData.id);

      if (deleted && deleted.success) {
        props.close();
        return;
      }

      // Show detailed error returned from server or network
      const message = deleted?.message || 'Failed to delete client';
      console.warn('Delete client failed:', message, deleted);

      // If server indicates invoices exist, show invoice manager UI
      if (message && message.toLowerCase().includes('invoices')) {
        await loadClientInvoices();
        await loadClientsList();
        SetShowInvoiceManager(true);
        return;
      }

      // If Axios error object provided, try to extract server response
      if (deleted && deleted.error && deleted.error.response) {
        const resp = deleted.error.response;
        alert(`Request failed: ${resp.status} - ${resp.data?.message || JSON.stringify(resp.data)}`);
        return;
      }

      alert(message);
      return;
    } catch (err) {
      console.error('Error in handle_delete_click', err);
      return
    }
  }

  async function loadClientInvoices() {
    try {
      const res = await Api.get(`/client/get_invoices/${props.initialData.id}`);
      SetInvoices(res.data.invoices || []);
      SetSelectedInvoices([]);
    } catch (err) {
      console.error('Error loading client invoices', err);
      alert('Failed to load invoices');
    }
  }

  async function loadClientsList() {
    try {
      const res = await Api.get('/client/get_client');
      SetClientsList(res.data.data || []);
    } catch (err) {
      console.error('Error loading clients list', err);
    }
  }

  function toggleInvoiceSelection(id) {
    SetSelectedInvoices((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  async function handleReassign() {
    if (!reassignTarget) { alert('Select a client to reassign to'); return; }
    if (selectedInvoices.length === 0) { alert('Select at least one invoice'); return; }
    try {
      const res = await Api.post('/client/reassign_invoices', { invoice_ids: selectedInvoices, to_client_id: reassignTarget });
      if (res.data.success) {
        alert('Invoices reassigned');
        await loadClientInvoices();
      } else {
        alert(res.data.message || 'Failed to reassign');
      }
    } catch (err) {
      console.error('Error reassigning invoices', err);
      alert('Error reassigning invoices');
    }
  }

  async function handleBulkDelete() {
    if (selectedInvoices.length === 0) { alert('Select at least one invoice'); return; }
    if (!confirm('Delete selected invoices? This cannot be undone.')) return;
    try {
      const res = await Api.post('/client/bulk_delete_invoices', { invoice_ids: selectedInvoices });
      if (res.data.success) {
        alert('Invoices deleted');
        await loadClientInvoices();
      } else {
        alert(res.data.message || 'Failed to delete invoices');
      }
    } catch (err) {
      console.error('Error deleting invoices', err);
      alert('Error deleting invoices');
    }
  }
 

  async function handle_save_edit() {
    if (!data.name || !data.email) {
    alert("Name and email are required");
    return;
    }
    if (props.initialData){
      try {
      const update_call = await Api.post("/client/update_client" , {
        client_id : props.initialData.id,
        name : data.name,
        email : data.email,
        status : data.status,
        tags : data.tags
      });

      if (update_call.data.success){
        if (props.fetch_client) {
          await props.fetch_client();
        }
        props.close()
        return true
      }
    } catch (error) {
      console.log("error in updating the client", error);
      return false;
    }

      
    }
    else{
      await Save_client()
    }
  }

  useEffect(()=>{
    document.body.style.overflow = "hidden";

    return()=>{
      document.body.style.overflow ="auto";
    }
  },[])
  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center'>
      <div className='absolute inset-0 bg-black/40'></div>
        <div className='h-fit min-h-6/7 justify-around min-w-[fit] p-4 flex flex-col w-1/3 left-2/5 rounded-2xl absolute top-1/15 bg-[#2C2C2A]/95'>
          <div onClick={props.close} className='cursor-pointer self-end w-10 h-10 bg-[url("/close_otp_box.png")] bg-contain bg-no-repeat'></div>
          <div className='text-amber-50 font-semibold text-2xl '>Add Client</div>
          {showInvoiceManager ? (
            <div className='w-full'>
              <span className='text-lg text-amber-50 font-semibold'>Invoices for {props.initialData?.name}</span>
              <div className='max-h-60 overflow-auto mt-3 p-2 bg-[#1a1a1a] rounded'>
                {invoices.length === 0 ? (
                  <div className='text-gray-300'>No invoices for this client</div>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv.id} className='flex items-center justify-between p-2 border-b border-gray-600'>
                      <div className='flex items-center gap-3'>
                        <input type='checkbox' checked={selectedInvoices.includes(inv.id)} onChange={() => toggleInvoiceSelection(inv.id)} />
                        <div>
                          <div className='text-sm font-semibold text-gray-100'>{inv.invoice_number}</div>
                          <div className='text-xs text-gray-400'>{inv.issue_date} • {inv.status} • ₹{inv.total_amount}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className='w-full flex gap-3 mt-4'>
                <select className='p-2 rounded bg-gray-700 text-white' onChange={(e) => SetReassignTarget(e.target.value)} value={reassignTarget || ''}>
                  <option value=''>Select client to reassign</option>
                  {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.client_name || 'Unknown'}</option>
                    ))}
                </select>
                <button onClick={handleReassign} className='px-4 py-2 bg-blue-600 rounded'>Reassign</button>
                <button onClick={handleBulkDelete} className='px-4 py-2 bg-red-600 rounded'>Delete selected</button>
                <button onClick={() => SetShowInvoiceManager(false)} className='px-4 py-2 bg-gray-600 rounded'>Close</button>
              </div>
            </div>
          ) : (
            <>
              <Inputbox  inputChange={handleinput} value={data.name} name="name" placeholder="Full name"/>
              
              <Inputbox  inputChange={handleinput} value={data.email} name="email" placeholder="Email" />
              <div onClick={handle_dropdownClick} className='w-full h-fit flex flex-col gap-2  mt-6'>
                <span className='text-gray-500 text-xl'>
                  Status
                </span>
                <div ref={dropdownref} className='w-full relative flex items-center text-gray-100 text-xl font-bold rounded-lg h-12 p-4 border-2 justify-between cursor-pointer border-gray-500'>
                  <span>{data.status || "Select suitable status"}</span>
                  <span>⏷</span>
                  {isOpen ? dropdown() : null}
                </div>
              </div>
              <Inputbox inputChange={handleinput} value={data.tags}  name="tags" title="Tags (comma-separated) (optional)" placeholder="high value, design" />
            </>
          )}
          <div className='h-14 w-full flex gap-6 mt-6 justify-end'>
            <div onClick={props.initialData ? handle_delete_click : props.close} className='h-12 w-28 cursor-pointer hover:bg-gray-700 flex justify-center items-center border-2 border-gray-600 rounded-xl text-amber-50 font-bold'>{props.CancelorDelete}
          </div>
          <div className='h-12 w-28 cursor-pointer flex justify-center bg-blue-600 items-center border-2 border-gray-600 hover:bg-blue-900 rounded-xl text-amber-50 font-bold' onClick={handle_save_edit}>{props.SaveorEdit}</div>
          </div>
          
          
        </div>
      
        
    </div>
  )
}

export default Pop_up