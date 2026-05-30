'use client'

import { useState } from 'react'
import type { Project } from '@/types'
import { formatDate } from '@/types'

interface Props {
  projects: Project[]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function ProjectCalendar({ projects }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const todayStr = formatDate(today)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const activeProjects = projects.filter(p => {
    const monthStart = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`
    const monthEnd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    return p.startDate <= monthEnd && p.endDate >= monthStart
  })

  return (
    <div style={{
      background: 'var(--paper)',
      border: '2.5px solid #2C1810',
      borderRadius: 12,
      boxShadow: '6px 6px 0 #2C1810',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '2px solid rgba(140,100,60,0.2)', background: 'rgba(140,100,60,0.06)' }}>
        <span className="text-[13px] font-black tracking-[3px]" style={{ color: 'var(--gold)' }}>
          PROJECT TIMELINE
        </span>
        <div className="flex items-center gap-3">
          <NavBtn onClick={prevMonth}>←</NavBtn>
          <span className="text-[14px] font-black" style={{ color: 'var(--ink)', minWidth: 80, textAlign: 'center' }}>
            {viewYear}년 {viewMonth + 1}월
          </span>
          <NavBtn onClick={nextMonth}>→</NavBtn>
        </div>
      </div>

      <div className="px-6 py-4" style={{ overflowX: 'auto' }}>
        {/* 요일 헤더 + 날짜 그리드 */}
        <div style={{ minWidth: 560 }}>
          <DayGrid
            daysInMonth={daysInMonth}
            firstDow={getFirstDayOfWeek(viewYear, viewMonth)}
            viewYear={viewYear}
            viewMonth={viewMonth}
            todayStr={todayStr}
            projects={activeProjects}
          />
        </div>

        {/* 범례 */}
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 pt-3"
            style={{ borderTop: '1.5px solid rgba(140,100,60,0.15)' }}>
            {projects.map(p => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span style={{ width: 12, height: 12, borderRadius: 3, background: p.color, display: 'inline-block', flexShrink: 0 }} />
                <span className="text-[15px] font-bold" style={{ color: '#5A3E2B' }}>{p.name}</span>
                <span className="text-[14px]" style={{ color: 'var(--muted)' }}>
                  {p.startDate.slice(5).replace('-', '/')} ~ {p.endDate.slice(5).replace('-', '/')}
                </span>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-6 text-[13px] font-bold" style={{ color: '#B0926A' }}>
            아직 등록된 프로젝트가 없어요. 프로젝트를 추가해보세요!
          </div>
        )}
      </div>
    </div>
  )
}

function DayGrid({
  daysInMonth, firstDow, viewYear, viewMonth, todayStr, projects
}: {
  daysInMonth: number
  firstDow: number
  viewYear: number
  viewMonth: number
  todayStr: string
  projects: Project[]
}) {
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7).concat(Array(7 - (cells.slice(i, i + 7).length)).fill(null)))
  }

  const dateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const projectsForDay = (day: number) => {
    const d = dateStr(day)
    return projects.filter(p => d >= p.startDate && d <= p.endDate)
  }

  return (
    <>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((wd, i) => (
          <div key={wd} className="text-center text-[14px] font-black py-1"
            style={{ color: i === 0 ? 'var(--accent)' : i === 6 ? '#4A7AC0' : 'var(--muted)' }}>
            {wd}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((day, di) => {
            if (!day) return <div key={di} />
            const ds = dateStr(day)
            const isToday = ds === todayStr
            const dayProjects = projectsForDay(day)
            const dow = (firstDow + day - 1) % 7

            return (
              <div key={di} className="flex flex-col items-center" style={{ minWidth: 0 }}>
                {/* 날짜 숫자 */}
                <div
                  className="w-[26px] h-[26px] flex items-center justify-center text-[15px] font-black rounded-full mb-0.5"
                  style={{
                    background: isToday ? 'var(--accent)' : 'transparent',
                    color: isToday ? 'var(--paper)' : dow === 0 ? 'var(--accent)' : dow === 6 ? '#4A7AC0' : 'var(--ink)',
                  }}
                >
                  {day}
                </div>
                {/* 프로젝트 바 */}
                <div className="flex flex-col gap-0.5 w-full">
                  {dayProjects.slice(0, 3).map(p => {
                    const isStart = ds === p.startDate
                    const isEnd = ds === p.endDate
                    return (
                      <div
                        key={p.id}
                        title={p.name}
                        style={{
                          height: 5,
                          background: p.color,
                          borderRadius: isStart && isEnd ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0,
                          opacity: 0.85,
                        }}
                      />
                    )
                  })}
                  {dayProjects.length > 3 && (
                    <div className="text-[9px] text-center font-bold" style={{ color: 'var(--muted)' }}>
                      +{dayProjects.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-black cursor-pointer transition-all"
      style={{
        background: 'var(--paper)',
        border: '2px solid #2C1810',
        color: 'var(--ink)',
        boxShadow: '2px 2px 0 #8A6C50',
      }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translate(1px,1px)'; el.style.boxShadow = '1px 1px 0 #8A6C50' }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '2px 2px 0 #8A6C50' }}
    >
      {children}
    </button>
  )
}
