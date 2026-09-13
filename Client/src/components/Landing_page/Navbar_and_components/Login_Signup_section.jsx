import React from 'react'

const Login_Signup_section = (props) => {
  return (
    <div className='flex w-full h-12 border-2 focus:scale-95 hover:bg-gray-800 bg-linear-to-r from-gray-700 to-gray-750 border-gray-700 rounded-l-md'>
        <h5 className='text-white text-xl font-bold mt-2 ml-4'>{props.name}</h5>
    </div>
  )
}

export default Login_Signup_section