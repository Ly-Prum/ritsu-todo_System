'use client'
import { useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { sendSlackTest } from '@/lib/slack'
import type { AppData, SlackChannel } from '@/lib/types'
import {
  Download, Upload, Trash2, BookOpen, CheckSquare, Clock, StickyNote,
  AlertTriangle, Pencil, X, Bell, ExternalLink, Send,
  HardDrive, ChevronDown, ChevronRight, CheckCircle2, Loader, Plus
} from 'lucide-react'
import { SUBJECT_COLORS } from '@/lib/utils'
import { useT } from '@/hooks/useT'
import GradientText from '@/components/GradientText'

type SendState = 'idle' | 'loading' | 'ok' | 'error'

export default function SettingsPage() {
  const store = useStore()
  const t = useT()
  const { language, setLanguage } = store
  const fileRef = useRef<HTMLInputElement>(null)
  const iconRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)
  const bgMobileRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  const [showSubjectManager, setShowSubjectManager] = useState(false)
  const [editSubject, setEditSubject] = useState<{ id: string; name: string; color: string } | null>(null)

  // Slack general webhook
  const [slackUrl, setSlackUrl] = useState(store.integrations.slackWebhookUrl)
  const [slackSaveState, setSlackSaveState] = useState<SendState>('idle')
  const [slackTestState, setSlackTestState] = useState<SendState>('idle')
  const [slackTestMsg, setSlackTestMsg] = useState('')

  // Slack channel management
  const [showChannelForm, setShowChannelForm] = useState(false)
  const [editChannelId, setEditChannelId] = useState<string | null>(null)
  const [channelForm, setChannelForm] = useState({ name: '', webhookUrl: '' })

  // Mentor message
  const [selectedChannelId, setSelectedChannelId] = useState('')
  const [mentorMsg, setMentorMsg] = useState('')
  const [mentorSendState, setMentorSendState] = useState<SendState>('idle')
  const [mentorSendMsg, setMentorSendMsg] = useState('')

  const [notifState, setNotifState] = useState<'default' | 'granted' | 'denied'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  )

  const { tasks, subjects, timetable, memos, slackChannels, addSlackChannel, updateSlackChannel, deleteSlackChannel, sidebarIcon, setSidebarIcon, bgImage, setBgImage, bgImageMobile, setBgImageMobile, headerBanner, setHeaderBanner, headerBannerY, setHeaderBannerY, headerBannerZoom, setHeaderBannerZoom } = store

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
      const img = new Image()
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

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 1920, 400)
    setHeaderBanner(compressed)
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

  function saveSlackUrl() {
    store.updateIntegrations({ slackWebhookUrl: slackUrl })
    setSlackSaveState('ok')
    setTimeout(() => setSlackSaveState('idle'), 2000)
  }

  async function testSlack() {
    if (!slackUrl) return
    setSlackTestState('loading')
    setSlackTestMsg('')
    const result = await sendSlackTest(slackUrl)
    setSlackTestState(result.ok ? 'ok' : 'error')
    setSlackTestMsg(result.ok ? '✅ Slackにテストメッセージを送信しました！' : (result.error ?? 'エラー'))
    setTimeout(() => { setSlackTestState('idle'); setSlackTestMsg('') }, 4000)
  }

  function saveChannel() {
    if (!channelForm.name.trim() || !channelForm.webhookUrl.trim()) return
    if (editChannelId) {
      updateSlackChannel(editChannelId, { name: channelForm.name.trim(), webhookUrl: channelForm.webhookUrl.trim() })
    } else {
      addSlackChannel({ name: channelForm.name.trim(), webhookUrl: channelForm.webhookUrl.trim() })
    }
    setShowChannelForm(false)
    setEditChannelId(null)
    setChannelForm({ name: '', webhookUrl: '' })
  }

  function openEditChannel(ch: SlackChannel) {
    setEditChannelId(ch.id)
    setChannelForm({ name: ch.name, webhookUrl: ch.webhookUrl })
    setShowChannelForm(true)
  }

  async function sendMentorMessage() {
    const ch = slackChannels.find(c => c.id === selectedChannelId)
    if (!ch || !mentorMsg.trim()) return
    setMentorSendState('loading')
    setMentorSendMsg('')
    try {
      const res = await fetch(ch.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `📩 *Ritsuki より*\n${mentorMsg.trim()}` }),
      })
      if (res.ok) {
        setMentorSendState('ok')
        setMentorSendMsg(`「${ch.name}」に送信しました`)
        setMentorMsg('')
      } else {
        setMentorSendState('error')
        setMentorSendMsg(`送信失敗 (${res.status})`)
      }
    } catch {
      setMentorSendState('error')
      setMentorSendMsg('ネットワークエラー')
    }
    setTimeout(() => { setMentorSendState('idle'); setMentorSendMsg('') }, 4000)
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifState(perm)
    store.updateIntegrations({ notificationsEnabled: perm === 'granted' })
  }

  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px' }}><GradientText>{t('set_title')}</GradientText></h1>

      {/* 言語設定 */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
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

      {/* サイドバーアイコン */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>🖼️ サイドバーアイコン</h2>
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
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>🌄 背景画像</h2>
        {typeof window !== 'undefined' && window.innerWidth >= 768 ? (
          <div>
            <div style={{ width: 96, height: 60, borderRadius: 8, overflow: 'hidden', background: bgImage ? `url(${bgImage}) center/cover` : 'var(--surface-2)', border: '1px solid var(--border)', position: 'relative', marginBottom: 8 }}>
              {!bgImage && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼️</span>}
            </div>
            <button className="btn-primary" onClick={() => bgRef.current?.click()} style={{ fontSize: 13, marginBottom: 6, marginRight: 8 }}>アップロード</button>
            {bgImage && <button className="btn-ghost" onClick={() => setBgImage('')} style={{ fontSize: 12, color: '#ef4444' }}>削除</button>}
            <input ref={bgRef} type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
          </div>
        ) : (
          <div>
            <div style={{ width: 40, height: 60, borderRadius: 8, overflow: 'hidden', background: bgImageMobile ? `url(${bgImageMobile}) center/cover` : 'var(--surface-2)', border: '1px solid var(--border)', position: 'relative', marginBottom: 8 }}>
              {!bgImageMobile && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🖼️</span>}
            </div>
            <button className="btn-primary" onClick={() => bgMobileRef.current?.click()} style={{ fontSize: 13, marginBottom: 6, marginRight: 8 }}>アップロード</button>
            {bgImageMobile && <button className="btn-ghost" onClick={() => setBgImageMobile('')} style={{ fontSize: 12, color: '#ef4444' }}>削除</button>}
            <input ref={bgMobileRef} type="file" accept="image/*" onChange={handleBgMobileUpload} style={{ display: 'none' }} />
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0' }}>自動で圧縮します。このデバイス用の背景を設定できます。</p>
      </div>

      {/* ヘッダーバナー */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>🖼️ ヘッダーバナー</h2>
        <div style={{ width: 280, height: 90, borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {headerBanner ? (
            <img
              src={headerBanner}
              alt=""
              style={{
                width: `${(headerBannerZoom ?? 1) * 100}%`,
                height: `${(headerBannerZoom ?? 1) * 100}%`,
                maxWidth: 'none',
                objectFit: 'cover',
                objectPosition: `center ${headerBannerY}%`,
                display: 'block',
                flexShrink: 0,
              }}
            />
          ) : (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>バナー未設定</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: headerBanner ? 14 : 0 }}>
          <button className="btn-primary" onClick={() => bannerRef.current?.click()} style={{ fontSize: 13 }}>アップロード</button>
          {headerBanner && <button className="btn-ghost" onClick={() => setHeaderBanner('')} style={{ fontSize: 12, color: '#ef4444' }}>削除</button>}
        </div>
        {headerBanner && (
          <div style={{ marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>上下位置</span>
                <span>{headerBannerY}%</span>
              </label>
              <input
                type="range" min={0} max={100} value={headerBannerY}
                onChange={e => setHeaderBannerY(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--emerald)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>上</span><span>下</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>ズーム</span>
                <span>{Math.round((headerBannerZoom ?? 1) * 100)}%</span>
              </label>
              <input
                type="range" min={100} max={300} step={5} value={Math.round((headerBannerZoom ?? 1) * 100)}
                onChange={e => setHeaderBannerZoom(Number(e.target.value) / 100)}
                style={{ width: '100%', accentColor: 'var(--emerald)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>縮小</span><span>拡大</span>
              </div>
            </div>
          </div>
        )}
        <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 0' }}>全ページ上部に表示されるバナー画像です。横長の画像が適しています。</p>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>データ概要</h2>
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

      {/* ===== Slack チャンネル管理 ===== */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#4A154B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13 }}>💬</span>
            </div>
            Slack チャンネル管理
          </h2>
          <button className="btn-primary" onClick={() => { setEditChannelId(null); setChannelForm({ name: '', webhookUrl: '' }); setShowChannelForm(true) }} style={{ fontSize: 12 }}>
            <Plus size={13} /> チャンネル追加
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
          部活・担任・メンターなど、チャンネルごとに Webhook URL を登録してメッセージを送れます。
        </p>

        {/* Webhook setup guide */}
        <div className="card-2" style={{ padding: '12px 14px', marginBottom: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, fontSize: 13 }}>📋 Webhook URL の取得手順</div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li><a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" style={{ color: 'var(--sky)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>api.slack.com/apps <ExternalLink size={10} /></a> → ログイン</li>
            <li>「Create New App」→「From scratch」→ アプリ名を入力</li>
            <li>「Incoming Webhooks」を有効化 → 「Add New Webhook to Workspace」</li>
            <li>通知したいチャンネルを選択 → 表示された URL をコピー</li>
          </ol>
        </div>

        {/* Channel list */}
        {slackChannels.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            チャンネルが登録されていません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {slackChannels.map(ch => (
              <div key={ch.id} className="card-2" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>💬</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ch.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ch.webhookUrl.substring(0, 50)}...
                  </div>
                </div>
                <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => openEditChannel(ch)}><Pencil size={13} /></button>
                <button className="btn-ghost" style={{ padding: '4px 8px', color: '#ef4444' }} onClick={() => { if (confirm('削除しますか？')) deleteSlackChannel(ch.id) }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}

        {/* Channel form modal */}
        {showChannelForm && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowChannelForm(false)}>
            <div className="modal" style={{ maxWidth: 440 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{editChannelId ? 'チャンネルを編集' : 'チャンネルを追加'}</h3>
                <button className="btn-ghost" onClick={() => setShowChannelForm(false)}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">チャンネル名 *</label>
                  <input className="input" value={channelForm.name} onChange={e => setChannelForm(f => ({ ...f, name: e.target.value }))} placeholder="例: 部活動, 担任, メンター" autoFocus />
                </div>
                <div>
                  <label className="label">Webhook URL *</label>
                  <input className="input" value={channelForm.webhookUrl} onChange={e => setChannelForm(f => ({ ...f, webhookUrl: e.target.value }))} placeholder="https://hooks.slack.com/services/..." style={{ fontFamily: 'monospace', fontSize: 11 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowChannelForm(false)}>キャンセル</button>
                <button className="btn-primary" onClick={saveChannel} disabled={!channelForm.name.trim() || !channelForm.webhookUrl.trim()}>保存</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== メンターへメッセージ ===== */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Send size={16} color="var(--sky)" />
          Slack にメッセージを送る
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
          登録済みチャンネルにメッセージを送信できます。メンターへの質問・連絡に活用してください。
        </p>
        {slackChannels.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
            先にチャンネルを追加してください
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="label">送信先チャンネル</label>
              <select className="input" value={selectedChannelId} onChange={e => setSelectedChannelId(e.target.value)}>
                <option value="">チャンネルを選択...</option>
                {slackChannels.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">メッセージ</label>
              <textarea className="input" value={mentorMsg} onChange={e => setMentorMsg(e.target.value)} placeholder="質問や連絡内容を入力..." rows={3} />
            </div>
            <button
              className="btn-primary"
              onClick={sendMentorMessage}
              disabled={!selectedChannelId || !mentorMsg.trim() || mentorSendState === 'loading'}
              style={{ alignSelf: 'flex-start' }}
            >
              {mentorSendState === 'loading' ? <><Loader size={14} /> 送信中...</> : <><Send size={14} /> 送信する</>}
            </button>
            {mentorSendMsg && (
              <div style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, background: mentorSendState === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${mentorSendState === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: mentorSendState === 'ok' ? 'var(--emerald-light)' : '#ef4444' }}>
                {mentorSendMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== 通知設定 Webhook（アラーム用） ===== */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#4A154B', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13 }}>🔔</span>
          </div>
          Slack アラーム通知（デフォルト）
          {store.integrations.slackWebhookUrl && (
            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 10 }}>設定済み</span>
          )}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>
          課題・イベントのアラームをここで設定した Webhook URL に送信します。上記のチャンネル管理とは別に「通知専用チャンネル」を設定するのがお勧めです。
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input className="input" value={slackUrl} onChange={e => setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
          <button className="btn-primary" onClick={saveSlackUrl} disabled={!slackUrl.trim()} style={{ flexShrink: 0 }}>
            {slackSaveState === 'ok' ? '✓ 保存' : '保存'}
          </button>
        </div>
        <button className="btn-secondary" onClick={testSlack} disabled={!slackUrl.trim() || slackTestState === 'loading'} style={{ fontSize: 13 }}>
          {slackTestState === 'loading' ? <><Loader size={13} /> 送信中...</> : <><Send size={13} /> テスト送信</>}
        </button>
        {slackTestMsg && (
          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, fontSize: 13, background: slackTestState === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${slackTestState === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: slackTestState === 'ok' ? 'var(--emerald-light)' : '#ef4444' }}>
            {slackTestMsg}
          </div>
        )}
      </div>

      {/* ===== Browser Notifications ===== */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color="var(--sky)" />
          ブラウザ通知
          <span className="badge" style={{ background: notifState === 'granted' ? 'rgba(16,185,129,0.15)' : notifState === 'denied' ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)', color: notifState === 'granted' ? 'var(--emerald)' : notifState === 'denied' ? '#ef4444' : '#8b5cf6', border: `1px solid ${notifState === 'granted' ? 'rgba(16,185,129,0.3)' : notifState === 'denied' ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}`, fontSize: 10 }}>
            {notifState === 'granted' ? '✓ 許可済み' : notifState === 'denied' ? '✗ ブロック中' : '未設定'}
          </span>
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
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

      {/* ===== Google Drive / Zapier ===== */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HardDrive size={18} color="#4285F4" />
          バックアップ・データ管理
        </h2>
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
        <div className="card-2" style={{ padding: '12px 14px', fontSize: 12, lineHeight: 1.8, color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>📧 Gmail 学校メール → Slack 自動転送（Zapier）</div>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li><a href="https://zapier.com" target="_blank" rel="noreferrer" style={{ color: 'var(--sky)' }}>zapier.com</a> で無料アカウントを作成</li>
            <li>トリガー: <strong>Gmail: New Email Matching Search</strong></li>
            <li>検索条件例: <code style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 3 }}>from:n-high.jp OR subject:お知らせ</code></li>
            <li>アクション: <strong>Slack: Send Channel Message</strong> → 通知チャンネルを指定</li>
          </ol>
          <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(16,185,129,0.08)', borderRadius: 6, color: 'var(--emerald)' }}>
            ✅ 学校メールが届くたびに Slack に自動通知（無料：100回/月）
          </div>
        </div>
      </div>

      {/* Subject Manager */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
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
                        <div key={c} onClick={() => setEditSubject(e => e ? { ...e, color: c } : e)} style={{ width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', border: editSubject.color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.2)' }}>
                          <span style={{ display: 'block', width: '100%', height: '100%', background: c }} />
                        </div>
                      ))}
                    </div>
                    <input className="input" value={editSubject.name} onChange={e => setEditSubject(x => x ? { ...x, name: e.target.value } : x)} style={{ flex: 1 }} autoFocus />
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { store.updateSubject(s.id, { name: editSubject.name, color: editSubject.color }); setEditSubject(null) }}>保存</button>
                    <button className="btn-ghost" onClick={() => setEditSubject(null)}><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
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
