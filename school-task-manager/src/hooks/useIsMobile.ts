'use client'
import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const ua = navigator.userAgent
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
    const check = () => setIsMobile(isMobileUA || window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}
