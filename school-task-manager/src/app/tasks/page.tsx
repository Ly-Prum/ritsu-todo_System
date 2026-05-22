'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import {
  PRIORITY_COLORS, STATUS_COLORS,
  SUBJECT_COLORS, formatDueDate, getDueDateColor
} from '@/lib/utils'
import type { Task, Subject, Priority, TaskStatus, TaskType } from '@/lib/types'
import { Plus, X, Pencil, Trash2, CheckCircle2, Circle, Clock, Filter, Search } from 'lucide-react'
import { useT } from '@/hooks/useT'


const emptyForm = {
  title: '', description: '', subjectId: '', dueDate: '',
  priority: 'medium' as Priority, status: 'pending' as TaskStatus,
  type: 'homework' as TaskType, estimatedMinutes: '',
}

export default function TasksPage() {
  const { tasks, subjects, addTask, updateTask, deleteTask, addSubject, updateSubject } = useStore()
  const t = useT()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month' | 'overdue'>('all')
  const [search, setSearch] = useState('')
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', color: SUBJECT_COLORS[0] })
  const [quickTitle, setQuickTitle] = useState('')
  const [quickSubjectId, setQuickSubjectId] = useState('')
  const [quickDate, setQuickDate] = useState('')
  const quickDateRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'tasks' | 'progress'>('tasks')
  const [progressEdit, setProgressEdit] = useState<{ id: string, totalReports: string, totalSessions: string, attended: string, registered: string, hasExam: boolean } | null>(null)

  const tPriority = (p: Priority) => ({ low: t('priority_low'), medium: t('priority_medium'), high: t('priority_high') }[p])
  const tStatus = (s: TaskStatus) => ({ pending: t('status_pending'), 'in-progress': t('status_inprogress'), completed: t('status_completed') }[s])
  const tType = (tp: TaskType) => ({ homework: t('type_homework'), exam: t('type_exam'), project: t('type_project'), report: t('type_report'), other: t('type_other') }[tp])

  const todayStr = new Date().toISOString().split('T')[0]
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const monthEnd = new Date()
  monthEnd.setMonth(monthEnd.getMonth() + 1)
  const monthEndStr = monthEnd.toISOString().split('T')[0]

  const filtered = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterSubject !== 'all' && task.subjectId !== filterSubject) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterDate === 'today' && task.dueDate !== todayStr) return false
    if (filterDate === 'week' && (!task.dueDate || task.dueDate < todayStr || task.dueDate > weekEndStr)) return false
    if (filterDate === 'month' && (!task.dueDate || task.dueDate < todayStr || task.dueDate > monthEndStr)) return false
    if (filterDate === 'overdue' && (task.status === 'completed' || !task.dueDate || task.dueDate >= todayStr)) return false
    return true
  }).sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))

  function openNew() {
    setForm({ ...emptyForm })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title, description: task.description ?? '',
      subjectId: task.subjectId ?? '', dueDate: task.dueDate ?? '',
      priority: task.priority, status: task.status, type: task.type,
      estimatedMinutes: task.estimatedMinutes?.toString() ?? '',
    })
    setEditId(task.id)
    setShowForm(true)
  }

  function save() {
    if (!form.title.trim()) return
    const data = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      subjectId: form.subjectId || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      status: form.status,
      type: form.type,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
    }
    if (editId) updateTask(editId, data)
    else addTask(data)
    setShowForm(false)
  }

  function toggleStatus(task: Task) {
    if (task.status === 'completed') updateTask(task.id, { status: 'pending' })
    else updateTask(task.id, { status: 'completed' })
  }

  function saveSubject() {
    if (!newSubject.name.trim()) return
    addSubject({ name: newSubject.name.trim(), color: newSubject.color })
    setNewSubject({ name: '', color: SUBJECT_COLORS[0] })
    setShowSubjectForm(false)
  }

  function quickAdd() {
    if (!quickTitle.trim()) return
    addTask({
      title: quickTitle.trim(),
      subjectId: quickSubjectId || undefined,
      dueDate: quickDate || undefined,
      priority: 'medium',
      status: 'pending',
      type: 'homework',
    })
    setQuickTitle('')
    setQuickDate('')
  }

  const getSubjectName = (id?: string) => subjects.find(s => s.id === id)?.name ?? ''
  const getSubjectColor = (id?: string) => subjects.find(s => s.id === id)?.color ?? '#8a92a6'

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 20 }}>
        <button className="btn-secondary" onClick={() => setShowSubjectForm(true)}>
          <Plus size={14} /> {t('tasks_subject_add')}
        </button>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={14} /> {t('tasks_add')}
        </button>
      </div>

      {/* タブ切り替え */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {(['tasks', 'progress'] as const).map(t2 => (
          <button key={t2} onClick={() => setTab(t2)} className={`tab-btn${tab === t2 ? ' active' : ''}`} style={{
            padding: '8px 20px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            borderBottom: tab === t2 ? '2px solid var(--emerald)' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
            marginBottom: -1,
          }}>
            {t2 === 'tasks' ? 'タスク一覧' : '修得管理'}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <ProgressTable subjects={subjects} tasks={tasks} updateSubject={updateSubject} addSubject={addSubject} progressEdit={progressEdit} setProgressEdit={setProgressEdit} />
      )}

      {tab === 'tasks' && <>
      {/* クイック追加バー */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>⚡ クイック追加</span>
        <input
          className="input"
          placeholder="課題名を入力..."
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickDateRef.current?.focus()}
          style={{ flex: 2, minWidth: 180 }}
        />
        <select
          className="input"
          value={quickSubjectId}
          onChange={e => setQuickSubjectId(e.target.value)}
          style={{ flex: 1, minWidth: 120 }}
        >
          <option value="">科目（任意）</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          ref={quickDateRef}
          className="input"
          type="date"
          value={quickDate}
          onChange={e => setQuickDate(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickAdd()}
          style={{ flex: 1, minWidth: 140 }}
        />
        <button
          className="btn-primary"
          onClick={quickAdd}
          disabled={!quickTitle.trim()}
          style={{ flexShrink: 0 }}
        >
          <Plus size={14} /> 追加
        </button>
      </div>

      {/* Date filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {([
          { value: 'all', label: t('tasks_filter_all') },
          { value: 'today', label: t('tasks_filter_today') },
          { value: 'week', label: t('tasks_filter_week') },
          { value: 'month', label: t('tasks_filter_month') },
          { value: 'overdue', label: t('tasks_filter_overdue') },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterDate(value)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: filterDate === value
                ? 'linear-gradient(135deg, var(--emerald), var(--sky))'
                : 'var(--surface-2)',
              color: filterDate === value ? 'white' : 'var(--text-muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder={t('lbl_search') + '...'} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')}>
          <option value="all">{t('tasks_all_status')}</option>
          {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map(k => <option key={k} value={k}>{tStatus(k)}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="all">{t('tasks_all_subjects')}</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'all')}>
          <option value="all">{t('tasks_all_priority')}</option>
          {(['low', 'medium', 'high'] as Priority[]).map(k => <option key={k} value={k}>{tPriority(k)}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <Filter size={12} style={{ display: 'inline', marginRight: 4 }} />
          {filtered.length}{t('tasks_count')}
        </span>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={40} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--emerald)' }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t('tasks_no_tasks')}</div>
          <div style={{ fontSize: 13 }}>{t('tasks_hint_add')}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(task => (
            <div key={task.id} className="card" style={{
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: task.status === 'completed' ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}>
              <button onClick={() => toggleStatus(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'completed' ? 'var(--emerald)' : 'var(--text-muted)', flexShrink: 0, padding: 0 }}>
                {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </button>

              <div style={{ width: 4, height: 40, borderRadius: 2, backgroundColor: getSubjectColor(task.subjectId), flexShrink: 0, forcedColorAdjust: 'none' } as React.CSSProperties} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                  <span style={{ fontSize: 10, background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: 4 }}>
                    {tType(task.type)}
                  </span>
                </div>
                {task.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                    {task.description}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {getSubjectName(task.subjectId) && <span style={{ marginRight: 8 }}>📚 {getSubjectName(task.subjectId)}</span>}
                  {task.estimatedMinutes && <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{task.estimatedMinutes}{t('tasks_minutes')}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span className={getDueDateColor(task.dueDate)} style={{ fontSize: 12, minWidth: 90, textAlign: 'right' }}>
                  {formatDueDate(task.dueDate)}
                </span>
                <span className={`badge ${PRIORITY_COLORS[task.priority]}`} style={{ fontSize: 10 }}>
                  {tPriority(task.priority)}
                </span>
                <span className={`badge ${STATUS_COLORS[task.status]}`} style={{ fontSize: 10 }}>
                  {tStatus(task.status)}
                </span>
                <button className="btn-ghost" onClick={() => openEdit(task)} style={{ padding: '4px 6px' }}>
                  <Pencil size={14} />
                </button>
                <button className="btn-ghost" onClick={() => { if (confirm(t('tasks_confirm_delete'))) deleteTask(task.id) }} style={{ padding: '4px 6px', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editId ? t('tasks_edit') : t('tasks_new')}</h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">{t('lbl_title')}{t('lbl_required')}</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('tasks_title_placeholder')} autoFocus />
              </div>
              <div>
                <label className="label">{t('lbl_description')}</label>
                <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('tasks_desc_placeholder')} rows={2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">{t('lbl_subject')}</label>
                  <select className="input" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                    <option value="">{t('tasks_no_subject')}</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('lbl_type')}</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TaskType }))}>
                    {(['homework', 'exam', 'project', 'report', 'other'] as TaskType[]).map(k => <option key={k} value={k}>{tType(k)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">{t('tasks_duedate')}{t('lbl_optional')}</label>
                  <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label">{t('tasks_estimated')}</label>
                  <input className="input" type="number" value={form.estimatedMinutes} onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))} placeholder="60" min="1" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">{t('lbl_priority')}</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                    {(['low', 'medium', 'high'] as Priority[]).map(k => <option key={k} value={k}>{tPriority(k)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('lbl_status')}</label>
                  <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
                    {(['pending', 'in-progress', 'completed'] as TaskStatus[]).map(k => <option key={k} value={k}>{tStatus(k)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>{t('btn_cancel')}</button>
              <button className="btn-primary" onClick={save} disabled={!form.title.trim()}>
                {editId ? t('btn_update') : t('btn_add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Form Modal */}
      {showSubjectForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSubjectForm(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t('tasks_add_subject')}</h2>
              <button className="btn-ghost" onClick={() => setShowSubjectForm(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">{t('tasks_subject_name')}{t('lbl_required')}</label>
                <input className="input" value={newSubject.name} onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))} placeholder={t('tasks_subject_placeholder')} autoFocus />
              </div>
              <div>
                <label className="label">{t('lbl_color')}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {SUBJECT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubject(s => ({ ...s, color: c }))}
                      style={{
                        backgroundColor: c,
                        border: newSubject.color === c ? '3px solid var(--emerald)' : '2px solid var(--border)',
                        width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, padding: 0,
                      }}
                      className="forced-color-adjust-none active:scale-95 transition-transform focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowSubjectForm(false)}>{t('btn_cancel')}</button>
              <button className="btn-primary" onClick={saveSubject} disabled={!newSubject.name.trim()}>{t('btn_add')}</button>
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  )
}

// ─── N Lobbyプリセット科目 ──────────────────────────────────────────
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

// ─── ゲージカード ────────────────────────────────────────────────────
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

// ─── 修得管理テーブル ───────────────────────────────────────────────
function ProgressTable({ subjects, tasks, updateSubject, addSubject, progressEdit, setProgressEdit }: {
  subjects: Subject[]
  tasks: Task[]
  updateSubject: (id: string, updates: Partial<Subject>) => void
  addSubject: (s: Omit<Subject, 'id'>) => void
  progressEdit: { id: string, totalReports: string, totalSessions: string, attended: string, registered: string, hasExam: boolean } | null
  setProgressEdit: (v: typeof progressEdit) => void
}) {
  const totalReportCount = subjects.reduce((sum, s) => sum + (s.totalReports ?? 0), 0)
  const doneReportCount = subjects.reduce((sum, s) =>
    sum + tasks.filter(t => t.subjectId === s.id && t.type === 'report' && t.status === 'completed').length, 0)
  const totalSessionCount = subjects.reduce((sum, s) => sum + (s.totalSessions ?? 0), 0)
  const doneSessionCount = subjects.reduce((sum, s) => sum + (s.attendedSessions ?? 0) + (s.registeredSessions ?? 0), 0)
  const examSubjects = subjects.filter(s => s.hasExam !== false)
  const doneExamCount = examSubjects.filter(s =>
    tasks.some(t => t.subjectId === s.id && t.type === 'exam' && t.status === 'completed')).length
  const masteredCount = subjects.filter(s => {
    const completed = tasks.filter(t => t.subjectId === s.id && t.type === 'report' && t.status === 'completed').length
    const examDone = tasks.some(t => t.subjectId === s.id && t.type === 'exam' && t.status === 'completed')
    const att = (s.attendedSessions ?? 0) + (s.registeredSessions ?? 0)
    const repDone = s.totalReports != null && completed >= s.totalReports
    const sessDone = s.totalSessions != null && att >= s.totalSessions
    return s.hasExam === false ? repDone && sessDone : examDone && repDone && sessDone
  }).length

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
      totalSessions: progressEdit.totalSessions ? Number(progressEdit.totalSessions) : undefined,
      attendedSessions: Number(progressEdit.attended) || 0,
      registeredSessions: Number(progressEdit.registered) || 0,
      hasExam: progressEdit.hasExam,
    })
    setProgressEdit(null)
  }

  const th: React.CSSProperties = {
    padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = {
    padding: '12px', fontSize: 13, borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
  }

  if (subjects.length === 0) return (
    <div className="card" style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
        N Lobbyの13科目を一括登録できます
      </div>
      <button className="btn-primary" onClick={loadPreset}>
        N Lobbyプリセットを読み込む
      </button>
    </div>
  )

  const hasUnloaded = NLOBBY_SUBJECTS.some(s => !subjects.find(e => e.name === s.name))

  return (
    <>
      {/* サマリーカード */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <GaugeCard label="年間レポート" value={doneReportCount} total={totalReportCount}
          color="var(--emerald)" subtitle={`提出済${doneReportCount}/全${totalReportCount}回`} />
        <GaugeCard label="スクーリング" value={doneSessionCount} total={totalSessionCount}
          color="var(--sky)" subtitle={`出席+申込${doneSessionCount}/必要${totalSessionCount}コマ`} />
        <GaugeCard label="テスト(試験)" value={doneExamCount} total={examSubjects.length}
          color="#f59e0b" subtitle={`受験済${doneExamCount}/${examSubjects.length}科目`} />
        <GaugeCard label="修得状況" value={masteredCount} total={subjects.length}
          color="#a78bfa" subtitle={`修得済${masteredCount}/${subjects.length}科目`} />
      </div>

      {hasUnloaded && (
        <div style={{ marginBottom: 12, textAlign: 'right' }}>
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={loadPreset}>
            N Lobbyプリセットを追加
          </button>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--thead-bg)' }}>
              <th style={th}>科目</th>
              <th style={th}>レポート<br /><span style={{ fontWeight: 400, fontSize: 10 }}>提出済/全回数</span></th>
              <th style={th}>スクーリング<br /><span style={{ fontWeight: 400, fontSize: 10 }}>出席(+申込)/全コマ</span></th>
              <th style={th}>テスト(試験)<br /><span style={{ fontWeight: 400, fontSize: 10 }}>受験可否・受験状況</span></th>
              <th style={th}>修得状況</th>
              <th style={{ ...th, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => {
              const reportTasks = tasks.filter(t => t.subjectId === s.id && t.type === 'report')
              const completedReports = reportTasks.filter(t => t.status === 'completed').length
              const examTasks = tasks.filter(t => t.subjectId === s.id && t.type === 'exam')
              const examDone = examTasks.some(t => t.status === 'completed')
              const attended = s.attendedSessions ?? 0
              const registered = s.registeredSessions ?? 0
              const totalSessions = s.totalSessions ?? null
              const totalReports = s.totalReports ?? null
              const reportsDone = totalReports !== null && completedReports >= totalReports
              const schoolingDone = totalSessions !== null && (attended + registered) >= totalSessions
              const canExam = reportsDone && schoolingDone

              const examLabel = s.hasExam === false
                ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>テストなし</span>
                : totalReports === null && totalSessions === null
                  ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>未設定</span>
                  : !canExam
                    ? <span style={{ fontSize: 12, color: '#f59e0b' }}>{[!reportsDone && 'レポート未完', !schoolingDone && 'スクーリング未完'].filter(Boolean).join('・')}</span>
                    : examDone
                      ? <span style={{ fontSize: 12, color: 'var(--emerald)' }}>✓ 受験済</span>
                      : <span style={{ fontSize: 12, color: 'var(--sky)' }}>受験可</span>

              const statusLabel = s.hasExam === false
                ? (reportsDone && schoolingDone
                    ? { text: '修得', color: 'var(--emerald)' }
                    : { text: '判定前', color: 'var(--text-muted)' })
                : totalReports === null && totalSessions === null
                  ? { text: '未設定', color: 'var(--text-muted)' }
                  : examDone && canExam
                    ? { text: '修得', color: 'var(--emerald)' }
                    : canExam
                      ? { text: '受験待ち', color: 'var(--sky)' }
                      : { text: '判定前', color: 'var(--text-muted)' }

              return (
                <tr key={s.id} style={{ transition: 'background 0.15s' }} className="hover:bg-white/[0.02]">
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0, forcedColorAdjust: 'none' } as React.CSSProperties} />
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={td}>
                    {totalReports === null
                      ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      : <span style={{ color: reportsDone ? 'var(--emerald)' : 'var(--text)' }}>
                          {completedReports}/<span style={{ color: 'var(--text-muted)' }}>全{totalReports}回</span>
                        </span>}
                  </td>
                  <td style={td}>
                    {totalSessions === null
                      ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      : <span style={{ color: schoolingDone ? 'var(--emerald)' : 'var(--text)' }}>
                          出席済{attended}(+申込済{registered})/<span style={{ color: 'var(--text-muted)' }}>全{totalSessions}コマ</span>
                        </span>}
                  </td>
                  <td style={td}>{examLabel}</td>
                  <td style={td}>
                    <span style={{ fontWeight: 700, color: statusLabel.color }}>{statusLabel.text}</span>
                  </td>
                  <td style={td}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '4px 6px' }}
                      onClick={() => setProgressEdit({
                        id: s.id,
                        totalReports: s.totalReports?.toString() ?? '',
                        totalSessions: s.totalSessions?.toString() ?? '',
                        attended: (s.attendedSessions ?? 0).toString(),
                        registered: (s.registeredSessions ?? 0).toString(),
                        hasExam: s.hasExam !== false,
                      })}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 編集モーダル */}
      {progressEdit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setProgressEdit(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                {subjects.find(s => s.id === progressEdit.id)?.name} — 修得設定
              </h2>
              <button className="btn-ghost" onClick={() => setProgressEdit(null)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="label" style={{ margin: 0 }}>テスト(試験)あり</label>
                <input type="checkbox" checked={progressEdit.hasExam}
                  onChange={e => setProgressEdit({ ...progressEdit, hasExam: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} />
              </div>
              <div>
                <label className="label">全レポート回数</label>
                <input className="input" type="number" min={0} placeholder="例: 6"
                  value={progressEdit.totalReports}
                  onChange={e => setProgressEdit({ ...progressEdit, totalReports: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label className="label" style={{ fontSize: 11 }}>出席済コマ</label>
                  <input className="input" type="number" min={0} placeholder="0"
                    value={progressEdit.attended}
                    onChange={e => setProgressEdit({ ...progressEdit, attended: e.target.value })} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: 11 }}>申込済コマ</label>
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
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setProgressEdit(null)}>キャンセル</button>
              <button className="btn-primary" onClick={saveProgress}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
