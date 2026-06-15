import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto',
  display: 'swap',
})
import Sidebar from '@/components/Sidebar'
import BackgroundProvider from '@/components/BackgroundProvider'
import SupabaseSync from '@/components/SupabaseSync'
import NotificationInit from '@/components/NotificationInit'
import BottomNav from '@/components/BottomNav'
import AlarmManager from '@/components/AlarmManager'
import MobileHeader from '@/components/MobileHeader'
import PWAUpdateNotifier from '@/components/PWAUpdateNotifier'
import HeaderBanner from '@/components/HeaderBanner'
import ThemeApplier from '@/components/ThemeApplier'

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
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Anti-flash: apply saved theme + mobile-UA class before React hydrates */}
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var s=JSON.parse(localStorage.getItem('school-task-manager')||'{}');var m=s&&s.state&&s.state.integrations&&s.state.integrations.themeMode;document.documentElement.setAttribute('data-theme',m==='light'?'light':'dark');if(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)){document.documentElement.classList.add('is-mobile-ua');document.documentElement.classList.remove('has-bg');}}catch(e){}})();`}</Script>
        {/* Injected raw — bypasses Tailwind/Lightning CSS transform */}
        <meta name="color-scheme" content="dark" />
        <style dangerouslySetInnerHTML={{ __html: `
          .gradient-text {
            background-image: linear-gradient(135deg, var(--emerald-light, #34d399) 0%, var(--sky-light, #38bdf8) 100%) !important;
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
          /* モバイル: カード・ガラス効果を完全無効化（HTML直書きなのでキャッシュ無関係） */
          .is-mobile-ua .card,
          .is-mobile-ua .has-bg .card,
          .is-mobile-ua.has-bg .card { background: #282828 !important; }
          .is-mobile-ua .card-2,
          .is-mobile-ua .has-bg .card-2 { background: #303030 !important; }
          .is-mobile-ua .stat-card,
          .is-mobile-ua .has-bg .stat-card { background: #282828 !important; }
          [data-theme="light"].is-mobile-ua .card,
          [data-theme="light"].is-mobile-ua .has-bg .card { background: #ffffff !important; }
          [data-theme="light"].is-mobile-ua .card-2 { background: #f8f9fc !important; }
          [data-theme="light"].is-mobile-ua .stat-card { background: #ffffff !important; }
          @media (max-width: 900px) {
            .card, .has-bg .card { background: #282828 !important; }
            .card-2, .has-bg .card-2 { background: #303030 !important; }
            .stat-card { background: #282828 !important; }
            [data-theme="light"] .card, [data-theme="light"] .has-bg .card { background: #ffffff !important; }
            [data-theme="light"] .card-2 { background: #f8f9fc !important; }
          }
        ` }} />
      </head>
      <body style={{ margin: 0, minHeight: '100vh' }}>
        <ThemeApplier />
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
