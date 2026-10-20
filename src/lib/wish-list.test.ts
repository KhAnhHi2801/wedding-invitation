import { describe, expect, it } from "vitest"
import { fillText, nextShown, WISH_LIST_STEP, WISH_PREVIEW } from "./wish-list"

describe("chia lượt danh sách lời chúc", () => {
  it("dựng thêm đúng một lượt và không vượt tổng", () => {
    expect(nextShown(0, 100)).toBe(WISH_LIST_STEP)
    expect(nextShown(WISH_LIST_STEP, 25)).toBe(25)
    expect(nextShown(25, 25)).toBe(25)
    expect(nextShown(0, 0)).toBe(0)
    expect(nextShown(0, 100, WISH_PREVIEW)).toBe(WISH_PREVIEW)
  })

  it("thay chỗ giữ chỗ trong mẫu chữ, khóa lạ giữ nguyên", () => {
    expect(fillText("Xem tất cả ({n})", { n: 6 })).toBe("Xem tất cả (6)")
    expect(fillText("Đọc lời chúc của {name}", { name: "Lan" })).toBe("Đọc lời chúc của Lan")
    expect(fillText("{x} và {n}", { n: 1 })).toBe("{x} và 1")
  })
})
