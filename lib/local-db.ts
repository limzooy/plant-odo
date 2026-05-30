'use client'

import type { Todo, Plant, Sticker, PlantType, Project, ProjectTodo, SubProject } from '@/types'
import { formatDate } from '@/types'

const KEY = 'plantodo_local'

type StorageData = {
  todos: Record<string, Todo[]>
  plants: Record<string, Plant>
  stickers: Record<string, Sticker[]>
  projects: Project[]
}

function load(): StorageData {
  if (typeof window === 'undefined') return { todos: {}, plants: {}, stickers: {}, projects: [] }
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    if (!raw.projects) raw.projects = []
    return raw
  } catch { return { todos: {}, plants: {}, stickers: {}, projects: [] } }
}
function save(data: ReturnType<typeof load>) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

function dedup<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  return arr.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true })
}

// ── Todos ──────────────────────────────────────────
export function getTodos(date: string): Todo[] {
  return dedup(load().todos?.[date] ?? [])
}
export function addTodo(date: string, text: string): Todo {
  const data = load()
  if (!data.todos) data.todos = {}
  const todo: Todo = {
    id: crypto.randomUUID(),
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
export function savePlant(date: string, type: PlantType, imageUrl?: string) {
  const data = load()
  if (!data.plants) data.plants = {}
  data.plants[date] = { id: date, user_id: 'local', date, type, ...(imageUrl ? { imageUrl } : {}) }
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
  return dedup(load().stickers?.[date] ?? [])
}
export function addSticker(date: string, emoji: string, x: number, y: number, imageUrl?: string): Sticker {
  const data = load()
  if (!data.stickers) data.stickers = {}
  const sticker: Sticker = { id: crypto.randomUUID(), user_id: 'local', date, emoji, x, y, ...(imageUrl ? { imageUrl } : {}) }
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

// ── Projects ───────────────────────────────────────
export function getProjects(): Project[] {
  return load().projects ?? []
}

export function addProject(proj: Omit<Project, 'id' | 'created_at'>): Project {
  const data = load()
  const project: Project = { ...proj, id: crypto.randomUUID(), created_at: new Date().toISOString() }
  data.projects = [...(data.projects ?? []), project]
  save(data)
  return project
}

export function updateProject(updated: Project) {
  const data = load()
  data.projects = (data.projects ?? []).map(p => p.id === updated.id ? updated : p)
  save(data)
}

export function deleteProject(id: string) {
  const data = load()
  data.projects = (data.projects ?? []).filter(p => p.id !== id)
  save(data)
}

export function addProjectTodo(projectId: string, text: string, dueDate: string, subProjectId?: string): ProjectTodo {
  const data = load()
  const todo: ProjectTodo = {
    id: crypto.randomUUID(),
    text,
    done: false,
    dueDate,
    done_at: null,
    created_at: new Date().toISOString(),
  }
  data.projects = (data.projects ?? []).map(p => {
    if (p.id !== projectId) return p
    if (subProjectId) {
      return { ...p, subProjects: p.subProjects.map(sp =>
        sp.id === subProjectId ? { ...sp, todos: [...sp.todos, todo] } : sp
      )}
    }
    return { ...p, todos: [...p.todos, todo] }
  })
  save(data)
  return todo
}

export function toggleProjectTodo(projectId: string, todoId: string, done: boolean, subProjectId?: string) {
  const data = load()
  const done_at = done ? new Date().toISOString() : null
  data.projects = (data.projects ?? []).map(p => {
    if (p.id !== projectId) return p
    if (subProjectId) {
      return { ...p, subProjects: p.subProjects.map(sp =>
        sp.id === subProjectId
          ? { ...sp, todos: sp.todos.map(t => t.id === todoId ? { ...t, done, done_at } : t) }
          : sp
      )}
    }
    return { ...p, todos: p.todos.map(t => t.id === todoId ? { ...t, done, done_at } : t) }
  })
  save(data)
}

export function deleteSubProject(projectId: string, subProjectId: string) {
  const data = load()
  data.projects = (data.projects ?? []).map(p =>
    p.id === projectId ? { ...p, subProjects: p.subProjects.filter(sp => sp.id !== subProjectId) } : p
  )
  save(data)
}

export function addSubProject(projectId: string, name: string, startDate?: string, endDate?: string): SubProject {
  const data = load()
  const sp: SubProject = { id: crypto.randomUUID(), name, startDate, endDate, todos: [] }
  data.projects = (data.projects ?? []).map(p =>
    p.id === projectId ? { ...p, subProjects: [...p.subProjects, sp] } : p
  )
  save(data)
  return sp
}

export function updateProjectTodo(projectId: string, todoId: string, text: string, dueDate: string, subProjectId?: string) {
  const data = load()
  data.projects = (data.projects ?? []).map(p => {
    if (p.id !== projectId) return p
    if (subProjectId) {
      return { ...p, subProjects: p.subProjects.map(sp =>
        sp.id === subProjectId
          ? { ...sp, todos: sp.todos.map(t => t.id === todoId ? { ...t, text, dueDate } : t) }
          : sp
      )}
    }
    return { ...p, todos: p.todos.map(t => t.id === todoId ? { ...t, text, dueDate } : t) }
  })
  save(data)
}

export function updateSubProject(projectId: string, subProjectId: string, name: string, startDate?: string, endDate?: string) {
  const data = load()
  data.projects = (data.projects ?? []).map(p =>
    p.id === projectId
      ? { ...p, subProjects: p.subProjects.map(sp => sp.id === subProjectId ? { ...sp, name, startDate, endDate } : sp) }
      : p
  )
  save(data)
}

export function deleteProjectTodo(projectId: string, todoId: string, subProjectId?: string) {
  const data = load()
  data.projects = (data.projects ?? []).map(p => {
    if (p.id !== projectId) return p
    if (subProjectId) {
      return { ...p, subProjects: p.subProjects.map(sp =>
        sp.id === subProjectId ? { ...sp, todos: sp.todos.filter(t => t.id !== todoId) } : sp
      )}
    }
    return { ...p, todos: p.todos.filter(t => t.id !== todoId) }
  })
  save(data)
}
