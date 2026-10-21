import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { LanceLeaf, PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, leafGrowth, type PetalStyle } from "./flower-draw-utils"
import { deg, lerp, project, type Camera } from "./petal-3d"
import { ringItems, timeline, type RingSpec } from "./radial-bloom"

const HEAD_Y = 205
const STYLE: PetalStyle = { stops: [[0, "#d8708f"], [0.5, "#f0a3ba"], [1, "#fbd6e1"]], stroke: "#bd5c7c", strokeWidth: 0.7, vein: "#e08aa5", veinWidth: 0.6 }
const DEEP: PetalStyle = { stops: [[0, "#cf6285"], [1, "#eb94ae"]], stroke: "#b34e70", strokeWidth: 0.7, vein: "#d77a98", veinWidth: 0.6 }

/** Cánh cẩm chướng: hình quạt, hẹp ở gốc và xòe rộng ở đầu; mép xẻ răng cưa nhờ các điểm khía. */
const profile = (s: number) => (s < 0.8 ? 0.16 + 0.84 * Math.pow(s / 0.8, 0.9) : 1 - (s - 0.8) * 0.4)
const SERRATE = [0.05, -0.05, 0.05, -0.05, 0.05, -0.05, 0.05, -0.05, 0.05]

const RINGS: RingSpec[] = [
  { count: 10, phase: 0, baseR: 5, tilt: [6, 72], bend: [-4, 12], length: [22, 29], width: [21, 26], profile, tip: SERRATE, style: STYLE, delay: 0, span: 0.65, twist: 0.6 },
  { count: 10, phase: 0.5, baseR: 4.5, tilt: [5, 58], bend: [-4, 12], length: [20, 26], width: [19, 24], profile, tip: SERRATE, style: STYLE, delay: 0.08, span: 0.65, twist: 0.6 },
  { count: 9, phase: 0.2, baseR: 4, tilt: [4, 44], bend: [-6, 10], length: [17, 22], width: [16, 20], profile, tip: SERRATE, style: DEEP, delay: 0.16, span: 0.65, twist: 0.7 },
  { count: 8, phase: 0.6, baseR: 3, tilt: [3, 30], bend: [-8, 8], length: [13, 17], width: [12, 16], profile, tip: SERRATE, style: DEEP, delay: 0.26, span: 0.6, twist: 0.7 },
  { count: 6, phase: 0.1, baseR: 2, tilt: [2, 18], bend: [-10, 4], length: [9, 12], width: [9, 12], profile, tip: SERRATE, style: DEEP, delay: 0.38, span: 0.5, twist: 0.8 },
]

/**
 * Cẩm chướng nở theo trình tự thật: đài xanh hợp thành ống trùm nụ; đầu đài tách ra, cánh hồng nhăn nhú lên khỏi đài; các lớp
 * cánh xếp nếp bung thành khối tròn; mép cánh xẻ răng cưa lộ rõ khi nở đầy. Thân có các đốt phình với cặp lá dài mảnh xanh xám.
 */
export function CarnationBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null
  const t = timeline(progress, { open: [0.58, 0.97] })
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * t.stemP
  const scale = lerp(0.55, 1.1, t.budP)
  const cam: Camera = { elev: deg(lerp(6, 40, t.faceP)), cx: 200, cy: topY, scale }
  const items = progress > 0.34 && t.splitP > 0.02 ? ringItems(RINGS, cam, { open: t.openP, emerge: t.splitP }, "c").sort((a, b) => a.depth - b.depth) : []
  // Đài hoa: ống xanh với năm răng nhọn nằm dưới gốc cánh; lúc nụ còn khép thì ống vươn cao trùm gốc cánh
  const b = project([0, 0, 0], cam)
  const w = 9 * scale
  const up = lerp(15, 1, t.openP) * scale
  const h = 24 * scale
  const x = b[0]
  const y = b[1] - up
  const calyx = `M ${x - w} ${y} L ${x - w * 0.7} ${y - 5 * scale} L ${x - w * 0.35} ${y - 1} L ${x} ${y - 6 * scale} L ${x + w * 0.35} ${y - 1} L ${x + w * 0.7} ${y - 5 * scale} L ${x + w} ${y} C ${x + w * 0.95} ${y + h * 0.4}, ${x + w * 0.5} ${y + h * 0.85}, ${x + w * 0.28} ${y + h} L ${x - w * 0.28} ${y + h} C ${x - w * 0.5} ${y + h * 0.85}, ${x - w * 0.95} ${y + h * 0.4}, ${x - w} ${y} Z`
  const nodes = [GROUND_Y - 60, GROUND_Y - 120, GROUND_Y - 180]
  return (
    <g className="flower-carnation" aria-hidden="true">
      <Stem topY={topY} width={3.6} dark="#5f8470" light={def.palette.stem} sway={4} />
      {nodes.map((y, i) => (
        <g key={i}>
          <ellipse cx={200} cy={y} rx={4.2} ry={2.6} fill="#7ea58f" stroke="#55796a" strokeWidth="0.8" opacity={t.stemP > (i + 1) * 0.25 ? 1 : 0} />
          <LanceLeaf nodeY={y} side={-1} p={leafGrowth(progress, 0.16 + i * 0.05, 0.22)} length={68 - i * 8} width={5} rise={0.32} fill="#86ab97" stroke="#55796a" />
          <LanceLeaf nodeY={y} side={1} p={leafGrowth(progress, 0.18 + i * 0.05, 0.22)} length={66 - i * 8} width={5} rise={0.3} fill="#7ea58f" stroke="#55796a" />
        </g>
      ))}
      {progress > 0.34 && (
        <>
          {items.length > 0 && <PetalItems items={items} uid={uid} />}
          <path d={calyx} fill="#8bb08a" stroke="#55796a" strokeWidth="0.8" />
          <path d={`M ${x - w * 0.45} ${y + 2} Q ${x - w * 0.5} ${y + h * 0.5} ${x - w * 0.18} ${y + h * 0.95}`} fill="none" stroke="#55796a" strokeWidth="0.6" opacity="0.6" />
        </>
      )}
    </g>
  )
}
