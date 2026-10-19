import { useEffect, useMemo, useRef } from "react"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import { weddingConfig } from "../config/wedding-config"
import { FlowerMiniPreview } from "../features/flower-bloom/FlowerMiniPreview"
import { getEventParts } from "../lib/event-date"
import { entryFor } from "../lib/flower-entries"
import { createGuestbook } from "../lib/guestbook-book.js"
import { getWeddingEvent } from "../lib/wedding-event"
import { useWishes } from "../lib/wishes-store"
import { inkColor } from "../lib/wish-style"
import { MESSAGE_MAX } from "../lib/wish-validation"
import "./guestbook.css"

const iconCache = new Map<string, string>()

/**
 * Chuỗi SVG của ảnh thu nhỏ một loài hoa, dựng một lần rồi dùng lại (sổ lưu bút dựng trang bằng DOM thuần, không qua React).
 * Dùng flushSync nên KHÔNG được gọi trong lúc React đang render hay chạy effect: mọi lệnh dựng sổ đều đi qua `later`.
 */
function flowerSvg(flowerId: string, seed: string): string {
  const entry = entryFor(flowerId, seed)
  const cached = iconCache.get(entry.def.id)
  if (cached) return cached
  const holder = document.createElement("div")
  const root = createRoot(holder)
  flushSync(() => root.render(<FlowerMiniPreview flower={entry.def} />))
  const markup = holder.innerHTML
  root.unmount()
  iconCache.set(entry.def.id, markup)
  return markup
}

/** Chạy `task` ở tác vụ kế tiếp (sau khi React xong lượt render hiện tại); trả về hàm hủy. */
function later(task: () => void): () => void {
  const timer = window.setTimeout(task, 0)
  return () => window.clearTimeout(timer)
}

const ARROW_LEFT = "M15 18l-6-6 6-6"
const ARROW_RIGHT = "M9 18l6-6-6-6"

/**
 * Sổ lưu bút lật trang (thư viện `page-flip`). Logic dựng trang, phân trang theo chiều cao, nắp bìa 3D và cử chỉ vuốt nằm
 * trong `lib/guestbook-book.js` (port từ dự án preview-wedding); component này chỉ dựng khung HTML, cấp dữ liệu và dọn dẹp.
 */
export default function Guestbook() {
  const { guestbook, couple } = weddingConfig
  const { event } = getWeddingEvent()
  const hostRef = useRef<HTMLElement>(null)
  const bookRef = useRef<ReturnType<typeof createGuestbook> | null>(null)
  const { wishes } = useWishes()
  const lastOwnCount = useRef(0)

  const wedding = useMemo(() => {
    const parts = getEventParts(event.startsAt)
    const pad = (n: number) => String(n).padStart(2, "0")
    return {
      monogram: `${couple.bride.name.charAt(0)} & ${couple.groom.name.charAt(0)}`,
      names: `${couple.bride.name} & ${couple.groom.name}`,
      dateLabel: `${pad(parts.day)} . ${pad(parts.month)} . ${parts.year}`,
    }
  }, [couple, event.startsAt])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const book = createGuestbook({
      host,
      texts: guestbook,
      wedding,
      flowerSvg,
      inkColor,
      messageMax: MESSAGE_MAX,
      // Nút "Gửi lời chúc" ở trang cuối: quay lại khu vườn để gieo hoa
      onWrite: () => document.getElementById("garden")?.scrollIntoView({ block: "start" }),
    })
    bookRef.current = book

    // Chỉ dựng sổ khi nằm trong màn hình (dựng cần đo chữ và tốn thời gian)
    const observer = new IntersectionObserver(([entry]) => book.setActive(entry.isIntersecting), { rootMargin: "200px" })
    observer.observe(host)
    const first = later(() => book.setWishes(wishes))

    return () => {
      first()
      observer.disconnect()
      book.dispose()
      bookRef.current = null
    }
    // Chỉ dựng một lần; dữ liệu cập nhật qua effect bên dưới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Khách vừa gửi một lời chúc: đưa sổ tới trang có lời chúc đó và làm nổi bật
    const own = wishes.filter((wish) => wish.id === "")
    const justSent = own.length > lastOwnCount.current ? own[0] : undefined
    lastOwnCount.current = own.length
    return later(() => {
      bookRef.current?.setWishes(wishes)
      if (justSent) bookRef.current?.reveal(justSent)
    })
  }, [wishes])

  return (
    <section className="gb" ref={hostRef} aria-label={guestbook.label}>
      <div className="gb__book" tabIndex={0} role="group" aria-label={guestbook.label}>
        <button type="button" className="gb__reopen">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          {guestbook.reopen}
        </button>
      </div>
      <div className="gb__nav">
        <button type="button" className="gb__prev" aria-label={guestbook.prev} disabled>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ARROW_LEFT} />
          </svg>
        </button>
        <p className="gb__status" aria-live="polite" />
        <button type="button" className="gb__next" aria-label={guestbook.next}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ARROW_RIGHT} />
          </svg>
        </button>
      </div>
    </section>
  )
}
