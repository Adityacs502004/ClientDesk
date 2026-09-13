import React from 'react'

const Orbit_images = (props) => {
  return (
    <div id={props.id} className={`absolute ${props.pos}`} >
      <img
      src={props.src}
      id={props.img_id}
      className={` h-14 w-14 rounded-2xl `}
    />
    </div>
    
  )
}

export default Orbit_images