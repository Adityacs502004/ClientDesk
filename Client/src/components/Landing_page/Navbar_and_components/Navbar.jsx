import React, { useState } from 'react';
import Login_Signup_section from './Login_Signup_section';
import Login_Signin_Aboutus_btn from './Login_Signin_Aboutus_btn';
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

    const navigate = useNavigate();

    function nav_login(params) {
        navigate('/login')
    }
    function nav_signup(params) {
        navigate('signup')
    }

    const Scroll_to_about = (target) =>{
        const select = document.getElementById(target)
        select.scrollIntoView({behavior : 'smooth'})
    }

    const [isOpen , changeState] = useState(false);

    function HandleMenuClick() {  
        changeState((prev) => !prev);
        console.log(isOpen);   
    }

    function Sidebar() {
        if (isOpen){
            return (
                <div className='flex flex-col gap-y-12 right-0 w-3/4 h-dvh bg-linear-to-b absolute from-gray-800 to-gray-600'>
                    <div className='ml-auto w-full'>
                        <img onClick={HandleMenuClick} src="/close.png" alt='close' className='h-8 ml-auto mr-8 mt-6 w-8 mt-4 '></img>
                    </div>

                    <Login_Signup_section onClick={nav_signup} name="Sign up" />
                    <Login_Signup_section onClick={nav_login} name="Log in" />
                    <Login_Signup_section onClick={()=>Scroll_to_about("about")} name="About us" />
                    
                </div>
            )
        }
    }

    function Rendermenu() {
       
            return(
            <div onClick={HandleMenuClick} className='block sm:hidden h-12 min-w-12 mt-3 mr-10 bg-[url("/menu.png")] bg-contain'>
            </div> 
        )   
    }

  return (
    <div className='w-full bg-gray-700 bg-linear-to-b from-gray-700 to-gray-200 h-24 flex'>
        <div>
            <img src='/CD_logo.png' alt='logo' className='h-18 mt-3 min-w-12 w-18 lg:ml-10 ml-2 mr-2 sm:ml-2 rounded-lg'></img>
        </div>
        <div className='flex flex-col w-100 h-full justify-center lg:ml-8 md:ml-6 sm:ml-6'>
            <h3 className='text-gray-100 font-extrabold w-fit overflow-hidden font-stretch-semi-expanded min-text-lg ml-4 lg:text-4xl md:text-2xl sm:text-xl'>Client Desk</h3>
            <p className='font-bold text-gray-700 ml-4 w-40 text-sm sm:text-sm '>Personal Client Tracking App</p>
        </div>
        <div className='flex gap-15 items-center mr-10  w-full justify-end'>
            <Login_Signin_Aboutus_btn onClick={()=>Scroll_to_about("about")}  name="About" />
            <Login_Signin_Aboutus_btn onClick={nav_signup} name="Sign up " />
            <Login_Signin_Aboutus_btn onClick={nav_login} name="Log in" />
            
        </div>
        {!isOpen ? <Rendermenu />: null}
        

        {/* Sidebar */}

        <Sidebar />
        
    </div>
  )
}

export default Navbar