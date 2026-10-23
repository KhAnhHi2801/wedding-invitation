import { autoScroll } from "./auto-scroll"

/** Khách tới phần xác nhận (hoặc cuộn vượt qua) và dừng lại bấy lâu thì mở form */
const DWELL_MS = 1500

/**
 * Tự mở form khi khách đã tới phần xác nhận (hoặc cuộn vượt qua nó) và dừng lại một nhịp, tức là đã xem xong ngày giờ,
 * địa điểm phía trên. Không nhớ khách đã gửi hay chưa: mỗi lần tải trang mở tối đa một lần. Đang tự cuộn thì dừng tự cuộn
 * rồi mới mở. Trả về hàm huỷ.
 */
export function promptRsvpOnDwell(target: Element, open: () => void): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {}
  let timer = 0
  let done = false
  const arm = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (done) return
      done = true
      observer.disconnect()
      autoScroll.stop()
      open()
    }, DWELL_MS)
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      // Chưa tới nơi (phần còn nằm bên dưới màn hình) thì không mở
      const passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
      if (entry.isIntersecting || passed) arm()
      else window.clearTimeout(timer)
    },
    { threshold: 0.3 },
  )
  observer.observe(target)
  return () => {
    window.clearTimeout(timer)
    observer.disconnect()
  }
}
