'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  StickyNote, Settings, GraduationCap, CalendarCheck, Link2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useT } from '@/hooks/useT'
import { useStore } from '@/lib/store'
import GradientText from '@/components/GradientText'

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const t = useT()
  const sidebarIcon = useStore(s => s.sidebarIcon)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch {}
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
  }

  const links = [
    { href: '/', icon: LayoutDashboard, label: t('nav_dashboard') },
    { href: '/tasks', icon: CheckSquare, label: t('nav_tasks') },
    { href: '/progress', icon: BarChart3, label: t('nav_progress') },
    { href: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { href: '/events', icon: CalendarCheck, label: t('nav_events') },
    { href: '/links', icon: Link2, label: t('nav_links') },
    { href: '/memos', icon: StickyNote, label: t('nav_memos') },
    { href: '/settings', icon: Settings, label: t('nav_settings') },
  ]

  if (isMobile) return null

  const W = collapsed ? 52 : 220

  return (
    <aside style={{
      width: W, minWidth: W,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '12px 6px' : '20px 12px',
      gap: 4,
      height: '100vh', position: 'sticky', top: 0,
      overflow: 'hidden',
      transition: 'width 0.22s ease, min-width 0.22s ease, padding 0.22s ease',
    }}>

      {/* Header */}
      {collapsed ? (
        /* 折りたたみ時: 展開ボタンのみ */
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <button type="button" onClick={toggle} title="展開" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.65)', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s',
          }}>
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        /* 展開時: アイコン・タイトル・折りたたみボタン */
        <div style={{ padding: '0 4px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' }}>
          <button type="button" onClick={toggle} title="折りたたむ" style={{
            position: 'absolute', top: 0, right: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)', padding: '4px 6px', borderRadius: 6,
            display: 'flex', transition: 'color 0.2s',
          }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{
            width: 72, height: 72, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--emerald), var(--sky))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {sidebarIcon
              ? <img src={sidebarIcon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <GraduationCap size={22} color="white" />
            }
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}><GradientText>Study Task Manager</GradientText></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t('nav_subtitle')}</div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}
            style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : undefined}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {!collapsed && (
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          {t('misc_version')}
        </div>
      )}
    </aside>
  )
}
