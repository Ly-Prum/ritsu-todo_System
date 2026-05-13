'use client'
import { useEffect, useState } from 'react'

export default function PWAUpdateNotifier() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowUpdate(true)
          }
        })
      })
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setShowUpdate(true)
    })
  }, [])

  if (!showUpdate) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 16, right: 16,
      background: 'linear-gradient(135deg, var(--emerald), var(--sky))',
      borderRadius: 14,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
        新しいバージョンがあります
      </span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'white',
          color: 'var(--emerald)',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        更新する
      </button>
    </div>
  )
}
