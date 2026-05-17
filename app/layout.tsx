import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ subsets: ['latin'], weight: ['600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: '🌱 오늘의 화분 키우기',
  description: '투두를 완성하며 화분을 키워요!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={nunito.className}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
