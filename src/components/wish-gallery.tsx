import { useCallback, useEffect, useId, useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { gardenOverlay } from "../lib/garden-overlay"
import type { ImageKey } from "../lib/images"
import { fillText, WISH_PREVIEW } from "../lib/wish-list"
import type { PublicWish } from "../lib/wishes-api"
import { useWishes } from "../lib/wishes-store"
import { Photo } from "./photo"
import { WishDetail } from "./wish-detail"
import { WishListDialog } from "./wish-list-dialog"
import { WishFlower, WishRow } from "./wish-row"
import "./wish-gallery.css"

/** Ảnh botanical chủ đạo (khóa trong image-manifest). Nếu để null thì vùng ảnh vẫn giữ đúng tỉ lệ, nền kem, không hiện gì thêm. */
const ART: ImageKey | null = "hero/wish-botanical"

const REVEAL: readonly RevealRule[] = [
  { selector: ".wish-gallery__title", preset: "fadeUp" },
  { selector: ".wish-gallery__art", preset: "fadeIn", delay: 120 },
  { selector: ".wish-gallery__feature", preset: "fadeUp", delay: 200 },
]

/** Một lớp đang mở (danh sách đầy đủ hoặc chi tiết) và phần tử đã mở nó, để trả tiêu điểm khi đóng. */
interface Layer {
  kind: "list" | "detail"
  opener: HTMLElement | null
  wish?: PublicWish
}

/**
 * Phần "Lời chúc": ảnh botanical làm điểm nhấn, một lời tiêu biểu (lời mới nhất, lời của khách vừa gửi nếu có), nút mở
 * bốn lời kế tiếp ngay trong trang, "Xem tất cả" mở lớp danh sách riêng, và nút gieo hoa. Bấm một lời mở chi tiết.
 * Mỗi lớp đang mở giữ đúng một mục lịch sử: nút Back của điện thoại đóng lớp trên cùng (chi tiết trước, rồi danh sách)
 * thay vì rời trang.
 */
export function WishGallery() {
  const { wishGallery: text, garden } = weddingConfig
  const listId = useId()
  const revealRef = useReveal<HTMLElement>(REVEAL)
  const { wishes, loaded } = useWishes()
  const [open, setOpen] = useState(false)
  const [layers, setLayers] = useState<readonly Layer[]>([])
  // Bản sao đồng bộ của `layers` cho trình xử lý popstate (không đọc state cũ); mỗi phần tử ứng với một mục lịch sử đã đẩy
  const stack = useRef<Layer[]>([])
  const closing = useRef(false)
  const refocus = useRef<HTMLElement | null>(null)

  const popLayer = useCallback(() => {
    const top = stack.current.pop()
    closing.current = false
    if (!top) return
    refocus.current = top.opener
    setLayers([...stack.current])
  }, [])

  // Nút Back của điện thoại: chỉ đóng lớp trên cùng đang mở, không rời trang
  useEffect(() => {
    const onPop = () => {
      if (stack.current.length) popLayer()
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
  }, [layers])

  const pushLayer = (layer: Layer) => {
    history.pushState({ wishLayer: layer.kind }, "")
    stack.current.push(layer)
    setLayers([...stack.current])
  }

  const openList = (opener: HTMLElement) => {
    if (stack.current.some((layer) => layer.kind === "list")) return
    pushLayer({ kind: "list", opener })
  }

  const openDetail = (wish: PublicWish, opener: HTMLElement) => {
    if (stack.current.some((layer) => layer.kind === "detail")) return
    pushLayer({ kind: "detail", opener, wish })
  }

  // Đóng lớp trên cùng bằng cách trả đúng mục lịch sử đã thêm; popstate sẽ gỡ lớp. Bấm Đóng hai lần liên tiếp không được lùi hai mục
  const closeTop = () => {
    if (closing.current || !stack.current.length) return
    closing.current = true
    history.back()
  }

  const total = wishes.length
  const featured = wishes[0]
  // Lời đầu đã hiện ở phần tiêu biểu nên danh sách trong trang bắt đầu từ lời thứ hai
  const preview = wishes.slice(1, 1 + WISH_PREVIEW)
  const detail = layers.find((layer) => layer.kind === "detail")
  const listOpen = layers.some((layer) => layer.kind === "list")

  return (
    <section className="section wish-gallery" id="guestbook" ref={revealRef} aria-label={text.label}>
      <h2 className="wish-gallery__title">{text.label}</h2>
      <p className="wish-gallery__subtitle">{text.subtitle}</p>

      <div className="wish-gallery__art" aria-hidden="true">
        {ART && <Photo name={ART} alt="" sizes="(min-width: 768px) 26rem, 86vw" />}
      </div>

      {featured ? (
        <button
          type="button"
          className="wish-gallery__feature"
          aria-haspopup="dialog"
          onClick={(event) => openDetail(featured, event.currentTarget)}
        >
          <span className="wish-gallery__feature-flower">
            <WishFlower wish={featured} />
          </span>
          <span className="wish-gallery__quote">
            {featured.message}
          </span>
          <span className="wish-gallery__feature-name" translate="no">
            {featured.name || text.anonymous}
          </span>
        </button>
      ) : (
        // Chưa tải xong (hoặc tải lỗi) thì chưa nói "chưa có lời chúc nào"
        loaded && <p className="wish-gallery__empty">{text.empty}</p>
      )}

      <div className="wish-gallery__actions">
        {total > 1 && (
          <button
            type="button"
            className="wish-gallery__button wish-gallery__button--ghost"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? text.hide : `${text.view} (${total})`}
          </button>
        )}
        <button type="button" className="wish-gallery__button" onClick={gardenOverlay.open}>
          {garden.open}
        </button>
      </div>

      {open && total > 1 && (
        <div className="wish-gallery__list-wrap" id={listId}>
          <ol className="wish-gallery__list" aria-label={text.listLabel}>
            {preview.map((wish, index) => (
              <li key={`${wish.id}|${wish.name}|${index}`}>
                <WishRow wish={wish} onOpen={openDetail} />
              </li>
            ))}
          </ol>
          {total > 1 + WISH_PREVIEW && (
            <button
              type="button"
              className="wish-gallery__button wish-gallery__button--ghost"
              aria-haspopup="dialog"
              onClick={(event) => openList(event.currentTarget)}
            >
              {fillText(text.viewAll, { n: total })}
            </button>
          )}
        </div>
      )}

      {listOpen && <WishListDialog wishes={wishes} onOpenWish={openDetail} onClose={closeTop} />}
      {detail?.wish && <WishDetail wish={detail.wish} onClose={closeTop} />}
    </section>
  )
}
