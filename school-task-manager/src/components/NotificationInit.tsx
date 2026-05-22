'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { getDaysUntilDue } from '@/lib/utils'

export default function NotificationInit() {
  const { tasks, events, integrations } = useStore()
  const { notificationsEnabled, dashAlertDays } = integrations

  useEffect(() => {
    if (!notificationsEnabled) return
    if (typeof window === 'undefined' || !('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
    if (Notification.permission !== 'granted') return

    const lastNotified = localStorage.getItem('last-notified-date')
    const today = new Date().toISOString().split('T')[0]
    if (lastNotified === today) return

    const alertDays = dashAlertDays ?? 7

    const urgentTasks = tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false
      const days = getDaysUntilDue(t.dueDate)
      return days >= 0 && days <= alertDays
    })

    const urgentEvents = events.filter(e => {
      const days = getDaysUntilDue(e.date)
      return days >= 0 && days <= alertDays
    })

    if (urgentTasks.length === 0 && urgentEvents.length === 0) return

    localStorage.setItem('last-notified-date', today)

    const todayItems = [
      ...urgentTasks.filter(t => getDaysUntilDue(t.dueDate!) === 0).map(t => t.title),
      ...urgentEvents.filter(e => getDaysUntilDue(e.date) === 0).map(e => e.title),
    ]
    const tomorrowItems = [
      ...urgentTasks.filter(t => getDaysUntilDue(t.dueDate!) === 1).map(t => t.title),
      ...urgentEvents.filter(e => getDaysUntilDue(e.date) === 1).map(e => e.title),
    ]
    const weekItems = [
      ...urgentTasks.filter(t => { const d = getDaysUntilDue(t.dueDate!); return d > 1 && d <= alertDays }).map(t => t.title),
      ...urgentEvents.filter(e => { const d = getDaysUntilDue(e.date); return d > 1 && d <= alertDays }).map(e => e.title),
    ]

    let body = ''
    if (todayItems.length > 0) body += `今日: ${todayItems.join('、')}\n`
    if (tomorrowItems.length > 0) body += `明日: ${tomorrowItems.join('、')}\n`
    if (weekItems.length > 0) body += `今後${alertDays}日: ${weekItems.slice(0, 3).join('、')}${weekItems.length > 3 ? ' 他' : ''}`

    if (body.trim()) {
      new Notification('📚 Ritsuki リマインダー', {
        body: body.trim(),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      })
    }
  }, [tasks, events, notificationsEnabled, dashAlertDays])

  return null
}
