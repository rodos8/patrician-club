'use client';

import { useLayoutEffect, useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function TwoMobile() {

  const sectionRef = useRef<HTMLDivElement>(null)

  const leftPhone = useRef<HTMLImageElement>(null)
  const rightPhone = useRef<HTMLImageElement>(null)
  const notification = useRef<HTMLImageElement>(null)

  const leftText = useRef<HTMLDivElement>(null)
  const rightText = useRef<HTMLDivElement>(null)

  const glow = useRef<HTMLDivElement>(null)

  const [isMobile,setIsMobile] = useState(false)

  useEffect(()=>{
    setIsMobile(window.matchMedia('(max-width:900px)').matches)
  },[])

  /* ================= GSAP ================= */

  useLayoutEffect(()=>{

    const ctx = gsap.context(()=>{

      const mm = gsap.matchMedia()

      /* ================= DESKTOP ================= */

      mm.add('(min-width:900px)',()=>{

        const elements = [
          leftPhone.current,
          rightPhone.current,
          // notification.current,
          leftText.current,
          rightText.current
        ]

        gsap.set(elements,{opacity:0})

        const tl = gsap.timeline({
          scrollTrigger:{
            trigger:sectionRef.current,
            start:'top bottom',
            end:'bottom top',
            scrub:2
          }
        })

        tl.to(elements,{
          opacity:1,
          duration:0.45
        })

        tl.to(elements,{
          opacity:0,
          duration:0.45
        })

      })

      /* ================= MOBILE ================= */

      mm.add('(max-width:900px)',()=>{

        const elements = [
          leftPhone.current,
          rightPhone.current,
          notification.current,
          leftText.current,
          rightText.current
        ]

        gsap.set(elements,{opacity:0})

        gsap.to(elements,{
          opacity:1,
          scrollTrigger:{
            trigger:sectionRef.current,
            start:'top bottom',
            end:'center center',
            scrub:2
          }
        })

      })

      /* ================= GLOW ================= */

      gsap.fromTo(
        glow.current,
        {scale:0.4,opacity:0},
        {
          scale:1.7,
          opacity:0.35,
          scrollTrigger:{
            trigger:sectionRef.current,
            start:'top center',
            end:'bottom center',
            scrub:2
          }
        }
      )

    },sectionRef)

    return ()=>ctx.revert()

  },[])

  /* ================= ПАРАЛЛАКС МЫШИ ================= */

  useEffect(()=>{

    if(isMobile) return

    let raf:number

    let mouseX = 0
    let mouseY = 0

    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e:MouseEvent)=>{

      mouseX = (e.clientX/window.innerWidth - 0.5)
      mouseY = (e.clientY/window.innerHeight - 0.5)

    }

    const animate = ()=>{

      if(!leftPhone.current || !rightPhone.current || !notification.current) return

      currentX += (mouseX-currentX)*0.08
      currentY += (mouseY-currentY)*0.08

      leftPhone.current.style.transform =
        `translate3d(${currentX*10}px,${currentY*10}px,0) rotate(${currentX*1.1}deg)`

      rightPhone.current.style.transform =
        `translate3d(${currentX*-10}px,${currentY*-10}px,0) rotate(${currentX*1.1}deg)`

      notification.current.style.transform =
        `translate3d(${currentX*-4}px,${currentY*-2}px,0)`

      raf = requestAnimationFrame(animate)

    }

    window.addEventListener('mousemove',handleMouseMove)

    animate()

    return ()=>{

      window.removeEventListener('mousemove',handleMouseMove)
      cancelAnimationFrame(raf)

    }

  },[isMobile])

  return(

    <section ref={sectionRef} className="twomobile snap-section h-screen">

      <div className="container">

        <div className="twomobile__list">

          <div className="twomobile__block snap-step">

            <div className="twomobile__list-imgs">

              <Image
                ref={leftPhone}
                src="/img/ipone-1.png"
                alt=""
                width={634}
                height={634}
                style={{
                  willChange:'transform',
                  transform:'translateZ(0)',
                  backfaceVisibility:'hidden'
                }}
              />

            </div>

            <div ref={leftText} className="twomobile__list-item">

              <div className="twomobile__list-item-title">
                Общие<br/>ценности
              </div>

              <div className="twomobile__list-item-text">
                Фундамент для тех, кто строит совместное будущее
              </div>

            </div>

          </div>

          <div className="twomobile__block snap-step">

            <div className="twomobile__list-imgs">

              <Image
                ref={rightPhone}
                src="/img/iphone-2.png"
                alt=""
                width={596}
                height={596}
                style={{
                  willChange:'transform',
                  transform:'translateZ(0)',
                  backfaceVisibility:'hidden'
                }}
              />

              <Image
                ref={notification}
                src="/img/screen.png"
                alt=""
                width={640}
                height={1073}
                style={{
                  willChange:'transform',
                  transform:'translateZ(0)',
                  backfaceVisibility:'hidden'
                }}
              />

            </div>

            <div ref={rightText} className="twomobile__list-item">

              <div className="twomobile__list-item-title">
                Медицинский<br/>протокол
              </div>

              <div className="twomobile__list-item-text">
                Обязательная верификация здоровья по 4 ключевым показателям
              </div>

            </div>

          </div>

        </div>

      </div>

      <div ref={glow} className="twomobile__glow"/>

    </section>

  )

}