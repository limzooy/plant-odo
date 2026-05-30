'use client'

import { useState } from 'react'
import type { PlantType } from '@/types'
import { PLANT_DATA } from '@/types'

interface Props {
  onConfirm: (type: PlantType, imageUrl?: string) => void
}

const PLANT_ICONS: { type: string; icon: string }[] = [
  { type: 'cactus',    icon: '🌵' },
  { type: 'sunflower', icon: '🌻' },
  { type: 'rose',      icon: '🌹' },
  { type: 'tulip',     icon: '🌷' },
  { type: 'cherry',    icon: '🌸' },
  { type: 'clover',    icon: '🍀' },
]

export default function PlantSelect({ onConfirm }: Props) {
  const [selected, setSelected] = useState<PlantType | null>(null)
  const [query, setQuery] = useState('')
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null | undefined>(undefined)
  const [isFetching, setIsFetching] = useState(false)

  const trimmed = query.trim()

  const filtered = trimmed === ''
    ? PLANT_ICONS
    : PLANT_ICONS.filter(({ type }) => {
        const name = PLANT_DATA[type].name
        return name.includes(trimmed) || type.toLowerCase().includes(trimmed.toLowerCase())
      })

  const showCustom = trimmed.length > 0 && filtered.length === 0
  const isCustomSelected = selected !== null && !PLANT_ICONS.some(p => p.type === selected)

  const handleQuery = (v: string) => {
    setQuery(v)
    setSelected(null)
    setFetchedImageUrl(undefined)
  }

  const handleSelectBuiltin = (type: string) => {
    setSelected(type)
    setFetchedImageUrl(undefined)
  }

  const handleSelectCustom = async (name: string) => {
    setSelected(name)
    setFetchedImageUrl(undefined)
    setIsFetching(true)
    try {
      const res = await fetch(`/api/plant-image?q=${encodeURIComponent(name)}`)
      const { imageUrl } = await res.json()
      setFetchedImageUrl(imageUrl ?? null)
    } catch {
      setFetchedImageUrl(null)
    } finally {
      setIsFetching(false)
    }
  }

  const handleConfirm = () => {
    if (!selected) return
    if (isCustomSelected) {
      onConfirm(selected, fetchedImageUrl ?? undefined)
    } else {
      onConfirm(selected)
    }
  }

  const cardStyle = (type: string) => ({
    background: selected === type ? '#FFF0E8' : '#F5EDD8',
    border: selected === type ? '2.5px solid #C84B31' : '2.5px solid #8A7A6A',
    borderRadius: 12,
    boxShadow: selected === type ? '4px 4px 0 #C84B31' : '3px 3px 0 #8A7A6A',
    transform: selected === type ? 'translate(-1px,-1px)' : '',
  })

  const isReady = !!selected && !isFetching

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="p-10 text-center max-w-[540px] w-full" style={{
        background: 'var(--paper)',
        border: '2.5px solid #2C1810',
        borderRadius: 16,
        boxShadow: '8px 8px 0 #2C1810',
      }}>
        <h2 className="text-[24px] font-black mb-2" style={{ color: 'var(--ink)' }}>
          🌿 오늘의 화분을 골라요!
        </h2>
        <p className="text-[16px] mb-6 leading-relaxed" style={{ color: '#8A7A6A' }}>
          하루에 하나의 화분을 선택할 수 있어요.<br />
          투두리스트를 완성할수록 화분이 무럭무럭 자랍니다!
        </p>

        {/* 검색 입력 */}
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => handleQuery(e.target.value)}
            placeholder="식물 이름 검색 또는 직접 입력..."
            className="w-full pl-9 pr-4 py-2.5 text-[18px] font-bold outline-none"
            style={{
              background: '#F5EDD8',
              border: '2px solid #8A7A6A',
              borderRadius: 999,
              color: 'var(--ink)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#8A7A6A' }}
          />
        </div>

        {/* 기존 식물 목록 */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {filtered.map(({ type, icon }) => (
              <button
                key={type}
                onClick={() => handleSelectBuiltin(type)}
                className="p-5 cursor-pointer transition-all duration-150"
                style={cardStyle(type)}
              >
                <span className="text-5xl block mb-2 leading-none">{icon}</span>
                <span className="text-[16px] font-black" style={{ color: 'var(--ink)' }}>
                  {PLANT_DATA[type].name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 커스텀 식물 직접 추가 */}
        {showCustom && (
          <div className="mb-6">
            <p className="text-[19px] mb-3" style={{ color: '#8A7A6A' }}>
              목록에 없는 식물이에요. 직접 추가해볼까요?
            </p>
            <button
              onClick={() => handleSelectCustom(trimmed)}
              className="w-full p-4 cursor-pointer transition-all duration-150"
              style={cardStyle(trimmed)}
            >
              {/* 이미지 미리보기 or 로딩 or 기본 이모지 */}
              {isCustomSelected && isFetching && (
                <span className="text-3xl block mb-1 leading-none animate-spin">🌀</span>
              )}
              {isCustomSelected && !isFetching && fetchedImageUrl && (
                <img
                  src={fetchedImageUrl}
                  alt={trimmed}
                  className="mx-auto mb-1 rounded-full object-cover"
                  style={{ width: 52, height: 52, border: '2px solid #2C1810' }}
                />
              )}
              {(!isCustomSelected || (!isFetching && !fetchedImageUrl)) && (
                <span className="text-4xl block mb-1 leading-none">🌿</span>
              )}
              <span className="text-[18px] font-black" style={{ color: 'var(--ink)' }}>
                {isCustomSelected && isFetching
                  ? '이미지 찾는 중...'
                  : isCustomSelected && fetchedImageUrl
                  ? `"${trimmed}" 이미지 찾았어요!`
                  : `"${trimmed}" 직접 추가`}
              </span>
            </button>
          </div>
        )}

        <button
          disabled={!isReady}
          onClick={handleConfirm}
          className="text-white border-none py-4 px-12 text-base font-black cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            borderRadius: 999,
            border: '2.5px solid #2C1810',
            boxShadow: '4px 4px 0 #2C1810',
          }}
          onMouseEnter={e => { if (!isReady) return; const el = e.currentTarget as HTMLElement; el.style.transform='translate(2px,2px)'; el.style.boxShadow='2px 2px 0 #2C1810' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='4px 4px 0 #2C1810' }}
        >
          {isFetching ? '이미지 찾는 중...' : '화분 선택 완료!'}
        </button>
      </div>
    </div>
  )
}
