'use client'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)
  if (!bgImage) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8,8,11,0.55)',
      }} />
    </div>
  )
}
