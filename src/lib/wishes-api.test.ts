import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

interface Sent {
  name: string
  message: string
  flower: string
  requestId: string
  token: string
  elapsedMs: number
}

const wish = (name: string) => ({ name, message: `Chúc mừng từ ${name}`, flower: "rose", ink: "wine" })

function setup(endpoint: string, responses: Array<unknown | "offline">) {
  const store = new Map<string, string>()
  const sent: Sent[] = []
  const queue = [...responses]
  const fetchMock = vi.fn(async (_url: string, init: { body: string }) => {
    sent.push(JSON.parse(init.body) as Sent)
    const next = queue.length > 1 ? queue.shift() : queue[0]
    if (next === "offline") throw new Error("offline")
    return { json: async () => next }
  })
  vi.stubEnv("VITE_WISHES_ENDPOINT", endpoint)
  vi.stubGlobal("fetch", fetchMock)
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  })
  vi.stubGlobal("window", {
    setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
    clearTimeout: (id: number) => clearTimeout(id),
    addEventListener: () => {},
    location: { search: "" },
  })
  return { sent, store, fetchMock }
}

const flushAll = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve()
}

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("hàng đợi gửi lời chúc", () => {
  it("gửi thành công: đúng nội dung, có requestId và token, hàng đợi trống", async () => {
    const { sent, store } = setup("https://example.test/exec", [{ ok: true }])
    const { submitWish } = await import("./wishes-api")
    submitWish(wish("Lan"))
    await flushAll()
    expect(sent).toHaveLength(1)
    expect(sent[0]).toMatchObject({ name: "Lan", flower: "rose" })
    expect(sent[0].requestId).toBeTruthy()
    expect(sent[0].token).toBeTruthy()
    expect(JSON.parse(store.get("wedding-pending-wishes") ?? "[]")).toEqual([])
  })

  it("lời chúc bị script từ chối vĩnh viễn (quá dài...) thì bỏ đi và không chặn lời chúc sau", async () => {
    const { sent, store } = setup("https://example.test/exec", [{ ok: false, error: "message_too_long" }, { ok: true }])
    const { submitWish } = await import("./wishes-api")
    submitWish(wish("A"))
    submitWish(wish("B"))
    await flushAll()
    expect(sent.map((s) => s.name)).toEqual(["A", "B"])
    expect(JSON.parse(store.get("wedding-pending-wishes") ?? "[]")).toEqual([])
  })

  it("mất mạng: giữ lại và tự gửi lại sau vài giây với cùng requestId", async () => {
    const { sent, store } = setup("https://example.test/exec", ["offline", { ok: true }])
    const { submitWish } = await import("./wishes-api")
    submitWish(wish("Lan"))
    await flushAll()
    expect(JSON.parse(store.get("wedding-pending-wishes") ?? "[]")).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(3_100)
    await flushAll()
    expect(sent).toHaveLength(2)
    expect(sent[1].requestId).toBe(sent[0].requestId)
    expect(JSON.parse(store.get("wedding-pending-wishes") ?? "[]")).toEqual([])
  })

  it("lỗi tạm thời của script (hết lượt, gửi nhanh, máy chủ bận) cũng được giữ lại để gửi sau", async () => {
    for (const error of ["rate_limited", "too_fast", "server"]) {
      vi.resetModules()
      const { store } = setup("https://example.test/exec", [{ ok: false, error }])
      const { submitWish } = await import("./wishes-api")
      submitWish(wish("Lan"))
      await flushAll()
      expect(JSON.parse(store.get("wedding-pending-wishes") ?? "[]"), error).toHaveLength(1)
    }
  })

  it("chưa nối Google Sheet: không gọi mạng, lời chúc vẫn nằm trong hàng đợi", async () => {
    const { fetchMock, store } = setup("", [{ ok: true }])
    const { submitWish } = await import("./wishes-api")
    submitWish(wish("Lan"))
    await vi.advanceTimersByTimeAsync(120_000)
    await flushAll()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(JSON.parse(store.get("wedding-pending-wishes") ?? "[]")).toHaveLength(1)
  })
})
