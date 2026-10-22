import { beforeEach, describe, expect, it, vi } from "vitest"

const fetchWishes = vi.fn()
vi.mock("./wishes-api", () => ({ fetchWishes: (onPage?: unknown) => fetchWishes(onPage) }))

const wish = (name: string, message = "Chúc mừng") => ({ id: `id-${name}`, name, message, flower: "rose", ink: "" })

describe("wishes-store", () => {
  beforeEach(() => {
    vi.resetModules()
    fetchWishes.mockReset()
  })

  it("chỉ tải một lần dù gọi nhiều lần, `force` mới tải lại", async () => {
    fetchWishes.mockResolvedValue([wish("A")])
    const { loadWishes, useWishes } = await import("./wishes-store")
    await Promise.all([loadWishes(), loadWishes()])
    await loadWishes()
    expect(fetchWishes).toHaveBeenCalledTimes(1)
    expect(useWishes.getState()).toMatchObject({ loaded: true, loading: false })
    await loadWishes(true)
    expect(fetchWishes).toHaveBeenCalledTimes(2)
  })

  it("lời chúc vừa gửi hiện ngay ở đầu danh sách, trước cả khi tải xong", async () => {
    fetchWishes.mockResolvedValue([wish("Xa")])
    const { loadWishes, addOwnWish, useWishes } = await import("./wishes-store")
    addOwnWish({ name: "Toi", message: "Chúc hai bạn", flower: "peony", ink: "wine" })
    expect(useWishes.getState().wishes.map((w) => w.name)).toEqual(["Toi"])
    await loadWishes()
    expect(useWishes.getState().wishes.map((w) => w.name)).toEqual(["Toi", "Xa"])
  })

  it("bỏ trùng khi Sheet đã có đúng lời chúc đó, ưu tiên bản từ Sheet", async () => {
    fetchWishes.mockResolvedValue([wish("Toi", "Chúc hai bạn")])
    const { loadWishes, addOwnWish, useWishes } = await import("./wishes-store")
    addOwnWish({ name: "Toi", message: "Chúc hai bạn", flower: "peony", ink: "" })
    await loadWishes()
    const list = useWishes.getState().wishes
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe("id-Toi")
  })

  it("lỗi mạng khi đọc: vẫn đánh dấu đã tải và giữ lời chúc của khách", async () => {
    fetchWishes.mockRejectedValue(new Error("offline"))
    const { loadWishes, addOwnWish, useWishes } = await import("./wishes-store")
    addOwnWish({ name: "Toi", message: "Chúc", flower: "rose", ink: "" })
    await expect(loadWishes()).rejects.toThrow()
    expect(useWishes.getState()).toMatchObject({ loaded: true, loading: false })
    expect(useWishes.getState().wishes).toHaveLength(1)
  })

  it("hiện từng trang ngay khi về, không chờ đọc hết", async () => {
    let page: (list: ReturnType<typeof wish>[]) => void = () => {}
    let finish: (list: ReturnType<typeof wish>[]) => void = () => {}
    fetchWishes.mockImplementation((onPage: typeof page) => {
      page = onPage
      return new Promise((resolve) => (finish = resolve))
    })
    const { loadWishes, useWishes } = await import("./wishes-store")
    const loading = loadWishes()
    page([wish("A")])
    expect(useWishes.getState().wishes.map((w) => w.name)).toEqual(["A"])
    expect(useWishes.getState().loaded).toBe(false)
    finish([wish("A"), wish("B")])
    await loading
    expect(useWishes.getState().wishes.map((w) => w.name)).toEqual(["A", "B"])
    expect(useWishes.getState().loaded).toBe(true)
  })
})
