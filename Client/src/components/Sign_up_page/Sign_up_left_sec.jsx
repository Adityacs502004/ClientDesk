import React from 'react'
import Sign_up_right_sec from './Sign_up_right_sec'

const Log_in_Left_Sec = () => {
  return (
    <div className='w-full min-h-screen flex justify-center items-start bg-[url("/Login_signup_background/Neon_background.jpg")] bg-cover bg-no-repeat p-4'>
        <div className='w-full max-w-6xl flex gap-0 items-stretch'>
          <div className='flex-1 p-6 border-4 flex flex-col justify-between border-r-0 rounded-tl-4xl rounded-bl-4xl border-white '>
          <h1 className='text-white font-bold '>PROJECT CONTROL —</h1>
          <div className='flex flex-col gap-5'>
            <h1 className='text-white text-6xl font-stretch-75% '>Stay Ahead Of Every Deadline</h1>
            <h1 className='text-white text-2xl self-baseline'>Organize work, clients and deliverables effortlessly.</h1>
          </div>

          </div>
          <div className='flex-1 p-4 bg-white rounded-tr-4xl rounded-br-4xl'>
            <Sign_up_right_sec />
          </div>

        </div>

    </div>
  )
}

export default Log_in_Left_Sec