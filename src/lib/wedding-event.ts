import { weddingConfig, type EventInfo, type TimelineItem, type WeddingConfig } from "../config/wedding-config"

export type Side = "groom" | "bride"

export interface ResolvedEvent {
  /** Bên khách được mời; `null` khi link không có `from` hợp lệ (dùng bên mặc định `defaultSide`) */
  side: Side | null
  event: EventInfo
  timeline: TimelineItem[]
}

const isSide = (value: string | null): value is Side => value === "groom" || value === "bride"

/**
 * Chọn thông tin sự kiện theo query `from` (ví dụ `?from=bride`). Giá trị lạ hoặc thiếu thì dùng bên `defaultSide`,
 * không báo lỗi để link hỏng vẫn mở được thiệp.
 */
export function resolveWeddingEvent(config: WeddingConfig, search: string): ResolvedEvent {
  const raw = new URLSearchParams(search).get(config.sideParam)?.trim().toLowerCase() ?? null
  const side = isSide(raw) ? raw : null
  const { timeline, ...event } = config.sides[side ?? config.defaultSide]
  return { side, event, timeline }
}

let cached: ResolvedEvent | undefined

/** Query không đổi trong một lần xem trang nên tính một lần; mọi section dùng chung kết quả. */
export function getWeddingEvent(): ResolvedEvent {
  cached ??= resolveWeddingEvent(weddingConfig, window.location.search)
  return cached
}
