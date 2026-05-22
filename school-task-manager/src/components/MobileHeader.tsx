'use client'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useStore } from '@/lib/store'
import { GraduationCap } from 'lucide-react'

export default function MobileHeader() {
  const isMobile = useIsMobile()
  const sidebarIcon = useStore(s => s.sidebarIcon)

  if (!isMobile) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 52,
      background: 'var(--mobile-nav-bg)',
      borderBottom: '1px solid var(--bottom-nav-border)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 16,
      zIndex: 100,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, var(--emerald), var(--sky))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {sidebarIcon
          ? <img src={sidebarIcon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <GraduationCap size={18} color="white" />
        }
      </div>
    </div>
  )
}
