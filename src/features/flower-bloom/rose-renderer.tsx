import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, leafGrowth, type PetalStyle } from "./flower-draw-utils"
import { deg, lerp, project, type Camera, type V2 } from "./petal-3d"
import { ringItems, sepalProfile, timeline, type RingSpec } from "./radial-bloom"

const HEAD_Y = 188
const OUTER: PetalStyle = { stops: [[0, "#a8405f"], [0.3, "#d77f9a"], [1, "#f6cdd8"]], stroke: "#a24b64", strokeWidth: 0.8, vein: "#d8849c" }
const MID: PetalStyle = { stops: [[0, "#9e3a5b"], [0.35, "#d27792"], [1, "#f2bfcd"]], stroke: "#a24b64", strokeWidth: 0.8, vein: "#d17792" }
const CORE: PetalStyle = { stops: [[0, "#8f3050"], [1, "#d77594"]], stroke: "#9a3e5a", strokeWidth: 0.8, vein: "#c76585" }
const SEPAL: PetalStyle = { stops: [[0, "#4f7a3c"], [1, "#98b86a"]], stroke: "#3d5e2e", strokeWidth: 0.7, vein: "#36542a", veinWidth: 0.5 }

/** Cánh hồng: rộng, tròn ở đầu, hơi gợn mép. */
const profile = (s: number) => (s < 0.75 ? 0.32 + 0.68 * Math.sin((Math.PI / 2) * (s / 0.75)) : 1 - 0.18 * ((s - 0.75) / 0.25))
const WAVY = [0.03, -0.02, 0.03]

const RINGS: RingSpec[] = [
  { count: 5, phase: 0, baseR: 6, tilt: [14, 118], bend: [-16, 8], length: [18, 26], width: [9, 9], profile: sepalProfile, style: SEPAL, delay: 0, span: 0.5, depthBias: -0.3, tiltJitter: 4 },
  { count: 5, phase: 0, baseR: 8, tilt: [10, 74], bend: [-10, 16], length: [34, 46], width: [32, 42], profile, tip: WAVY, style: OUTER, delay: 0.04, span: 0.7 },
  { count: 5, phase: 0.5, baseR: 7, tilt: [8, 52], bend: [-10, 12], length: [30, 40], width: [29, 36], profile, tip: WAVY, style: MID, delay: 0.14, span: 0.7 },
  { count: 4, phase: 0.2, baseR: 5.5, tilt: [6, 44], bend: [-12, 10], length: [26, 33], width: [25, 31], profile, tip: WAVY, style: MID, delay: 0.24, span: 0.7 },
  { count: 3, phase: 0.6, baseR: 4, tilt: [4, 28], bend: [-14, 8], length: [22, 27], width: [21, 25], profile, style: CORE, delay: 0.36, span: 0.6 },
  { count: 3, phase: 0.1, baseR: 2, tilt: [2, 12], bend: [-26, -4], length: [16, 19], width: [16, 19], profile, style: CORE, delay: 0.5, span: 0.5 },
]

/** Lá hồng kép: ba lá chét bầu dục xanh sẫm trên một cuống. */
function CompoundLeaf({ nodeY, side, p }: { nodeY: number; side: -1 | 1; p: number }) {
  if (p < 0.04) return null
  const leaflet = (x: number, y: number, rot: number, s: number) => (
    <ellipse cx={x} cy={y} rx={14 * s} ry={7.5 * s} transform={`rotate(${rot} ${x} ${y})`} fill="#527a45" stroke="#37562f" strokeWidth="0.8" />
  )
  const L = 44 * p
  const x1 = 200 + side * L
  const y1 = nodeY - L * 0.35
  return (
    <g>
      <path d={`M 200 ${nodeY} Q ${200 + side * L * 0.55} ${nodeY - L * 0.12}, ${x1} ${y1}`} stroke="#47663a" strokeWidth="1.6" fill="none" />
      {leaflet(200 + side * L * 0.38, nodeY - L * 0.3, side * -50, p)}
      {leaflet(200 + side * L * 0.38, nodeY + L * 0.06, side * 50, p * 0.85)}
      {leaflet(x1 + side * 8 * p, y1 - 2 * p, side * -12, p * 1.05)}
    </g>
  )
}

/**
 * Hồng nở theo trình tự thật (7 giai đoạn của hoa hồng): nụ xanh phồng bọc bởi lá đài; lá đài lật xuống để lộ nụ hồng xoắn ốc
 * chặt; các cánh ngoài tách ra vươn lên thành cốc; từng vòng cánh bung dần từ ngoài vào trong trong khi tâm xoắn ốc vẫn khép;
 * cuối cùng cánh phẳng ra và tâm xoắn ốc nới lỏng.
 */
export function RoseBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress, { open: [0.54, 0.96] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const scale = lerp(0.6, 1.4, t.budP)
  const cam: Camera = { elev: deg(lerp(5, 32, t.faceP)), cx: 200, cy: topY, scale }
  const items = progress > 0.34 ? ringItems(RINGS, cam, { open: t.openP, emerge: Math.max(t.splitP, t.budP * 0.95) }, "r").sort((a, b) => a.depth - b.depth) : []

  // Tâm xoắn ốc: vài đường cong quấn vào nhau ở giữa hoa, chỉ lộ khi hoa đã nở rộng
  const spiral: V2[] = []
  if (t.openP > 0.55) {
    for (let k = 0; k <= 16; k++) {
      const a = k * 0.62
      const r = 1.2 + k * 0.42
      const q = project([Math.cos(a) * r, 6 + 3 * t.openP, Math.sin(a) * r], cam)
      spiral.push([q[0], q[1]])
    }
  }
  return (
    <g className="flower-rose" aria-hidden="true">
      <Stem topY={topY} width={4.6} dark="#3f5f33" light={def.palette.stem} sway={5} />
      <CompoundLeaf nodeY={GROUND_Y - 80} side={-1} p={leafGrowth(progress, 0.14, 0.28)} />
      <CompoundLeaf nodeY={GROUND_Y - 140} side={1} p={leafGrowth(progress, 0.2, 0.28)} />
      {[GROUND_Y - 100, GROUND_Y - 160].map((y, i) => (
        <path key={i} d={`M ${i ? 203 : 197} ${y} l ${i ? 5 : -5} -4 l -1 6 z`} fill="#a8404f" opacity={t.stemP > 0.5 ? 1 : 0} />
      ))}
      {items.length > 0 && <PetalItems items={items} uid={uid} />}
      {spiral.length > 1 && (
        <path d={`M ${spiral.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")}`} fill="none" stroke="#9a3e5a" strokeWidth="0.7" opacity={0.6 * t.openP} strokeLinecap="round" />
      )}
    </g>
  )
}
