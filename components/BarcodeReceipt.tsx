'use client'

import { useEffect, useRef, RefObject } from 'react'
import { formatDisplayDate } from '@/types'

interface Props {
  date: string
  paperRef: RefObject<HTMLDivElement | null>
}

export default function BarcodeReceipt({ date, paperRef }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const barcodeValue = `TODO-${date.replace(/-/g, '')}-DONE`
    import('jsbarcode').then(({ default: JsBarcode }) => {
      if (svgRef.current) {
        JsBarcode(svgRef.current, barcodeValue, {
          format: 'CODE128',
          width: 1.5,
          height: 48,
          displayValue: false,
          background: 'transparent',
          lineColor: '#7b6200',
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
      <div className="text-center text-[11px] text-[#ccc] tracking-[4px] mb-3.5">
        ✂ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ✂
      </div>
      <div className="flex justify-center mb-4">
        <div
          className="relative"
          style={{
            background: 'rgba(255,222,60,0.72)',
            borderTop: '3px solid rgba(190,160,0,0.38)',
            borderBottom: '3px solid rgba(190,160,0,0.38)',
            padding: '16px 36px',
            transform: 'rotate(-0.9deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '2px 3px 12px rgba(0,0,0,0.12)',
          }}
        >
          {/* Tape left torn edge */}
          <div
            className="absolute left-[-14px] top-[-3px] bottom-[-3px] w-[18px]"
            style={{
              background: 'rgba(255,222,60,0.72)',
              clipPath: 'polygon(100% 0,0 4%,100% 9%,0 13%,100% 18%,0 23%,100% 28%,0 33%,100% 38%,0 43%,100% 48%,0 53%,100% 58%,0 63%,100% 68%,0 73%,100% 78%,0 83%,100% 88%,0 93%,100% 100%)',
            }}
          />
          {/* Tape right torn edge */}
          <div
            className="absolute right-[-14px] top-[-3px] bottom-[-3px] w-[18px]"
            style={{
              background: 'rgba(255,222,60,0.72)',
              clipPath: 'polygon(0 0,100% 4%,0 9%,100% 13%,0 18%,100% 23%,0 28%,100% 33%,0 38%,100% 43%,0 48%,100% 53%,0 58%,100% 63%,0 68%,100% 73%,0 78%,100% 83%,0 88%,100% 93%,0 100%)',
            }}
          />
          <span className="text-[11px] font-black text-[rgba(110,85,0,0.7)] tracking-[2.5px] uppercase">
            ✦ today&apos;s todo ✦
          </span>
          <svg ref={svgRef} style={{ maxWidth: 240 }} />
          <span className="text-[11px] font-black text-[rgba(110,85,0,0.7)] tracking-[1px]">
            {formatDisplayDate(date)}
          </span>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-2xl px-7 py-3 text-[13px] font-black cursor-pointer transition-all duration-300 shadow-[0_5px_18px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(102,126,234,0.5)] flex items-center gap-2"
        >
          📸 이미지로 저장
        </button>
      </div>
    </div>
  )
}
