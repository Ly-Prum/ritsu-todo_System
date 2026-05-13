'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatDueDate, getDueDateColor, PRIORITY_LABELS, PRIORITY_COLORS, TYPE_LABELS, EVENT_TYPE_LABELS } from '@/lib/utils'
import {
  CheckCircle2, Clock, AlertTriangle, BookOpen, TrendingUp,
  CalendarDays, Plus, Trash2, ChevronDown, ChevronUp, CalendarCheck
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { tasks, subjects, quickTodos, addQuickTodo, updateQuickTodo, deleteQuickTodo, events } = useStore()
  const [todoInput, setTodoInput] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideTab, setGuideTab] = useState<'start' | 'features' | 'faq'>('start')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const toggleItem = (id: string) => setOpenItems(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const pending = tasks.filter(t => t.status !== 'completed')
  const completed = tasks.filter(t => t.status === 'completed')
  const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr)
  const todayTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed')
  const weekTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate >= todayStr && t.dueDate <= weekEndStr)

  const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

  const getSubjectName = (id?: string) => subjects.find(s => s.id === id)?.name ?? '未設定'
  const getSubjectColor = (id?: string) => subjects.find(s => s.id === id)?.color ?? '#8a92a6'

  const urgentTasks = pending
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)

  const upcomingEvents = events
    .filter(e => e.date >= todayStr && e.date <= weekEndStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const todayTodos = quickTodos.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  function addTodo() {
    if (!todoInput.trim()) return
    addQuickTodo(todoInput.trim())
    setTodoInput('')
  }

  function formatEventDate(date: string) {
    const d = new Date(date + 'T00:00:00')
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div style={{ padding: '20px 14px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, marginBottom: 4 }}>
          <span className="gradient-text">Ritsuki Dashboard</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
          {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日（
          {['日','月','火','水','木','金','土'][today.getDay()]}）
        </p>
      </div>

      {/* Guide collapsible */}
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setGuideOpen(o => !o)}
            style={{ background: 'linear-gradient(135deg, var(--emerald), var(--sky))', borderRadius: 6, padding: '4px 10px', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            📖 使い方ガイド {guideOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {([
            { id: 'start', label: '👀 使用方法' },
            { id: 'features', label: '📋 各機能一覧' },
            { id: 'faq', label: '⚠️ 注意・FAQ' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setGuideOpen(true); setGuideTab(tab.id) }}
              style={{
                background: (guideOpen && guideTab === tab.id) ? 'rgba(16,185,129,0.15)' : 'transparent',
                border: (guideOpen && guideTab === tab.id) ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)',
                borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                color: (guideOpen && guideTab === tab.id) ? 'var(--emerald-light)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {guideOpen && (
          <div style={{ borderTop: '1px solid var(--border)' }}>

            {/* 使用方法 */}
            <div style={{ display: guideTab === 'start' ? 'block' : 'none', padding: '16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--emerald-light)', marginBottom: 12 }}>🚀 セットアップ手順</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { step: '1', title: '科目を登録する', detail: '「課題・宿題」ページ右上の「科目追加」ボタンから、受講している科目（英語・数学など）を登録します。カラーを設定しておくとカレンダーや時間割で見分けやすくなります。', link: '/tasks', linkLabel: '課題ページへ' },
                  { step: '2', title: '時間割を登録する', detail: '「時間割」ページでセルをタップして科目を割り当てます。教室・担当教師・取得単位数も登録できます。右上「時限設定」で各時限の開始・終了時刻を変更できます。', link: '/timetable', linkLabel: '時間割ページへ' },
                  { step: '3', title: 'スクーリング・イベントを登録する', detail: '「イベント」ページでスクーリング日程・試験・面談などを登録します。アラームを設定すると締切前日・当日にブラウザ通知が届きます。「メモも作成する」にチェックを入れると詳細メモが自動生成されます。', link: '/events', linkLabel: 'イベントページへ' },
                  { step: '4', title: '課題・宿題を登録する', detail: '「課題・宿題」ページで提出課題を登録します。科目・種別（宿題/試験/レポート）・締切日・優先度・予想所要時間を設定できます。ステータスを「進行中 → 完了」と更新してダッシュボードの達成率を上げましょう。', link: '/tasks', linkLabel: '課題ページへ' },
                  { step: '5', title: 'マイリンクを整理する', detail: '「マイリンク」ページに Slack・Zenstudy・N Lobby・Zoom・Adobe など日常的に使うサービスをまとめています。「リンクを追加」から自分のツールを追加でき、カテゴリで整理できます。', link: '/links', linkLabel: 'マイリンクへ' },
                  { step: '6', title: 'Slack 通知を設定する（任意）', detail: '「設定・連携管理」ページで Slack の Incoming Webhook URL を登録すると、アラーム通知を Slack に送れます。部活・担任・メンターなど複数チャンネルを登録してメッセージを送ることもできます。', link: '/settings', linkLabel: '設定ページへ' },
                ].map(({ step, title, detail, link, linkLabel }) => {
                  const isOpen = openItems.has(`step-${step}`)
                  return (
                    <div key={step} className="card-2" style={{ overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleItem(`step-${step}`)}
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--emerald), var(--sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>{step}</div>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</span>
                        {isOpen ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 14px 14px 52px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                          {detail}
                          <div style={{ marginTop: 8 }}>
                            <Link href={link}><button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>{linkLabel} →</button></Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 各機能一覧 */}
            <div style={{ display: guideTab === 'features' ? 'block' : 'none', padding: '16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--sky-light)', marginBottom: 12 }}>📋 各ページの機能一覧</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { icon: '🏠', title: 'ダッシュボード（このページ）', items: ['クイック TODO：今日やることを素早くメモ', '統計カード：未完了・期限超過・達成率', '優先タスク：締切が近い課題を一覧表示', '今週のイベント：直近の予定を確認'] },
                  { icon: '✅', title: '課題・宿題', items: ['課題の登録・編集・削除', '今日/今週/今月/期限切れでフィルター', 'ステータス管理（未着手→進行中→完了）', '科目・優先度・種別で絞り込み検索'] },
                  { icon: '📅', title: 'カレンダー', items: ['月表示で課題とイベントを一覧', '日付クリックで課題またはイベントを作成', '課題は科目カラーで色分け表示', 'イベントは別スタイルで区別表示'] },
                  { icon: '📌', title: 'イベント（スクーリング等）', items: ['スクーリング・試験・面談・イベントを登録', 'アラーム設定：1時間前/前日/3日前から選択', 'メモ自動生成：作成時に紐付きメモを作成', '開催場所・説明文も記録可能'] },
                  { icon: '🔗', title: 'マイリンク', items: ['Slack・Zenstudy・Adobe 等のショートカット', 'カテゴリ別に整理（N高/コミュニケーション等）', 'リンクは自由に追加・編集・削除できる'] },
                  { icon: '🗒️', title: 'メモ', items: ['カラーカードでメモを管理', 'ピン留め機能で重要メモを上部に固定', 'カテゴリ設定で整理（授業ノート/パスワード等）'] },
                  { icon: '⏰', title: '時間割', items: ['月〜金 × 7時限のグリッド形式', 'セルをタップして科目を登録', '教室・取得単位数も記録できる'] },
                  { icon: '⚙️', title: '設定・連携管理', items: ['Slack チャンネル管理（複数登録可）', 'メンター・担任へのメッセージ直接送信', 'JSONエクスポート/インポート（バックアップ）'] },
                ].map(({ icon, title, items }) => {
                  const isOpen = openItems.has(`feat-${title}`)
                  return (
                    <div key={title} className="card-2" style={{ overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleItem(`feat-${title}`)}
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
                      >
                        <span style={{ fontSize: 18 }}>{icon}</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</span>
                        {isOpen ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                      </button>
                      {isOpen && (
                        <ul style={{ margin: 0, padding: '0 14px 14px 48px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 2 }}>
                          {items.map(item => <li key={item}>{item}</li>)}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 注意・FAQ */}
            <div style={{ display: guideTab === 'faq' ? 'block' : 'none', padding: '16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginBottom: 12 }}>⚠️ 注意事項・よくある質問</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { q: 'データはどこに保存されますか？', a: 'すべてのデータはこのブラウザのローカルストレージに保存されます。ブラウザのデータを消去するとすべて削除されます。定期的に「設定」ページからJSONをダウンロードしてGoogle Driveなどにバックアップしてください。', type: 'warn' },
                  { q: 'スマホ（Android）でアプリとして使うには？', a: 'Chrome でこのページを開き、右上「︙」メニュー →「ホーム画面に追加」または「アプリをインストール」を選ぶと、アプリアイコンがホーム画面に追加されます。', type: 'info' },
                  { q: 'ブラウザ通知が届かない場合は？', a: '「設定」ページの「ブラウザ通知」セクションで許可状態を確認してください。「ブロック中」の場合は Chrome の設定 →「サイトの設定」→「通知」→ このサイトを「許可」に変更してください。', type: 'info' },
                  { q: 'Slack 通知の設定方法は？', a: '「設定」ページの「Slack チャンネル管理」でチャンネルを追加します。Slack の api.slack.com/apps でアプリを作成し、Incoming Webhooks を有効にして Webhook URL を取得します。', type: 'info' },
                  { q: 'マイリンクのツールはどれだけ追加できますか？', a: '制限なく追加できます。ローカルストレージが許す限り（通常5〜10MB）追加可能です。カテゴリで整理すると使いやすくなります。', type: 'ok' },
                  { q: 'N高のテスト・課題をここで管理すべきですか？', a: 'テストや提出はN高の公式アプリ（Zenstudy等）で行います。このアプリはあくまで「締切・スケジュールの管理」と「見落とし防止」が目的です。', type: 'ok' },
                ].map(({ q, a, type }) => {
                  const isOpen = openItems.has(`faq-${q}`)
                  const color = type === 'warn' ? '#f59e0b' : type === 'ok' ? 'var(--emerald)' : 'var(--sky)'
                  return (
                    <div key={q} className="card-2" style={{ overflow: 'hidden', borderLeft: `3px solid ${color}` }}>
                      <button
                        onClick={() => toggleItem(`faq-${q}`)}
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
                      >
                        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Q. {q}</span>
                        {isOpen ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 14px 14px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                          A. {a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>未完了</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginTop: 4 }}>{pending.length}</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(14,165,233,0.1)' }}>
              <Clock size={20} color="var(--sky)" />
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>課題 / タスク</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>期限超過</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: overdue.length > 0 ? '#ef4444' : 'var(--text)', lineHeight: 1.2, marginTop: 4 }}>{overdue.length}</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle size={20} color={overdue.length > 0 ? '#ef4444' : 'var(--text-muted)'} />
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>要対応タスク</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>完了済み</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--emerald-light)', lineHeight: 1.2, marginTop: 4 }}>{completed.length}</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)' }}>
              <CheckCircle2 size={20} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>合計 {tasks.length} 件</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>達成率</div>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }} className="gradient-text">{completionRate}%</div>
            </div>
            <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16,185,129,0.1)' }}>
              <TrendingUp size={20} color="var(--emerald)" />
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Quick TODO */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ クイックTODO
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>今日やること</span>
        </h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="input"
            placeholder="やることを入力..."
            value={todoInput}
            onChange={e => setTodoInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={addTodo} disabled={!todoInput.trim()}>
            <Plus size={14} />
          </button>
        </div>
        {todayTodos.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
            TODOを追加してみましょう
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todayTodos.map(todo => (
              <div
                key={todo.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  background: 'var(--surface-2)',
                  opacity: todo.completed ? 0.6 : 1,
                }}
              >
                <button
                  onClick={() => updateQuickTodo(todo.id, { completed: !todo.completed })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: todo.completed ? 'var(--emerald)' : 'var(--text-muted)', flexShrink: 0 }}
                >
                  {todo.completed ? <CheckCircle2 size={18} /> : <div style={{ width: 18, height: 18, border: '2px solid var(--text-muted)', borderRadius: '50%' }} />}
                </button>
                <span style={{ flex: 1, fontSize: 13, textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteQuickTodo(todo.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 20, borderColor: 'rgba(14,165,233,0.25)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={15} color="var(--sky)" />
            今後7日のイベント
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {upcomingEvents.map(ev => (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--surface-2)',
                borderLeft: `3px solid ${ev.color}`,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>{formatEventDate(ev.date)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{ev.title}</span>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 9999, background: ev.color + '25', color: ev.color }}>
                  {EVENT_TYPE_LABELS[ev.type]}
                </span>
              </div>
            ))}
          </div>
          <Link href="/events" style={{ display: 'block', textAlign: 'right', marginTop: 10 }}>
            <button className="btn-ghost" style={{ fontSize: 12 }}>すべて表示 →</button>
          </Link>
        </div>
      )}

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Urgent Tasks */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="var(--sky)" />
              優先タスク（締切順）
            </h2>
            <Link href="/tasks">
              <button className="btn-ghost" style={{ fontSize: 12 }}>すべて表示 →</button>
            </Link>
          </div>

          {urgentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--emerald)' }} />
              <div>未完了のタスクはありません！</div>
              <Link href="/tasks">
                <button className="btn-primary" style={{ marginTop: 12 }}>
                  <Plus size={14} /> タスクを追加
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {urgentTasks.map(task => (
                <div key={task.id} className="card-2" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 4, height: 36, borderRadius: 2, flexShrink: 0,
                    background: getSubjectColor(task.subjectId),
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {getSubjectName(task.subjectId)} · {TYPE_LABELS[task.type]}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className={getDueDateColor(task.dueDate)} style={{ fontSize: 12 }}>
                      {formatDueDate(task.dueDate)}
                    </span>
                    <span className={`badge ${PRIORITY_COLORS[task.priority]}`} style={{ fontSize: 10 }}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Today */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarDays size={15} color="var(--emerald)" />
              今日の締切
              <span style={{ background: 'var(--emerald)', color: 'white', borderRadius: 9999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {todayTasks.length}
              </span>
            </h3>
            {todayTasks.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>今日の締切なし ✓</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {todayTasks.map(t => (
                  <div key={t.id} style={{ fontSize: 13, padding: '8px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{getSubjectName(t.subjectId)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* This week */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={15} color="var(--sky)" />
              今週の課題
              <span style={{ background: 'var(--sky)', color: 'white', borderRadius: 9999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {weekTasks.length}
              </span>
            </h3>
            {weekTasks.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>今週の課題なし ✓</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {weekTasks.slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{t.title}</span>
                    <span className={getDueDateColor(t.dueDate)} style={{ fontSize: 11, flexShrink: 0 }}>{formatDueDate(t.dueDate)}</span>
                  </div>
                ))}
                {weekTasks.length > 5 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 4 }}>他 {weekTasks.length - 5} 件...</div>
                )}
              </div>
            )}
          </div>

          {/* Subjects */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>科目別未完了数</h3>
            {subjects.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>科目未登録</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subjects.map(s => {
                  const count = pending.filter(t => t.subjectId === s.id).length
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{s.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{count}件</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
