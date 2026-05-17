export type PlantType = 'cactus' | 'sunflower' | 'rose' | 'tulip' | 'cherry' | 'clover'

export interface PlantInfo {
  name: string
  stages: string[]
  sizes: number[]
}

export interface Todo {
  id: string
  user_id: string
  date: string
  text: string
  done: boolean
  done_at: string | null
  created_at: string
}

export interface Plant {
  id: string
  user_id: string
  date: string
  type: PlantType
}

export interface Sticker {
  id: string
  user_id: string
  date: string
  emoji: string
  x: number
  y: number
}

export const PLANT_DATA: Record<PlantType, PlantInfo> = {
  cactus:    { name: '선인장',   stages: ['🪴','🌱','🌵','🌵','🌵','🌵✨'], sizes: [30,34,40,48,56,64] },
  sunflower: { name: '해바라기', stages: ['🪴','🌱','🌿','🌻','🌻','🌻✨'], sizes: [30,34,40,48,56,64] },
  rose:      { name: '장미',     stages: ['🪴','🌱','🌿','🌹','🌹','🌹✨'], sizes: [30,34,40,48,56,64] },
  tulip:     { name: '튤립',     stages: ['🪴','🌱','🌿','🌷','🌷','🌷✨'], sizes: [30,34,40,48,56,64] },
  cherry:    { name: '벚꽃',     stages: ['🪴','🌱','🌿','🌸','🌸','🌸✨'], sizes: [30,34,40,48,56,64] },
  clover:    { name: '클로버',   stages: ['🪴','🌱','🌿','🍀','🍀','🍀✨'], sizes: [30,34,40,48,56,64] },
}

export const STICKERS = [
  '⭐','🌟','💫','✨','🎈','🎀','🎊','💕','💖','🍭',
  '🍬','🧁','🌈','☀️','🌙','⚡','🔥','💎','🐱','🐶',
  '🐰','🦋','🌺','🍓','🎵',
]

export function getStageIndex(pct: number): number {
  if (pct === 0) return 0
  if (pct <= 20) return 1
  if (pct <= 40) return 2
  if (pct <= 60) return 3
  if (pct <= 80) return 4
  return 5
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDisplayDate(key: string): string {
  const d = new Date(key + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
}
