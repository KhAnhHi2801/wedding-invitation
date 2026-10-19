/**
 * Client gọi Google Apps Script (xem docs/wishes-setup.md): ghi xác nhận tham dự (RSVP) và lời chúc, đọc lời chúc.
 * Hợp đồng với `apps-script/wishes.gs`:
 *   POST text/plain (tránh preflight; Apps Script không hỗ trợ OPTIONS), body JSON
 *   RSVP: { kind: "rsvp", name, attending: "yes"|"no", guests, note, guest, website, token, elapsedMs }
 *   trả { ok: true } hoặc { ok: false, error: "invalid"|"name_required"|"rate_limited"|"too_fast"|"server" }
 */

export type ApiErrorCode = "unavailable" | "offline" | "rate_limited" | "too_fast" | "invalid" | "server"

export class ApiError extends Error {
  readonly code: ApiErrorCode
  constructor(code: ApiErrorCode) {
    super(code)
    this.code = code
  }
}

const ENDPOINT = (import.meta.env.VITE_WISHES_ENDPOINT ?? "").trim()
const WRITE_TIMEOUT_MS = 15_000
/** Mã lỗi nội dung của `wishes.gs` */
const PERMANENT_ERRORS: ReadonlySet<string> = new Set([
  "invalid",
  "name_required",
  "name_too_long",
  "message_too_short",
  "message_too_long",
  "note_too_long",
])

/** Khách điền form nhanh hơn 3 giây kể từ lúc mở trang bị coi là bot (khớp `MIN_FILL_MS` của script). */
const pageOpenedAt = performance.now()

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

let sessionToken = ""

/** Mã trình duyệt ẩn danh để script giới hạn số lần gửi; chỉ giảm spam, không phải bảo mật. */
function clientToken(): string {
  try {
    const stored = localStorage.getItem("wedding-token")
    if (stored) return stored
    const created = newId()
    localStorage.setItem("wedding-token", created)
    return created
  } catch {
    return (sessionToken ||= newId())
  }
}

export const isApiConfigured = (): boolean => ENDPOINT.length > 0

interface ApiResponse {
  ok?: boolean
  error?: string
}

async function post(payload: Record<string, unknown>): Promise<void> {
  if (!ENDPOINT) throw new ApiError("unavailable")

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), WRITE_TIMEOUT_MS)
  let data: ApiResponse
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...payload,
        token: clientToken(),
        // Lời chúc nằm chờ trong hàng đợi giữ mốc lúc khách bấm gửi; không bao giờ nhỏ hơn thời gian đã mở trang
        elapsedMs: Math.max(Number(payload.elapsedMs) || 0, Math.round(performance.now() - pageOpenedAt)),
      }),
      signal: controller.signal,
    })
    data = (await response.json()) as ApiResponse
  } catch {
    throw new ApiError("offline")
  } finally {
    window.clearTimeout(timer)
  }

  if (data.ok) return
  if (data.error === "rate_limited") throw new ApiError("rate_limited")
  if (data.error === "too_fast") throw new ApiError("too_fast")
  // Mọi lỗi nội dung là vĩnh viễn (gửi lại vẫn bị từ chối): không được coi là lỗi máy chủ tạm thời, kẻo kẹt hàng đợi
  if (typeof data.error === "string" && PERMANENT_ERRORS.has(data.error)) throw new ApiError("invalid")
  throw new ApiError("server")
}

export interface RsvpPayload {
  name: string
  attending: "yes" | "no"
  guests: number
  note: string
  /** Tên khách trong link mời (`?to=`), giúp chủ nhà biết ai gửi từ link nào */
  guest: string
  /** Ô bẫy bot: người thật luôn để trống */
  website: string
}

export const sendRsvp = (payload: RsvpPayload): Promise<void> => post({ ...payload, kind: "rsvp" })

/* ------------------- Lời chúc: gửi ngầm có hàng đợi, đọc có phân trang ------------------- */

export interface WishInput {
  name: string
  message: string
  /** id loài hoa khách chọn (một trong `FLOWER_IDS` của wishes.gs) */
  flower: string
  /** khóa màu chữ (xem `wish-style.ts`), có thể rỗng */
  ink: string
}

export interface PublicWish extends WishInput {
  /** Rỗng với lời chúc của chính khách vừa gửi trong phiên này (chưa có id từ Sheet) */
  id: string
}

interface PendingWish extends WishInput {
  requestId: string
  /** Bản ghi lúc khách bấm gửi, để script không coi là điền quá nhanh khi gửi lại muộn */
  elapsedMs: number
}

const PENDING_KEY = "wedding-pending-wishes"
const RETRY_DELAYS_MS = [3_000, 10_000, 30_000, 90_000]
/** Lỗi tạm thời (mất mạng, máy chủ bận, hết lượt, gửi hơi nhanh): giữ lại gửi sau. Lỗi còn lại là lời chúc không hợp lệ: bỏ. */
const RETRYABLE: ReadonlySet<ApiErrorCode> = new Set(["offline", "rate_limited", "too_fast", "server"])

function readPending(): PendingWish[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]")
    return Array.isArray(list) ? (list as PendingWish[]) : []
  } catch {
    return []
  }
}

let memoryPending: PendingWish[] = []
let flushing = false
let retryTimer = 0
let attempt = 0

const pending = (): PendingWish[] => (memoryPending.length ? memoryPending : readPending())

function savePending(list: PendingWish[]) {
  memoryPending = list
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list))
  } catch {
    // Chế độ riêng tư: hàng đợi chỉ sống trong phiên này
  }
}

function scheduleRetry() {
  window.clearTimeout(retryTimer)
  const delay = RETRY_DELAYS_MS[Math.min(attempt++, RETRY_DELAYS_MS.length - 1)]
  retryTimer = window.setTimeout(() => void flushPending(), delay)
}

async function flushPending(): Promise<void> {
  // Chưa nối Google Sheet: giữ nguyên hàng đợi (không gọi mạng, không hẹn giờ thử lại), nối xong sẽ gửi ở lần mở sau
  if (flushing || !ENDPOINT) return
  flushing = true
  try {
    // Lấy từng lời chúc ở đầu hàng đợi (kể cả lời chúc mới được thêm trong lúc đang gửi) cho tới khi hết
    for (let entry = pending()[0]; entry; entry = pending()[0]) {
      try {
        await post({ ...entry })
      } catch (error) {
        if (error instanceof ApiError && RETRYABLE.has(error.code)) {
          scheduleRetry()
          return
        }
      }
      // Gửi xong hoặc bị từ chối hẳn: bỏ khỏi hàng đợi rồi gửi tiếp lời chúc sau
      savePending(pending().filter((item) => item.requestId !== entry.requestId))
      attempt = 0
    }
  } finally {
    flushing = false
  }
}

/**
 * Nhận một lời chúc đã hợp lệ và gửi lên Sheet ở chế độ chạy ngầm: trả về ngay, không chờ máy chủ.
 * Lời chúc nằm trong hàng đợi (lưu ở trình duyệt) cho đến khi gửi được, nên mạng yếu hoặc đóng trang giữa chừng thì
 * lần mở sau vẫn gửi tiếp. Mỗi lời chúc có `requestId` riêng nên gửi lại không bị ghi trùng.
 */
export function submitWish(input: WishInput): void {
  savePending([...pending(), { ...input, requestId: newId(), elapsedMs: Math.round(performance.now() - pageOpenedAt) }])
  attempt = 0
  void flushPending()
}

if (typeof window !== "undefined" && ENDPOINT) {
  window.addEventListener("online", () => {
    attempt = 0
    void flushPending()
  })
  // Gửi nốt lời chúc còn kẹt từ lần mở trước, chờ một chút để không tranh băng thông với lúc tải thiệp
  window.setTimeout(() => void flushPending(), 4_000)
}

const PAGE_SIZE = 50
const MAX_PAGES = 8 // tối đa 400 lời chúc; nhiều hơn thì chỉ lấy 400 lời mới nhất
const READ_TIMEOUT_MS = 12_000

interface WishPage {
  ok?: boolean
  items?: unknown
  nextCursor?: unknown
}

const asText = (value: unknown): string => (typeof value === "string" ? value : "")

/**
 * Toàn bộ lời chúc đang hiện công khai, mới nhất trước (đọc từng trang theo con trỏ của Apps Script).
 * Lỗi giữa chừng thì trả những gì đã đọc được; chưa nối Sheet thì trả danh sách rỗng.
 */
export async function fetchWishes(): Promise<PublicWish[]> {
  if (!ENDPOINT) return []
  const wishes: PublicWish[] = []
  let cursor = ""
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const query = `?limit=${PAGE_SIZE}${cursor ? `&before=${encodeURIComponent(cursor)}` : ""}`
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), READ_TIMEOUT_MS)
      let data: WishPage
      try {
        data = (await (await fetch(`${ENDPOINT}${query}`, { signal: controller.signal })).json()) as WishPage
      } finally {
        window.clearTimeout(timer)
      }
      if (!data.ok || !Array.isArray(data.items)) break
      for (const item of data.items as Record<string, unknown>[]) {
        const name = asText(item?.name)
        const message = asText(item?.message)
        if (name && message) {
          wishes.push({ id: asText(item.id), name, message, flower: asText(item.flower), ink: asText(item.ink) })
        }
      }
      if (typeof data.nextCursor !== "string" || !data.nextCursor) break
      cursor = data.nextCursor
    }
  } catch {
    // giữ phần đã đọc được
  }
  return wishes
}
