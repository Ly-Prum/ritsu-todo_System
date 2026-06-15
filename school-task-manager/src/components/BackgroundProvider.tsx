'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

const SIDEBAR_W = 220

export default function BackgroundProvider() {
  const { bgImage, bgImageMobile, bgX, bgY, bgZoom } = useStore()
  const [isMobile, setIsMobile] = useState(false)
  // effectiveImage は '' で始める → 初期レンダー時は背景なし（サーバー・クライアント共通）
  const [effectiveImage, setEffectiveImage] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    document.documentElement.style.backgroundImage = ''
    document.documentElement.style.backgroundAttachment = ''

    const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    const widthCheck = () => {
      const mob = window.innerWidth < 768
      setIsMobile(mob)
      // モバイルUA なら背景を一切表示しない
      if (!ua) {
        setEffectiveImage((mob && bgImageMobile) ? bgImageMobile : (bgImage ?? ''))
      }
      // モバイルUA の場合は effectiveImage = '' のまま → has-bg も付かない
    }
    widthCheck()
    window.addEventListener('resize', widthCheck)
    return () => window.removeEventListener('resize', widthCheck)
  }, [bgImage, bgImageMobile])

  useEffect(() => {
    if (effectiveImage && pathname !== '/') {
      document.documentElement.classList.add('has-bg')
    } else {
      document.documentElement.classList.remove('has-bg')
    }
  }, [effectiveImage, pathname])

  if (!effectiveImage || pathname === '/') return null

  const left = isMobile ? 0 : SIDEBAR_W
  const width = isMobile ? '100%' : `calc(100% - ${SIDEBAR_W}px)`

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left, width, height: '100%',
        overflow: 'hidden', zIndex: 0, pointerEvents: 'none',
      }}>
        <img
          src={effectiveImage}
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
