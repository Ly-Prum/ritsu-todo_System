'use client'
import ProgressTable from '@/components/ProgressTable'

export default function ProgressPage() {
  return (
    <div style={{ padding: '16px 14px', maxWidth: 1600, width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ background: 'linear-gradient(135deg, var(--emerald), var(--sky))', color: 'white', borderRadius: 8, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>レポート進捗管理</span>
      </div>
      <ProgressTable />
    </div>
  )
}
