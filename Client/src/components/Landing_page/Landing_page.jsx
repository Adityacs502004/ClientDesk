import React, { useEffect, useRef } from 'react'
import Navbar from './Navbar_and_components/Navbar'
import Hero_section from './Hero_content/Hero_section'
import Line_svg from './Line_svg/Line_svg'
import Heading from './About_heading/Heading'
import Cards_all from './Cards/Cards_all'
import Showcase from './Showcase/Showcase'
import Footer_heading from './Last_section/Footer_heading'
import Get_started_btn from './Last_section/Get_started_btn'
import Socials from './Socials/Socials'
import Created_by from './CreatedBy/Created_by'
import useAuth from '../Hooks/useAuth'
import { useNavigate } from 'react-router'

const Landing_page = () => {
  const {loading , user} = useAuth();
  const navigate = useNavigate();
   useEffect(()=>{
    if (!loading && user?.user_id){
      const hasRedirected = sessionStorage.getItem('redirected');
      if (!hasRedirected){
        sessionStorage.setItem('redirected' , 'true');
        navigate("/dashboard");
      }
    }
   }, [loading, user, navigate])
    
  if (loading){
    return (
      <div>Loading</div>
    )
  }
  return (
    <div className='w-full flex flex-col bg-linear-to-b from-gray-300 to-gray-800'>
      <Navbar />
      <Hero_section />
      <Line_svg />
      <Heading />
      <Cards_all />
      <Showcase />
      <Footer_heading />
      <Get_started_btn />
      <Socials />
      <Created_by />
    </div>
  )
}

export default Landing_page