import { useSyncExternalStore } from "react"
import { weddingConfig } from "../config/wedding-config"
import { assetUrl } from "./asset-url"

export type MusicState = "idle" | "playing" | "paused" | "unavailable"

/**
 * Nhạc nền dùng chung toàn trang. Chỉ tạo <audio> khi cần và chỉ phát sau thao tác của người dùng
 * (trình duyệt, nhất là iOS, chặn tự phát). Không tải file nhạc cho tới lúc phát lần đầu.
 */
let audio: HTMLAudioElement | null = null
let state: MusicState = "idle"
let resumeAfterHidden = false
const listeners = new Set<() => void>()

function setState(next: MusicState) {
  if (state === next) return
  state = next
  listeners.forEach((listener) => listener())
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio
  const element = new Audio(assetUrl(weddingConfig.music.src))
  element.loop = true
  element.preload = "none"
  element.volume = weddingConfig.music.volume
  // File nhạc thiếu hoặc hỏng: ẩn nút nhạc, không báo lỗi cho khách
  element.addEventListener("error", () => setState("unavailable"))
  // Hệ điều hành có thể tự dừng nhạc (cuộc gọi, Control Center): nút luôn phản ánh trạng thái thật
  element.addEventListener("pause", () => {
    if (state === "playing") setState("paused")
  })
  element.addEventListener("play", () => {
    if (state !== "unavailable") setState("playing")
  })
  audio = element
  return element
}

/** Gọi trực tiếp trong handler của thao tác người dùng (click/tap), nếu không iOS sẽ từ chối. */
function play() {
  if (state === "unavailable") return
  ensureAudio()
    .play()
    .then(() => setState("playing"))
    .catch(() => {
      if (state !== "unavailable") setState("paused")
    })
}

function pause() {
  audio?.pause()
  if (state !== "unavailable") setState("paused")
}

if (typeof document !== "undefined") {
  // Tạm dừng khi khách chuyển tab hoặc khóa màn hình, quay lại thì phát tiếp nếu trước đó đang phát
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "playing") {
      resumeAfterHidden = true
      audio?.pause()
      setState("paused")
    } else if (!document.hidden && resumeAfterHidden) {
      resumeAfterHidden = false
      play()
    }
  })
}

export const music = {
  play,
  pause,
  toggle: () => (state === "playing" ? pause() : play()),
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getState: () => state,
}

export const useMusicState = (): MusicState => useSyncExternalStore(music.subscribe, music.getState)
