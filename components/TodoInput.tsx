'use client'

import { useState, useRef } from 'react'

interface Props {
  onAdd: (text: string) => void
}

export default function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState('')
  const isComposing = useRef(false)

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <div className="bg-white/96 rounded-[20px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
      <h3 className="text-[11px] font-black text-[#bbb] mb-3 uppercase tracking-wider">✏️ 투두 추가</h3>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onCompositionStart={() => { isComposing.current = true }}
        onCompositionEnd={() => { isComposing.current = false }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !isComposing.current) {
            e.preventDefault()
            handleAdd()
          }
        }}
        placeholder={'할 일을 입력하고\nEnter 또는 버튼을 누르세요'}
        maxLength={120}
        className="w-full border-2 border-[#f0f0f0] rounded-xl p-3 text-sm font-bold text-[#334155] outline-none resize-none h-[82px] bg-[#fbfbfb] transition-colors focus:border-[#FF3CAC] focus:bg-white"
      />
      <button
        onClick={handleAdd}
        className="w-full bg-gradient-to-br from-[#f093fb] to-[#FF3CAC] text-white border-none rounded-xl py-3 text-sm font-black cursor-pointer mt-2.5 transition-all duration-200 shadow-[0_5px_16px_rgba(255,60,172,0.32)] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(255,60,172,0.44)]"
      >
        + 추가하기
      </button>
    </div>
  )
}
