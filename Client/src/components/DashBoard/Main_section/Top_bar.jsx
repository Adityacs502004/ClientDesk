import React, { useState } from 'react'
import useAuth from '../../Hooks/useAuth'
import User_avatar from './user_avatar/User_avatar';


const Top_bar = () => {
  
  const {user} = useAuth();
  const [focus , Setfocus]  = useState(false);
  function getGreetings() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }
  function getDate_Time() {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const date = new Date().getDate();
    const month = new Date().toLocaleString('default', { month: 'short' });;
    const year = new Date().getFullYear();

    return `${day}, ${date} ${month} ${year}`
  }
  return (
    <div className='relative rounded-2xl max-h-23 p-4 flex flex-1 justify-between bg-[#1e212e] z-10'>
      <div className='h-full w-fit flex-col '>
        <div className='text-3xl font-black tracking-widest text-amber-50'>{getGreetings()}, {user.username}</div>
        <span className='text-xl font-black tracking-widest text-amber-50'>{getDate_Time()}</span>
      </div>
      <div className='h-10 w-120 relative flex justify-end'>
        
        <User_avatar section={"Top bar"}/>
      </div>
      
      
      
    </div>
  )
}

export default Top_bar