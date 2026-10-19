import { useEffect } from "react"
import type { FlowerDefinition } from "../../types/flower"
import { BotanicalFlowerEngine } from "./BotanicalFlowerEngine"
import { useBloomProgress } from "./use-bloom-progress"

export type BloomMode = "idle" | "growing" | "bloomed"

interface BloomPlayerProps {
  flower: FlowerDefinition
  /** idle: hạt nằm trong đất; growing: đang mọc; bloomed: đã nở */
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

  useEffect(() => {
    if (mode === "growing") play()
  }, [mode, play])

  const shown = mode === "growing" ? progress : mode === "bloomed" ? 1 : 0
  const shownStage = mode === "bloomed" ? "completed" : mode === "idle" ? "seed" : stage
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
