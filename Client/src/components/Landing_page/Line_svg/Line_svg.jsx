import { useGSAP } from '@gsap/react';
import React, { useRef, useState } from 'react'
import gsap from 'gsap';


const Line_svg = () => {
    const divRef = useRef(null)

    var init_path = `M 280 80 Q 880 80 1480 80`;

    function move_line(params) {
       
        const rect = divRef.current.getBoundingClientRect();

        
    

        var rel_y =  params.clientY - rect.top ;
        var rel_x =  params.clientX


        init_path = `M 280 80 Q ${rel_x} ${rel_y} 1480 80`


        
        gsap.to(".var_div" , {
            attr : {d : init_path},
            duration : 0.8,
            ease : "elastic.out(1,0.3)"

        })

    }

    function restore(params) {
        var init_path = `M 280 80 Q 880 80 1480 80`;
        gsap.to(".var_div" , {
            attr : {d : init_path},
            duration : 0.8,
            ease : "elastic.out(1,0.4)"

        })
    }

    

  return (
    <div>
        <svg ref={divRef} onMouseMove={move_line} onMouseLeave={restore} height="160" className=' w-full'>
            <path className='var_div' d="M 280 80 Q 880 -10 1480 80" stroke="white" fill="transparent" />
        </svg>
    </div>
  )
}

export default Line_svg