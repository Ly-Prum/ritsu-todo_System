import type { Task, Subject } from './types'
import { getDaysUntilDue, TYPE_LABELS, PRIORITY_LABELS } from './utils'

function getSubjectName(subjects: Subject[], id?: string) {
  return subjects.find(s => s.id === id)?.name ?? '未設定'
}

function buildDailyDigestPayload(tasks: Task[], subjects: Subject[]) {
  const today = new Date().toISOString().split('T')[0]
  const pending = tasks.filter(t => t.status !== 'completed')

  const overdue = pending.filter(t => t.dueDate < today)
  const dueToday = pending.filter(t => t.dueDate === today)
  const dueSoon = pending.filter(t => {
    const d = getDaysUntilDue(t.dueDate)
    return d >= 1 && d <= 3
  })
  const upcoming = pending.filter(t => {
    const d = getDaysUntilDue(t.dueDate)
    return d >= 4 && d <= 7
  })

  const dateStr = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `📚 Ritsuki の課題リマインダー — ${dateStr}` },
    },
  ]

  if (overdue.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*🚨 期限超過（${overdue.length}件）*` },
    })
    overdue.forEach(t => {
      const due = new Date(t.dueDate + 'T00:00:00')
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *${t.title}* — ${getSubjectName(subjects, t.subjectId)} | ${TYPE_LABELS[t.type]} | 締切: ${due.getMonth()+1}/${due.getDate()}`,
        },
      })
    })
  }

  if (dueToday.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*🔴 今日締切（${dueToday.length}件）*` },
    })
    dueToday.forEach(t => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *${t.title}* — ${getSubjectName(subjects, t.subjectId)} | ${TYPE_LABELS[t.type]} | 優先度: ${PRIORITY_LABELS[t.priority]}`,
        },
      })
    })
  }

  if (dueSoon.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*🟡 3日以内（${dueSoon.length}件）*` },
    })
    dueSoon.forEach(t => {
      const days = getDaysUntilDue(t.dueDate)
      const due = new Date(t.dueDate + 'T00:00:00')
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *${t.title}* — ${getSubjectName(subjects, t.subjectId)} | ${due.getMonth()+1}/${due.getDate()}（${days === 1 ? '明日' : `${days}日後`}）`,
        },
      })
    })
  }

  if (upcoming.length > 0) {
    blocks.push({ type: 'divider' })
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*🟢 今週中（${upcoming.length}件）*` },
    })
    upcoming.forEach(t => {
      const due = new Date(t.dueDate + 'T00:00:00')
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• ${t.title} — ${getSubjectName(subjects, t.subjectId)} | ${due.getMonth()+1}/${due.getDate()}`,
        },
      })
    })
  }

  if (overdue.length === 0 && dueToday.length === 0 && dueSoon.length === 0 && upcoming.length === 0) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: '✅ 今週の課題はすべて完了しています！' },
    })
  }

  blocks.push({ type: 'divider' })
  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: '📱 StudyHub で確認 → ホーム画面のアイコンから開く' }],
  })

  return { blocks }
}

export async function sendSlackDigest(webhookUrl: string, tasks: Task[], subjects: Subject[]): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
    return { ok: false, error: 'Webhook URLの形式が正しくありません' }
  }

  const payload = buildDailyDigestPayload(tasks, subjects)

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return { ok: true }
    return { ok: false, error: `Slack エラー: ${res.status}` }
  } catch (e) {
    return { ok: false, error: 'ネットワークエラー。Webhook URLを確認してください。' }
  }
}

export async function sendSlackTest(webhookUrl: string): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
    return { ok: false, error: 'Webhook URLの形式が正しくありません（https://hooks.slack.com/ で始まる必要があります）' }
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '✅ StudyHub のテスト通知です。接続成功！' }),
    })
    if (res.ok) return { ok: true }
    return { ok: false, error: `Slack エラー: ${res.status}` }
  } catch (e) {
    return { ok: false, error: 'ネットワークエラー' }
  }
}
