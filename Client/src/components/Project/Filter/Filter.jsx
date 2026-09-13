import React, { useEffect, useState } from 'react'

const Filter = (props) => {
  const options = Array.isArray(props.options) ? props.options : [];

  const [is_open , Setopen] = useState(false);
  const [selected , Setselect] = useState(props.selected || "All");

  useEffect(()=>{
    if (props.selected) {
      Setselect(props.selected);
      return;
    }

    if (options.length === 0){
      Setselect("All");
      return;
    }

    if (!options.includes(selected)) {
      Setselect(options.includes('All') ? 'All' : options[0]);
    }
  },[options, props.selected])

  function Select_option(item) {
    Setselect(item);
    props.on_select?.(item);
    Setopen(false);
  }

  function handle_dropdownCLick() {
    Setopen(!is_open);
  }

  function dropdown_options() {
    return options.map((item , index)=>{
             return <div key={index} className='h-fit w-full rounded-2xl '>
               <div onClick={(e) => { e.stopPropagation(); Select_option(item); }} className='w-full h-fit hover:bg-[#21222b]  bg-[#35394C]/90 p-2 text-xl text-gray-300'>{item}</div>
             </div>
        })
  }
  return (
    <div onClick={handle_dropdownCLick} className={`h-12 select-none relative cursor-pointer ${props.width} text-xl text-gray-300 rounded-xl flex justify-between p-4 items-center bg-[#35394C]`}>
      <span>{selected}</span>
      <span>⌄</span>   
      {is_open && (
        <div className='absolute top-full left-0 z-10 w-full'>
          {dropdown_options()} 
        </div>
      )}   
      
    </div>
  )
}

export default Filter