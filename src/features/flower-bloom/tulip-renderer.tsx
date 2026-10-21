import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { LanceLeaf, PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, leafGrowth, type PetalStyle } from "./flower-draw-utils"
import { deg, lerp, project, type Camera } from "./petal-3d"
import { ringItems, timeline, type RingSpec } from "./radial-bloom"

const HEAD_Y = 205
const OUTER: PetalStyle = { stops: [[0, "#b66b82"], [0.5, "#e29db2"], [1, "#f4c6d1"]], stroke: "#a85a70", strokeWidth: 0.8, vein: "#cf8da1" }
const INNER: PetalStyle = { stops: [[0, "#d48ba1"], [1, "#f8d6df"]], stroke: "#b8687e", strokeWidth: 0.7, vein: "#e3a3b4" }

/** Cánh tulip: hình trứng, rộng nhất ở 45% chiều dài, đầu hơi nhọn. */
const profile = (s: number) =>
  s < 0.45 ? 0.35 + 0.65 * Math.sin((Math.PI / 2) * (s / 0.45)) : Math.pow(Math.max(0, 1 - Math.pow((s - 0.45) / 0.55, 2)), 0.6)

const RINGS: RingSpec[] = [
  { count: 3, phase: 0.75, baseR: 7, tilt: [5, 32], bend: [-10, 14], length: [58, 70], width: [24, 31], profile, style: OUTER, delay: 0, tiltJitter: 3 },
  { count: 3, phase: 0.25, baseR: 5, tilt: [3, 20], bend: [-8, 10], length: [54, 64], width: [22, 28], profile, style: INNER, delay: 0.14, depthBias: -0.4, tiltJitter: 3 },
]

/**
 * Tulip nở theo trình tự thật: nụ thon khép kín hình trứng; ba cánh ngoài hé dần ở đầu để lộ màu bên trong; ba cánh trong theo
 * sau; cốc mở rộng, đầu cánh cong ra ngoài, nhị vàng nâu hiện ở đáy cốc. Tulip luôn được nhìn gần như ngang nên thấy rõ hình cốc.
 */
export function TulipBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress)
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const scale = lerp(0.6, 1.3, t.budP)
  const cam: Camera = { elev: deg(lerp(3, 16, t.faceP)), cx: 200, cy: topY, scale }
  const items = progress > 0.34 ? ringItems(RINGS, cam, { open: t.openP, emerge: Math.max(t.splitP, t.budP * 0.9) }, "t").sort((a, b) => a.depth - b.depth) : []
  const stamens = []
  if (t.openP > 0.45) {
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * Math.PI * 2 + 0.4
      const a = project([0, 2, 0], cam)
      const b = project([Math.cos(th) * 7, 22 * t.openP, Math.sin(th) * 7], cam)
      stamens.push({ a, b, k })
    }
  }
  return (
    <g className="flower-tulip" aria-hidden="true">
      <LanceLeaf nodeY={GROUND_Y - 6} side={-1} p={leafGrowth(progress, 0.12, 0.3)} length={150} width={30} rise={1.05} fill="#6e9560" stroke="#47663a" />
      <LanceLeaf nodeY={GROUND_Y - 6} side={1} p={leafGrowth(progress, 0.16, 0.3)} length={140} width={28} rise={1.0} fill="#85a873" stroke="#47663a" />
      <Stem topY={topY} width={5.5} dark="#4f6e3d" light={def.palette.stem} sway={3} />
      {items.length > 0 && (
        <>
          <PetalItems items={items.filter((it) => it.depth < -0.2)} uid={uid} />
          {stamens.map((s) => (
            <g key={s.k}>
              <line x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke="#6f7a3d" strokeWidth="0.8" />
              <circle cx={s.b[0]} cy={s.b[1]} r={1.6 * scale} fill="#6a4a2a" />
            </g>
          ))}
          <PetalItems items={items.filter((it) => it.depth >= -0.2)} uid={uid} />
        </>
      )}
    </g>
  )
}
