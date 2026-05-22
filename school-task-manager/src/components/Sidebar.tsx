'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  StickyNote, Settings, GraduationCap, CalendarCheck, Link2
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

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px', gap: 4,
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '12px 12px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--emerald), var(--sky))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          overflow: 'hidden',
        }}>
          {sidebarIcon
            ? <img src={sidebarIcon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <GraduationCap size={24} color="white" />
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}><GradientText>Study Task Manager</GradientText></div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('nav_subtitle')}</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`sidebar-link ${pathname === href ? 'active' : ''} active:bg-linear-to-br active:from-[#34d399]/25 active:to-[#38bdf8]/25 active:text-white active:border-[rgba(16,185,129,0.3)]`}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        {t('misc_version')}
      </div>
    </aside>
  )
}
