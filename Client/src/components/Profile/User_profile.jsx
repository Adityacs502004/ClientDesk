import React, { useEffect } from 'react';
import Api from '../../Service/api';
import User_avatar from '../DashBoard/Main_section/user_avatar/User_avatar';
import { useState } from 'react';

const user_profile = () => {

  const [user_name , Setusername] = useState("");
  const [user_email , Setuseremail] = useState("");
  const [currentpassword , Setcurrentpassword] = useState("");
  const [newpassword , Setnewpassword] = useState("");
  const [confirmpassword , Setconfirmpassword] = useState("");
  const [saveMessage , Setsavemessage] = useState("");
  const [saveError , Setsaveerror] = useState("");
  const [loading , Setloading] = useState(false);

  const [selectedpic , Setpic] = useState(null);
  const [previewurl , Setpreviewurl] = useState(null);
  const [uploaderror , Setuploaderror] = useState("");

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024 ;

  function handle_selectimage(e) {
    const file = e.target.files[0];

    if(!file) return

    if(file.size > MAX_IMAGE_SIZE){
      Setpic(null);
      Setpreviewurl(null);
      Setuploaderror('Signature must be 2MB or smaller.');
      e.target.value = '';
      return
    }

    Setpic(file);
    Setpreviewurl(URL.createObjectURL(file));
    Setuploaderror('')
  };

  async function get_user_details() {
    try {
      const get_user_details = await Api.get("/profile/get_user_details");

      const data = get_user_details.data.user_data;

      Setusername(data?.username || "");
      console.log(data?.username);
      Setuseremail(data?.email || "");
      
    } catch (error) {
      console.log("Error getting user data" , error);
      return
    }
  }

  function handle_name_input(e) {
    Setusername(e.target.value);
  };

  function handle_current_password_input(e) {
    Setcurrentpassword(e.target.value);
  };

  function handle_new_password(e) {
    Setnewpassword(e.target.value);
  };

  function handle_confirm_password(e) {
    Setconfirmpassword(e.target.value);
  }


  useEffect(()=>{
    async function get_user(params) {
      await get_user_details();
    }
    get_user();
  }, []);

  async function Save_changes() {
    Setsaveerror("");
    Setsavemessage("");
    Setloading(true);

    if (!currentpassword && user_name){
        try {
          const formData = new FormData();
          if(selectedpic){
            formData.append("profile_pic" , selectedpic);
          }
          formData.append("user_name" , user_name)
        const update_name = await Api.post('/profile/save_changes' , formData);
        const update_data = update_name?.data?.success;
        if(update_data == true){
          await get_user_details();
          Setsavemessage(update_name?.data?.message || "Profile updated successfully");
          Setloading(false);
          return
        }
        else{
          Setsaveerror(update_name?.data?.message || "Error updating username");
          Setloading(false);
          return
        }
        } catch (error) {
          Setsaveerror(error?.response?.data?.message || "Error updating username");
          Setloading(false);
          return
        }
    }
    else if (currentpassword && (!newpassword || !confirmpassword)) {
      Setsaveerror("Please set new password before saving");
      Setloading(false);

      return
    }
    else if (!currentpassword && (newpassword || confirmpassword)) {
      Setsaveerror("Current password is required to change your password");
      Setloading(false);
      return
    }
    else if (newpassword && confirmpassword && newpassword !== confirmpassword) {
      Setsaveerror("New password and confirm password do not match");
      Setloading(false);
      return
    }
    else{
      try {
        const formData = new FormData();
        if(selectedpic){
          formData.append("profile_pic" , selectedpic)
        }
        formData.append("user_name" , user_name);
        formData.append("currentpassword" , currentpassword);
        formData.append("newpassword" , newpassword);
        formData.append("confirmpassword" , confirmpassword);
        const update_data = await Api.post('/profile/save_changes' , formData);
        const update_request = update_data?.data?.success;

        if(update_request == true){
          await get_user_details();
          Setsavemessage(update_data?.data?.message || "Profile updated successfully");
          Setloading(false);
          return
        }
        else{
          Setsaveerror(update_data?.data?.message || "Error updating data");
          Setloading(false);
          return
        }

      } catch (error) {
        Setsaveerror(error?.response?.data?.message || "Error setting up new password");
        Setloading(false);
        return
      }
    }
   
  }

  return (
    <div className='w-full h-fit text-amber-50 flex justify-center'>
       <div className="h-full w-3/5 bg-gray-800 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-1 border border-gray-100 flex flex-col items-center justify-center p-4 gap-8">
          {/* Profile photo */}
          <div className='w-full h-fit flex flex-col gap-2'>
            <span className='text-gray-400 text-xl'>Upload Profile pic</span>
            <div className='w-full h-fit flex gap-3'>
                <User_avatar section={"Profile"}/>
                <div className='w-1/3 h-fit flex flex-col'>
                  <label htmlFor="profile_pic" className='w-full h-12 cursor-pointer flex justify-center items-center border-2 border-gray-500 hover:bg-white/5 hover:border-gray-400 gap-4 p-2 rounded-xl'>
                    <img src='/downloads.png' alt='' className='h-5 w-5 shrink-0 opacity-80' />
                    <span className='font-semibold truncate'>
                        {selectedpic ? selectedpic.name : 'Choose file'}
                    </span>
                  </label>
                  <input onChange={handle_selectimage} id='profile_pic' type="file" accept='image/*' className='hidden'/>
                  <span className='mt-2 text-xs text-gray-400'>PNG, JPG or WEBP. Max size 2MB.</span>
                  {uploaderror ? <span className='mt-1 text-sm text-red-400'>{uploaderror}</span> : null}
                  {previewurl && (
                    <div className='mt-4'>
                      <h4 className='mb-2 text-gray-300'>Preview:</h4>
                      <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-500'>
                          <img src={`${previewurl}`} alt='Selected Preview' className='w-full h-full object-cover'></img>
                      </div>
                      
                    </div>
                  )}
                </div>
            </div>
            
          </div>

          {/* Full name */}
          <div className='w-full h-fit flex flex-col gap-2'>
            <span className='text-gray-400 text-xl'>Name</span>
            <input onChange={handle_name_input} value={user_name} type="text" placeholder='Your Name' className='w-full h-12 p-3 text-xl text-amber-50 font-semibold rounded-xl border-2 border-gray-400' />
          </div>

          {/* Email */}
          <div className='w-full h-fit flex flex-col gap-2'>
            <span className='text-gray-400 text-xl'>Email</span>
            <input value={user_email} type="text" placeholder='Email' className='w-full h-12 p-3 text-xl text-gray-500 font-semibold rounded-xl border-2 border-gray-400' disabled />
          </div>

          {/* Break line */}
          <div className='w-full border-b-2 border-gray-400 mt-2 mb-2'></div>

          {/* Change password */}
          
          {/* Current password */}
          <div className='w-full h-fit flex flex-col gap-2'>
            <span className='text-gray-400 text-xl'>Current password</span>
            <input onChange={handle_current_password_input} value={currentpassword} type="password" placeholder='●●●●●●●●' className='w-full h-12 p-3 text-xl text-amber-50 font-semibold rounded-xl border-2 border-gray-400'  />
          </div>

          {/* New and confirm password */}
          <div className='w-full h-fit flex gap-4'>
                  <div className='w-1/2 h-fit flex flex-col gap-2'>
                  <span className='text-gray-400 text-xl'>New password</span>
                  <input onChange={handle_new_password} value={newpassword} type="password" placeholder='●●●●●●●●' className='w-full h-12 p-3 text-xl text-amber-50 font-semibold rounded-xl border-2 border-gray-400'  />
                </div>
                <div className='w-1/2 h-fit flex flex-col gap-2'>
                  <span className='text-gray-400 text-xl'>Confirm password</span>
                  <input onChange={handle_confirm_password} value={confirmpassword} type="password" placeholder='●●●●●●●●' className='w-full h-12 p-3 text-xl text-amber-50 font-semibold rounded-xl border-2 border-gray-400'  />
                </div>

          </div>

          {/* Save changes */}

           {saveError ? <div className='w-full rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300'>{saveError}</div> : null}
           {saveMessage ? <div className='w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-300'>{saveMessage}</div> : null}

           { loading ? <div onClick={Save_changes} className='w-full  h-12 bg-gray-600 pointer-events-none text-black rounded-xl flex justify-center items-center font-bold text-xl'>Save changes</div> : <div onClick={Save_changes} className='w-full h-12 bg-gray-300 cursor-pointer text-black rounded-xl flex justify-center items-center font-bold text-xl'>Save changes</div>}
          
       </div>
    </div>
  )
}

export default user_profile