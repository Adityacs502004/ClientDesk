import React from 'react'

const Login_Signin_Aboutus_btn = (props) => {
  return (
    <button onClick={props.onClick} className=' hidden sm:block font-extrabold hover:bg-gray-800 focus:scale-95 text-white border-2 border-gray-500 h-9 w-22 rounded-lg'>{props.name}</button>
  )
}

export default Login_Signin_Aboutus_btn