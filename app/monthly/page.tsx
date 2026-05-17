'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import MonthlyCalendar from '@/components/MonthlyCalendar'

export default function MonthlyPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUserId(data.user.id)
    })
  }, [router])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce">🌱</div>
      </div>
    )
  }

  const d = new Date()

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex justify-between items-center max-w-[1120px] mx-auto mb-5">
        <div className="flex bg-white/18 backdrop-blur-md rounded-full p-1 gap-0.5">
          <Link href="/">
            <button className="px-6 py-2 rounded-full text-sm font-black bg-transparent text-white/75 border-none cursor-pointer hover:text-white transition-colors">🌱 오늘</button>
          </Link>
          <Link href="/monthly">
            <button className="px-6 py-2 rounded-full text-sm font-black bg-white text-[#FF3CAC] shadow-[0_3px_14px_rgba(0,0,0,0.18)] border-none cursor-pointer">📅 월별</button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/92 rounded-[20px] px-5 py-2 text-[13px] font-black text-[#555] shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
            {d.getMonth()+1}월 {d.getDate()}일 {['일','월','화','수','목','금','토'][d.getDay()]}요일
          </div>
          <button onClick={handleLogout} className="bg-white/20 text-white border-none rounded-full px-4 py-2 text-xs font-black cursor-pointer hover:bg-white/30 transition-colors">
            로그아웃
          </button>
        </div>
      </div>

      <MonthlyCalendar userId={userId} />
    </div>
  )
}
