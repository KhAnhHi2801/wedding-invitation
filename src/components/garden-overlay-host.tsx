import { lazy, Suspense, useState } from "react"
import { useGardenOverlayOpen } from "../lib/garden-overlay"

// Mini-game (engine 15 loài hoa, âm thanh, form) nằm ở chunk riêng, chỉ tải khi sắp cần
const GardenOverlay = lazy(() => import("./garden-overlay"))

/**
 * Chỗ gắn lớp phủ gieo hoa, đặt ở App để mọi nơi (thẻ mời, nút nổi, sổ lưu bút) mở được qua `gardenOverlay.open()`.
 * Dựng lần đầu khi được mở; sau đó giữ nguyên để lần mở sau nhớ lời đang viết dở.
 */
export function GardenOverlayHost() {
  const open = useGardenOverlayOpen()
  const [mounted, setMounted] = useState(false)

  // Dựng lần đầu khi được mở (điều chỉnh state ngay lúc render, không cần effect)
  if (open && !mounted) setMounted(true)

  if (!mounted) return null
  return (
    <Suspense fallback={null}>
      <GardenOverlay open={open} />
    </Suspense>
  )
}
