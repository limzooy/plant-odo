'use client'

import type { PlantType } from '@/types'

interface Props {
  pct: number
  plantType: PlantType | null
  done: number
  total: number
  imageUrl?: string
}

type ColorSet = { petal: string; petal2: string; center: string; stem: string; leaf: string; bar: string }

const COLORS: Partial<Record<string, ColorSet>> = {
  sunflower: { petal: '#FDD835', petal2: '#F57F17', center: '#4E342E', stem: '#388E3C', leaf: '#2E7D32', bar: '#FDD835' },
  rose:      { petal: '#E53935', petal2: '#FF8A80', center: '#880E4F', stem: '#388E3C', leaf: '#2E7D32', bar: '#E53935' },
  tulip:     { petal: '#EC407A', petal2: '#FCE4EC', center: '#880E4F', stem: '#388E3C', leaf: '#388E3C', bar: '#EC407A' },
  cherry:    { petal: '#F8BBD0', petal2: '#FF80AB', center: '#FF4081', stem: '#795548', leaf: '#4CAF50', bar: '#F48FB1' },
  cactus:    { petal: '#FF8F00', petal2: '#FFD54F', center: '#E65100', stem: '#2E7D32', leaf: '#388E3C', bar: '#66BB6A' },
  clover:    { petal: '#2E7D32', petal2: '#A5D6A7', center: '#1B5E20', stem: '#388E3C', leaf: '#4CAF50', bar: '#43A047' },
}

const DEFAULT_COLORS: ColorSet = { petal: '#81C784', petal2: '#C8E6C9', center: '#2E7D32', stem: '#388E3C', leaf: '#2E7D32', bar: '#66BB6A' }

const NAMES: Partial<Record<string, string>> = {
  sunflower: '해바라기', rose: '장미', tulip: '튤립',
  cherry: '벚꽃', cactus: '선인장', clover: '클로버',
}

function PhotoGrowth({ imageUrl, pct }: { imageUrl: string; pct: number }) {
  const isBloom = pct === 100
  // 화분 위에서 사진이 자라는 크기 (0% → 4px, 100% → 72px)
  const size = Math.max(4, Math.round(pct * 0.72))
  // 화분 안에서 싹이 나오는 느낌 - 아래에서 클립
  const clipTop = Math.max(0, Math.round(100 - pct * 1.6))

  return (
    <div style={{ position: 'relative', width: 92, height: 147, flexShrink: 0 }}>
      {/* 화분 SVG */}
      <svg viewBox="0 0 100 160" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon points="30,156 70,156 75,139 25,139" fill="#8D6E63" />
        <rect x="22" y="133" width="56" height="10" rx="4" fill="#795548" />
        <ellipse cx="50" cy="133" rx="26" ry="5" fill="#5D4037" />
        <ellipse cx="50" cy="134" rx="22" ry="3.5" fill="#3E2723" />
      </svg>

      {/* 씨앗 단계 */}
      {pct === 0 && (
        <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', fontSize: 18 }}>🌱</div>
      )}

      {/* 사진이 화분 위에서 성장 */}
      {pct > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 27,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            border: size > 20 ? '2px solid #2C1810' : 'none',
            boxShadow: isBloom ? '0 0 14px 4px gold' : undefined,
            clipPath: `inset(${clipTop}% 0 0 0)`,
            transition: 'width 0.7s ease, height 0.7s ease, clip-path 0.7s ease',
          }}
        >
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* 만개 반짝임 */}
      {isBloom && (
        <>
          <span style={{ position: 'absolute', left: 4, top: 14, fontSize: 16 }}>✨</span>
          <span style={{ position: 'absolute', right: 4, top: 10, fontSize: 11 }}>⭐</span>
          <span style={{ position: 'absolute', right: 1, top: 34, fontSize: 9 }}>✨</span>
        </>
      )}
    </div>
  )
}

function FlowerSVG({ plantType, pct }: { plantType: PlantType; pct: number }) {
  const c = COLORS[plantType] ?? DEFAULT_COLORS
  const isBloom = pct === 100
  const stemH = Math.min(pct / 100, 1) * 82
  const potTopY = 126
  const stemTopY = potTopY - stemH

  const showLeaves  = pct >= 20
  const showLeaves2 = pct >= 40
  const showBud     = pct >= 55 && pct < 75
  const showFlower  = pct >= 75

  const renderPetals = (cx: number, cy: number) => {
    if (plantType === 'sunflower') return (
      <g transform={`translate(${cx},${cy})`}>
        {[0,45,90,135,180,225,270,315].map(a => (
          <ellipse key={a} cx={0} cy={-13} rx={5} ry={11} fill={c.petal} transform={`rotate(${a})`} />
        ))}
        <circle cx={0} cy={0} r={8} fill={c.center} />
        <circle cx={0} cy={0} r={4} fill={c.petal2} opacity={0.5} />
      </g>
    )
    if (plantType === 'rose') return (
      <g transform={`translate(${cx},${cy})`}>
        {[0,60,120,180,240,300].map(a => (
          <ellipse key={a} cx={0} cy={-9} rx={7} ry={10} fill={c.petal} transform={`rotate(${a})`} opacity={0.88} />
        ))}
        {[0,90,180,270].map(a => (
          <ellipse key={a} cx={0} cy={-5} rx={4} ry={6} fill={c.petal2} transform={`rotate(${a})`} opacity={0.7} />
        ))}
        <circle cx={0} cy={0} r={4} fill={c.center} />
      </g>
    )
    if (plantType === 'tulip') return (
      <g transform={`translate(${cx},${cy})`}>
        <path d="M0,-22 C-13,-20 -15,-7 -11,2 C-7,9 7,9 11,2 C15,-7 13,-20 0,-22Z" fill={c.petal} />
        <path d="M0,-22 C3,-18 4,-10 2,-3 L0,2 L-2,-3 C-4,-10 -3,-18 0,-22Z" fill={c.petal2} opacity={0.45} />
      </g>
    )
    if (plantType === 'cherry') {
      const clusters = [{ dx: -13, dy: 2 }, { dx: 0, dy: -5 }, { dx: 13, dy: 2 }]
      return (
        <g transform={`translate(${cx},${cy})`}>
          {clusters.map(({ dx, dy }, i) => (
            <g key={i} transform={`translate(${dx},${dy})`}>
              {[0,72,144,216,288].map(a => (
                <ellipse key={a} cx={0} cy={-6} rx={3.5} ry={6} fill={c.petal} transform={`rotate(${a})`} />
              ))}
              <circle cx={0} cy={0} r={2.5} fill={c.center} />
            </g>
          ))}
        </g>
      )
    }
    if (plantType === 'clover') return (
      <g transform={`translate(${cx},${cy})`}>
        <circle cx={0} cy={-10} r={9} fill={c.petal} />
        <circle cx={10} cy={0}  r={9} fill={c.petal} />
        <circle cx={0} cy={10}  r={9} fill={c.petal} />
        <circle cx={-10} cy={0} r={9} fill={c.petal} />
        <circle cx={0} cy={0}   r={5} fill={c.petal2} />
      </g>
    )
    // cactus top flower
    return (
      <g transform={`translate(${cx},${cy})`}>
        {[0,60,120,180,240,300].map(a => (
          <ellipse key={a} cx={0} cy={-6} rx={3} ry={7} fill={c.petal} transform={`rotate(${a})`} />
        ))}
        <circle cx={0} cy={0} r={3.5} fill={c.petal2} />
      </g>
    )
  }

  if (plantType === 'cactus') {
    const cH = stemH
    const cTopY = potTopY - cH
    return (
      <svg viewBox="0 0 100 160" style={{ width: 92, height: 147 }}>
        <polygon points="30,156 70,156 75,139 25,139" fill="#8D6E63" />
        <rect x="22" y="133" width="56" height="10" rx="4" fill="#795548" />
        <ellipse cx="50" cy="133" rx="26" ry="5" fill="#5D4037" />
        <ellipse cx="50" cy="134" rx="22" ry="3.5" fill="#3E2723" />
        {pct > 0 && <rect x="43" y={cTopY} width="14" height={cH} rx="7" fill={c.stem} />}
        {pct >= 45 && <>
          <rect x="27" y={cTopY + cH*0.33} width="18" height={cH*0.3} rx="6" fill={c.stem} />
          <rect x="27" y={cTopY + cH*0.19} width="5" height={cH*0.17} rx="3" fill={c.stem} />
        </>}
        {pct >= 62 && <>
          <rect x="55" y={cTopY + cH*0.5} width="18" height={cH*0.25} rx="6" fill={c.stem} />
          <rect x="68" y={cTopY + cH*0.36} width="5" height={cH*0.17} rx="3" fill={c.stem} />
        </>}
        {pct > 0 && [0.28,0.52,0.76].map(r => (
          <g key={r}>
            <line x1="43" y1={cTopY+cH*r} x2="36" y2={cTopY+cH*r-5} stroke="white" strokeWidth="1" opacity="0.55" />
            <line x1="57" y1={cTopY+cH*r} x2="64" y2={cTopY+cH*r-5} stroke="white" strokeWidth="1" opacity="0.55" />
          </g>
        ))}
        {showFlower && renderPetals(50, cTopY)}
        {isBloom && <>
          <text x="8"  y="28" fontSize="13">✨</text>
          <text x="72" y="24" fontSize="11">⭐</text>
          <text x="76" y="52" fontSize="9">✨</text>
        </>}
        {pct > 0 && pct < 8 && <ellipse cx="50" cy={potTopY-6} rx="5" ry="4" fill={c.stem} />}
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 160" style={{ width: 92, height: 147 }}>
      <polygon points="30,156 70,156 75,139 25,139" fill="#8D6E63" />
      <rect x="22" y="133" width="56" height="10" rx="4" fill="#795548" />
      <ellipse cx="50" cy="133" rx="26" ry="5" fill="#5D4037" />
      <ellipse cx="50" cy="134" rx="22" ry="3.5" fill="#3E2723" />

      {pct > 0 && (
        <path d={`M50,${potTopY} Q${47+Math.sin(pct*0.08)*5},${(potTopY+stemTopY)/2} 50,${stemTopY}`}
          stroke={c.stem} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}

      {showLeaves && <>
        <path d={`M50,${stemTopY+stemH*0.58} Q33,${stemTopY+stemH*0.38} 32,${stemTopY+stemH*0.2}`}
          stroke={c.leaf} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx={33} cy={stemTopY+stemH*0.38} rx={10} ry={5} fill={c.leaf} opacity={0.88}
          transform={`rotate(-32 33 ${stemTopY+stemH*0.38})`} />
      </>}
      {showLeaves2 && <>
        <path d={`M50,${stemTopY+stemH*0.36} Q67,${stemTopY+stemH*0.2} 66,${stemTopY+stemH*0.04}`}
          stroke={c.leaf} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx={66} cy={stemTopY+stemH*0.2} rx={10} ry={5} fill={c.leaf} opacity={0.88}
          transform={`rotate(32 66 ${stemTopY+stemH*0.2})`} />
      </>}

      {pct > 0 && pct < 20 && (
        <ellipse cx="50" cy={stemTopY+stemH*0.25} rx="7" ry="11" fill={c.leaf}
          transform={`rotate(-12 50 ${stemTopY+stemH*0.25})`} />
      )}
      {showBud && <ellipse cx="50" cy={stemTopY} rx="6" ry="11" fill={c.petal} opacity={0.9} />}
      {showFlower && renderPetals(50, stemTopY)}
      {isBloom && <>
        <text x="8"  y="28" fontSize="13">✨</text>
        <text x="74" y="24" fontSize="11">⭐</text>
        <text x="78" y="52" fontSize="9">✨</text>
      </>}
    </svg>
  )
}

function stageLabel(pct: number, total: number): string {
  if (total === 0) return '투두를 추가해서 화분을 키워보세요 🌱'
  if (pct === 0)   return '아직 시작 전이에요. 화이팅! 💪'
  if (pct <= 20)   return '싹이 트고 있어요 🌱'
  if (pct <= 40)   return '줄기가 쑥쑥 자라고 있어요 🌿'
  if (pct <= 60)   return '잎이 무성해지고 있어요 🍃'
  if (pct <= 80)   return '꽃봉오리가 맺혔어요 🌼'
  if (pct < 100)   return '꽃이 활짝 피어나고 있어요! 🌸'
  return '완전히 피어났어요! 오늘도 수고했어요 🎉'
}

export default function PlantProgress({ pct, plantType, done, total, imageUrl }: Props) {
  const c = plantType ? (COLORS[plantType] ?? DEFAULT_COLORS) : null
  const isBloom = pct === 100 && total > 0

  return (
    <div
      className="px-6 py-4 mb-5 flex items-center gap-5"
      style={{
        background: 'var(--paper)',
        border: '2.5px solid #2C1810',
        borderRadius: 12,
        boxShadow: '6px 6px 0 #2C1810',
      }}
    >
      {/* 식물 성장 표시 */}
      <div
        className="flex-shrink-0"
        style={{
          filter: isBloom && !imageUrl ? 'drop-shadow(0 0 14px gold)' : undefined,
          animation: isBloom && !imageUrl ? 'wiggle 1.5s infinite ease-in-out' : undefined,
        }}
      >
        {imageUrl
          ? <PhotoGrowth imageUrl={imageUrl} pct={pct} />
          : plantType
          ? <FlowerSVG plantType={plantType} pct={pct} />
          : <span style={{ fontSize: 64, display: 'block' }}>🪴</span>
        }
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[18px] font-black uppercase tracking-wide" style={{ color: '#8A7A6A' }}>
            {plantType ? (NAMES[plantType] ?? plantType) : '화분'} 성장률
          </span>
          <span className="text-[32px] font-black" style={{ color: c?.bar ?? 'var(--accent)' }}>
            {pct}%
          </span>
        </div>
        <div className="h-5 overflow-hidden relative mb-2"
          style={{ background: '#E8D5B0', borderRadius: 999, border: '2px solid #2C1810' }}>
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: c ? `linear-gradient(90deg, ${c.leaf}, ${c.bar})` : 'var(--accent)',
              borderRadius: 999,
            }}
          />
        </div>
        <div className="text-[19px] font-bold" style={{ color: '#8A7A6A' }}>
          {stageLabel(pct, total)}
        </div>
        {total > 0 && (
          <div className="text-[18px] font-bold mt-0.5" style={{ color: '#B0A090' }}>{done}/{total} 완료</div>
        )}
      </div>
    </div>
  )
}
