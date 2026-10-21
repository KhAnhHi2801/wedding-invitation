/**
 * Bộ dựng cánh hoa có chiều sâu 3D đơn giản: mỗi cánh có điểm gốc, hướng quanh trục đứng, góc nghiêng, độ cong và
 * hình dáng bề rộng dọc theo chiều dài. Cánh được lấy mẫu thành các điểm 3D rồi chiếu xuống màn hình, nên khi góc
 * nghiêng đổi (từ dựng đứng sang xòe ngang) hình cánh tự thu ngắn và đổi dạng như hoa thật.
 * Hệ tọa độ: x sang phải, y hướng lên, z hướng về phía người xem.
 */
export type V3 = [number, number, number]
export type V2 = [number, number]

export interface Camera {
  /** Góc nhìn từ trên xuống (radian): 0 là nhìn ngang, π/2 là nhìn thẳng từ trên xuống */
  elev: number
  cx: number
  cy: number
  scale: number
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
export const deg = (d: number) => (d * Math.PI) / 180

/** Chiếu một điểm 3D xuống màn hình; phần tử thứ ba là độ sâu (lớn hơn = gần người xem hơn). */
export function project(p: V3, cam: Camera): [number, number, number] {
  const ce = Math.cos(cam.elev)
  const se = Math.sin(cam.elev)
  const up = p[1] * ce - p[2] * se
  const depth = p[2] * ce + p[1] * se
  return [cam.cx + p[0] * cam.scale, cam.cy - up * cam.scale, depth]
}

export interface PetalSpec {
  base: V3
  /** Góc quanh trục đứng (radian) */
  phi: number
  /** Góc nghiêng so với trục đứng ở gốc cánh (0 = dựng đứng, π/2 = nằm ngang, > π/2 = cụp xuống) */
  tilt: number
  /** Độ cong thêm dọc theo cánh (radian ở ngọn); dương là cong ra ngoài, âm là cong vào trong */
  bend: number
  length: number
  width: number
  /** Bề rộng tương đối (0 đến 1) theo vị trí dọc cánh s (0 ở gốc, 1 ở ngọn) */
  profile: (s: number) => number
  /** Xoắn nhẹ cánh quanh trục của nó (radian), làm đầu cánh lệch ngang */
  twist?: number
  /**
   * Mép đầu cánh khía: đầu cánh được bo tròn tự động rồi mỗi điểm cộng thêm độ nhô ra phía trước (theo tỉ lệ chiều dài)
   * tại các điểm rải đều ngang đầu cánh từ trái sang phải, ví dụ [0.05, -0.06, 0.05] cho đầu cánh lõm giữa như cánh anh
   * đào, hoặc 5 điểm xen kẽ cho cánh cosmos có răng. Hình dáng bề rộng nên kết thúc ở khoảng 0,7 đến 1 khi dùng tùy chọn này.
   */
  tip?: number[]
}

export interface PetalGeometry {
  d: string
  base2: V2
  tip2: V2
  mid2: V2
  /** Độ sâu trung bình để sắp xếp vẽ trước sau */
  depth: number
  /** Đường gân giữa cánh */
  vein: string
}

/** Catmull-Rom sang đường Bezier mượt đi qua các điểm. */
export function smoothThrough(points: V2[], closed = false): string {
  const n = points.length
  if (n < 2) return ""
  const at = (i: number) => points[closed ? (i + n) % n : clamp(i, 0, n - 1) * 1]
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1: V2 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: V2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return closed ? `${d} Z` : d
}

/** Dựng đường viền một cánh đã chiếu xuống màn hình. */
export function petalGeometry(spec: PetalSpec, cam: Camera, samples = 9): PetalGeometry {
  const { base, phi, tilt, bend, length, width, profile, twist = 0 } = spec
  const step = length / samples
  const center: V3[] = [base]
  let depthSum = 0
  for (let k = 0; k < samples; k++) {
    const s = (k + 0.5) / samples
    const t = tilt + bend * s
    const dir: V3 = [Math.sin(t) * Math.cos(phi), Math.cos(t), Math.sin(t) * Math.sin(phi)]
    const prev = center[k]
    center.push([prev[0] + dir[0] * step, prev[1] + dir[1] * step, prev[2] + dir[2] * step])
  }
  // Vectơ ngang cánh (tiếp tuyến quanh trục đứng), xoay thêm theo độ xoắn dần về ngọn
  const left: V2[] = []
  const right: V2[] = []
  const centre2: V2[] = []
  let endFrame: { c: V3; u: V3; dir: V3; w: number } | null = null
  for (let k = 0; k <= samples; k++) {
    const s = k / samples
    const w = (width * profile(s)) / 2
    const ang = phi + Math.PI / 2 + twist * s
    const u: V3 = [Math.cos(ang), 0, Math.sin(ang)]
    // Cho vectơ ngang vuông góc với hướng cánh: bỏ thành phần dọc theo hướng cánh
    const t = tilt + bend * Math.min(1, s)
    const dir: V3 = [Math.sin(t) * Math.cos(phi), Math.cos(t), Math.sin(t) * Math.sin(phi)]
    const dot = u[0] * dir[0] + u[1] * dir[1] + u[2] * dir[2]
    const ux = u[0] - dir[0] * dot
    const uy = u[1] - dir[1] * dot
    const uz = u[2] - dir[2] * dot
    const len = Math.hypot(ux, uy, uz) || 1
    const c = center[k]
    const l = project([c[0] + (ux / len) * w, c[1] + (uy / len) * w, c[2] + (uz / len) * w], cam)
    const r = project([c[0] - (ux / len) * w, c[1] - (uy / len) * w, c[2] - (uz / len) * w], cam)
    const m = project(c, cam)
    if (k === samples) endFrame = { c, u: [ux / len, uy / len, uz / len], dir, w }
    left.push([l[0], l[1]])
    right.push([r[0], r[1]])
    centre2.push([m[0], m[1]])
    depthSum += m[2]
  }
  // Điểm khía ở đầu cánh (nếu có), rải từ bên trái sang bên phải giữa hai mép
  const tipPts: V2[] = []
  if (spec.tip && endFrame) {
    const { c, u, dir, w } = endFrame
    const m = spec.tip.length
    spec.tip.forEach((off, j) => {
      const lateral = 1 - (2 * (j + 1)) / (m + 1)
      // Mũ tròn của đầu cánh (nửa elip) cộng thêm độ nhô của từng điểm khía
      const forward = Math.sqrt(Math.max(0, 1 - lateral * lateral)) * w * 0.9 + off * length
      const q = project(
        [c[0] + u[0] * w * lateral + dir[0] * forward, c[1] + u[1] * w * lateral + dir[1] * forward, c[2] + u[2] * w * lateral + dir[2] * forward],
        cam,
      )
      tipPts.push([q[0], q[1]])
    })
  }
  const outline = [...left, ...tipPts, ...right.slice().reverse()]
  const mid = project(center[Math.floor(samples / 2)], cam)
  return {
    d: smoothThrough(outline, true),
    base2: centre2[0],
    tip2: centre2[samples],
    mid2: [mid[0], mid[1]],
    depth: depthSum / (samples + 1),
    vein: smoothThrough(centre2.slice(0, samples), false),
  }
}
