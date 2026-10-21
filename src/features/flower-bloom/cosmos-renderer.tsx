import { useId } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { PetalItems, Stem } from "./flower-draw"
import { GROUND_Y, jitter, leafGrowth, type DrawItem, type PetalStyle } from "./flower-draw-utils"
import { clamp, deg, ease, easeOutCubic, lerp, petalGeometry, project, type Camera, type PetalSpec, type V3 } from "./petal-3d"

const HEAD_Y = 168
const PETALS = 8
const SEPALS = 8
const FLORETS = 40

const PETAL_STYLE: PetalStyle = { stops: [[0, "#a93f66"], [0.4, "#cf6d91"], [1, "#eaa2bb"]], stroke: "#9a3f5f", strokeWidth: 0.8, vein: "#b8587a" }
const SEPAL_STYLE: PetalStyle = { stops: [[0, "#5d8247"], [1, "#9fbd74"]], stroke: "#46663a", strokeWidth: 0.7, vein: "#3f5c33", veinWidth: 0.5 }

/** Cánh cosmos rộng, đầu bầu; phần đầu có răng nên mép đầu cánh được khía riêng. */
const petalProfile = (s: number) => (s < 0.7 ? 0.22 + 0.78 * Math.sin((Math.PI / 2) * (s / 0.7)) : 0.62 + 0.38 * Math.cos((Math.PI / 2) * ((s - 0.7) / 0.3)))
const sepalProfile = (s: number) => Math.max(0.04, Math.sin(Math.PI * Math.pow(s, 0.8)))

/**
 * Cosmos nở theo trình tự thật: nụ xanh tròn bọc bởi lá đài; nụ nứt để lộ màu hồng; tám cánh còn gấp nhăn nhú ra và ôm
 * thành cốc; cánh xòe dần thành đĩa phẳng, các cánh bầu chồng lên nhau, đầu cánh có ba răng; tâm vàng nhỏ lộ ra.
 */
export function CosmosBloom({ progress, def }: { progress: number; def: FlowerDefinition }) {
  const uid = useId().replace(/:/g, "")
  if (progress < 0.08) return null

  const stemP = easeOutCubic(clamp((progress - 0.08) / 0.4))
  const topY = GROUND_Y - (GROUND_Y - HEAD_Y) * stemP
  const budP = ease(clamp((progress - 0.34) / 0.18))
  const splitP = ease(clamp((progress - 0.5) / 0.14))
  const openP = ease(clamp((progress - 0.56) / 0.4))
  const faceP = ease(clamp((progress - 0.6) / 0.38))
  const scale = lerp(0.45, 1.05, budP)
  const cam: Camera = { elev: deg(lerp(5, 60, faceP)), cx: 200, cy: topY, scale }
  const discR = lerp(5, 11, openP)

  const items: DrawItem[] = []
  for (let i = 0; i < SEPALS; i++) {
    const phi = (i / SEPALS) * Math.PI * 2 + jitter(i, 1) * 0.15
    const spread = ease(clamp((openP - 0.05) / 0.8))
    const spec: PetalSpec = {
      base: [Math.cos(phi) * 5, -3, Math.sin(phi) * 5],
      phi,
      tilt: deg(lerp(18, 112, spread)),
      bend: deg(lerp(-22, 4, spread)),
      length: lerp(15, 20, budP) * lerp(1, 0.8, spread),
      width: 8 + jitter(i, 2) * 1.2,
      profile: sepalProfile,
    }
    const g = petalGeometry(spec, cam, 6)
    items.push({ depth: g.depth - 0.4, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `s${i}`, style: SEPAL_STYLE })
  }
  if (splitP > 0.02) {
    for (let i = 0; i < PETALS; i++) {
      const phi = (i / PETALS) * Math.PI * 2 + jitter(i, 3) * 0.1
      const delay = (i % 2) * 0.06 + (jitter(i, 4) + 0.5) * 0.06
      const local = ease(clamp((openP - delay) / 0.86))
      const emerge = ease(clamp(splitP * 1.15 - (i % 2) * 0.12))
      const spec: PetalSpec = {
        base: [Math.cos(phi) * discR * 0.5, 0, Math.sin(phi) * discR * 0.5],
        phi,
        tilt: deg(lerp(10, 86, local) + jitter(i, 5) * 6),
        bend: deg(lerp(-6, 8, local) + jitter(i, 6) * 5),
        length: lerp(12, 50, emerge) * (1 + jitter(i, 7) * 0.1),
        width: lerp(8, 30, emerge) * (1 + jitter(i, 8) * 0.08),
        profile: petalProfile,
        twist: jitter(i, 9) * 0.6 * (1 - local * 0.5),
        tip: [0.05, -0.03, 0.06, -0.03, 0.05],
      }
      const g = petalGeometry(spec, cam, 10)
      items.push({ depth: g.depth, d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, key: `p${i}`, style: PETAL_STYLE })
    }
  }
  items.sort((a, b) => a.depth - b.depth)
  const behind = items.filter((it) => it.depth < 0.4)
  const front = items.filter((it) => it.depth >= 0.4)

  const c0 = project([0, 0, 0], cam)
  const rx = discR * scale
  const ry = Math.max(0.5, rx * Math.sin(cam.elev))
  const florets: { x: number; y: number; depth: number; k: number }[] = []
  if (openP > 0.15) {
    for (let k = 0; k < FLORETS; k++) {
      const r = discR * Math.sqrt((k + 0.5) / FLORETS)
      const th = k * 2.399963
      const pr = project([Math.cos(th) * r, 1.2 * (1 - Math.pow(r / discR, 2)) + 0.4, Math.sin(th) * r] as V3, cam)
      florets.push({ x: pr[0], y: pr[1], depth: pr[2], k })
    }
    florets.sort((a, b) => a.depth - b.depth)
  }

  // Lá cosmos mảnh như sợi: một trục chính và các sợi nhỏ hai bên
  const feather = (nodeY: number, side: -1 | 1, p: number, id: string) => {
    if (p < 0.04) return null
    const L = 66 * p
    const x0 = 200
    const tipX = x0 + side * L
    const tipY = nodeY - L * 0.55
    const main = `M ${x0} ${nodeY} Q ${x0 + side * L * 0.6} ${nodeY - L * 0.2}, ${tipX} ${tipY}`
    const barbs = [0.25, 0.42, 0.58, 0.74].flatMap((t, j) => {
      const bx = x0 + side * L * t
      const by = nodeY - L * 0.55 * t - Math.sin(t * 3) * 3
      const bl = L * (0.2 - 0.03 * j)
      return [
        `M ${bx} ${by} q ${side * bl * 0.2} ${-bl * 0.9}, ${side * bl * 0.1} ${-bl}`,
        `M ${bx} ${by} q ${side * bl * 0.85} ${bl * 0.1}, ${side * bl} ${-bl * 0.15}`,
      ]
    })
    return (
      <g key={id} fill="none" stroke="#5f8a4a" strokeLinecap="round">
        <path d={main} strokeWidth="1.6" />
        {barbs.map((b, i) => (
          <path key={i} d={b} strokeWidth="1" />
        ))}
      </g>
    )
  }

  return (
    <g className="flower-cosmos" aria-hidden="true">
      <Stem topY={topY} width={3.2} dark="#4a6a3a" light={def.palette.stem} sway={6} />
      {feather(GROUND_Y - 60, -1, leafGrowth(progress, 0.14, 0.26), "f1")}
      {feather(GROUND_Y - 120, 1, leafGrowth(progress, 0.2, 0.26), "f2")}
      {feather(GROUND_Y - 175, -1, leafGrowth(progress, 0.26, 0.24), "f3")}
      {progress > 0.34 && (
        <>
          <PetalItems items={behind} uid={uid} />
          {openP > 0.15 && (
            <g>
              <ellipse cx={c0[0]} cy={c0[1]} rx={rx} ry={ry} fill="#c98f1c" />
              {florets.map((f) => (
                <circle key={f.k} cx={f.x} cy={f.y} r={Math.max(0.6, 1.4 * scale)} fill="#f0c43c" stroke="#a87012" strokeWidth="0.3" />
              ))}
            </g>
          )}
          <PetalItems items={front} uid={uid} />
        </>
      )}
    </g>
  )
}
