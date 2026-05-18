'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { MEMO_COLORS } from '@/lib/utils'
import type { Memo } from '@/lib/types'
import { Plus, X, Pencil, Trash2, Pin, PinOff, Search, StickyNote } from 'lucide-react'
import GradientText from '@/components/GradientText'

const emptyForm = { title: '', content: '', category: '', isPinned: false, color: MEMO_COLORS[0] }

export default function MemosPage() {
  const { memos, addMemo, updateMemo, deleteMemo } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = memos
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })

  function openNew() {
    setForm({ ...emptyForm })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(memo: Memo) {
    setForm({ title: memo.title, content: memo.content, category: memo.category ?? '', isPinned: memo.isPinned, color: memo.color })
    setEditId(memo.id)
    setShowForm(true)
  }

  function save() {
    if (!form.title.trim()) return
    const data = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || undefined,
      isPinned: form.isPinned,
      color: form.color,
    }
    if (editId) updateMemo(editId, data)
    else addMemo(data)
    setShowForm(false)
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 4 }}><GradientText>メモ</GradientText></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>{memos.length} 件のメモ</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={14} /> 新しいメモ</button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" placeholder="メモを検索..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <StickyNote size={40} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--sky)' }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>メモがありません</div>
          <div style={{ fontSize: 13 }}>授業ノート、パスワード、重要事項などをメモできます</div>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={openNew}><Plus size={14} /> 最初のメモを作成</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map(memo => (
            <div
              key={memo.id}
              style={{
                background: memo.color,
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 12,
                padding: '16px',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                position: 'relative',
              }}
              onClick={() => setExpandedId(memo.id === expandedId ? null : memo.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1d23', flex: 1 }}>{memo.title}</h3>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  {memo.isPinned && <Pin size={12} color="#10b981" />}
                  <button
                    onClick={e => { e.stopPropagation(); updateMemo(memo.id, { isPinned: !memo.isPinned }) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.6 }}
                    title={memo.isPinned ? 'ピン解除' : 'ピン留め'}
                  >
                    {memo.isPinned ? <PinOff size={13} color="#1a1d23" /> : <Pin size={13} color="#1a1d23" />}
                  </button>
                </div>
              </div>

              {memo.category && (
                <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  {memo.category}
                </div>
              )}

              <div style={{
                fontSize: 12, color: '#374151', marginTop: 8, lineHeight: 1.6,
                maxHeight: expandedId === memo.id ? 'none' : '72px',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {memo.content || <span style={{ opacity: 0.5 }}>内容なし</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 10, color: '#6b7280' }}>
                  {new Date(memo.updatedAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(memo) }}
                    style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', color: '#374151' }}
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('削除しますか？')) deleteMemo(memo.id) }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editId ? 'メモを編集' : '新しいメモ'}</h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">タイトル *</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="メモのタイトル" autoFocus />
              </div>
              <div>
                <label className="label">カテゴリ</label>
                <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="例: パスワード, 授業ノート..." />
              </div>
              <div>
                <label className="label">内容</label>
                <textarea className="input" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="メモの内容..." rows={6} style={{ minHeight: 120 }} />
              </div>
              <div>
                <label className="label">カラー</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {MEMO_COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 28, height: 28, borderRadius: 6, cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
                      border: form.color === c ? '3px solid #34d399' : '2px solid rgba(255,255,255,0.2)',
                    }}>
                      <span style={{ display: 'block', width: '100%', height: '100%', background: c }} />
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} style={{ accentColor: 'var(--emerald)', width: 16, height: 16 }} />
                ピン留めする
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>キャンセル</button>
              <button className="btn-primary" onClick={save} disabled={!form.title.trim()}>{editId ? '更新する' : '追加する'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
