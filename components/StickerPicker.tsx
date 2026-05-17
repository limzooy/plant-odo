'use client'

import { STICKERS } from '@/types'

interface Props {
  activeSticker: string | null
  onSelect: (emoji: string | null) => void
}

export default function StickerPicker({ activeSticker, onSelect }: Props) {
  return (
    <div className="bg-white/96 rounded-[20px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
      <h3 className="text-[11px] font-black text-[#bbb] mb-3 uppercase tracking-wider">🎨 스티커</h3>
      <div className="grid grid-cols-5 gap-1">
        {STICKERS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(activeSticker === emoji ? null : emoji)}
            className={`text-[26px] text-center rounded-[10px] py-1 px-0.5 cursor-pointer transition-all duration-200 border-2 leading-none
              ${activeSticker === emoji
                ? 'bg-[#e8f0ff] border-[#4facfe] scale-110'
                : 'border-transparent hover:bg-[#f0f4ff] hover:scale-125'
              }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#ccc] text-center mt-2 font-bold leading-snug">
        {activeSticker
          ? '종이를 탭해서 붙여요! 다시 탭하면 해제 ✨'
          : '스티커 선택 후 종이에 터치해서 붙여요!'}
      </p>
    </div>
  )
}
