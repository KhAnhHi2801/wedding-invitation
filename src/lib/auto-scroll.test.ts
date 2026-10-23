import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type FrameCallback = (time: number) => void

/** Môi trường giả tối thiểu: window/document, rAF điều khiển tay, scrollTo ghi lại vị trí */
function setup() {
  let frame: FrameCallback | null = null
  const win = {
    scrollY: 0,
    innerHeight: 800,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    scrollTo: vi.fn((options: { top: number }) => {
      win.scrollY = options.top
    }),
    setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
    clearTimeout: (id: Parameters<typeof clearTimeout>[0]) => clearTimeout(id),
  }
  const doc = { hidden: false, documentElement: { scrollHeight: 5000, classList: new Set<string>() } }
  Object.assign(doc.documentElement.classList, { contains: (name: string) => doc.documentElement.classList.has(name) })
  vi.stubGlobal("Element", class {})
  vi.stubGlobal("window", win)
  vi.stubGlobal("document", doc)
  vi.stubGlobal("requestAnimationFrame", (callback: FrameCallback) => {
    frame = callback
    return 1
  })
  vi.stubGlobal("cancelAnimationFrame", () => {
    frame = null
  })
  return {
    win,
    doc,
    step: (time: number) => frame?.(time),
    hasFrame: () => frame !== null,
  }
}

async function load() {
  vi.resetModules()
  return (await import("./auto-scroll")).autoScroll
}

describe("autoScroll", () => {
  beforeEach(() => setup())
  afterEach(() => vi.unstubAllGlobals())

  it("cuộn theo tốc độ cấu hình (45 px/s)", async () => {
    const env = setup()
    const autoScroll = await load()
    autoScroll.start()
    env.step(1000) // khung đầu chỉ lấy mốc thời gian
    env.step(1016)
    env.step(1032)
    expect(env.win.scrollY).toBeCloseTo((45 * 32) / 1000, 1)
    // html có scroll-behavior: smooth nên phải ép tức thời, nếu không mỗi khung hình khởi động lại một animation
    expect(env.win.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "instant" }))
    expect(autoScroll.getSnapshot()).toBe(true)
  })

  it("dừng khi khách tự cuộn lệch vị trí", async () => {
    const env = setup()
    const autoScroll = await load()
    autoScroll.start()
    env.step(1000)
    env.step(1016)
    env.win.scrollY = 400
    env.step(1032)
    expect(autoScroll.getSnapshot()).toBe(false)
    expect(env.hasFrame()).toBe(false)
  })

  it("dừng ở cuối trang", async () => {
    const env = setup()
    env.win.scrollY = 4199
    const autoScroll = await load()
    autoScroll.start()
    env.step(1000)
    env.step(1016)
    expect(env.win.scrollY).toBe(4200)
    expect(autoScroll.getSnapshot()).toBe(false)
  })

  it("nghỉ khi có modal (is-locked) mà không dừng", async () => {
    const env = setup()
    const autoScroll = await load()
    autoScroll.start()
    env.step(1000)
    env.win.scrollTo.mockClear()
    env.doc.documentElement.classList.add("is-locked")
    env.step(1016)
    env.step(1032)
    expect(env.win.scrollTo).not.toHaveBeenCalled()
    expect(autoScroll.getSnapshot()).toBe(true)
  })

  it("khách thao tác trong lúc chờ thì không tự bắt đầu", async () => {
    const env = setup()
    vi.useFakeTimers()
    const autoScroll = await load()
    autoScroll.startAfter(1500)
    const handler = env.win.addEventListener.mock.calls.find(([type]) => type === "wheel")![1] as (e?: unknown) => void
    handler({ target: {} })
    vi.advanceTimersByTime(2000)
    expect(autoScroll.getSnapshot()).toBe(false)
    vi.useRealTimers()
  })

  it("thao tác của khách dừng hẳn, trừ nút bật/tắt", async () => {
    const env = setup()
    const autoScroll = await load()
    autoScroll.start()
    const handler = env.win.addEventListener.mock.calls.find(([type]) => type === "wheel")![1] as (e: unknown) => void
    class FakeElement {
      closest = () => ({})
    }
    vi.stubGlobal("Element", FakeElement)
    handler({ target: new FakeElement() })
    expect(autoScroll.getSnapshot()).toBe(true)
    handler({ target: {} })
    expect(autoScroll.getSnapshot()).toBe(false)
  })
})
