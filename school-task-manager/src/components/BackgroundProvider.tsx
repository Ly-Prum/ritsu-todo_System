'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

const SIDEBAR_W = 220

export default function BackgroundProvider() {
  const { bgImage, bgImageMobile, bgX, bgY, bgZoom } = useStore()
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

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
  if (!image || pathname === '/') return null

  const left = isMobile ? 0 : SIDEBAR_W
  const width = isMobile ? '100%' : `calc(100% - ${SIDEBAR_W}px)`

  return (
    <>
      {/* 背景画像ラッパー — サイドバー右側のみ */}
      <div style={{
        position: 'fixed', top: 0, left, width, height: '100%',
        overflow: 'hidden', zIndex: 0, pointerEvents: 'none',
      }}>
        <img
          src={image}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${bgZoom * 100}%`,
            height: `${bgZoom * 100}%`,
            maxWidth: 'none', maxHeight: 'none',
            objectFit: 'cover',
            objectPosition: `${bgX}% ${bgY}%`,
            userSelect: 'none',
          }}
        />
      </div>

      {/* オーバーレイ — サイドバー右側のみ */}
      <div style={{
        position: 'fixed', top: 0, left, width, height: '100%',
        background: 'var(--overlay-bg)', zIndex: 1, pointerEvents: 'none',
      }} />
    </>
  )
}
