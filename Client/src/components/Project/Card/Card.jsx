import React from 'react'

const Card = (props) => {
  return (
    <div className='card w-4/21 min-h-30 flex flex-col gap-3 rounded-2xl p-4 bg-[#35394C]'>
        <span className='text-xl text-gray-300'>{props.title}</span>
        <span className={`text-4xl ${props.color}`}>{props.data}</span>
        <span className={`text-md text-gray-300`}>{props.footer || ''}</span>
    </div>
  )
}

export default Card