'use client'
import { useEffect } from 'react'
import { useStore, THEME_COLORS } from '@/lib/store'

export default function ThemeApplier() {
  const themeColor = useStore(s => s.integrations.themeColor ?? 'emerald')
  const themeMode = useStore(s => s.integrations.themeMode ?? 'dark')

  useEffect(() => {
    const root = document.documentElement
    const theme = THEME_COLORS[themeColor] ?? THEME_COLORS.emerald
    const isDark = themeMode === 'dark'

    root.style.setProperty('--emerald', theme.primary)
    root.style.setProperty('--emerald-light', theme.primaryLight)
    root.style.setProperty('--sky', theme.secondary)
    root.style.setProperty('--sky-light', theme.secondaryLight)

    root.setAttribute('data-theme', isDark ? 'dark' : 'light')

    // Light mode uses the darker base colors so gradient text stays visible
    const gradFrom = isDark ? theme.primaryLight : theme.primary
    const gradTo = isDark ? theme.secondaryLight : theme.secondary
    let styleEl = document.getElementById('theme-gradient-text')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'theme-gradient-text'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = `.gradient-text { background-image: linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%) !important; }`
  }, [themeColor, themeMode])

  return null
}
