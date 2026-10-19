import { weddingConfig, type EventInfo, type TimelineItem, type WeddingConfig } from "../config/wedding-config"

export type Side = "groom" | "bride"

export interface ResolvedEvent {
  /** Bên khách được mời; `null` khi link không có `from` hợp lệ (dùng thông tin mặc định) */
  side: Side | null
  event: EventInfo
  timeline: TimelineItem[]
}

const isSide = (value: string | null): value is Side => value === "groom" || value === "bride"

/**
 * Chọn thông tin sự kiện theo query `from` (ví dụ `?from=bride`): trường nào bên đó không ghi riêng thì lấy mặc định.
 * Giá trị lạ hoặc thiếu thì dùng mặc định, không báo lỗi để link hỏng vẫn mở được thiệp.
 */
export function resolveWeddingEvent(config: WeddingConfig, search: string): ResolvedEvent {
  const raw = new URLSearchParams(search).get(config.sideParam)?.trim().toLowerCase() ?? null
  const side = isSide(raw) ? raw : null
  if (!side) return { side, event: config.event, timeline: config.timeline }
  const { timeline, ...eventOverride } = config.sides[side]
  return { side, event: { ...config.event, ...eventOverride }, timeline: timeline ?? config.timeline }
}

let cached: ResolvedEvent | undefined

/** Query không đổi trong một lần xem trang nên tính một lần; mọi section dùng chung kết quả. */
export function getWeddingEvent(): ResolvedEvent {
  cached ??= resolveWeddingEvent(weddingConfig, window.location.search)
  return cached
}
