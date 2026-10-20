import { weddingConfig } from "../config/wedding-config"
import { FlowerMiniPreview } from "../features/flower-bloom/FlowerMiniPreview"
import { entryFor } from "../lib/flower-entries"
import { inkColor } from "../lib/wish-style"
import type { PublicWish } from "../lib/wishes-api"

/** Hoa SVG nhỏ đúng loài khách chọn (id lạ thì chọn cố định theo nội dung). */
export function WishFlower({ wish }: { wish: PublicWish }) {
  return <FlowerMiniPreview flower={entryFor(wish.flower, wish.name + wish.message).def} />
}

interface WishRowProps {
  wish: PublicWish
  onOpen: (wish: PublicWish, opener: HTMLElement) => void
}

/** Một dòng lời chúc: hoa nhỏ, tên, hai dòng đầu theo màu mực. Cả dòng là vùng bấm để mở chi tiết. */
export function WishRow({ wish, onOpen }: WishRowProps) {
  const { wishGallery: text } = weddingConfig
  const name = wish.name || text.anonymous
  return (
    <button
      type="button"
      className={`wish-gallery__row${wish.id === "" ? " is-own" : ""}`}
      aria-haspopup="dialog"
      onClick={(event) => onOpen(wish, event.currentTarget)}
    >
      <span className="wish-gallery__row-flower">
        <WishFlower wish={wish} />
      </span>
      <span className="wish-gallery__row-body">
        <span className="wish-gallery__row-name" translate="no">
          {name}
        </span>
        <span className="wish-gallery__row-text" style={{ color: inkColor(wish.ink) }}>
          {wish.message}
        </span>
      </span>
    </button>
  )
}
