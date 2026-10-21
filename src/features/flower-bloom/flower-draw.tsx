import { GROUND_Y, type DrawItem } from "./flower-draw-utils"

/** Vẽ danh sách cánh theo thứ tự đã sắp; mỗi cánh có dải màu riêng theo hướng gốc tới ngọn của nó. */
export function PetalItems({ items, uid }: { items: DrawItem[]; uid: string }) {
  return (
    <>
      {items.map((it) => {
        const gid = `${uid}-${it.key}`
        return (
          <g key={it.key}>
            <defs>
              <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={it.base2[0]} y1={it.base2[1]} x2={it.tip2[0]} y2={it.tip2[1]}>
                {it.style.stops.map(([offset, color]) => (
                  <stop key={offset} offset={offset} stopColor={color} />
                ))}
              </linearGradient>
            </defs>
            <path d={it.d} fill={`url(#${gid})`} stroke={it.style.stroke} strokeWidth={it.style.strokeWidth} strokeLinejoin="round" />
            {it.style.vein && <path d={it.vein} fill="none" stroke={it.style.vein} strokeWidth={it.style.veinWidth ?? 0.7} opacity="0.8" strokeLinecap="round" />}
          </g>
        )
      })}
    </>
  )
}

/** Thân mọc từ chậu lên tới `topY`, hai nét chồng để có cảm giác tròn, hơi cong. */
export function Stem({ topY, width, dark, light, sway = 4 }: { topY: number; width: number; dark: string; light: string; sway?: number }) {
  const H = GROUND_Y - topY
  const d = `M 200 ${GROUND_Y} C ${200 - sway} ${GROUND_Y - H * 0.35}, ${200 + sway} ${GROUND_Y - H * 0.7}, 200 ${topY + 6}`
  return (
    <>
      <path d={d} stroke={dark} strokeWidth={width + 2.5} strokeLinecap="round" fill="none" />
      <path d={d} stroke={light} strokeWidth={width} strokeLinecap="round" fill="none" />
    </>
  )
}

interface LanceLeafProps {
  nodeY: number
  side: -1 | 1
  p: number
  length: number
  width: number
  fill: string
  stroke: string
  rise?: number
}

/** Lá thuôn dài (mũi nhọn) mọc từ thân tại độ cao nodeY, hướng sang `side`, nâng lên theo `rise`. */
export function LanceLeaf({ nodeY, side, p, length, width, fill, stroke, rise = 0.5 }: LanceLeafProps) {
  if (p < 0.03) return null
  const L = length * p
  const x0 = 200
  const tipX = x0 + side * L * 0.92
  const tipY = nodeY - L * rise
  const w = width * p
  const d = `M ${x0} ${nodeY} C ${x0 + side * L * 0.25} ${nodeY - L * rise * 0.8 - w}, ${x0 + side * L * 0.7} ${nodeY - L * rise * 1.25 - w * 0.6}, ${tipX} ${tipY} C ${x0 + side * L * 0.7} ${nodeY - L * rise * 0.6 + w * 0.5}, ${x0 + side * L * 0.3} ${nodeY - L * rise * 0.05 + w * 0.3}, ${x0} ${nodeY} Z`
  return (
    <g>
      <path d={d} fill={fill} stroke={stroke} strokeWidth="0.8" />
      <path d={`M ${x0} ${nodeY} C ${x0 + side * L * 0.4} ${nodeY - L * rise * 0.7}, ${x0 + side * L * 0.7} ${nodeY - L * rise * 0.95}, ${tipX} ${tipY}`} fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.7" />
    </g>
  )
}

interface BroadLeafProps {
  nodeY: number
  side: -1 | 1
  p: number
  length: number
  width: number
  fill: string
  stroke: string
  /** Độ nâng của lá so với phương ngang (tỉ lệ cao trên dài) */
  lift?: number
}

/** Lá bầu dục rộng, mũi nhọn: gốc ở nodeY trên thân, hướng sang `side`, nâng lên theo `lift`. */
export function BroadLeaf({ nodeY, side, p, length, width, fill, stroke, lift = 0.4 }: BroadLeafProps) {
  if (p < 0.03) return null
  const L = length * p
  const W = width * p
  const angle = (Math.atan(lift) * 180) / Math.PI
  return (
    <g transform={`translate(200 ${nodeY}) scale(${side} 1) rotate(${-angle})`}>
      <path d={`M 0 0 C ${L * 0.12} ${-W * 0.95}, ${L * 0.62} ${-W * 1.05}, ${L} 0 C ${L * 0.62} ${W * 1.05}, ${L * 0.12} ${W * 0.95}, 0 0 Z`} fill={fill} stroke={stroke} strokeWidth="0.9" />
      <path d={`M 0 0 Q ${L * 0.5} ${-W * 0.08}, ${L} 0`} fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.7" />
      <path d={`M ${L * 0.25} 0 L ${L * 0.5} ${-W * 0.5} M ${L * 0.25} 0 L ${L * 0.5} ${W * 0.5} M ${L * 0.5} 0 L ${L * 0.72} ${-W * 0.4} M ${L * 0.5} 0 L ${L * 0.72} ${W * 0.4}`} fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.45" />
    </g>
  )
}
