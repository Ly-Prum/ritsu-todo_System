'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export default function AlarmManager() {
  const { events, tasks } = useStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const sessionKey = 'alarm-checked-session'
    const today = new Date().toISOString().split('T')[0]
    const checked = sessionStorage.getItem(sessionKey)
    if (checked === today) return
    sessionStorage.setItem(sessionKey, today)

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Check events with alarms
    events.forEach(ev => {
      if (ev.alarmMinutesBefore === undefined || ev.alarmMinutesBefore === null) return
      const evDate = new Date(ev.date + 'T09:00:00')
      const alarmTime = new Date(evDate.getTime() - ev.alarmMinutesBefore * 60 * 1000)
      if (alarmTime >= now && alarmTime <= in24h) {
        const label = ev.alarmMinutesBefore === 0
          ? '本日'
          : ev.alarmMinutesBefore === 60
          ? '1時間前'
          : ev.alarmMinutesBefore === 1440
          ? '1日前'
          : `${ev.alarmMinutesBefore}分前`
        new Notification(`📅 イベントリマインダー: ${ev.title}`, {
          body: `${ev.date}（${label}）${ev.location ? ' @ ' + ev.location : ''}`,
          icon: '/icon-192.png',
        })
      }
    })
  }, [events, tasks])

  return null
}
