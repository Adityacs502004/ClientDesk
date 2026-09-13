import React, { useCallback } from 'react'
import { Form, Link } from 'react-router-dom'
import Api from '../../Service/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useEffect } from 'react'
import useAuth from '../Hooks/useAuth'


function Login_signup_right_sec() {

  const navigate = useNavigate();
  const google_button_ref = useRef(null);
  const { refreshAuth } = useAuth();


  const [FormData , ChangeState] = useState({
    Login_email : "",
    Login_password : "",
    IsChecked : false
  });
  const [response_sent , Setresponse] = useState({
    success : false,
    message : ""
  });

  const [iserror , Setiserror]  = useState(false)
  const [errormsg , Seterrormsg] = useState("");

  function handlechange(e) {
    if (e.target.name == "Checkbox"){
      ChangeState({...FormData , IsChecked : e.target.checked})
    }
    else{
      ChangeState({...FormData , [e.target.name] : e.target.value})
    }
    
  }

  async function handleClick(params) {
    console.log(FormData);
    params.preventDefault();
    try {
        const response = await Api.post('/api/login' , {
        email : FormData.Login_email,
        password : FormData.Login_password,
        IsChecked : FormData.IsChecked
      });
      if (response.data.success){
        Setresponse({success : true , message : response.data.message});
        await refreshAuth();
        navigate("/dashboard");
      }
      else{
        Setresponse({success : false , message : response.data.message});
      }
    } catch (error) {
      Setresponse({success : false , message : error.response.data.message});
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
    <div className='w-full h-full flex flex-col justify-between'>
      <div className='w-full h-20 flex justify-center items-center gap-3'>
        <div className='w-16 h-16 bg-[url("/CD_logo.png")] bg-contain bg-no-repeat'></div>
        <h1 className='text-3xl text-black font-bold'>Client Desk</h1>
      </div>
      <div className='h-5/7 flex flex-col items-center justify-around'>
      <div className='w-full h-fit flex justify-center'>
        <h1 className='text-6xl font-black'>Welcome Back</h1>
      </div>
        
        <div className='w-full h-fit flex justify-center'>
          <h4 className='text-2xl'>Enter your Email and Password To Login</h4>
        </div>
    
        <div className='h-5/7 w-fit bg-white flex flex-col justify-around items-start'>
        <div>
          <div className='text-xl font-bold'>Email</div>
          <input onChange={handlechange} name="Login_email" spellCheck={false}  type='text' placeholder='Enter Your Email' className='bg-gray-300 h-12 w-80 rounded-lg'></input>
        </div>  
        <div>
          <div className='text-xl font-bold'>Password</div>
          <input name='Login_password' onChange={handlechange} type='password' placeholder='Enter your Password' className='bg-gray-300 h-12 w-80 rounded-lg'></input>
        </div>

        {response_sent.success ? null : <div className='text-red-700 font-black h-fit w-72 mt-2'>{response_sent.message}</div>}
        
        <div className='w-full flex justify-center mt-6'>
          <button onClick={handleClick} type='submit' className='h-12 w-36 font-extrabold rounded-lg bg-gray-400 hover:bg-gray-800 hover:text-white'>Log in</button>
        </div>
        <div className='text-xl flex self-center font-bold'>Or</div>
        <div className='w-full h-fit flex justify-center items-center' ref={google_button_ref}></div>
        {iserror ? <div className='w-full h-fit text-xl font-bold text-red-400'>{errormsg}</div> : null}
      </div>
      </div>
      <div className='flex w-full justify-center mb-2'>
        <Link to={'/forgot-password'} className='font-black text-gray-800'>Forgot password?</Link>
      </div>
      <div className='flex w-full justify-center mb-6'>
        <div>Don't have a account? </div>
        <Link to={"/signup"} className='font-black ml-2'>Sign up</Link> 
      </div>
        
        
    </div>
  )
}

export default Login_signup_right_sec
