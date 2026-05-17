'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
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
  onToggle: (id: string, done: boolean) => void
  onDeleteTodo: (id: string) => void
  onAddSticker: (emoji: string, x: number, y: number) => Promise<Sticker | null>
  onUpdateSticker: (id: string, x: number, y: number) => void
  onDeleteSticker: (id: string) => void
  onActiveSticker: (s: string | null) => void
}

const PINKING_PATH = (() => {
  const inner = 88, outer = 95.5, step = 3.2
  const pts = ['0 0', `${inner}% 0%`]
  let y = step
  let isOuter = true
  while (y <= 100 + step) {
    const cy = Math.min(y, 100)
    pts.push(`${isOuter ? outer : inner}% ${cy}%`)
    isOuter = !isOuter
    if (cy >= 100) break
    y += step
  }
  pts.push('0 100%')
  return `polygon(${pts.join(',')})`
})()

export default function GraphPaper({
  date, todos, stickers, pct,
  activeSticker,
  onToggle, onDeleteTodo,
  onAddSticker, onUpdateSticker, onDeleteSticker,
  onActiveSticker,
}: Props) {
  const paperRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ el: HTMLDivElement; id: string; offX: number; offY: number } | null>(null)
  const [localStickers, setLocalStickers] = useState<PlacedSticker[]>([])

  useEffect(() => {
    setLocalStickers(stickers.map(s => ({ ...s, localX: s.x, localY: s.y })))
  }, [stickers])

  // Place sticker on paper click
  const handlePaperClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!activeSticker) return
    const target = e.target as HTMLElement
    if (target.dataset.stickerEl) return
    if (['BUTTON', 'TEXTAREA', 'INPUT'].includes(target.tagName)) return

    const paper = paperRef.current
    if (!paper) return
    const rect = paper.getBoundingClientRect()
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY
    const x = clientX - rect.left - 17
    const y = clientY - rect.top - 17

    onAddSticker(activeSticker, x, y).then(s => {
      if (s) setLocalStickers(prev => [...prev, { ...s, localX: x, localY: y }])
    })
    onActiveSticker(null)
  }, [activeSticker, onAddSticker, onActiveSticker])

  // Drag sticker
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, id: string, el: HTMLDivElement) => {
    e.stopPropagation()
    const paper = paperRef.current
    if (!paper) return
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
      const x = Math.max(0, Math.min(cx - dragging.current.offX, rect.width - 40))
      const y = Math.max(0, Math.min(cy - dragging.current.offY, rect.height - 40))
      dragging.current.el.style.left = x + 'px'
      dragging.current.el.style.top = y + 'px'
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

  // Double-tap delete sticker
  const tapCount = useRef<Record<string, number>>({})
  const tapTimer = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const handleStickerDoubleTap = useCallback((id: string, el: HTMLDivElement) => {
    tapCount.current[id] = (tapCount.current[id] ?? 0) + 1
    if (tapCount.current[id] === 1) {
      tapTimer.current[id] = setTimeout(() => { tapCount.current[id] = 0 }, 350)
    } else if (tapCount.current[id] >= 2) {
      clearTimeout(tapTimer.current[id])
      tapCount.current[id] = 0
      el.style.transition = 'transform 0.18s, opacity 0.18s'
      el.style.transform = 'scale(0)'
      el.style.opacity = '0'
      setTimeout(() => {
        setLocalStickers(prev => prev.filter(s => s.id !== id))
        onDeleteSticker(id)
      }, 200)
    }
  }, [onDeleteSticker])

  const is100 = pct === 100 && todos.length > 0

  return (
    <div className="flex-1">
      <div
        ref={paperRef}
        id="graphPaper"
        style={{
          clipPath: PINKING_PATH,
          backgroundImage: `
            linear-gradient(rgba(100,160,255,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,160,255,0.22) 1px, transparent 1px),
            linear-gradient(rgba(100,160,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,160,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '110px 110px, 110px 110px, 22px 22px, 22px 22px',
          cursor: activeSticker ? 'crosshair' : 'default',
        }}
        className="bg-[#fffef9] rounded-2xl px-7 pb-7 pt-7 pr-[14%] min-h-[520px] relative shadow-[0_16px_54px_rgba(0,0,0,0.22),-4px_0_18px_rgba(0,0,0,0.06)]"
        onClick={handlePaperClick}
      >
        <div className="text-[11px] font-black text-[#c8d8ff] tracking-[3px] uppercase mb-1">MY TODO LIST</div>
        <div className="text-[11px] font-bold text-[#d0daee] pb-3.5 border-b-2 border-[rgba(147,197,253,0.28)] mb-4">
          {formatDisplayDate(date)}
        </div>

        <ul className="list-none">
          {todos.map(t => (
            <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDeleteTodo} />
          ))}
        </ul>

        {is100 && (
          <div className="text-center py-3.5 text-lg font-black text-[#FF3CAC] animate-bounce">
            🎉 모든 할 일 완료! 화분이 활짝 피었어요! 🎉
          </div>
        )}

        {is100 && <BarcodeReceipt date={date} paperRef={paperRef} />}

        {/* Placed stickers */}
        {localStickers.map(s => (
          <div
            key={s.id}
            data-sticker-el="true"
            style={{ left: s.localX, top: s.localY, position: 'absolute', zIndex: 60 }}
            className="text-[34px] leading-none cursor-move select-none touch-none transition-transform hover:scale-110 hover:-rotate-6"
            onMouseDown={(e) => startDrag(e, s.id, e.currentTarget as HTMLDivElement)}
            onTouchStart={(e) => startDrag(e, s.id, e.currentTarget as HTMLDivElement)}
            onDoubleClick={(e) => { e.stopPropagation(); handleStickerDoubleTap(s.id, e.currentTarget as HTMLDivElement) }}
            onTouchEnd={(e) => { e.stopPropagation(); handleStickerDoubleTap(s.id, e.currentTarget as HTMLDivElement) }}
          >
            {s.emoji}
          </div>
        ))}
      </div>
    </div>
  )
}
