import React, { useEffect, useState } from 'react'
import Api from '../../../Service/api';

const Project_popup = (props) => {

  const [is_open, Setopen] = useState(false);
  const [prior_open , Setprior_open] = useState(false);
  const [selectedClient, setSelectedClient] = useState('Select client');
  const [status_open , Setstatus_open] = useState(false);
  const [project_name , Setname] = useState("");
  const [selectclientdata , Setselectclientdata] = useState(null);
  const [budget , Setbudget] = useState("");
  const [priority , Setpriority] = useState([]);
  const [selectprior, Setprior] = useState("");
  const [status_option, Setstatusoption] = useState([]);
  const [selectstatus , Setstatus] = useState("");
  const [startdate , Setstartdate] = useState("");
  const [enddate , Setenddate] = useState(""); 
  const [is_saving , Setis_saving] = useState(false);
  
  

   useEffect(()=>{
     Setpriority((props.priority || []).filter((items)=> items !== "All"));
     Setstatusoption((props.status || []).filter((item)=> item !== "All"));
   }, [props.priority, props.status])

  function handle_name(e) {
    Setname(e.target.value)
    console.log(project_name)
  }

  function handle_startdate(e) {
    Setstartdate(e.target.value);
  }

  function handle_enddate(e) {
    Setenddate(e.target.value);
  }

  function handle_budget(e){
    Setbudget(e.target.value)
  }

  function handle_dropdown() {
    Setopen((prev) => !prev);
  }

  function Status_dropdown() {
    Setstatus_open((prev)=>!prev);
  }

  function Select_status(status) {
    Setstatus(status);
  }

  function Priority_dropdown() {
    Setprior_open((prev) => !prev);
  }

  function handle_select_priority(priority) {
    Setprior(priority);
  }

  function handle_select_client(client) {
    setSelectedClient(client);
  }
  function Set_client(nameid) {
    Setselectclientdata(nameid);
  }


  async function send_data() {
    if (is_saving) {
      return;
    }

    if(!project_name || !budget || !selectclientdata?.id || !startdate || !enddate || !selectprior || !selectstatus){
      alert("Please fill all inputs")
        return;
    };

    try {
      Setis_saving(true);
      const post_data = await Api.post('/project/save_project', {
      project_name : project_name,
      client_name : selectclientdata.client_name,
      client_id : selectclientdata.id,
      budget : budget,
      priority : selectprior,
      start_date : startdate,
      end_date : enddate,
      status : selectstatus
    });

    if (!post_data.data.success) {
      console.log("Error posting project data (project popup)(backend)");
      return
    }

    await props.on_saved?.();
    props.close?.();
    } catch (error) {
      console.log("Error posting project data (project popup)")
      return
    } finally {
      Setis_saving(false);
    }

    

  }

  function client_list() {
    return (props.nameid || []).map((item, index) => (
      <div key={index} className='h-fit w-full rounded-2xl'>
        <div
          onClick={()=>{
            handle_select_client(item.client_name);
            Set_client(item)
          }}
          className='w-full h-fit hover:bg-[#21222b] bg-[#35394C]/90 p-2 text-xl text-gray-300 cursor-pointer'
        >
          {item.client_name}
        </div>
      </div>
    ));
  }

  function Priority_list() {
    return (priority || []).map((priority , index)=>{
      return (<div key={index} className='h-fit w-full rounded-2xl'>
        <div
          onClick={() => handle_select_priority(priority)}
          className='w-full h-fit hover:bg-[#21222b] bg-[#35394C]/90 p-2 text-xl text-gray-300 cursor-pointer'
        >
          {priority}
        </div>
      </div>) 
    })
  }

  function Status_list() {
    return (status_option || []).map((status , index)=>{
      return (<div key={index} className='h-fit w-full rounded-2xl'>   
        <div
          onClick={() => Select_status(status)}
          className='w-full h-fit hover:bg-[#21222b] bg-[#35394C]/90 p-1 text-xl text-gray-300 cursor-pointer'
        >
          {status}
        </div>
      </div>)
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center'>
        <div onClick={props.close} className='absolute inset-0 bg-black/40'></div>
        <div className='h-[85vh] justify-around min-w-[fit] p-4 flex flex-col w-1/3 left-2/5 rounded-2xl absolute top-1/15 bg-[#2C2C2A]/95'>        
          <div className='w-full  h-fit flex justify-between'>
            <div className='text-amber-50 font-semibold text-2xl '>Add Project</div>
            <div onClick={props.close} className='cursor-pointer self-end w-10 h-10 bg-[url("/close_otp_box.png")] bg-contain bg-no-repeat'></div>
        </div>
        <div className='w-full h-fit flex gap-2 flex-col'>
                <div className='text-lg text-gray-400'>Project name</div>
                <input autocomplete="off" onChange={handle_name} name='project_name' value={project_name} type="text" placeholder='Project abc ...' className='w-full h-fit text-amber-50 font-extrabold text-xl font-mono p-2 border-blue-800 border-3 rounded-xl'/>
        </div>
        <div className='w-full h-fit flex gap-2 flex-col'>
                <div className='text-lg text-gray-400'>Select client</div>
                 <div onClick={handle_dropdown} className={`h-12 select-none relative cursor-pointer w-full text-xl text-gray-300 rounded-xl flex justify-between p-4 items-center bg-[#35394C]`}>
                <span>{selectedClient}</span>
                <span>⌄</span>   
                {is_open && (
                  <div className='absolute top-full left-0 z-10 w-full'>
                    {client_list()} 
                  </div>
                )}   
      
            </div>
                </div>
                {/* Budget */}
                <div className='w-full h-fit flex justify-between'>
                  <div className='w-2/5 h-fit flex flex-col gap-2'>
                      <div className='text-lg text-gray-400'>Budget</div>
                      <input onChange={handle_budget} name='budget' value={budget} type="number" placeholder='Budget' min="1" className='w-full rounded-xl h-10 border-2 border-amber-50 p-2 text-amber-50'/>
                  </div>
                  {/* priority */}
                  <div className='w-2/5 h-fit flex flex-col gap-2'>
                    <div className='text-lg text-gray-400'>Priority</div>
                    <div onClick={Priority_dropdown} className='h-12 select-none relative cursor-pointer w-full text-xl text-gray-300 rounded-xl flex justify-between p-4 items-center bg-[#35394C]'>
                      <span>{selectprior || "Select priority"}</span>
                      <span>⌄</span>
                      {prior_open  && (
                        <div className='absolute top-full left-0 z-10 w-full'>
                          {Priority_list()}
                        </div>
                      )}
                    </div>
                  </div>      
                </div>
                <div className='w-full h-fit flex justify-between'>
                      {/* Start date */}
                      <div className='w-2/5 h-fit flex flex-col gap-2'>
                        <div className='text-lg text-gray-400'>Start Date</div>
                        <input autocomplete="off" onChange={handle_startdate} value={startdate} type="date" className='w-full rounded-xl bg-amber-50 p-2 h-10 border-amber-50 border-2 text-gray-800'/>
                      </div>
                      {/* Deadline*/}
                        <div className='w-2/5 h-fit flex flex-col gap-2'>
                          <div className='text-lg text-gray-400'>Dead line</div>
                            <input onChange={handle_enddate} value={enddate} type="date" className='w-full rounded-xl bg-amber-50 p-2 h-10 border-amber-50 border-2 text-gray-800'/>
                        </div>
                </div>
                      {/* Status */}
                      <div className='w-full h-fit flex flex-col'>
                        <div className='text-lg text-gray-400'>Select Status</div>
                        <div onClick={Status_dropdown} className={`h-12 select-none relative cursor-pointer w-full text-xl text-gray-300 rounded-xl flex justify-between p-4 items-center bg-[#35394C]`}>
                        <span>{selectstatus || 'Select status'}</span>
                        <span>⌄</span>   
                        {status_open && (
                          <div className='absolute top-full left-0 z-10 w-full'>
                            {Status_list()} 
                          </div>
                        )}   
              
                    </div>
                      </div>

                        {/* Save cancel */}
                        <div className='w-full h-fit flex gap-8 justify-end'>
                          <div onClick={props.close} className='h-fit w-fit p-2 cursor-pointer'>
                            <span className='text-xl text-gray-300'>Cancel</span>
                          </div>
                          <div onClick={send_data} className={`h-fit w-fit rounded-xl p-2 border-2 border-amber-50 ${is_saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'}`}>
                            <span className='text-xl text-gray-300'>{is_saving ? 'Saving...' : 'Create Project'}</span>
                          </div>
                        </div>
        </div>
    </div>
  )
}

export default Project_popup