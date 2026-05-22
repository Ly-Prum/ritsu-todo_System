'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

const SIDEBAR_W = 220

const btn: React.CSSProperties = {
  background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none',
  borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600,
  cursor: 'pointer',
}
const sqBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
  borderRadius: 6, width: 30, height: 30, fontSize: 15,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

export default function BackgroundProvider() {
  const { bgImage, bgImageMobile, bgX, bgY, bgZoom, setBgX, setBgY, setBgZoom } = useStore()
  const [isMobile, setIsMobile] = useState(false)
  const [showControls, setShowControls] = useState(false)
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

      {/* 調整パネル */}
      {showControls ? (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? 80 : 20,
          left: isMobile ? '50%' : SIDEBAR_W + 20,
          transform: isMobile ? 'translateX(-50%)' : 'none',
          zIndex: 300,
          background: 'rgba(0,0,0,0.82)',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10,
          color: 'white', fontSize: 12, minWidth: 220,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 2, letterSpacing: '0.08em' }}>背景調整</div>

          {/* 上下 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', minWidth: 36 }}>上下</span>
            <button type="button" style={sqBtn} onClick={() => setBgY(Math.max(0, bgY - 5))}>▲</button>
            <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{bgY}%</span>
            <button type="button" style={sqBtn} onClick={() => setBgY(Math.min(100, bgY + 5))}>▼</button>
          </div>

          {/* 左右 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', minWidth: 36 }}>左右</span>
            <button type="button" style={sqBtn} onClick={() => setBgX(Math.max(0, bgX - 5))}>◀</button>
            <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{bgX}%</span>
            <button type="button" style={sqBtn} onClick={() => setBgX(Math.min(100, bgX + 5))}>▶</button>
          </div>

          {/* ズーム */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', minWidth: 36 }}>ズーム</span>
            <button type="button" style={sqBtn} onClick={() => setBgZoom(Math.max(1, parseFloat((bgZoom - 0.1).toFixed(1))))}>－</button>
            <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{Math.round(bgZoom * 100)}%</span>
            <button type="button" style={sqBtn} onClick={() => setBgZoom(Math.min(4, parseFloat((bgZoom + 0.1).toFixed(1))))}>＋</button>
          </div>

          <button type="button" onClick={() => setShowControls(false)} style={{ ...btn, background: 'rgba(16,185,129,0.85)', marginTop: 4 }}>
            完了
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowControls(true)}
          style={{
            ...btn,
            position: 'fixed',
            bottom: isMobile ? 80 : 20,
            left: isMobile ? 16 : SIDEBAR_W + 16,
            zIndex: 300,
            borderRadius: 20,
            padding: '6px 14px',
            opacity: 0.75,
          }}
        >
          🖼 背景調整
        </button>
      )}
    </>
  )
}
