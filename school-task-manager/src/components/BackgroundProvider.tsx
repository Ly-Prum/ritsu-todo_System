'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

const SIDEBAR_W = 220

export default function BackgroundProvider() {
  const { bgImage, bgImageMobile, bgX, bgY, bgZoom } = useStore()
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // layout.tsx の beforeInteractive Script が付与したクラスを初回レンダー時に同期読み込み
  // useState ではなく useRef で初期化することで hydration タイミング問題を回避
  const isMobileUA = useRef(
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('is-mobile-ua')
      : false
  )

  useEffect(() => {
    document.documentElement.style.backgroundImage = ''
    document.documentElement.style.backgroundAttachment = ''
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // モバイルUA では常に null（背景画像を一切描画しない）
  const image = isMobileUA.current ? null : ((isMobile && bgImageMobile) ? bgImageMobile : bgImage)

  useEffect(() => {
    if (image && pathname !== '/') {
      document.documentElement.classList.add('has-bg')
    } else {
      document.documentElement.classList.remove('has-bg')
    }
  }, [image, pathname])

  if (!image || pathname === '/') return null

  const left = isMobile ? 0 : SIDEBAR_W
  const width = isMobile ? '100%' : `calc(100% - ${SIDEBAR_W}px)`

  return (
    <>
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
      <div style={{
        position: 'fixed', top: 0, left, width, height: '100%',
        background: 'var(--overlay-bg)', zIndex: 1, pointerEvents: 'none',
      }} />
    </>
  )
}
