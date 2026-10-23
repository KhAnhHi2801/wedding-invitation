import { useCallback, useEffect, useRef, useState } from "react"
import { prefersReducedMotion, shouldReduceEffects } from "../../lib/device-tier"
import type { FlowerDefinition, GrowthStage } from "../../types/flower"
import { music } from "../../lib/music"
import { soundManager } from "./audio"

/**
 * Thời gian mọc đầy đủ (ms): tổng thời lượng các giai đoạn của loài (trong config) nén lại, nên loài nở lâu như hoa baby và
 * hoa lan mất nhiều thời gian hơn loài nở nhanh. Giới hạn trong khoảng này để không quá nhanh hay quá chậm.
 * Máy yếu rút ngắn; người giảm chuyển động thấy hoa nở ngay.
 */
const DURATION_SCALE = 0.64
const MIN_MS = 4200
const MAX_MS = 6400
const DEFAULT_MS = 5200
const LITE_MS = 2000
/**
 * Tiếng đi theo đúng giai đoạn đang thấy (cùng ngưỡng với stageFromProgress): hết nảy mầm thì mầm bật lên, thân vươn có các nốt
 * cao dần, nụ hình thành có nhịp trầm, và hoa bắt đầu nở thì chuông rải theo suốt lúc cánh mở.
 */
const CUES = [
  { at: 0.12, play: () => soundManager.playSproutSound() },
  { at: 0.2, play: () => soundManager.playGrowthNote(0) },
  { at: 0.28, play: () => soundManager.playGrowthNote(1) },
  { at: 0.36, play: () => soundManager.playGrowthNote(2) },
  { at: 0.44, play: () => soundManager.playGrowthNote(3) },
  { at: 0.48, play: () => soundManager.playBudSound() },
] as const
const BLOOM_START = 0.62
const BLOOM_END = 0.95

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

type StageDurations = FlowerDefinition["duration"]

/** Các mốc tiến trình chuẩn mà bộ vẽ từng loài dựa vào: hết nảy mầm, hết thân, hết nụ, hết nở. */
const CANON = [0, 0.12, 0.48, 0.62, 1] as const

/** Thời gian mọc (ms) của một loài. */
export function bloomDurationMs(d?: StageDurations): number {
  if (!d) return DEFAULT_MS
  const total = d.seed + d.germination + d.growth + d.bud + d.bloom
  return Math.min(MAX_MS, Math.max(MIN_MS, total * DURATION_SCALE))
}

/**
 * Đổi phần thời gian đã trôi (0 đến 1) thành tiến trình chuẩn, từng đoạn một theo tỉ lệ thời lượng các giai đoạn của loài:
 * loài có giai đoạn nụ dài sẽ ở lại giai đoạn nụ lâu hơn, loài có giai đoạn nở dài thì nở chậm hơn.
 */
export function progressFromTime(tau: number, d?: StageDurations): number {
  const x = Math.min(1, Math.max(0, tau))
  if (!d) return x
  const total = d.seed + d.germination + d.growth + d.bud + d.bloom
  const edges = [0, (d.seed + d.germination) / total, (d.seed + d.germination + d.growth) / total, (d.seed + d.germination + d.growth + d.bud) / total, 1]
  for (let i = 0; i < 4; i++) {
    if (x <= edges[i + 1]) {
      const span = edges[i + 1] - edges[i]
      return CANON[i] + (CANON[i + 1] - CANON[i]) * (span > 0 ? (x - edges[i]) / span : 1)
    }
  }
  return 1
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
export function useBloomProgress(onDone: () => void, durations?: StageDurations): BloomControls {
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)
  const onDoneRef = useRef(onDone)
  // Chuông nở chỉ vang một lần mỗi lần mọc (lúc bắt đầu nở, hoặc lúc xong nếu bỏ qua animation)
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

    const duration = shouldReduceEffects() ? LITE_MS : bloomDurationMs(durations)
    const startedAt = performance.now()
    let lastPaint = 0
    let nextCue = 0
    // Thời gian thật (giây) của giai đoạn nở: chuông rải đúng khoảng này
    const bloomShare = durations ? durations.bloom / (durations.seed + durations.germination + durations.growth + durations.bud + durations.bloom) : BLOOM_END - BLOOM_START
    const bloomSpanSec = Math.min(2.5, Math.max(0.5, (duration * bloomShare) / 1000))

    const loop = (now: number) => {
      const value = progressFromTime((now - startedAt) / duration, durations)
      if (value >= 0.95) {
        finish()
        return
      }
      if (now - lastPaint >= FRAME_GAP_MS) {
        lastPaint = now
        setProgress(value)
        while (nextCue < CUES.length && value >= CUES[nextCue].at) CUES[nextCue++].play()
        if (!chimed.current && value >= BLOOM_START) {
          chimed.current = true
          soundManager.playBloomChime(bloomSpanSec)
        }
      }
      frame.current = requestAnimationFrame(loop)
    }
    frame.current = requestAnimationFrame(loop)
  }, [stop, finish, durations])

  const skip = useCallback(() => {
    if (frame.current) finish()
  }, [finish])

  return { progress, stage: stageFromProgress(progress), play, skip }
}
