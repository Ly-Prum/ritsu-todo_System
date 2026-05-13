import type { Metadata, Viewport } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import BackgroundProvider from '@/components/BackgroundProvider'
import SupabaseSync from '@/components/SupabaseSync'
import NotificationInit from '@/components/NotificationInit'
import BottomNav from '@/components/BottomNav'
import AlarmManager from '@/components/AlarmManager'

export const metadata: Metadata = {
  title: 'Ritsuki Dashboard',
  description: 'Ritsuki の課題・TODO・スケジュール一元管理システム',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StudyHub',
  },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ margin: 0, minHeight: '100vh' }}>
        <BackgroundProvider />
        <SupabaseSync />
        <NotificationInit />
        <AlarmManager />
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 2 }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
