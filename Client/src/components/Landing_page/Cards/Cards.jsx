import { useGSAP } from '@gsap/react'
import React from 'react'
import gsap from 'gsap'

const Cards = (props) => {

  return (
    <div id={props.id} className='h-110 hover:scale-105  p-2 hover:bg-conic/decreasing hover:from-violet-700 hover:via-lime-300 hover:to-violet-700 rounded-2xl w-[360px] mt-20  flex '>
         <div className='h-105 w-full flex flex-col items-center bg-gray-400/60 shadow-8xl backdrop-blur-md rounded-2xl p-6 gap-2 '>
        <img src={props.src} className='h-60 w-[300px] rounded-4xl '></img>
        <span className='text-gray-900 self-start'>{props.span}</span>
        <h1 className='text-white text-2xl self-start font-extrabold'>{props.heading}</h1>
        <h5 className='self-start font-bold text-gray-800'>{props.cont}</h5>
      </div>
    </div>
   
  )
}

export default Cards





