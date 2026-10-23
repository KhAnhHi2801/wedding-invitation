import { useCallback, useEffect, useId, useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { gardenOverlay } from "../lib/garden-overlay"
import type { PublicWish } from "../lib/wishes-api"
import { useWishes } from "../lib/wishes-store"
import { DriftingPetals } from "./drifting-petals"
import { GuestBook } from "./guest-book"
import { WishDetail } from "./wish-detail"
import "./wish-gallery.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".wish-gallery__title", preset: "fadeUp" },
  { selector: ".wish-gallery__subtitle", preset: "fadeUp", delay: 100 },
  // Bọc cuốn sổ trong khung luôn có mặt: bản thân sổ chỉ dựng sau khi tải xong lời chúc, lúc đó hook đã quét xong nên không gắn được hiệu ứng
  { selector: ".wish-gallery__book", preset: "fadeUp", delay: 200 },
  { selector: ".wish-gallery__actions", preset: "fadeUp", delay: 300 },
]

/** Lời đang mở chi tiết và phần tử đã mở nó, để trả tiêu điểm khi đóng. */
interface Layer {
  opener: HTMLElement | null
  wish: PublicWish
}

/**
 * Phần "Lời chúc": cuốn sổ lưu bút lò xo làm điểm nhấn (mỗi lời một trang, lật hết được cả sổ), và nút gieo hoa.
 * Bấm một trang mở chi tiết lời đó. Lớp chi tiết giữ đúng một mục lịch sử: nút Back của điện thoại đóng lớp
 * thay vì rời trang.
 */
export function WishGallery() {
  const { wishGallery: text, garden } = weddingConfig
  const titleId = useId()
  const revealRef = useReveal<HTMLElement>(REVEAL)
  const { wishes, loaded } = useWishes()
  const [layer, setLayer] = useState<Layer | null>(null)
  // Bản sao đồng bộ của `layer` cho trình xử lý popstate (không đọc state cũ); có giá trị nghĩa là đang giữ một mục lịch sử
  const current = useRef<Layer | null>(null)
  const closing = useRef(false)
  const refocus = useRef<HTMLElement | null>(null)

  const popLayer = useCallback(() => {
    const top = current.current
    current.current = null
    closing.current = false
    if (!top) return
    refocus.current = top.opener
    setLayer(null)
  }, [])

  // Nút Back của điện thoại: chỉ đóng lớp chi tiết đang mở, không rời trang
  useEffect(() => {
    const onPop = () => {
      if (current.current) popLayer()
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [popLayer])

  // Đóng lớp xong thì trả tiêu điểm về phần tử đã mở nó (lúc hộp thoại còn mở, nền bị khóa nên chưa focus được)
  useEffect(() => {
    if (refocus.current) {
      refocus.current.focus({ preventScroll: true })
      refocus.current = null
    }
  }, [layer])

  const openDetail = (wish: PublicWish, opener: HTMLElement) => {
    if (current.current) return
    history.pushState({ wishLayer: "detail" }, "")
    current.current = { opener, wish }
    setLayer(current.current)
  }

  // Đóng bằng cách trả đúng mục lịch sử đã thêm; popstate sẽ gỡ lớp. Bấm Đóng hai lần liên tiếp không được lùi hai mục
  const closeDetail = () => {
    if (closing.current || !current.current) return
    closing.current = true
    history.back()
  }

  return (
    <section className="section wish-gallery" id="guestbook" ref={revealRef} aria-labelledby={titleId}>
      <DriftingPetals />
      <h2 className="wish-gallery__title" id={titleId}>
        {text.label}
      </h2>
      <p className="wish-gallery__subtitle">{text.subtitle}</p>

      <div className="wish-gallery__book">
        {wishes.length ? (
          <GuestBook wishes={wishes} onOpen={openDetail} />
        ) : (
          // Chưa tải xong (hoặc tải lỗi) thì chưa nói "chưa có lời chúc nào"
          loaded && <p className="wish-gallery__empty">{text.empty}</p>
        )}
      </div>

      <div className="wish-gallery__actions">
        <p className="wish-gallery__guide">{text.guide}</p>
        <button type="button" className="wish-gallery__button" onClick={gardenOverlay.open}>
          {garden.open}
        </button>
      </div>

      {layer && <WishDetail wish={layer.wish} onClose={closeDetail} />}
    </section>
  )
}
