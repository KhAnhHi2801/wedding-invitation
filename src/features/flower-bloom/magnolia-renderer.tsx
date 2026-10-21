import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { BroadLeaf, PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, leafGrowth, type PetalStyle } from "./flower-draw-utils"
import { clamp, deg, lerp, project, type Camera } from "./petal-3d"
import { ringItems, sepalProfile, timeline, type RingSpec } from "./radial-bloom"

const HEAD_Y = 200
const SCALE: PetalStyle = { stops: [[0, "#a8957c"], [1, "#d6c9b3"]], stroke: "#85735e", strokeWidth: 0.7, vein: "#9a8a74", veinWidth: 0.5 }
const OUTER: PetalStyle = { stops: [[0, "#b24570"], [0.3, "#eebfd0"], [1, "#fff6f8"]], stroke: "#b98398", strokeWidth: 0.8, vein: "#d9a9b9" }
const INNER: PetalStyle = { stops: [[0, "#bf5679"], [0.35, "#f1c9d6"], [1, "#fffafa"]], stroke: "#c08fa2", strokeWidth: 0.75, vein: "#dcb2c0" }

/** Cánh mộc lan: hình thìa, rộng nhất khoảng 55% chiều dài, đầu tròn. */
const profile = (s: number) =>
  s < 0.55 ? 0.3 + 0.7 * Math.sin((Math.PI / 2) * (s / 0.55)) : Math.pow(Math.max(0, Math.cos(((s - 0.55) / 0.45) * (Math.PI / 2))), 0.55) * 0.97 + 0.03

const RINGS: RingSpec[] = [
  { count: 8, phase: 0, baseR: 6, tilt: [10, 72], bend: [-14, 10], length: [22, 18], width: [11, 11], profile: sepalProfile, style: SCALE, delay: 0, span: 0.35, depthBias: 1.2, tiltJitter: 4 },
  { count: 3, phase: 0.75, baseR: 7, tilt: [4, 86], bend: [-4, 12], length: [56, 66], width: [28, 35], profile, style: OUTER, delay: 0.02, span: 0.65, tiltJitter: 3 },
  { count: 3, phase: 0.25, baseR: 6, tilt: [3, 30], bend: [-6, 10], length: [52, 62], width: [26, 31], profile, style: INNER, delay: 0.12, span: 0.7, depthBias: -0.3, tiltJitter: 3 },
  { count: 3, phase: 0.75, baseR: 4.5, tilt: [2, 17], bend: [-8, 8], length: [46, 54], width: [22, 26], profile, style: INNER, delay: 0.22, span: 0.7, depthBias: -0.6, tiltJitter: 3 },
]

/**
 * Mộc lan nở theo trình tự thật: nụ phủ lông tơ màu xám nâu; vảy nụ tách ra và rụng, đầu nụ trắng hồng lộ ra; nụ mở thành cốc,
 * cánh dựng đứng với gốc hồng sậm; ba cánh ngoài xòe ngang trước trong khi các cánh trong còn dựng thành cốc ("cốc đặt trên
 * đĩa"); cuối cùng nón nhị vàng xanh ở tâm lộ rõ.
 */
export function MagnoliaBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress, { split: [0.5, 0.62], open: [0.58, 0.97] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const scale = lerp(0.5, 1.05, t.budP)
  const cam: Camera = { elev: deg(lerp(4, 30, t.faceP)), cx: 200, cy: topY, scale }
  const all = progress > 0.34 ? ringItems(RINGS, cam, { open: t.openP, emerge: Math.max(t.splitP, t.budP * 0.9) }, "m").sort((a, b) => a.depth - b.depth) : []
  // Vảy nụ mờ dần và rụng khi hoa bắt đầu nở; chỉ các cánh thật mới vẽ sau khi đã tách
  const scaleOpacity = clamp(1 - (t.openP - 0.1) / 0.3)
  const scaleItems = all.filter((it) => it.key.startsWith("m0-"))
  const petals = all.filter((it) => !it.key.startsWith("m0-"))
  const petalsVisible = t.splitP > 0.05
  const cone = project([0, 22 * t.openP, 0], cam)
  const base = project([0, 2, 0], cam)
  return (
    <g className="flower-magnolia" aria-hidden="true">
      <Stem topY={topY} width={5} dark="#4a3126" light={def.palette.stem} sway={5} />
      <BroadLeaf nodeY={GROUND_Y - 110} side={-1} p={leafGrowth(progress, 0.7, 0.22)} length={62} width={20} fill="#6d9360" stroke="#43653a" lift={0.5} />
      <BroadLeaf nodeY={GROUND_Y - 150} side={1} p={leafGrowth(progress, 0.74, 0.22)} length={58} width={19} fill="#7da36f" stroke="#43653a" lift={0.5} />
      {all.length > 0 && (
        <>
          {petalsVisible && <PetalItems items={petals.filter((it) => it.depth < -0.1)} uid={uid} />}
          {t.openP > 0.6 && (
            <g>
              <path d={`M ${base[0] - 3 * scale} ${base[1]} L ${cone[0]} ${cone[1]} L ${base[0] + 3 * scale} ${base[1]} Z`} fill="#cdd98a" stroke="#9aa65a" strokeWidth="0.6" />
              <ellipse cx={base[0]} cy={base[1]} rx={7 * scale} ry={2.5 * scale} fill="none" stroke="#c9a77a" strokeWidth="1.4" strokeDasharray="1.2 1.6" />
            </g>
          )}
          {petalsVisible && <PetalItems items={petals.filter((it) => it.depth >= -0.1)} uid={uid} />}
          <g opacity={scaleOpacity}>
            <PetalItems items={scaleItems} uid={uid} />
          </g>
        </>
      )}
    </g>
  )
}
