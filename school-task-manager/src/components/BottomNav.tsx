'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, CheckSquare, Calendar, Link2, Menu, BarChart3, StickyNote, CalendarCheck, Settings, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useT } from '@/hooks/useT'

export default function BottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const t = useT()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!isMobile) return null

  const mainLinks = [
    { href: '/', icon: LayoutDashboard, label: t('nav_dashboard') },
    { href: '/tasks', icon: CheckSquare, label: t('nav_tasks') },
    { href: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { href: '/links', icon: Link2, label: t('nav_links') },
  ]

  const menuLinks = [
    { href: '/progress', icon: BarChart3, label: t('nav_progress') },
    { href: '/memos', icon: StickyNote, label: t('nav_memos') },
    { href: '/events', icon: CalendarCheck, label: t('nav_events') },
    { href: '/settings', icon: Settings, label: t('nav_settings') },
  ]

  return (
    <>
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.45)' }} onClick={() => setMenuOpen(false)}>
          <div
            style={{ position: 'absolute', bottom: 64, right: 0, left: 0, background: 'var(--bottom-nav-menu-bg)', borderTop: '1px solid var(--bottom-nav-border)', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
            onClick={e => e.stopPropagation()}
          >
            {menuLinks.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 10, background: active ? 'rgba(16,185,129,0.12)' : 'var(--bottom-nav-item-bg)', textDecoration: 'none', color: active ? 'var(--emerald-light)' : 'var(--bottom-nav-text)', fontSize: 11, fontWeight: 600 }}>
                  <Icon size={22} />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bottom-nav-bg)', borderTop: '1px solid var(--bottom-nav-border)', zIndex: 200, display: 'flex', height: 64 }}>
        {mainLinks.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', color: active ? 'var(--emerald-light)' : 'var(--bottom-nav-text)', fontSize: 10, fontWeight: 600, position: 'relative' }}>
              {active && <span style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: 'linear-gradient(135deg, var(--emerald), var(--sky))', borderRadius: '0 0 2px 2px' }} />}
              <Icon size={22} />
              <span style={active ? { background: 'linear-gradient(135deg, var(--emerald-light), var(--sky-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}>{label}</span>
            </Link>
          )
        })}
        <button onClick={() => setMenuOpen(o => !o)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: menuOpen ? 'var(--emerald-light)' : 'var(--bottom-nav-text)', fontSize: 10, fontWeight: 600 }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
          <span>{t('nav_menu')}</span>
        </button>
      </nav>
    </>
  )
}
