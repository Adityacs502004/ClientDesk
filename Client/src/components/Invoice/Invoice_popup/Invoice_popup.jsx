import React, { useEffect, useState, useRef } from 'react'
import Api from '../../../Service/api';
import Description from './Description';

const Invoice_popup = (props) => {
    const [client_dropdown , Setclientdropdown] = useState(false);
    const [Selected_client , Setclient] = useState("");
    const [Client_id , Setclientid] = useState("");
    const [project_list , Setprojectlist] = useState([]);
    const [project_dropdown , Setprojectdropdown] = useState(false);
    const [Selected_project , Setproject] = useState(null);
    const [Startdate , Setstartdate] = useState(null);
    const [Duedate , Setduedate] = useState(null);
    const [items, SetItems] = useState([{ description: '', quantity: '', rate: ''}]);
    const [total , Settotal] = useState(0);
    const [notes , Setnotes] = useState("");
    const clientRef = useRef(null);
    const projectRef = useRef(null);


    useEffect(()=>{

        async function get_project_for_client() {
            // If no client selected, reset project list to only "None"
            if(!Selected_client) {
                Setprojectlist([{ project_name: "None", id: "none" }]);
                Setproject(null);
                return
            }
            try {
                const project_query = await Api.get(`/invoice/get_project/${Client_id}`);
                const project_data = project_query?.data?.project ?? [];
                const list = [{ project_name: "None", id: "none" }, ...project_data];
                Setprojectlist(list);
                // reset selected project when client changes
                Setproject(null);
            } catch (error) {
                console.log("Error getting project for this client");
                return
            }
        }
        get_project_for_client();      
    }, [Selected_client, Client_id]);

    function item_input_function(index, field, value) {
        SetItems((prev) => prev.map((item, itemIndex) => {
            if (itemIndex !== index) return item;
            const nextItem = {
                ...item,
                [field]: value,
            };

            nextItem.amount = Number(nextItem.quantity || 0) * Number(nextItem.rate || 0);

            return nextItem;
        }));
    }

    function notes_input(e){
        Setnotes(e.target.value);
        console.log(notes);
        
    }

    useEffect(()=>{
            let total = items.reduce((sum , item)=>{
                return sum + Number(item.quantity || 0) * Number(item.rate || 0);
            } , 0);
        Settotal(total);
    }, [items]);

    function client_dropdown_function() {
        Setclientdropdown((prev) => {
            const newVal = !prev;
            if (newVal) Setprojectdropdown(false);
            return newVal;
        })
    };

    function project_dropdown_function() {
        Setprojectdropdown((prev) => {
            const newVal = !prev;
            if (newVal) Setclientdropdown(false);
            return newVal;
        })
    };

    // close dropdowns when clicking outside
    useEffect(() => {
        function handleDocumentClick(e) {
            if (clientRef.current && !clientRef.current.contains(e.target)) {
                Setclientdropdown(false);
            }
            if (projectRef.current && !projectRef.current.contains(e.target)) {
                Setprojectdropdown(false);
            }
        }

        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, []);

    function Client_list(params) {
        return (props.clients || []).map((client , index)=>{
            return (<div key={client.id} className='h-fit w-full rounded-2xl'>
                <div onClick={() => { Setclient(client.client_name); Setclientdropdown(false); Setclientid(client.id)}} className='w-full h-fit hover:bg-[#21222b] bg-[#35394C]/90 p-2 text-xl text-gray-300 cursor-pointer'>
                    {client.client_name}
                </div>
            </div>)
        })
    }

    function Project_list() {
        return (project_list || []).map((project) => {
            return (
                <div key={project.id} className='h-fit w-full rounded-2xl'>
                    <div
                        onClick={() => {
                            Setprojectdropdown(false);
                            // treat the "None" item as no project
                            if (project.id === 'none') Setproject(null);
                            else Setproject(project);
                        }}
                        className='w-full h-fit hover:bg-[#21222b] bg-[#35394C]/90 p-2 text-xl text-gray-300 cursor-pointer'
                    >
                        {project.project_name}
                    </div>
                </div>
            )
        })
    }

    function add_more_items(e) {
        e?.preventDefault?.();
        SetItems(prev => [...prev, { description: '', quantity: '', rate: '' }]);
    }

    function delete_item(id){
        SetItems(prev => prev.filter((_, index) => index !== id));
    }

    async function Save_as_draft() {
        const client = (props.clients || []).find((item) => item.client_name === Selected_client);
        const client_id = client?.id;
        const project_id = Selected_project?.id || null;

        if (!client_id) {
            alert("Please select a client before saving the invoice");
            return;
        }

        try {
            const Send_invoice_data = await Api.post("/invoice/send_data" , {
                client_id : client_id,
                project_id : project_id,
                issue_date : Startdate,
                due_date  : Duedate,
                total_amount : total,
                notes : notes,
                items : items
            })
            await props?.saved?.();
            props.close?.();
        } catch (error) {
            console.log("Error in sending and saving invoice data");
            return;
        };
     
    }

    async function Create_and_send() {
        const client = (props.clients || []).find((item) => item.client_name === Selected_client)
         const client_id = client?.id;
        const project_id = Selected_project?.id || null;

        try {
            const send_invoice_data = await Api.post("/invoice/send_data",{
                client_id : client_id,
                project_id : project_id,
                issue_date : Startdate,
                due_date  : Duedate,
                total_amount : total,
                notes : notes,
                items : items,
                status : "Sent"
            });
            await props?.saved?.();
            props.close?.();
        } catch (error) {
            console.log("Error creating and sendind data to client");
            return
        }
    }

  return (
    <div className='fixed inset-0 z-50 flex justify-center items-center'>
        <div className='absolute inset-0 bg-black/40'></div>
        <div className='relative z-10 h-[95vh] w-[50vw] max-w-5xl justify-between p-4 flex flex-col rounded-2xl bg-[#2C2C2A]/95 overflow-y-auto'>
            <div className='w-full  h-20 flex justify-between items-center border-b-2 border-gray-500'>
                <div className='text-amber-50 font-semibold text-2xl '>Create Invoice</div>
                <div onClick={props.close} className='cursor-pointer  w-10 h-10 bg-[url("/close_otp_box.png")] bg-contain bg-no-repeat'></div>
            </div>
            {/* client and project */}
            <div className='w-full h-fit flex justify-between'>
                {/* Client list */}
                <div ref={clientRef} className='w-[40%] h-fit flex flex-col'>
                    <span className='text-lg text-gray-400'>Bill to (Client)</span>
                    <div onClick={client_dropdown_function} className='h-12 select-none relative cursor-pointer w-full text-xl text-gray-300 rounded-xl flex justify-between p-4 items-center bg-[#35394C]'>
                        <span>{Selected_client || "Select a client"}</span>
                        <span>⌄</span>
                        {client_dropdown && (
                            <div className='absolute top-full left-0 z-10 w-full'>
                                {Client_list()}
                            </div>
                        ) }
                    </div>
                </div>
                {/* Project List */}
                 <div ref={projectRef} className='w-[40%] h-fit flex flex-col'>
                    <span className='text-lg text-gray-400'>Project (optional)</span>
                    <div onClick={project_dropdown_function} className='h-12 select-none relative cursor-pointer w-full text-xl text-gray-300 rounded-xl flex justify-between p-4 items-center bg-[#35394C]'>
                        <span>{Selected_project?.project_name || "None"}</span>
                        <span>⌄</span>
                        {project_dropdown && (
                            <div className='absolute top-full left-0 z-10 w-full'>
                                {Project_list()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Issue date and Due date */}
            <div className='w-full h-fit flex justify-between'>
                {/* Issue date */}
                <div className='w-[40%] h-fit flex flex-col gap-2'>
                        <div className='text-lg text-gray-400'>Issue Date</div>
                    <input onChange={(e) => Setstartdate(e.target.value)} value={Startdate || ''} autoComplete="off" type="date" className='w-full bg-gray-500 rounded-xl p-2 h-11 border-amber-50 border-2 text-gray-800'/>
                </div>

                {/* Due date */}
                <div className='w-[40%] h-fit flex flex-col gap-2'>
                        <div className='text-lg text-gray-400'>Due Date</div>
                    <input onChange={(e) => Setduedate(e.target.value)} value={Duedate || ''} autoComplete="off" type="date" className='w-full bg-gray-500 rounded-xl p-2 h-11 border-amber-50 border-2 text-gray-800'/>
                </div>
            </div>

            {/* Items */}

            <div className='w-full mt-6 h-fit flex flex-col gap-4'>
                <span className='text-lg text-gray-200'>Line items</span>
                <div className='w-full h-fit grid grid-cols-5 gap-2'>
                    <span className='text-lg col-span-2 text-gray-500'>Description</span>
                    <span className='text-lg place-self-center mr-6 text-gray-500'>Qty</span>
                    <span className='text-lg text-gray-500'>Rate (₹)</span>
                    <span className='text-lg place-self-center mr-8 text-gray-500'>Amount</span>
                </div>
                    {/* Description */}
                    {items.map((it, idx) => (
                        <Description
                            key={idx}
                            delete={delete_item}
                            id={idx}
                            item={it}
                            total={total}
                            changeinput={item_input_function}
                        />
                    ))}
            
                    {/* Add more items */}
                    <div onClick={add_more_items} className='w-full h-fit flex gap-2 cursor-pointer'>
                        <span className='text-lg text-yellow-600'>+</span>
                        <span className='text-lg text-yellow-600'>Add more items</span>
                    </div>
            </div>
            {/* Total */}
            <div className='w-full h-fit flex justify-end'>
                <div className='w-1/2 h-fit p-2 border-t-2 mt-2 border-gray-700 flex justify-around'>
                        <span className='text-xl text-gray-400'>Total :</span>
                        <span className='text-lg text-amber-50'>{total}</span>
                </div>
            </div>

            {/* Notes */}
            <div className='flex flex-col mt-2 w-full h-fit gap-2'>
                <span className='text-lg text-gray-400'>Notes (optional)</span>
                <textarea onChange={notes_input} value={notes} placeholder='Payment terms , thank you , etc.' name="notes" id="1" className='w-full mt-2 h-30 bg-[#3d3c39] p-2 text-amber-50 text-lg rounded-xl '></textarea>
            </div>
            {/* bottom line */}
            <div className='w-full h-2 mt-2 border-b-2 border-gray-500'></div>

            {/* Buttons */}
            
            <div className='w-full h-fit flex mt-2 justify-end gap-4'>
                <div onClick={props.close} className='text-amber-50 text-xl w-fit p-4 h-fit cursor-pointer'>Cancel</div>
                <div onClick={Save_as_draft} className='bg-[#3d3c39] text-xl cursor-pointer rounded-xl text-amber-50 font-medium w-fit p-4 h-fit'>Save as draft</div>
                <div onClick={Create_and_send} className='bg-[#c1971a] flex gap-2 text-xl cursor-pointer rounded-xl text-amber-50 font-medium w-fit p-4 h-fit'>
                    <div className='w-5 h-5 bg-[url("/Invoice_icon/paper-plane-solid-full.svg")] mt-1 bg-contain bg-no-repeat'></div>
                    <span className='text-xl text-blue-950 font-medium'>Create & Send</span>
                </div>
            </div>

        </div>
      
    </div>
  )
}

export default Invoice_popup
