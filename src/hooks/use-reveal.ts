import { useLayoutEffect, useRef, type RefObject } from "react"

export type RevealPreset =
  | "fadeIn"
  | "fadeUp"
  | "slideLeft"
  | "slideRight"
  | "scaleIn"
  | "scaleUp"
  | "lineY"
  | "wipeToLeft"
  | "wipeToRight"
  | "write"

export interface RevealRule {
  /** Phần tử cần hiện, tìm trong phần tử gốc (bỏ trống = chính phần tử gốc) */
  selector?: string
  preset: RevealPreset
  /** Trễ ban đầu (ms) */
  delay?: number
  /** Cách nhau giữa các phần tử cùng nhóm (ms) */
  stagger?: number
}

/**
 * Hiện dần phần tử khi cuộn tới, đúng một lần. Chỉ dùng IntersectionObserver + class CSS (`data-reveal`, `.is-in`
 * trong `styles/reveal.css`, chỉ transform/opacity) nên rất nhẹ. Gắn ref vào phần tử gốc, truyền `rules` là hằng số
 * khai báo ngoài component. Người dùng giảm chuyển động thấy nội dung ngay (xử lý trong CSS).
 */
export function useReveal<T extends HTMLElement>(rules: readonly RevealRule[]): RefObject<T | null> {
  const ref = useRef<T>(null)

  // useLayoutEffect: gắn trạng thái ẩn trước khi trình duyệt vẽ để không bị nháy nội dung
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const targets: HTMLElement[] = []
    for (const rule of rules) {
      const found = rule.selector ? Array.from(root.querySelectorAll<HTMLElement>(rule.selector)) : [root]
      found.forEach((element, index) => {
        element.dataset.reveal = rule.preset
        element.style.setProperty("--reveal-delay", `${(rule.delay ?? 0) + index * (rule.stagger ?? 0)}ms`)
        targets.push(element)
      })
    }

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((element) => element.classList.add("is-in"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add("is-in")
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    )
    targets.forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
      // StrictMode chạy effect hai lần: trả về trạng thái ban đầu để lần sau gắn lại sạch sẽ
      targets.forEach((element) => {
        element.classList.remove("is-in")
        delete element.dataset.reveal
        element.style.removeProperty("--reveal-delay")
      })
    }
  }, [rules])

  return ref
}
