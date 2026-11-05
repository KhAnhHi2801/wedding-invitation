import { describe, expect, it } from "vitest"
import { gameLink } from "./game-link"

const URL_GAME = "https://example.vercel.app/"

describe("gameLink", () => {
  it("giữ nguyên URL khi không có tên khách", () => {
    expect(gameLink(URL_GAME, "to", "")).toBe(URL_GAME)
  })

  it("thêm tên khách vào query, mã hóa dấu cách và tiếng Việt", () => {
    const result = new URL(gameLink(URL_GAME, "to", "Chị Dung"))
    expect(result.searchParams.get("to")).toBe("Chị Dung")
  })

  it("giữ tham số có sẵn và ghi đè tham số trùng tên", () => {
    const result = new URL(gameLink("https://example.vercel.app/?lang=vi&to=cu", "to", "Anh Nam"))
    expect(result.searchParams.get("lang")).toBe("vi")
    expect(result.searchParams.getAll("to")).toEqual(["Anh Nam"])
  })

  it("trả nguyên văn khi URL cấu hình không hợp lệ", () => {
    expect(gameLink("khong-phai-url", "to", "Anh Nam")).toBe("khong-phai-url")
  })
})
