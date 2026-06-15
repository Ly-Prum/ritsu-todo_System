'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Calendar, Link2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useT } from '@/hooks/useT'

export default function BottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const t = useT()

  if (!isMobile) return null

  const links = [
    { href: '/', icon: LayoutDashboard, label: t('nav_dashboard') },
    { href: '/tasks', icon: CheckSquare, label: t('nav_tasks') },
    { href: '/calendar', icon: Calendar, label: t('nav_calendar') },
    { href: '/links', icon: Link2, label: t('nav_links') },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bottom-nav-bg)',
      borderTop: '1px solid var(--bottom-nav-border)',
      zIndex: 200, display: 'flex', height: 56,
    }}>
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 2, textDecoration: 'none',
            color: active ? 'var(--emerald-light)' : 'var(--bottom-nav-text)',
            fontSize: 10, fontWeight: 600, position: 'relative',
          }}>
            {active && (
              <span style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: 2, background: 'linear-gradient(135deg, var(--emerald), var(--sky))',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <Icon size={20} />
            <span style={active ? {
              background: 'linear-gradient(135deg, var(--emerald-light), var(--sky-light))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            } : {}}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
