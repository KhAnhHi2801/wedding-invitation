import { lazy, Suspense, useEffect } from "react"
import { weddingConfig } from "../config/wedding-config"
import { useInView } from "../hooks/use-in-view"
import { loadWishes } from "../lib/wishes-store"
import "./guestbook-section.css"

// `page-flip` và logic dựng sổ nằm ở chunk riêng, chỉ tải khi sắp cuộn tới
const Guestbook = lazy(() => import("./guestbook"))

/** Vỏ của sổ lưu bút: luôn có `id="guestbook"` trong trang, nội dung chỉ dựng khi section sắp vào màn hình. */
export function GuestbookSection() {
  const { guestbook } = weddingConfig
  const [ref, near] = useInView<HTMLElement>({ once: true, rootMargin: "600px" })

  // Đọc lời chúc từ Sheet ngay khi sắp tới sổ (dùng chung kho với khu vườn nên chỉ tải một lần)
  useEffect(() => {
    if (near) void loadWishes()
  }, [near])

  return (
    <section className="section guestbook" id="guestbook" ref={ref}>
      <h2 className="guestbook__title">{guestbook.label}</h2>
      {near ? (
        <Suspense fallback={<div className="guestbook__placeholder" aria-hidden="true" />}>
          <Guestbook />
        </Suspense>
      ) : (
        <div className="guestbook__placeholder" aria-hidden="true" />
      )}
    </section>
  )
}
