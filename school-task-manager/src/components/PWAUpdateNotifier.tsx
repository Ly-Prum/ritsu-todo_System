'use client'
import { useEffect } from 'react'

export default function PWAUpdateNotifier() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    // Register sw.js once — it will self-destruct (clear caches + unregister)
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  return null
}
