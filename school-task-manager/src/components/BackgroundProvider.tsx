'use client'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)
  if (!bgImage) return null

  return (
    <>
      <img
        src={bgImage}
        alt=""
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        background: 'rgba(8,8,11,0.55)',
        pointerEvents: 'none',
      }} />
    </>
  )
}
