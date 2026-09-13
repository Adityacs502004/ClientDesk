import React, { useEffect, useState } from 'react'
import Api from '../../../Service/api';

const Project_details = (props) => {

    const[task_list , Settasklist] = useState([]);
    const[percent_data , Setpercentdata] = useState(0);

    const status_bg_color = {'Planning' : '#2A2B2D' , 'In Progress' : '#3A2E17' , 'Waiting' : '#33556e' , 'Completed' : '#0D7824' , 'Cancelled' : '#E0151F'};
    const priority_color = {'Low' : '#5C7538' , 'Medium' : '#0AC798' , 'High' : '#AEB418' , 'Urgent': '#E0151F'};

    function open_popup() {
        props.open_popup?.(props.project_id);
    }

    function deadline() {
        if (!props.end_date) {
            return 'N/A';
        }

        const end_date = new Date(props.end_date);

        if (Number.isNaN(end_date.getTime())) {
            return 'N/A';
        }

        const start_date = new Date(props.start_date);
        let today = new Date();
        const difference = end_date - today;

        const deadline = Math.ceil(difference / (1000 * 60 * 60 * 24));

        if (Number.isNaN(deadline)) {
            return 'N/A';
        }
        if (deadline <= 0){
            return 'Project deadline over'
        };

        return `${deadline} days left`;
    }

    async function delete_project() {
        const project_id = props.project_id;

        try {
            await Api.post('/project/delete_project', {
                project_id: project_id
            });

            await props.on_deleted?.();
        } catch (error) {
            console.error('Error deleting project', error);
        }
    }

    async function get_task() {
        try {
            const project_id = props.project_id;
            const get_task = await Api.get(`/project/get_task/${project_id}`);
            const task_data = (get_task?.data?.task_data ?? []).map((task) => ({
                id: task.id,
                task: task.task_name ?? task.task ?? '',
                complete: task.is_complete ?? task.complete ?? false
            }));
            Settasklist(task_data);
        } catch (error) {
            console.error('Error getting tasks', error);
        }
    }

    useEffect(()=>{
        async function get_task_for_project() {
            await get_task()
        };
        get_task_for_project();
    },[]);

    useEffect(() => {
        const total_task = task_list.length;

        if (total_task === 0) {
            Setpercentdata(0);
            return;
        }

        const completed_task = task_list.filter((task) => task?.complete === true).length;
        const percent_number = Math.round((completed_task / total_task) * 100);
        Setpercentdata(percent_number);
    }, [task_list]);

   

  return (
        <div className="w-full min-h-18 h-fit border-b-2 border-b-gray-800 flex items-stretch">
        <div onClick={open_popup} className='w-9/10 cursor-pointer h-full min-h-18 flex '>
            <div className='w-full h-full min-h-18 grid grid-cols-6 '>
                {/* Name */}
                <div className='w-full pl-4 h-full min-h-18 gap-2 items-center flex flex-col'>
                    <span className='text-amber-50 text-2xl self-start font-extrabold '>{props.project_name}</span>
                    <span className='text-gray-400 text-lg self-start'>{props.client_name || 'No client name'}</span>
                </div>
                {/* Status */}
                <div className='w-full mr-2 h-full min-h-18 gap-2 flex flex-col justify-center'>
                    <div name={props.status} className={`w-fit h-fit p-1 pl-2 pr-2 rounded-xl`} style={{ backgroundColor: status_bg_color[props.status] || '#2A2B2D' }}>
                        <span className='text-md text-amber-50'>{props.status}</span>
                    </div>
                </div>
                {/* Priority */}
                <div className='w-full h-full min-h-18 gap-2 flex flex-col justify-center'>
                    <span className='text-lg font-extrabold' style={{ color: priority_color[props.priority] || '#E5E7EB'}}>{props.priority}</span>
                </div>
                {/* Budget */}
                <div className='w-full h-full min-h-18 gap-2 flex flex-col justify-center'>
                    <span className='text-lg font-extrabold text-amber-50'>{props.budget}</span>
                </div>
                {/* progress */}
                <div className='w-full h-full min-h-18 gap-2 flex flex-col justify-center items-center'>
                    <div className='w-4/5 h-fit rounded-3xl border-2 border-amber-50'>
                        <div style={{ width: `${percent_data}%` }} className='h-5 rounded-3xl bg-amber-600'></div>
                    </div>
                    <span className='text-lg text-gray-400'>{task_list.length == 0 ? "No task" : `${percent_data}%`}</span>
                </div>
                {/* Dead line */}
                <div className='w-full h-full min-h-18 gap-2 col-start-6 flex flex-col justify-center'>
                     <span className='text-lg ml-10 font-extrabold text-gray-400'>{deadline()}</span>
                </div>
                
            </div>
            </div>
                {/* delete */}
                <div onClick={delete_project} className='w-fit self-stretch  flex items-center ml-8'>
                    <div className='w-7 cursor-pointer h-7 bg-[url("/delete.png")] bg-contain  bg-no-repeat'></div>
                </div>
        </div>
  )
}

export default Project_details