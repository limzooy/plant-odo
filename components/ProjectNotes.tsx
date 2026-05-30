'use client'

import { useState, useRef, useCallback } from 'react'
import type { Project, ProjectTodo, SubProject } from '@/types'
import { PROJECT_COLORS } from '@/types'
import * as db from '@/lib/local-db'
import DatePicker from './DatePicker'

interface Props {
  projects: Project[]
  onUpdate: (projects: Project[]) => void
}

const TORN_BOTTOM = (() => {
  const heights = [95,92,97,93,96,91,94,97,92,95,98,91,96,93,97,92,95,98,91,94,96,92,97,93,95,91,96,94,98,92,95]
  const pts = ['0% 0%', '100% 0%', '100% 93%']
  heights.forEach((h, i) => {
    pts.push(`${(100 - (i / (heights.length - 1)) * 100).toFixed(1)}% ${h}%`)
  })
  pts.push('0% 93%')
  return `polygon(${pts.join(', ')})`
})()

const RING_COUNT = 11

// ── 공용 인풋 스타일 ──────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'rgba(140,100,60,0.08)',
  border: '1.5px solid rgba(140,100,60,0.35)',
  borderRadius: 8,
  padding: '4px 8px',
  color: 'var(--ink)',
  outline: 'none',
}

export default function ProjectNotes({ projects, onUpdate }: Props) {
  return (
    <div className="flex-1">
      <div
        style={{
          clipPath: TORN_BOTTOM,
          background: 'var(--paper)',
          border: '2.5px solid #2C1810',
          borderRadius: 12,
          boxShadow: '6px 6px 0 #2C1810',
        }}
        className="relative min-h-[580px] overflow-hidden"
      >
        {/* 나선형 링 */}
        <div className="absolute left-0 top-0 bottom-0 w-[44px] z-10 pointer-events-none"
          style={{ background: 'var(--spine)' }}>
          {Array.from({ length: RING_COUNT }).map((_, i) => (
            <div key={i} className="absolute" style={{
              top: 18 + i * 48, left: 8,
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #6B4C30', background: 'var(--paper)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18)',
            }} />
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="relative z-[5] pr-[5%]"
          style={{ paddingLeft: 84, paddingTop: 22, paddingBottom: 96 }}>

          <div className="text-[21px] font-black tracking-[4px] uppercase mb-1" style={{ color: 'var(--gold)', textShadow: '1px 1px 0 rgba(0,0,0,0.08)' }}>
            MY PROJECTS
          </div>

          <div className="pb-3 mb-4" style={{ borderBottom: '2px solid rgba(140,100,60,0.25)' }}>
            <span className="text-[16px] font-bold" style={{ color: 'var(--muted)' }}>
              {projects.length === 0 ? '프로젝트를 추가해보세요' : `총 ${projects.length}개의 프로젝트`}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="text-[16px] font-bold py-8 text-center" style={{ color: '#B0926A' }}>
              프로젝트 추가 버튼을 눌러 시작해보세요 🌱
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {projects.map(proj => (
                <ProjectSection key={proj.id} project={proj} onUpdate={onUpdate} allProjects={projects} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 프로젝트 섹션 ─────────────────────────────────────────────
function ProjectSection({ project, onUpdate, allProjects }: {
  project: Project
  onUpdate: (projects: Project[]) => void
  allProjects: Project[]
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: project.name,
    startDate: project.startDate,
    endDate: project.endDate,
    teamSize: project.teamSize,
    color: project.color,
  })

  const totalTodos = project.todos.length + project.subProjects.reduce((sum, sp) => sum + sp.todos.length, 0)
  const doneTodos = project.todos.filter(t => t.done).length + project.subProjects.reduce((sum, sp) => sum + sp.todos.filter(t => t.done).length, 0)
  const pct = totalTodos === 0 ? 0 : Math.round(doneTodos / totalTodos * 100)

  const handleToggle = (todoId: string, done: boolean, subProjectId?: string) => {
    db.toggleProjectTodo(project.id, todoId, done, subProjectId)
    onUpdate(db.getProjects())
  }
  const handleDeleteTodo = (todoId: string, subProjectId?: string) => {
    db.deleteProjectTodo(project.id, todoId, subProjectId)
    onUpdate(db.getProjects())
  }
  const handleAddTodo = (text: string, dueDate: string, subProjectId?: string) => {
    db.addProjectTodo(project.id, text, dueDate, subProjectId)
    onUpdate(db.getProjects())
  }
  const handleUpdateTodo = (todoId: string, text: string, dueDate: string, subProjectId?: string) => {
    db.updateProjectTodo(project.id, todoId, text, dueDate, subProjectId)
    onUpdate(db.getProjects())
  }
  const handleAddSubProject = (name: string, startDate?: string, endDate?: string) => {
    db.addSubProject(project.id, name, startDate, endDate)
    onUpdate(db.getProjects())
  }
  const handleDeleteSubProject = (subProjectId: string) => {
    db.deleteSubProject(project.id, subProjectId)
    onUpdate(db.getProjects())
  }
  const handleUpdateSubProject = (subProjectId: string, name: string, startDate?: string, endDate?: string) => {
    db.updateSubProject(project.id, subProjectId, name, startDate, endDate)
    onUpdate(db.getProjects())
  }
  const handleDeleteProject = () => {
    db.deleteProject(project.id)
    onUpdate(db.getProjects())
  }
  const handleSaveProject = () => {
    if (!form.name.trim()) return
    db.updateProject({ ...project, ...form, name: form.name.trim() })
    onUpdate(db.getProjects())
    setEditing(false)
  }

  return (
    <div>
      {/* ── 프로젝트 헤더 ── */}
      {editing ? (
        /* 편집 모드 */
        <div className="mb-3 p-3 rounded-xl flex flex-col gap-2"
          style={{ background: 'rgba(140,100,60,0.07)', border: '1.5px dashed rgba(140,100,60,0.4)' }}>
          {/* 이름 + 컬러 */}
          <div className="flex items-center gap-2">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 text-[16px] font-black"
              style={inputStyle}
              placeholder="프로젝트명"
              onKeyDown={e => e.key === 'Enter' && handleSaveProject()}
            />
            <div className="flex gap-1 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 18, height: 18, borderRadius: 4, background: c, border: 'none', cursor: 'pointer',
                    boxShadow: form.color === c ? `0 0 0 2.5px #2C1810` : '0 0 0 1px rgba(0,0,0,0.2)',
                    transform: form.color === c ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.1s',
                  }} />
              ))}
            </div>
          </div>
          {/* 날짜 + 인원 */}
          <div className="flex items-center gap-2 flex-wrap">
            <DatePicker value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} placeholder="시작일" style={{ width: 150 }} />
            <span className="text-[14px] font-black" style={{ color: 'var(--muted)' }}>~</span>
            <DatePicker value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} placeholder="종료일" style={{ width: 150 }} />
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold" style={{ color: 'var(--muted)' }}>👥</span>
              <input type="number" min={1} max={999} value={form.teamSize}
                onChange={e => setForm(f => ({ ...f, teamSize: Number(e.target.value) }))}
                className="text-[14px] font-bold text-center" style={{ ...inputStyle, width: 60 }} />
              <span className="text-[14px] font-bold" style={{ color: 'var(--muted)' }}>명</span>
            </div>
          </div>
          {/* 저장/취소 */}
          <div className="flex gap-2">
            <button onClick={handleSaveProject}
              className="px-4 py-1 rounded-lg text-[14px] font-black cursor-pointer"
              style={{ background: project.color, border: '2px solid var(--ink)', color: 'var(--paper)', boxShadow: '2px 2px 0 var(--shadow)' }}>
              저장
            </button>
            <button onClick={() => { setEditing(false); setForm({ name: project.name, startDate: project.startDate, endDate: project.endDate, teamSize: project.teamSize, color: project.color }) }}
              className="px-4 py-1 rounded-lg text-[14px] font-black cursor-pointer"
              style={{ background: 'var(--paper)', border: '2px solid rgba(140,100,60,0.4)', color: 'var(--muted)' }}>
              취소
            </button>
          </div>
        </div>
      ) : (
        /* 보기 모드 */
        <div className="flex items-center gap-2 mb-2 group">
          <span style={{
            width: 13, height: 13, borderRadius: 3,
            background: project.color, display: 'inline-block', flexShrink: 0,
            boxShadow: '1px 1px 0 rgba(0,0,0,0.2)',
          }} />
          <span className="text-[22px] font-black" style={{ color: 'var(--ink)' }}>{project.name}</span>
          <span className="text-[12px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(140,100,60,0.12)', color: 'var(--muted)' }}>
            👥 {project.teamSize}명
          </span>
          <span className="text-[12px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(140,100,60,0.12)', color: 'var(--muted)' }}>
            {project.startDate.slice(5).replace('-','/')} ~ {project.endDate.slice(5).replace('-','/')}
          </span>
          {totalTodos > 0 && (
            <span className="text-[12px] font-black px-2 py-0.5 rounded-full"
              style={{ background: pct === 100 ? 'var(--gold)' : 'rgba(140,100,60,0.12)', color: pct === 100 ? 'var(--paper)' : 'var(--muted)' }}>
              {pct}%
            </span>
          )}
          <div className="flex-1" />
          {/* 수정 버튼 */}
          <button onClick={() => setEditing(true)}
            className="text-[15px] cursor-pointer opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            style={{ color: 'var(--muted)', background: 'none', border: 'none' }}>✏️</button>
          <button onClick={handleDeleteProject}
            className="text-[16px] font-black cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
            style={{ color: 'var(--accent)' }}>삭제</button>
        </div>
      )}

      {/* 하위 전체 — 프로젝트 컬러 세로선 */}
      <div className="pl-5 flex flex-col gap-0" style={{
        marginLeft: 5,
        borderLeft: `3px solid ${project.color}`,
      }}>
        {/* 직속 할 일 */}
        <div className="flex flex-col gap-1">
          {project.todos.map(todo => (
            <TodoRow key={todo.id} todo={todo} color={project.color}
              onToggle={done => handleToggle(todo.id, done)}
              onDelete={() => handleDeleteTodo(todo.id)}
              onUpdate={(text, dueDate) => handleUpdateTodo(todo.id, text, dueDate)}
            />
          ))}
          <TodoAddForm onAdd={(text, due) => handleAddTodo(text, due)} color={project.color} />
        </div>

        {/* 서브프로젝트 */}
        {project.subProjects.map(sp => (
          <SubProjectSection key={sp.id} subProject={sp} projectColor={project.color}
            onToggle={(todoId, done) => handleToggle(todoId, done, sp.id)}
            onDelete={todoId => handleDeleteTodo(todoId, sp.id)}
            onAdd={(text, due) => handleAddTodo(text, due, sp.id)}
            onDeleteSubProject={() => handleDeleteSubProject(sp.id)}
            onUpdateSubProject={(name, startDate, endDate) => handleUpdateSubProject(sp.id, name, startDate, endDate)}
            onUpdateTodo={(todoId, text, dueDate) => handleUpdateTodo(todoId, text, dueDate, sp.id)}
          />
        ))}

        <SubProjectAddForm color={project.color} onAdd={handleAddSubProject} />
      </div>
    </div>
  )
}

// ── 서브프로젝트 섹션 ─────────────────────────────────────────
function SubProjectSection({ subProject, projectColor, onToggle, onDelete, onAdd, onDeleteSubProject, onUpdateSubProject, onUpdateTodo }: {
  subProject: SubProject
  projectColor: string
  onToggle: (todoId: string, done: boolean) => void
  onDelete: (todoId: string) => void
  onAdd: (text: string, dueDate: string) => void
  onDeleteSubProject: () => void
  onUpdateSubProject: (name: string, startDate?: string, endDate?: string) => void
  onUpdateTodo: (todoId: string, text: string, dueDate: string) => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(subProject.name)
  const [startVal, setStartVal] = useState(subProject.startDate ?? '')
  const [endVal, setEndVal] = useState(subProject.endDate ?? '')

  const saveName = () => {
    if (nameVal.trim()) {
      onUpdateSubProject(nameVal.trim(), startVal || undefined, endVal || undefined)
      setEditingName(false)
    }
  }

  return (
    <div className="mt-3 flex items-start gap-3 pr-3 py-2" style={{
      background: 'rgba(180,145,100,0.1)',
      border: '1.5px dashed rgba(140,100,60,0.4)',
      borderRadius: 8,
      paddingLeft: 12,
    }}>
      {/* 서브프로젝트 아이콘 — 이름 행 높이에만 정렬 */}
      <div className="flex-shrink-0 flex items-center" style={{ height: 28 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.35 }}>
          <path d="M4 4V12C4 14.2091 5.79086 16 8 16H20M20 16L16 12M20 16L16 20"
            stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* 이름 + 할 일 — 같은 좌측 정렬 */}
      <div className="flex-1 min-w-0">
        {/* 서브프로젝트 이름 */}
        <div className="flex items-end gap-2 mb-1.5 group" style={{ minHeight: 28 }}>
          {editingName ? (
            <>
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <input
                  autoFocus
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameVal(subProject.name) } }}
                  className="text-[16px] font-black w-full"
                  style={inputStyle}
                />
                <div className="flex items-center gap-2">
                  <DatePicker value={startVal} onChange={setStartVal} placeholder="시작일" className="flex-1" />
                  <span className="text-[13px] font-bold flex-shrink-0" style={{ color: 'var(--muted)' }}>~</span>
                  <DatePicker value={endVal} onChange={setEndVal} placeholder="종료일" className="flex-1" />
                </div>
              </div>
              <button onClick={saveName}
                className="text-[13px] font-black px-3 py-1 rounded-lg cursor-pointer flex-shrink-0"
                style={{ background: projectColor, border: '1.5px solid var(--ink)', color: 'var(--paper)', boxShadow: '2px 2px 0 var(--shadow)' }}>저장</button>
              <button onClick={() => { setEditingName(false); setNameVal(subProject.name); setStartVal(subProject.startDate ?? ''); setEndVal(subProject.endDate ?? '') }}
                className="text-[13px] font-black cursor-pointer flex-shrink-0" style={{ color: 'var(--muted)' }}>✕</button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditingName(true)}
                className="text-[16px] font-black text-left cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: projectColor, background: 'none', border: 'none', padding: 0 }}>
                {subProject.name}
              </button>
              {(subProject.startDate || subProject.endDate) && (
                <span className="text-[12px] font-bold" style={{ color: 'var(--muted)' }}>
                  {subProject.startDate?.slice(5).replace('-', '/')} ~ {subProject.endDate?.slice(5).replace('-', '/')}
                </span>
              )}
              <span className="text-[11px] font-bold opacity-40" style={{ color: 'var(--muted)' }}>클릭해서 수정</span>
              <button onClick={onDeleteSubProject}
                className="text-[14px] font-black cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity ml-auto"
                style={{ color: 'var(--accent)' }}>삭제</button>
            </>
          )}
        </div>

        {/* 할 일 */}
        <div className="flex flex-col gap-1">
          {subProject.todos.map(todo => (
            <TodoRow key={todo.id} todo={todo} color={projectColor}
              onToggle={done => onToggle(todo.id, done)}
              onDelete={() => onDelete(todo.id)}
              onUpdate={(text, dueDate) => onUpdateTodo(todo.id, text, dueDate)}
            />
          ))}
          <TodoAddForm onAdd={onAdd} color={projectColor} />
        </div>
      </div>
    </div>
  )
}

// ── Todo 행 ───────────────────────────────────────────────────
function TodoRow({ todo, color, onToggle, onDelete, onUpdate }: {
  todo: ProjectTodo
  color: string
  onToggle: (done: boolean) => void
  onDelete: () => void
  onUpdate: (text: string, dueDate: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [textVal, setTextVal] = useState(todo.text)
  const [dueVal, setDueVal] = useState(todo.dueDate ?? '')

  const isOverdue = !todo.done && todo.dueDate && todo.dueDate < new Date().toISOString().slice(0, 10)

  const saveEdit = () => {
    if (textVal.trim()) { onUpdate(textVal.trim(), dueVal); setEditing(false) }
  }
  const cancelEdit = () => { setEditing(false); setTextVal(todo.text); setDueVal(todo.dueDate ?? '') }

  if (editing) {
    return (
      <div id={`todo-${todo.id}`} className="flex items-center gap-2 py-1">
        <input
          autoFocus
          value={textVal}
          onChange={e => setTextVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
          className="flex-1 text-[15px] font-bold"
          style={inputStyle}
        />
        <DatePicker value={dueVal} onChange={setDueVal} placeholder="마감일" style={{ width: 150 }} />
        <button onClick={saveEdit} className="text-[13px] font-black px-3 py-1 rounded-lg cursor-pointer flex-shrink-0"
          style={{ background: color, border: '1.5px solid var(--ink)', color: 'var(--paper)', boxShadow: '2px 2px 0 var(--shadow)' }}>저장</button>
        <button onClick={cancelEdit} className="text-[15px] font-black cursor-pointer flex-shrink-0"
          style={{ color: 'var(--muted)' }}>✕</button>
      </div>
    )
  }

  return (
    <div
      id={`todo-${todo.id}`}
      className="flex items-center gap-2 py-1 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button onClick={() => onToggle(!todo.done)}
        className="flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
        style={{
          width: 16, height: 16, borderRadius: 4,
          border: `2px solid ${todo.done ? color : 'rgba(140,100,60,0.4)'}`,
          background: todo.done ? color : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {todo.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="var(--paper)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className="flex-1 text-[16px] font-bold leading-snug"
        style={{ color: todo.done ? '#B0926A' : 'var(--ink)', textDecoration: todo.done ? 'line-through' : 'none' }}>
        {todo.text}
        {todo.dueDate && (
          <span className="ml-1.5 text-[11px] font-black align-middle"
            style={{ color: isOverdue ? 'var(--accent)' : '#A08060' }}>
            ~{todo.dueDate.slice(5).replace('-', '/')}
          </span>
        )}
      </span>
      {/* 수정 버튼 */}
      <button onClick={() => setEditing(true)}
        className="text-[14px] cursor-pointer flex-shrink-0 transition-opacity"
        style={{ color: 'var(--muted)', background: 'none', border: 'none', opacity: hovered ? 0.7 : 0 }}>✏️</button>
      <button onClick={onDelete}
        className="text-[19px] font-black cursor-pointer flex-shrink-0 transition-opacity"
        style={{ color: 'var(--accent)', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>×</button>
    </div>
  )
}

// ── 서브프로젝트 추가 폼 ──────────────────────────────────────
function SubProjectAddForm({ color, onAdd }: { color: string; onAdd: (name: string, startDate?: string, endDate?: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }
  const handleSubmit = useCallback(() => {
    if (!name.trim()) { setError('서브 프로젝트명을 입력하세요'); return }
    onAdd(name.trim(), startDate || undefined, endDate || undefined)
    setName(''); setStartDate(''); setEndDate(''); setOpen(false); setError('')
  }, [name, startDate, endDate, onAdd])

  if (!open) return (
    <button onClick={handleOpen}
      className="flex items-center gap-1.5 text-[16px] font-black cursor-pointer mt-3 transition-opacity opacity-50 hover:opacity-100"
      style={{ color: '#5A3E2B' }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, border: '2px dashed rgba(90,62,43,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}>+</span>
      서브 프로젝트 추가
    </button>
  )

  return (
    <div className="mt-3 ml-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-black flex-shrink-0" style={{ color: '#5A3E2B' }}>•</span>
        <input ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setOpen(false); setName('') } }}
          placeholder="서브 프로젝트명" maxLength={40}
          className="flex-1 text-[16px] font-bold" style={inputStyle} />
        <button onClick={handleSubmit}
          className="text-[13px] font-black px-3 py-1 rounded-lg cursor-pointer flex-shrink-0"
          style={{ background: color, border: '1.5px solid var(--ink)', color: 'var(--paper)', boxShadow: '2px 2px 0 var(--shadow)' }}>추가</button>
        <button onClick={() => { setOpen(false); setName(''); setStartDate(''); setEndDate('') }}
          className="text-[15px] font-black cursor-pointer flex-shrink-0" style={{ color: 'var(--muted)' }}>✕</button>
      </div>
      <div className="flex items-center gap-2 ml-6">
        <span className="text-[13px] font-bold flex-shrink-0" style={{ color: 'var(--muted)' }}>기간</span>
        <DatePicker value={startDate} onChange={setStartDate} placeholder="시작일" className="flex-1" />
        <span className="text-[13px] font-bold flex-shrink-0" style={{ color: 'var(--muted)' }}>~</span>
        <DatePicker value={endDate} onChange={setEndDate} placeholder="종료일" className="flex-1" />
      </div>
      {error && <p className="text-[18px] font-bold ml-5" style={{ color: 'var(--accent)' }}>{error}</p>}
    </div>
  )
}

// ── Todo 추가 폼 ──────────────────────────────────────────────
function TodoAddForm({ onAdd, color }: { onAdd: (text: string, dueDate: string) => void; color: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState({ text: '', due: '' })
  const textRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => { setOpen(true); setTimeout(() => textRef.current?.focus(), 50) }
  const handleSubmit = () => {
    const e = { text: '', due: '' }
    if (!text.trim()) e.text = '내용을 입력하세요'
    if (!dueDate) e.due = '기간을 입력하세요'
    setErrors(e)
    if (e.text || e.due) return
    onAdd(text.trim(), dueDate); setText(''); setDueDate(''); setOpen(false)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') { setOpen(false); setText(''); setDueDate('') }
  }

  if (!open) return (
    <button onClick={handleOpen}
      className="flex items-center gap-1.5 text-[16px] font-black cursor-pointer mt-1 transition-opacity opacity-50 hover:opacity-100"
      style={{ color: 'var(--muted)' }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, border: '2px dashed rgba(140,100,60,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, lineHeight: 1 }}>+</span>
      할 일 추가
    </button>
  )

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <div className="flex gap-1.5 items-center">
        <span className="text-[19px] font-black flex-shrink-0" style={{ color: 'var(--muted)' }}>→</span>
        <input ref={textRef} type="text" value={text} onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="할 일 내용" maxLength={100}
          className="flex-1 text-[15px] font-bold todo-text-input" style={{ ...inputStyle, lineHeight: '24px' }} />
        <DatePicker value={dueDate} onChange={setDueDate} placeholder="마감일" style={{ width: 150 }} />
        <button onClick={handleSubmit}
          className="text-[13px] font-black px-3 py-1 rounded-lg cursor-pointer flex-shrink-0"
          style={{ background: color, border: '1.5px solid var(--ink)', color: 'var(--paper)', boxShadow: '2px 2px 0 var(--shadow)' }}>추가</button>
        <button onClick={() => { setOpen(false); setText(''); setDueDate('') }}
          className="text-[15px] font-black cursor-pointer flex-shrink-0" style={{ color: 'var(--muted)' }}>✕</button>
      </div>
      {(errors.text || errors.due) && (
        <p className="text-[18px] font-bold ml-4" style={{ color: 'var(--accent)' }}>{errors.text || errors.due}</p>
      )}
    </div>
  )
}
