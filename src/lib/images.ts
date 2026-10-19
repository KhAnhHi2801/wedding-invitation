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

/**
 * Thuộc tính `<img>` cho một ảnh theo khóa trong manifest (ví dụ "photos/photo-01"):
 * `src` bản lớn, `srcSet` hai cỡ, `width`/`height` gốc để trình duyệt giữ chỗ và không dịch bố cục.
 */
export function imageSet(key: ImageKey): ImageSet {
  const entry = entries[key]
  if (!entry) throw new Error(`Ảnh "${key}" chưa có trong image-manifest.json. Chạy: npm run images`)
  return {
    src: assetUrl(`${key}.webp`),
    srcSet: `${assetUrl(`${key}-640.webp`)} ${entry.smallWidth}w, ${assetUrl(`${key}.webp`)} ${entry.width}w`,
    width: entry.width,
    height: entry.height,
  }
}
