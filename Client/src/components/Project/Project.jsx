import React from 'react'
import Sidebar from '../DashBoard/Sidebar/Sidebar';
import Top_bar from '../DashBoard/Main_section/Top_bar';
import Project_main_sec from './Project_main_sec';

const Project = () => {
  return (
    <div className='flex w-full min-h-screen bg-[#0E1016]'>
        <Sidebar />
        <div className = 'w-full min-h-screen p-4 flex flex-col bg-[#0E1016]'>
            <Top_bar />
            <Project_main_sec />
        </div>
        
      </div>
  )
}

export default Project