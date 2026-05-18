'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { DAY_LABELS } from '@/lib/utils'
import type { DayOfWeek, TimetableSlot } from '@/lib/types'
import { Plus, X, Trash2, Settings } from 'lucide-react'
import GradientText from '@/components/GradientText'

const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5]

export default function TimetablePage() {
  const { subjects, timetable, periods, addSlot, updateSlot, deleteSlot, updatePeriods } = useStore()
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [editSlot, setEditSlot] = useState<TimetableSlot | null>(null)
  const [slotForm, setSlotForm] = useState({ subjectId: '', dayOfWeek: 1 as DayOfWeek, period: 1, room: '', credits: '' })
  const [showPeriodSettings, setShowPeriodSettings] = useState(false)
  const [editPeriods, setEditPeriods] = useState(() => [...periods])

  function openSlotForm(day: DayOfWeek, period: number) {
    const existing = timetable.find(s => s.dayOfWeek === day && s.period === period)
    if (existing) {
      setEditSlot(existing)
      setSlotForm({ subjectId: existing.subjectId, dayOfWeek: existing.dayOfWeek, period: existing.period, room: existing.room ?? '', credits: existing.credits?.toString() ?? '' })
    } else {
      setEditSlot(null)
      setSlotForm({ subjectId: subjects[0]?.id ?? '', dayOfWeek: day, period, room: '', credits: '' })
    }
    setShowSlotForm(true)
  }

  function saveSlot() {
    if (!slotForm.subjectId) return
    const creditsNum = slotForm.credits ? Number(slotForm.credits) : undefined
    if (editSlot) {
      updateSlot(editSlot.id, { subjectId: slotForm.subjectId, dayOfWeek: slotForm.dayOfWeek, period: slotForm.period, room: slotForm.room || undefined, credits: creditsNum })
    } else {
      addSlot({ subjectId: slotForm.subjectId, dayOfWeek: slotForm.dayOfWeek, period: slotForm.period, room: slotForm.room || undefined, credits: creditsNum })
    }
    setShowSlotForm(false)
  }

  function deleteSlotHandler() {
    if (editSlot) { deleteSlot(editSlot.id); setShowSlotForm(false) }
  }

  function savePeriods() {
    updatePeriods(editPeriods)
    setShowPeriodSettings(false)
  }

  const getSlot = (day: DayOfWeek, period: number) => timetable.find(s => s.dayOfWeek === day && s.period === period)
  const getSubject = (id: string) => subjects.find(s => s.id === id)

  return (
    <div style={{ padding: '20px 14px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}><GradientText>時間割</GradientText></h1>
        <button className="btn-secondary" onClick={() => { setEditPeriods([...periods]); setShowPeriodSettings(true) }}>
          <Settings size={14} /> 時限設定
        </button>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{
        borderRadius: 12, overflow: 'hidden', minWidth: 480,
        minHeight: 'calc(100vh - 160px)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(15,15,20,0.55)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '14px 8px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>時限</div>
          {WEEKDAYS.map(d => (
            <div key={d} style={{
              padding: '14px 8px', fontSize: 16, fontWeight: 700, textAlign: 'center',
              color: d === 6 ? 'var(--sky)' : 'var(--text)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}>
              {DAY_LABELS[d]}
            </div>
          ))}
        </div>

        {/* Rows */}
        {periods.map(p => (
          <div key={p.period} style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)', flex: 1 }}>
            {/* Period label */}
            <div style={{
              padding: '10px 8px', fontSize: 12, textAlign: 'center', color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{p.period}</span>
              <span style={{ fontSize: 12 }}>{p.startTime}</span>
              <span style={{ fontSize: 12 }}>{p.endTime}</span>
            </div>

            {/* Cells */}
            {WEEKDAYS.map(d => {
              const slot = getSlot(d, p.period)
              const subject = slot ? getSubject(slot.subjectId) : null
              return (
                <div
                  key={d}
                  onClick={() => openSlotForm(d, p.period)}
                  className={`timetable-cell ${!slot ? 'empty' : ''}`}
                  style={{
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: subject ? `${subject.color}18` : 'transparent', forcedColorAdjust: 'none',
                    borderTop: subject ? `3px solid ${subject.color}` : undefined,
                  }}
                >
                  {subject ? (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: subject.color }}>{subject.name}</div>
                      {slot?.room && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{slot.room}</div>}
                      {slot?.credits && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{slot.credits}単位</div>}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      <Plus size={16} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      </div>{/* /overflow-x scroll wrapper */}

      {/* Subject legend */}
      {subjects.length > 0 && (
        <div className="card" style={{ padding: '14px 16px', marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {subjects.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.color, forcedColorAdjust: 'none' } as React.CSSProperties} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Slot Form */}
      {showSlotForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSlotForm(false)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {DAY_LABELS[slotForm.dayOfWeek]}曜日 {slotForm.period}限
              </h2>
              <button className="btn-ghost" onClick={() => setShowSlotForm(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">科目 *</label>
                <select className="input" value={slotForm.subjectId} onChange={e => setSlotForm(f => ({ ...f, subjectId: e.target.value }))}>
                  <option value="">選択してください</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {subjects.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>先に「課題・タスク」ページで科目を追加してください</div>
                )}
              </div>
              <div>
                <label className="label">教室</label>
                <input className="input" value={slotForm.room} onChange={e => setSlotForm(f => ({ ...f, room: e.target.value }))} placeholder="例: 3-A, 理科室..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'space-between' }}>
              {editSlot && (
                <button className="btn-danger" onClick={deleteSlotHandler}><Trash2 size={14} /> 削除</button>
              )}
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button className="btn-secondary" onClick={() => setShowSlotForm(false)}>キャンセル</button>
                <button className="btn-primary" onClick={saveSlot} disabled={!slotForm.subjectId}>{editSlot ? '更新' : '登録'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Settings */}
      {showPeriodSettings && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPeriodSettings(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>時限の開始・終了時刻</h2>
              <button className="btn-ghost" onClick={() => setShowPeriodSettings(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {editPeriods.map((p, i) => (
                <div key={p.period} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>{p.period}限</span>
                  <input className="input" type="time" value={p.startTime} onChange={e => setEditPeriods(ps => ps.map((x, j) => j === i ? { ...x, startTime: e.target.value } : x))} />
                  <input className="input" type="time" value={p.endTime} onChange={e => setEditPeriods(ps => ps.map((x, j) => j === i ? { ...x, endTime: e.target.value } : x))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowPeriodSettings(false)}>キャンセル</button>
              <button className="btn-primary" onClick={savePeriods}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
