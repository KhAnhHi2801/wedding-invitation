import type { FlowerDefinition } from "../../types/flower"
import { BroadLeaf, Stem } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, mixColor } from "./flower-draw-utils"
import { clamp, deg, ease, lerp, project, type Camera } from "./petal-3d"
import { timeline } from "./radial-bloom"

const HEAD_Y = 214
const COUNT = 74

/** Vị trí các hoa nhỏ trên nửa vòm (xếp xoắn ốc theo góc vàng): hướng đơn vị, độ trễ đổi màu, góc xoay ngẫu nhiên */
const FLORETS = Array.from({ length: COUNT }, (_, k) => {
  const cosPhi = 1 - ((k + 0.5) / COUNT) * 0.96
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
  const th = k * 2.399963
  return { n: [sinPhi * Math.cos(th), cosPhi, sinPhi * Math.sin(th)] as [number, number, number], late: jitter(k, 1) + 0.5, turn: jitter(k, 2) * 90, tint: jitter(k, 3) + 0.5 }
})

/** Bốn lá đài tròn xếp thành hình chữ thập: mỗi lá là một hình tròn nằm lệch khỏi tâm, gộp trong một đường vẽ. */
function clover(size: number): string {
  const r = size * 0.56
  return [0, 90, 180, 270]
    .map((a) => {
      const cx = Math.cos(deg(a)) * size * 0.5
      const cy = Math.sin(deg(a)) * size * 0.5
      return `M ${(cx - r).toFixed(2)} ${cy.toFixed(2)} a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0 a ${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`
    })
    .join(" ")
}

/**
 * Cẩm tú cầu nở theo trình tự thật: cụm nụ xanh nhỏ khép sát; cụm nở ra, các hoa nhỏ (lá đài) còn xanh nhạt; màu hồng hiện dần
 * từ mép từng hoa, hoa to lên và chồng lên nhau; đầu hoa thành khối tròn dày màu hồng phấn pha chút xanh tím. Các hoa đổi màu
 * lệch thời điểm nhau nên khối hoa chuyển màu loang dần.
 */
export function HydrangeaBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  if (progress < 0.08) return null
  const t = timeline(progress, { open: [0.46, 0.96] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const spread = ease(clamp((progress - 0.4) / 0.5))
  const R = lerp(15, 56, spread)
  const size = lerp(6, 21, spread)
  const cam: Camera = { elev: deg(lerp(6, 18, t.faceP)), cx: 200, cy: topY, scale: 1 }
  const ce = Math.cos(cam.elev)
  const se = Math.sin(cam.elev)
  const items = progress > 0.34 ? FLORETS.map((f, k) => {
    const p3: [number, number, number] = [f.n[0] * R, f.n[1] * R, f.n[2] * R]
    const pr = project(p3, cam)
    const facing = f.n[2] * ce + f.n[1] * se
    const nx = f.n[0]
    const ny = -(f.n[1] * ce - f.n[2] * se)
    const c = clamp((progress - (0.58 + 0.26 * f.late)) / 0.14)
    const base = mixColor("#a6c488", "#f1c3d2", c)
    const fill = mixColor(base, f.tint > 0.62 ? "#c3b3de" : "#eaa8c0", c * 0.55)
    return { k, x: pr[0], y: pr[1], depth: pr[2], facing, angle: (Math.atan2(ny, nx) * 180) / Math.PI, turn: f.turn, fill, c }
  }).filter((it) => it.facing > -0.2).sort((a, b) => a.depth - b.depth) : []
  const path = clover(size)
  return (
    <g className="flower-hydrangea" aria-hidden="true">
      <BroadLeaf nodeY={GROUND_Y - 70} side={-1} p={leafGrowth(progress, 0.12, 0.3)} length={96} width={42} lift={0.35} fill="#4f7d47" stroke="#34592f" />
      <BroadLeaf nodeY={GROUND_Y - 120} side={1} p={leafGrowth(progress, 0.18, 0.3)} length={92} width={40} lift={0.4} fill="#648f58" stroke="#34592f" />
      <Stem topY={topY} width={6} dark="#46633a" light={def.palette.stem} sway={4} />
      {items.map((it) => {
        const f = clamp(it.facing, 0.25, 1)
        return (
          <g key={it.k} transform={`translate(${it.x.toFixed(1)} ${it.y.toFixed(1)}) rotate(${it.angle.toFixed(0)}) scale(${f.toFixed(2)} 1) rotate(${(it.turn - it.angle).toFixed(0)})`}>
            <path d={path} fill={it.fill} stroke={mixColor("#7f9a68", "#c07a96", it.c)} strokeWidth="0.6" />
            {it.c > 0.4 && <circle r={size * 0.14} fill="#f4ecb0" />}
          </g>
        )
      })}
    </g>
  )
}
