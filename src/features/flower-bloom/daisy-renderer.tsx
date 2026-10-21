import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { LanceLeaf, PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, type DrawItem, type PetalStyle } from "./flower-draw-utils"
import { clamp, deg, ease, easeOutCubic, lerp, petalGeometry, project, type Camera, type PetalSpec, type V3 } from "./petal-3d"

interface DaisyProps {
  progress: number
  def: FlowerDefinition
}

const HEAD_Y = 178
const RAYS = 21
const SEPALS_PER_RING = 11
const FLORETS = 52

/** Bề rộng cánh tia cúc: gốc thon, rộng nhất ở khoảng 55% chiều dài, đầu tròn. */
const rayProfile = (s: number) =>
  s < 0.55 ? 0.28 + 0.72 * Math.sin((Math.PI / 2) * (s / 0.55)) : Math.pow(Math.max(0, 1 - Math.pow((s - 0.55) / 0.45, 2)), 0.55)

/** Lá đài nhọn: phình ở giữa rồi thon thành mũi nhọn. */
const sepalProfile = (s: number) => Math.max(0.04, Math.sin(Math.PI * Math.pow(s, 0.8)) * (1 - 0.25 * s))

const RAY_STYLE: PetalStyle = { stops: [[0, "#dfe6c4"], [0.3, "#f6f6ec"], [1, "#ffffff"]], stroke: "#b3ae9a", strokeWidth: 0.8, vein: "#d6d1bd" }
const SEPAL_STYLE: PetalStyle = { stops: [[0, "#5f8247"], [1, "#a8c27c"]], stroke: "#46663a", strokeWidth: 0.7, vein: "#3f5c33", veinWidth: 0.5 }

/**
 * Cúc họa mi nở theo trình tự thật của loài: nụ xanh bọc bởi hai vòng lá đài nhọn, đầu nụ tách để lộ các cánh trắng
 * dựng đứng ôm sát nhau, cánh tách dần thành hình cốc, rồi nghiêng xuống 45 độ, xòe ngang và hơi cụp, trong lúc lá đài
 * lật xuống dưới và đĩa vàng ở tâm hiện ra: các hoa nhỏ ở tâm nở từ vòng ngoài vào trong. Góc nhìn nâng dần từ nhìn
 * ngang sang nhìn từ trên xuống, nên hoa quay mặt về phía người xem như trong ảnh mẫu.
 */
export function DaisyBloom({ progress, def }: DaisyProps) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null

  const stemP = easeOutCubic(clamp((progress - 0.08) / 0.4))
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * stemP
  const budP = ease(clamp((progress - 0.34) / 0.18))
  const splitP = ease(clamp((progress - 0.5) / 0.14)) // đầu nụ tách, cánh trắng nhú lên
  const openP = ease(clamp((progress - 0.56) / 0.4)) // cánh nghiêng dần xuống
  const faceP = ease(clamp((progress - 0.6) / 0.38)) // góc nhìn nâng dần
  const discP = ease(clamp((progress - 0.78) / 0.2)) // hoa nhỏ ở tâm nở từ ngoài vào
  const scale = lerp(0.42, 1, budP)
  const cam: Camera = { elev: deg(lerp(5, 58, faceP)), cx: 200, cy: topY, scale }

  const discR = lerp(6, 19, openP)
  const domeH = lerp(2, 7, openP)
  const items: DrawItem[] = []

  // Hai vòng lá đài (lá bắc): bọc kín nụ, rồi lật xuống khi hoa nở
  for (let ring = 0; ring < 2; ring++) {
    for (let i = 0; i < SEPALS_PER_RING; i++) {
      const idx = ring * SEPALS_PER_RING + i
      const phi = ((i + ring * 0.5) / SEPALS_PER_RING) * Math.PI * 2 + jitter(idx, 1) * 0.2
      const spread = ease(clamp((openP - 0.05 - ring * 0.08) / 0.85))
      const spec: PetalSpec = {
        base: [Math.cos(phi) * 6.5, -3 - ring * 1.5, Math.sin(phi) * 6.5],
        phi,
        tilt: deg(lerp(12 + ring * 5, 112 - ring * 8, spread)),
        bend: deg(lerp(-16, 6, spread)),
        length: (lerp(18, 25, budP) + jitter(idx, 2) * 3) * lerp(1, 0.85, spread),
        width: 9 + jitter(idx, 3) * 1.4,
        profile: sepalProfile,
      }
      const g = petalGeometry(spec, cam, 6)
      items.push({ depth: g.depth - 0.4, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `s${idx}`, style: SEPAL_STYLE })
    }
  }

  // Cánh tia trắng: nhú ra từ trong nụ, dựng đứng ôm nhau, rồi tách ra và xòe ngang
  if (splitP > 0.02) {
    for (let i = 0; i < RAYS; i++) {
      const phi = (i / RAYS) * Math.PI * 2 + jitter(i, 4) * 0.1
      const delay = (i % 3) * 0.05 + (jitter(i, 5) + 0.5) * 0.06
      const local = ease(clamp((openP - delay) / (1 - 0.14)))
      const emerge = ease(clamp(splitP * 1.15 - (i % 2) * 0.12))
      const spec: PetalSpec = {
        base: [Math.cos(phi) * discR * 0.55, 0, Math.sin(phi) * discR * 0.55],
        phi,
        tilt: deg(lerp(7, 84, local) + jitter(i, 6) * 7 + (local > 0.85 ? (local - 0.85) * 40 : 0)),
        bend: deg(lerp(-4, 9, local) + jitter(i, 7) * 6),
        length: lerp(14, 60, emerge) * (1 + jitter(i, 8) * 0.12),
        width: lerp(7, 15.5, emerge) * (1 + jitter(i, 9) * 0.1),
        profile: rayProfile,
        twist: jitter(i, 10) * 0.5,
      }
      const g = petalGeometry(spec, cam, 9)
      items.push({ depth: g.depth, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `r${i}`, style: RAY_STYLE })
    }
  }

  items.sort((a, b) => a.depth - b.depth)
  const discDepth = 0.5
  const behind = items.filter((it) => it.depth < discDepth)
  const front = items.filter((it) => it.depth >= discDepth)

  // Đĩa vàng ở tâm: vòm thấp, các hoa nhỏ xếp xoắn ốc theo góc vàng
  const c0 = project([0, 0, 0], cam)
  const rx = discR * scale
  const ry = Math.max(0.5, rx * Math.sin(cam.elev))
  const dome = project([0, domeH, 0], cam)
  const florets = []
  if (openP > 0.1) {
    for (let k = 0; k < FLORETS; k++) {
      const r = discR * Math.sqrt((k + 0.5) / FLORETS)
      const th = k * 2.399963
      const h = domeH * (1 - Math.pow(r / discR, 2)) + 0.6
      const p3: V3 = [Math.cos(th) * r, h, Math.sin(th) * r]
      const pr = project(p3, cam)
      const opened = r / discR >= 1 - discP * 1.04
      florets.push({ x: pr[0], y: pr[1], depth: pr[2], opened, k })
    }
    florets.sort((a, b) => a.depth - b.depth)
  }

  const leafP1 = leafGrowth(progress, 0.16, 0.26)
  const leafP2 = leafGrowth(progress, 0.24, 0.26)

  return (
    <g className="flower-daisy" aria-hidden="true">
      <Stem topY={topY} width={4} dark="#4f6e3d" light={def.palette.stem} sway={3} />
      <LanceLeaf nodeY={GROUND_Y - 70} side={-1} p={leafP1} length={78} width={14} fill="#6e8f55" stroke="#47663a" />
      <LanceLeaf nodeY={GROUND_Y - 130} side={1} p={leafP2} length={78} width={14} fill="#86a86a" stroke="#47663a" />
      {progress > 0.34 && (
        <>
          <PetalItems items={behind} uid={uid} />
          {openP > 0.1 && (
            <g>
              <ellipse cx={c0[0]} cy={c0[1]} rx={rx} ry={ry} fill="#c9901f" />
              <ellipse cx={dome[0]} cy={dome[1]} rx={rx * 0.92} ry={Math.max(0.5, ry * 0.92)} fill={`url(#${uid}-disc)`} />
              <defs>
                <radialGradient id={`${uid}-disc`} cx="42%" cy="38%" r="70%">
                  <stop offset="0" stopColor="#fbe27a" />
                  <stop offset="0.6" stopColor="#efb832" />
                  <stop offset="1" stopColor="#c98d1c" />
                </radialGradient>
              </defs>
              {florets.map((f) => (
                <circle key={f.k} cx={f.x} cy={f.y} r={Math.max(0.6, 1.5 * scale)} fill={f.opened ? "#e49b14" : "#f1c64a"} stroke={f.opened ? "#9a6208" : "none"} strokeWidth="0.35" />
              ))}
            </g>
          )}
          <PetalItems items={front} uid={uid} />
        </>
      )}
    </g>
  )
}
