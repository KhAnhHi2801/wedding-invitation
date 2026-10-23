import { useSyncExternalStore } from "react"
import { weddingConfig } from "../config/wedding-config"

/**
 * Tự cuộn trang xuống chậm như các thiệp cưới online. Dừng hẳn ngay khi khách thao tác (lăn, chạm, bấm, gõ phím)
 * hoặc tự cuộn lệch khỏi vị trí đã đặt; bật lại bằng nút. Tạm nghỉ (không dừng) khi tab ẩn hoặc đang có modal.
 */
let running = false
let raf = 0
let position = 0
let lastTime = 0
const listeners = new Set<() => void>()

/** Phần tử có thuộc tính này tự xử lý bật/tắt, nên thao tác lên nó không bị coi là "khách muốn dừng" */
const KEEP_ATTR = "data-keep-auto-scroll"
const USER_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const
/** Sai lệch cho phép giữa vị trí đã đặt và scrollY (trình duyệt làm tròn theo pixel thiết bị) */
const DRIFT_PX = 2
const MAX_DT_MS = 64

function setRunning(next: boolean) {
  if (running === next) return
  running = next
  listeners.forEach((listener) => listener())
}

function onUserInput(event: Event) {
  if (event.target instanceof Element && event.target.closest(`[${KEEP_ATTR}]`)) return
  stop()
}

function tick(time: number) {
  const paused = document.hidden || document.documentElement.classList.contains("is-locked")
  if (paused) {
    // Nghỉ: giữ nhịp để khi quay lại không bị nhảy một bước dài, và nhận vị trí hiện tại nếu trang bị cuộn
    lastTime = 0
    position = window.scrollY
  } else {
    if (Math.abs(window.scrollY - position) > DRIFT_PX && lastTime !== 0) return stop()
    const dt = lastTime === 0 ? 0 : Math.min(time - lastTime, MAX_DT_MS)
    lastTime = time
    position += (weddingConfig.autoScroll.speed * dt) / 1000
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (position >= max - 1) {
      window.scrollTo({ top: max, behavior: "instant" })
      return stop()
    }
    window.scrollTo({ top: position, behavior: "instant" })
  }
  raf = requestAnimationFrame(tick)
}

function start() {
  if (running) return
  position = window.scrollY
  lastTime = 0
  setRunning(true)
  USER_EVENTS.forEach((type) => window.addEventListener(type, onUserInput, { passive: true }))
  raf = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(raf)
  USER_EVENTS.forEach((type) => window.removeEventListener(type, onUserInput))
  setRunning(false)
}

/**
 * Bắt đầu sau một khoảng chờ; khách thao tác trong lúc chờ thì huỷ hẳn (tự cuộn chỉ còn bật bằng nút).
 * Trả về hàm huỷ.
 */
function startAfter(delayMs: number): () => void {
  const cancel = (event?: Event) => {
    if (event?.target instanceof Element && event.target.closest(`[${KEEP_ATTR}]`)) return
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
