'use client'
import { useStore } from '@/lib/store'

export default function HeaderBanner() {
  const headerBanner = useStore(s => s.headerBanner)
  const headerBannerY = useStore(s => s.headerBannerY)
  if (!headerBanner) return null

  return (
    <div style={{ position: 'relative', width: '100%', height: 160, flexShrink: 0, overflow: 'hidden' }}>
      <img
        src={headerBanner}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${headerBannerY}%`, display: 'block' }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to bottom, transparent, var(--bg))',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
