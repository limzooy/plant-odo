'use client'

import type { Todo, Plant, Sticker, PlantType } from '@/types'
import { formatDate } from '@/types'

const KEY = 'plantodo_local'

function load(): { todos: Record<string, Todo[]>; plants: Record<string, Plant>; stickers: Record<string, Sticker[]> } {
  if (typeof window === 'undefined') return { todos: {}, plants: {}, stickers: {} }
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} as never }
}
function save(data: ReturnType<typeof load>) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

// ── Todos ──────────────────────────────────────────
export function getTodos(date: string): Todo[] {
  return load().todos?.[date] ?? []
}
export function addTodo(date: string, text: string): Todo {
  const data = load()
  if (!data.todos) data.todos = {}
  const todo: Todo = {
    id: Date.now().toString(),
    user_id: 'local',
    date,
    text,
    done: false,
    done_at: null,
    created_at: new Date().toISOString(),
  }
  data.todos[date] = [...(data.todos[date] ?? []), todo]
  save(data)
  return todo
}
export function toggleTodo(date: string, id: string, done: boolean, done_at: string | null) {
  const data = load()
  data.todos[date] = (data.todos[date] ?? []).map(t => t.id === id ? { ...t, done, done_at } : t)
  save(data)
}
export function deleteTodo(date: string, id: string) {
  const data = load()
  data.todos[date] = (data.todos[date] ?? []).filter(t => t.id !== id)
  save(data)
}

// ── Plants ─────────────────────────────────────────
export function getPlant(date: string): Plant | null {
  return load().plants?.[date] ?? null
}
export function savePlant(date: string, type: PlantType) {
  const data = load()
  if (!data.plants) data.plants = {}
  data.plants[date] = { id: date, user_id: 'local', date, type }
  save(data)
}
export function getMonthlyData(yearMonth: string) {
  const data = load()
  const allTodos: { date: string; done: boolean }[] = []
  const allPlants: { date: string; type: string }[] = []

  Object.entries(data.todos ?? {}).forEach(([date, todos]) => {
    if (date.startsWith(yearMonth)) todos.forEach(t => allTodos.push({ date, done: t.done }))
  })
  Object.entries(data.plants ?? {}).forEach(([date, plant]) => {
    if (date.startsWith(yearMonth)) allPlants.push({ date, type: plant.type })
  })
  return { todos: allTodos, plants: allPlants }
}

// ── Stickers ───────────────────────────────────────
export function getStickers(date: string): Sticker[] {
  return load().stickers?.[date] ?? []
}
export function addSticker(date: string, emoji: string, x: number, y: number): Sticker {
  const data = load()
  if (!data.stickers) data.stickers = {}
  const sticker: Sticker = { id: Date.now().toString(), user_id: 'local', date, emoji, x, y }
  data.stickers[date] = [...(data.stickers[date] ?? []), sticker]
  save(data)
  return sticker
}
export function updateStickerPos(date: string, id: string, x: number, y: number) {
  const data = load()
  data.stickers[date] = (data.stickers[date] ?? []).map(s => s.id === id ? { ...s, x, y } : s)
  save(data)
}
export function deleteSticker(date: string, id: string) {
  const data = load()
  data.stickers[date] = (data.stickers[date] ?? []).filter(s => s.id !== id)
  save(data)
}
