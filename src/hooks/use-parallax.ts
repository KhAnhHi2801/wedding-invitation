import { useEffect, type RefObject } from "react"
import { gsap } from "../lib/gsap"
import { shouldReduceEffects } from "../lib/device-tier"

export interface ParallaxItem {
  selector: string
  /** Độ dịch theo trục dọc (% chiều cao phần tử) khi cuộn qua; dấu cho biết hướng */
  amount: number
}

/**
 * Parallax nhẹ bằng ScrollTrigger scrub. ScrollTrigger được nạp lười (chunk riêng), và bị bỏ hẳn trên máy yếu
 * hoặc khi người dùng giảm chuyển động. Chỉ dùng cho tối đa vài phần tử/section để giữ cuộn mượt.
 */
export function useParallax<T extends HTMLElement>(rootRef: RefObject<T | null>, items: readonly ParallaxItem[]) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || shouldReduceEffects()) return

    let cancelled = false
    let context: gsap.Context | undefined

    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      context = gsap.context(() => {
        for (const item of items) {
          gsap.utils.toArray<HTMLElement>(item.selector).forEach((element) => {
            gsap.fromTo(
              element,
              { yPercent: -item.amount },
              {
                yPercent: item.amount,
                ease: "none",
                scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
              },
            )
          })
        }
      }, root)
      // Vị trí kích hoạt được tính lại khi trang đã ổn định bố cục
      requestAnimationFrame(() => ScrollTrigger.refresh())
    })

    return () => {
      cancelled = true
      context?.revert()
    }
  }, [rootRef, items])
}
