import { lazy, Suspense } from "react"
import { useInView } from "../hooks/use-in-view"
import "./garden.css"

// Toàn bộ mini-game (engine 15 loài hoa, âm thanh, form) nằm ở chunk riêng, chỉ tải khi sắp cuộn tới
const GardenContent = lazy(() => import("./garden-content"))

/**
 * Vỏ của khu vườn lời chúc. Phần tử `id="garden"` luôn có sẵn trong trang (nút "Gửi lời chúc…" cuộn tới đây),
 * còn nội dung chỉ dựng khi section sắp vào màn hình. Có chiều cao giữ chỗ để trang không bị dịch bố cục.
 */
export function GardenSection() {
  const [ref, near] = useInView<HTMLElement>({ once: true, rootMargin: "600px" })
  return (
    <section className="section garden" id="garden" ref={ref}>
      {near ? (
        <Suspense fallback={<div className="garden__placeholder" aria-hidden="true" />}>
          <GardenContent />
        </Suspense>
      ) : (
        <div className="garden__placeholder" aria-hidden="true" />
      )}
    </section>
  )
}
