import React, { useState, useEffect } from 'react'
import Api from '../../../Service/api';

const Task_popup = (props) => {

    const [taskList, setTaskList] = useState([]);
    const [taskText, setTaskText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const project_id = props.project_id;

      async function save_tasks() {
          if (!project_id || isSaving) {
              return;
          }

          setIsSaving(true);

          try {
              await Api.post('/project/send_task', {
                  project_id,
                  task: taskList.map((task) => ({
                      task: task.task,
                      complete: task.complete
                  }))
              });
          } catch (error) {
              console.error('Error saving tasks', error);
              throw error;
          } finally {
              setIsSaving(false);
          }
      }

      function handle_close(){
          props.close(false);
      }

      async function handle_save(){
          try {
              await save_tasks();
              props.close(false);
          } catch (error) {
              return;
          }
    }

    function input_addtask(e) {
        setTaskText(e.target.value);
    }

    function handle_addclick(){   
        const trimmedTask = taskText.trim();

        if (!trimmedTask) {
            return;
        }

        setTaskList(prev => [...prev, { task: trimmedTask, complete: false }]);
        setTaskText('');
    }

    async function get_task() {
        if (!project_id) return;

        try {
            const get_task = await Api.get(`/project/get_task/${project_id}`);
            const task_data = (get_task?.data?.task_data ?? []).map((task) => ({
                id: task.id,
                task: task.task_name ?? task.task ?? '',
                complete: task.is_complete ?? task.complete ?? false
            }));
            setTaskList(task_data);
            console(taskList);
        } catch (error) {
            console.error('Error getting tasks', error);
        }
    }

    useEffect(()=>{
        get_task()
    }, [project_id] , );

    console.log(taskList);

    function onClick_task(index) {
        const currentTask = taskList[index];

        if (!currentTask) {
            return;
        }

        const nextComplete = !currentTask.complete;

        setTaskList(prev =>
            prev.map((task, currentIndex) =>
                currentIndex === index
                    ? { ...task, complete: nextComplete }
                    : task
            )
        );
    }

      function remove_task(indexToRemove) {
        const taskToRemove = taskList[indexToRemove];

        if (!taskToRemove) {
            return;
        }

        setTaskList(prev => prev.filter((task, index) => index !== indexToRemove));
    }

    function task_completion(task) {
        return task.complete
            ? 'bg-[url("/filled_circle.png")]'
            : 'bg-[url("/empty_circle.png")]';
    }

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center'>
        <div className='absolute inset-0 bg-black/40'></div>
        <div className='h-[85vh] justify-around min-w-[fit] p-4 flex flex-col w-1/3 left-2/5 rounded-2xl absolute top-1/15 bg-[#2C2C2A]/95'>
        <div className='w-full  h-fit flex justify-between'>
            <div className='text-amber-50 font-semibold text-2xl '>Add Task</div>
              <div onClick={handle_close} className='cursor-pointer self-end w-10 h-10 bg-[url("/close_otp_box.png")] bg-contain bg-no-repeat'></div>
        </div>
        <div className='inputbox w-[90%] flex self-center h-15'>
            <input onChange={input_addtask} value={taskText} type="text" placeholder='Add task' className='w-[90%] h-14 p-2 outline-0 text-xl text-amber-50 font-semibold font-sans border-b-2 border-b-amber-50'/>
            <div onClick={handle_addclick}  className='cursor-pointer w-24 text-amber-50 text-2xl font-black flex justify-center items-center rounded-xl h-12 bg-blue-400'>Add</div>
        </div>
            <div className='h-120  self-center w-[90%] overflow-y-auto p-4 rounded-2xl bg-[url("/todo.jpeg")]  bg-cover opacity-55'>
                {taskList.map((task , index)=>{
                    return <div  key={index} className='w-full p-2 gap-2 text-gray-900 mb-18 rounded-xl text-2xl flex justify-center items-center'>
                        <div onClick={() => onClick_task(index)} className={`w-6 h-6 cursor-pointer ${task_completion(task)} bg-contain bg-no-repeat`}></div>

                        <div onClick={() => onClick_task(index)} className={`w-[85%] ml-2 ${task.complete ? 'line-through' : ''} h-8  text-2xl text-gray-800 font-extrabold font-sans`}>{task.task}</div>

                        <div onClick={() => remove_task(index)} className='w-6 h-6 bg-[url("/close.png")] cursor-pointer bg-contain bg-no-repeat'></div>
                    </div>
                })}
            </div>         
          {/* save & cancel */}
          <div className='w-full h-fit flex gap-4 justify-end'>
                            <div onClick={handle_close} className='w-26 h-12 p-2 flex justify-center items-center bg-transparent border-2 hover:scale-95 hover:bg-gray-700 cursor-pointer border-gray-500 font-bold rounded-xl text-amber-50'>Cancel</div>
                            <div  onClick={handle_save} className={`w-26 h-12 p-2 cursor-pointer hover:bg-blue-900 flex justify-center items-center hover:scale-95 bg-blue-700 text-2xl text-amber-50 font-bold rounded-xl ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}>Save</div>
          </div>
        </div>
    </div>
          
  )
}

export default Task_popup