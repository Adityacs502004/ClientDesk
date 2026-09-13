import React, { useEffect, useState } from 'react'
import Top_bar from './Top_bar'
import Cards from './Cards/Cards'
import Api from '../../../Service/api'

const Main_sec = () => {

    const [active_client , Setactiveclient] = useState(0);
    const [active_project , Setactiveproject] = useState(0);
    const [outstanding , Setoutstanding] = useState(0);
    const [this_month , Setthismonth] = useState(0);

    const [invoice_overdue , Setoverdue] = useState(0);
    const [project_deadline , Setdeadline] = useState(0);
    const [invoice_draft , Setdraft] = useState(0);
    const [lead_client , Setleadclient] = useState(0);

    const [activity_logs , Setactivitylogs] = useState([]);


    async function get_clients() {
      try {
        const get_clients = await Api.get("/client/get_client");
        const response = get_clients?.data?.data ?? [];
        const active = response.filter((item)=> item?.status == "Active").length;
        Setactiveclient(active);
      } catch (error) {
        console.log("Error getting active clients" , error);
        return
      }
    }

    async function get_project() {
      try {
        const get_project = await Api.get('/project/get_project');
        const response = get_project?.data?.project_data ?? [];
        const active_projects = response.filter((item)=> item?.status == "In Progress").length;
        Setactiveproject(active_projects)
      } catch (error) {
        console.log("Error getting project data", error);
        return
      }
    }

    async function get_outstanding() {
      try {
        const outstanding_amount = await Api.get("/invoice/get_outstanding");
        const response = outstanding_amount?.data?.total_outstanding;
        Setoutstanding(response);
      } catch (error) {
        console.log("Error getting outstanding amount")
        return
      }
    }

    async function get_this_month_payment() {
      try {
        const monthly_payment = await Api.get("/invoice/this_month_payment");
        const amount = monthly_payment?.data?.amount;
        Setthismonth(amount)
      } catch (error) {
        console.log("Error getting this month revenue");
        return
      }
    }

    async function get_needs_attention() {
      try {
        const get_needs_attention = await Api.get("/dashboard/get_needs_attention");
        const response = get_needs_attention?.data;
        const invoice_overdue = response?.invoice_overdue.length;
        const project_deadline = response?.project_deadline.length;
        const draft_query = response?.draft_query.length;
        const lead_client = response?.lead_client.length;
        
        Setoverdue(invoice_overdue);
        Setdeadline(project_deadline);
        Setdraft(draft_query);
        Setleadclient(lead_client);
      } catch (error) {
        console.log("Error fetching data for attention");
        return
      }
    }

    async function get_activity() {
      try {
        const get_activity = await Api.get("/dashboard/get_recent_activity");
        const response = get_activity?.data?.activity ?? [];
        Setactivitylogs(response);
        console.log('Recent activity response:', response);
      } catch (error) {
        console.log("Error getting data from activity logs");
        return
      }
    }

    useEffect(()=>{
      get_needs_attention();
      get_activity();
    },[]);


    useEffect(() => {
      get_clients();
      get_project();
      get_outstanding();
      get_this_month_payment();
    }, []);

  return (
    <div className='min-w-4/5 h-full p-4 flex flex-col gap-y-10 bg-[#0E1016]'>
       <span className=' text-2xl text-gray-400'>Dashboard</span>
       <div className='w-full flex h-fit justify-around mb-8'>
        <Cards title={"Active clients"} data={active_client} color={"text-[#E49B0F]"}/>
        <Cards title={"Active Projects"} data={active_project}/>
        <Cards title={"Outstanding"} color={"text-red-300"} data={`₹ ${outstanding}`}/>
        <Cards title={"This month"} color={"text-green-600"} data={`₹ ${this_month}`}/>
       </div>
       <div className='w-full h-full flex justify-around mt-4'>
          <div className='h-full min-w-2/5 bg-[#53566e] rounded-2xl p-4 overflow-auto'>
            <span className='text-xl font-semibold text-gray-900'>Recent activity</span>
            <div className='mt-4 flex flex-col gap-3'>
              {activity_logs.length === 0 ? (
                <span className='text-gray-300'>No recent activity</span>
              ) : (
                activity_logs.map((act) => (
                  <div key={act.id} className='p-3 rounded-lg bg-[#3b3d4a]'>
                    <div className='text-sm font-semibold text-gray-100'>{act.title}</div>
                    <div className='text-xs text-gray-300'>{act.description}</div>
                    <div className='text-xs text-gray-400 mt-1'>{act.created_at}</div>
                  </div>
                ))
              )}
            </div>
        </div>
        <div className='min-h-3/4 min-w-2/7 bg-[#53566e] flex flex-col rounded-2xl p-4'>
        <div className='w-full'>
            <span className='text-xl font-bold text-red-400 underline underline-offset-6 decoration-red-400'>Needs attention</span>
        </div>
          <div className='w-full h-fit flex-1 flex flex-col justify-around'>
            
            {invoice_overdue != 0 ? <div className='w-full h-fit flex flex-col border-2 rounded-xl cursor-pointer border-gray-500 p-2'>
              <span className='text-xl text-amber-50 font-semibold'>{invoice_overdue} Overdue invoices</span>
              <span className='text-gray-300'>View invoices →</span>
            </div> : null}

            {project_deadline != 0 ? <div className='w-full h-fit flex flex-col border-2 rounded-xl cursor-pointer border-gray-500 p-2'>
              <span className='text-xl text-amber-50 font-semibold'>{project_deadline} Project past deadline</span>
              <span className='text-gray-300'>View project →</span>
            </div> : null}

            {invoice_draft != 0 ? <div className='w-full h-fit flex flex-col border-2 rounded-xl cursor-pointer border-gray-500 p-2'>
              <span className='text-xl text-amber-50 font-semibold'>{invoice_draft} Draft invoice</span>
              <span className='text-gray-300'>Complete it →</span>
            </div> : null}

            {lead_client != 0 ? <div className='w-full h-fit flex flex-col border-2 rounded-xl cursor-pointer border-gray-500 p-2'>
              <span className='text-xl text-amber-50 font-semibold'>{lead_client} Lead clients waiting for follow-up</span>
              <span className='text-gray-300'>View clients →</span>
            </div> : null}

            

            
          </div>
        </div>
       </div>

       
       
    </div>
  )
}

export default Main_sec