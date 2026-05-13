'use client'
import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import type { LinkItem } from '@/lib/types'
import { Plus, X, Pencil, Trash2, ExternalLink, Search, Link2, ImagePlus, Smile } from 'lucide-react'


const EMOJI_PALETTE = [
  '💬','📱','💻','🖥️','⌨️','🖱️',
  '📚','📖','✏️','📝','📋','📌',
  '🏫','🏠','🏢','🌐','🔗','🔒',
  '🎥','📷','🎵','🎮','🎨','🎭',
  '📧','📨','📩','📤','📥','📡',
  '💾','💿','📀','🖨️','🖇️','📎',
  '🔍','🔎','⚙️','🛠️','🔧','🔑',
  '⭐','🌟','✨','🔥','💡','🎯',
  '✅','❌','⚠️','ℹ️','🆗','🆕',
  '🐱','🐶','🦊','🐼','🐨','🦁',
  '🍎','🍊','🍋','🍇','🍓','🍕',
  '☀️','🌙','⛅','🌈','❄️','🌸',
]

const emptyForm = {
  title: '',
  url: '',
  icon: '🔗',
  iconImage: '',
  category: '',
  description: '',
  color: '#10b981',
}

export default function LinksPage() {
  const { links, addLink, updateLink, deleteLink, clearLinks } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [search, setSearch] = useState('')
  const [showEmojiPalette, setShowEmojiPalette] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)


  const filtered = links.filter(l =>
    !search ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  )
  const categories = Array.from(new Set(filtered.map(l => l.category)))

  function openNew() {
    setForm({ ...emptyForm })
    setEditId(null)
    setShowEmojiPalette(false)
    setShowForm(true)
  }

  function openEdit(link: LinkItem) {
    setForm({
      title: link.title,
      url: link.url,
      icon: link.icon,
      iconImage: link.iconImage ?? '',
      category: link.category,
      description: link.description ?? '',
      color: link.color,
    })
    setEditId(link.id)
    setShowEmojiPalette(false)
    setShowForm(true)
  }

  function save() {
    if (!form.title.trim() || !form.url.trim()) return
    const data: Omit<LinkItem, 'id'> = {
      title: form.title.trim(),
      url: form.url.trim(),
      icon: form.icon.trim() || '🔗',
      iconImage: form.iconImage || undefined,
      category: form.category.trim() || 'その他',
      description: form.description.trim() || undefined,
      color: form.color,
    }
    if (editId) updateLink(editId, data)
    else addLink(data)
    setShowForm(false)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      alert('画像は500KB以下にしてください')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setForm(f => ({ ...f, iconImage: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setForm(f => ({ ...f, iconImage: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  function renderIcon(link: LinkItem, size = 28) {
    if (link.iconImage) {
      return (
        <img
          src={link.iconImage}
          alt={link.title}
          style={{ width: size, height: size, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
        />
      )
    }
    return <span style={{ fontSize: size }}>{link.icon}</span>
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 4 }}>
            <span className="gradient-text">マイリンク</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>よく使うサービスのショートカット</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {links.length > 0 && (
            <button className="btn-danger" onClick={() => { if (confirm('すべてのリンクを削除しますか？')) clearLinks() }} style={{ fontSize: 13 }}>
              <Trash2 size={13} /> 全削除
            </button>
          )}
          <button className="btn-primary" onClick={openNew}>
            <Plus size={14} /> リンクを追加
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input"
          placeholder="リンクを検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 32 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Link2 size={40} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--sky)' }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>リンクがありません</div>
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={openNew}><Plus size={14} /> リンクを追加</button>
        </div>
      ) : (
        categories.map(cat => {
          const catLinks = filtered.filter(l => l.category === cat)
          return (
            <div key={cat} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'inline-block' }} />
                {cat}
                <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'inline-block' }} />
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {catLinks.map(link => (
                  <div key={link.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: `3px solid ${link.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {renderIcon(link)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{link.category}</div>
                      </div>
                    </div>
                    {link.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{link.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <a href={link.url} target="_blank" rel="noreferrer" className="btn-primary"
                        style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: 12, padding: '7px 10px', background: link.color }}>
                        <ExternalLink size={12} /> 開く
                      </a>
                      <button className="btn-secondary" onClick={() => openEdit(link)} style={{ padding: '7px 10px' }}><Pencil size={12} /></button>
                      <button className="btn-danger" onClick={() => { if (confirm('削除しますか？')) deleteLink(link.id) }} style={{ padding: '7px 10px' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{editId ? 'リンクを編集' : 'リンクを追加'}</h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* アイコン選択 */}
              <div>
                <label className="label">アイコン</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* プレビュー */}
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {form.iconImage
                      ? <img src={form.iconImage} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28 }}>{form.icon}</span>
                    }
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* 絵文字パレットボタン */}
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowEmojiPalette(p => !p)}
                        style={{ fontSize: 12, padding: '6px 10px', flex: 1 }}
                      >
                        <Smile size={13} /> 絵文字を選ぶ
                      </button>
                      {/* 画像アップロードボタン */}
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => fileRef.current?.click()}
                        style={{ fontSize: 12, padding: '6px 10px', flex: 1 }}
                      >
                        <ImagePlus size={13} /> 画像をアップロード
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    </div>
                    {form.iconImage && (
                      <button type="button" className="btn-ghost" onClick={clearImage} style={{ fontSize: 11, color: '#ef4444', padding: '4px 8px', alignSelf: 'flex-start' }}>
                        <X size={11} /> 画像を削除して絵文字に戻す
                      </button>
                    )}
                  </div>
                </div>

                {/* 絵文字パレット */}
                {showEmojiPalette && (
                  <div style={{ marginTop: 8, padding: 10, background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
                    {EMOJI_PALETTE.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, icon: e, iconImage: '' })); setShowEmojiPalette(false) }}
                        style={{ fontSize: 20, background: form.icon === e && !form.iconImage ? 'rgba(16,185,129,0.2)' : 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px', lineHeight: 1.2 }}
                        title={e}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label">タイトル *</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="サービス名" />
              </div>
              <div>
                <label className="label">URL *</label>
                <input className="input" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." inputMode="url" />
              </div>
              <div>
                <label className="label">カテゴリ</label>
                <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="例: Google, 授業..." />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">説明（任意）</label>
                  <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="短い説明..." />
                </div>
                <div style={{ flexShrink: 0 }}>
                  <label className="label">カラー</label>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 52, height: 40, padding: '4px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>キャンセル</button>
              <button className="btn-primary" onClick={save} disabled={!form.title.trim() || !form.url.trim()}>
                {editId ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
