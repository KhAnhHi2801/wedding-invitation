import { useEffect, useRef, useState, type RefObject } from "react"

interface InViewOptions {
  /** Chỉ báo "đã vào màn hình" một lần rồi giữ nguyên (dùng để tải lười) */
  once?: boolean
  /** Mở rộng vùng nhận biết, ví dụ "200px" để bắt đầu tải trước khi cuộn tới */
  rootMargin?: string
}

/** Cho biết phần tử có đang nằm trong màn hình không (dùng để tạm dừng hoạt ảnh lặp khi ra ngoài, hoặc tải lười). */
export function useInView<T extends HTMLElement>({ once = false, rootMargin = "0px" }: InViewOptions = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (!entry.isIntersecting) return
          setInView(true)
          observer.disconnect()
        } else {
          setInView(entry.isIntersecting)
        }
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [once, rootMargin])

  return [ref, inView]
}
