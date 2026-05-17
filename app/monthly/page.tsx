'use client'

import Link from 'next/link'
import MonthlyCalendar from '@/components/MonthlyCalendar'

export default function MonthlyPage() {
  const d = new Date()
  const DAYS = ['일','월','화','수','목','금','토']
  return (
    <div className="p-4">
      <div className="flex justify-between items-center max-w-[1120px] mx-auto mb-5">
        <div className="flex bg-white/18 backdrop-blur-md rounded-full p-1 gap-0.5">
          <Link href="/">
            <button className="px-6 py-2 rounded-full text-sm font-black bg-transparent text-white/75 border-none cursor-pointer">🌱 오늘</button>
          </Link>
          <Link href="/monthly">
            <button className="px-6 py-2 rounded-full text-sm font-black bg-white text-[#FF3CAC] shadow-[0_3px_14px_rgba(0,0,0,0.18)] border-none cursor-pointer">📅 월별</button>
          </Link>
        </div>
        <div className="bg-white/92 rounded-[20px] px-5 py-2 text-[13px] font-black text-[#555] shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
          {d.getMonth()+1}월 {d.getDate()}일 {DAYS[d.getDay()]}요일
        </div>
      </div>
      <MonthlyCalendar />
    </div>
  )
}
