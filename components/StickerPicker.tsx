'use client'

import { useRef } from 'react'
import { STICKERS } from '@/types'

interface Props {
  activeSticker: string | null
  onSelect: (emoji: string | null) => void
  activeImageUrl: string | null
  onSelectImage: (url: string | null) => void
  uploadedImages: string[]
  onUploadImage: (url: string) => void
}

export default function StickerPicker({
  activeSticker, onSelect,
  activeImageUrl, onSelectImage,
  uploadedImages, onUploadImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      onUploadImage(url)
      onSelectImage(url)
      onSelect(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const isActive = !!activeSticker || !!activeImageUrl

  return (
    <div className="p-5" style={{
      background: 'var(--paper)',
      border: '2.5px solid #2C1810',
      borderRadius: 12,
      boxShadow: '5px 5px 0 #2C1810',
    }}>
      <h3 className="text-[18px] font-black mb-3 uppercase tracking-wider" style={{ color: '#8A7A6A' }}>
        🎨 스티커
      </h3>

      <div className="grid grid-cols-5 gap-1">
        {STICKERS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(activeSticker === emoji ? null : emoji); onSelectImage(null) }}
            className="text-[26px] text-center py-1 px-0.5 cursor-pointer transition-all duration-150 leading-none"
            style={{
              borderRadius: 8,
              border: activeSticker === emoji ? '2px solid #C84B31' : '2px solid transparent',
              background: activeSticker === emoji ? '#FFF0E8' : 'transparent',
              transform: activeSticker === emoji ? 'scale(1.1)' : '',
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 이미지 업로드 */}
      <div className="mt-3 pt-3" style={{ borderTop: '2px dashed #D4C4A0' }}>
        <div className="flex items-center mb-2">
          <span className="text-[18px] font-black uppercase tracking-wider" style={{ color: '#8A7A6A' }}>
            📷 내 사진
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            className="ml-auto text-[18px] font-black text-white cursor-pointer transition-all duration-150"
            style={{
              background: '#4F7942',
              border: '2px solid #2C1810',
              borderRadius: 999,
              padding: '3px 12px',
              boxShadow: '2px 2px 0 #2C1810',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translate(2px,2px)'; el.style.boxShadow='0 0 0 #2C1810' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='2px 2px 0 #2C1810' }}
          >
            + 추가
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {uploadedImages.length === 0
          ? <p className="text-[18px] text-center py-2 font-bold" style={{ color: '#C8B8A8' }}>사진을 추가해보세요!</p>
          : (
            <div className="grid grid-cols-4 gap-1.5">
              {uploadedImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { onSelectImage(activeImageUrl === url ? null : url); onSelect(null) }}
                  className="overflow-hidden cursor-pointer transition-all duration-150"
                  style={{
                    aspectRatio: '1',
                    borderRadius: 6,
                    border: activeImageUrl === url ? '2.5px solid #C84B31' : '2px solid #8A7A6A',
                    boxShadow: activeImageUrl === url ? '2px 2px 0 #2C1810' : '1px 1px 0 #8A7A6A',
                    transform: activeImageUrl === url ? 'scale(1.05)' : '',
                  }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
      </div>

      <p className="text-[18px] text-center mt-3 font-bold leading-snug" style={{ color: '#B0A090' }}>
        {isActive ? '종이를 탭해서 붙여요! 다시 탭하면 해제 ✨' : '스티커 선택 후 종이에 터치해서 붙여요!'}
      </p>
    </div>
  )
}
