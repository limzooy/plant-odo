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
    <div className="p-5" style={{
      background: 'var(--paper)',
      border: '2.5px solid #2C1810',
      borderRadius: 12,
      boxShadow: '5px 5px 0 #2C1810',
    }}>
      <h3 className="text-[18px] font-black mb-3 uppercase tracking-wider" style={{ color: '#8A7A6A' }}>
        ✏️ 투두 추가
      </h3>
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
        className="w-full p-3 text-sm font-bold resize-none h-[82px] outline-none transition-colors"
        style={{
          background: '#F5EDD8',
          border: '2px solid #8A7A6A',
          borderRadius: 8,
          color: 'var(--ink)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={e =>  { e.currentTarget.style.borderColor = '#8A7A6A' }}
      />
      <button
        onClick={handleAdd}
        className="w-full text-white border-none py-3 text-sm font-black cursor-pointer mt-2.5 transition-all duration-150"
        style={{
          background: 'var(--accent)',
          borderRadius: 8,
          border: '2.5px solid #2C1810',
          boxShadow: '3px 3px 0 #2C1810',
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translate(2px,2px)'; el.style.boxShadow='1px 1px 0 #2C1810' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='3px 3px 0 #2C1810' }}
      >
        + 추가하기
      </button>
    </div>
  )
}
