'use client'
import { useRef, useState, useEffect } from 'react'
import { useStore, THEME_COLORS, type ThemeColor, type ThemeMode } from '@/lib/store'
import type { AppData } from '@/lib/types'
import {
  Download, Upload, Trash2, BookOpen, CheckSquare, Clock, StickyNote,
  AlertTriangle, Pencil, X, Bell,
  HardDrive, ChevronDown, ChevronRight, CheckCircle2, Cloud
} from 'lucide-react'
import { SUBJECT_COLORS } from '@/lib/utils'
import { useT } from '@/hooks/useT'
import { useIsMobile } from '@/hooks/useIsMobile'
import { supabase } from '@/lib/supabase'


type SendState = 'idle' | 'loading' | 'ok' | 'error'

export default function SettingsPage() {
  const store = useStore()
  const t = useT()
  const isMobile = useIsMobile()
  const { language, setLanguage } = store
  const fileRef = useRef<HTMLInputElement>(null)
  const iconRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)
  const bgMobileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  const [supabaseMsg, setSupabaseMsg] = useState('')
  const [supabaseSyncing, setSupabaseSyncing] = useState(false)
  const [showSubjectManager, setShowSubjectManager] = useState(false)
  const [editSubject, setEditSubject] = useState<{ id: string; name: string; color: string } | null>(null)


  const [notifState, setNotifState] = useState<'default' | 'granted' | 'denied'>('default')
  useEffect(() => {
    if ('Notification' in window) setNotifState(Notification.permission)
  }, [])

  const { tasks, subjects, timetable, memos, sidebarIcon, setSidebarIcon, bgImage, setBgImage, bgImageMobile, setBgImageMobile, bgX, bgY, bgZoom, setBgX, setBgY, setBgZoom } = store

  function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSidebarIcon(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function compressImage(file: File, maxW: number, maxH: number): Promise<string> {
    return new Promise(resolve => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = url
    })
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 1920, 1080)
    setBgImage(compressed)
    e.target.value = ''
  }

  async function handleBgMobileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 1080, 1920)
    setBgImageMobile(compressed)
    e.target.value = ''
  }


  function handleExport() {
    const data = store.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ritsuki-dashboard-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AppData
        if (!Array.isArray(data.tasks) || !Array.isArray(data.subjects)) {
          setImportMsg('ファイル形式が正しくありません')
          return
        }
        store.importData(data)
        setImportMsg(`インポート完了：課題 ${data.tasks.length} 件、メモ ${data.memos?.length ?? 0} 件`)
      } catch {
        setImportMsg('JSONの読み込みに失敗しました')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleSupabaseSync() {
    if (!supabase) { setSupabaseMsg('Supabase未接続'); return }
    setSupabaseSyncing(true)
    setSupabaseMsg('')
    try {
      const s = store
      // 背景画像などの大きなbase64データは除外（タスク・科目・メモなど必須データのみ送信）
      const data = {
        ...s.exportData(),
        language: s.language,
        freeNote: s.freeNote,
        integrations: s.integrations,
      }
      const { error } = await supabase
        .from('app_state')
        .upsert({ id: 'ritsuki', data, updated_at: new Date().toISOString() })
      if (error) throw error
      setSupabaseMsg(`同期完了：課題 ${s.tasks.length} 件、科目 ${s.subjects.length} 件`)
    } catch (err: unknown) {
      let msg = '不明なエラー'
      if (err && typeof err === 'object' && 'message' in err) {
        msg = String((err as Record<string, unknown>).message)
      } else if (err instanceof Error) {
        msg = err.message
      } else {
        msg = JSON.stringify(err)
      }
      setSupabaseMsg(`同期失敗: ${msg}`)
    } finally {
      setSupabaseSyncing(false)
    }
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifState(perm)
    store.updateIntegrations({ notificationsEnabled: perm === 'granted' })
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600 }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ background: 'linear-gradient(135deg, var(--emerald), var(--sky))', color: 'white', borderRadius: 8, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>設定</span>
      </div>

      {/* 言語設定 */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          🌐 {t('set_language')}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['ja', 'en'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: language === lang
                  ? 'linear-gradient(135deg, var(--emerald), var(--sky))'
                  : 'var(--surface-2)',
                color: language === lang ? 'white' : 'var(--text-muted)',
              }}
            >
              {lang === 'ja' ? '🇯🇵 日本語' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>

      {/* テーマ設定 */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700 }}>🎨 テーマ設定</h2>

        {/* ダーク / ライト */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px', fontWeight: 600 }}>モード</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['dark', 'light'] as ThemeMode[]).map(mode => (
              <button key={mode} onClick={() => store.updateIntegrations({ themeMode: mode })}
                style={{
                  padding: '7px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: store.integrations.themeMode === mode
                    ? 'linear-gradient(135deg, var(--emerald), var(--sky))' : 'var(--surface-2)',
                  color: store.integrations.themeMode === mode ? '#fff' : 'var(--text-muted)',
                }}>
                {mode === 'dark' ? '🌙 ダーク' : '☀️ ライト'}
              </button>
            ))}
          </div>
        </div>

        {/* 文字・アクセントカラー */}
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px', fontWeight: 600 }}>文字・アクセントカラー</p>
          {(['単色', 'モノ・ホワイト'] as const).map(cat => {
            const entries = (Object.entries(THEME_COLORS) as [ThemeColor, typeof THEME_COLORS[ThemeColor]][]).filter(([, t]) => t.category === cat)
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '0 0 7px', fontWeight: 700, letterSpacing: '0.06em' }}>{cat}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {entries.map(([key, theme]) => {
                    const active = (store.integrations.themeColor ?? 'emerald') === key
                    return (
                      <button key={key} onClick={() => store.updateIntegrations({ themeColor: key })}
                        title={theme.label}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9999,
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          border: active ? '3px solid var(--text)' : '2px solid var(--border)',
                          outline: active ? '2px solid ' + theme.primary : 'none', outlineOffset: 2,
                          boxShadow: active ? '0 0 0 3px ' + theme.primary + '50' : 'none',
                          transition: 'all 0.15s',
                        }} />
                        <span style={{ fontSize: 9, color: active ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{theme.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {THEME_COLORS[store.integrations.themeColor ?? 'emerald']?.label} が選択中
          </p>
        </div>
      </div>

      {/* サイドバーアイコン */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>🖼️ サイドバーアイコン</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, var(--emerald), var(--sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {sidebarIcon
              ? <img src={sidebarIcon} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 24 }}>🎓</span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn-primary" onClick={() => iconRef.current?.click()} style={{ fontSize: 13 }}>
              画像をアップロード
            </button>
            {sidebarIcon && (
              <button className="btn-ghost" onClick={() => setSidebarIcon('')} style={{ fontSize: 12, color: '#ef4444' }}>
                デフォルトに戻す
              </button>
            )}
            <input ref={iconRef} type="file" accept="image/*" onChange={handleIconUpload} style={{ display: 'none' }} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 0' }}>PNG・JPG・GIF など画像ファイルを設定できます。</p>
      </div>

      {/* 背景画像 */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>🌄 背景画像</h2>
        {!isMobile ? (
          <div>
            <div style={{ width: 96, height: 60, borderRadius: 8, overflow: 'hidden', background: bgImage ? `url(${bgImage}) center/cover` : 'var(--surface-2)', border: '1px solid var(--border)', position: 'relative', marginBottom: 8 }}>
              {!bgImage && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼️</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <button className="btn-primary" onClick={() => bgRef.current?.click()} style={{ fontSize: 13 }}>アップロード</button>
              {bgImage && <button className="btn-ghost" onClick={() => setBgImage('')} style={{ fontSize: 12, color: '#ef4444' }}>削除</button>}
            </div>
            <input ref={bgRef} type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
            {bgImage && (
              <div style={{ marginTop: 10, padding: '12px', borderRadius: 8, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.06em' }}>背景の位置・ズーム調整</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>上下</span>
                  <button type="button" onClick={() => setBgY(Math.max(0, bgY - 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bgY}%</span>
                  <button type="button" onClick={() => setBgY(Math.min(100, bgY + 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>左右</span>
                  <button type="button" onClick={() => setBgX(Math.max(0, bgX - 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>◀</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bgX}%</span>
                  <button type="button" onClick={() => setBgX(Math.min(100, bgX + 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>ズーム</span>
                  <button type="button" onClick={() => setBgZoom(Math.max(1, parseFloat((bgZoom - 0.1).toFixed(1))))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>－</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{Math.round(bgZoom * 100)}%</span>
                  <button type="button" onClick={() => setBgZoom(Math.min(4, parseFloat((bgZoom + 0.1).toFixed(1))))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>＋</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ width: 40, height: 60, borderRadius: 8, overflow: 'hidden', background: bgImageMobile ? `url(${bgImageMobile}) center/cover` : 'var(--surface-2)', border: '1px solid var(--border)', position: 'relative', marginBottom: 8 }}>
              {!bgImageMobile && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🖼️</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <button className="btn-primary" onClick={() => bgMobileRef.current?.click()} style={{ fontSize: 13 }}>アップロード</button>
              {bgImageMobile && <button className="btn-ghost" onClick={() => setBgImageMobile('')} style={{ fontSize: 12, color: '#ef4444' }}>削除</button>}
            </div>
            <input ref={bgMobileRef} type="file" accept="image/*" onChange={handleBgMobileUpload} style={{ display: 'none' }} />
            {bgImageMobile && (
              <div style={{ marginTop: 10, padding: '12px', borderRadius: 8, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.06em' }}>背景の位置・ズーム調整</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>上下</span>
                  <button type="button" onClick={() => setBgY(Math.max(0, bgY - 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bgY}%</span>
                  <button type="button" onClick={() => setBgY(Math.min(100, bgY + 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>左右</span>
                  <button type="button" onClick={() => setBgX(Math.max(0, bgX - 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>◀</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{bgX}%</span>
                  <button type="button" onClick={() => setBgX(Math.min(100, bgX + 5))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>ズーム</span>
                  <button type="button" onClick={() => setBgZoom(Math.max(1, parseFloat((bgZoom - 0.1).toFixed(1))))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>－</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{Math.round(bgZoom * 100)}%</span>
                  <button type="button" onClick={() => setBgZoom(Math.min(4, parseFloat((bgZoom + 0.1).toFixed(1))))} style={{ background: 'var(--border)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>＋</button>
                </div>
              </div>
            )}
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0' }}>自動で圧縮します。このデバイス用の背景を設定できます。</p>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>データ概要</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: BookOpen, label: '科目', count: subjects.length, color: 'var(--emerald)' },
            { icon: CheckSquare, label: '課題', count: tasks.length, color: 'var(--sky)' },
            { icon: Clock, label: '時間割', count: timetable.length, color: '#8b5cf6' },
            { icon: StickyNote, label: 'メモ', count: memos.length, color: '#f59e0b' },
          ].map(({ icon: Icon, label, count, color }) => (
            <div key={label} className="card-2" style={{ padding: '14px', textAlign: 'center' }}>
              <Icon size={20} color={color} style={{ margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Browser Notifications ===== */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="var(--sky)" />
          ブラウザ通知
          <span className="badge" style={{ background: notifState === 'granted' ? 'rgba(16,185,129,0.15)' : notifState === 'denied' ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)', color: notifState === 'granted' ? 'var(--emerald)' : notifState === 'denied' ? '#ef4444' : '#8b5cf6', border: `1px solid ${notifState === 'granted' ? 'rgba(16,185,129,0.3)' : notifState === 'denied' ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}`, fontSize: 10 }}>
            {notifState === 'granted' ? '✓ 許可済み' : notifState === 'denied' ? '✗ ブロック中' : '未設定'}
          </span>
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
          アプリを開いたとき、締切・イベント前日・当日に自動でお知らせします。
        </p>
        {notifState === 'denied' ? (
          <div className="card-2" style={{ padding: '10px 14px', fontSize: 12, color: '#ef4444' }}>
            Chrome の設定 → サイトの設定 → 通知 → このサイトを「許可」に変更してください。
          </div>
        ) : notifState === 'granted' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--emerald)' }}>
            <CheckCircle2 size={16} /> 通知が許可されています。
          </div>
        ) : (
          <button className="btn-primary" onClick={requestNotifPermission}><Bell size={14} /> 通知を許可する</button>
        )}
      </div>

      {/* ===== Dashboard Alert Settings ===== */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} color="#f97316" />
          ダッシュボード アラート
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
          期限が近いタスク・イベントをダッシュボード上部に表示します。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={store.integrations.dashAlertEnabled}
              onChange={e => store.updateIntegrations({ dashAlertEnabled: e.target.checked })}
              style={{ accentColor: '#f97316', width: 16, height: 16 }}
            />
            <span style={{ fontSize: 14 }}>アラートを表示する</span>
          </label>
          {store.integrations.dashAlertEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>通知タイミング</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[2, 3, 5, 7].map(days => (
                  <button
                    key={days}
                    onClick={() => store.updateIntegrations({ dashAlertDays: days })}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                      background: store.integrations.dashAlertDays === days
                        ? 'linear-gradient(135deg, #f97316, #ef4444)'
                        : 'var(--surface-2)',
                      color: store.integrations.dashAlertDays === days ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    {days}日前
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Google Drive / Zapier ===== */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HardDrive size={18} color="#4285F4" />
          バックアップ・データ管理
        </h2>
        {supabase && (
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSupabaseSync}
              disabled={supabaseSyncing}
              style={{ background: 'linear-gradient(135deg, #6366f1, #0ea5e9)' }}
            >
              <Cloud size={14} /> {supabaseSyncing ? '同期中...' : 'このデバイスのデータをクラウドに保存'}
            </button>
            {supabaseMsg && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: supabaseMsg.includes('完了') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${supabaseMsg.includes('完了') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: 13, color: supabaseMsg.includes('完了') ? 'var(--emerald-light)' : '#ef4444' }}>
                {supabaseMsg}
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0' }}>
          <button className="btn-primary" onClick={handleExport}><Download size={14} /> JSONをダウンロード</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><Upload size={14} /> JSONをインポート</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
        {importMsg && (
          <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 6, background: importMsg.includes('完了') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${importMsg.includes('完了') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: 13, color: importMsg.includes('完了') ? 'var(--emerald-light)' : '#ef4444' }}>
            {importMsg}
          </div>
        )}
      </div>

      {/* Subject Manager */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showSubjectManager ? 16 : 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>科目管理</h2>
          <button className="btn-secondary" onClick={() => setShowSubjectManager(!showSubjectManager)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {showSubjectManager ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {showSubjectManager ? '閉じる' : '管理する'}
          </button>
        </div>
        {showSubjectManager && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {subjects.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>科目が登録されていません</div>
            ) : subjects.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editSubject?.id === s.id ? (
                  <>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {SUBJECT_COLORS.map(c => (
                        <div key={c} onClick={() => setEditSubject(e => e ? { ...e, color: c } : e)} style={{ width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', border: editSubject.color === c ? '2px solid var(--emerald)' : '1px solid var(--border)' }}>
                          <span style={{ display: 'block', width: '100%', height: '100%', background: c }} />
                        </div>
                      ))}
                    </div>
                    <input className="input" value={editSubject.name} onChange={e => setEditSubject(x => x ? { ...x, name: e.target.value } : x)} style={{ flex: 1 }} autoFocus placeholder="科目名" title="科目名" />
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { store.updateSubject(s.id, { name: editSubject.name, color: editSubject.color }); setEditSubject(null) }}>保存</button>
                    <button className="btn-ghost" onClick={() => setEditSubject(null)}><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: s.color, flexShrink: 0, forcedColorAdjust: 'none' } as React.CSSProperties} />
                    <span style={{ flex: 1, fontSize: 14 }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tasks.filter(t => t.subjectId === s.id).length}件</span>
                    <button className="btn-ghost" style={{ padding: '4px 6px' }} onClick={() => setEditSubject({ id: s.id, name: s.name, color: s.color })}><Pencil size={13} /></button>
                    <button className="btn-ghost" style={{ padding: '4px 6px', color: '#ef4444' }} onClick={() => { if (confirm(`「${s.name}」を削除しますか？`)) store.deleteSubject(s.id) }}><Trash2 size={13} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 20, borderColor: 'rgba(239,68,68,0.2)' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} /> 危険な操作
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px' }}>この操作は取り消せません。事前にバックアップしてください。</p>
        <button className="btn-danger" onClick={() => { if (confirm('すべてのデータを削除しますか？')) store.resetData() }}>
          <Trash2 size={14} /> すべてのデータを削除
        </button>
      </div>
    </div>
  )
}
