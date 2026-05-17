'use client'

import type { PlantType } from '@/types'
import { PLANT_DATA, getStageIndex } from '@/types'

interface Props {
  pct: number
  plantType: PlantType | null
  done: number
  total: number
}

export default function PlantProgress({ pct, plantType, done, total }: Props) {
  const plant = plantType ? PLANT_DATA[plantType] : null
  const si = getStageIndex(pct)
  const emoji = plant ? plant.stages[si] : '🪴'
  const size = plant ? plant.sizes[si] : 32
  const is100 = pct === 100 && total > 0

  return (
    <div className="bg-white/96 rounded-3xl px-7 py-5 mb-5 flex items-center gap-6 shadow-[0_12px_44px_rgba(0,0,0,0.16)]">
      {/* Plant emoji */}
      <div className="text-center min-w-[76px]">
        <span
          style={{
            fontSize: size,
            filter: is100 ? 'drop-shadow(0 0 14px gold)' : undefined,
            animation: is100 ? 'wiggle 1.2s infinite ease-in-out' : undefined,
            display: 'block',
            lineHeight: 1,
            transition: 'font-size 0.5s ease, filter 0.5s ease',
          }}
        >
          {emoji}
        </span>
        <div className="text-[11px] text-[#bbb] font-black mt-1">
          {plant?.name ?? ''}
        </div>
      </div>

      {/* Progress */}
      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[11px] font-black text-[#aaa] uppercase tracking-wide">오늘의 달성률</span>
          <span className="text-[34px] font-black bg-gradient-to-br from-[#f093fb] to-[#FF3CAC] bg-clip-text text-transparent">
            {pct}%
          </span>
        </div>
        <div className="bg-[#f0f0f0] rounded-full h-5 overflow-hidden relative">
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #a8edea, #fed6e3, #f5576c)',
            }}
          >
            <span className="absolute inset-0 shimmer" />
          </div>
        </div>
        <div className="text-[12px] text-[#ccc] font-bold mt-1.5">
          {total === 0
            ? '투두를 추가해서 화분을 키워보세요 🌱'
            : `${done}/${total} 완료`}
        </div>
      </div>
    </div>
  )
}
