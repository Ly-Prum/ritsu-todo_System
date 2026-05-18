import type { Metadata, Viewport } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import BackgroundProvider from '@/components/BackgroundProvider'
import SupabaseSync from '@/components/SupabaseSync'
import NotificationInit from '@/components/NotificationInit'
import BottomNav from '@/components/BottomNav'
import AlarmManager from '@/components/AlarmManager'
import MobileHeader from '@/components/MobileHeader'
import PWAUpdateNotifier from '@/components/PWAUpdateNotifier'
import HeaderBanner from '@/components/HeaderBanner'

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
        {/* Injected raw — bypasses Tailwind/Lightning CSS transform */}
        <meta name="color-scheme" content="dark" />
        <style dangerouslySetInnerHTML={{ __html: `
          .gradient-text {
            background-image: linear-gradient(135deg, #34d399 0%, #38bdf8 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            display: inline-block !important;
            -webkit-font-smoothing: antialiased !important;
            forced-color-adjust: none !important;
          }
          .color-swatch-inner {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            forced-color-adjust: none !important;
          }
        ` }} />
      </head>
      <body style={{ margin: 0, minHeight: '100vh' }}>
        <BackgroundProvider />
        <SupabaseSync />
        <NotificationInit />
        <AlarmManager />
        <MobileHeader />
        <PWAUpdateNotifier />
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 2 }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <HeaderBanner />
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
