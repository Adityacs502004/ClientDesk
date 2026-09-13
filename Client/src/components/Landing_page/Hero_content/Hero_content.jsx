import React from 'react'

const Hero_content = () => {
    const text = "Keep Every Client In Orbit";
    const letters = text.split('');
    const span_letter = letters.map((letter , index) => {
        return(
            <span className='text-8xl brightness-80 contrast-110 -tracking-wide font-black bg-clip-text text-transparent bg-linear-to-b from-gray-400 to-gray-800' key={index}>{letter}</span>
        )
        
    })

  return (
    <div className='ml-10 h-full w-1/2 flex gap-2.5 items-center justify-center flex-col'>
        <h1 className=''>{span_letter}</h1>
        <h2 className='text-4xl text-gray-900'>Simple & Effective Way To Manage your Projects And Clients</h2>
    </div>
  )
}

export default Hero_content