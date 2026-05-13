'use client'
import { useStore } from '@/lib/store'

export default function BackgroundProvider() {
  const bgImage = useStore(s => s.bgImage)
  if (!bgImage) return null

  return (
    <>
      <style>{`
        html, body {
          background-image: url('${bgImage}') !important;
          background-size: cover !important;
          background-position: center center !important;
          background-repeat: no-repeat !important;
          background-attachment: scroll !important;
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'rgba(8,8,11,0.55)',
      }} />
    </>
  )
}
