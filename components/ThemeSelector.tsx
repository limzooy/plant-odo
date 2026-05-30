'use client'

import { useTheme, ThemeId } from './ThemeProvider'

const THEMES: { id: ThemeId; color: string; label: string }[] = [
  { id: 'vintage', color: '#C84B31', label: '빈티지' },
  { id: 'black',   color: '#1a1a1a', label: '블랙'   },
  { id: 'white',   color: '#e8e8e8', label: '화이트' },
]

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-4" style={{
      padding: '8px 20px',
      borderRadius: 999,
      background: 'var(--paper)',
      border: '2.5px solid #2C1810',
      boxShadow: '4px 4px 0 #2C1810',
    }}>
      {THEMES.map(t => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => setTheme(t.id)}
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            cursor: 'pointer',
            background: t.color,
            border: theme === t.id ? '2px solid var(--ink)' : '1.5px solid rgba(0,0,0,0.15)',
            outline: theme === t.id ? '2px solid var(--paper)' : 'none',
            outlineOffset: -4,
            transform: theme === t.id ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.15s ease, outline 0.15s ease',
          }}
        />
      ))}
    </div>
  )
}
