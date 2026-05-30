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

export default function MonthlyProjectCalendar({ projects }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)
  const todayStr = formatDate(today)

  const monthStart = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`
  const monthEnd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const activeProjects = projects.filter(p => p.startDate <= monthEnd && p.endDate >= monthStart)

  const dateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  // 날짜별 프로젝트 및 할 일 수 계산
  const projectsForDay = (day: number) => {
    const d = dateStr(day)
    return activeProjects
      .filter(p => d >= p.startDate && d <= p.endDate)
      .map(p => {
        const topCount = (p.todos ?? []).filter(t => t.dueDate === d).length
        const subCount = (p.subProjects ?? []).reduce((sum, sp) => sum + (sp.todos ?? []).filter(t => t.dueDate === d).length, 0)
        return { ...p, topCount, subCount }
      })
  }

  // 주차 배열 생성
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7)
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  // ── 월간 요약 계산 ──
  const summary = activeProjects.map(p => {
    const monthTodos = (p.todos ?? []).filter(t => t.dueDate >= monthStart && t.dueDate <= monthEnd)
    const monthDone = monthTodos.filter(t => t.done).length
    const subSummary = (p.subProjects ?? []).map(sp => {
      const spTodos = (sp.todos ?? []).filter(t => t.dueDate >= monthStart && t.dueDate <= monthEnd)
      return { name: sp.name, total: spTodos.length, done: spTodos.filter(t => t.done).length }
    }).filter(s => s.total > 0)
    const allSub = (p.subProjects ?? []).reduce((sum, sp) =>
      sum + (sp.todos ?? []).filter(t => t.dueDate >= monthStart && t.dueDate <= monthEnd).length, 0)
    const allSubDone = (p.subProjects ?? []).reduce((sum, sp) =>
      sum + (sp.todos ?? []).filter(t => t.dueDate >= monthStart && t.dueDate <= monthEnd && t.done).length, 0)
    const total = monthTodos.length + allSub
    const done = monthDone + allSubDone
    return { ...p, monthTodos: monthTodos.length, monthDone, allSub, allSubDone, total, done, subSummary }
  })

  const grandTotal = summary.reduce((s, p) => s + p.total, 0)
  const grandDone = summary.reduce((s, p) => s + p.done, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* ── 캘린더 ── */}
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
            MONTHLY TIMELINE
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
          <div style={{ minWidth: 600 }}>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((wd, i) => (
                <div key={wd} className="text-center text-[15px] font-black py-1"
                  style={{ color: i === 0 ? 'var(--accent)' : i === 6 ? '#4A7AC0' : 'var(--muted)' }}>
                  {wd}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-2">
                {week.map((day, di) => {
                  if (!day) return <div key={di} style={{ minHeight: 120 }} />
                  const ds = dateStr(day)
                  const isToday = ds === todayStr
                  const dow = (firstDow + day - 1) % 7
                  const dayProjects = projectsForDay(day)

                  return (
                    <div key={di} className="flex flex-col" style={{
                      minHeight: 120,
                      padding: '6px 5px',
                      borderRadius: 6,
                      background: isToday ? 'rgba(200,75,49,0.06)' : 'transparent',
                      border: isToday ? '1.5px solid rgba(200,75,49,0.3)' : '1.5px solid transparent',
                    }}>
                      {/* 날짜 숫자 */}
                      <div
                        className="w-[26px] h-[26px] flex items-center justify-center text-[15px] font-black rounded-full mb-2 self-center"
                        style={{
                          background: isToday ? 'var(--accent)' : 'transparent',
                          color: isToday ? 'var(--paper)' : dow === 0 ? 'var(--accent)' : dow === 6 ? '#4A7AC0' : 'var(--ink)',
                        }}
                      >
                        {day}
                      </div>

                      {/* 프로젝트 바 + 텍스트 */}
                      <div className="flex flex-col gap-2">
                        {dayProjects.map(p => {
                          const isStart = ds === p.startDate
                          const isEnd = ds === p.endDate
                          const hasTodos = p.topCount > 0 || p.subCount > 0
                          return (
                            <div key={p.id}>
                              <div title={p.name} style={{
                                height: 5,
                                background: p.color,
                                borderRadius: isStart && isEnd ? 4 : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : 0,
                                opacity: 0.85,
                                marginBottom: hasTodos ? 4 : 0,
                              }} />
                              {hasTodos && (
                                <div style={{ paddingLeft: 2 }}>
                                  {p.topCount > 0 && (
                                    <div className="text-[11px] font-bold leading-snug" style={{ color: p.color }}>
                                      최상위 {p.topCount}건
                                    </div>
                                  )}
                                  {p.subCount > 0 && (
                                    <div className="text-[11px] font-bold leading-snug" style={{ color: p.color, opacity: 0.75 }}>
                                      서브 {p.subCount}건
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* 범례 */}
          {projects.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 pt-3"
              style={{ borderTop: '1.5px solid rgba(140,100,60,0.15)' }}>
              {activeProjects.map(p => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  <span className="text-[15px] font-bold" style={{ color: 'var(--ink)' }}>{p.name}</span>
                  <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
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

      {/* ── 월간 요약 ── */}
      {summary.length > 0 && (
        <div style={{
          background: 'var(--paper)',
          border: '2.5px solid #2C1810',
          borderRadius: 12,
          boxShadow: '6px 6px 0 #2C1810',
          overflow: 'hidden',
        }}>
          <div className="px-6 py-4" style={{ borderBottom: '2px solid rgba(140,100,60,0.2)', background: 'rgba(140,100,60,0.06)' }}>
            <span className="text-[18px] font-black tracking-[3px]" style={{ color: 'var(--gold)' }}>
              MONTHLY SUMMARY · {viewYear}년 {viewMonth + 1}월
            </span>
          </div>

          <div className="px-6 py-5" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(140,100,60,0.2)' }}>
                  {['프로젝트', '최상위 할 일', '서브 할 일', '이번 달 합계', '완료율'].map(h => (
                    <th key={h} className="text-[15px] font-black text-left pb-3 pr-4"
                      style={{ color: 'var(--muted)', letterSpacing: '0.5px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map((p, i) => {
                  const pct = p.total === 0 ? 0 : Math.round(p.done / p.total * 100)
                  return (
                    <tr key={p.id} style={{ borderBottom: i < summary.length - 1 ? '1px dashed rgba(140,100,60,0.2)' : 'none' }}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span style={{ width: 13, height: 13, borderRadius: 3, background: p.color, flexShrink: 0 }} />
                          <span className="text-[18px] font-black" style={{ color: 'var(--ink)' }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
                          {p.monthDone}/{p.monthTodos}건
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
                          {p.allSubDone}/{p.allSub}건
                        </span>
                        {p.subSummary.length > 0 && (
                          <div className="flex flex-col gap-0.5 mt-1.5">
                            {p.subSummary.map(s => (
                              <span key={s.name} className="text-[14px] font-bold" style={{ color: 'var(--muted)' }}>
                                · {s.name}: {s.done}/{s.total}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-[18px] font-black" style={{ color: pct === 100 ? 'var(--gold)' : 'var(--ink)' }}>
                          {p.done}/{p.total}건
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div style={{ flex: 1, height: 9, background: 'rgba(140,100,60,0.15)', borderRadius: 5, overflow: 'hidden', minWidth: 70 }}>
                            <div style={{
                              width: `${pct}%`, height: '100%',
                              background: pct === 100 ? 'var(--gold)' : p.color,
                              borderRadius: 5, transition: 'width 0.4s ease',
                            }} />
                          </div>
                          <span className="text-[17px] font-black flex-shrink-0"
                            style={{ color: pct === 100 ? 'var(--gold)' : 'var(--accent)', minWidth: 44 }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid rgba(140,100,60,0.25)' }}>
                  <td className="pt-4 pr-4">
                    <span className="text-[17px] font-black tracking-[1px]" style={{ color: 'var(--gold)' }}>TOTAL</span>
                  </td>
                  <td className="pt-4 pr-4" />
                  <td className="pt-4 pr-4" />
                  <td className="pt-4 pr-4">
                    <span className="text-[16px] font-black" style={{ color: grandTotal === grandDone && grandTotal > 0 ? 'var(--gold)' : 'var(--ink)' }}>
                      {grandDone}/{grandTotal}건
                    </span>
                  </td>
                  <td className="pt-4">
                    <span className="text-[18px] font-black" style={{ color: 'var(--accent)' }}>
                      {grandTotal === 0 ? '–' : `${Math.round(grandDone / grandTotal * 100)}%`}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
