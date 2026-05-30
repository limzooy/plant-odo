'use client'

import type { Todo } from '@/types'

interface Props {
  todo: Todo
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}

function formatCreatedAt(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className="group flex items-start gap-3 px-1 py-2.5 border-b border-dashed transition-colors"
      style={{ borderColor: 'rgba(140,100,60,0.3)' }}>
      {/* 체크박스 — SVG 체크마크로 html2canvas 호환 */}
      <button
        onClick={() => onToggle(todo.id, !todo.done)}
        className="flex-shrink-0 mt-0.5 cursor-pointer transition-all duration-200"
        style={{
          width: 22, height: 22,
          border: '2px solid',
          borderColor: todo.done ? '#4F7942' : '#8A7A6A',
          borderRadius: 5,
          background: todo.done ? '#4F7942' : 'var(--paper)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {todo.done && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-[19px] font-bold leading-snug break-words transition-all duration-200"
          style={{ color: todo.done ? '#A09080' : 'var(--ink)', textDecoration: todo.done ? 'line-through' : 'none' }}>
          {todo.text}
        </div>
        <div className="text-[16px] font-bold mt-0.5" style={{ color: '#B0A090' }}>
          {todo.done && todo.done_at
            ? `✅ ${todo.done_at} 완료`
            : `🕐 ${formatCreatedAt(todo.created_at)} 추가`}
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        title="삭제"
        className="text-base px-1 py-0.5 rounded border-none bg-transparent cursor-pointer transition-all duration-150 flex-shrink-0 opacity-0 group-hover:opacity-100"
        style={{ color: '#C8B8A8' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C8B8A8' }}
      >
        ✕
      </button>
    </li>
  )
}
