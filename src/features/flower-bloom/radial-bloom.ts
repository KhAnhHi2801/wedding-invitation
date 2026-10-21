import { jitter, type DrawItem, type PetalStyle } from "./flower-draw-utils"
import { clamp, deg, ease, lerp, petalGeometry, type Camera, type PetalSpec } from "./petal-3d"

/** Một vòng cánh quanh trục đứng: số cánh, độ nghiêng lúc đóng và lúc mở, kích thước, hình dáng, kiểu tô, độ trễ mở. */
export interface RingSpec {
  count: number
  /** Lệch góc của vòng so với vòng khác (0 đến 1 của khoảng giữa hai cánh liền kề) */
  phase: number
  baseR: number
  baseY?: number
  /** [lúc đóng, lúc mở] tính bằng độ */
  tilt: [number, number]
  bend: [number, number]
  /** [lúc mới nhú, đầy đủ] */
  length: [number, number]
  width: [number, number]
  profile: (s: number) => number
  tip?: number[]
  style: PetalStyle
  /** Độ trễ bắt đầu mở (theo tiến trình mở 0 đến 1) và thời lượng mở */
  delay: number
  span?: number
  /** Độ trễ nhú ra khỏi nụ */
  emergeDelay?: number
  twist?: number
  tiltJitter?: number
  samples?: number
  depthBias?: number
}

/** Các mốc tiến trình chuẩn của một bông hoa: thân, nụ lớn dần, đầu nụ tách, cánh mở, hoa quay mặt về người xem. */
export interface Timeline {
  stemP: number
  budP: number
  splitP: number
  openP: number
  faceP: number
}

type Range = [number, number]

export function timeline(
  progress: number,
  o: Partial<{ stem: Range; bud: Range; split: Range; open: Range; face: Range }> = {},
): Timeline {
  const seg = ([a, b]: Range) => clamp((progress - a) / (b - a))
  const stem = o.stem ?? [0.08, 0.48]
  const t = (x: number) => 1 - Math.pow(1 - x, 3)
  return {
    stemP: t(seg(stem)),
    budP: ease(seg(o.bud ?? [0.34, 0.52])),
    splitP: ease(seg(o.split ?? [0.5, 0.64])),
    openP: ease(seg(o.open ?? [0.56, 0.96])),
    faceP: ease(seg(o.face ?? [0.6, 0.98])),
  }
}

/** Dựng toàn bộ cánh của các vòng đã chiếu xuống màn hình (chưa sắp độ sâu). */
export function ringItems(rings: RingSpec[], cam: Camera, t: { open: number; emerge: number }, key: string): DrawItem[] {
  const items: DrawItem[] = []
  rings.forEach((r, ri) => {
    const local = ease(clamp((t.open - r.delay) / (r.span ?? 0.75)))
    const grow = ease(clamp(t.emerge * 1.15 - (r.emergeDelay ?? 0)))
    for (let i = 0; i < r.count; i++) {
      const idx = ri * 53 + i
      const phi = ((i + r.phase) / r.count) * Math.PI * 2 + jitter(idx, 1) * 0.1
      const spec: PetalSpec = {
        base: [Math.cos(phi) * r.baseR, r.baseY ?? 0, Math.sin(phi) * r.baseR],
        phi,
        tilt: deg(lerp(r.tilt[0], r.tilt[1], local) + jitter(idx, 2) * (r.tiltJitter ?? 5)),
        bend: deg(lerp(r.bend[0], r.bend[1], local) + jitter(idx, 3) * 4),
        length: lerp(r.length[0], r.length[1], grow) * (1 + jitter(idx, 4) * 0.1),
        width: lerp(r.width[0], r.width[1], grow) * (1 + jitter(idx, 5) * 0.1),
        profile: r.profile,
        tip: r.tip,
        twist: jitter(idx, 6) * (r.twist ?? 0.4),
      }
      const g = petalGeometry(spec, cam, r.samples ?? 8)
      items.push({ key: `${key}${ri}-${i}`, depth: g.depth + (r.depthBias ?? 0), d: g.d, vein: g.vein, base2: g.base2, tip2: g.tip2, style: r.style })
    }
  })
  return items
}

/** Lá bắc / lá đài nhọn quanh gốc hoa: bọc kín nụ rồi lật xuống khi hoa nở. */
export const sepalProfile = (s: number) => Math.max(0.04, Math.sin(Math.PI * Math.pow(s, 0.8)) * (1 - 0.2 * s))
