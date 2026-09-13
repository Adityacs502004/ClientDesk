import React from 'react'
import Sidebar from '../DashBoard/Sidebar/Sidebar'
import Top_bar from '../DashBoard/Main_section/Top_bar'
import useAuth from '../Hooks/useAuth'
import Profile_main_sec from './Profile_main_sec';

const Profile = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className='flex w-full min-h-screen bg-[#0E1016] text-amber-50 items-center justify-center'>
        Loading
      </div>
    )
  }

  return (
    <div className='flex w-full min-h-screen bg-[#0E1016]'>
      <Sidebar />
      <div className='w-full min-h-screen p-4 flex flex-col bg-[#0E1016]'>
        <Top_bar />
        <Profile_main_sec logout={logout} user={user}/>
      </div>
    </div>
  )
}

export default Profile