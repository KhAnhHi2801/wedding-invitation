import { autoScroll } from "./auto-scroll"

/** Khách tới lời cảm ơn cuối trang và dừng lại bấy lâu thì mở form */
const DWELL_MS = 2000
const HANDLED_KEY = "wedding-rsvp-handled"

/** Khách đã từng được hỏi (form đã mở một lần) thì không tự mở lại ở các lần tải trang sau. Storage bị chặn thì coi như chưa. */
export function isRsvpHandled(): boolean {
  try {
    return localStorage.getItem(HANDLED_KEY) === "1"
  } catch {
    return false
  }
}

export function markRsvpHandled(): void {
  try {
    localStorage.setItem(HANDLED_KEY, "1")
  } catch {
    // Không lưu được thì lần sau hỏi lại, không ảnh hưởng gì khác
  }
}

/**
 * Tự mở form khi khách đã cuộn tới phần cuối (lời cảm ơn) và dừng lại một nhịp, tức là đã xem hết thiệp. Không mở nếu
 * khách đã được hỏi trước đó, hoặc lúc đó đang có thứ khác phủ màn hình (xem ảnh lớn, vườn hoa, hộp lời chúc): chờ một
 * nhịp rồi thử lại. Đang tự cuộn thì dừng tự cuộn rồi mới mở. Trả về hàm huỷ.
 */
export function promptRsvpOnDwell(target: Element, open: () => void): () => void {
  if (typeof IntersectionObserver === "undefined" || isRsvpHandled()) return () => {}
  let timer = 0
  let done = false
  const arm = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (done) return
      // Đang có lớp phủ khác (cuộn bị khóa): để lúc khách xong việc rồi mới hỏi
      if (document.documentElement.classList.contains("is-locked")) return arm()
      done = true
      observer.disconnect()
      autoScroll.stop()
      open()
    }, DWELL_MS)
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) arm()
      else window.clearTimeout(timer)
    },
    { threshold: 0.5 },
  )
  observer.observe(target)
  return () => {
    window.clearTimeout(timer)
    observer.disconnect()
  }
}

/**
 * Khách đã lướt qua hết phần ngày giờ, địa điểm (target nằm hẳn phía trên màn hình): gọi một lần để nhắc nhẹ.
 * Kiểm tra theo sự kiện cuộn (mỗi khung hình một lần) thay vì IntersectionObserver, vì vuốt mạnh có thể nhảy qua target
 * mà không có lúc nào nó nằm trong màn hình.
 */
export function onceScrolledPast(target: Element, callback: () => void): () => void {
  let frame = 0
  const check = () => {
    frame = 0
    if (target.getBoundingClientRect().bottom >= 0) return
    window.removeEventListener("scroll", onScroll)
    callback()
  }
  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(check)
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  return () => {
    window.cancelAnimationFrame(frame)
    window.removeEventListener("scroll", onScroll)
  }
}
