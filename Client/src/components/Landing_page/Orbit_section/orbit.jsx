import React from 'react'
import Orbit_images from './orbit_images'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'


const Orbit = () => {

  useGSAP(()=>{
    gsap.to("#img_1", {
      rotation: 360, 
      transformOrigin: "28px 348px", 
      ease: "none", 
      repeat: -1, 
      duration: 9 
    })
    gsap.to("#img_2" , {
      rotation:360,
      transformOrigin: "288px 28px",
      duration:6,
      repeat:-1,
      ease:"none"
    })
    gsap.to("#img_3" , {
      rotation: 360, 
      transformOrigin: "-172px 28px", 
      ease: "none", 
      repeat: -1, 
      duration: 7 
    })
    gsap.to("#img_4" , {
      rotation: 360, 
      transformOrigin: "28px -112px", 
      ease: "none", 
      repeat: -1, 
      duration: 4 
    })

    gsap.to("#image_1", {
      rotation:-360,
      ease: "none", 
      repeat: -1, 
      duration: 9
    })

    gsap.to("#image_2" , {
      rotation:-360,
      duration:6,
      repeat:-1,
      ease:"none"
    })
    gsap.to("#image_3", {
      rotation:-360,
      duration:7,
      repeat:-1,
      ease:"none"
    })
    gsap.to("#image_4" , {
      rotation:-360,
      duration:4,
      repeat:-1,
      ease:"none"
    })
  })

  return (
    <div className="mt-10 relative flex justify-center items-center h-160 w-160 border-2 border-white/30 rounded-full mr-18">
      <Orbit_images img_id="image_1" id="img_1" pos="top-[-28px] left-[calc(50%-28px)]" src="/Client_images/Pasted_image.png" />

      <div className="relative flex justify-center items-center h-130 w-130 border-2 border-white/50 rounded-full">
        <Orbit_images img_id="image_2" id="img_2" pos="left-[-28px] top-[calc(50%-28px)]" src="/Client_images/Pasted_image_2.png" />

        <div className="relative flex justify-center items-center h-100 w-100 border-2 border-white/70 rounded-full">
          <Orbit_images img_id="image_3" id="img_3" pos="right-[-28px] top-[calc(50%-28px)]" src="/Client_images/Zaid_image.jpg" />

          <div className="relative flex flex-col justify-center items-center h-70 w-70 border-2 border-white/90 rounded-full">
            <Orbit_images img_id="image_4" id="img_4" pos="bottom-[-28px] left-[calc(50%-28px)]" src="/Client_images/Man.png" />
            <h1 className='text-gray-700 font-extrabold text-3xl'>Client</h1>
            <h1 className='text-gray-700 font-extrabold text-3xl'>Desk</h1>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Orbit