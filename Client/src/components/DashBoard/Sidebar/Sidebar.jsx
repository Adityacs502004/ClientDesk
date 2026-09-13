import React from 'react'
import Sections from './Sections'
import { useLocation, useNavigate } from 'react-router'

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <div className='w-1/5 min-w-fit shrink-0 sticky top-0 h-screen overflow-y-auto p-4 bg-[#13151E] flex flex-col'>
        <div className='h-30 w-full border-b-2 border-amber-50 flex justify-around items-center'>
            <div className='h-16.25 w-16.25 bg-[url("/CD_logo.png")] bg-contain bg-no-repeat rounded-2xl'></div>
            <div className='text-4xl font-black text-amber-50'>Client Desk</div>
        </div>
        <div className='flex flex-col mt-6 gap-y-4 flex-1'>
            <div className='text-gray-400 text-sm underline underline-offset-2'>Main</div>
            <Sections onClick={() => navigate("/dashboard")} name="grid" active={location.pathname === "/dashboard"} title='Dashboard' url="/Dashboard_sidebar/icons8-grid-48.png" />
            <Sections onClick={() => navigate("/clients")} name="clients" active={location.pathname === "/clients"} title='Clients' url="/Dashboard_sidebar/icons8-client-48.png"/>
            <Sections onClick={() => navigate("/project")} name="projects" active={location.pathname === "/project"} title='Project' url="/Dashboard_sidebar/icons8-folder-48.png"/>
            <Sections onClick={() => navigate("/invoices")} name="invoice" active={location.pathname === "/invoices"} title='Invoice' url="/Dashboard_sidebar/icons8-contract-48.png"/>
            <div className='mt-auto pt-6 border-t border-white/10'>
                <Sections onClick={() => navigate("/profile")} name="profile" active={location.pathname === "/profile"} title='Profile' url="/user.png"/>
            </div>
        </div>

    </div>
  )
}

export default Sidebar