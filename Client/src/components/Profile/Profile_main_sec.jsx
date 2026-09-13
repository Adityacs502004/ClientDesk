import React, { useState } from 'react';
import User_profile from './User_profile';
import Invoicing from './Invoicing';

const Profile_main_sec = (props) => {

    const [section , Setsection] = useState("profile");

    function Setsection_function(clicked_section) {
        Setsection(clicked_section);
    }

  return (
    <div className='flex-1 mt-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#13151E] p-8 text-amber-50'>
          <div className='flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between'>
            <div>
              <p className='text-sm uppercase tracking-[0.3em] text-gray-400'>Profile</p>
              <h1 className='mt-3 text-4xl font-black'>Your account</h1>
              <p className='mt-3 max-w-xl text-gray-300'>
                View and manage the account details that are used across the dashboard.
              </p>
            </div>
            <button onClick={props.logout} className='h-fit rounded-2xl bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-600'>
              Logout
            </button>
          </div>

           {/* Switch button */}

           <div className='w-full h-full flex flex-col mt-4 gap-4'>
             
             {/* section */}
             <div className='w-full h-fit mt-4 flex justify-between'>
                <div
                  onClick={()=>{Setsection_function("profile")}}
                  name="profile"
                  className={`w-1/2 border-l-2 border-t-2 p-2 flex justify-center items-center border-b-2 cursor-pointer font-extrabold text-2xl transition ${section === "profile" ? "border-amber-50 bg-linear-to-t from-blue-500 to-gray-500 shadow-lg shadow-black/20" : "border-gray-500 text-gray-300 hover:bg-white/5"}`}
                >
                  Profile
                </div>
                <div className='w-4 h-13 bg-linear-to-b from-blue-400 to-gray-700'></div>
                <div
                  onClick={()=>{Setsection_function("invoicing")}}
                  name="invoicing"
                  className={`w-1/2 border-r-2 border-t-2 p-2 flex justify-center items-center border-b-2 cursor-pointer font-extrabold text-2xl transition ${section === "invoicing" ? "border-amber-50 bg-linear-to-t from-blue-500 to-gray-500 shadow-lg shadow-black/20" : "border-gray-500 text-gray-300 hover:bg-white/5"}`}
                >
                  Invoicing
                </div>

             </div>
                
                {/* content */}

                <div className='w-full h-fit flex justify-center items-center'>
                    {section == "profile" ? <User_profile /> : <Invoicing />}
                </div>

           </div>

           

        </div>
  )
}

export default Profile_main_sec