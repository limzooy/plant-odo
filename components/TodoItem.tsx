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
    <li className="group flex items-start gap-3 px-1 py-2.5 border-b border-dashed border-[rgba(147,197,253,0.3)] transition-colors hover:bg-[rgba(147,197,253,0.06)] hover:rounded-lg">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id, !todo.done)}
        className={`w-6 h-6 border-[2.5px] rounded-[7px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 text-white text-sm font-black
          ${todo.done
            ? 'bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] border-[#84fab0]'
            : 'border-[#d0ddf5] bg-white hover:border-[#84fab0] hover:bg-[#f0fff5]'
          }`}
      >
        {todo.done ? '✓' : ''}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-bold leading-snug break-words transition-all duration-200 ${todo.done ? 'line-through text-[#94a3b8]' : 'text-[#334155]'}`}>
          {todo.text}
        </div>
        <div className="text-[10px] text-[#c0cadc] font-bold mt-0.5">
          {todo.done && todo.done_at
            ? `✅ ${todo.done_at} 완료`
            : `🕐 ${formatCreatedAt(todo.created_at)} 추가`}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        title="삭제"
        className="text-[#ccc] text-base px-1.5 py-1 rounded-lg border-none bg-transparent cursor-pointer transition-all duration-150 hover:bg-[#fee2e2] hover:text-[#ef4444] hover:scale-110 flex-shrink-0"
      >
        🗑️
      </button>
    </li>
  )
}
