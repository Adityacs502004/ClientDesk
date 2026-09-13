import React from 'react'
import useAuth from '../../../Hooks/useAuth'
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Api from '../../../../Service/api';

const User_avatar = (props) => {
  // Check if profile photo exist

  const [profile_url , Setprofileurl] = useState("");
  const section = props.section;

  async function get_profile_pic() {
    try {
      const get_profile_pic = await Api.get("/profile/get_profile_pic");
      const profile_pic_data = get_profile_pic.data.profile_url;
      if (profile_pic_data){
        Setprofileurl(profile_pic_data)
      }
    } catch (error) {
      console.log("Error getting user profile pic");
      return
    }
  }

  const {user , logout} = useAuth();
  const initial =  user?.username?.[0] || "";
  const [showDropdown , SetDropdown] = useState(false);
  const containerRef = useRef(null)
  const navigate = useNavigate();

  useEffect(()=>{
    function handleOutsideClick(e){
      if(containerRef.current && !containerRef.current.contains(e.target)){
        SetDropdown(false);
      }
    }
    document.addEventListener('mousedown' , handleOutsideClick);
    return ()=> document.removeEventListener('mousedown' , handleOutsideClick);
  }, [])
  useEffect(()=>{
    get_profile_pic();
  },[])

  function handleClick() {
    SetDropdown(show => !show);
  }

  function showmenu() {
    return(
      <div ref={containerRef} className="absolute right-0 top-full z-50 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg flex flex-col ">
          <button onClick={() => navigate('/profile')} className="px-4 cursor-pointer py-2 text-left text-amber-50 hover:bg-gray-700">Profile</button>
          <button onClick={logout} className="px-4 cursor-pointer py-2 text-left hover:bg-gray-700 text-red-400">Logout</button>
      </div>
    )
  }

  function topbar() {
    return(
        <div onClick={handleClick} className='relative w-24 h-12 flex justify-center items-center gap-3 cursor-pointer'>
          {profile_url ? <div className='w-fit h-fit flex justify-center items-center'>
        <div
          className='h-12 w-12 rounded-full bg-contain bg-no-repeat bg-center'
          style={{ backgroundImage: `url(${profile_url})` }}
        ></div>
      </div> : <div className='rounded-full h-12 w-12 font-bold text-3xl flex justify-center items-center text-amber-100  bg-amber-500'>{initial}</div>}     
          <div className='h-6 w-6 bg-[url("/Dashboard_sidebar/down-chevron.png")] bg-contain bg-no-repeat'></div>
        {showDropdown ? showmenu() : null}
      </div>
    )
  }

  function profile(){
    if(profile_url){
      return(
      <div className='w-fit h-fit flex justify-center items-center'>
        <div
          className='h-12 w-12 rounded-full bg-contain bg-no-repeat bg-center'
          style={{ backgroundImage: `url(${profile_url})` }}
        ></div>
      </div>
    )
    }
    else{
      return(
        <div className='w-fit h-fit flex justify-center items-center'>
          <div className='rounded-full h-12 w-12 font-bold text-3xl flex justify-center items-center text-amber-100  bg-amber-500'>{initial}</div>
        </div>
        
      )
    }
    
  }

  return (
    
    (section == "Top bar") ? topbar() : profile()
    
  )
}

export default User_avatar