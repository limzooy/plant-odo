'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeSelector from '@/components/ThemeSelector'
import MonthlyProjectCalendar from '@/components/MonthlyProjectCalendar'
import * as db from '@/lib/local-db'
import type { Project } from '@/types'

export default function MonthlyPage() {
  const d = new Date()
  const DAYS = ['일','월','화','수','목','금','토']
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects(db.getProjects())
  }, [])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center max-w-[1120px] mx-auto mb-5">
        <div className="flex p-1 gap-1" style={{
          background: 'var(--ink)', border: '2.5px solid #2C1810',
          borderRadius: 999, boxShadow: '4px 4px 0 #8A6C50',
        }}>
          <Link href="/project">
            <button className="px-6 py-2 rounded-full text-sm font-black border-none cursor-pointer"
              style={{ background: 'transparent', color: 'var(--nav-muted)' }}>📋 프로젝트</button>
          </Link>
          <Link href="/monthly">
            <button className="px-6 py-2 rounded-full text-sm font-black border-none cursor-pointer"
              style={{ background: 'var(--paper)', color: 'var(--accent)' }}>📅 월별</button>
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
      <div className="max-w-[1120px] mx-auto">
        <MonthlyProjectCalendar projects={projects} />
      </div>
    </div>
  )
}
