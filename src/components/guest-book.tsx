import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react"
import { createPortal } from "react-dom"
import { weddingConfig } from "../config/wedding-config"
import { bookFlight, usePendingBookFlight, type BookFlight } from "../lib/book-flight"
import { prefersReducedMotion } from "../lib/device-tier"
import { gsap } from "../lib/gsap"
import { fillText } from "../lib/wish-list"
import type { PublicWish } from "../lib/wishes-api"
import { FlowerArt } from "./flower-art"
import { ChevronLeftIcon, ChevronRightIcon } from "./icons/ui-icons"
import "./guest-book.css"

interface GuestBookProps {
  /** Các lời hiện thành trang sổ, lời mới nhất đứng đầu */
  wishes: readonly PublicWish[]
  onOpen: (wish: PublicWish, opener: HTMLElement) => void
}

const flightDuration = 1.5

/** Nét vẽ nguệch ngoạc ở góc trang (24x24, nét mảnh): tim, sao, cành lá; luân phiên theo số trang */
const DOODLES = [
  "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.600-7 10-7 10z",
  "M12 3l2.4 5.6 6.1.5-4.6 4 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-4 6.1-.5z",
  "M12 21V8M12 14c-3 0-5-2-5-5 3 0 5 2 5 5zM12 11c3 0 5-2 5-5-3 0-5 2-5 5z",
] as const

/** Quá số này thì thay chấm trang bằng "n / tổng" */
const MAX_DOTS = 7

/**
 * Sổ lưu bút lò xo: mỗi lời là một trang giấy kẻ dòng có hoa ép, lời chúc viết tay và tên. Lật trang kiểu giở lên bằng
 * vuốt ngang, nút trước/sau hoặc chấm trang. Khách vừa gieo xong thì sổ mở về trang đầu và bông hoa bay từ lớp gieo vào
 * trang đó, rồi "ép" xuống giấy.
 */
export function GuestBook({ wishes, onOpen }: GuestBookProps) {
  const { wishGallery: text } = weddingConfig
  const trackRef = useRef<HTMLUListElement>(null)
  const flyerRef = useRef<HTMLDivElement>(null)
  const swiped = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const [active, setActive] = useState(0)
  // Đang chuẩn bị cho hoa bay: lật tức thì (không hoạt ảnh) để đo đúng vị trí trang đích
  const [instant, setInstant] = useState(false)
  const [flyer, setFlyer] = useState<BookFlight | null>(null)
  const flight = usePendingBookFlight()
  const total = wishes.length
  const newest = wishes[0]
  const newestKey = newest ? `${newest.id}|${newest.name}|${newest.message}` : ""

  // Có lời mới đứng đầu (khách vừa gieo xong) thì mở sổ về trang đầu để thấy ngay lời của mình
  useEffect(() => {
    setActive(0)
  }, [newestKey])

  // Nhận yêu cầu bay: chỉ chạy khi trang đầu đúng là lời của khách; người giảm chuyển động thấy hoa nằm sẵn trên trang
  useEffect(() => {
    if (!flight || newest?.id !== "") return
    bookFlight.clear()
    if (prefersReducedMotion()) return
    setActive(0)
    setInstant(true)
    setFlyer(flight)
  }, [flight, newest?.id])

  // Hoa bay theo đường vòng lên rồi hạ xuống đúng chỗ hoa ép trên trang đầu
  useEffect(() => {
    const el = flyerRef.current
    const target = trackRef.current?.querySelector<HTMLElement>("[data-own] .gb__flower")
    if (!flyer || !el || !target) {
      if (flyer) {
        setFlyer(null)
        setInstant(false)
      }
      return
    }
    const to = target.getBoundingClientRect()
    const dx = to.left + to.width / 2 - (flyer.from.left + flyer.from.width / 2)
    const dy = to.top + to.height / 2 - (flyer.from.top + flyer.from.height / 2)
    const timeline = gsap.timeline({ onComplete: () => {
        setFlyer(null)
        setInstant(false)
      },
    })
    gsap.set(el, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 })
    timeline
      .to(el, { x: dx, duration: flightDuration, ease: "power1.inOut" }, 0)
      .to(el, { y: dy - 90, duration: flightDuration * 0.45, ease: "power2.out" }, 0)
      .to(el, { y: dy, duration: flightDuration * 0.55, ease: "power2.in" }, flightDuration * 0.45)
      .to(el, { scale: to.width / flyer.from.width, rotation: -6, duration: flightDuration, ease: "power1.inOut" }, 0)
    return () => {
      timeline.kill()
    }
  }, [flyer])

  const goTo = (index: number) => setActive(Math.max(0, Math.min(total - 1, index)))

  // Vuốt ngang để lật trang; sau một cú vuốt thì bỏ cú bấm kèm theo để không mở chi tiết nhầm
  const onPointerDown = (event: PointerEvent) => {
    swiped.current = { x: event.clientX, y: event.clientY, moved: false }
  }
  const onPointerUp = (event: PointerEvent) => {
    const start = swiped.current
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      start.moved = true
      goTo(active + (dx < 0 ? 1 : -1))
    }
  }
  const onClickCapture = (event: MouseEvent) => {
    if (swiped.current?.moved) {
      event.preventDefault()
      event.stopPropagation()
    }
    swiped.current = null
  }

  const pageLabel = (index: number) => fillText(text.slideLabel, { n: index + 1, total })

  return (
    <div className="gb" role="region" aria-roledescription="carousel" aria-label={text.listLabel}>
      <div
        className={`gb__book${instant ? " is-instant" : ""}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClickCapture={onClickCapture}
      >
        <div className="gb__rings" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <span className="gb__ribbon" aria-hidden="true" />
        <ul className="gb__track" ref={trackRef}>
          {wishes.map((wish, index) => (
            <GuestBookPage
              key={`${wish.id}|${wish.name}|${index}`}
              wish={wish}
              label={pageLabel(index)}
              number={index + 1}
              state={index < active ? "turned" : index === active ? "current" : "under"}
              near={Math.abs(index - active) <= 1}
              pending={flyer !== null && wish.id === ""}
              onOpen={onOpen}
            />
          ))}
        </ul>
      </div>
      {total > 1 && (
        <div className="gb__controls">
          <button type="button" className="gb__arrow" aria-label={text.prev} disabled={active === 0} onClick={() => goTo(active - 1)}>
            <ChevronLeftIcon />
          </button>
          {total <= MAX_DOTS ? (
            <div className="gb__dots">
              {wishes.map((wish, index) => (
                <button
                  type="button"
                  className="gb__dot"
                  key={`${wish.id}|${wish.name}|${index}`}
                  aria-label={pageLabel(index)}
                  aria-current={index === active}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          ) : (
            // Sổ dày: chấm trang không chứa nổi, thay bằng số trang
            <p className="gb__counter" aria-live="polite">
              {fillText(text.counter, { n: active + 1, total })}
            </p>
          )}
          <button type="button" className="gb__arrow" aria-label={text.next} disabled={active === total - 1} onClick={() => goTo(active + 1)}>
            <ChevronRightIcon />
          </button>
        </div>
      )}
      {flyer &&
        createPortal(
          <div
            className="gb__flyer"
            ref={flyerRef}
            aria-hidden="true"
            style={{ left: flyer.from.left, top: flyer.from.top, width: flyer.from.width, height: flyer.from.height }}
          >
            <FlowerArt id={flyer.flower} seed={flyer.flower} sizes="120px" />
          </div>,
          document.body,
        )}
    </div>
  )
}

interface GuestBookPageProps {
  wish: PublicWish
  label: string
  /** Số trang hiển thị ở chân trang */
  number: number
  /** Trang đã lật qua, đang xem, hay còn nằm dưới chưa lật tới */
  state: "turned" | "current" | "under"
  /** Chỉ trang kề trang đang xem mới dựng nội dung (sổ dày hàng trăm trang vẫn nhẹ) */
  near: boolean
  /** Hoa của trang đang bay tới: giấu hoa ép cho tới khi hoa bay hạ xuống */
  pending: boolean
  onOpen: (wish: PublicWish, opener: HTMLElement) => void
}

/** Một trang sổ: hoa ép dán băng giấy, lời (cắt ở 4 dòng, kèm "Đọc tiếp" khi bị cắt), tên. Cả trang là vùng bấm mở chi tiết. */
function GuestBookPage({ wish, label, number, state, near, pending, onOpen }: GuestBookPageProps) {
  const { wishGallery: text } = weddingConfig
  const quoteRef = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)
  const own = wish.id === ""

  useEffect(() => {
    const quote = quoteRef.current
    if (!quote) return
    const measure = () => setTruncated(quote.scrollHeight - quote.clientHeight > parseFloat(getComputedStyle(quote).lineHeight) / 2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(quote)
    return () => observer.disconnect()
  }, [wish.message])

  return (
    <li
      className={`gb__page is-${state}${near ? " is-near" : ""}`}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      data-own={own ? "" : undefined}
      inert={state !== "current"}
    >
      {near && (
      <button type="button" className="gb__page-button" aria-haspopup="dialog" onClick={(event) => onOpen(wish, event.currentTarget)}>
        {own ? (
          <span className="gb__mine">{text.mine}</span>
        ) : (
          <svg className="gb__doodle" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d={DOODLES[number % DOODLES.length]} />
          </svg>
        )}
        <span className={`gb__flower${pending ? " is-pending" : own ? " is-pressed" : ""}`}>
          <FlowerArt id={wish.flower} seed={wish.name + wish.message} sizes="8rem" />
        </span>
        <span className="gb__quote" ref={quoteRef}>
          {wish.message}
        </span>
        <span className="gb__name" translate="no">
          {wish.name || text.anonymous}
        </span>
        {truncated && (
          <span className="gb__more" aria-hidden="true">
            {text.more}
          </span>
        )}
        <span className="gb__no" aria-hidden="true">
          {number}
        </span>
      </button>
      )}
    </li>
  )
}
