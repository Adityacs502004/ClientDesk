import React, { useEffect, useState } from 'react'
import Card from './Card/Card'
import Filter from './Filter/Filter'
import Api from '../../Service/api'
import Project_details from './Project_details/Project_details'
import Task_popup from './Task_popup/Task_popup'
import Project_popup from './Project_popup/Project_popup'

const Project_main_sec = () => {
  const [client_option, setClientOption] = useState([]);
  const work_option = ['All' , 'Planning' , 'In Progress' , 'Waiting' , 'Completed' , 'Cancelled'];
  const priority_option = ['All' , 'Low' , 'Medium' , 'High' , 'Urgent'];
  const date = ['Newest' , 'Oldest' , 'Dead line'];
  const [Task_pop_up , Settask_pop_up] = useState(false);
  const [project_popup , Setpopup] = useState(false);
  const [clientnameid , Setnameid] = useState([]);
  const [selected_project_id, Setselected_project_id] = useState(null);
  const [project , Setproject] = useState([]);
  const [Active_count , SetActive] = useState(0);
  const [Status_count , Setstatus] = useState(0);
  const [overdue_count , Setoverdue] = useState(0);
  const [search_text, Setsearch_text] = useState('');
  const [selected_status, Setselected_status] = useState('All');
  const [selected_priority, Setselected_priority] = useState('All');
  const [selected_client, Setselected_client] = useState('All');
  const [selected_date, Setselected_date] = useState('Newest');

  const client_filter_options = ['All', ...client_option];

  async function get_project() {
    try {
      const response = await Api.get('/project/get_project');
      const project_data = (response?.data?.project_data ?? []).filter(Boolean);
      // active count
      const active_count = project_data.map((item)=>item.status).filter((prior)=> prior == "In Progress").length;
      // status count
      const status_count = project_data.map((item)=> item.status).filter((prior)=>prior == "Completed").length;
      // overdue count
      const today = new Date();
      const overdue_count = project_data.map((item)=> new Date(item.end_date)).filter((overdue)=>{
        return overdue <= today
      }).length
          Setoverdue(overdue_count);
          SetActive(active_count);
          Setstatus(status_count)
      Setproject([...project_data]);
    } catch (error) {
      console.log("Error getting project (project_popup)")
      return;
    }
  }

  

  function OnClick_task(project_id) {
    Setselected_project_id(project_id);
    Settask_pop_up(true);
  }

  function OnClick_project(params) {
    Setpopup(true);
  }

  function handle_search(e) {
    Setsearch_text(e.target.value);
  }

  function normalize_value(value) {
    return String(value ?? '').toLowerCase();
  }

  function get_project_sort_value(item) {
    const value = Number(item?.id);
    return Number.isNaN(value) ? 0 : value;
  }

  function get_deadline_value(item) {
    const value = new Date(item?.end_date).getTime();
    return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
  }

  const filtered_projects = [...project]
    .filter((item) => {
      const search = search_text.trim().toLowerCase();

      const matches_search =
        !search ||
        normalize_value(item.project_name).includes(search) ||
        normalize_value(item.client_name).includes(search);

      const matches_status = selected_status === 'All' || item.status === selected_status;
      const matches_priority = selected_priority === 'All' || item.priority === selected_priority;
      const matches_client = selected_client === 'All' || item.client_name === selected_client;

      return matches_search && matches_status && matches_priority && matches_client;
    })
    .sort((left, right) => {
      if (selected_date === 'Oldest') {
        return get_project_sort_value(left) - get_project_sort_value(right);
      }

      if (selected_date === 'Dead line') {
        return get_deadline_value(left) - get_deadline_value(right);
      }

      return get_project_sort_value(right) - get_project_sort_value(left);
    });

  useEffect(()=>{
    async function get_client() {
      try {
        const response = await Api.get('/project/get_client_name');
          const clients = (response?.data?.data ?? []).filter(Boolean);
          const names = clients.map((item)=>item.client_name).filter(Boolean);
          setClientOption([...names]);
          Setnameid([...clients]);
      } catch (error) {
        console.log("Error getting client name", error);
        return
      }
    }
    
    get_client()
    get_project()
  }, []);
  

  
  return (
    <div className='min-w-4/5 min-h-full p-4 flex flex-col gap-y-10 bg-[#0E1016]'>
      <div className='flex justify-between'>
        <div className='flex flex-col'>
          <span className='text-2xl text-gray-300'>Projects</span>
          <span className='text-xl text-gray-300'>Manage every project associated with your clients. Track budgets, deadlines and progress in one place.</span>
        </div>
        <div onClick={OnClick_project} className='h-13 w-40 bg-[#a77935] hover:bg-[#845b1d] hover:scale-95 rounded-xl cursor-pointer flex justify-around items-center'>
            <div className='text-4xl text-amber-50'>+</div>
            <div className='text-xl text-amber-50'>Add Project</div>
        </div>
      </div>
      <div className='w-full h-fit flex justify-around'>
        <Card title={"Total Projects"} data={project.length} color={"text-[#B29045]"}/>
        <Card title={"Active"} data={Active_count} color={"text-[#088F8F]"}/>
        <Card title={"Completed"} data={Status_count} color={"text-[#32CD32]"}/>
        <Card title={"Overdue Projects"} data={overdue_count}  color={"text-[#AA4A44]"}/>
      </div>
      <div className='w-full h-12 flex justify-around'>
        <input value={search_text} onChange={handle_search} className='h-full w-1/4 text-amber-50 p-2 bg-[#35394C] rounded-xl' type='text' placeholder='🔍︎   Search projects ... '></input>
        <Filter options={work_option} width={'w-1/8'} selected={selected_status} on_select={Setselected_status}/>
        <Filter options={priority_option} width={'w-1/8'} selected={selected_priority} on_select={Setselected_priority}/>
        <Filter options={client_filter_options} width={'w-2/8'} selected={selected_client} on_select={Setselected_client} />
        <Filter options={date} width={'w-1/8'} selected={selected_date} on_select={Setselected_date} />
      </div>
      {/* topbar */}
      <div className='w-full h-auto rounded-xl p-2'>
        <div className='w-9/10 h-12 items-center text-amber-50 bg-[#33373c]  text-lg grid grid-cols-6 rounded-xl justify-between'>
          <span>Project</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Budget</span>
          <span>Progress</span>
          <span>Deadline</span>
        </div>
        {filtered_projects.length > 0 ? (
          filtered_projects.map((item) => (
            <Project_details
              key={item.id}
              open_popup={OnClick_task}
              on_deleted={get_project}
              project_id={item.id}
              project_name={item.project_name}
              client_name={item.client_name}
              status={item.status}
              priority={item.priority}
              budget={item.budget}
              start_date={item.start_date}
              end_date={item.end_date}
            />
          ))
        ) : (
          <div className='w-full py-6 text-center text-gray-400'>No projects found</div>
        )}
      </div>
      {project_popup ? <Project_popup status={work_option} nameid={clientnameid} clients={client_option} priority={priority_option} close={() => Setpopup(false)} on_saved={get_project} /> : null}
     {Task_pop_up ? <Task_popup close={Settask_pop_up} project_id={selected_project_id}/> : null}
      
    </div>
  )
}

export default Project_main_sec