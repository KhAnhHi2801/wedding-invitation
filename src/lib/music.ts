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
// Đang hạ nhạc để nhường chỗ cho hiệu ứng khác (gieo hạt nảy mầm): nhạc vẫn chạy ngầm ở volume 0
let ducked = false
let fadeTimer = 0
const FADE_MS = 400
const FADE_STEP_MS = 40
const listeners = new Set<() => void>()

function setState(next: MusicState) {
  if (state === next) return
  state = next
  listeners.forEach((listener) => listener())
}

const targetVolume = () => (ducked ? 0 : weddingConfig.music.volume)

/**
 * Đưa volume về mức đích từ từ trong FADE_MS rồi đặt đúng giá trị cuối; số bước cố định nên không bao giờ chạy mãi.
 * Hạ nhạc thật sự dựa vào `muted` vì iOS Safari bỏ qua `volume` (fade chỉ có tác dụng ở nơi volume ghi được).
 * Nhạc không dừng phát nên phát lại không cần thao tác chạm mới.
 */
function fadeToTarget() {
  window.clearInterval(fadeTimer)
  if (!audio) return
  const element = audio
  const goal = targetVolume()
  // Tắt tiếng ngay khi duck; bật lại trước khi nhạc fade lên
  if (ducked) element.muted = true
  else element.muted = false
  const from = element.volume
  const steps = Math.round(FADE_MS / FADE_STEP_MS)
  let tick = 0
  fadeTimer = window.setInterval(() => {
    tick += 1
    element.volume = tick >= steps ? goal : from + ((goal - from) * tick) / steps
    if (tick >= steps) window.clearInterval(fadeTimer)
  }, FADE_STEP_MS)
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio
  const element = new Audio(assetUrl(weddingConfig.music.src))
  element.loop = true
  element.preload = "none"
  element.volume = targetVolume()
  element.muted = ducked
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

/** Hạ nhạc về 0 (nhạc vẫn chạy ngầm). Nút nhạc và trạng thái phát không đổi; khách tắt nhạc thì release không bật lại. */
function duck() {
  if (ducked) return
  ducked = true
  fadeToTarget()
}

function release() {
  if (!ducked) return
  ducked = false
  fadeToTarget()
}

export const music = {
  play,
  pause,
  duck,
  release,
  toggle: () => (state === "playing" ? pause() : play()),
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getState: () => state,
}

export const useMusicState = (): MusicState => useSyncExternalStore(music.subscribe, music.getState)
