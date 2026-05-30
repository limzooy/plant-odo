'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import type { Todo, Sticker } from '@/types'
import { formatDisplayDate } from '@/types'
import TodoItem from './TodoItem'
import BarcodeReceipt from './BarcodeReceipt'

interface PlacedSticker extends Sticker {
  localX: number
  localY: number
}

interface Props {
  date: string
  todos: Todo[]
  stickers: Sticker[]
  pct: number
  activeSticker: string | null
  activeImageUrl: string | null
  onToggle: (id: string, done: boolean) => void
  onDeleteTodo: (id: string) => void
  onAddSticker: (emoji: string, x: number, y: number, imageUrl?: string) => Promise<Sticker | null>
  onUpdateSticker: (id: string, x: number, y: number) => void
  onDeleteSticker: (id: string) => void
  onActiveSticker: (s: string | null) => void
  onActiveImageUrl: (url: string | null) => void
  onDateChange?: (dateKey: string) => void
}

type SortMode = 'date-asc' | 'date-desc' | 'text-asc' | 'text-desc'
type FlipState = 'idle' | 'out' | 'in'

// 찢어진 공책 아랫면
const TORN_BOTTOM = (() => {
  const heights = [95,92,97,93,96,91,94,97,92,95,98,91,96,93,97,92,95,98,91,94,96,92,97,93,95,91,96,94,98,92,95]
  const pts = ['0% 0%', '100% 0%', '100% 93%']
  heights.forEach((h, i) => {
    pts.push(`${(100 - (i / (heights.length - 1)) * 100).toFixed(1)}% ${h}%`)
  })
  pts.push('0% 93%')
  return `polygon(${pts.join(', ')})`
})()

const RING_COUNT = 11

function SortBtn({ label, active, onClick }: { label: string; active: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[18px] font-black cursor-pointer select-none transition-all duration-100"
      style={{
        padding: '4px 10px', borderRadius: 6,
        border: '2px solid #2C1810',
        background: active ? 'var(--accent)' : 'var(--paper)',
        color: active ? 'var(--paper)' : 'var(--ink)',
        boxShadow: active ? '2px 2px 0 #2C1810' : '2px 2px 0 #8A7A6A',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translate(1px,1px)'; el.style.boxShadow=active?'1px 1px 0 #2C1810':'1px 1px 0 #8A7A6A' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow=active?'2px 2px 0 #2C1810':'2px 2px 0 #8A7A6A' }}
    >
      {label}
    </button>
  )
}

export default function GraphPaper({
  date, todos, stickers, pct,
  activeSticker, activeImageUrl,
  onToggle, onDeleteTodo,
  onAddSticker, onUpdateSticker, onDeleteSticker,
  onActiveSticker, onActiveImageUrl,
  onDateChange,
}: Props) {
  const paperRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ el: HTMLDivElement; id: string; offX: number; offY: number } | null>(null)
  const placingRef = useRef(false)
  const [localStickers, setLocalStickers] = useState<PlacedSticker[]>([])
  const [sortMode, setSortMode] = useState<SortMode>('date-asc')
  const [flipState, setFlipState] = useState<FlipState>('idle')
  const pendingDate = useRef<string | null>(null)

  const sortedTodos = useMemo(() => [...todos].sort((a, b) => {
    if (sortMode === 'date-asc')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sortMode === 'date-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sortMode === 'text-asc')  return a.text.localeCompare(b.text, 'ko')
    return b.text.localeCompare(a.text, 'ko')
  }), [todos, sortMode])

  useEffect(() => {
    const seen = new Set<string>()
    setLocalStickers(
      stickers
        .filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true })
        .map(s => ({ ...s, localX: s.x, localY: s.y }))
    )
  }, [stickers])

  const handleDateSelect = useCallback((dateKey: string) => {
    if (!onDateChange || dateKey === date) return
    pendingDate.current = dateKey
    setFlipState('out')
  }, [onDateChange, date])

  useEffect(() => {
    if (flipState === 'out') {
      const t = setTimeout(() => {
        if (pendingDate.current && onDateChange) {
          onDateChange(pendingDate.current)
        }
        setFlipState('in')
      }, 320)
      return () => clearTimeout(t)
    }
    if (flipState === 'in') {
      const t = setTimeout(() => setFlipState('idle'), 320)
      return () => clearTimeout(t)
    }
  }, [flipState, onDateChange])

  const handlePaperClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!activeSticker && !activeImageUrl) return
    const target = e.target as HTMLElement
    if (target.dataset.stickerEl) return
    if (['BUTTON', 'TEXTAREA', 'INPUT'].includes(target.tagName)) return

    const paper = paperRef.current
    if (!paper) return
    const rect = paper.getBoundingClientRect()
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY
    const x = clientX - rect.left - 20
    const y = clientY - rect.top - 20

    if (placingRef.current) return
    placingRef.current = true
    requestAnimationFrame(() => { placingRef.current = false })

    if (activeImageUrl) {
      onAddSticker('', x, y, activeImageUrl)
      onActiveImageUrl(null)
    } else if (activeSticker) {
      onAddSticker(activeSticker, x, y)
      onActiveSticker(null)
    }
  }, [activeSticker, activeImageUrl, onAddSticker, onActiveSticker, onActiveImageUrl])

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, id: string, el: HTMLDivElement) => {
    e.stopPropagation()
    if (!paperRef.current) return
    const cx = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const cy = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const ls = localStickers.find(s => s.id === id)
    dragging.current = { el, id, offX: cx - (ls?.localX ?? 0), offY: cy - (ls?.localY ?? 0) }
    el.style.transition = 'none'
    el.style.zIndex = '200'
  }, [localStickers])

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !paperRef.current) return
      e.preventDefault()
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      const rect = paperRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(cx - dragging.current.offX, rect.width - 44))
      const y = Math.max(0, Math.min(cy - dragging.current.offY, rect.height - 44))
      dragging.current.el.style.left = x + 'px'
      dragging.current.el.style.top  = y + 'px'
    }
    const onEnd = () => {
      if (!dragging.current) return
      const { el, id } = dragging.current
      el.style.zIndex = '60'
      const x = parseInt(el.style.left)
      const y = parseInt(el.style.top)
      setLocalStickers(prev => prev.map(s => s.id === id ? { ...s, localX: x, localY: y } : s))
      onUpdateSticker(id, x, y)
      dragging.current = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchend', onEnd)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchend', onEnd)
    }
  }, [onUpdateSticker])

  const deleteSticker = useCallback((id: string, el: HTMLDivElement) => {
    el.style.transition = 'transform 0.18s, opacity 0.18s'
    el.style.transform  = 'scale(0)'
    el.style.opacity    = '0'
    setTimeout(() => {
      setLocalStickers(prev => prev.filter(s => s.id !== id))
      onDeleteSticker(id)
    }, 200)
  }, [onDeleteSticker])

  const handleDoubleClick = useCallback((id: string, el: HTMLDivElement) => {
    deleteSticker(id, el)
  }, [deleteSticker])

  const tapCount = useRef<Record<string, number>>({})
  const tapTimer = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const handleDoubleTap = useCallback((id: string, el: HTMLDivElement) => {
    tapCount.current[id] = (tapCount.current[id] ?? 0) + 1
    if (tapCount.current[id] === 1) {
      tapTimer.current[id] = setTimeout(() => { tapCount.current[id] = 0 }, 350)
    } else if (tapCount.current[id] >= 2) {
      clearTimeout(tapTimer.current[id])
      tapCount.current[id] = 0
      deleteSticker(id, el)
    }
  }, [deleteSticker])

  const is100    = pct === 100 && todos.length > 0
  const isPlacing = !!activeSticker || !!activeImageUrl

  const flipAnimation =
    flipState === 'out' ? 'pageFlipOut 0.32s ease-in forwards' :
    flipState === 'in'  ? 'pageFlipIn 0.32s ease-out forwards' :
    undefined

  return (
    <div className="flex-1" style={{ perspective: '1200px' }}>
      <div
        ref={paperRef}
        style={{
          clipPath: TORN_BOTTOM,
          cursor: isPlacing ? 'crosshair' : 'default',
          background: 'var(--paper)',
          border: '2.5px solid #2C1810',
          borderRadius: 12,
          boxShadow: '6px 6px 0 #2C1810',
          animation: flipAnimation,
          transformOrigin: 'center center',
        }}
        className="relative min-h-[580px] overflow-hidden"
        onClick={handlePaperClick}
      >
        {/* 나선형 링 */}
        <div className="absolute left-0 top-0 bottom-0 w-[44px] z-10 pointer-events-none"
          style={{ background: 'var(--spine)' }}>
          {Array.from({ length: RING_COUNT }).map((_, i) => (
            <div key={i} className="absolute" style={{
              top: 18 + i * 48, left: 8,
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #6B4C30', background: 'var(--paper)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18)',
            }} />
          ))}
        </div>

        {/* 줄선 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(transparent 27px, rgba(140,100,60,0.18) 27px, rgba(140,100,60,0.18) 29px, transparent 29px)',
          backgroundSize: '100% 29px',
          backgroundPosition: '0 18px',
        }} />

        {/* 빨간 여백선 */}
        <div className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: 72, width: 2, background: 'rgba(200,75,49,0.35)' }} />

        {/* 콘텐츠 */}
        <div className="relative z-[5] pr-[13%]"
          style={{ paddingLeft: 84, paddingTop: 22, paddingBottom: 96 }}>

          {/* MY TODO LIST 타이틀 */}
          <div className="text-[21px] font-black tracking-[4px] uppercase mb-1" style={{ color: 'var(--gold)', textShadow: '1px 1px 0 rgba(0,0,0,0.08)' }}>
            MY TODO LIST
          </div>

          {/* 헤더: 날짜 + 정렬 버튼 */}
          <div className="flex items-center gap-2 pb-3 mb-4"
            style={{ borderBottom: '2px solid rgba(140,100,60,0.25)' }}>
            <span className="font-black flex-1" style={{ fontSize: 19, color: 'var(--ink)' }}>
              {formatDisplayDate(date)}
            </span>
            <SortBtn
              label={sortMode === 'date-desc' ? '날짜 ↑' : '날짜 ↓'}
              active={sortMode === 'date-asc' || sortMode === 'date-desc'}
              onClick={e => { e.stopPropagation(); setSortMode(p => p === 'date-asc' ? 'date-desc' : 'date-asc') }}
            />
            <SortBtn
              label={sortMode === 'text-desc' ? '가나 ↑' : '가나 ↓'}
              active={sortMode === 'text-asc' || sortMode === 'text-desc'}
              onClick={e => { e.stopPropagation(); setSortMode(p => p === 'text-asc' ? 'text-desc' : 'text-asc') }}
            />
          </div>

          <ul className="list-none">
            {sortedTodos.map(t => (
              <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDeleteTodo} />
            ))}
          </ul>

          {is100 && (
            <div className="text-center py-3.5 text-lg font-black animate-bounce mt-4" style={{ color: 'var(--accent)' }}>
              🎉 모든 할 일 완료! 화분이 활짝 피었어요! 🎉
            </div>
          )}
          {is100 && <BarcodeReceipt date={date} paperRef={paperRef} />}
        </div>

        {/* 스티커 */}
        {localStickers.map(s => (
          <div
            key={s.id}
            data-sticker-el="true"
            style={{ left: s.localX, top: s.localY, position: 'absolute', zIndex: 60 }}
            className="cursor-move select-none touch-none transition-transform hover:scale-110 hover:-rotate-6"
            onMouseDown={e => startDrag(e, s.id, e.currentTarget as HTMLDivElement)}
            onTouchStart={e => startDrag(e, s.id, e.currentTarget as HTMLDivElement)}
            onDoubleClick={e => { e.stopPropagation(); handleDoubleClick(s.id, e.currentTarget as HTMLDivElement) }}
            onTouchEnd={e => { e.stopPropagation(); handleDoubleTap(s.id, e.currentTarget as HTMLDivElement) }}
          >
            {s.imageUrl
              ? <img src={s.imageUrl} alt="" data-sticker-el="true"
                  style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)', pointerEvents: 'none' }} />
              : <span data-sticker-el="true" className="text-[43px] leading-none">{s.emoji}</span>
            }
          </div>
        ))}
      </div>

    </div>
  )
}
