'use client'
import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { getDaysUntilDue } from '@/lib/utils'

export default function NotificationInit() {
  const { tasks } = useStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    // Request permission on first load
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    if (Notification.permission !== 'granted') return

    // Check for tasks due today or tomorrow
    const urgent = tasks.filter(t => {
      if (t.status === 'completed') return false
      const days = getDaysUntilDue(t.dueDate)
      return days === 0 || days === 1
    })

    if (urgent.length === 0) return

    const lastNotified = localStorage.getItem('last-notified-date')
    const today = new Date().toISOString().split('T')[0]
    if (lastNotified === today) return

    localStorage.setItem('last-notified-date', today)

    const todayTasks = urgent.filter(t => getDaysUntilDue(t.dueDate) === 0)
    const tomorrowTasks = urgent.filter(t => getDaysUntilDue(t.dueDate) === 1)

    let body = ''
    if (todayTasks.length > 0) body += `今日締切: ${todayTasks.map(t => t.title).join('、')}\n`
    if (tomorrowTasks.length > 0) body += `明日締切: ${tomorrowTasks.map(t => t.title).join('、')}`

    new Notification('📚 Ritsuki の課題リマインダー', {
      body: body.trim(),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  }, [tasks])

  return null
}
