'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import {
  PRIORITY_COLORS, STATUS_COLORS,
  SUBJECT_COLORS, formatDueDate, getDueDateColor
} from '@/lib/utils'
import type { Task, Priority, TaskStatus, TaskType } from '@/lib/types'
import { Plus, X, Pencil, Trash2, CheckCircle2, Circle, Clock, Filter, Search } from 'lucide-react'
import { useT } from '@/hooks/useT'

const emptyForm = {
  title: '', description: '', subjectId: '', dueDate: '',
  priority: 'medium' as Priority, status: 'pending' as TaskStatus,
  type: 'homework' as TaskType, estimatedMinutes: '',
}

export default function TasksPage() {
  const { tasks, subjects, addTask, updateTask, deleteTask, addSubject } = useStore()
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
    <div style={{ padding: '16px 14px', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 4 }}><span className="gradient-text">{t('tasks_title')}</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            {tasks.length}{t('tasks_stat_registered')} · {tasks.filter(task => task.status === 'completed').length}{t('tasks_stat_done')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setShowSubjectForm(true)}>
            <Plus size={14} /> {t('tasks_subject_add')}
          </button>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={14} /> {t('tasks_add')}
          </button>
        </div>
      </div>

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

              <div style={{ width: 4, height: 40, borderRadius: 2, background: getSubjectColor(task.subjectId), flexShrink: 0 }} />

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
                    <div key={c} onClick={() => setNewSubject(s => ({ ...s, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
                      border: newSubject.color === c ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                    }}>
                      <span style={{ display: 'block', width: '100%', height: '100%', background: c }} />
                    </div>
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
    </div>
  )
}
