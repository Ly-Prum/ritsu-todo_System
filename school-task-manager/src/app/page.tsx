'use client'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { EVENT_TYPE_LABELS } from '@/lib/utils'
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import GradientText from '@/components/GradientText'

function DonutChart({ value, size = 188, strokeWidth = 18 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)
  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference * (1 - value / 100)), 120)
    return () => clearTimeout(t)
  }, [value, circumference])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <defs>
        <linearGradient id="donut-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--emerald)" />
          <stop offset="100%" stopColor="var(--emerald-light)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--progress-track)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="url(#donut-grad)"
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

function SectionLabel({ children, color = 'var(--emerald)' }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      margin: '0 0 16px',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color,
    }}>
      {children}
    </p>
  )
}

export default function Dashboard() {
  const { tasks, events, subjects, updateTask, integrations } = useStore()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const DOW = ['日', '月', '火', '水', '木', '金', '土']

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  const todayTasks = tasks
    .filter(t => t.dueDate === todayStr)
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
      return 0
    })

  const weekTasks = tasks
    .filter(t => t.status !== 'completed' && !!t.dueDate && t.dueDate > todayStr && t.dueDate <= weekEndStr)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  const todayEvents = events
    .filter(e => e.date === todayStr)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))

  const getSubjectName = (id?: string) => subjects.find(s => s.id === id)?.name ?? '未設定'
  const getSubjectColor = (id?: string) => subjects.find(s => s.id === id)?.color ?? 'var(--text-ghost)'

  // アラート：期限が近い課題・イベント
  const dashAlertEnabled = integrations.dashAlertEnabled ?? true
  const dashAlertDays = integrations.dashAlertDays ?? 7
  const alertEndDate = new Date(today)
  alertEndDate.setDate(today.getDate() + dashAlertDays)
  const alertEndStr = alertEndDate.toISOString().split('T')[0]
  const upcomingAlerts = dashAlertEnabled ? [
    ...tasks
      .filter(t => t.status !== 'completed' && !!t.dueDate && t.dueDate >= todayStr && t.dueDate <= alertEndStr)
      .map(t => ({
        id: t.id,
        title: t.title,
        deadline: t.dueDate!,
        color: getSubjectColor(t.subjectId),
        label: getSubjectName(t.subjectId),
        daysLeft: Math.round((new Date(t.dueDate! + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()) / 86400000),
      })),
    ...events
      .filter(e => e.date >= todayStr && e.date <= alertEndStr)
      .map(e => ({
        id: 'ev-' + e.id,
        title: e.title,
        deadline: e.date,
        color: e.color,
        label: EVENT_TYPE_LABELS[e.type] ?? e.type,
        daysLeft: Math.round((new Date(e.date + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()) / 86400000),
      })),
  ].sort((a, b) => a.daysLeft - b.daysLeft) : []

  // 科目別：残りレポート・出席（科目ごとに1行）
  const subjectRemaining = dashAlertEnabled ? subjects.flatMap(sub => {
    const submitted = tasks.filter(t => t.subjectId === sub.id && t.type === 'report' && t.status === 'completed').length
    const reportRem = (sub.totalReports && sub.totalReports > submitted) ? sub.totalReports - submitted : 0
    const sessionRem = (sub.totalSessions && sub.totalSessions > (sub.attendedSessions ?? 0)) ? sub.totalSessions - (sub.attendedSessions ?? 0) : 0
    if (!reportRem && !sessionRem) return []
    return [{ id: sub.id, title: sub.name, color: sub.color, reportRem, sessionRem }]
  }) : []

  function toggleTask(id: string, status: string) {
    updateTask(id, { status: status === 'completed' ? 'pending' : 'completed' })
  }

  function fmtDate(date?: string) {
    if (!date) return '—'
    const d = new Date(date + 'T00:00:00')
    return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`
  }

  return (
    <div style={{ padding: '16px 20px', width: '100%' }}>

      {/* ── ヘッダー ── */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ background: 'linear-gradient(135deg, var(--emerald), var(--sky))', color: 'white', borderRadius: 8, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>ダッシュボード</span>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>Study Task Manager</div>
        <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>
          {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日（{DOW[today.getDay()]}）
        </span>
      </div>

      {/* ── タスクカード（最上部）── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>

        {/* 今日の締切 */}
        <div className="card" style={{ padding: '12px 14px' }}>
          <SectionLabel color="var(--emerald)">今日の締切</SectionLabel>
          {todayTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>締切のタスクはありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {todayTasks.map(task => {
                const done = task.status === 'completed'
                return (
                  <button key={task.id} onClick={() => toggleTask(task.id, task.status)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '7px 0', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                    <div style={{ color: done ? 'var(--emerald)' : 'var(--text-check-off)', flexShrink: 0 }}>
                      {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div style={{ width: 3, height: 28, borderRadius: 2, backgroundColor: getSubjectColor(task.subjectId), opacity: done ? 0.4 : 1, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, opacity: done ? 0.45 : 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', textDecoration: done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{getSubjectName(task.subjectId)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 今週の課題 */}
        <div className="card" style={{ padding: '12px 14px' }}>
          <SectionLabel color="var(--sky)">今週の課題</SectionLabel>
          {weekTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>今週の課題はありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {weekTasks.slice(0, 8).map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--divider)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', minWidth: 60, flexShrink: 0 }}>{fmtDate(task.dueDate)}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-medium)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>{getSubjectName(task.subjectId)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 今日のイベント */}
        <div className="card" style={{ padding: '12px 14px' }}>
          <SectionLabel color="var(--sky)">今日のイベント</SectionLabel>
          {todayEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-ghost)', margin: 0 }}>今日の予定はありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {todayEvents.map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--divider)' }}>
                  <div style={{ minWidth: 44, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ev.color }}>{ev.startTime ?? '終日'}</div>
                    {ev.endTime && <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>〜{ev.endTime}</div>}
                  </div>
                  <div style={{ width: 3, alignSelf: 'stretch', minHeight: 24, borderRadius: 2, backgroundColor: ev.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                    {ev.location && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>📍 {ev.location}</div>}
                  </div>
                  <span style={{ fontSize: 10, color: ev.color, flexShrink: 0 }}>{EVENT_TYPE_LABELS[ev.type]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── メイングリッド ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── 左カラム：ドーナツ ── */}
        <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <DonutChart value={completionRate} size={180} strokeWidth={16} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}><GradientText>{completionRate}%</GradientText></div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>達成率</span>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-dim)' }}>
            <span>完了 <span style={{ color: 'var(--emerald-light)', fontWeight: 700 }}>{completedTasks.length}</span> 件</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>未完了 <span style={{ color: 'var(--text-strong)', fontWeight: 700 }}>{tasks.length - completedTasks.length}</span> 件</span>
          </div>
          {tasks.length === 0 && (
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-ghost)', textAlign: 'center' }}>タスクがまだ登録されていません</p>
          )}
        </div>

        {/* ── 右カラム：要確認 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 要確認 */}
          {(upcomingAlerts.length > 0 || subjectRemaining.length > 0) && (
            <div className="card" style={{ padding: '12px 14px', borderTop: '2px solid #f97316' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <AlertTriangle size={13} color="#f97316" />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f97316' }}>要確認</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {upcomingAlerts.map(item => {
                  const urgent = item.daysLeft <= 1
                  const soon = item.daysLeft <= 3
                  const badgeColor = urgent ? '#ef4444' : soon ? '#f97316' : '#eab308'
                  const dayLabel = item.daysLeft === 0 ? '今日' : item.daysLeft === 1 ? '明日' : `あと${item.daysLeft}日`
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--divider)' }}>
                      <div style={{ width: 3, height: 28, borderRadius: 2, backgroundColor: item.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{item.label}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: badgeColor + '20', color: badgeColor, border: `1px solid ${badgeColor}40`, flexShrink: 0 }}>{dayLabel}</span>
                    </div>
                  )
                })}
                {subjectRemaining.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--divider)' }}>
                    <div style={{ width: 3, height: 22, borderRadius: 2, backgroundColor: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {item.reportRem > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 9999, background: '#0ea5e918', color: '#0ea5e9', border: '1px solid #0ea5e940' }}>レポあと{item.reportRem}本</span>}
                      {item.sessionRem > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 9999, background: '#8b5cf618', color: '#a78bfa', border: '1px solid #8b5cf640' }}>出席あと{item.sessionRem}回</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
