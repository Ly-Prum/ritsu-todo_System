'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)

  useEffect(() => {
    const body = document.body
    if (bgImage) {
      body.style.backgroundImage = `url('${bgImage}')`
      body.style.backgroundSize = 'cover'
      body.style.backgroundPosition = 'center center'
      body.style.backgroundRepeat = 'no-repeat'
      body.style.backgroundAttachment = 'scroll'
    } else {
      body.style.backgroundImage = ''
      body.style.backgroundSize = ''
      body.style.backgroundPosition = ''
      body.style.backgroundRepeat = ''
      body.style.backgroundAttachment = ''
    }
  }, [bgImage])

  if (!bgImage) return null
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1,
      pointerEvents: 'none',
      background: 'rgba(8,8,11,0.55)',
    }} />
  )
}
