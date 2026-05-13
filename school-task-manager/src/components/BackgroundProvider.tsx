'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)
  const bgImageMobile = useStore(s => s.bgImageMobile)
  const bgPosition = useStore(s => s.bgPosition)
  const bgPositionMobile = useStore(s => s.bgPositionMobile)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const image = (isMobile && bgImageMobile) ? bgImageMobile : bgImage
  const position = (isMobile && bgPositionMobile) ? bgPositionMobile : bgPosition

  useEffect(() => {
    const html = document.documentElement
    if (!isMobile && image) {
      html.style.backgroundImage = `linear-gradient(rgba(8,8,11,0.55),rgba(8,8,11,0.55)),url('${image}')`
      html.style.backgroundSize = 'cover'
      html.style.backgroundPosition = position
      html.style.backgroundRepeat = 'no-repeat'
      html.style.backgroundAttachment = 'fixed'
    } else {
      html.style.backgroundImage = ''
      html.style.backgroundSize = ''
      html.style.backgroundPosition = ''
      html.style.backgroundRepeat = ''
      html.style.backgroundAttachment = ''
    }
  }, [image, isMobile, position])

  if (!image || !isMobile) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: `url('${image}')`,
      backgroundSize: 'cover',
      backgroundPosition: position,
      backgroundRepeat: 'no-repeat',
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,11,0.55)' }} />
    </div>
  )
}
