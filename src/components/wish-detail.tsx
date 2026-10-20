import { useEffect, useId, useRef } from "react"
import { weddingConfig } from "../config/wedding-config"
import { FlowerMiniPreview } from "../features/flower-bloom/FlowerMiniPreview"
import { entryFor } from "../lib/flower-entries"
import { lockScroll } from "../lib/scroll-lock"
import type { PublicWish } from "../lib/wishes-api"
import { inkColor } from "../lib/wish-style"
import "./wish-detail.css"

interface WishDetailProps {
  wish: PublicWish
  onClose: () => void
}

/**
 * Chi tiết một lời chúc trong `<dialog>` gốc: khóa tiêu điểm, Esc đóng, nền phía sau không bấm được. Chỉ dựng khi có lời
 * chúc cần xem nên mở ngay khi dựng. Việc đóng đi qua `onClose` để nơi gọi đồng bộ với lịch sử trình duyệt (nút Back).
 */
export function WishDetail({ wish, onClose }: WishDetailProps) {
  const { wishGallery, garden } = weddingConfig
  const nameId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Chỉ coi là bấm ra ngoài khi cả nhấn xuống và nhả ra đều ở vùng nền (kéo bôi đen chữ ra ngoài không được đóng)
  const pressedOnBackdrop = useRef(false)
  const entry = entryFor(wish.flower, wish.name + wish.message)
  const color = inkColor(wish.ink)
  const name = wish.name || wishGallery.anonymous

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

  return (
    <dialog
      ref={dialogRef}
      className="wd"
      aria-labelledby={nameId}
      onCancel={(event) => {
        // Esc: để nơi gọi đóng, vì còn phải trả mục lịch sử đã thêm lúc mở
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && pressedOnBackdrop.current) onClose()
      }}
    >
      <div className="wd__panel">
        <div className="wd__flower">
          <FlowerMiniPreview flower={entry.def} />
        </div>
        <h2 className="wd__name" id={nameId} translate="no">
          {name}
        </h2>
        <p className="wd__message" style={{ color }} tabIndex={0} role="region" aria-labelledby={nameId}>
          {wish.message}
        </p>
        <dl className="wd__meta">
          <div>
            <dt>{wishGallery.flowerLabel}</dt>
            <dd>{entry.wish.name}</dd>
          </div>
          <div>
            <dt>{wishGallery.inkLabel}</dt>
            <dd>
              <span className="wd__dot" style={{ background: color ?? "var(--ink)" }} aria-hidden="true" />
              {garden.inkNames[wish.ink] ?? garden.inkNames.brown}
            </dd>
          </div>
        </dl>
        <button type="button" className="wd__close" onClick={onClose}>
          {wishGallery.close}
        </button>
      </div>
    </dialog>
  )
}
