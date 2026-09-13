import React, { useState } from 'react'
import Pop_up from '../Pop_up/Pop_up';

const Clients_details = (props) => {

    const name = props.Client || "";

    const status = props.status || "";
    const tags = (props.tags || "" ).split(",").filter(Boolean);

    const [popup , Setpopup] = useState(false);

    function onClick_edit(params) {
        console.log(params)
        Setpopup(true);
    }

    function handle_close(){
        Setpopup(false);
    }

    function place_tags() {
        return tags.map((tag , index)=>{
            return <span key={index} className='rounded-4xl whitespace-nowrap min-w-fit bg-gray-400 border-2 border-gray-500 px-3 py-1 text-gray-800 font-semibold'>{tag}</span>
            
        })
    }

    const Colors = [
    '#1E3A8A',
    '#0D9488',
    '#7C3AED',
    '#BE185D',
    '#15803D',
    '#B45309',
    '#1D4ED8',
    '#6D28D9',
    '#B91C1C',
    '#0E7490',
    '#65A30D',
    '#92400E',
    '#334155',
    '#4338CA',
    '#0F766E'
];

    function random_color() {
        let hash = 0;
        let lowercase = name.toLowerCase();
        for (let i= 0 ; i < lowercase.length ; i++){
            hash = hash * 31 + lowercase.charCodeAt(i)
        }
        const index = Math.abs(hash) % Colors.length;
        return Colors[index];
    }

    const statusStyle = {
        Active :{
            bg: "bg-green-400",
            text: "text-green-900",
        },
        Lead :{
            bg: "bg-[#875318]",
            text: "text-[#c5a975]",
        },
        Past : {
            bg: "bg-[#5d5d55]",
            text: "text-[#d2bf9c]",
        },
    };

  return (
    <div className='w-full flex min-h-16 border-b-2 border-b-gray-800 '>
            <div className='w-19/20 h-full p-2 grid grid-cols-5'>
            {/* Name */}
            <div className='flex h-12  items-center gap-6'>
            {name != "" ? <div className={`min-h-12 min-w-12 rounded-full`} style={{backgroundColor : random_color()}}></div> : <div className={`h-12 w-12 rounded-full`} style={{backgroundColor : "red"}}></div>}
                
                <span className='text-xl font-bold text-amber-50'>{props.Client}</span>
            </div>
            {/* Status */}
            <div className='w-1/6 h-12 flex  justify-start   items-center'>
                {status && statusStyle[status] && (
                    <div className={`h-fit w-fit text-lg ${statusStyle[status].bg} p-1 ${statusStyle[status].text} font-semibold rounded-4xl`}>{status}
                    </div>
                )}
            </div>
            {/* tags */}
            <div className='h-fit pl-5 flex-wrap gap-2 flex items-center'>
                {tags.length != 0 ? place_tags() : <span className='text-gray-100 font-semibold'>—</span>}
            </div>

            {/* outstanding */}
            <div className='h-full flex'>
                <span className='text-red-400 font-bold text-2xl'>{props.currency || "$"}</span>
                <span className='text-red-400 font-bold text-2xl'>{props.Outstanding || "0"}</span>
            </div>

            {/* Last activity */}
            <div className='flex h-full'>
                <span className='text-gray-500'>{props.activity || "No activity yet"}</span>
            </div>
            
            </div>
            {/* edit and delete */}
            <div onClick={onClick_edit} className='w-10 h-10 bg-[url("/edit.png")] flex justify-center items-center bg-contain bg-no-repeat cursor-pointer'></div>
            

            {popup ? <Pop_up SaveorEdit={"Save edit"} fetch_client={props.fetch_client} delete_client={props.delete_client} close={handle_close} CancelorDelete={"Delete client"} initialData={{
            id: props.id,
            name: props.Client,
            Outstanding: props.Outstanding,
            email: props.email,
            status: props.status,
            tags: props.tags
          }}/> : null}
            
    </div>
    
  )
}

export default Clients_details