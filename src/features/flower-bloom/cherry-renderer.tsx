import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { PetalItems } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, mixColor, type DrawItem, type PetalStyle } from "./flower-draw-utils"
import { clamp, deg, ease, easeOutCubic, lerp, petalGeometry, project, type Camera, type PetalSpec, type V3 } from "./petal-3d"

/** Mỗi cành: điểm gốc trên thân, điểm cuối, độ cong, thời điểm bắt đầu mọc */
interface Branch {
  from: [number, number]
  to: [number, number]
  bow: number
  start: number
  width: number
}

/** Vị trí từng bông (hoặc nụ): tọa độ, cỡ, thời điểm bắt đầu nở, cành mang nó (chỉ số), phần trăm dọc cành */
interface Site {
  at: [number, number]
  size: number
  start: number
  branch: number
}

const TRUNK: Branch = { from: [200, GROUND_Y], to: [200, 292], bow: 4, start: 0.08, width: 6 }
const BRANCHES: Branch[] = [
  TRUNK,
  { from: [200, 330], to: [128, 236], bow: -16, start: 0.2, width: 3.8 },
  { from: [200, 306], to: [272, 214], bow: 14, start: 0.24, width: 3.8 },
  { from: [200, 292], to: [206, 166], bow: -6, start: 0.28, width: 3.6 },
  { from: [158, 276], to: [140, 300], bow: 4, start: 0.36, width: 2 },
  { from: [244, 252], to: [262, 276], bow: -4, start: 0.4, width: 2 },
]
const SITES: Site[] = [
  { at: [124, 232], size: 1.05, start: 0.46, branch: 1 },
  { at: [150, 262], size: 0.85, start: 0.52, branch: 1 },
  { at: [276, 210], size: 1.0, start: 0.5, branch: 2 },
  { at: [246, 250], size: 0.82, start: 0.58, branch: 2 },
  { at: [204, 162], size: 1.0, start: 0.48, branch: 3 },
  { at: [234, 196], size: 0.78, start: 0.62, branch: 3 },
  { at: [138, 302], size: 0.62, start: 0.66, branch: 4 },
  { at: [264, 278], size: 0.6, start: 0.7, branch: 5 },
]

const petalProfile = (s: number) => (s < 0.75 ? 0.2 + 0.8 * Math.sin((Math.PI / 2) * (s / 0.75)) : 0.62 + 0.38 * Math.cos((Math.PI / 2) * ((s - 0.75) / 0.25)))

/** Hoa anh đào: năm cánh tròn, đầu cánh lõm hình tim; hồng nhạt dần ra ngoài, sậm ở gần tâm. */
function petalStyle(phase: number): PetalStyle {
  const bud = clamp(1 - phase * 3.2)
  return {
    stops: [
      [0, "#c23f66"],
      [0.38, mixColor("#f2b1c6", "#e0527a", bud)],
      [1, mixColor("#fdebf0", "#e87d9f", bud)],
    ],
    stroke: "#b25672",
    strokeWidth: 0.7,
    vein: "#dc86a3",
    veinWidth: 0.6,
  }
}

/** Đường cành cong, vẽ dần theo tiến trình `p` bằng dash. */
function branchPath(b: Branch): string {
  const mx = (b.from[0] + b.to[0]) / 2 + b.bow
  const my = (b.from[1] + b.to[1]) / 2
  return `M ${b.from[0]} ${b.from[1]} Q ${mx} ${my}, ${b.to[0]} ${b.to[1]}`
}

/**
 * Một bông anh đào theo giai đoạn nở `phase` (0 đến 1): nụ nhỏ sậm màu, đầu nụ ửng hồng và phồng lên, năm cánh tách ra
 * thành cốc rồi xòe phẳng, nhị mảnh với bao phấn đỏ vươn ra từ tâm.
 */
function Blossom({ site, phase, tilt, uid, index }: { site: Site; phase: number; tilt: number; uid: string; index: number }) {
  const cam: Camera = { elev: deg(lerp(14, 62, ease(phase))), cx: site.at[0], cy: site.at[1], scale: site.size }
  const open = ease(clamp((phase - 0.2) / 0.8))
  const grow = ease(clamp(phase * 1.6))
  const style = petalStyle(phase)
  const items: DrawItem[] = []
  for (let i = 0; i < 5; i++) {
    const phi = (i / 5) * Math.PI * 2 + tilt + jitter(index * 7 + i, 1) * 0.08
    const spec: PetalSpec = {
      base: [Math.cos(phi) * 1.5, 0, Math.sin(phi) * 1.5],
      phi,
      tilt: deg(lerp(8, 76, open) + jitter(index * 7 + i, 2) * 6),
      bend: deg(lerp(-6, 8, open)),
      length: lerp(9, 22, grow),
      width: lerp(9, 21, grow),
      profile: petalProfile,
      twist: jitter(index * 7 + i, 3) * 0.4,
      tip: [0.03, -0.06, 0.03],
    }
    const g = petalGeometry(spec, cam, 8)
    items.push({ depth: g.depth, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `b${index}p${i}`, style })
  }
  items.sort((a, b) => a.depth - b.depth)

  const stamens: { x1: number; y1: number; x2: number; y2: number; depth: number }[] = []
  if (open > 0.25) {
    for (let k = 0; k < 14; k++) {
      const th = (k / 14) * Math.PI * 2 + jitter(index * 11 + k, 4) * 0.3
      const r = lerp(2, 10, open) * (0.7 + 0.3 * ((k * 7) % 5) / 4)
      const a = project([0, 0.5, 0], cam)
      const b = project([Math.cos(th) * r, 2 + 4 * open, Math.sin(th) * r] as V3, cam)
      stamens.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], depth: b[2] })
    }
  }
  const c = project([0, 0.4, 0], cam)
  return (
    <g>
      {/* đài hoa nâu đỏ ở gốc */}
      <ellipse cx={c[0]} cy={c[1] + 2 * site.size} rx={5 * site.size} ry={3 * site.size} fill="#8a4a43" />
      <PetalItems items={items} uid={`${uid}${index}`} />
      {stamens.map((s, i) => (
        <g key={i}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#e9a9ba" strokeWidth="0.7" strokeLinecap="round" />
          <circle cx={s.x2} cy={s.y2} r={1.25 * site.size} fill="#b8335a" />
        </g>
      ))}
      {open > 0.3 && <circle cx={c[0]} cy={c[1]} r={2.2 * site.size} fill="#d9d97c" stroke="#b5b55a" strokeWidth="0.4" />}
    </g>
  )
}

/**
 * Anh đào nở theo trình tự thật: thân và cành nâu mọc dần; trên cành là các nụ xanh đỏ nhỏ; đầu nụ ửng hồng rồi phồng
 * trắng hồng; năm cánh bung ra thành bông, mỗi bông nở lệch thời điểm nhau nên cụm hoa nở rộ dần chứ không đồng loạt.
 * Lá non xanh đỏ nhú ra sau khi hoa đã nở.
 */
export function CherryBlossomBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null

  const wood = def.palette.stem
  const grown = BRANCHES.map((b) => easeOutCubic(clamp((progress - b.start) / 0.2)))

  return (
    <g className="flower-cherry" aria-hidden="true">
      {BRANCHES.map((b, i) => {
        if (grown[i] <= 0.01) return null
        const d = branchPath(b)
        return (
          <g key={i}>
            <path d={d} stroke="#4a3126" strokeWidth={b.width + 1.6} strokeLinecap="round" fill="none" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - grown[i])} />
            <path d={d} stroke={wood} strokeWidth={b.width} strokeLinecap="round" fill="none" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - grown[i])} />
          </g>
        )
      })}
      {/* lá non xanh đỏ, nhú sau khi hoa nở */}
      {[
        { at: [158, 248], rot: -40 },
        { at: [236, 232], rot: 35 },
        { at: [196, 214], rot: -10 },
        { at: [176, 286], rot: -55 },
      ].map((leaf, i) => {
        const p = leafGrowth(progress, 0.74 + i * 0.03, 0.18)
        if (p < 0.03) return null
        return (
          <path
            key={i}
            transform={`translate(${leaf.at[0]} ${leaf.at[1]}) rotate(${leaf.rot}) scale(${p})`}
            d="M 0 0 C 6 -6, 16 -6, 24 0 C 16 5, 6 5, 0 0 Z"
            fill="#9bb173"
            stroke="#5f7c46"
            strokeWidth="0.8"
          />
        )
      })}
      {SITES.map((site, i) => {
        const branchP = grown[site.branch]
        if (branchP < 0.85) return null
        const phase = clamp((progress - site.start) / 0.3)
        return <Blossom key={i} site={site} phase={phase} tilt={i * 0.9} uid={uid} index={i} />
      })}
    </g>
  )
}
