'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import * as db from '@/lib/local-db'
import type { Project } from '@/types'
import ProjectAddModal from '@/components/ProjectAddModal'
import ProjectCalendar from '@/components/ProjectCalendar'
import ProjectNotes from '@/components/ProjectNotes'
import ThemeSelector from '@/components/ThemeSelector'

// ── 헬퍼: TopBar ──────────────────────────────────────────────
function TopBar() {
  const d = new Date()
  const DAYS = ['일','월','화','수','목','금','토']
  return (
    <div className="flex justify-between items-center max-w-[1120px] mx-auto mb-5">
      <div className="flex p-1 gap-1" style={{
        background: 'var(--ink)', border: '2.5px solid #2C1810',
        borderRadius: 999, boxShadow: '4px 4px 0 #8A6C50',
      }}>
        <Link href="/project">
          <button className="px-6 py-2 rounded-full text-sm font-black transition-all border-none cursor-pointer"
            style={{ background: 'var(--paper)', color: 'var(--accent)' }}>
            📋 프로젝트
          </button>
        </Link>
        <Link href="/monthly">
          <button className="px-6 py-2 rounded-full text-sm font-black transition-all border-none cursor-pointer"
            style={{ background: 'transparent', color: 'var(--nav-muted)' }}>
            📅 월별
          </button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSelector />
        <div className="px-5 py-2 text-[16px] font-black" style={{
          background: 'var(--paper)', border: '2.5px solid #2C1810',
          borderRadius: 12, boxShadow: '4px 4px 0 #2C1810', color: 'var(--ink)',
        }}>
          {d.getMonth()+1}월 {d.getDate()}일 {DAYS[d.getDay()]}요일
        </div>
      </div>
    </div>
  )
}

// ── 헬퍼: 사이드바 (진행률 + 마감 임박) ──────────────────────
function ProjectSidebar({ projects }: { projects: Project[] }) {
  // 진행률 계산
  const totalTodos = projects.reduce((sum, p) =>
    sum + p.todos.length + p.subProjects.reduce((s, sp) => s + sp.todos.length, 0), 0)
  const doneTodos = projects.reduce((sum, p) =>
    sum + p.todos.filter(t => t.done).length +
    p.subProjects.reduce((s, sp) => s + sp.todos.filter(t => t.done).length, 0), 0)
  const overallPct = totalTodos === 0 ? 0 : Math.round(doneTodos / totalTodos * 100)

  // 마감 임박
  const today = new Date().toISOString().slice(0, 10)
  const soon = new Date()
  soon.setDate(soon.getDate() + 3)
  const soonStr = soon.toISOString().slice(0, 10)

  const upcoming = projects.flatMap(p => [
    ...p.todos.filter(t => !t.done && t.dueDate && t.dueDate <= soonStr)
      .map(t => ({ ...t, projectName: p.name, color: p.color })),
    ...p.subProjects.flatMap(sp =>
      sp.todos.filter(t => !t.done && t.dueDate && t.dueDate <= soonStr)
        .map(t => ({ ...t, projectName: `${p.name} / ${sp.name}`, color: p.color }))
    ),
  ]).sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))

  return (
    <div className="flex flex-col gap-3">
      {/* 통합 진행률 — 작게 */}
      <div style={{
        background: 'var(--paper)',
        border: '2.5px solid #2C1810',
        borderRadius: 10,
        boxShadow: '3px 3px 0 #2C1810',
        padding: '10px 14px',
      }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[13px] font-black tracking-[1.5px]" style={{ color: 'var(--gold)' }}>
            OVERALL
          </span>
          <span className="text-[13px] font-black ml-auto" style={{ color: overallPct === 100 ? 'var(--gold)' : 'var(--accent)' }}>
            {overallPct}%
          </span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--muted)' }}>
            {doneTodos}/{totalTodos}
          </span>
        </div>
        <div style={{ height: 5, background: 'rgba(140,100,60,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            width: `${overallPct}%`, height: '100%',
            background: overallPct === 100 ? 'var(--gold)' : 'var(--accent)',
            borderRadius: 4, transition: 'width 0.4s ease',
          }} />
        </div>
        {/* 개별 프로젝트 */}
        <div className="flex flex-col gap-1.5">
          {projects.map(p => {
            const ptotal = p.todos.length + p.subProjects.reduce((s, sp) => s + sp.todos.length, 0)
            const pdone  = p.todos.filter(t => t.done).length +
              p.subProjects.reduce((s, sp) => s + sp.todos.filter(t => t.done).length, 0)
            const ppct   = ptotal === 0 ? 0 : Math.round(pdone / ptotal * 100)
            return (
              <div key={p.id}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span style={{ width: 7, height: 7, borderRadius: 1.5, background: p.color, flexShrink: 0 }} />
                  <span className="flex-1 text-[13px] font-bold truncate" style={{ color: 'var(--ink)' }}>
                    {p.name}
                  </span>
                  <span className="text-[13px] font-black flex-shrink-0"
                    style={{ color: ppct === 100 ? 'var(--gold)' : 'var(--muted)' }}>
                    {ppct}%
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(140,100,60,0.12)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${ppct}%`, height: '100%',
                    background: ppct === 100 ? 'var(--gold)' : p.color,
                    borderRadius: 3, transition: 'width 0.4s ease', opacity: 0.8,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 마감 임박 — 영수증 스타일 */}
      {upcoming.length > 0 && (
        <div style={{ position: 'relative' }}>
          {/* 상단 톱니 */}
          <div style={{
            height: 10,
            background: 'radial-gradient(circle at 50% 0%, #E8D5B0 10px, #F5EAD5 10px)',
            backgroundSize: '16px 10px',
            backgroundRepeat: 'repeat-x',
          }} />

          {/* 영수증 본체 */}
          <div style={{
            background: '#F5EAD5',
            boxShadow: '0 2px 8px rgba(44,24,16,0.18)',
            padding: '12px 14px 10px',
          }}>
            {/* 헤더 */}
            <div className="text-center mb-2 pb-2"
              style={{ borderBottom: '1.5px dashed rgba(140,100,60,0.45)' }}>
              <div className="text-[16px] font-black tracking-[3px]" style={{ color: 'var(--accent)' }}>
                ⏰ DEADLINE ALERT
              </div>
              <div className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--muted)' }}>
                {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 기준
              </div>
            </div>

            {/* 항목들 */}
            <div className="flex flex-col">
              {upcoming.slice(0, 5).map((t, i) => (
                <div key={t.id}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(`todo-${t.id}`)
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      el?.animate(
                        [{ background: 'rgba(200,75,49,0.15)' }, { background: 'transparent' }],
                        { duration: 1200, easing: 'ease-out' }
                      )
                    }}
                    className="w-full text-left py-2 cursor-pointer transition-opacity hover:opacity-70"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                        <span className="text-[13px] font-bold truncate" style={{ color: 'var(--ink)' }}>
                          {t.text}
                        </span>
                      </div>
                      <span className="text-[12px] font-black flex-shrink-0"
                        style={{ color: t.dueDate! < today ? 'var(--accent)' : 'var(--muted)' }}>
                        {t.dueDate! < today ? '⚠️ 초과' : `~${t.dueDate!.slice(5).replace('-', '/')}`}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold mt-0.5" style={{ color: '#A08060' }}>
                      {t.projectName}
                    </div>
                  </button>
                  {i < upcoming.slice(0, 5).length - 1 && (
                    <div style={{ borderTop: '1px dashed rgba(140,100,60,0.3)', margin: '0 4px' }} />
                  )}
                </div>
              ))}
            </div>

            {/* 바닥 합계줄 */}
            <div className="flex justify-between items-center pt-2 mt-1"
              style={{ borderTop: '1.5px dashed rgba(140,100,60,0.45)' }}>
              <span className="text-[11px] font-black tracking-[1px]" style={{ color: 'var(--muted)' }}>TOTAL</span>
              <span className="text-[13px] font-black" style={{ color: 'var(--accent)' }}>
                {upcoming.length}건
              </span>
            </div>
          </div>

          {/* 하단 톱니 */}
          <div style={{
            height: 10,
            background: 'radial-gradient(circle at 50% 100%, #E8D5B0 10px, #F5EAD5 10px)',
            backgroundSize: '16px 10px',
            backgroundRepeat: 'repeat-x',
          }} />
        </div>
      )}
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setProjects(db.getProjects())
  }, [])

  const handleAddProject = useCallback((proj: Omit<Project, 'id' | 'created_at'>) => {
    const added = db.addProject(proj)
    setProjects(prev => [...prev, added])
  }, [])

  const handleUpdateProjects = useCallback((updated: Project[]) => {
    setProjects(updated)
  }, [])

  return (
    <div className="p-4">
      <TopBar />
      <div className="max-w-[1120px] mx-auto">

        {/* 프로젝트 타임라인 캘린더 */}
        <div className="mb-5">
          <ProjectCalendar projects={projects} />
        </div>

        {/* 프로젝트 노트 + 사이드바 */}
        <div className="flex gap-5 items-start flex-col md:flex-row">
          <ProjectNotes projects={projects} onUpdate={handleUpdateProjects} />
          <div className="w-full md:w-[268px] flex-shrink-0 flex flex-col gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[15px] font-black cursor-pointer transition-all"
              style={{
                background: 'var(--accent)',
                border: '2.5px solid #2C1810',
                color: 'var(--paper)',
                boxShadow: '4px 4px 0 #2C1810',
              }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translate(2px,2px)'; el.style.boxShadow = '2px 2px 0 #2C1810' }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = '4px 4px 0 #2C1810' }}
            >
              ＋ 프로젝트 추가
            </button>
            <ProjectSidebar projects={projects} />
          </div>
        </div>
      </div>

      {showModal && (
        <ProjectAddModal
          onAdd={handleAddProject}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
