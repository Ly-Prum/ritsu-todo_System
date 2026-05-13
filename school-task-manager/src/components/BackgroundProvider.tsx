'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)
  const bgImageMobile = useStore(s => s.bgImageMobile)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    document.documentElement.style.backgroundImage = ''
    document.documentElement.style.backgroundAttachment = ''
  }, [])

  const image = (isMobile && bgImageMobile) ? bgImageMobile : bgImage
  if (!image) return null

  return (
    <>
      <img
        src={image}
        alt=""
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(8,8,11,0.55)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
    </>
  )
}
