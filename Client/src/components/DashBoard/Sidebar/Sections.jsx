import React from 'react'

const Sections = (params) => {
  return (
    <div  name={params.name} style={{cursor:'pointer'}} onClick={()=>{params.onClick(params.name)}}  className= {`h-fit p-2 rounded-2xl w-full flex justify-start space-x-5 items-center ${params.active ? "bg-mauve-600" : ""}`}  >
        <div className='h-10 w-10 bg-contain bg-no-repeat' style={{ backgroundImage : `url('${params.url}')`}}></div>
        <div className='text-2xl font-black text-amber-50'>{params.title}</div>
    </div>
    
  )
}

export default Sections