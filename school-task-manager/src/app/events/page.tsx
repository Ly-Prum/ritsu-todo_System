'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { EVENT_TYPE_LABELS, EVENT_COLORS } from '@/lib/utils'
import type { AppEvent } from '@/lib/types'
import { Plus, X, Pencil, Trash2, CalendarCheck, MapPin, Bell, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import GradientText from '@/components/GradientText'

type EventType = AppEvent['type']
type FilterType = 'all' | EventType

const emptyForm = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  startTime: '',
  endTime: '',
  type: 'event' as EventType,
  location: '',
  color: EVENT_COLORS[0],
  alarmMinutesBefore: '' as string,
  createMemo: false,
}

const ALARM_OPTIONS = [
  { value: '', label: 'なし' },
  { value: '0', label: '当日朝' },
  { value: '60', label: '1時間前' },
  { value: '1440', label: '1日前' },
  { value: '4320', label: '3日前' },
]

function formatDate(date: string) {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function isUpcoming(date: string) {
  const today = new Date().toISOString().split('T')[0]
  const end = new Date()
  end.setDate(end.getDate() + 7)
  const endStr = end.toISOString().split('T')[0]
  return date >= today && date <= endStr
}

export default function EventsPage() {
  const { events, addEvent, updateEvent, deleteEvent, addMemo } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) => setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const [quickTitle, setQuickTitle] = useState('')
  const [quickDate, setQuickDate] = useState('')
  const [quickStartTime, setQuickStartTime] = useState('')
  const [quickEndTime, setQuickEndTime] = useState('')
  const [quickType, setQuickType] = useState<EventType>('event')
  const quickDateRef = useRef<HTMLInputElement>(null)
  const quickStartRef = useRef<HTMLInputElement>(null)

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const filtered = filterType === 'all' ? sorted : sorted.filter(e => e.type === filterType)
  const upcoming = sorted.filter(e => isUpcoming(e.date))

  function openEdit(ev: AppEvent) {
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      date: ev.date,
      endDate: ev.endDate ?? '',
      startTime: ev.startTime ?? '',
      endTime: ev.endTime ?? '',
      type: ev.type,
      location: ev.location ?? '',
      color: ev.color,
      alarmMinutesBefore: ev.alarmMinutesBefore !== undefined ? String(ev.alarmMinutesBefore) : '',
      createMemo: false,
    })
    setEditId(ev.id)
    setShowForm(true)
  }

  function save() {
    if (!form.title.trim() || !form.date) return
    const data: Omit<AppEvent, 'id' | 'createdAt'> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      endDate: form.endDate || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      type: form.type,
      location: form.location.trim() || undefined,
      color: form.color,
      alarmMinutesBefore: form.alarmMinutesBefore !== '' ? Number(form.alarmMinutesBefore) : undefined,
    }
    if (editId) {
      updateEvent(editId, data)
    } else {
      addEvent(data)
      if (form.createMemo) {
        addMemo({
          title: form.title.trim(),
          content: form.description.trim() || '',
          category: 'イベント',
          isPinned: false,
          color: form.color,
        })
      }
    }
    setShowForm(false)
  }

  function quickAdd() {
    if (!quickTitle.trim() || !quickDate) return
    addEvent({
      title: quickTitle.trim(),
      date: quickDate,
      startTime: quickStartTime || undefined,
      endTime: quickEndTime || undefined,
      type: quickType,
      color: typeColors[quickType] ?? EVENT_COLORS[0],
    })
    setQuickTitle('')
    setQuickDate('')
    setQuickStartTime('')
    setQuickEndTime('')
  }

  const typeColors: Record<EventType, string> = {
    schooling: '#0ea5e9',
    exam: '#ef4444',
    event: '#10b981',
    meeting: '#8b5cf6',
    other: '#8a92a6',
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 4 }}>
          <GradientText>イベント管理</GradientText>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          スクーリング・試験・イベントを管理
        </p>
      </div>

      {/* イベント追加バー */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', borderColor: 'rgba(16,185,129,0.25)' }}>
        <input
          className="input"
          placeholder="イベント名を入力..."
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickDateRef.current?.focus()}
          style={{ flex: 2, minWidth: 180 }}
        />
        <select
          className="input"
          value={quickType}
          onChange={e => setQuickType(e.target.value as EventType)}
          style={{ flex: 1, minWidth: 120 }}
        >
          {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          ref={quickDateRef}
          className="input"
          type="date"
          value={quickDate}
          onChange={e => setQuickDate(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickStartRef.current?.focus()}
          style={{ flex: 1, minWidth: 140 }}
        />
        <input
          ref={quickStartRef}
          className="input"
          type="time"
          value={quickStartTime}
          onChange={e => setQuickStartTime(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickAdd()}
          style={{ flex: 1, minWidth: 110 }}
          title="開始時間（任意）"
        />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>〜</span>
        <input
          className="input"
          type="time"
          value={quickEndTime}
          onChange={e => setQuickEndTime(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickAdd()}
          style={{ flex: 1, minWidth: 110 }}
          title="終了時間（任意）"
        />
        <button
          className="btn-primary"
          onClick={quickAdd}
          disabled={!quickTitle.trim() || !quickDate}
          style={{ flexShrink: 0 }}
        >
          <Plus size={14} /> 追加
        </button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 20, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarCheck size={15} />
            今後7日間のイベント
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(ev => (
              <div key={ev.id} className="card-2" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: `4px solid ${ev.color}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {formatDate(ev.date)}{ev.location && ` · ${ev.location}`}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                  background: typeColors[ev.type] + '25', color: typeColors[ev.type],
                  border: `1px solid ${typeColors[ev.type]}40`,
                }}>
                  {EVENT_TYPE_LABELS[ev.type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'schooling', 'exam', 'event', 'meeting', 'other'] as FilterType[]).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: filterType === t
                ? 'linear-gradient(135deg, var(--emerald), var(--sky))'
                : 'var(--surface-2)',
              color: filterType === t ? 'white' : 'var(--text-muted)',
            }}
          >
            {t === 'all' ? '全て' : EVENT_TYPE_LABELS[t]}
            {t !== 'all' && (
              <span style={{ marginLeft: 5, opacity: 0.8 }}>
                ({events.filter(e => e.type === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Event list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CalendarCheck size={40} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--emerald)' }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>イベントがありません</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>スクーリングや試験、イベントを登録しましょう</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>上の入力欄からイベントを追加できます</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(ev => {
            const today = new Date().toISOString().split('T')[0]
            const isPast = ev.date < today
            return (
              <div
                key={ev.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${ev.color}`,
                  opacity: isPast ? 0.6 : 1,
                  overflow: 'hidden',
                }}
              >
                {/* Header row — click to expand */}
                <div
                  onClick={() => toggleExpand(ev.id)}
                  style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{ev.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                        background: typeColors[ev.type] + '25', color: typeColors[ev.type],
                        border: `1px solid ${typeColors[ev.type]}40`,
                      }}>
                        {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                      {ev.alarmMinutesBefore !== undefined && (
                        <Bell size={12} color="var(--text-muted)" />
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={15} color="var(--sky-light)" style={{ flexShrink: 0 }} />
                        {formatDate(ev.date)}{ev.endDate && ev.endDate !== ev.date ? ` 〜 ${formatDate(ev.endDate)}` : ''}
                      </span>
                      {(ev.startTime || ev.endTime) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={15} color="var(--sky-light)" style={{ flexShrink: 0 }} />
                          {ev.startTime}{ev.endTime ? ` 〜 ${ev.endTime}` : ''}
                        </span>
                      )}
                      {ev.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} /> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {ev.description && (
                      expandedIds.has(ev.id) ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />
                    )}
                    <button
                      className="btn-secondary"
                      onClick={e => { e.stopPropagation(); openEdit(ev) }}
                      style={{ padding: '6px 10px', fontSize: 12 }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="btn-danger"
                      onClick={e => { e.stopPropagation(); if (confirm('削除しますか？')) deleteEvent(ev.id) }}
                      style={{ padding: '6px 10px', fontSize: 12 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {/* Expanded description */}
                {ev.description && expandedIds.has(ev.id) && (
                  <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {ev.description}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {editId ? 'イベントを編集' : '新しいイベントを追加'}
              </h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">タイトル *</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="イベント名" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">種別</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}>
                    {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(k => (
                      <option key={k} value={k}>{EVENT_TYPE_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">アラーム</label>
                  <select className="input" value={form.alarmMinutesBefore} onChange={e => setForm(f => ({ ...f, alarmMinutesBefore: e.target.value }))}>
                    {ALARM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">開始日 *</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">終了日（任意）</label>
                  <input className="input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">開始時間（任意）</label>
                  <input className="input" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label className="label">終了時間（任意）</label>
                  <input className="input" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">場所</label>
                <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="例: 東京会場、Zoom..." />
              </div>
              <div>
                <label className="label">説明・メモ</label>
                <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="詳細..." rows={2} />
              </div>
              <div>
                <label className="label">カラー</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {EVENT_COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
                      border: form.color === c ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                    }}>
                      <span style={{ display: 'block', width: '100%', height: '100%', background: c }} />
                    </div>
                  ))}
                </div>
              </div>
              {!editId && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={form.createMemo}
                    onChange={e => setForm(f => ({ ...f, createMemo: e.target.checked }))}
                    style={{ accentColor: 'var(--emerald)', width: 16, height: 16 }}
                  />
                  メモも同時に作成する
                </label>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>キャンセル</button>
              <button className="btn-primary" onClick={save} disabled={!form.title.trim() || !form.date}>
                {editId ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
