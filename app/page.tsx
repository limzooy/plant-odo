'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { fetchTodos, addTodo, toggleTodo, deleteTodo, fetchPlant, savePlant, fetchStickers, addSticker, updateStickerPosition, deleteSticker } from '@/lib/db'
import type { Todo, Plant, Sticker, PlantType } from '@/types'
import { formatDate, formatTime } from '@/types'
import PlantSelect from '@/components/PlantSelect'
import PlantProgress from '@/components/PlantProgress'
import GraphPaper from '@/components/GraphPaper'
import TodoInput from '@/components/TodoInput'
import StickerPicker from '@/components/StickerPicker'

const today = new Date()
const todayKey = formatDate(today)
const DAYS = ['일','월','화','수','목','금','토']

export default function HomePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [plant, setPlant] = useState<Plant | null | undefined>(undefined)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [activeSticker, setActiveSticker] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUserId(data.user.id)
    })
  }, [router])

  useEffect(() => {
    if (!userId) return
    Promise.all([
      fetchTodos(userId, todayKey),
      fetchPlant(userId, todayKey),
      fetchStickers(userId, todayKey),
    ]).then(([t, p, s]) => {
      setTodos(t); setPlant(p); setStickers(s); setLoading(false)
    })
  }, [userId])

  const pct = todos.length === 0 ? 0 : Math.round(todos.filter(t => t.done).length / todos.length * 100)
  const done = todos.filter(t => t.done).length

  const handlePlantConfirm = async (type: PlantType) => {
    if (!userId) return
    await savePlant(userId, todayKey, type)
    const p = await fetchPlant(userId, todayKey)
    setPlant(p)
  }

  const handleAddTodo = useCallback(async (text: string) => {
    if (!userId) return
    const t = await addTodo(userId, todayKey, text)
    if (t) setTodos(prev => [...prev, t])
  }, [userId])

  const handleToggle = useCallback(async (id: string, newDone: boolean) => {
    const doneAt = newDone ? formatTime(new Date()) : null
    await toggleTodo(id, newDone, doneAt)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: newDone, done_at: doneAt } : t))
  }, [])

  const handleDeleteTodo = useCallback(async (id: string) => {
    await deleteTodo(id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleAddSticker = useCallback(async (emoji: string, x: number, y: number): Promise<Sticker | null> => {
    if (!userId) return null
    const s = await addSticker(userId, todayKey, emoji, x, y)
    if (s) setStickers(prev => [...prev, s])
    return s
  }, [userId])

  const handleUpdateSticker = useCallback((id: string, x: number, y: number) => {
    updateStickerPosition(id, x, y)
  }, [])

  const handleDeleteSticker = useCallback((id: string) => {
    deleteSticker(id)
    setStickers(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/login')
  }

  if (loading || plant === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce">🌱</div>
      </div>
    )
  }

  if (!plant) {
    return (
      <div className="p-4">
        <TopBar onLogout={handleLogout} activeTab="today" />
        <PlantSelect onConfirm={handlePlantConfirm} />
      </div>
    )
  }

  return (
    <div className="p-4">
      <TopBar onLogout={handleLogout} activeTab="today" />
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

function TopBar({ onLogout, activeTab }: { onLogout: () => void; activeTab: 'today' | 'monthly' }) {
  const d = new Date()
  return (
    <div className="flex justify-between items-center max-w-[1120px] mx-auto mb-5">
      <div className="flex bg-white/18 backdrop-blur-md rounded-full p-1 gap-0.5">
        <Link href="/">
          <button className={`px-6 py-2 rounded-full text-sm font-black transition-all border-none cursor-pointer ${activeTab === 'today' ? 'bg-white text-[#FF3CAC] shadow-[0_3px_14px_rgba(0,0,0,0.18)]' : 'bg-transparent text-white/75'}`}>🌱 오늘</button>
        </Link>
        <Link href="/monthly">
          <button className={`px-6 py-2 rounded-full text-sm font-black transition-all border-none cursor-pointer ${activeTab === 'monthly' ? 'bg-white text-[#FF3CAC] shadow-[0_3px_14px_rgba(0,0,0,0.18)]' : 'bg-transparent text-white/75'}`}>📅 월별</button>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white/92 rounded-[20px] px-5 py-2 text-[13px] font-black text-[#555] shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
          {d.getMonth()+1}월 {d.getDate()}일 {['일','월','화','수','목','금','토'][d.getDay()]}요일
        </div>
        <button onClick={onLogout} className="bg-white/20 text-white border-none rounded-full px-4 py-2 text-xs font-black cursor-pointer hover:bg-white/30 transition-colors">
          로그아웃
        </button>
      </div>
    </div>
  )
}
