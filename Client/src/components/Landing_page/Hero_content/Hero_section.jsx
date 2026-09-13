import React from 'react'
import Hero_content from './Hero_content'
import Orbit from '../Orbit_section/orbit'


const Hero_section = () => {
  return (
    <div className='flex w-full bg-linear-to-b from-gray-200 to-gray-800  h-[calc(100vh-96px)] justify-between'>
        <Hero_content />
        <Orbit />
    </div>
  )
}

export default Hero_section