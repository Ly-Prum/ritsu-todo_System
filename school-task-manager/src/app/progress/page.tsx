'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'

import { BookOpen, CheckCircle2, Users, GraduationCap, Pencil, Check, X, ChevronDown, Trash2 } from 'lucide-react'

function ProgressBar({ value, color = 'var(--emerald)' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: 'var(--progress-track)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 3,
        background: color,
        width: `${Math.min(100, value)}%`,
        transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

function pct(done: number, total: number) {
  if (!total) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

function statusColor(_p: number) {
  return '#a8b4c0'
}

type EditForm = { totalReports: string; totalSessions: string; attendedSessions: string }

export default function ProgressPage() {
  const { subjects, tasks, updateSubject, deleteSubject } = useStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm>({ totalReports: '', totalSessions: '', attendedSessions: '' })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function enterDeleteMode() {
    setDeleteMode(true)
    setSelectedIds(new Set())
    setEditId(null)
  }

  function exitDeleteMode() {
    setDeleteMode(false)
    setSelectedIds(new Set())
  }

  function deleteSelected() {
    selectedIds.forEach(id => deleteSubject(id))
    exitDeleteMode()
  }

  function openEdit(sub: typeof subjects[0], attended: number, totalReports: number, totalSessions: number) {
    setEditId(sub.id)
    setForm({
      totalReports: String(totalReports || ''),
      totalSessions: String(totalSessions || ''),
      attendedSessions: String(attended || ''),
    })
  }

  function saveEdit(id: string) {
    updateSubject(id, {
      totalReports: form.totalReports ? Number(form.totalReports) : undefined,
      totalSessions: form.totalSessions ? Number(form.totalSessions) : undefined,
      attendedSessions: form.attendedSessions ? Number(form.attendedSessions) : 0,
    })
    setEditId(null)
  }

  const subjectStats = subjects.map(sub => {
    const subTasks = tasks.filter(t => t.subjectId === sub.id)
    const reportTasks = subTasks.filter(t => t.type === 'report')
    const submittedReports = reportTasks.filter(t => t.status === 'completed').length
    const totalReports = sub.totalReports ?? reportTasks.length
    const reportPct = pct(submittedReports, totalReports)

    const attended = sub.attendedSessions ?? 0
    const totalSessions = sub.totalSessions ?? 0
    const sessionPct = pct(attended, totalSessions)

    const overallPct = Math.round(
      ((totalReports > 0 ? reportPct : 100) + (totalSessions > 0 ? sessionPct : 100)) / 2
    )

    return { sub, submittedReports, totalReports, reportPct, attended, totalSessions, sessionPct, overallPct }
  }).sort((a, b) => a.overallPct - b.overallPct)

  if (subjects.length === 0) {
    return (
      <div style={{ padding: '16px 14px', maxWidth: 1600 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 16px', color: 'var(--text)' }}>教科別進捗</h1>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
          <GraduationCap size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>科目が登録されていません</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>レポートページから科目を追加してください</p>
        </div>
      </div>
    )
  }

  const allExpanded = subjectStats.every(s => expandedIds.has(s.sub.id))

  function toggleAll() {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(subjectStats.map(s => s.sub.id)))
    }
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, width: '100%' }}>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text)' }}>教科別進捗</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, flex: 1 }}>{subjects.length}科目</span>
        {deleteMode ? (
          <>
            <button
              type="button"
              className="btn-danger"
              onClick={deleteSelected}
              disabled={selectedIds.size === 0}
              style={{ fontSize: 12, padding: '4px 12px', opacity: selectedIds.size === 0 ? 0.4 : 1 }}
            >
              <Trash2 size={12} /> 削除する ({selectedIds.size})
            </button>
            <button type="button" className="btn-ghost" onClick={exitDeleteMode} style={{ fontSize: 12, padding: '4px 10px' }}>
              <X size={12} /> キャンセル
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-secondary" onClick={toggleAll} style={{ fontSize: 12, padding: '4px 12px' }}>
              {allExpanded ? '全て折りたたむ' : '全て展開'}
            </button>
            <button type="button" className="btn-ghost" onClick={enterDeleteMode} style={{ fontSize: 12, padding: '4px 10px', color: '#ef4444' }}>
              <Trash2 size={12} /> 削除
            </button>
          </>
        )}
      </div>

      {/* Overview summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: '登録科目', value: subjects.length, icon: BookOpen, color: 'var(--sky)' },
          { label: '順調', value: subjectStats.filter(s => s.overallPct >= 70).length, icon: CheckCircle2, color: 'var(--emerald)' },
          { label: '要注意', value: subjectStats.filter(s => s.overallPct < 40).length, icon: Users, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon size={16} color={color} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {subjectStats.map(({ sub, submittedReports, totalReports, reportPct, attended, totalSessions, sessionPct, overallPct }) => {
          const oc = statusColor(overallPct)
          const isEditing = editId === sub.id
          const isExpanded = expandedIds.has(sub.id)
          const isSelected = selectedIds.has(sub.id)
          return (
            <div key={sub.id} className="card" style={{
              borderLeft: `4px solid ${isSelected ? '#ef4444' : sub.color}`,
              borderRadius: 10,
              overflow: 'hidden',
              padding: 0,
              outline: isSelected ? '2px solid rgba(239,68,68,0.4)' : 'none',
            }}>
              {/* Clickable header row */}
              <div
                onClick={() => {
                  if (deleteMode) { toggleSelect(sub.id); return }
                  if (!isEditing) toggleExpand(sub.id)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
              >
                {/* Checkbox in delete mode */}
                {deleteMode && (
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${isSelected ? '#ef4444' : 'var(--border)'}`,
                    background: isSelected ? '#ef4444' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <Check size={11} color="white" />}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</div>
                  {sub.teacher && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub.teacher}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {/* inline badges: report / session */}
                  {totalReports > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: `${statusColor(reportPct)}33`, color: statusColor(reportPct), border: `1px solid ${statusColor(reportPct)}99` }}>
                      レポ {submittedReports}/{totalReports}
                    </span>
                  )}
                  {totalSessions > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: `${statusColor(sessionPct)}33`, color: statusColor(sessionPct), border: `1px solid ${statusColor(sessionPct)}99` }}>
                      出席 {attended}/{totalSessions}
                    </span>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 800, color: oc, minWidth: 38, textAlign: 'right' }}>{overallPct}%</span>
                  {!deleteMode && (
                    <>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openEdit(sub, attended, totalReports, totalSessions) }}
                        title="編集"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '2px', lineHeight: 1 }}
                      >
                        <Pencil size={12} />
                      </button>
                      <ChevronDown size={14} style={{ color: 'var(--text-dim)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </>
                  )}
                </div>
              </div>

              {/* Thin progress bar always visible */}
              {!deleteMode && <ProgressBar value={overallPct} color={oc} />}

              {/* Expandable detail */}
              {isExpanded && !deleteMode && (
                <div style={{ padding: '10px 14px' }}>
                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="card-2" style={{ borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, margin: '0 0 8px' }}>数値を入力してください</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--text-dim)', display: 'block', marginBottom: 3 }}>レポート合計</label>
                          <input type="number" min="0" className="input" value={form.totalReports}
                            onChange={e => setForm(f => ({ ...f, totalReports: e.target.value }))}
                            style={{ padding: '5px 8px', fontSize: 13 }} placeholder="例: 8" />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--text-dim)', display: 'block', marginBottom: 3 }}>スクーリング合計</label>
                          <input type="number" min="0" className="input" value={form.totalSessions}
                            onChange={e => setForm(f => ({ ...f, totalSessions: e.target.value }))}
                            style={{ padding: '5px 8px', fontSize: 13 }} placeholder="例: 5" />
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--text-dim)', display: 'block', marginBottom: 3 }}>出席済み回数</label>
                          <input type="number" min="0" className="input" value={form.attendedSessions}
                            onChange={e => setForm(f => ({ ...f, attendedSessions: e.target.value }))}
                            style={{ padding: '5px 8px', fontSize: 13 }} placeholder="例: 3" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button type="button" className="btn-primary" onClick={() => saveEdit(sub.id)} style={{ padding: '5px 14px', fontSize: 12 }}>
                          <Check size={12} /> 保存
                        </button>
                        <button type="button" className="btn-ghost" onClick={() => setEditId(null)} style={{ padding: '5px 10px', fontSize: 12 }}>
                          <X size={12} /> キャンセル
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Detail rows */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700 }}>レポート</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(reportPct) }}>
                          {submittedReports}/{totalReports}
                          {totalReports > submittedReports && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginLeft: 5 }}>
                              あと{totalReports - submittedReports}本
                            </span>
                          )}
                        </span>
                      </div>
                      <ProgressBar value={reportPct} color={statusColor(reportPct)} />
                    </div>
                    {totalSessions > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700 }}>出席</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(sessionPct) }}>
                            {attended}/{totalSessions}
                            {totalSessions > attended && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginLeft: 5 }}>
                                あと{totalSessions - attended}回
                              </span>
                            )}
                          </span>
                        </div>
                        <ProgressBar value={sessionPct} color={statusColor(sessionPct)} />
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  {(sub.credits || sub.hasExam || overallPct >= 100) && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {sub.credits && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 9999, background: 'var(--surface-2)', color: 'var(--text-medium)', border: '1px solid var(--border)' }}>
                          {sub.credits}単位
                        </span>
                      )}
                      {sub.hasExam && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 9999, background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}>
                          試験あり
                        </span>
                      )}
                      {overallPct >= 100 && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 9999, background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}>
                          ✓ 完了
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
