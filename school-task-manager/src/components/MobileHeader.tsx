'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useStore } from '@/lib/store'
import { useT } from '@/hooks/useT'
import {
  GraduationCap, Menu, X,
  LayoutDashboard, CheckSquare, Calendar, Link2,
  BarChart3, StickyNote, CalendarCheck, Settings,
} from 'lucide-react'

export default function MobileHeader() {
  const isMobile = useIsMobile()
  const sidebarIcon = useStore(s => s.sidebarIcon)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useT()

  if (!isMobile) return null

  const allLinks = [
    { href: '/', icon: LayoutDashboard, label: t('nav_dashboard') },
    { href: '/tasks', icon: CheckSquare, label: t('nav_tasks') },
    { href: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { href: '/links', icon: Link2, label: t('nav_links') },
    { href: '/progress', icon: BarChart3, label: t('nav_progress') },
    { href: '/memos', icon: StickyNote, label: t('nav_memos') },
    { href: '/events', icon: CalendarCheck, label: t('nav_events') },
    { href: '/settings', icon: Settings, label: t('nav_settings') },
  ]

  return (
    <>
      {/* ── ヘッダーバー ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        background: 'var(--mobile-nav-bg)',
        borderBottom: '1px solid var(--bottom-nav-border)',
        display: 'flex', alignItems: 'center',
        paddingLeft: 12, paddingRight: 8,
        zIndex: 300, gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--emerald), var(--sky))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {sidebarIcon
            ? <img src={sidebarIcon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <GraduationCap size={15} color="white" />
          }
        </div>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          りつきのスタディ
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '6px 8px', display: 'flex', alignItems: 'center', borderRadius: 6 }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── ドロワーオーバーレイ ── */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(0,0,0,0.52)' }}
          onClick={() => setOpen(false)}
        >
          {/* ドロワーパネル（右から） */}
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 220,
              background: 'var(--sidebar-bg)',
              borderLeft: '1px solid var(--bottom-nav-border)',
              paddingTop: 56, overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 10px', gap: 2 }}>
              {allLinks.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 8,
                      textDecoration: 'none',
                      fontSize: 14, fontWeight: active ? 700 : 400,
                      color: active ? 'var(--emerald-light)' : 'var(--text)',
                      background: active ? 'rgba(16,185,129,0.14)' : 'transparent',
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
