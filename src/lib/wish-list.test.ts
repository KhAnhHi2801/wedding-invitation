import { describe, expect, it } from "vitest"
import { fillText } from "./wish-list"

describe("fillText", () => {
  it("thay chỗ giữ chỗ trong mẫu chữ, khóa lạ giữ nguyên", () => {
    expect(fillText("Trang {n} trên {total}", { n: 2, total: 6 })).toBe("Trang 2 trên 6")
    expect(fillText("Đọc lời chúc của {name}", { name: "Lan" })).toBe("Đọc lời chúc của Lan")
    expect(fillText("{x} và {n}", { n: 1 })).toBe("{x} và 1")
  })
})
