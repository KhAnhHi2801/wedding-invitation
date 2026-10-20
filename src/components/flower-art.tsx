import { FlowerMiniPreview } from "../features/flower-bloom/FlowerMiniPreview"
import { entryFor } from "../lib/flower-entries"
import { hasImage } from "../lib/images"
import { Photo } from "./photo"

interface FlowerArtProps {
  /** Mã loài khách đã chọn; mã rỗng hoặc lạ thì chọn cố định theo `seed` */
  id: string
  seed: string
  /** Gợi ý kích thước hiển thị cho trình duyệt chọn cỡ ảnh */
  sizes: string
}

/**
 * Hình một bông hoa của lời chúc: tranh màu nước theo loài (`flowers/<mã loài>` trong manifest ảnh). Loài nào chưa có
 * ảnh thì dùng hình SVG nhỏ dựng bằng code để vẫn luôn có hoa.
 */
export function FlowerArt({ id, seed, sizes }: FlowerArtProps) {
  const entry = entryFor(id, seed)
  const key = `flowers/${entry.def.id}`
  return hasImage(key) ? <Photo name={key} alt="" sizes={sizes} /> : <FlowerMiniPreview flower={entry.def} />
}
