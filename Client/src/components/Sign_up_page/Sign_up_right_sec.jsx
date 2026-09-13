import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Api from '../../Service/api'
import Verification_Otp from './Verification_Otp';
import useAuth from '../Hooks/useAuth'

function Sign_up_right_sec() {

  const google_button_ref = useRef(null);
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

   const [iserror , Setiserror]  = useState(false)
    const [errormsg , Seterrormsg] = useState("");

  const [Signup_data , SetData] = useState({
    Name:"",
    Email:"",
    Password:"",
    Conf_password:""
  });

  const [DataBoolean , SetCorrect] = useState({
    is_Passwd_Crrt : true,
    Message : "",
    is_Error:false
  });

  const [Showotp , SetShowotp] = useState(false);
  const [showLoading , SetLoading] = useState(false);


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleChange(e) {
    SetData({...Signup_data , [e.target.name] : e.target.value });
    SetCorrect({...DataBoolean , is_Error : false})
  }

  async function handleClick(e) {
    e.preventDefault();
    if (Signup_data.Name == ""){
      SetCorrect({...DataBoolean , is_Error : true , Message: "Please enter your username"})
    }
    else if(Signup_data.Email == ""){
      SetCorrect({...DataBoolean , is_Error : true ,   Message : "Please enter your email"})
    }
    else if (Signup_data.Password == ""){
      SetCorrect({...DataBoolean , is_Error:true  , Message : "Please enter your password"});
    }
    else if (!emailRegex.test(Signup_data.Email)){
      SetCorrect({...DataBoolean , is_Error:true , Message : "Please enter a valid email"})
    }
    else if (Signup_data.Password.length < 8){
      SetCorrect({...DataBoolean ,is_Error:true,  Message : "Password must be atleast 8 characters long"})
    }
    else if(Signup_data.Conf_password == ""){
      SetCorrect({...DataBoolean,is_Error : true ,   Message : "Please confirm your password"});
      
    }

    else if (Signup_data.Conf_password != Signup_data.Password){
      SetCorrect({...DataBoolean , is_Error : true  , Message : "Password didn't match"});
      console.log("Password didn't match")
    }

    else{
      SetLoading(true);
      SetCorrect({...DataBoolean , is_Error : false})
      try {
        const send_data = await Api.post('/api/register' , {
        name : Signup_data.Name,
        email : Signup_data.Email,
        password : Signup_data.Password,
      });

      if (send_data.data.success){
        SetCorrect({...DataBoolean , is_Error: false})
        SetShowotp(true);
        SetLoading(false);

      }
      } catch (error) {
        console.log(error)
        SetCorrect({...DataBoolean , is_Error : true , Message : error.response.data.message})
      }
      
    }
  }

  const handlegooglelogin = useCallback(async (params) => {
    try {
        const send_rensponse  = await Api.post("/api/auth/google" , {
        credential : params.credential
      })

      if(send_rensponse?.data?.success){
        await refreshAuth();
        navigate("/dashboard")
      }
    } catch {
      Setiserror(true)
      Seterrormsg("Error verifying the user");
      return
    }
       
  }, [navigate, refreshAuth]);

  useEffect(()=>{
    if(!window.google || !google_button_ref.current) return

    window.google.accounts.id.initialize({
      client_id :import.meta.env.VITE_GOOGLE_CLIENT_ID,
      // callback:handle
      callback : handlegooglelogin     
    })
    window.google.accounts.id.renderButton(
      google_button_ref.current,{
        theme : "filled_blue",
        size : "large",
      }
    )
  },[handlegooglelogin]);




  return (
    <div className='w-full py-4 px-4 min-h-screen flex flex-col overflow-y-auto'>
      <div className='w-full h-fit  flex justify-center items-center gap-3'>
        <div className='w-16 h-16 bg-[url("/CD_logo.png")] bg-contain bg-no-repeat'></div>
        <h1 className='text-3xl text-black font-bold'>Client Desk</h1>
      </div>
      <div className='h-fit flex flex-col items-center gap-4'>
      <div className='w-full h-fit flex justify-center'>
        <h1 className='text-2xl md:text-4xl font-black'>Welcome To Client Desk</h1>
      </div>
        
        <div className='w-full h-fit flex justify-center'>
          <h4 className='text-xl'>Enter your Email and Password To Signup</h4>
        </div>
    
        <div className='h-auto mt-4 w-fit bg-white flex flex-col overflow-y-auto gap-4 items-start'>
        <div>
          <div className='text-lg font-bold'>Username</div>
          <input name='Name' spellCheck={false} onChange={handleChange} autoComplete='off'  type='text' placeholder='Enter Your username' className='bg-gray-300 h-10 w-80 rounded-lg'></input>
        </div> 
        <div>
          <div className='text-lg font-bold'>Email</div>
          <input name='Email' spellCheck={false} onChange={handleChange} autoComplete='off'  type='email' placeholder='Enter Your Email' className='bg-gray-300 h-10 w-80 rounded-lg'></input>
        </div>  
        <div>
          <div className='text-lg font-bold'>Password</div>
          <input name='Password' onChange={handleChange} type='password' placeholder='Enter your Password' className='bg-gray-300 h-10 w-80 rounded-lg'></input>
        </div>
        <div>
          <div className='text-lg font-bold'>Confirm Password</div>
          <input name='Conf_password' onChange={handleChange}  type='text' placeholder='Enter your Password' className='bg-gray-300 h-10 w-80 rounded-lg'></input>
        </div>
        {DataBoolean.is_Error ? <div className='text-red-700 font-black h-fit w-72 mt-2'>{DataBoolean.Message}</div> : null}      
        <div className='w-full flex justify-center items-center mt-6'>
          {showLoading ? <div className='h-12 rounded-2xl w-12 bg-[url("/Loading_animation.gif")] bg-contain bg-no-repeat'></div> : <button onClick={handleClick} className='h-12 w-36 flex justify-center items-center font-extrabold rounded-lg bg-gray-400 hover:bg-gray-800 hover:text-white'>Sign up</button>}
          
        </div>
        <div className='text-xl font-black flex self-center '>Or</div>
        <div className='w-full h-fit flex justify-center items-center' ref={google_button_ref}></div>
        {iserror ? <div className='w-full h-fit text-xl font-bold text-red-400'>{errormsg}</div> : null}
      </div>
      {Showotp ? <Verification_Otp SetShowotp={SetShowotp} email={Signup_data.Email}/> : null}
      
      </div>
      <div></div>
      
        
        
    </div>
  )
}

export default Sign_up_right_sec
