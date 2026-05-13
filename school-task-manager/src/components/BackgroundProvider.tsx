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
    const image = (isMobile && bgImageMobile) ? bgImageMobile : bgImage
    const html = document.documentElement
    if (image) {
      html.style.backgroundImage = `linear-gradient(rgba(8,8,11,0.55), rgba(8,8,11,0.55)), url('${image}')`
      html.style.backgroundSize = 'cover'
      html.style.backgroundPosition = 'center'
      html.style.backgroundRepeat = 'no-repeat'
    } else {
      html.style.backgroundImage = ''
      html.style.backgroundSize = ''
      html.style.backgroundPosition = ''
      html.style.backgroundRepeat = ''
    }
  }, [bgImage, bgImageMobile, isMobile])

  return null
}
