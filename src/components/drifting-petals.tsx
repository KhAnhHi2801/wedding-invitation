import type { CSSProperties } from "react"
import { useInView } from "../hooks/use-in-view"
import "./drifting-petals.css"

/** Vị trí, cỡ, tốc độ, độ lắc cố định theo thứ tự (không dùng ngẫu nhiên để mỗi lần dựng đều giống nhau). */
const PETALS = [
  { x: "6%", size: "0.9rem", duration: "14s", delay: "0s", sway: "2.5rem", tone: "var(--blush)" },
  { x: "20%", size: "1.3rem", duration: "17s", delay: "3s", sway: "-3rem", tone: "var(--rose)" },
  { x: "36%", size: "0.8rem", duration: "13s", delay: "7s", sway: "2rem", tone: "var(--pink-soft)" },
  { x: "52%", size: "1.1rem", duration: "16s", delay: "1.5s", sway: "-2.5rem", tone: "var(--blush)" },
  { x: "68%", size: "1.4rem", duration: "18s", delay: "5s", sway: "3rem", tone: "var(--rose)" },
  { x: "82%", size: "0.9rem", duration: "15s", delay: "9s", sway: "-2rem", tone: "var(--pink-soft)" },
  { x: "94%", size: "1.2rem", duration: "16s", delay: "11s", sway: "-3rem", tone: "var(--blush)" },
]

/**
 * Cánh hoa rơi chậm sau phần "Lời chúc" (CSS thuần, chỉ transform/opacity), cùng cơ chế với tim ở phần "Marry me":
 * chỉ chạy khi nằm trong màn hình, tắt hẳn trên máy yếu (`html.lite`) và khi người dùng giảm chuyển động.
 */
export function DriftingPetals() {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div className="petals" ref={ref} data-active={inView} aria-hidden="true">
      {PETALS.map((petal, index) => (
        <svg
          key={index}
          className="petals__petal"
          viewBox="0 0 24 24"
          style={{ "--x": petal.x, "--size": petal.size, "--duration": petal.duration, "--delay": petal.delay, "--sway": petal.sway, color: petal.tone } as CSSProperties}
        >
          {/* Cánh hoa hình giọt nước, nhọn ở một đầu */}
          <path d="M12 2c4.500 3.800 7 8 7 12a7 7 0 0 1-14 0c0-4 2.500-8.200 7-12z" fill="currentColor" />
        </svg>
      ))}
    </div>
  )
}
