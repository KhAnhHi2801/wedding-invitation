import { useLayoutEffect } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { BotanicalFlowerEngine } from "./BotanicalFlowerEngine"
import { useBloomProgress } from "./use-bloom-progress"

export type BloomMode = "idle" | "growing" | "bloomed"

interface BloomPlayerProps {
  flower: FlowerDefinition
  /** idle: xem trước hoa đã nở của loài đang chọn; growing: đang mọc từ hạt; bloomed: đã nở */
  mode: BloomMode
  /** Gọi một lần khi hoa mọc xong */
  onGrown: () => void
  skipLabel: string
}

/**
 * Bông hoa đang mọc. Tiến trình (cập nhật ~30 lần/giây) là state của riêng component này, nên chỉ engine và nút bỏ qua
 * render lại, không kéo section vườn hoa theo.
 */
export function BloomPlayer({ flower, mode, onGrown, skipLabel }: BloomPlayerProps) {
  const { progress, stage, play, skip } = useBloomProgress(onGrown)

  // Layout effect: đặt lại tiến trình về 0 trước khi trình duyệt vẽ, khỏi chớp một khung hoa đã nở khi bắt đầu gieo lần nữa
  useLayoutEffect(() => {
    if (mode === "growing") play()
  }, [mode, play])

  // Chưa gieo thì cho xem trước hoa đã nở, khung không bị trống
  const growing = mode === "growing"
  const shown = growing ? progress : 1
  const shownStage = growing ? stage : "completed"
  const lite = document.documentElement.classList.contains("lite")

  return (
    <div className="player">
      <BotanicalFlowerEngine flower={flower} stage={shownStage} progress={shown} lite={lite} />
      {mode === "growing" && (
        <button type="button" className="player__skip" onClick={skip}>
          {skipLabel}
        </button>
      )}
    </div>
  )
}
