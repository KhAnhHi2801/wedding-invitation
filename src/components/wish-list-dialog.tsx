import { useEffect, useId, useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { lockScroll } from "../lib/scroll-lock"
import { nextShown, WISH_LIST_STEP } from "../lib/wish-list"
import type { PublicWish } from "../lib/wishes-api"
import { CloseIcon } from "./icons/ui-icons"
import { WishRow } from "./wish-row"
import "./wish-list-dialog.css"

interface WishListDialogProps {
  wishes: readonly PublicWish[]
  onOpenWish: (wish: PublicWish, opener: HTMLElement) => void
  onClose: () => void
}

/**
 * Lớp "Xem tất cả": toàn màn hình trên điện thoại, thanh trên cố định có nút Đóng, danh sách cuộn riêng. Dựng theo lượt
 * khi cuộn tới cuối (không cần bấm "xem thêm") nên 400 lời vẫn nhẹ. Việc đóng đi qua `onClose` để nơi gọi đồng bộ với nút Back.
 */
export function WishListDialog({ wishes, onOpenWish, onClose }: WishListDialogProps) {
  const { wishGallery: text } = weddingConfig
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(WISH_LIST_STEP)
  const total = wishes.length

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const release = lockScroll()
    return () => {
      release()
      if (dialog.open) dialog.close()
    }
  }, [])

  // Cuộn gần tới cuối thì dựng thêm một lượt
  useEffect(() => {
    const sentinel = sentinelRef.current
    const root = bodyRef.current
    if (!sentinel || !root || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown((value) => nextShown(value, total))
      },
      { root, rootMargin: "300px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [total, shown])

  return (
    <dialog
      ref={dialogRef}
      className="wl"
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc: để nơi gọi đóng, vì còn phải trả mục lịch sử đã thêm lúc mở
        event.preventDefault()
        onClose()
      }}
    >
      <div className="wl__panel">
        <header className="wl__head">
          <h2 className="wl__title" id={titleId}>
            {text.label} <span className="wl__count">({total})</span>
          </h2>
          <button type="button" className="wl__close" aria-label={text.close} onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="wl__body" ref={bodyRef}>
          <ol className="wish-gallery__list" aria-label={text.listLabel}>
            {wishes.slice(0, shown).map((wish, index) => (
              <li key={`${wish.id}|${wish.name}|${index}`}>
                <WishRow wish={wish} onOpen={onOpenWish} />
              </li>
            ))}
          </ol>
          <div className="wl__sentinel" ref={sentinelRef} aria-hidden="true" />
        </div>
      </div>
    </dialog>
  )
}
