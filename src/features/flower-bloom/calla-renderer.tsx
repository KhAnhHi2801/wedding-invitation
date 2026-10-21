import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { BroadLeaf, Stem } from "./flower-draw"
import { GROUND_Y, leafGrowth } from "./flower-draw-utils"
import { clamp, ease, lerp } from "./petal-3d"
import { timeline } from "./radial-bloom"

const HEAD_Y = 210

/** Nửa bề rộng mo hoa tại vị trí u (0 ở gốc, 1 ở ngọn): từ nón hẹp khép kín sang phễu rộng. */
function halfWidth(u: number, open: number): number {
  const closed = 11 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9) + 1
  const funnel = (u < 0.72 ? 5 + 36 * Math.pow(Math.sin((Math.PI / 2) * (u / 0.72)), 1.15) : 41 * Math.pow(Math.max(0, 1 - (u - 0.72) / 0.28), 0.8)) + 0.6
  return lerp(closed, funnel, open)
}

/**
 * Rum nở theo trình tự thật: nụ là một nón hẹp, mo (lá bắc) cuộn chặt ôm bông nhị; đầu nón lỏng dần; mo bắt đầu mở cuộn, lộ
 * khe để thấy bông nhị vàng bên trong; mo xòe thành phễu, mép trên cuộn ra phía sau; phễu mở rộng hết cỡ giữ nguyên hình,
 * bông nhị vàng dựng thẳng giữa lòng phễu. Lá hình mũi tên to mọc từ gốc.
 */
export function CallaBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress, { open: [0.56, 0.97] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const grow = ease(clamp((progress - 0.34) / 0.2))
  const open = t.openP
  const H = 112 * grow * lerp(0.85, 1, open)
  const lean = 12 * open
  const steps = 14
  const left: [number, number][] = []
  const right: [number, number][] = []
  const mid: [number, number][] = []
  for (let k = 0; k <= steps; k++) {
    const u = k / steps
    const w = halfWidth(u, open) * lerp(0.4, 1, grow)
    const cx = 200 + lean * u * u
    const y = topY - H * u
    left.push([cx - w, y])
    right.push([cx + w, y])
    mid.push([cx, y])
  }
  const line = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ")
  const outline = `M ${line(left)} L ${line(right.slice().reverse())} Z`
  const tip = mid[steps]
  const spadixTop = topY - H * lerp(0.1, 0.8, open)
  const spadixW = 4.4 * grow
  return (
    <g className="flower-calla" aria-hidden="true">
      <BroadLeaf nodeY={GROUND_Y - 4} side={-1} p={leafGrowth(progress, 0.12, 0.32)} length={125} width={46} lift={0.9} fill="#4f8049" stroke="#34592f" />
      <BroadLeaf nodeY={GROUND_Y - 4} side={1} p={leafGrowth(progress, 0.17, 0.32)} length={118} width={44} lift={0.8} fill="#639659" stroke="#34592f" />
      <Stem topY={topY} width={4.6} dark="#4f7a44" light={def.palette.stem} sway={3} />
      {grow > 0.02 && (
        <>
          <defs>
            <linearGradient id={`${uid}-spathe`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#c9dcaa" />
              <stop offset="0.25" stopColor="#f4f1df" />
              <stop offset="1" stopColor="#fffdf5" />
            </linearGradient>
            <linearGradient id={`${uid}-in`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#dccf9a" />
              <stop offset="1" stopColor="#f1e7c4" />
            </linearGradient>
            <linearGradient id={`${uid}-spadix`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#d79a14" />
              <stop offset="1" stopColor="#f6cf3a" />
            </linearGradient>
          </defs>
          <path d={outline} fill={`url(#${uid}-spathe)`} stroke="#b9b49a" strokeWidth="0.9" strokeLinejoin="round" />
          {open > 0.12 && (
            <>
              {/* miệng phễu: nhìn thấy mặt trong của mo, bông nhị vàng mọc lên từ giữa lòng phễu */}
              <ellipse cx={mid[8][0]} cy={mid[8][1] + 3} rx={halfWidth(0.57, open) * 0.82 * open} ry={halfWidth(0.57, open) * 0.4 * open} fill={`url(#${uid}-in)`} stroke="#c9bf94" strokeWidth="0.7" />
              <rect x={mid[8][0] - spadixW / 2} y={spadixTop} width={spadixW} height={mid[8][1] + 3 - spadixTop} rx={spadixW / 2} fill={`url(#${uid}-spadix)`} stroke="#b9800e" strokeWidth="0.6" />
              {[0.2, 0.4, 0.6, 0.8].map((f) => (
                <circle key={f} cx={mid[8][0] + (f % 0.4 ? 1 : -1)} cy={spadixTop + (mid[8][1] + 3 - spadixTop) * f} r="0.9" fill="#a6720a" opacity="0.7" />
              ))}
              <path d={`M ${mid[8][0] - halfWidth(0.57, open) * 0.82 * open} ${mid[8][1] + 3} Q ${mid[8][0]} ${mid[8][1] + 3 + halfWidth(0.57, open) * 0.5 * open} ${mid[8][0] + halfWidth(0.57, open) * 0.82 * open} ${mid[8][1] + 3}`} fill="none" stroke="#c9c1a0" strokeWidth="1" />
            </>
          )}
          {/* nếp cuộn của mép mo: đường cong chạy dọc, rõ khi còn khép */}
          <path d={`M ${left[2][0]} ${left[2][1]} C ${mid[6][0] - (1 - open) * 2} ${mid[6][1]}, ${mid[9][0]} ${mid[9][1]}, ${tip[0]} ${tip[1]}`} fill="none" stroke="#cfc9ae" strokeWidth="0.8" opacity={0.8 * (1 - open * 0.6)} />
          {open > 0.4 && <path d={`M ${tip[0]} ${tip[1]} q ${6 * open} ${-4 * open} ${10 * open} ${3 * open} q ${-3 * open} ${-1} ${-10 * open} ${-1}`} fill="#fffdf5" stroke="#b9b49a" strokeWidth="0.8" />}
        </>
      )}
    </g>
  )
}
