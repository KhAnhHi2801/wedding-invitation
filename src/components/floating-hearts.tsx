import type { CSSProperties } from "react"
import { useInView } from "../hooks/use-in-view"
import { HeartIcon } from "./icons/shapes"
import "./floating-hearts.css"

/** Vị trí, cỡ, tốc độ cố định theo thứ tự (không dùng ngẫu nhiên để mỗi lần dựng đều giống nhau). */
const HEARTS = [
  { x: "8%", size: "1.1rem", duration: "9s", delay: "0s" },
  { x: "24%", size: "1.6rem", duration: "12s", delay: "2.5s" },
  { x: "42%", size: "0.9rem", duration: "10s", delay: "5s" },
  { x: "60%", size: "1.4rem", duration: "13s", delay: "1s" },
  { x: "78%", size: "1rem", duration: "9.5s", delay: "4s" },
  { x: "92%", size: "1.3rem", duration: "11s", delay: "7s" },
]

/**
 * Tim hồng nổi lên trang trí (CSS thuần, chỉ transform/opacity). Chỉ chạy khi nằm trong màn hình;
 * tắt hẳn trên máy yếu (`html.lite`) và khi người dùng giảm chuyển động.
 */
export function FloatingHearts() {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div className="hearts" ref={ref} data-active={inView} aria-hidden="true">
      {HEARTS.map((heart, index) => (
        <HeartIcon
          key={index}
          className="hearts__heart"
          style={{ "--x": heart.x, "--size": heart.size, "--duration": heart.duration, "--delay": heart.delay } as CSSProperties}
        />
      ))}
    </div>
  )
}
