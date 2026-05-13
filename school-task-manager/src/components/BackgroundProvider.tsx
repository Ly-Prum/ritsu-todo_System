'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)

  useEffect(() => {
    const html = document.documentElement
    if (bgImage) {
      html.style.backgroundImage = `linear-gradient(rgba(8,8,11,0.55), rgba(8,8,11,0.55)), url('${bgImage}')`
      html.style.backgroundSize = 'cover'
      html.style.backgroundPosition = 'center'
      html.style.backgroundRepeat = 'no-repeat'
      html.style.backgroundAttachment = 'fixed'
    } else {
      html.style.backgroundImage = ''
      html.style.backgroundSize = ''
      html.style.backgroundPosition = ''
      html.style.backgroundRepeat = ''
      html.style.backgroundAttachment = ''
    }
  }, [bgImage])

  return null
}
