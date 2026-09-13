import React from 'react'

const Client_count = (props) => {

  function filter() {
    props.filter_status(props.name)
  }

  return (
    <div onClick={filter} name={props.name} className='h-12 w-24 flex justify-center gap-2 items-center cursor-pointer rounded-xl bg-transparent border-2 border-[#4e4662] hover:bg-gray-900'>
        <span className='text-xl text-amber-50'>{props.name}</span>
        <span className='text-xl text-gray-400'>{props.data}</span>
    </div>
  )
}

export default Client_count