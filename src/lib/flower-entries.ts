import { FLOWER_DEFINITIONS } from "../config/flower-botanical"
import { flowerWishes, type FlowerWish } from "../config/flower-wishes"
import type { FlowerDefinition } from "../types/flower"

/** Một loài hoa: hình dáng/màu/thời lượng nở (`def`) ghép với nội dung lời chúc (`wish`) theo `id`. */
export interface FlowerEntry {
  def: FlowerDefinition
  wish: FlowerWish
}

export const FLOWER_ENTRIES: readonly FlowerEntry[] = FLOWER_DEFINITIONS.map((def) => {
  const wish = flowerWishes.find((item) => item.id === def.id)
  if (!wish) throw new Error(`Loài hoa "${def.id}" có hình dáng nhưng thiếu nội dung trong flower-wishes.ts`)
  return { def, wish }
})

/** Băm chuỗi thành số không âm ổn định (FNV-1a), dùng để chọn hoa/vị trí cố định cho cùng một lời chúc. */
export function hashText(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  return hash >>> 0
}

/** Loài hoa theo id; id rỗng hoặc lạ (lời chúc thêm tay vào Sheet) thì chọn cố định theo `seed`. */
export function entryFor(id: string, seed: string): FlowerEntry {
  return FLOWER_ENTRIES.find((entry) => entry.def.id === id) ?? FLOWER_ENTRIES[hashText(seed) % FLOWER_ENTRIES.length]
}
