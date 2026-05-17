'use client'

import { useState, useEffect } from 'react'
import { PLANT_DATA, getStageIndex, formatDate } from '@/types'
import type { PlantType } from '@/types'
import { fetchMonthlyData } from '@/lib/db'

interface DayData {
  pct: number
  plantType: PlantType | null
}

interface Props {
  userId: string
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function getLevelClass(pct: number, hasData: boolean): string {
  if (!hasData || pct === 0) return 'bg-[#f1f5f9]'
  if (pct === 100) return 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_10px_rgba(251,191,36,0.4)]'
  if (pct > 50) return 'bg-gradient-to-br from-[#22c55e] to-[#16a34a]'
  if (pct > 25) return 'bg-gradient-to-br from-[#86efac] to-[#4ade80]'
  return 'bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0]'
}

export default function MonthlyCalendar({ userId }: Props) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [dayMap, setDayMap] = useState<Record<string, DayData>>({})
  const [loading, setLoading] = useState(false)

  const todayKey = formatDate(today)
  const monthStr = `${view.year}-${String(view.month + 1).padStart(2, '0')}`
  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

  useEffect(() => {
    setLoading(true)
    fetchMonthlyData(userId, monthStr).then(({ todos, plants }) => {
      const map: Record<string, DayData> = {}

      // Build pct map per day
      const todoCounts: Record<string, { total: number; done: number }> = {}
      todos.forEach(t => {
        if (!todoCounts[t.date]) todoCounts[t.date] = { total: 0, done: 0 }
        todoCounts[t.date].total++
        if (t.done) todoCounts[t.date].done++
      })

      plants.forEach(p => {
        const { total = 0, done = 0 } = todoCounts[p.date] ?? {}
        map[p.date] = {
          pct: total > 0 ? Math.round((done / total) * 100) : 0,
          plantType: p.type as PlantType,
        }
      })

      setDayMap(map)
      setLoading(false)
    })
  }, [userId, monthStr])

  const changeMonth = (delta: number) => {
    setView(v => {
      let m = v.month + delta
      let y = v.year
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { year: y, month: m }
    })
  }

  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  return (
    <div className="max-w-[680px] mx-auto">
      <div className="bg-white/98 rounded-[28px] p-8 shadow-[0_24px_72px_rgba(0,0,0,0.22)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="bg-gradient-to-br from-[#f093fb] to-[#FF3CAC] text-white border-none rounded-full w-[38px] h-[38px] text-lg cursor-pointer transition-all hover:scale-110 shadow-[0_4px_12px_rgba(255,60,172,0.3)] flex items-center justify-center"
          >‹</button>
          <h2 className="text-xl font-black text-[#2d2d2d]">
            {view.year}년 {monthNames[view.month]}
            {loading && <span className="text-[12px] text-[#ccc] ml-2">로딩중...</span>}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="bg-gradient-to-br from-[#f093fb] to-[#FF3CAC] text-white border-none rounded-full w-[38px] h-[38px] text-lg cursor-pointer transition-all hover:scale-110 shadow-[0_4px_12px_rgba(255,60,172,0.3)] flex items-center justify-center"
          >›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-center text-[11px] font-black py-1 ${i === 0 ? 'text-[#f87171]' : i === 6 ? 'text-[#60a5fa]' : 'text-[#bbb]'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const key = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const data = dayMap[key]
            const isToday = key === todayKey
            const levelClass = getLevelClass(data?.pct ?? 0, !!data)
            const plantEmoji = data?.plantType
              ? PLANT_DATA[data.plantType].stages[getStageIndex(data.pct)]
              : ''
            const isDark = data && (data.pct > 50)

            return (
              <div
                key={key}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 p-1 transition-transform hover:scale-105 ${levelClass} ${isToday ? 'ring-[2.5px] ring-[#FF3CAC]' : ''}`}
              >
                <span className="text-base leading-none">{plantEmoji}</span>
                <span className={`text-[10px] font-black ${isDark ? 'text-white/85' : 'text-[#666]'}`}>{day}</span>
                {data && data.pct > 0 && (
                  <span className={`text-[8px] font-bold ${isDark ? 'text-white/70' : 'text-[#aaa]'}`}>{data.pct}%</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3.5 mt-5 flex-wrap justify-center">
          {[
            { bg: 'bg-[#f1f5f9] border border-[#ddd]', label: '기록 없음' },
            { bg: 'bg-[#86efac]', label: '1~25%' },
            { bg: 'bg-[#4ade80]', label: '26~50%' },
            { bg: 'bg-[#22c55e]', label: '51~99%' },
            { bg: 'bg-[#fbbf24]', label: '100% 🌟' },
          ].map(({ bg, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#999] font-bold">
              <div className={`w-4 h-4 rounded-[5px] ${bg}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
