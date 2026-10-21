import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { BroadLeaf, Stem } from "./flower-draw"
import { GROUND_Y, leafGrowth } from "./flower-draw-utils"
import { clamp, easeOutCubic, ease, lerp } from "./petal-3d"
import { timeline } from "./radial-bloom"

const STALK_TOP = 262
/** Điểm trên cuống hoa cong (Bezier bậc hai) từ đỉnh thân, vươn sang phải */
const P0: [number, number] = [200, STALK_TOP]
const P1: [number, number] = [212, 168]
const P2: [number, number] = [292, 150]
const arc = (t: number): [number, number] => [
  (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
  (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
]

/** Ba bông nở từ dưới lên (bông dưới nở trước) và hai nụ ở đầu cuống */
const SITES = [
  { t: 0.42, size: 1.0, start: 0.46 },
  { t: 0.66, size: 0.86, start: 0.54 },
  { t: 0.86, size: 0.7, start: 0.62 },
]
const BUDS = [
  { t: 0.96, size: 0.55 },
  { t: 1.0, size: 0.4 },
]

/**
 * Một bông lan hồ điệp nhìn thẳng: ba lá đài mở trước (một lên trên, hai xuống hai bên), hai cánh lớn tròn xòe sang hai bên,
 * rồi môi hoa đỏ rượu ba thùy lộ ra ở dưới cùng, cột nhị vàng nhạt ở giữa.
 */
function Orchid({ x, y, size, phase, uid }: { x: number; y: number; size: number; phase: number; uid: string }) {
  const e1 = ease(clamp((phase - 0.12) / 0.3))
  const e2 = ease(clamp((phase - 0.32) / 0.38))
  const e3 = ease(clamp((phase - 0.6) / 0.32))
  const s = size
  if (phase < 0.16) {
    const r = lerp(4.5, 8, phase / 0.16) * s
    return <ellipse cx={x} cy={y} rx={r} ry={r * 1.25} fill={`url(#${uid}-bud)`} stroke="#9fb488" strokeWidth="0.8" />
  }
  const R1 = lerp(3, 19, e1) * s
  const sepal = (angle: number, dx: number, dy: number, key: string) => (
    <ellipse key={key} cx={x + dx} cy={y + dy} rx={lerp(5, 14, e1) * s} ry={lerp(9, 23, e1) * s} transform={`rotate(${angle} ${x + dx} ${y + dy})`} fill={`url(#${uid}-petal)`} stroke="#cfa2b4" strokeWidth="0.8" />
  )
  const R2 = lerp(2, 20, e2) * s
  const petal = (side: -1 | 1) => (
    <g key={side}>
      <ellipse cx={x + side * R2} cy={y - 3 * s * e2} rx={lerp(4, 25, e2) * s} ry={lerp(10, 22, e2) * s} transform={`rotate(${side * lerp(0, 12, e2)} ${x + side * R2} ${y - 3 * s * e2})`} fill={`url(#${uid}-petal)`} stroke="#cfa2b4" strokeWidth="0.8" />
      {e2 > 0.5 &&
        [-0.5, 0, 0.5].map((v) => (
          <line key={v} x1={x + side * R2 * 0.3} y1={y} x2={x + side * R2 * 1.7} y2={y + v * 16 * s} stroke="#ebc3d2" strokeWidth="0.6" opacity={e2} />
        ))}
    </g>
  )
  const R3 = lerp(2, 19, e3) * s
  return (
    <g>
      {sepal(0, 0, -R1 * 0.95, "d")}
      {sepal(36, -Math.sin((36 * Math.PI) / 180) * R1, Math.cos((36 * Math.PI) / 180) * R1 * 0.95, "l")}
      {sepal(-36, Math.sin((36 * Math.PI) / 180) * R1, Math.cos((36 * Math.PI) / 180) * R1 * 0.95, "r")}
      {petal(-1)}
      {petal(1)}
      {e3 > 0.05 && (
        <g>
          <ellipse cx={x - 5 * s * e3} cy={y + R3 * 0.6} rx={4.6 * s * e3} ry={8 * s * e3} transform={`rotate(32 ${x - 5 * s * e3} ${y + R3 * 0.6})`} fill="#fdf1f5" stroke="#b9708f" strokeWidth="0.7" />
          <ellipse cx={x + 5 * s * e3} cy={y + R3 * 0.6} rx={4.6 * s * e3} ry={8 * s * e3} transform={`rotate(-32 ${x + 5 * s * e3} ${y + R3 * 0.6})`} fill="#fdf1f5" stroke="#b9708f" strokeWidth="0.7" />
          <ellipse cx={x} cy={y + R3} rx={5 * s * e3} ry={9 * s * e3} fill="#8f2d58" stroke="#6e2243" strokeWidth="0.7" />
          <circle cx={x} cy={y + R3 * 0.55} r={2 * s * e3} fill="#f0c440" />
        </g>
      )}
      <ellipse cx={x} cy={y + 1 * s} rx={3.8 * s * Math.max(0.4, e2)} ry={5.4 * s * Math.max(0.4, e2)} fill="#f6ecc9" stroke="#c8b680" strokeWidth="0.7" />
      <circle cx={x} cy={y + 2 * s} r={1.1 * s} fill="#8a6a2a" opacity={e2} />
    </g>
  )
}

/**
 * Lan hồ điệp nở theo trình tự thật: nụ tròn xanh trắng, đài ngoài bao nụ; ba lá đài mở trước (một lên, hai xuống hai bên);
 * hai cánh lớn tròn xòe hai bên; môi hoa đỏ rượu ba thùy lộ ra sau cùng ở dưới. Trên cuống cong các bông nở từ dưới lên, đầu
 * cuống còn nụ. Hai lá dày bóng nằm sát gốc.
 */
export function OrchidBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress)
  const topY = GROUND_Y - (GROUND_Y - STALK_TOP) * t.stemP
  const spikeP = easeOutCubic(clamp((progress - 0.34) / 0.2))
  const spikePath = `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]}, ${P2[0]} ${P2[1]}`
  return (
    <g className="flower-orchid" aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-petal`} cx="35%" cy="50%" r="85%">
          <stop offset="0" stopColor="#f3cadb" />
          <stop offset="0.55" stopColor="#fbe8ef" />
          <stop offset="1" stopColor="#fffafc" />
        </radialGradient>
        <radialGradient id={`${uid}-bud`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#f2f6e4" />
          <stop offset="1" stopColor="#c7d8aa" />
        </radialGradient>
      </defs>
      <BroadLeaf nodeY={GROUND_Y - 4} side={-1} p={leafGrowth(progress, 0.1, 0.3)} length={104} width={30} lift={0.16} fill="#3f6e41" stroke="#2c4f2e" />
      <BroadLeaf nodeY={GROUND_Y - 4} side={1} p={leafGrowth(progress, 0.14, 0.3)} length={100} width={29} lift={0.12} fill="#4c7d4a" stroke="#2c4f2e" />
      <Stem topY={topY} width={4} dark="#566f45" light={def.palette.stem} sway={2} />
      <path d={spikePath} fill="none" stroke="#566f45" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - spikeP)} />
      <path d={spikePath} fill="none" stroke={def.palette.stem} strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - spikeP)} />
      {spikeP > 0.95 &&
        BUDS.map((b, i) => {
          const [bx, by] = arc(b.t)
          return <ellipse key={i} cx={bx} cy={by - 4} rx={4.5 * b.size} ry={6 * b.size} fill={`url(#${uid}-bud)`} stroke="#9fb488" strokeWidth="0.8" />
        })}
      {spikeP > 0.7 &&
        SITES.map((site, i) => {
          const [x, y] = arc(site.t)
          return <Orchid key={i} x={x} y={y + 6} size={site.size * 1.05} phase={clamp((progress - site.start) / 0.34)} uid={uid} />
        })}
    </g>
  )
}
