export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const PRIORITY_LABELS = { low: '低', medium: '中', high: '高' }
export const PRIORITY_COLORS = {
  low: 'bg-sky-100 text-sky-700 border border-sky-200 forced-color-adjust-none',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200 forced-color-adjust-none',
  high: 'bg-rose-100 text-rose-700 border border-rose-200 forced-color-adjust-none',
}
export const STATUS_LABELS = { pending: '未着手', 'in-progress': '進行中', completed: '完了' }
export const STATUS_COLORS = {
  pending: 'bg-zinc-100 text-zinc-600 border border-zinc-200 forced-color-adjust-none',
  'in-progress': 'bg-emerald-100 text-emerald-700 border border-emerald-200 forced-color-adjust-none',
  completed: 'bg-teal-100 text-teal-700 border border-teal-200 forced-color-adjust-none',
}
export const TYPE_LABELS = {
  homework: '課題',
  exam: '試験',
  project: 'プロジェクト',
  report: 'レポート',
  other: 'その他',
}
export const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export const SUBJECT_COLORS = [
  // Vivid
  '#10b981', '#0ea5e9', '#14b8a6', '#3b82f6',
  '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#a855f7',
  // Pastel
  '#6ee7b7', '#7dd3fc', '#5eead4', '#93c5fd',
  '#c4b5fd', '#fcd34d', '#fca5a5', '#f9a8d4',
  '#67e8f9', '#bef264', '#fdba74', '#d8b4fe',
  '#fbcfe8', '#fed7aa', '#bbf7d0', '#bae6fd',
]

export const MEMO_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#fca5a5', '#fdba74', '#fde68a', '#86efac',
  '#5eead4', '#93c5fd', '#c4b5fd', '#f9a8d4',
]

export const EVENT_TYPE_LABELS = {
  schooling: 'スクーリング',
  exam: '試験',
  event: 'イベント',
  meeting: '面談',
  club: '部活',
  other: 'その他',
}
export const EVENT_COLORS = [
  '#10b981','#0ea5e9','#8b5cf6','#f97316','#ef4444','#ec4899',
  '#14b8a6','#3b82f6','#f59e0b','#84cc16','#06b6d4','#a855f7',
  '#6ee7b7','#7dd3fc','#c4b5fd','#fcd34d','#fca5a5','#f9a8d4',
]

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDueDate(dueDate?: string): string {
  if (!dueDate) return '期限なし'
  const days = getDaysUntilDue(dueDate)
  const date = new Date(dueDate)
  const formatted = `${date.getMonth() + 1}/${date.getDate()}`
  if (days < 0) return `${formatted} (期限切れ)`
  if (days === 0) return `${formatted} (今日)`
  if (days === 1) return `${formatted} (明日)`
  return `${formatted} (${days}日後)`
}

export function getDueDateColor(dueDate?: string): string {
  if (!dueDate) return 'text-zinc-400'
  const days = getDaysUntilDue(dueDate)
  if (days < 0) return 'text-rose-600 font-bold'
  if (days <= 1) return 'text-rose-500 font-semibold'
  if (days <= 3) return 'text-amber-500'
  if (days <= 7) return 'text-sky-600'
  return 'text-zinc-400'
}
