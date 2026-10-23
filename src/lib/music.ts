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
// Đang hạ nhạc để nhường chỗ cho hiệu ứng khác (gieo hạt nảy mầm): nhạc vẫn chạy, chỉ nhỏ xuống `duckRatio` chứ không tắt hẳn
let ducked = false
let fadeTimer = 0
// Nhỏ xuống nhanh vừa phải, lớn lại chậm hơn để nhạc "trở về" nhẹ nhàng, không giật mình
const DUCK_MS = 1200
const RELEASE_MS = 2400
const FADE_STEP_MS = 40
// Âm lượng qua GainNode: iOS Safari bỏ qua `HTMLMediaElement.volume` nên chỉ cách này mới nhỏ/lớn dần được trên iPhone
let ctx: AudioContext | null = null
let gain: GainNode | null = null
const listeners = new Set<() => void>()

function setState(next: MusicState) {
  if (state === next) return
  state = next
  listeners.forEach((listener) => listener())
}

const targetVolume = () => weddingConfig.music.volume * (ducked ? weddingConfig.music.duckRatio : 1)

/** Nối <audio> qua GainNode (tạo trong thao tác của khách để được phép phát); không có Web Audio thì dùng `volume` của phần tử. */
function connectGain(element: HTMLAudioElement) {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    const context = new Ctor()
    const node = context.createGain()
    node.gain.value = targetVolume()
    context.createMediaElementSource(element).connect(node)
    node.connect(context.destination)
    element.volume = 1
    ctx = context
    gain = node
  } catch {
    ctx = null
    gain = null
  }
}

/** Đưa âm lượng về mức đích từ từ (nhỏ dần khi hạ, lớn dần khi trả); số bước cố định nên không bao giờ chạy mãi. */
function fadeToTarget() {
  window.clearInterval(fadeTimer)
  const ms = ducked ? DUCK_MS : RELEASE_MS
  if (gain && ctx) {
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(targetVolume(), now + ms / 1000)
    return
  }
  if (!audio) return
  const element = audio
  const goal = targetVolume()
  const from = element.volume
  const steps = Math.round(ms / FADE_STEP_MS)
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
  connectGain(element)
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
  // iOS giữ AudioContext ở trạng thái treo cho tới khi có thao tác của khách
  void ctx?.resume()
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
