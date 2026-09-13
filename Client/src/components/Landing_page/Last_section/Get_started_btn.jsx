import React from 'react'
import { useNavigate } from 'react-router'

const Get_started_btn = () => {
  const navigate = useNavigate()
  function handleClick(params) {
    navigate("/signup")
  }

  return (
    
    <div className='h-20 w-full flex justify-center items-center'>
        <button onClick={handleClick} className='w-1/10 h-12 bg-linear-to-b from-gray-400 to-gray-700 rounded-4xl font-semibold hover:scale-105 hover:bg-linear-to-b hover:from-gray-600 hover:to-gray-900 hover:text-white hover:border-2 hover:border-white'>Get Started</button>
    </div>
  )
}

export default Get_started_btn