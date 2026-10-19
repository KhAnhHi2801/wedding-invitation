import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { FLOWER_DEFINITIONS } from "../config/flower-botanical"
import { flowerWishes } from "../config/flower-wishes"
import { entryFor, FLOWER_ENTRIES, hashText } from "./flower-entries"

describe("dữ liệu loài hoa", () => {
  it("hình dáng và nội dung khớp nhau theo id, đủ 15 loài", () => {
    expect(FLOWER_ENTRIES).toHaveLength(15)
    expect(FLOWER_DEFINITIONS.map((f) => f.id).sort()).toEqual(flowerWishes.map((f) => f.id).sort())
  })

  it("mỗi loài có đủ nội dung để chơi: chủ đề, câu nảy mầm, gợi ý, lời chúc mẫu, lời cảm ơn", () => {
    for (const { wish } of FLOWER_ENTRIES) {
      expect(wish.theme.length, wish.id).toBeGreaterThan(0)
      expect(wish.message.length, wish.id).toBeGreaterThan(0)
      expect(wish.prompts.length, wish.id).toBeGreaterThan(0)
      expect(wish.wishes.length, wish.id).toBeGreaterThan(1)
      expect(wish.replies.length, wish.id).toBeGreaterThan(0)
    }
  })

  it("FLOWER_IDS trong apps-script/wishes.gs khớp đúng id của website", () => {
    const script = readFileSync(new URL("../../apps-script/wishes.gs", import.meta.url), "utf8")
    const block = script.match(/var FLOWER_IDS = \[([\s\S]*?)\];/)?.[1] ?? ""
    const ids = [...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1])
    expect(ids.sort()).toEqual(FLOWER_ENTRIES.map((e) => e.def.id).sort())
  })
})

describe("entryFor", () => {
  it("trả đúng loài theo id", () => {
    expect(entryFor("rose", "x").def.id).toBe("rose")
  })

  it("id rỗng hoặc lạ thì chọn cố định theo seed (cùng seed luôn ra cùng loài)", () => {
    const a = entryFor("", "Lan|Chúc mừng")
    expect(entryFor("không-có", "Lan|Chúc mừng").def.id).toBe(a.def.id)
    expect(FLOWER_ENTRIES.map((e) => e.def.id)).toContain(a.def.id)
  })

  it("hashText ổn định và phân tán", () => {
    expect(hashText("abc")).toBe(hashText("abc"))
    expect(hashText("abc")).not.toBe(hashText("abd"))
  })
})
