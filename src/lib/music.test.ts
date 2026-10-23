import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

class FakeAudio {
  static last: FakeAudio | null = null
  constructor() {
    FakeAudio.last = this
  }
  volume = 1
  muted = false
  loop = false
  preload = ""
  paused = true
  private handlers: Record<string, Array<() => void>> = {}
  addEventListener(type: string, handler: () => void) {
    ;(this.handlers[type] ??= []).push(handler)
  }
  play() {
    this.paused = false
    this.handlers.play?.forEach((handler) => handler())
    return Promise.resolve()
  }
  pause() {
    this.paused = true
    this.handlers.pause?.forEach((handler) => handler())
  }
}

async function load() {
  vi.resetModules()
  const { music } = await import("./music")
  return music
}

describe("music duck/release", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal("Audio", FakeAudio)
    vi.stubGlobal("window", globalThis)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("hạ volume về 0 khi duck, giữ trạng thái playing, trả lại khi release", async () => {
    const music = await load()
    music.play()
    await vi.advanceTimersByTimeAsync(0)
    music.duck()
    await vi.advanceTimersByTimeAsync(600)
    expect(music.getState()).toBe("playing")
    expect(FakeAudio.last?.volume).toBe(0)
    expect(FakeAudio.last?.muted).toBe(true)
    music.release()
    await vi.advanceTimersByTimeAsync(600)
    expect(music.getState()).toBe("playing")
    expect(FakeAudio.last?.volume).toBeCloseTo(0.35)
    expect(FakeAudio.last?.muted).toBe(false)
  })

  it("khách tắt nhạc lúc đang duck thì release không bật lại", async () => {
    const music = await load()
    music.play()
    await vi.advanceTimersByTimeAsync(0)
    music.duck()
    music.pause()
    music.release()
    await vi.advanceTimersByTimeAsync(600)
    expect(music.getState()).toBe("paused")
  })
})
