import type { CSSProperties } from "react"
import { imageSet, type ImageKey } from "../lib/images"

interface PhotoProps {
  name: ImageKey
  /** Mô tả ảnh; để rỗng nếu ảnh chỉ để trang trí */
  alt: string
  /** Gợi ý kích thước hiển thị để trình duyệt chọn bản 640px hay 1200px */
  sizes: string
  /** Ảnh đầu trang: tải ngay với độ ưu tiên cao; "low" là ảnh lộ ra ở màn đầu nhưng không được giành băng thông với ảnh chính; còn lại lazy */
  priority?: boolean | "low"
  className?: string
  style?: CSSProperties
}

export function Photo({ name, alt, sizes, priority = false, className, style }: PhotoProps) {
  const image = imageSet(name)
  return (
    <img
      className={className}
      style={style}
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority === true ? undefined : "lazy"}
      fetchPriority={priority === true ? "high" : priority === "low" ? "low" : undefined}
      decoding="async"
    />
  )
}
