'use client'

import { useState } from 'react'
import type { PlantType } from '@/types'
import { PLANT_DATA } from '@/types'

interface Props {
  onConfirm: (type: PlantType) => void
}

const PLANT_ICONS: { type: PlantType; icon: string }[] = [
  { type: 'cactus', icon: '🌵' },
  { type: 'sunflower', icon: '🌻' },
  { type: 'rose', icon: '🌹' },
  { type: 'tulip', icon: '🌷' },
  { type: 'cherry', icon: '🌸' },
  { type: 'clover', icon: '🍀' },
]

export default function PlantSelect({ onConfirm }: Props) {
  const [selected, setSelected] = useState<PlantType | null>(null)

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="bg-white/97 rounded-[32px] p-12 text-center max-w-[540px] w-full shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
        <h2 className="text-[26px] font-black text-[#2d2d2d] mb-2">🌿 오늘의 화분을 골라요!</h2>
        <p className="text-[13px] text-[#aaa] mb-8 leading-relaxed">
          하루에 하나의 화분을 선택할 수 있어요.<br />
          투두리스트를 완성할수록 화분이 무럭무럭 자랍니다!
        </p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {PLANT_ICONS.map(({ type, icon }) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={`border-[3px] rounded-[20px] p-5 cursor-pointer transition-all duration-200 bg-[#fafafa]
                ${selected === type
                  ? 'border-[#FF3CAC] bg-gradient-to-br from-[#fff5f7] to-[#fff0fb] -translate-y-1 shadow-[0_10px_28px_rgba(255,60,172,0.22)]'
                  : 'border-[#f0f0f0] hover:border-[#FF3CAC] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(255,60,172,0.2)]'
                }`}
            >
              <span className="text-5xl block mb-2 leading-none">{icon}</span>
              <span className="text-[13px] font-black text-[#555]">{PLANT_DATA[type].name}</span>
            </button>
          ))}
        </div>
        <button
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
          className="bg-gradient-to-br from-[#f093fb] to-[#FF3CAC] text-white border-none rounded-full px-12 py-4 text-base font-black cursor-pointer transition-all duration-300 shadow-[0_8px_28px_rgba(255,60,172,0.38)] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:-translate-y-1 hover:enabled:shadow-[0_12px_36px_rgba(255,60,172,0.5)]"
        >
          화분 선택 완료!
        </button>
      </div>
    </div>
  )
}
