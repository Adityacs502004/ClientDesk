import React from 'react'

const Cards = (props) => {
  return (
    <div className='bg-[#34384d] p-4 rounded-2xl justify-around flex flex-col min-w-1/5 w-fit text-amber-50 h-36'>
        <div className='text-gray-400 text-xl'>
          {props.title}
        </div>
        <div className={`text-5xl ${props.color ? props.color : "text-amber-50"} font-bold`}>{props.data}</div>
    </div>
  )
}

export default Cards