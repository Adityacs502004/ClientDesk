import React from 'react'

const Inputbox = (props) => {
  return (
    <div className='w-full h-fit flex flex-col gap-2  mt-6'>
            <span className='text-gray-500 text-xl'>
              {props.name}
            </span>
            <input onChange={props.inputChange} value={props.value} name={props.name} type="text" placeholder={props.placeholder} autoCorrect='off' autoComplete='off' className='w-full text-gray-400 text-xl rounded-lg h-12 p-4 border-2 border-gray-500'/>
    </div>
  )
}

export default Inputbox