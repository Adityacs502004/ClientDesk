import React, { useRef } from 'react'
import Cards from './Cards'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

const Cards_all = () => {

  const container = useRef();

  useGSAP(()=>{
    var tl = gsap.timeline({
      scrollTrigger : {
        trigger : container.current,
        start : "top 50%",
        end : "top 20%",
        
        
      }
    });

    tl.from("#card_1" , {
      x: -80, 
      opacity: 0, 
      duration: 0.6,
      ease: "power2.out",
      clearProps: "transform" 
    });

    tl.from("#card_2" , {
      y: -80, 
      opacity: 0, 
      duration: 0.6,
      ease: "back.out(1.7)",
      clearProps: "transform" 
    })

    tl.from("#card_3" , {
      x: 80,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      ease: "power2.out",
      clearProps: "transform" 
    })


  }, {scope : container})



  return (
    <div ref={container} className='flex w-[1200px] flex-wrap justify-around h-260 relative self-center mt-4'>
        <Cards id="card_1" src="/Card_images/Project_tracking.png" span="01 — Tracking" heading="Project Tracking" cont="Track active projects, milestones, and progress from a single workspace." />
        <Cards id="card_2" src="/Card_images/Client_management.png" span="02 — Clients" heading="Client Management" cont = "Organize client details, communication, and project history efficiently." />
        <Cards id="card_3" src="/Card_images/Deadline_monitor.png" span="03 — Deadlines" heading = "Deadline monitoring" cont = "Stay ahead of deadlines with clear timelines and task scheduling." />
        <Cards id="card_4" src="/Card_images/Workflow_organisation.png" span="04 — Workflow" heading = "Workflow organization" cont = "Structure tasks and workflows without clutter or complexity." />
        <Cards id="card_5" src="/Card_images/Analytics.png" span="05 — Insights" heading = "Analytics & insights" cont = "Monitor productivity and project performance with visual insights." />
    </div>
  )
}

export default Cards_all