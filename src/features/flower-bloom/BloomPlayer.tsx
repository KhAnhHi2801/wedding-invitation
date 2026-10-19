import { useLayoutEffect, type ReactNode } from "react";
import type { FlowerDefinition } from "../../types/flower";
import { BotanicalFlowerEngine } from "./BotanicalFlowerEngine";
import { useBloomProgress } from "./use-bloom-progress";

export type BloomMode = "idle" | "bare" | "growing" | "bloomed";

interface BloomPlayerProps {
  flower: FlowerDefinition;
  /** idle: xem trước hoa đã nở của loài đang chọn; bare: chậu trống (hạt chưa rơi tới); growing: mọc từ hạt; bloomed: đã nở */
  mode: BloomMode;
  /** Gọi một lần khi hoa mọc xong */
  onGrown: () => void;
  /** Gọi khi quầng sáng sau khi nở hoàn tất */
  onGlowComplete?: () => void;
  skipLabel: string;
  /** Lớp phủ đúng khung bông hoa (ví dụ cảnh hạt rơi) */
  children?: ReactNode;
}

/**
 * Bông hoa đang mọc. Tiến trình (cập nhật ~30 lần/giây) là state của riêng component này, nên chỉ engine và nút bỏ qua
 * render lại, không kéo section vườn hoa theo.
 */
export function BloomPlayer({
  flower,
  mode,
  onGrown,
  onGlowComplete,
  skipLabel,
  children,
}: BloomPlayerProps) {
  const { progress, stage, play, skip } = useBloomProgress(onGrown);

  // Layout effect: đặt lại tiến trình về 0 trước khi trình duyệt vẽ, khỏi chớp một khung hoa đã nở khi bắt đầu gieo lần nữa
  useLayoutEffect(() => {
    if (mode === "growing") play();
  }, [mode, play]);

  // Chưa gieo thì cho xem trước hoa đã nở, khung không bị trống
  const growing = mode === "growing";
  const bare = mode === "bare";
  const shown = growing ? progress : bare ? 0 : 1;
  const shownStage = growing ? stage : bare ? "seed" : "completed";
  const lite = document.documentElement.classList.contains("lite");

  return (
    <div className="player" data-mode={mode}>
      <BotanicalFlowerEngine
        flower={flower}
        stage={shownStage}
        progress={shown}
        bloomed={mode === "bloomed"}
        onGlowComplete={onGlowComplete}
        lite={lite}
        showSeed={!bare}
      />
      {children}
      {/* {mode === "growing" && (
        <button type="button" className="player__skip" onClick={skip}>
          {skipLabel}
        </button>
      )} */}
    </div>
  );
}
