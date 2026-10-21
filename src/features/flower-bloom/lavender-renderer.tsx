import type { FlowerDefinition } from "../../types/flower"
import { Stem } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, mixColor } from "./flower-draw-utils"
import { clamp, deg, lerp, project, type Camera } from "./petal-3d"
import { timeline } from "./radial-bloom"

const SPIKE_BOTTOM = 266
const WHORLS = 11
const GAP = 10.5

/** Lá mảnh như lưỡi dài từ gốc: cong ra ngoài rồi vươn lên. */
function Blades({ progress }: { progress: number }) {
  const blades = [-1, 1].flatMap((side) => [0, 1, 2, 3].map((i) => ({ side, i })))
  return (
    <g fill="none" strokeLinecap="round">
      {blades.map(({ side, i }) => {
        const g = leafGrowth(progress, 0.1 + i * 0.03, 0.3)
        if (g < 0.03) return null
        const len = (84 - i * 9) * g
        const spread = 28 + i * 14
        const x1 = 200 + side * spread * g
        const y1 = GROUND_Y - 4 - len
        return (
          <g key={`${side}${i}`}>
            <path d={`M 200 ${GROUND_Y - 4} Q ${200 + side * (spread * 0.4) * g} ${GROUND_Y - 4 - len * 0.6}, ${x1} ${y1}`} stroke="#6f8f72" strokeWidth="3.2" />
            <path d={`M 200 ${GROUND_Y - 4} Q ${200 + side * (spread * 0.4) * g} ${GROUND_Y - 4 - len * 0.6}, ${x1} ${y1}`} stroke="#9bb69b" strokeWidth="1.5" />
          </g>
        )
      })}
    </g>
  )
}

/**
 * Oải hương nở theo trình tự thật: bông là một chùm các vòng hoa xếp dọc theo trục; nụ xanh xám nhỏ khép sát; nụ ngả tím rồi
 * hé cánh, các vòng nở lần lượt **từ dưới lên trên**, vòng dưới đã nở rộ khi vòng trên còn là nụ; cuối cùng gần như cả bông
 * tím lam, chỉ đầu ngọn còn vài nụ.
 */
export function LavenderBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  if (progress < 0.08) return null
  const t = timeline(progress)
  const stemTop = GROUND_Y - (GROUND_Y - SPIKE_BOTTOM) * t.stemP
  const grow = clamp((progress - 0.3) / 0.22)
  const cam: Camera = { elev: deg(lerp(4, 10, t.faceP)), cx: 200, cy: SPIKE_BOTTOM, scale: 1 }
  const florets: { x1: number; y1: number; x2: number; y2: number; depth: number; o: number; key: string; wide: number }[] = []
  for (let j = 0; j < WHORLS; j++) {
    const o = clamp((progress - (0.5 + 0.32 * (j / (WHORLS - 1)))) / 0.2)
    const budGrow = clamp((progress - (0.3 + 0.2 * (j / (WHORLS - 1)))) / 0.25)
    if (budGrow <= 0) continue
    const h = j * GAP * clamp(grow * 1.1 - (j / WHORLS) * 0.2)
    for (let i = 0; i < 6; i++) {
      const th = deg(i * 60 + (j % 2) * 30 + jitter(j * 7 + i, 1) * 14)
      const r0 = 3.2
      const reach = lerp(2.5, 6.8, o) * (0.75 + budGrow * 0.25)
      const a = project([Math.cos(th) * r0, h, Math.sin(th) * r0], cam)
      const b = project([Math.cos(th) * (r0 + reach), h + lerp(2.5, 5.6, o) * (0.7 + budGrow * 0.3), Math.sin(th) * (r0 + reach)], cam)
      florets.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], depth: b[2], o, key: `${j}-${i}`, wide: lerp(2.6, 4, o) })
    }
  }
  florets.sort((a, b) => a.depth - b.depth)
  return (
    <g className="flower-lavender" aria-hidden="true">
      <Blades progress={progress} />
      <Stem topY={Math.min(stemTop, SPIKE_BOTTOM - (WHORLS - 1) * GAP * grow)} width={2.6} dark="#6a8a62" light={def.palette.stem} sway={2} />
      {florets.map((f) => {
        const tube = mixColor("#92a176", "#8f86c0", clamp(f.o * 2.2))
        const lobe = mixColor("#9fae85", "#b9a0ea", clamp(f.o * 1.6))
        return (
          <g key={f.key}>
            <line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke={mixColor("#8da072", "#7a6aa8", f.o)} strokeWidth={f.wide + 1} strokeLinecap="round" />
            <line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke={tube} strokeWidth={f.wide} strokeLinecap="round" />
            {f.o > 0.45 && (
              <>
                <circle cx={f.x2 - 1.1} cy={f.y2 - 0.6} r={f.wide * 0.5} fill={lobe} />
                <circle cx={f.x2 + 1.2} cy={f.y2 - 0.4} r={f.wide * 0.5} fill={lobe} />
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}
