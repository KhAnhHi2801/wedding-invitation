import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { LanceLeaf, PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, type DrawItem, type PetalStyle } from "./flower-draw-utils"
import { clamp, deg, ease, easeOutCubic, lerp, petalGeometry, project, type Camera, type PetalSpec, type V3 } from "./petal-3d"

const HEAD_Y = 160
const BRACTS_PER_RING = 13
const RAYS_PER_LAYER = 17
const FLORETS = 130

const RAY_STYLE: PetalStyle = { stops: [[0, "#cf8a1d"], [0.35, "#f0b523"], [1, "#f8d24c"]], stroke: "#b27a12", strokeWidth: 0.8, vein: "#d6961c" }
const BRACT_STYLE: PetalStyle = { stops: [[0, "#4f7a3c"], [1, "#9dbb6c"]], stroke: "#3d5e2e", strokeWidth: 0.7, vein: "#36542a", veinWidth: 0.5 }

/** Cánh tia hướng dương: thon dài, rộng nhất ở khoảng 45% chiều dài, đầu nhọn nhẹ. */
const rayProfile = (s: number) =>
  s < 0.45 ? 0.3 + 0.7 * Math.sin((Math.PI / 2) * (s / 0.45)) : Math.pow(Math.max(0, 1 - Math.pow((s - 0.45) / 0.55, 1.7)), 0.7)
const bractProfile = (s: number) => Math.max(0.04, Math.sin(Math.PI * Math.pow(s, 0.7)) * (1 - 0.2 * s))

/**
 * Hướng dương nở theo trình tự thật: nụ xanh quay mặt về phía trước, bọc bởi nhiều lá bắc nhọn xếp lớp; lá bắc mở ra
 * để lộ các cánh vàng còn dựng đứng; cánh tia xòe dần ra thành hai lớp so le; đĩa nâu to ở tâm xếp xoắn ốc theo góc vàng,
 * và các hoa nhỏ ở đĩa nở thành vòng vàng từ mép ngoài tiến vào trong (đĩa vẫn nâu ở giữa).
 */
export function SunflowerBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null

  const stemP = easeOutCubic(clamp((progress - 0.08) / 0.4))
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * stemP
  const budP = ease(clamp((progress - 0.34) / 0.18))
  const splitP = ease(clamp((progress - 0.57) / 0.13))
  const openP = ease(clamp((progress - 0.6) / 0.36))
  const faceP = ease(clamp((progress - 0.62) / 0.34))
  const discP = ease(clamp((progress - 0.76) / 0.22))
  const scale = lerp(0.5, 1.12, budP)
  const cam: Camera = { elev: deg(lerp(6, 56, faceP)), cx: 200, cy: topY, scale }
  const discR = lerp(8, 25, openP)
  const domeH = lerp(2, 5, openP)

  const items: DrawItem[] = []
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < BRACTS_PER_RING; i++) {
      const idx = ring * BRACTS_PER_RING + i
      const phi = ((i + ring * 0.5) / BRACTS_PER_RING) * Math.PI * 2 + jitter(idx, 1) * 0.2
      const spread = ease(clamp((openP - 0.02 - ring * 0.1) / 0.8))
      const spec: PetalSpec = {
        base: [Math.cos(phi) * discR * 0.5, -3 - ring * 1.5, Math.sin(phi) * discR * 0.5],
        phi,
        tilt: deg(lerp(14 + ring * 6, 118 - ring * 8, spread)),
        bend: deg(lerp(-18, 6, spread)),
        length: (lerp(20, 30, budP) + jitter(idx, 2) * 3) * lerp(1, 0.85, spread),
        width: 11 + jitter(idx, 3) * 2,
        profile: bractProfile,
      }
      const g = petalGeometry(spec, cam, 6)
      items.push({ depth: g.depth - 0.4, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `b${idx}`, style: BRACT_STYLE })
    }
  }
  if (splitP > 0.02) {
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < RAYS_PER_LAYER; i++) {
        const idx = layer * RAYS_PER_LAYER + i
        const phi = ((i + layer * 0.5) / RAYS_PER_LAYER) * Math.PI * 2 + jitter(idx, 4) * 0.12
        const delay = layer * 0.07 + (i % 3) * 0.04 + (jitter(idx, 5) + 0.5) * 0.06
        const local = ease(clamp((openP - delay) / 0.86))
        const emerge = ease(clamp(splitP * 1.15 - layer * 0.15))
        const spec: PetalSpec = {
          base: [Math.cos(phi) * discR * 0.8, 0, Math.sin(phi) * discR * 0.8],
          phi,
          tilt: deg(lerp(8, 80, local) + jitter(idx, 6) * 8 - layer * 3),
          bend: deg(lerp(-3, 10, local) + jitter(idx, 7) * 8),
          length: lerp(16, 50 - layer * 5, emerge) * (1 + jitter(idx, 8) * 0.14),
          width: lerp(8, 13, emerge) * (1 + jitter(idx, 9) * 0.12),
          profile: rayProfile,
          twist: jitter(idx, 10) * 0.7,
        }
        const g = petalGeometry(spec, cam, 8)
        items.push({ depth: g.depth + layer * 0.15, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `r${idx}`, style: RAY_STYLE })
      }
    }
  }
  items.sort((a, b) => a.depth - b.depth)
  const behind = items.filter((it) => it.depth < 0.5)
  const front = items.filter((it) => it.depth >= 0.5)

  const c0 = project([0, 0, 0], cam)
  const rx = discR * scale
  const ry = Math.max(0.6, rx * Math.sin(cam.elev))
  const dome = project([0, domeH, 0], cam)
  const florets: { x: number; y: number; depth: number; opened: boolean; k: number }[] = []
  if (openP > 0.1) {
    for (let k = 0; k < FLORETS; k++) {
      const r = discR * Math.sqrt((k + 0.5) / FLORETS)
      const th = k * 2.399963
      const h = domeH * (1 - Math.pow(r / discR, 2)) + 0.5
      const p3: V3 = [Math.cos(th) * r, h, Math.sin(th) * r]
      const pr = project(p3, cam)
      florets.push({ x: pr[0], y: pr[1], depth: pr[2], opened: r / discR >= 1 - discP * 0.4, k })
    }
    florets.sort((a, b) => a.depth - b.depth)
  }

  const leafP1 = leafGrowth(progress, 0.14, 0.28)
  const leafP2 = leafGrowth(progress, 0.22, 0.28)
  const heartLeaf = (nodeY: number, side: -1 | 1, p: number, id: string) => {
    if (p < 0.03) return null
    const L = 82 * p
    const x0 = 200
    const tipX = x0 + side * L
    const tipY = nodeY - L * 0.38
    const d = `M ${x0} ${nodeY} C ${x0 + side * L * 0.1} ${nodeY - L * 0.4}, ${x0 + side * L * 0.55} ${nodeY - L * 0.62}, ${tipX} ${tipY} C ${x0 + side * L * 0.95} ${nodeY - L * 0.02}, ${x0 + side * L * 0.5} ${nodeY + L * 0.22}, ${x0} ${nodeY} Z`
    return (
      <g key={id}>
        <path d={d} fill="#6a8f4c" stroke="#43653a" strokeWidth="0.9" />
        <path d={`M ${x0} ${nodeY} C ${x0 + side * L * 0.4} ${nodeY - L * 0.2}, ${x0 + side * L * 0.7} ${nodeY - L * 0.3}, ${tipX} ${tipY}`} fill="none" stroke="#3d5c32" strokeWidth="0.8" opacity="0.7" />
      </g>
    )
  }

  return (
    <g className="flower-sunflower" aria-hidden="true">
      <Stem topY={topY} width={6} dark="#46633a" light={def.palette.stem} sway={5} />
      {heartLeaf(GROUND_Y - 60, -1, leafP1, "l1")}
      {heartLeaf(GROUND_Y - 120, 1, leafP2, "l2")}
      <LanceLeaf nodeY={GROUND_Y - 180} side={-1} p={leafGrowth(progress, 0.28, 0.24)} length={52} width={11} fill="#7da060" stroke="#43653a" />
      {progress > 0.34 && (
        <>
          <PetalItems items={behind} uid={uid} />
          {openP > 0.1 && (
            <g>
              <ellipse cx={c0[0]} cy={c0[1]} rx={rx} ry={ry} fill="#4a2f14" />
              <ellipse cx={dome[0]} cy={dome[1]} rx={rx * 0.94} ry={Math.max(0.6, ry * 0.94)} fill={`url(#${uid}-disc)`} />
              <defs>
                <radialGradient id={`${uid}-disc`} cx="45%" cy="40%" r="70%">
                  <stop offset="0" stopColor="#7b5426" />
                  <stop offset="0.65" stopColor="#5a3a18" />
                  <stop offset="1" stopColor="#3f2a12" />
                </radialGradient>
              </defs>
              {florets.map((f) => (
                <circle key={f.k} cx={f.x} cy={f.y} r={Math.max(0.7, 1.7 * scale)} fill={f.opened ? "#e0a62a" : "#6d4a21"} stroke={f.opened ? "#9b6a0e" : "#3c2710"} strokeWidth="0.3" />
              ))}
            </g>
          )}
          <PetalItems items={front} uid={uid} />
        </>
      )}
    </g>
  )
}
