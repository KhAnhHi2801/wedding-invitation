import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { PetalItems } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, type PetalStyle } from "./flower-draw-utils"
import { deg, lerp, project, type Camera } from "./petal-3d"
import { ringItems, timeline, type RingSpec } from "./radial-bloom"
import { Stem } from "./flower-draw"

const HEAD_Y = 200
const OUTER: PetalStyle = { stops: [[0, "#e6eed4"], [0.35, "#f5c3d3"], [1, "#e9779f"]], stroke: "#c06a8d", strokeWidth: 0.8, vein: "#e697b3" }
const MIDDLE: PetalStyle = { stops: [[0, "#eef3de"], [0.4, "#f8d0dc"], [1, "#ee8bb0"]], stroke: "#c06a8d", strokeWidth: 0.75, vein: "#e99db8" }
const INNER: PetalStyle = { stops: [[0, "#f3f6e6"], [0.5, "#fbdde6"], [1, "#f29cbb"]], stroke: "#c8789a", strokeWidth: 0.7, vein: "#eeabc2" }

/** Cánh sen: thon, đầu nhọn, rộng nhất khoảng 45% chiều dài. */
const profile = (s: number) => Math.max(0.05, Math.pow(Math.sin(Math.PI * Math.pow(s, 0.78)), 0.85))

const RINGS: RingSpec[] = [
  { count: 8, phase: 0, baseR: 7, tilt: [5, 84], bend: [-8, 18], length: [50, 62], width: [22, 29], profile, style: OUTER, delay: 0, span: 0.7 },
  { count: 8, phase: 0.5, baseR: 6, tilt: [4, 60], bend: [-8, 14], length: [44, 54], width: [20, 26], profile, style: MIDDLE, delay: 0.12, span: 0.7 },
  { count: 7, phase: 0.2, baseR: 5, tilt: [3, 36], bend: [-8, 10], length: [36, 44], width: [17, 22], profile, style: INNER, delay: 0.24, span: 0.65 },
  { count: 5, phase: 0.4, baseR: 3, tilt: [2, 18], bend: [-10, 6], length: [24, 28], width: [12, 15], profile, style: INNER, delay: 0.4, span: 0.55 },
]

/** Lá sen tròn nổi trên mặt nước, có gân tỏa từ giữa. */
function Pad({ cx, cy, rx, p, id }: { cx: number; cy: number; rx: number; p: number; id: string }) {
  if (p < 0.03) return null
  const r = rx * p
  const ry = r * 0.28
  return (
    <g key={id}>
      <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="#5f8a52" stroke="#3f6a38" strokeWidth="1" />
      <ellipse cx={cx - r * 0.1} cy={cy - ry * 0.18} rx={r * 0.8} ry={ry * 0.72} fill="#76a266" opacity="0.7" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = (i / 7) * Math.PI * 2
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r * 0.9} y2={cy + Math.sin(a) * ry * 0.9} stroke="#3f6a38" strokeWidth="0.6" opacity="0.5" />
      })}
    </g>
  )
}

/**
 * Sen nở theo trình tự thật: nụ nhọn khép kín hồng nhạt; các cánh ngoài tách ra ở đầu; lớp cánh ngoài mở thành cốc; từng lớp
 * cánh trong mở theo sau, đài sen vàng lộ ra giữa hoa; hoa mở rộng nhiều tầng, đầu cánh cong ra. Lá sen tròn nổi trên mặt nước.
 */
export function LotusBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress, { open: [0.56, 0.97] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const scale = lerp(0.5, 1.08, t.budP)
  const cam: Camera = { elev: deg(lerp(5, 38, t.faceP)), cx: 200, cy: topY, scale }
  const items = progress > 0.34 ? ringItems(RINGS, cam, { open: t.openP, emerge: Math.max(t.splitP, t.budP * 0.95) }, "l").sort((a, b) => a.depth - b.depth) : []

  // Đài sen: nón vàng xanh ở tâm, có các chấm hạt
  const pod = project([0, 6, 0], cam)
  const seeds = []
  if (t.openP > 0.35) {
    for (let k = 0; k < 8; k++) {
      const a = k * 2.4
      const r = 1 + (k % 4) * 1.3
      const q = project([Math.cos(a) * r, 8.5, Math.sin(a) * r], cam)
      seeds.push({ x: q[0], y: q[1], k })
    }
  }
  return (
    <g className="flower-lotus" aria-hidden="true">
      <Pad cx={124} cy={414} rx={56} p={leafGrowth(progress, 0.12, 0.3)} id="p1" />
      <Pad cx={282} cy={420} rx={50} p={leafGrowth(progress, 0.18, 0.3)} id="p2" />
      <Stem topY={topY} width={4.5} dark="#3f6a38" light={def.palette.stem} sway={5} />
      {items.length > 0 && (
        <>
          <PetalItems items={items.filter((it) => it.depth < 0)} uid={uid} />
          {t.openP > 0.3 && (
            <g>
              <ellipse cx={pod[0]} cy={pod[1] - 1} rx={6.5 * scale * t.openP} ry={3 * scale * t.openP} fill="#d8cf60" stroke="#a89f2e" strokeWidth="0.6" />
              {seeds.map((s) => (
                <circle key={s.k} cx={s.x} cy={s.y} r={Math.max(0.5, (0.9 + jitter(s.k, 1) * 0.2) * scale)} fill="#8a7a1c" />
              ))}
            </g>
          )}
          <PetalItems items={items.filter((it) => it.depth >= 0)} uid={uid} />
        </>
      )}
    </g>
  )
}
