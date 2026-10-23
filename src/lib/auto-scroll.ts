import { useSyncExternalStore } from "react"
import { weddingConfig } from "../config/wedding-config"

/**
 * Tự cuộn trang xuống chậm như các thiệp cưới online. Dừng hẳn ngay khi khách thao tác (lăn, chạm, bấm, gõ phím); bật lại bằng nút. Tạm nghỉ (không dừng) khi tab ẩn hoặc đang có modal.
 */
let running = false
let raf = 0
let position = 0
let lastTime = 0
// Vị trí cuộn tối đa lưu sẵn: đọc scrollHeight mỗi khung hình ép trình duyệt tính lại layout ngay giữa lúc đang có animation, rất nặng trên điện thoại
let maxScroll = 0
let sizeObserver: ResizeObserver | null = null
const listeners = new Set<() => void>()

/** Phần tử có thuộc tính này tự xử lý bật/tắt, nên thao tác lên nó không bị coi là "khách muốn dừng" */
const KEEP_ATTR = "data-keep-auto-scroll"
// touchmove thay vì touchstart: chạm hờ hay đặt ngón tay lên màn hình không làm dừng, chỉ vuốt thật mới dừng
const USER_EVENTS = ["wheel", "touchmove", "pointerdown", "keydown"] as const
/** Sai lệch cho phép giữa vị trí đã đặt và scrollY (trình duyệt làm tròn theo pixel thiết bị) */
const DRIFT_PX = 2
const MAX_DT_MS = 64
function setRunning(next: boolean) {
  if (running === next) return
  running = next
  listeners.forEach((listener) => listener())
}

/** Có phải thao tác thật của khách muốn tự điều khiển trang không (bỏ qua nút bật/tắt và cú chạm ngón tay, vì cảm ứng đã có touchmove) */
function isDeliberateInput(event: Event): boolean {
  if (event.target instanceof Element && event.target.closest(`[${KEEP_ATTR}]`)) return false
  if (event.type === "pointerdown" && (event as PointerEvent).pointerType === "touch") return false
  return true
}

function onUserInput(event: Event) {
  if (isDeliberateInput(event)) stop()
}

const readMaxScroll = () => document.documentElement.scrollHeight - window.innerHeight

function tick(time: number) {
  const paused = document.hidden || document.documentElement.classList.contains("is-locked")
  if (paused) {
    // Nghỉ: giữ nhịp để khi quay lại không bị nhảy một bước dài, và nhận vị trí hiện tại nếu trang bị cuộn
    lastTime = 0
    position = window.scrollY
  } else {
    // Trang bị dịch mà không do khách (ảnh/phông tải xong làm nội dung phía trên đổi cao, trình duyệt tự bù scrollY): cuộn tiếp từ vị trí mới
    if (Math.abs(window.scrollY - position) > DRIFT_PX) position = window.scrollY
    const dt = lastTime === 0 ? 0 : Math.min(time - lastTime, MAX_DT_MS)
    lastTime = time
    position += (weddingConfig.autoScroll.speed * dt) / 1000
    const max = maxScroll
    if (position >= max - 1) {
      window.scrollTo({ top: max, behavior: "instant" })
      return stop()
    }
    try {
      window.scrollTo({ top: position, behavior: "instant" })
    } catch {
      // Trình duyệt cũ không nhận "instant": rơi về kiểu gọi cũ thay vì làm vòng lặp chết
      window.scrollTo(0, position)
    }
  }
  raf = requestAnimationFrame(tick)
}

function start() {
  if (running) return
  position = window.scrollY
  lastTime = 0
  maxScroll = readMaxScroll()
  // Chiều cao trang đổi (ảnh tải xong, xoay màn hình, thanh địa chỉ co giãn) thì cập nhật, không đọc mỗi khung hình
  if (typeof ResizeObserver !== "undefined") {
    sizeObserver = new ResizeObserver(() => {
      maxScroll = readMaxScroll()
    })
    sizeObserver.observe(document.documentElement)
  }
  setRunning(true)
  USER_EVENTS.forEach((type) => window.addEventListener(type, onUserInput, { passive: true }))
  raf = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(raf)
  sizeObserver?.disconnect()
  sizeObserver = null
  USER_EVENTS.forEach((type) => window.removeEventListener(type, onUserInput))
  setRunning(false)
}

/**
 * Bắt đầu sau một khoảng chờ; khách thao tác trong lúc chờ thì huỷ hẳn (tự cuộn chỉ còn bật bằng nút).
 * Trả về hàm huỷ.
 */
function startAfter(delayMs: number): () => void {
  const cancel = (event?: Event) => {
    if (event && !isDeliberateInput(event)) return
    window.clearTimeout(timer)
    USER_EVENTS.forEach((type) => window.removeEventListener(type, cancel))
  }
  const timer = window.setTimeout(() => {
    cancel()
    start()
  }, delayMs)
  USER_EVENTS.forEach((type) => window.addEventListener(type, cancel, { passive: true }))
  return cancel
}

export const autoScroll = {
  start,
  startAfter,
  stop,
  toggle: () => (running ? stop() : start()),
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => running,
  keepAttr: KEEP_ATTR,
}

export const useAutoScrolling = (): boolean => useSyncExternalStore(autoScroll.subscribe, autoScroll.getSnapshot)
