import manifest from "../generated/image-manifest.json"
import { assetUrl } from "./asset-url"

/** Khóa ảnh hợp lệ (lấy từ manifest): gõ sai trong config sẽ báo lỗi khi build. */
export type ImageKey = keyof typeof manifest

interface ManifestEntry {
  width: number
  height: number
  smallWidth: number
}

export interface ImageSet {
  src: string
  srcSet: string
  width: number
  height: number
}

const entries = manifest as Record<string, ManifestEntry>

/** Khóa có trong manifest hay không (dùng khi khóa ghép từ dữ liệu, ví dụ ảnh minh họa theo mã loài hoa). */
export const hasImage = (key: string): key is ImageKey => key in entries

/**
 * Thuộc tính `<img>` cho một ảnh theo khóa trong manifest (ví dụ "photos/photo-01"):
 * `src` bản lớn, `srcSet` hai cỡ, `width`/`height` gốc để trình duyệt giữ chỗ và không dịch bố cục.
 */
export function imageSet(key: ImageKey): ImageSet {
  const entry = entries[key]
  if (!entry) throw new Error(`Ảnh "${key}" chưa có trong image-manifest.json. Chạy: npm run images`)
  return {
    src: assetUrl(`${key}.webp`),
    // Ảnh nhỏ hơn bản 640 thì chỉ có một cỡ (hai cỡ trùng nhau sẽ lặp mô tả `w` trong srcset)
    srcSet:
      entry.smallWidth >= entry.width
        ? `${assetUrl(`${key}.webp`)} ${entry.width}w`
        : `${assetUrl(`${key}-640.webp`)} ${entry.smallWidth}w, ${assetUrl(`${key}.webp`)} ${entry.width}w`,
    width: entry.width,
    height: entry.height,
  }
}
