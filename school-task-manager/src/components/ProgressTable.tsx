'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Subject } from '@/lib/types'

// ─── N Lobbyプリセット ──────────────────────────────────────────────
const NLOBBY_SUBJECTS: Array<Omit<Subject, 'id'>> = [
  { name: '現代の国語',             color: '#ef4444', totalReports: 6,  totalSessions: 2, registeredSessions: 2 },
  { name: '言語文化',               color: '#f97316', totalReports: 9,  totalSessions: 2, registeredSessions: 2 },
  { name: '地理総合',               color: '#eab308', totalReports: 6,  totalSessions: 2, registeredSessions: 2 },
  { name: '歴史総合',               color: '#84cc16', totalReports: 6,  totalSessions: 2, registeredSessions: 2 },
  { name: '公共',                   color: '#22c55e', totalReports: 6,  totalSessions: 2, registeredSessions: 2 },
  { name: '数学I',                  color: '#06b6d4', totalReports: 12, totalSessions: 2, registeredSessions: 2 },
  { name: '科学と人間生活',         color: '#3b82f6', totalReports: 6,  totalSessions: 4, registeredSessions: 4 },
  { name: '体育I',                  color: '#8b5cf6', totalReports: 2,  totalSessions: 6, registeredSessions: 6 },
  { name: '英語コミュニケーションI', color: '#ec4899', totalReports: 12, totalSessions: 6, registeredSessions: 6 },
  { name: '家庭基礎',               color: '#f43f5e', totalReports: 4,  totalSessions: 2, registeredSessions: 2 },
  { name: '情報I',                  color: '#14b8a6', totalReports: 4,  totalSessions: 2, registeredSessions: 2 },
  { name: '総合的な探究の時間I',    color: '#a78bfa', totalReports: 1,  totalSessions: 2, registeredSessions: 2, hasExam: false },
  { name: '特別活動I',              color: '#fb923c', totalReports: 1,  totalSessions: 6, registeredSessions: 6, hasExam: false },
]

// ─── ゲージカード ───────────────────────────────────────────────────
function GaugeCard({ label, value, total, color, subtitle }: {
  label: string; value: number; total: number; color: string; subtitle: string
}) {
  const p = total > 0 ? Math.min(value / total, 1) : 0
  const r = 42
  const theta = Math.PI * (1 + p)
  const ex = (50 + r * Math.cos(theta)).toFixed(1)
  const ey = (-r * Math.sin(theta)).toFixed(1)
  const la = p > 0.5 ? 1 : 0
  const pct = total > 0 ? Math.round(p * 100) : 0
  return (
    <div style={{
      background: 'var(--surface-2)', borderRadius: 12, padding: '14px 12px 10px',
      border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textAlign: 'center' }}>{label}</div>
      <svg width="88" height="44" viewBox="4 -6 92 52" style={{ display: 'block' }}>
        <path d="M 8 0 A 42 42 0 0 1 92 0"
          fill="none" stroke="var(--progress-track)" strokeWidth="8" strokeLinecap="round" />
        {p > 0.001 && (
          <path d={`M 8 0 A ${r} ${r} 0 ${la} 1 ${ex} ${ey}`}
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        )}
      </svg>
      <div style={{ fontSize: 20, fontWeight: 800, color, marginTop: 2 }}>{pct}%</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textAlign: 'center' }}>{subtitle}</div>
    </div>
  )
}

// ─── メインコンポーネント ───────────────────────────────────────────
export default function ProgressTable() {
  const { subjects, tasks, updateSubject, addSubject, deleteSubject } = useStore()

  type EditState = {
    id: string
    totalReports: string; submittedReports: string
    totalMonthlyReports: string; submittedMonthlyReports: string
    totalSessions: string; registered: string
    hasExam: boolean
  }
  const [progressEdit, setProgressEdit] = useState<EditState | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function bulkDelete() {
    if (!confirm(`選択した${selectedIds.size}科目を削除しますか？`)) return
    selectedIds.forEach(id => deleteSubject(id))
    setSelectedIds(new Set())
    setDeleteMode(false)
  }

  // ─ サマリー集計 ─
  const totalReportCount = subjects.reduce((sum, s) => sum + (s.totalReports ?? 0), 0)
  const doneReportCount = subjects.reduce((sum, s) => {
    const manual = s.submittedReports
    const fromTasks = tasks.filter(t => t.subjectId === s.id && t.type === 'report' && t.status === 'completed').length
    return sum + (manual !== undefined ? manual : fromTasks)
  }, 0)
  const totalSessionCount = subjects.reduce((sum, s) => sum + (s.totalSessions ?? 0), 0)
  const doneSessionCount = subjects.reduce((sum, s) => sum + (s.registeredSessions ?? 0), 0)
  const examSubjects = subjects.filter(s => s.hasExam !== false)
  const doneExamCount = examSubjects.filter(s =>
    tasks.some(t => t.subjectId === s.id && t.type === 'exam' && t.status === 'completed')).length
  const masteredCount = subjects.filter(s => {
    const manual = s.submittedReports
    const fromTasks = tasks.filter(t => t.subjectId === s.id && t.type === 'report' && t.status === 'completed').length
    const submitted = manual !== undefined ? manual : fromTasks
    const examDone = tasks.some(t => t.subjectId === s.id && t.type === 'exam' && t.status === 'completed')
    const reg = s.registeredSessions ?? 0
    const repDone = s.totalReports != null && submitted >= s.totalReports
    const sessDone = s.totalSessions != null && reg >= s.totalSessions
    return s.hasExam === false ? repDone && sessDone : examDone && repDone && sessDone
  }).length

  // ─ 月別集計 ─
  type MonthEntry = { total: number; done: number; deadline: string; rows: { name: string; color: string; total: number; done: number }[] }
  const byMonth: Record<string, MonthEntry> = {}
  tasks.filter(t => t.type === 'report' && t.dueDate).forEach(t => {
    const ym = t.dueDate!.slice(0, 7)
    const subj = subjects.find(s => s.id === t.subjectId)
    if (!byMonth[ym]) byMonth[ym] = { total: 0, done: 0, deadline: t.dueDate!, rows: [] }
    byMonth[ym].total++
    if (t.status === 'completed') byMonth[ym].done++
    if (t.dueDate! > byMonth[ym].deadline) byMonth[ym].deadline = t.dueDate!
    const subjName = subj?.name ?? '（科目なし）'
    const row = byMonth[ym].rows.find(r => r.name === subjName)
    if (row) { row.total++; if (t.status === 'completed') row.done++ }
    else byMonth[ym].rows.push({ name: subjName, color: subj?.color ?? '#888', total: 1, done: t.status === 'completed' ? 1 : 0 })
  })
  const sortedMonths = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b))
  const todayYM = new Date().toISOString().slice(0, 7)
  const daysLeft = (() => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return Math.ceil((end.getTime() - now.getTime()) / 86400000)
  })()

  function loadPreset() {
    const existingNames = new Set(subjects.map(s => s.name))
    const toAdd = NLOBBY_SUBJECTS.filter(s => !existingNames.has(s.name))
    if (toAdd.length === 0) return
    if (!confirm(`N Lobbyの${toAdd.length}科目を追加しますか？`)) return
    toAdd.forEach(s => addSubject(s))
  }

  function saveProgress() {
    if (!progressEdit) return
    updateSubject(progressEdit.id, {
      totalReports: progressEdit.totalReports ? Number(progressEdit.totalReports) : undefined,
      submittedReports: progressEdit.submittedReports !== '' ? Number(progressEdit.submittedReports) : undefined,
      totalMonthlyReports: progressEdit.totalMonthlyReports ? Number(progressEdit.totalMonthlyReports) : undefined,
      submittedMonthlyReports: progressEdit.submittedMonthlyReports !== '' ? Number(progressEdit.submittedMonthlyReports) : undefined,
      totalSessions: progressEdit.totalSessions ? Number(progressEdit.totalSessions) : undefined,
      registeredSessions: Number(progressEdit.registered) || 0,
      hasExam: progressEdit.hasExam,
    })
    setProgressEdit(null)
  }

  function openEdit(s: Subject) {
    setProgressEdit({
      id: s.id,
      totalReports: s.totalReports?.toString() ?? '',
      submittedReports: s.submittedReports?.toString() ?? '',
      totalMonthlyReports: s.totalMonthlyReports?.toString() ?? '',
      submittedMonthlyReports: s.submittedMonthlyReports?.toString() ?? '',
      totalSessions: s.totalSessions?.toString() ?? '',
      registered: (s.registeredSessions ?? 0).toString(),
      hasExam: s.hasExam !== false,
    })
  }

  const hasUnloaded = NLOBBY_SUBJECTS.some(s => !subjects.find(e => e.name === s.name))

  if (subjects.length === 0) return (
    <div className="card" style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>N Lobbyの13科目を一括登録できます</div>
      <button className="btn-primary" onClick={loadPreset}>N Lobbyプリセットを読み込む</button>
    </div>
  )

  const MonthCard = ([ym, entry]: [string, MonthEntry], highlight: boolean) => {
    const m = ym.split('-')[1]
    const pct = entry.total > 0 ? Math.round(entry.done / entry.total * 100) : 0
    return (
      <div key={ym} className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{m}月のレポート</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              期限 {m}月15日
              {highlight && <span style={{ marginLeft: 8, color: '#f59e0b', fontWeight: 600 }}>あと{daysLeft}日</span>}
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: entry.done >= entry.total ? 'var(--emerald)' : 'var(--text)' }}>
            レポート <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>{entry.done}</span> / {entry.total}
          </span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 10 }}>
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entry.rows.map(r => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: r.color, flexShrink: 0, forcedColorAdjust: 'none' } as React.CSSProperties} />
              <span style={{ flex: 1 }}>{r.name}</span>
              <span style={{ color: r.done >= r.total ? 'var(--emerald)' : 'var(--text)', fontWeight: 600 }}>{r.done}/{r.total}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const current = sortedMonths.filter(([ym]) => ym === todayYM)
  const upcoming = sortedMonths.filter(([ym]) => ym > todayYM)
  const past = sortedMonths.filter(([ym]) => ym < todayYM)

  return (
    <>
      {/* ゲージカード */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <GaugeCard label="年間レポート" value={doneReportCount} total={totalReportCount}
          color="var(--emerald)" subtitle={`提出済${doneReportCount}/全${totalReportCount}回`} />
        <GaugeCard label="スクーリング" value={doneSessionCount} total={totalSessionCount}
          color="var(--sky)" subtitle={`申込済${doneSessionCount}/必要${totalSessionCount}コマ`} />
        <GaugeCard label="テスト(試験)" value={doneExamCount} total={examSubjects.length}
          color="#f59e0b" subtitle={`受験済${doneExamCount}/${examSubjects.length}科目`} />
        <GaugeCard label="修得状況" value={masteredCount} total={subjects.length}
          color="#a78bfa" subtitle={`修得済${masteredCount}/${subjects.length}科目`} />
      </div>

      {/* 月別レポート */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedMonths.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            レポートタスクに期限日を設定すると、ここに月別で表示されます
          </div>
        ) : (
          <>
            {current.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>優先するレポート ({current.length})</div>
                {current.map(e => MonthCard(e, true))}
              </>
            )}
            {upcoming.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginTop: 8 }}>今後のレポート ({upcoming.length})</div>
                {upcoming.map(e => MonthCard(e, false))}
              </>
            )}
            {past.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginTop: 8 }}>過去のレポート ({past.length})</div>
                {past.map(e => MonthCard(e, false))}
              </>
            )}
          </>
        )}
      </div>

      {/* 科目設定（折りたたみ） */}
      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', userSelect: 'none', padding: '8px 0' }}>
          科目設定 ({subjects.length}科目)
          {hasUnloaded && <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--sky)', fontWeight: 600 }}>N Lobbyプリセットあり</span>}
        </summary>
        <div className="card" style={{ marginTop: 8, padding: 8 }}>
          {/* ツールバー */}
          <div style={{ display: 'flex', gap: 8, padding: '4px 8px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            {hasUnloaded && !deleteMode && (
              <button type="button" className="btn-secondary" style={{ fontSize: 12 }} onClick={loadPreset}>
                N Lobbyプリセットを追加
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {deleteMode ? (
                <>
                  <button type="button" className="btn-danger" style={{ fontSize: 12, padding: '4px 12px', opacity: selectedIds.size === 0 ? 0.4 : 1 }}
                    disabled={selectedIds.size === 0} onClick={bulkDelete}>
                    削除 ({selectedIds.size})
                  </button>
                  <button type="button" className="btn-ghost" style={{ fontSize: 12 }}
                    onClick={() => { setDeleteMode(false); setSelectedIds(new Set()) }}>キャンセル</button>
                </>
              ) : (
                <button type="button" className="btn-ghost" style={{ fontSize: 12, color: '#ef4444' }}
                  onClick={() => { setDeleteMode(true); setSelectedIds(new Set()) }}>一括削除</button>
              )}
            </div>
          </div>

          {subjects.map(s => {
            const submitted = s.submittedReports !== undefined
              ? s.submittedReports
              : tasks.filter(t => t.subjectId === s.id && t.type === 'report' && t.status === 'completed').length
            const isSelected = selectedIds.has(s.id)
            return (
              <div key={s.id}
                onClick={deleteMode ? () => toggleSelect(s.id) : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 6,
                  cursor: deleteMode ? 'pointer' : 'default',
                  background: isSelected ? 'rgba(239,68,68,0.08)' : 'transparent' }}>
                {deleteMode && (
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `2px solid ${isSelected ? '#ef4444' : 'var(--border)'}`, background: isSelected ? '#ef4444' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                )}
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0, forcedColorAdjust: 'none' } as React.CSSProperties} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                {!deleteMode && s.totalReports != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <button type="button"
                      onClick={() => updateSubject(s.id, { submittedReports: Math.max(0, submitted - 1) })}
                      style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}
                    >−</button>
                    <span style={{ fontSize: 12, minWidth: 52, textAlign: 'center', color: submitted >= (s.totalReports ?? 0) ? 'var(--emerald)' : 'var(--text)', fontWeight: 600 }}>
                      {submitted}/全{s.totalReports}
                    </span>
                    <button type="button"
                      onClick={() => updateSubject(s.id, { submittedReports: submitted + 1 })}
                      style={{ width: 20, height: 20, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}
                    >+</button>
                  </div>
                )}
                {!deleteMode && (
                  <button type="button" className="btn-ghost" style={{ padding: '3px 6px', fontSize: 12 }} onClick={() => openEdit(s)}>編集</button>
                )}
              </div>
            )
          })}
        </div>
      </details>

      {/* 編集モーダル */}
      {progressEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setProgressEdit(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                {subjects.find(s => s.id === progressEdit.id)?.name} — 修得設定
              </h2>
              <button type="button" className="btn-ghost" onClick={() => setProgressEdit(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="label" style={{ margin: 0 }}>テスト(試験)あり</label>
                <input type="checkbox" checked={progressEdit.hasExam}
                  onChange={e => setProgressEdit({ ...progressEdit, hasExam: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>年間レポート</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="label">提出済み</label>
                  <input className="input" type="number" min={0} placeholder="0"
                    value={progressEdit.submittedReports}
                    onChange={e => setProgressEdit({ ...progressEdit, submittedReports: e.target.value })} />
                </div>
                <div>
                  <label className="label">全回数</label>
                  <input className="input" type="number" min={0} placeholder="例: 6"
                    value={progressEdit.totalReports}
                    onChange={e => setProgressEdit({ ...progressEdit, totalReports: e.target.value })} />
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>月刊レポート（月ごとの提出数）</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="label">提出済み</label>
                  <input className="input" type="number" min={0} placeholder="0"
                    value={progressEdit.submittedMonthlyReports}
                    onChange={e => setProgressEdit({ ...progressEdit, submittedMonthlyReports: e.target.value })} />
                </div>
                <div>
                  <label className="label">月の全回数</label>
                  <input className="input" type="number" min={0} placeholder="例: 1"
                    value={progressEdit.totalMonthlyReports}
                    onChange={e => setProgressEdit({ ...progressEdit, totalMonthlyReports: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="label" style={{ fontSize: 11 }}>スクーリング申込済コマ</label>
                  <input className="input" type="number" min={0} placeholder="0"
                    value={progressEdit.registered}
                    onChange={e => setProgressEdit({ ...progressEdit, registered: e.target.value })} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: 11 }}>全コマ数</label>
                  <input className="input" type="number" min={0} placeholder="例: 2"
                    value={progressEdit.totalSessions}
                    onChange={e => setProgressEdit({ ...progressEdit, totalSessions: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button type="button" className="btn-danger" style={{ marginRight: 'auto' }} onClick={() => {
                if (confirm(`「${subjects.find(s => s.id === progressEdit.id)?.name}」を削除しますか？`)) {
                  deleteSubject(progressEdit.id)
                  setProgressEdit(null)
                }
              }}>削除</button>
              <button type="button" className="btn-secondary" onClick={() => setProgressEdit(null)}>キャンセル</button>
              <button type="button" className="btn-primary" onClick={saveProgress}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
