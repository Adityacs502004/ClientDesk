import React from 'react'
import Top_bar from '../DashBoard/Main_section/Top_bar';
import Sidebar from '../DashBoard/Sidebar/Sidebar'
import Client_Main_sec from './Client_Main_sec';


const Clients = () => {
  return (
    <div className='flex w-full min-h-screen bg-[#0E1016]'>
        <Sidebar />
        <div className = 'w-full min-h-screen p-4 flex flex-col bg-[#0E1016]'>
            <Top_bar />
            <Client_Main_sec />
        </div>
        
      </div>
  )
}

export default Clients