import { clamp, easeOutCubic, type V2 } from "./petal-3d"

export const GROUND_Y = 430

/** Kiểu tô một cánh: dải màu từ gốc tới ngọn, màu viền và gân giữa. */
export interface PetalStyle {
  stops: [number, string][]
  stroke: string
  strokeWidth: number
  vein?: string
  veinWidth?: number
}

/** Một phần tử đã chiếu xuống màn hình, sẵn sàng sắp theo độ sâu rồi vẽ. */
export interface DrawItem {
  key: string
  depth: number
  d: string
  vein: string
  base2: V2
  tip2: V2
  style: PetalStyle
}

/** Số giả ngẫu nhiên ổn định theo chỉ số: cùng cánh luôn cùng độ lệch giữa các khung hình. */
export const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x) - 0.5
}

/** Trộn hai màu hex (#rrggbb) theo tỉ lệ t từ 0 đến 1. */
export function mixColor(a: string, b: string, t: number): string {
  const k = clamp(t)
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("")}`
}

/** Tiến trình mọc của một lá: bắt đầu tại `start`, kéo dài `span`. */
export const leafGrowth = (progress: number, start: number, span: number) => easeOutCubic(clamp((progress - start) / span))
