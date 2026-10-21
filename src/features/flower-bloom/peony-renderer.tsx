import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { LanceLeaf, PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, type PetalStyle } from "./flower-draw-utils"
import { deg, lerp, project, type Camera } from "./petal-3d"
import { ringItems, sepalProfile, timeline, type RingSpec } from "./radial-bloom"

const HEAD_Y = 192
const GUARD: PetalStyle = { stops: [[0, "#b04c7a"], [0.35, "#e07fa8"], [1, "#f9d0de"]], stroke: "#b0507a", strokeWidth: 0.8, vein: "#d77ba0" }
const LAYER: PetalStyle = { stops: [[0, "#a03f6e"], [0.4, "#d96f9b"], [1, "#f5bad0"]], stroke: "#ad4c76", strokeWidth: 0.75, vein: "#d2709a" }
const BALL: PetalStyle = { stops: [[0, "#8f3463"], [1, "#d3668f"]], stroke: "#a44570", strokeWidth: 0.7, vein: "#c8638f" }
const SEPAL: PetalStyle = { stops: [[0, "#4f7a3c"], [1, "#9dbb6c"]], stroke: "#3d5e2e", strokeWidth: 0.7, vein: "#36542a", veinWidth: 0.5 }

const profile = (s: number) => (s < 0.65 ? 0.3 + 0.7 * Math.sin((Math.PI / 2) * (s / 0.65)) : 1 - 0.2 * ((s - 0.65) / 0.35))
/** Mép cánh mẫu đơn xếp nếp: nhiều gợn nhỏ ở đầu cánh. */
const RUFFLE = [0.03, -0.03, 0.04, -0.03, 0.03]

const RINGS: RingSpec[] = [
  { count: 5, phase: 0, baseR: 6, tilt: [14, 112], bend: [-14, 6], length: [20, 26], width: [14, 14], profile: sepalProfile, style: SEPAL, delay: 0, span: 0.5, depthBias: -0.3, tiltJitter: 4 },
  { count: 5, phase: 0, baseR: 8, tilt: [8, 58], bend: [-6, 16], length: [36, 44], width: [34, 44], profile, style: GUARD, delay: 0, span: 0.6 },
  { count: 9, phase: 0.3, baseR: 7, tilt: [8, 44], bend: [-6, 14], length: [30, 38], width: [24, 30], profile, tip: RUFFLE, style: LAYER, delay: 0.1, span: 0.65, twist: 0.7 },
  { count: 9, phase: 0.6, baseR: 5.5, tilt: [6, 33], bend: [-8, 10], length: [28, 35], width: [22, 27], profile, tip: RUFFLE, style: LAYER, delay: 0.2, span: 0.65, twist: 0.7 },
  { count: 8, phase: 0.1, baseR: 4, tilt: [4, 23], bend: [-10, 8], length: [24, 30], width: [19, 24], profile, tip: RUFFLE, style: BALL, delay: 0.3, span: 0.6, twist: 0.8 },
  { count: 7, phase: 0.4, baseR: 2.5, tilt: [2, 12], bend: [-18, -2], length: [18, 22], width: [15, 19], profile, tip: RUFFLE, style: BALL, delay: 0.42, span: 0.5, twist: 0.8 },
]

/** Lá mẫu đơn xẻ thùy: ba lá thuôn xòe từ một cuống. */
function LobedLeaf({ nodeY, side, p }: { nodeY: number; side: -1 | 1; p: number }) {
  return (
    <>
      <LanceLeaf nodeY={nodeY} side={side} p={p} length={74} width={16} rise={0.55} fill="#4f7d47" stroke="#35552f" />
      <LanceLeaf nodeY={nodeY} side={side} p={p * 0.95} length={70} width={14} rise={0.12} fill="#5f8c55" stroke="#35552f" />
      <LanceLeaf nodeY={nodeY - 6} side={side} p={p * 0.9} length={58} width={13} rise={0.95} fill="#44713d" stroke="#35552f" />
    </>
  )
}

/**
 * Mẫu đơn nở theo trình tự thật: nụ tròn đặc xanh hồng với lá đài; nụ phồng, màu hồng lộ dần; các cánh "bảo vệ" ngoài to bản
 * tách ra trước; khối cánh trong xếp nếp nới lỏng thành cốc; các lớp cánh bồng bung ra từng vòng, tâm lộ nhị vàng.
 */
export function PeonyBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress, { open: [0.56, 0.97] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const scale = lerp(0.6, 1.5, t.budP)
  const cam: Camera = { elev: deg(lerp(6, 24, t.faceP)), cx: 200, cy: topY, scale }
  const items = progress > 0.34 ? ringItems(RINGS, cam, { open: t.openP, emerge: Math.max(t.splitP, t.budP * 0.95) }, "p").sort((a, b) => a.depth - b.depth) : []
  const stamens = []
  if (t.openP > 0.7) {
    const k = (t.openP - 0.7) / 0.3
    for (let i = 0; i < 28; i++) {
      const th = i * 2.4
      const r = (2 + (i % 7)) * k
      const q = project([Math.cos(th) * r, 7, Math.sin(th) * r], cam)
      stamens.push({ x: q[0], y: q[1], i })
    }
  }
  const back = items.filter((it) => it.depth < 3)
  return (
    <g className="flower-peony" aria-hidden="true">
      <Stem topY={topY} width={6} dark="#46633a" light={def.palette.stem} sway={4} />
      <LobedLeaf nodeY={GROUND_Y - 70} side={-1} p={leafGrowth(progress, 0.14, 0.28)} />
      <LobedLeaf nodeY={GROUND_Y - 135} side={1} p={leafGrowth(progress, 0.2, 0.28)} />
      {items.length > 0 && (
        <>
          <PetalItems items={back.slice(0, Math.floor(back.length * 0.8))} uid={uid} />
          {stamens.map((s) => (
            <circle key={s.i} cx={s.x} cy={s.y} r={Math.max(0.7, 1.5 * scale)} fill="#f2c332" stroke="#c78a12" strokeWidth="0.3" opacity={0.9 + jitter(s.i, 1) * 0.1} />
          ))}
          <PetalItems items={back.slice(Math.floor(back.length * 0.8))} uid={uid} />
        </>
      )}
    </g>
  )
}
