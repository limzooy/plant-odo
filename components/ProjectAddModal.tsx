'use client'

import { useState } from 'react'
import type { Project, SubProject } from '@/types'
import { PROJECT_COLORS, randomProjectColor } from '@/types'
import DatePicker from './DatePicker'

interface Props {
  onAdd: (proj: Omit<Project, 'id' | 'created_at'>) => void
  onClose: () => void
}

export default function ProjectAddModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [color, setColor] = useState('')
  const [subInput, setSubInput] = useState('')
  const [subProjects, setSubProjects] = useState<Pick<SubProject, 'id' | 'name'>[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '프로젝트명을 입력해주세요'
    if (!startDate) e.startDate = '시작일을 입력해주세요'
    if (!endDate) e.endDate = '종료일을 입력해주세요'
    if (startDate && endDate && startDate > endDate) e.endDate = '종료일은 시작일 이후여야 합니다'
    if (!teamSize || isNaN(Number(teamSize)) || Number(teamSize) < 1) e.teamSize = '인원수를 입력해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddSub = () => {
    const trimmed = subInput.trim()
    if (!trimmed) return
    setSubProjects(prev => [...prev, { id: crypto.randomUUID(), name: trimmed }])
    setSubInput('')
  }

  const handleSubmit = () => {
    if (!validate()) return
    onAdd({
      name: name.trim(),
      startDate,
      endDate,
      teamSize: Number(teamSize),
      color: color || randomProjectColor(),
      subProjects: subProjects.map(sp => ({ ...sp, todos: [] })),
      todos: [],
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(44,24,16,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-[480px] mx-4 rounded-2xl overflow-y-auto"
        style={{
          background: 'var(--paper)',
          border: '2.5px solid #2C1810',
          boxShadow: '8px 8px 0 #2C1810',
          maxHeight: '90vh',
        }}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '2px solid rgba(140,100,60,0.2)' }}>
          <span className="text-[21px] font-black tracking-[2px]" style={{ color: 'var(--gold)' }}>
            NEW PROJECT
          </span>
          <button
            onClick={onClose}
            className="text-xl font-black cursor-pointer"
            style={{ color: 'var(--muted)', lineHeight: 1 }}
          >×</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* 프로젝트명 */}
          <Field label="프로젝트명" required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              maxLength={40}
              className="modal-input w-full outline-none text-[18px] font-bold"
              style={inputStyle}
            />
          </Field>

          {/* 기간 */}
          <div className="flex gap-3">
            <Field label="시작일" required error={errors.startDate} className="flex-1">
              <DatePicker value={startDate} onChange={setStartDate} placeholder="시작일 선택" />
            </Field>
            <Field label="종료일" required error={errors.endDate} className="flex-1">
              <DatePicker value={endDate} onChange={setEndDate} placeholder="종료일 선택" />
            </Field>
          </div>

          {/* 인원수 */}
          <Field label="인원수" required error={errors.teamSize}>
            <input
              type="number"
              value={teamSize}
              onChange={e => setTeamSize(e.target.value)}
              placeholder="명"
              min={1}
              max={999}
              className="modal-input w-full outline-none text-[18px] font-bold"
              style={inputStyle}
            />
          </Field>

          {/* 색상 */}
          <Field label="색상" hint="선택하지 않으면 랜덤 지정">
            <div className="flex gap-2 flex-wrap pt-1">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? '' : c)}
                  className="cursor-pointer transition-transform"
                  style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #2C1810' : '2px solid rgba(44,24,16,0.2)',
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: color === c ? '0 2px 6px rgba(0,0,0,0.25)' : 'none',
                  }}
                />
              ))}
              <div
                className="flex items-center justify-center text-[18px] font-black cursor-pointer"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px dashed rgba(44,24,16,0.35)',
                  color: 'var(--muted)',
                }}
                title="랜덤"
              >?</div>
            </div>
          </Field>

          {/* 서브 프로젝트 */}
          <Field label="서브 프로젝트" hint="선택사항">
            <div className="flex gap-2">
              <input
                type="text"
                value={subInput}
                onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSub() } }}
                placeholder="서브 프로젝트명 입력 후 Enter"
                maxLength={40}
                className="modal-input flex-1 outline-none text-[18px] font-bold"
                style={inputStyle}
              />
              <button
                onClick={handleAddSub}
                className="cursor-pointer text-[16px] font-black px-4 rounded-xl transition-all"
                style={{
                  background: 'var(--ink)', color: 'var(--paper)',
                  border: '2px solid #2C1810',
                  boxShadow: '2px 2px 0 #8A6C50',
                }}
              >추가</button>
            </div>
            {subProjects.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {subProjects.map(sp => (
                  <div key={sp.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(140,100,60,0.1)', border: '1.5px solid rgba(140,100,60,0.25)' }}>
                    <span className="text-[16px] font-bold flex-1" style={{ color: '#5A3E2B' }}>• {sp.name}</span>
                    <button
                      onClick={() => setSubProjects(prev => prev.filter(s => s.id !== sp.id))}
                      className="cursor-pointer text-[19px] font-black"
                      style={{ color: 'var(--accent)' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[18px] font-black cursor-pointer transition-all"
            style={{
              background: 'var(--paper)',
              border: '2.5px solid #2C1810',
              color: 'var(--ink)',
              boxShadow: '3px 3px 0 #8A6C50',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translate(1px,1px)'; el.style.boxShadow = '2px 2px 0 #8A6C50' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '3px 3px 0 #8A6C50' }}
          >취소</button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-[18px] font-black cursor-pointer transition-all"
            style={{
              background: 'var(--accent)',
              border: '2.5px solid #2C1810',
              color: 'var(--paper)',
              boxShadow: '3px 3px 0 #2C1810',
            }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translate(1px,1px)'; el.style.boxShadow = '2px 2px 0 #2C1810' }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '3px 3px 0 #2C1810' }}
          >프로젝트 추가</button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(140,100,60,0.08)',
  border: '2px solid rgba(140,100,60,0.3)',
  borderRadius: 10,
  padding: '8px 12px',
  color: 'var(--ink)',
}

function Field({
  label, required, hint, error, children, className,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className ?? ''}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[19px] font-black" style={{ color: '#5A3E2B' }}>{label}</span>
        {required && <span className="text-[13px] font-normal" style={{ color: 'var(--accent)' }}>*필수</span>}
        {hint && <span className="text-[13px] font-normal" style={{ color: 'var(--muted)' }}>{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[18px] font-bold mt-1" style={{ color: 'var(--accent)' }}>{error}</p>}
    </div>
  )
}
