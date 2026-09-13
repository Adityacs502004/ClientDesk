import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar/Sidebar';
import Main_sec from './Main_section/Main_sec';
import useAuth from '../Hooks/useAuth'
import Top_bar from "./Main_section/Top_bar";
import Api from '../../Service/api';

const Dashboard = () => {

  const {loading , user} = useAuth();
  if (loading){
    return (
      <div>Loading</div>
    )
  }


  else{
    const user_id = user.user_id;
    const name = user.username;
    const email = user.user_email;

    
    return (
      <div className='flex w-full h-screen bg-[#0E1016]'>
        <Sidebar />
        <div className = 'w-full h-full p-4 flex flex-col '>
            <Top_bar />
            <Main_sec/>
        </div>
        
      </div>
      
    )
  }
}

export default Dashboard