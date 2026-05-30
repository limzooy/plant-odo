'use client'

import { useState } from 'react'
import { formatDate } from '@/types'

interface Props {
  currentDate: string
  onSelect: (dateKey: string) => void
}

const today = formatDate(new Date())
const WEEK = ['일','월','화','수','목','금','토']

export default function MiniCalendar({ currentDate, onSelect }: Props) {
  const parsed = new Date(currentDate + 'T00:00:00')
  const [viewYear, setViewYear] = useState(parsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div style={{
      background: 'var(--paper)',
      border: '2.5px solid #2C1810',
      borderRadius: 12,
      boxShadow: '4px 4px 0 #2C1810',
      padding: '12px 14px',
    }}>
      {/* 월 이동 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="font-black text-[13px] cursor-pointer leading-none"
          style={{ background: 'none', border: 'none', color: 'var(--ink)', padding: '2px 6px' }}
        >←</button>
        <span className="font-black text-[13px]" style={{ color: 'var(--ink)' }}>
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          onClick={nextMonth}
          className="font-black text-[13px] cursor-pointer leading-none"
          style={{ background: 'none', border: 'none', color: 'var(--ink)', padding: '2px 6px' }}
        >→</button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK.map((w, i) => (
          <div key={w} className="text-center text-[13px] font-black py-1"
            style={{ color: i === 0 ? 'var(--accent)' : i === 6 ? '#2C6EA6' : '#8A7A6A' }}>
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />
          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = dateKey === currentDate
          const isToday = dateKey === today
          const dow = (firstDay + day - 1) % 7
          return (
            <button
              key={idx}
              onClick={() => onSelect(dateKey)}
              className="text-center text-[14px] font-black cursor-pointer mx-auto flex items-center justify-center"
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: isSelected ? '2px solid #C84B31' : isToday ? '2px solid #8A7A6A' : '2px solid transparent',
                background: isSelected ? 'var(--accent)' : isToday ? '#F5EDD8' : 'transparent',
                color: isSelected ? 'var(--paper)' : dow === 0 ? 'var(--accent)' : dow === 6 ? '#2C6EA6' : 'var(--ink)',
                boxShadow: isSelected ? '2px 2px 0 #2C1810' : 'none',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
