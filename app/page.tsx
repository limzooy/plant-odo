'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import * as db from '@/lib/local-db'
import type { Todo, Plant, Sticker, PlantType } from '@/types'
import { formatDate, formatTime } from '@/types'
import PlantSelect from '@/components/PlantSelect'
import PlantProgress from '@/components/PlantProgress'
import GraphPaper from '@/components/GraphPaper'
import TodoInput from '@/components/TodoInput'
import StickerPicker from '@/components/StickerPicker'

const today = new Date()
const todayKey = formatDate(today)

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [plant, setPlant] = useState<Plant | null | undefined>(undefined)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [activeSticker, setActiveSticker] = useState<string | null>(null)

  // localStorage는 클라이언트에서만 읽을 수 있으므로 mount 후 초기화
  useEffect(() => {
    setTodos(db.getTodos(todayKey))
    setPlant(db.getPlant(todayKey))
    setStickers(db.getStickers(todayKey))
  }, [])

  const pct = todos.length === 0 ? 0 : Math.round(todos.filter(t => t.done).length / todos.length * 100)
  const done = todos.filter(t => t.done).length

  const handlePlantConfirm = useCallback((type: PlantType) => {
    db.savePlant(todayKey, type)
    setPlant(db.getPlant(todayKey))
  }, [])

  const handleAddTodo = useCallback((text: string) => {
    const t = db.addTodo(todayKey, text)
    setTodos(prev => [...prev, t])
  }, [])

  const handleToggle = useCallback((id: string, newDone: boolean) => {
    const doneAt = newDone ? formatTime(new Date()) : null
    db.toggleTodo(todayKey, id, newDone, doneAt)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: newDone, done_at: doneAt } : t))
  }, [])

  const handleDeleteTodo = useCallback((id: string) => {
    db.deleteTodo(todayKey, id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleAddSticker = useCallback(async (emoji: string, x: number, y: number): Promise<Sticker | null> => {
    const s = db.addSticker(todayKey, emoji, x, y)
    setStickers(prev => [...prev, s])
    return s
  }, [])

  const handleUpdateSticker = useCallback((id: string, x: number, y: number) => {
    db.updateStickerPos(todayKey, id, x, y)
  }, [])

  const handleDeleteSticker = useCallback((id: string) => {
    db.deleteSticker(todayKey, id)
    setStickers(prev => prev.filter(s => s.id !== id))
  }, [])

  // 초기 로딩 (undefined = 아직 로컬스토리지 안 읽은 상태)
  if (plant === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce">🌱</div>
      </div>
    )
  }

  // 오늘 화분 미선택
  if (!plant) {
    return (
      <div className="p-4">
        <TopBar activeTab="today" />
        <PlantSelect onConfirm={handlePlantConfirm} />
      </div>
    )
  }

  return (
    <div className="p-4">
      <TopBar activeTab="today" />
      <div className="max-w-[1120px] mx-auto">
        <PlantProgress pct={pct} plantType={plant.type} done={done} total={todos.length} />
        <div className="flex gap-5 items-start flex-col-reverse md:flex-row">
          <GraphPaper
            date={todayKey}
            todos={todos}
            stickers={stickers}
            pct={pct}
            activeSticker={activeSticker}
            onToggle={handleToggle}
            onDeleteTodo={handleDeleteTodo}
            onAddSticker={handleAddSticker}
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            onActiveSticker={setActiveSticker}
          />
          <div className="w-full md:w-[258px] flex-shrink-0 flex flex-col gap-4">
            <TodoInput onAdd={handleAddTodo} />
            <StickerPicker activeSticker={activeSticker} onSelect={setActiveSticker} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TopBar({ activeTab }: { activeTab: 'today' | 'monthly' }) {
  const d = new Date()
  const DAYS = ['일','월','화','수','목','금','토']
  return (
    <div className="flex justify-between items-center max-w-[1120px] mx-auto mb-5">
      <div className="flex bg-white/18 backdrop-blur-md rounded-full p-1 gap-0.5">
        <Link href="/">
          <button className={`px-6 py-2 rounded-full text-sm font-black transition-all border-none cursor-pointer ${activeTab === 'today' ? 'bg-white text-[#FF3CAC] shadow-[0_3px_14px_rgba(0,0,0,0.18)]' : 'bg-transparent text-white/75'}`}>
            🌱 오늘
          </button>
        </Link>
        <Link href="/monthly">
          <button className={`px-6 py-2 rounded-full text-sm font-black transition-all border-none cursor-pointer ${activeTab === 'monthly' ? 'bg-white text-[#FF3CAC] shadow-[0_3px_14px_rgba(0,0,0,0.18)]' : 'bg-transparent text-white/75'}`}>
            📅 월별
          </button>
        </Link>
      </div>
      <div className="bg-white/92 rounded-[20px] px-5 py-2 text-[13px] font-black text-[#555] shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
        {d.getMonth()+1}월 {d.getDate()}일 {DAYS[d.getDay()]}요일
      </div>
    </div>
  )
}
