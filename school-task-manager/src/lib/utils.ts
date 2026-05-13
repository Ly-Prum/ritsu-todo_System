export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const PRIORITY_LABELS = { low: '低', medium: '中', high: '高' }
export const PRIORITY_COLORS = {
  low: 'bg-sky-100 text-sky-700 border border-sky-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  high: 'bg-rose-100 text-rose-700 border border-rose-200',
}
export const STATUS_LABELS = { pending: '未着手', 'in-progress': '進行中', completed: '完了' }
export const STATUS_COLORS = {
  pending: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  'in-progress': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  completed: 'bg-teal-100 text-teal-700 border border-teal-200',
}
export const TYPE_LABELS = {
  homework: '宿題',
  exam: '試験',
  project: 'プロジェクト',
  report: 'レポート',
  other: 'その他',
}
export const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export const SUBJECT_COLORS = [
  '#10b981', '#0ea5e9', '#14b8a6', '#3b82f6',
  '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899',
  '#06b6d4', '#84cc16',
]

export const MEMO_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

export const EVENT_TYPE_LABELS = {
  schooling: 'スクーリング',
  exam: '試験',
  event: 'イベント',
  meeting: '面談',
  other: 'その他',
}
export const EVENT_COLORS = ['#10b981','#0ea5e9','#8b5cf6','#f97316','#ef4444','#ec4899']

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDueDate(dueDate: string): string {
  const days = getDaysUntilDue(dueDate)
  const date = new Date(dueDate)
  const formatted = `${date.getMonth() + 1}/${date.getDate()}`
  if (days < 0) return `${formatted} (${Math.abs(days)}日超過)`
  if (days === 0) return `${formatted} (今日)`
  if (days === 1) return `${formatted} (明日)`
  return `${formatted} (${days}日後)`
}

export function getDueDateColor(dueDate: string): string {
  const days = getDaysUntilDue(dueDate)
  if (days < 0) return 'text-rose-600 font-bold'
  if (days <= 1) return 'text-rose-500 font-semibold'
  if (days <= 3) return 'text-amber-500'
  if (days <= 7) return 'text-sky-600'
  return 'text-zinc-400'
}
