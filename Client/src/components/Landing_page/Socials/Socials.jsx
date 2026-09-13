import React from 'react'

const Socials = (props) => {
  return (
    <div className='flex w-full justify-around items-center h-30 border-t-2 border-gray-600 mt-15 p-4'>
      <div className='flex h-24 w-24 flex flex-col items-center'>
        <div className='h-18 w-18 bg-[url("/Socials_img/linkedinb&w.png")] bg-contain bg-no-repeat hover:bg-[url("/Socials_img/linkedin.png")]'>
        </div>
        <h1 className='text-white'>Linkdin</h1>
      </div>
      <div className='flex h-24 w-24 flex flex-col items-center'>
        <div className='h-18 w-18 bg-[url("/Socials_img/githubb&w.png")] bg-contain bg-no-repeat hover:bg-[url("/Socials_img/github.png")]'>
        </div>
        <h1 className='text-white'>Github</h1>
      </div>
      <div className='flex h-24 w-24 flex flex-col items-center'>
        <div className='h-18 w-18 bg-[url("/Socials_img/instagram_b&w.png")] bg-contain bg-no-repeat hover:bg-[url("/Socials_img/instagram.png")]'>
        </div>
        <h1 className='text-white'>Instagram</h1>
      </div>
      
    </div>
  )
}

export default Socials