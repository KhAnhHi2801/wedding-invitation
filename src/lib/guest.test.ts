import { afterEach, describe, expect, it, vi } from "vitest"
import { getGuestName, getNamedGuest } from "./guest"

const withQuery = (search: string) => vi.stubGlobal("window", { location: { search } })

afterEach(() => vi.unstubAllGlobals())

describe("getGuestName", () => {
  it("lấy tên từ query và giải mã tiếng Việt", () => {
    withQuery("?to=Anh%20Ho%C3%A0ng")
    expect(getGuestName("to", "Quý Khách")).toBe("Anh Hoàng")
  })

  it("không có query thì dùng tên mặc định", () => {
    withQuery("")
    expect(getGuestName("to", "Quý Khách")).toBe("Quý Khách")
  })

  it("gộp khoảng trắng và bỏ ký tự điều khiển", () => {
    withQuery("?to=%20%20Anh%0A%09%20Nam%20%20")
    expect(getGuestName("to", "Quý Khách")).toBe("Anh Nam")
  })

  it("chuỗi toàn khoảng trắng thì dùng tên mặc định", () => {
    withQuery("?to=%20%20%20")
    expect(getGuestName("to", "Quý Khách")).toBe("Quý Khách")
  })

  it("cắt ở 40 ký tự mà không làm vỡ emoji", () => {
    withQuery(`?to=${encodeURIComponent("a".repeat(39) + "😀" + "b".repeat(10))}`)
    const name = getGuestName("to", "Quý Khách")
    expect(Array.from(name).length).toBe(40)
    expect(name.endsWith("😀")).toBe(true)
  })

  it("giữ nguyên thẻ HTML như văn bản thuần (React sẽ tự escape khi hiển thị)", () => {
    withQuery(`?to=${encodeURIComponent("<img src=x onerror=1>")}`)
    expect(getGuestName("to", "Quý Khách")).toBe("<img src=x onerror=1>")
  })
})

describe("getNamedGuest", () => {
  it("có tên trong link thì trả đúng tên", () => {
    withQuery("?to=Anh%20Nam")
    expect(getNamedGuest("to")).toBe("Anh Nam")
  })

  it("không có tên hoặc chỉ khoảng trắng thì trả chuỗi rỗng, kể cả khi tên trùng chữ mặc định", () => {
    withQuery("")
    expect(getNamedGuest("to")).toBe("")
    withQuery("?to=%20%20")
    expect(getNamedGuest("to")).toBe("")
  })
})
