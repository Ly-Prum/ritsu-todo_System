'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils'
import type { AppEvent, Priority, TaskStatus } from '@/lib/types'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CalendarDays, Plus, X } from 'lucide-react'
import { useT } from '@/hooks/useT'

export default function CalendarPage() {
  const { tasks, subjects, events, language, addTask, addEvent } = useStore()
  const t = useT()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addMode, setAddMode] = useState<'task' | 'event' | null>(null)
  const [quickTitle, setQuickTitle] = useState('')
  const [quickSubjectId, setQuickSubjectId] = useState('')
  const [quickEventType, setQuickEventType] = useState<AppEvent['type']>('event')
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set())
  const toggleEventExpand = (id: string) => setExpandedEventIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  function submitQuick() {
    if (!quickTitle.trim() || !selectedDate) return
    if (addMode === 'task') {
      addTask({ title: quickTitle.trim(), dueDate: selectedDate, priority: 'medium', status: 'pending', type: 'homework', subjectId: quickSubjectId || undefined })
    } else if (addMode === 'event') {
      addEvent({ title: quickTitle.trim(), date: selectedDate, type: quickEventType, color: { schooling: '#0ea5e9', exam: '#ef4444', event: '#10b981', meeting: '#8b5cf6', other: '#8a92a6' }[quickEventType] })
    }
    setQuickTitle('')
    setQuickSubjectId('')
    setAddMode(null)
  }

  const today = new Date().toISOString().split('T')[0]

  const tPriority = (p: Priority) => ({ low: t('priority_low'), medium: t('priority_medium'), high: t('priority_high') }[p])
  const tStatus = (s: TaskStatus) => ({ pending: t('status_pending'), 'in-progress': t('status_inprogress'), completed: t('status_completed') }[s])
  const tEventType = (tp: AppEvent['type']) => ({
    schooling: t('event_schooling'), exam: t('event_exam'), event: t('event_event'),
    meeting: t('event_meeting'), other: t('type_other'),
  }[tp])

  const WEEKDAYS = [t('day_sun'), t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'), t('day_fri'), t('day_sat')]

  const monthYearLabel = language === 'ja'
    ? `${year}年${month + 1}月`
    : new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: string; day: number; otherMonth: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const m = month === 0 ? 12 : month
    const y = month === 0 ? year - 1 : year
    cells.push({ date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day: d, otherMonth: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day: d, otherMonth: false })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2
    const y = month === 11 ? year + 1 : year
    cells.push({ date: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day: d, otherMonth: true })
  }

  const tasksByDate = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    acc[task.dueDate] = [...(acc[task.dueDate] ?? []), task]
    return acc
  }, {})

  const eventsByDate = events.reduce<Record<string, AppEvent[]>>((acc, ev) => {
    acc[ev.date] = [...(acc[ev.date] ?? []), ev]
    return acc
  }, {})

  const getSubjectColor = (id?: string) => subjects.find(s => s.id === id)?.color ?? '#8a92a6'
  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] ?? []) : []
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : []
  const hasItems = selectedTasks.length > 0 || selectedEvents.length > 0

  function handleDateClick(date: string) {
    if (date === selectedDate) {
      setSelectedDate(null)
      setAddMode(null)
      setQuickTitle('')
    } else {
      setSelectedDate(date)
      setAddMode(null)
      setQuickTitle('')
    }
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t('cal_title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-secondary" onClick={prevMonth} style={{ padding: '6px 10px' }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 120, textAlign: 'center' }}>
            {monthYearLabel}
          </span>
          <button className="btn-secondary" onClick={nextMonth} style={{ padding: '6px 10px' }}><ChevronRight size={16} /></button>
          <button className="btn-ghost" onClick={() => { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()) }} style={{ fontSize: 12 }}>
            {t('cal_today')}
          </button>
        </div>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 280px' : '1fr', gap: 20 }}>
        <div>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
            {WEEKDAYS.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontSize: 15, fontWeight: 700, padding: '10px 0',
                color: i === 0 ? '#ef4444' : i === 6 ? 'var(--sky)' : 'var(--text)',
                background: 'rgba(15,15,20,0.65)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                borderRadius: 6,
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden', minHeight: 'calc(100vh - 200px)' }}>
            {cells.map(({ date, day, otherMonth }, i) => {
              const dayTasks = tasksByDate[date] ?? []
              const dayEvents = eventsByDate[date] ?? []
              const isToday = date === today
              const isSelected = date === selectedDate
              const weekday = i % 7

              return (
                <div
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className={`calendar-day ${isToday ? 'today' : ''} ${otherMonth ? 'other-month' : ''}`}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(16,185,129,0.18)' : isToday ? 'rgba(16,185,129,0.08)' : 'rgba(15,15,20,0.55)',
                    borderColor: isSelected ? 'var(--emerald)' : isToday ? 'var(--emerald)' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{
                    fontSize: 15, fontWeight: isToday ? 700 : 500,
                    color: isToday ? 'var(--emerald)' : weekday === 0 ? '#ef4444' : weekday === 6 ? 'var(--sky)' : 'var(--text)',
                    marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {isToday && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)', flexShrink: 0 }} />}
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {dayTasks.slice(0, 3).map(task => (
                      <div key={task.id} style={{
                        fontSize: 11, padding: '2px 5px', borderRadius: 3,
                        background: getSubjectColor(task.subjectId) + '30',
                        borderLeft: `2px solid ${getSubjectColor(task.subjectId)}`,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        opacity: task.status === 'completed' ? 0.5 : 1,
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </div>
                    ))}
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id} style={{
                        fontSize: 11, padding: '2px 5px', borderRadius: 3,
                        background: ev.color + '30',
                        display: 'flex', alignItems: 'center', gap: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: 7, height: 7, borderRadius: 1, background: ev.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>
                      </div>
                    ))}
                    {(dayTasks.length + dayEvents.length) > 6 && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 4 }}>
                        +{dayTasks.length + dayEvents.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected date panel */}
        {selectedDate && (
          <div className="card" style={{ padding: 20, alignSelf: 'flex-start', position: 'sticky', top: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarDays size={15} color="var(--emerald)" />
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' })}
            </h3>

            {/* 既存イベント */}
            {selectedEvents.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{t('cal_events_label')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedEvents.map(ev => (
                    <div key={ev.id} className="card-2" style={{ borderLeft: `3px solid ${ev.color}`, overflow: 'hidden' }}>
                      <div
                        onClick={() => toggleEventExpand(ev.id)}
                        style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {tEventType(ev.type)}
                            {ev.startTime && ` · ${ev.startTime}${ev.endTime ? `〜${ev.endTime}` : ''}`}
                            {ev.location && ` · ${ev.location}`}
                          </div>
                        </div>
                        {ev.description && (
                          expandedEventIds.has(ev.id)
                            ? <ChevronUp size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                            : <ChevronDown size={13} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
                        )}
                      </div>
                      {ev.description && expandedEventIds.has(ev.id) && (
                        <div style={{ padding: '0 12px 10px', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {ev.description}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 既存タスク */}
            {selectedTasks.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {selectedEvents.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{t('cal_tasks_label')}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedTasks.map(task => (
                    <div key={task.id} className="card-2" style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, flex: 1, textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>{task.title}</div>
                        <span className={`badge ${PRIORITY_COLORS[task.priority]}`} style={{ fontSize: 10, flexShrink: 0 }}>{tPriority(task.priority)}</span>
                      </div>
                      {subjects.find(s => s.id === task.subjectId) && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: getSubjectColor(task.subjectId), marginRight: 5 }} />
                          {subjects.find(s => s.id === task.subjectId)?.name}
                        </div>
                      )}
                      <span className={`badge ${STATUS_COLORS[task.status]}`} style={{ fontSize: 10, marginTop: 4 }}>{tStatus(task.status)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasItems && !addMode && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>{t('cal_no_schedule')}</div>
            )}

            {/* インライン追加フォーム */}
            {addMode ? (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: addMode === 'task' ? 'var(--emerald)' : 'var(--sky)' }}>
                  {addMode === 'task' ? '✅ 課題を追加' : '📌 イベントを追加'}
                </div>
                <input
                  className="input"
                  placeholder={addMode === 'task' ? '課題名...' : 'イベント名...'}
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitQuick()}
                  autoFocus
                  style={{ fontSize: 13 }}
                />
                {addMode === 'task' ? (
                  <select className="input" value={quickSubjectId} onChange={e => setQuickSubjectId(e.target.value)} style={{ fontSize: 13 }}>
                    <option value="">科目（任意）</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <select className="input" value={quickEventType} onChange={e => setQuickEventType(e.target.value as AppEvent['type'])} style={{ fontSize: 13 }}>
                    <option value="event">イベント</option>
                    <option value="schooling">スクーリング</option>
                    <option value="exam">試験</option>
                    <option value="meeting">面談</option>
                    <option value="other">その他</option>
                  </select>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-primary" onClick={submitQuick} disabled={!quickTitle.trim()} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>追加</button>
                  <button className="btn-ghost" onClick={() => { setAddMode(null); setQuickTitle('') }} style={{ padding: '6px 10px' }}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={() => { setAddMode('task'); setQuickTitle('') }} style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}>
                  <Plus size={12} /> 課題
                </button>
                <button className="btn-ghost" onClick={() => { setAddMode('event'); setQuickTitle('') }} style={{ flex: 1, fontSize: 12, justifyContent: 'center' }}>
                  <Plus size={12} /> イベント
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
