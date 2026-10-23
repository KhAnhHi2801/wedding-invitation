import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "../lib/device-tier"
import { useWishes } from "../lib/wishes-store"
import { FlowerArt } from "./flower-art"
import "./wish-ticker.css"

/**
 * Số lời gần nhất được xoay vòng. Mỗi bong bóng (hai dòng: tên và lời chúc) bay lên đều và chậm trong LIFE_MS rồi mờ đi từ từ; cái kế tiếp ra sau SPAWN_MS
 * khi cái trước vẫn đang bay, nối đuôi nhau liên tục không đứng chờ. Đường bay ngắn để cả dòng vẫn thấp;
 * SPAWN_MS nhân tốc độ bay (khoảng cách giữa hai bong bóng liền nhau) chỉ nhỉnh hơn chiều cao một bong bóng một chút để sát nhau mà không đè.
 */
const MAX_WISHES = 20
const SPAWN_MS = 2400
const LIFE_MS = 4000

interface Bubble {
  id: number
  name: string
  message: string
  flower: string
}

/**
 * Lời chúc của khách hiện lần lượt thành bong bóng ngay trên nút "Gieo lời chúc": các cái nối đuôi nhau bay lên,
 * để người vào sau thấy trang đang có người chúc và muốn góp một lời. Chỉ để trang trí (các lời chúc đầy đủ nằm trong sổ
 * lưu bút) nên ẩn với trình đọc màn hình và không chặn thao tác bên dưới. Không có lời chúc nào thì không hiện gì.
 */
export function WishTicker() {
  const wishes = useWishes((state) => state.wishes)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const counter = useRef(0)
  const reduced = useRef(prefersReducedMotion())

  const pool = wishes.filter((wish) => wish.message.trim()).slice(0, MAX_WISHES)
  const poolRef = useRef(pool)
  useEffect(() => {
    poolRef.current = pool
  })
  const hasWishes = pool.length > 0

  useEffect(() => {
    if (!hasWishes) return
    const spawn = () => {
      // Tab ẩn thì không sinh thêm, để quay lại không thấy một loạt bong bóng dồn lại
      if (document.hidden) return
      const list = poolRef.current
      if (list.length === 0) return
      const wish = list[counter.current % list.length]
      const id = counter.current++
      const next: Bubble = { id, name: wish.name, message: wish.message, flower: wish.flower }
      // Giảm chuyển động: chỉ một bong bóng đứng yên, thay nhau theo lượt
      setBubbles((current) => (reduced.current ? [next] : [...current, next]))
    }
    spawn()
    const timer = window.setInterval(spawn, SPAWN_MS)
    return () => window.clearInterval(timer)
  }, [hasWishes])

  if (!hasWishes) return null

  return (
    <div className="ticker" aria-hidden="true">
      {bubbles.map((bubble) => (
        <div
          className="ticker__bubble"
          key={bubble.id}
          style={{ animationDuration: `${LIFE_MS}ms` }}
          onAnimationEnd={() => setBubbles((current) => current.filter((item) => item.id !== bubble.id))}
        >
          <span className="ticker__flower">
            <FlowerArt id={bubble.flower} seed={bubble.name} sizes="40px" />
          </span>
          <span className="ticker__text">
            <span className="ticker__name">{bubble.name}</span>
            <span className="ticker__message">{bubble.message}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
