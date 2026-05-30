'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeId = 'vintage' | 'black' | 'white'

interface ThemeVars {
  paper: string; ink: string; accent: string; muted: string; gold: string
  spine: string; spineRing: string; spineHole: string
  navBg: string; navMuted: string; shadow: string
  pageBg: string; pagePattern: string
}

export const THEMES: Record<ThemeId, ThemeVars> = {
  vintage: {
    paper:      '#FFFDF0',
    ink:        '#2C1810',
    accent:     '#C84B31',
    muted:      '#8A6C50',
    gold:       '#C49A1A',
    spine:      '#A0856A',
    spineRing:  '#6B4C30',
    spineHole:  '#FFFDF0',
    navBg:      '#2C1810',
    navMuted:   '#D4C4A0',
    shadow:     '#2C1810',
    pageBg:     '#E8D5B0',
    pagePattern:'repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(0,0,0,0.025) 5px,rgba(0,0,0,0.025) 10px),repeating-linear-gradient(-45deg,transparent,transparent 5px,rgba(0,0,0,0.025) 5px,rgba(0,0,0,0.025) 10px)',
  },
  black: {
    paper:      '#1e1e1e',
    ink:        '#e0d4c8',
    accent:     '#e0634a',
    muted:      '#888888',
    gold:       '#c9a84c',
    spine:      '#2e2e2e',
    spineRing:  '#444444',
    spineHole:  '#1e1e1e',
    navBg:      '#000000',
    navMuted:   '#666666',
    shadow:     '#000000',
    pageBg:     '#111111',
    pagePattern:'none',
  },
  white: {
    paper:      '#ffffff',
    ink:        '#1a1a1a',
    accent:     '#c84b31',
    muted:      '#777777',
    gold:       '#b8960a',
    spine:      '#e0e0e0',
    spineRing:  '#cccccc',
    spineHole:  '#ffffff',
    navBg:      '#1a1a1a',
    navMuted:   '#999999',
    shadow:     '#aaaaaa',
    pageBg:     '#f0f0f0',
    pagePattern:'none',
  },
}

function applyTheme(id: ThemeId) {
  const t = THEMES[id]
  const r = document.documentElement
  r.style.setProperty('--paper',      t.paper)
  r.style.setProperty('--ink',        t.ink)
  r.style.setProperty('--accent',     t.accent)
  r.style.setProperty('--muted',      t.muted)
  r.style.setProperty('--gold',       t.gold)
  r.style.setProperty('--spine',      t.spine)
  r.style.setProperty('--spine-ring', t.spineRing)
  r.style.setProperty('--spine-hole', t.spineHole)
  r.style.setProperty('--nav-bg',     t.navBg)
  r.style.setProperty('--nav-muted',  t.navMuted)
  r.style.setProperty('--shadow',     t.shadow)
  r.style.setProperty('--page-bg',    t.pageBg)
  r.style.setProperty('--page-pattern', t.pagePattern)
  localStorage.setItem('plant-theme', id)
}

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void }>({
  theme: 'vintage', setTheme: () => {},
})

export function useTheme() { return useContext(ThemeContext) }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('vintage')

  useEffect(() => {
    const saved = (localStorage.getItem('plant-theme') as ThemeId) ?? 'vintage'
    applyTheme(saved)
    setThemeState(saved)
  }, [])

  const setTheme = (id: ThemeId) => { applyTheme(id); setThemeState(id) }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
