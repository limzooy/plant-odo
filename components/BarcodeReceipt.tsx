'use client'

import { useEffect, useRef, RefObject } from 'react'

interface Props {
  date: string
  paperRef: RefObject<HTMLDivElement | null>
}

// 내추럴 어스 톤 — 테라코타·세이지·더스티로즈·크림
const TAPE_COLORS = [
  'rgba(200, 128, 108, 0.90)', // 테라코타
  'rgba(128, 168, 142, 0.90)', // 세이지 그린
  'rgba(184, 152, 128, 0.90)', // 더스티 로즈
  'rgba(218, 198, 155, 0.90)', // 크림 베이지
]

// 구겨진 효과 없음 — 직물 질감만
const TAPE_BG = [
  'linear-gradient(180deg, rgba(0,0,0,0.07) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.07) 100%)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
].join(',')

// 뭉뚝한 찢김 — 진폭 좁히고(3~9%) 포인트 수 줄임
const TAPE_CLIP = `polygon(${[
  // 왼쪽 가장자리 (위 → 아래)
  '6% 0%',
  '3% 7%',  '9% 14%', '4% 22%', '9% 30%',
  '4% 39%', '9% 47%', '4% 55%', '9% 63%',
  '4% 71%', '9% 79%', '4% 87%', '8% 94%',
  '5% 100%',
  // 하단 직선
  '95% 100%',
  // 오른쪽 가장자리 (아래 → 위)
  '92% 94%', '96% 87%', '91% 79%',
  '96% 71%', '91% 63%', '96% 55%',
  '91% 47%', '96% 39%', '91% 30%',
  '96% 22%', '91% 14%', '97% 7%', '94% 0%',
].join(',')})`

function getTapeColor(date: string): string {
  const sum = date.replace(/-/g, '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return TAPE_COLORS[sum % TAPE_COLORS.length]
}

export default function BarcodeReceipt({ date, paperRef }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tapeColor = getTapeColor(date)

  useEffect(() => {
    const val = `TODO-${date.replace(/-/g, '')}`
    import('jsbarcode').then(({ default: JsBarcode }) => {
      if (svgRef.current) {
        JsBarcode(svgRef.current, val, {
          format: 'CODE128',
          width: 1.8,
          height: 52,
          displayValue: false,
          background: 'transparent',
          lineColor: 'rgba(44,24,16,0.75)',
        })
      }
    })
  }, [date])

  const handleDownload = async () => {
    if (!paperRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(paperRef.current, { scale: 2, useCORS: true, logging: false } as any)
    const a = document.createElement('a')
    a.download = `todo-${date}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="mt-6 animate-[fadeUp_0.5s_ease]">
      <div className="flex justify-center mb-5">
        {/* drop-shadow는 clip-path 밖에서 — 찢긴 모양 따라 그림자 적용 */}
        <div style={{ transform: 'rotate(-1.6deg)', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.22))' }}>
          <div style={{
            background: tapeColor,
            backgroundImage: TAPE_BG,
            padding: '16px 56px',
            clipPath: TAPE_CLIP,
          }}>
            <svg ref={svgRef} style={{ maxWidth: 220, display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="text-white border-none px-7 py-3 text-[16px] font-black cursor-pointer transition-all duration-150 flex items-center gap-2"
          style={{
            background: 'var(--accent)',
            borderRadius: 8,
            border: '2.5px solid #2C1810',
            boxShadow: '3px 3px 0 #2C1810',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translate(2px,2px)'; el.style.boxShadow='1px 1px 0 #2C1810' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='3px 3px 0 #2C1810' }}
        >
          📸 이미지로 저장
        </button>
      </div>
    </div>
  )
}
