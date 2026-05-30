'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function DatePicker({ value, onChange, placeholder = '날짜 선택', className = '', style }: Props) {
  const [open, setOpen] = useState(false)
  const today = new Date()

  const parsed = value ? new Date(value + 'T00:00:00') : null
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth())

  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        ref.current && !ref.current.contains(target) &&
        popupRef.current && !popupRef.current.contains(target)
      ) setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [])

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const popupW = 272
      const popupH = 320

      let top = rect.bottom + 4
      let left = rect.left

      // 아래 공간 부족하면 위로
      if (top + popupH > window.innerHeight - 8) {
        top = rect.top - popupH - 4
      }
      // 오른쪽 잘리면 왼쪽으로 당기기
      if (left + popupW > window.innerWidth - 8) {
        left = window.innerWidth - popupW - 8
      }
      if (left < 8) left = 8

      setPopupPos({ top, left })
    }
    setOpen(o => !o)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectDay = useCallback((day: number) => {
    const v = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(v)
    setOpen(false)
  }, [viewYear, viewMonth, onChange])

  const displayValue = parsed
    ? `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')}`
    : ''

  return (
    <div ref={ref} className={`relative ${className}`} style={style}>
      {/* 트리거 */}
      <div
        ref={triggerRef}
        className="w-full flex items-center"
        style={{
          background: 'rgba(140,100,60,0.08)',
          border: '1.5px solid rgba(140,100,60,0.35)',
          borderRadius: 8,
          padding: '4px 8px',
          fontFamily: 'inherit',
        }}
      >
        <input
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          onClick={handleOpen}
          className="flex-1 outline-none cursor-pointer bg-transparent"
          style={{
            color: displayValue ? 'var(--ink)' : '#9e8070',
            fontSize: 13,
            fontWeight: displayValue ? 700 : 400,
            fontFamily: 'inherit',
            lineHeight: '24px',
            border: 'none',
            padding: 0,
            minWidth: 0,
          }}
        />
        <button
          type="button"
          onClick={handleOpen}
          className="flex-shrink-0 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: '0 0 0 4px', lineHeight: 0, opacity: 0.45, flexShrink: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
            <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 달력 팝업 — portal로 body에 렌더링 */}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: popupPos.top,
            left: popupPos.left,
            zIndex: 9999,
            background: 'var(--paper)',
            border: '2.5px solid #2C1810',
            borderRadius: 12,
            boxShadow: '6px 6px 0 #2C1810',
            padding: '12px 14px',
            minWidth: 260,
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer font-black text-[13px] transition-all"
              style={{ background: 'var(--paper)', border: '1.5px solid #2C1810', color: 'var(--ink)', boxShadow: '2px 2px 0 #8A6C50' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0 #8A6C50' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 #8A6C50' }}
            >←</button>
            <span className="text-[14px] font-black" style={{ color: 'var(--ink)' }}>
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer font-black text-[13px] transition-all"
              style={{ background: 'var(--paper)', border: '1.5px solid #2C1810', color: 'var(--ink)', boxShadow: '2px 2px 0 #8A6C50' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0 #8A6C50' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 #8A6C50' }}
            >→</button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd, i) => (
              <div key={wd} className="text-center text-[11px] font-black py-0.5"
                style={{ color: i === 0 ? 'var(--accent)' : i === 6 ? '#4A7AC0' : 'var(--muted)' }}>
                {wd}
              </div>
            ))}
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = ds === value
              const isToday = ds === todayStr
              const dow = (firstDow + day - 1) % 7
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className="flex items-center justify-center rounded-lg text-[13px] font-black cursor-pointer transition-all"
                  style={{
                    height: 30,
                    background: isSelected ? 'var(--accent)' : isToday ? 'rgba(200,75,49,0.12)' : 'transparent',
                    color: isSelected ? 'var(--paper)' : isToday ? 'var(--accent)' : dow === 0 ? 'var(--accent)' : dow === 6 ? '#4A7AC0' : 'var(--ink)',
                    border: isSelected ? '1.5px solid #2C1810' : isToday ? '1.5px solid rgba(200,75,49,0.35)' : '1.5px solid transparent',
                    fontWeight: isToday || isSelected ? 900 : 700,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(140,100,60,0.12)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(200,75,49,0.12)' : 'transparent' }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* 오늘 버튼 */}
          <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: '1.5px solid rgba(140,100,60,0.2)' }}>
            <button type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="text-[12px] font-bold cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: 'var(--muted)', background: 'none', border: 'none' }}>
              초기화
            </button>
            <button type="button"
              onClick={() => { onChange(todayStr); setOpen(false) }}
              className="text-[12px] font-black px-3 py-1 rounded-lg cursor-pointer transition-all"
              style={{ background: 'var(--ink)', color: 'var(--paper)', border: '1.5px solid #2C1810', boxShadow: '2px 2px 0 #8A6C50' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0 #8A6C50' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 #8A6C50' }}
            >
              오늘
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
