'use client'

import { createClient } from './supabase'
import type { Todo, Plant, Sticker, PlantType } from '@/types'

// ── Todos ──────────────────────────────────────────
export async function fetchTodos(userId: string, date: string): Promise<Todo[]> {
  const sb = createClient()
  const { data } = await sb
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function addTodo(userId: string, date: string, text: string): Promise<Todo | null> {
  const sb = createClient()
  const { data } = await sb
    .from('todos')
    .insert({ user_id: userId, date, text, done: false })
    .select()
    .single()
  return data
}

export async function toggleTodo(id: string, done: boolean, doneAt: string | null): Promise<void> {
  const sb = createClient()
  await sb.from('todos').update({ done, done_at: doneAt }).eq('id', id)
}

export async function deleteTodo(id: string): Promise<void> {
  const sb = createClient()
  await sb.from('todos').delete().eq('id', id)
}

// ── Plants ─────────────────────────────────────────
export async function fetchPlant(userId: string, date: string): Promise<Plant | null> {
  const sb = createClient()
  const { data } = await sb
    .from('plants')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  return data
}

export async function savePlant(userId: string, date: string, type: PlantType): Promise<void> {
  const sb = createClient()
  await sb.from('plants').upsert({ user_id: userId, date, type })
}

export async function fetchMonthlyData(userId: string, yearMonth: string) {
  const sb = createClient()
  const startDate = `${yearMonth}-01`
  const endDate = `${yearMonth}-31`

  const [todosRes, plantsRes] = await Promise.all([
    sb.from('todos').select('date, done').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    sb.from('plants').select('date, type').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
  ])

  return { todos: todosRes.data ?? [], plants: plantsRes.data ?? [] }
}

// ── Stickers ───────────────────────────────────────
export async function fetchStickers(userId: string, date: string): Promise<Sticker[]> {
  const sb = createClient()
  const { data } = await sb
    .from('stickers')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
  return data ?? []
}

export async function addSticker(userId: string, date: string, emoji: string, x: number, y: number): Promise<Sticker | null> {
  const sb = createClient()
  const { data } = await sb
    .from('stickers')
    .insert({ user_id: userId, date, emoji, x, y })
    .select()
    .single()
  return data
}

export async function updateStickerPosition(id: string, x: number, y: number): Promise<void> {
  const sb = createClient()
  await sb.from('stickers').update({ x, y }).eq('id', id)
}

export async function deleteSticker(id: string): Promise<void> {
  const sb = createClient()
  await sb.from('stickers').delete().eq('id', id)
}
