import type { FlowerDefinition } from "../../types/flower"
import { GROUND_Y, jitter } from "./flower-draw-utils"
import { clamp, deg, easeOutCubic, ease, lerp } from "./petal-3d"

interface Seg {
  x0: number
  y0: number
  x1: number
  y1: number
  cx: number
  cy: number
  start: number
  width: number
}
interface Floret {
  x: number
  y: number
  size: number
  openAt: number
  turn: number
}

/** Dựng một lần: thân chính chia nhánh từng tầng, mỗi nhánh chia đôi hai lần (cụm hoa phân nhánh hai), hoa nhỏ ở đầu cành. */
function build(): { segs: Seg[]; florets: Floret[] } {
  const segs: Seg[] = []
  const florets: Floret[] = []
  let seed = 0
  const nextSeed = () => ++seed
  const heightFrac = (y: number) => clamp((GROUND_Y - y) / (GROUND_Y - 150))
  const add = (x0: number, y0: number, x1: number, y1: number, bow: number, level: number, width: number) => {
    const start = 0.1 + heightFrac(y0) * 0.3 + level * 0.05
    segs.push({ x0, y0, x1, y1, cx: (x0 + x1) / 2 + bow, cy: (y0 + y1) / 2, start, width })
    return { x: x1, y: y1 }
  }
  const flower = (x: number, y: number, size: number) => {
    const s = nextSeed()
    florets.push({ x, y, size, openAt: 0.5 + (jitter(s, 7) + 0.5) * 0.34, turn: jitter(s, 8) * 70 })
  }
  // Thân chính, các nút chia nhánh ở độ cao 372, 326, 282, 242, 208
  add(200, GROUND_Y, 200, 372, 2, 0, 2.6)
  add(200, 372, 200, 326, -2, 0, 2.3)
  add(200, 326, 200, 282, 2, 0, 2.1)
  add(200, 282, 200, 242, -2, 0, 1.9)
  add(200, 242, 200, 208, 1, 0, 1.7)
  const nodes = [372, 326, 282, 242, 208]
  nodes.forEach((ny, i) => {
    const L = 96 - i * 11
    for (const side of [-1, 1]) {
      const ang = deg(52 - i * 4 + jitter(i * 3 + side, 1) * 8)
      const ex = 200 + side * Math.sin(ang) * L
      const ey = ny - Math.cos(ang) * L * 0.85
      const tip = add(200, ny, ex, ey, side * -6, 1, 1.4)
      // chia đôi ở đầu nhánh
      for (const sub of [-1, 1]) {
        const a2 = ang + sub * deg(32 + jitter(i * 5 + sub, 2) * 10)
        const l2 = L * 0.46
        const x2 = tip.x + side * Math.sin(a2) * l2 * (side === 1 ? 1 : 1)
        const y2 = tip.y - Math.cos(a2) * l2
        const mid = add(tip.x, tip.y, x2, y2, 0, 2, 0.95)
        flower(mid.x, mid.y, 1)
        for (const s3 of [-1, 1]) {
          const a3 = a2 + s3 * deg(40)
          const l3 = l2 * 0.5
          const e = add(mid.x, mid.y, mid.x + Math.sin(a3) * l3 * side, mid.y - Math.cos(a3) * l3, 0, 3, 0.7)
          flower(e.x, e.y, 0.9 + jitter(i * 9 + sub * 2 + s3, 3) * 0.2)
          flower((mid.x + e.x) / 2 + jitter(i * 13 + s3, 4) * 5, (mid.y + e.y) / 2 + jitter(i * 13 + s3, 5) * 4, 0.8)
        }
      }
    }
  })
  // Ngọn thân chia ba
  for (const side of [-1, 0, 1]) {
    const e = add(200, 208, 200 + side * 24, 150 - Math.abs(side) * -8, side * 3, 2, 1)
    flower(e.x, e.y, 1)
    flower(e.x + side * 9, e.y + 12, 0.9)
  }
  return { segs, florets }
}

const BABY = build()

/** Một hoa nhỏ: nụ tròn xanh nhạt lớn dần rồi nở thành năm cánh trắng với nhụy vàng xanh. */
function Floret({ f, progress }: { f: Floret; progress: number }) {
  const o = clamp((progress - f.openAt) / 0.16)
  const bud = clamp((progress - (f.openAt - 0.16)) / 0.16)
  if (bud <= 0) return null
  if (o <= 0) {
    const r = lerp(1.4, 3.6, bud) * f.size
    return <circle cx={f.x} cy={f.y} r={r} fill="#d4e3bd" stroke="#8da673" strokeWidth="0.6" />
  }
  const r = lerp(1.8, 6.6, ease(o)) * f.size
  const petals = [0, 1, 2, 3, 4].map((i) => {
    const a = deg(i * 72 + f.turn)
    return `M ${(f.x + Math.cos(a) * r * 0.62 - r * 0.5).toFixed(2)} ${(f.y + Math.sin(a) * r * 0.62).toFixed(2)} a ${(r * 0.5).toFixed(2)} ${(r * 0.5).toFixed(2)} 0 1 0 ${r.toFixed(2)} 0 a ${(r * 0.5).toFixed(2)} ${(r * 0.5).toFixed(2)} 0 1 0 ${(-r).toFixed(2)} 0`
  })
  return (
    <g>
      <path d={petals.join(" ")} fill="#ffffff" stroke="#b9b9ab" strokeWidth="0.55" />
      <circle cx={f.x} cy={f.y} r={r * 0.2} fill="#d3d98a" />
    </g>
  )
}

/**
 * Hoa baby nở theo trình tự thật: thân chính chia nhánh dần từ dưới lên, mỗi nhánh chia đôi hai lần thành cụm hoa phân nhánh
 * hai; hàng chục hoa nhỏ nở dần trong thời gian dài và lệch nhau (nguồn tra cứu cho biết hoa mở liên tục, không theo hướng
 * cố định): từ nụ tròn xanh nhạt thành hoa năm cánh trắng, nên cụm hoa mỗi lúc một dày như đám mây.
 */
export function BabyBreathBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  if (progress < 0.08) return null
  const stemTone = def.palette.stem
  return (
    <g className="flower-baby" aria-hidden="true">
      {BABY.segs.map((s, i) => {
        const g = easeOutCubic(clamp((progress - s.start) / 0.14))
        if (g <= 0.01) return null
        return (
          <path
            key={i}
            d={`M ${s.x0} ${s.y0} Q ${s.cx} ${s.cy}, ${s.x1} ${s.y1}`}
            stroke={stemTone}
            strokeWidth={s.width}
            strokeLinecap="round"
            fill="none"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - g)}
          />
        )
      })}
      {BABY.florets.map((f, i) => (
        <Floret key={i} f={f} progress={progress} />
      ))}
    </g>
  )
}
