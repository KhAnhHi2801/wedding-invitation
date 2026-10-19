import { useCallback, useEffect, useRef, useState } from "react"
import { prefersReducedMotion, shouldReduceEffects } from "../../lib/device-tier"
import type { GrowthStage } from "../../types/flower"
import { music } from "../../lib/music"
import { soundManager } from "./audio"

/** Thời gian mọc đầy đủ (ms), khớp bản prototype. Máy yếu rút ngắn; người giảm chuyển động thấy hoa nở ngay. */
const FULL_MS = 5200
const LITE_MS = 2000
/** Cập nhật hình tối đa ~30 lần/giây: mắt người gần như không phân biệt với 60 mà nhẹ hơn một nửa cho điện thoại. */
const FRAME_GAP_MS = 33

/** Giai đoạn theo tiến trình (ngưỡng như prototype: 0.12 / 0.48 / 0.62 / 0.95). */
export function stageFromProgress(progress: number): GrowthStage {
  if (progress <= 0) return "seed"
  if (progress < 0.12) return "germination"
  if (progress < 0.48) return "growth"
  if (progress < 0.62) return "bud"
  if (progress < 0.95) return "bloom"
  return "completed"
}

interface BloomControls {
  progress: number
  stage: GrowthStage
  /** Bắt đầu mọc từ hạt. Gọi từ thao tác của khách để âm thanh được phép phát. */
  play: () => void
  /** Bỏ qua animation, hiện hoa nở luôn */
  skip: () => void
}

/**
 * Điều khiển tiến trình mọc của một bông hoa. State chỉ nằm ở component dùng hook này (nhỏ, bọc quanh engine),
 * nên mỗi lần cập nhật không kéo cả section render lại.
 */
export function useBloomProgress(onDone: () => void): BloomControls {
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)
  const onDoneRef = useRef(onDone)
  // Chuông nở chỉ vang một lần mỗi lần mọc (ở ~80%, hoặc lúc xong nếu bỏ qua animation)
  const chimed = useRef(false)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const stop = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = 0
  }, [])

  useEffect(() => stop, [stop])

  const finish = useCallback(() => {
    stop()
    setProgress(1)
    if (!chimed.current) {
      chimed.current = true
      soundManager.playBloomChime()
    }
    onDoneRef.current()
  }, [stop])

  const play = useCallback(() => {
    stop()
    setProgress(0)
    chimed.current = false
    // Tiếng hạt/mầm/chuông theo nút nhạc của trang: khách đã tắt nhạc thì các tiếng này cũng im
    soundManager.toggle(music.getState() !== "paused")
    soundManager.playSeedSound()
    if (prefersReducedMotion()) {
      finish()
      return
    }

    const duration = shouldReduceEffects() ? LITE_MS : FULL_MS
    const startedAt = performance.now()
    let lastPaint = 0
    let sprouted = false

    const loop = (now: number) => {
      const value = Math.min(1, (now - startedAt) / duration)
      if (value >= 0.95) {
        finish()
        return
      }
      if (now - lastPaint >= FRAME_GAP_MS) {
        lastPaint = now
        setProgress(value)
        if (!sprouted && value > 0.2) {
          sprouted = true
          soundManager.playSproutSound()
        }
        if (!chimed.current && value > 0.8) {
          chimed.current = true
          soundManager.playBloomChime()
        }
      }
      frame.current = requestAnimationFrame(loop)
    }
    frame.current = requestAnimationFrame(loop)
  }, [stop, finish])

  const skip = useCallback(() => {
    if (frame.current) finish()
  }, [finish])

  return { progress, stage: stageFromProgress(progress), play, skip }
}
