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
    await vi.advanceTimersByTimeAsync(1500)
    expect(music.getState()).toBe("playing")
    // Nhỏ xuống còn một phần nhỏ chứ không tắt hẳn, và không dùng muted
    expect(FakeAudio.last?.volume).toBeCloseTo(0.35 * 0.3)
    expect(FakeAudio.last?.muted).toBe(false)
    music.release()
    await vi.advanceTimersByTimeAsync(1200)
    // Đang lớn dần, chưa tới mức cũ
    expect(FakeAudio.last!.volume).toBeGreaterThan(0.35 * 0.3)
    expect(FakeAudio.last!.volume).toBeLessThan(0.35)
    await vi.advanceTimersByTimeAsync(1500)
    expect(music.getState()).toBe("playing")
    expect(FakeAudio.last?.volume).toBeCloseTo(0.35)
  })

  it("có Web Audio thì nhỏ/lớn dần qua GainNode (iOS bỏ qua volume)", async () => {
    const ramp = vi.fn()
    const gainNode = {
      gain: { value: 0, cancelScheduledValues: vi.fn(), setValueAtTime: vi.fn(), linearRampToValueAtTime: ramp },
      connect: vi.fn(),
    }
    class FakeContext {
      currentTime = 10
      destination = {}
      createGain = () => gainNode
      createMediaElementSource = () => ({ connect: vi.fn() })
      resume = vi.fn()
    }
    vi.stubGlobal("AudioContext", FakeContext)
    const music = await load()
    music.play()
    await vi.advanceTimersByTimeAsync(0)
    music.duck()
    expect(ramp).toHaveBeenLastCalledWith(expect.closeTo(0.35 * 0.3), 10 + 1.2)
    music.release()
    expect(ramp).toHaveBeenLastCalledWith(0.35, 10 + 2.4)
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
