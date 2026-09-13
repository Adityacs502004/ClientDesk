import React, { useEffect, useMemo, useState } from 'react'
import Client_count from './Clients_active_count/Client_count'
import Clients_details from './Client_details/Clients_details'
import Pop_up from './Pop_up/Pop_up'
import Api from '../../Service/api'


const Client_Main_sec = () => {

  const [pop_up , show_popup] = useState(false);
  const [clients , Setclients] = useState([]);
  const [statusfilter , Setstatusfilter] = useState("All");
  const [search , Setsearch] = useState("");

  function handle_search(e) {
    Setsearch(e.target.value);
  }

  async function fetch_data() {
    try {
      const client = await Api.get("/client/get_client");
      const client_data = (client.data.data ?? []).map((item) => ({
        ...item,
        Outstanding: Number(item?.Outstanding || 0),
      }));
      Setclients(client_data)
    } catch {
      console.log('Failed to fetch clients')
    }
    
  }

  useEffect(()=>{
    fetch_data();
  },[]);


  async function delete_client(id){
    const client_id = id;
    try {
      const delete_client = await Api.post("/client/delete_client", {
        client_id : client_id
      })
      const delete_result = delete_client.data
      if(delete_result.success){
        await fetch_data();
        return { success: true };
      }
      else{
        console.log("Error deleting the client", delete_result.message)
        return { success: false, message: delete_result.message };
      }
    } catch (err) {
      // If server responded with an error payload, forward it
      const serverMessage = err?.response?.data?.message;
      const status = err?.response?.status;
      const message = serverMessage || err?.message || 'Network or server error';
      console.error('delete_client error', status, message, err);
      return { success: false, message, error: err };
    }
  }

  const count = useMemo(() => {
    const active_data = clients.filter((c) => c.status === "Active").length;
    const lead_data = clients.filter((c) => c.status === "Lead").length;
    const past_data = clients.filter((c) => c.status === "Past").length;

    return {
      active_count: active_data,
      lead_count: lead_data,
      past_count: past_data
    };
  }, [clients]);

  function filter_status(name) {
    Setstatusfilter(name);
  }

  const visible_client = useMemo(() => {
    const filtered_clients = statusfilter === "All"
      ? clients
      : clients.filter((c) => c.status === statusfilter);

    return filtered_clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [clients, search, statusfilter]);

  function button_click() {
    show_popup(true);
  }

  function handle_close() {
    show_popup(false);
  }
  return (
    <div className='min-w-4/5 h-full  p-4 flex flex-col  gap-y-10 bg-[#0E1016]'>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <span className='text-2xl text-gray-400'>Clients</span>
          <span className='text-lg text-gray-400'>Your client relationships, from lead to paid</span>
        </div>
          <div onClick={button_click} className='h-13 w-40 bg-[#2A78D6] hover:bg-[#6696d0] hover:scale-95 rounded-xl cursor-pointer flex justify-around items-center'>
            <div className='text-4xl text-amber-50'>+</div>
            <div className='text-xl text-amber-50'>Add Clients</div>
          </div>
      </div>
      <div className='w-full h-12 flex justify-between'>
          <input onChange={handle_search} value={search} className='h-full w-5/9 text-amber-50 p-2 bg-[#2C2C2A] rounded-xl' type='text' placeholder='🔍︎   Search by name...'></input>
          <div className='w-4/9 flex justify-around'>
              <Client_count filter_status={filter_status} name="All" data={clients.length}/>
              <Client_count filter_status={filter_status} name="Lead" data={count.lead_count}/>
              <Client_count filter_status={filter_status} name="Active" data={count.active_count}/>
              <Client_count filter_status={filter_status} name="Past" data={count.past_count}/>
          </div>    
      </div>

        <div className='h-fit w-9/10 border-2 border-amber-50 self-center rounded-2xl p-2'>
        <div className='heading w-19/20 min-h-12 items-center bg-[#1A1A19]  text-amber-50 text-xl font-bold grid grid-cols-5 p-4 rounded-2xl'>
          <span>Client</span>
          <span>Status</span>
          <span>Tags</span>
          <span>Outstanding</span>
          <span>Last activity</span>
        </div>
        {visible_client.map((client_data) => (
          <Clients_details key={client_data.id} id = {client_data.id} Client={client_data.name} currency={"₹"} Outstanding={client_data.Outstanding} email={client_data.email} status={client_data.status} tags={client_data.tags} fetch_client={fetch_data} delete_client={delete_client}/>
        ))}
        
        

        </div>
        {pop_up ? <Pop_up fetch_client={fetch_data} SaveorEdit={"Save"} CancelorDelete={"Cancel"} close={handle_close} /> : null}
    </div>
  )
}

export default Client_Main_sec