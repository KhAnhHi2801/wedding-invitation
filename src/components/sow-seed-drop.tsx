import { useEffect, useRef, type CSSProperties } from "react"
import { shouldReduceEffects } from "../lib/device-tier"
import "./sow-seed-drop.css"

interface SowSeedDropProps {
  /** Bật lên thì chạy cảnh gieo: hạt rơi từ trên xuống chậu, đất bắn lên, gợn sóng */
  run: boolean
  /** Gọi khi hạt đã chạm đất (hoặc ngay lập tức nếu người dùng giảm chuyển động) */
  onLanded: () => void
}

/** Hướng bay của các hạt đất khi hạt chạm đất: [lệch ngang px, lệch lên px] */
const GRAINS: ReadonlyArray<readonly [number, number]> = [
  [-34, -18],
  [-24, -27],
  [-14, -34],
  [-6, -38],
  [6, -38],
  [14, -34],
  [24, -27],
  [34, -18],
]

/**
 * Cảnh hạt rơi vào chậu. Lớp này phủ đúng khung bông hoa (mặt đất nằm khoảng 78% chiều cao), chỉ dùng transform và
 * opacity trên vài phần tử nhỏ. Máy yếu giảm còn nửa số hạt đất; người giảm chuyển động bỏ qua cảnh này.
 */
export function SowSeedDrop({ run, onLanded }: SowSeedDropProps) {
  const landedRef = useRef(onLanded)
  const grains = shouldReduceEffects()
    ? GRAINS.filter((_, index) => index % 2 === 0)
    : GRAINS

  useEffect(() => {
    landedRef.current = onLanded
  }, [onLanded])

  return (
    <div className={`sow${run ? " sow--running" : ""}`} aria-hidden="true">
      <span
        className="sow__ripple"
        onAnimationEnd={(event) => {
          if (event.animationName === "sow-ripple") landedRef.current()
        }}
      />
      {grains.map(([x, y]) => (
        <span
          className="sow__grain"
          key={`${x}:${y}`}
          style={
            {
              "--grain-x": `${x}px`,
              "--grain-y": `${y}px`,
            } as CSSProperties
          }
        />
      ))}
      <svg className="sow__seed" viewBox="-12 -14 24 28">
        <ellipse cx="0" cy="0" rx="7" ry="9.5" fill="#4E3626" stroke="#6B4B35" strokeWidth="1.2" transform="rotate(-15)" />
        <path d="M -1 -7 C 2 -2, 2 3, 0 7" stroke="#8A674D" strokeWidth="1" fill="none" />
        <circle cx="-2" cy="-3" r="1.5" fill="#C49B76" opacity="0.6" />
      </svg>
    </div>
  )
}
