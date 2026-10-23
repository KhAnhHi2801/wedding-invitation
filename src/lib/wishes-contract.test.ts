import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { weddingConfig } from "../config/wedding-config"
import { GUESTS_MAX, NAME_MAX as RSVP_NAME_MAX, NOTE_MAX } from "./rsvp-validation"
import { DEFAULT_INK } from "./wish-style"
import { MESSAGE_MAX, MESSAGE_MIN, NAME_MAX, PROFANITY_WORDS } from "./wish-validation"

/** Website và `apps-script/wishes.gs` giữ bản sao của các hằng số này: test này bắt trường hợp chỉ sửa một nơi. */
const script = readFileSync(new URL("../../apps-script/wishes.gs", import.meta.url), "utf8")

const numberVar = (name: string): number => {
  const match = script.match(new RegExp(`var ${name} = (\\d+)`))
  if (!match) throw new Error(`Không thấy biến ${name} trong wishes.gs`)
  return Number(match[1])
}

const listVar = (name: string): string[] => {
  const block = script.match(new RegExp(`var ${name} = \\[([\\s\\S]*?)\\];`))?.[1] ?? ""
  return [...block.matchAll(/'([^']+)'/g)].map((m) => m[1])
}

describe("hợp đồng website và wishes.gs", () => {
  it("giới hạn độ dài khớp nhau", () => {
    expect(numberVar("NAME_MAX")).toBe(NAME_MAX)
    expect(numberVar("MESSAGE_MIN")).toBe(MESSAGE_MIN)
    expect(numberVar("MESSAGE_MAX")).toBe(MESSAGE_MAX)
    expect(numberVar("RSVP_NAME_MAX")).toBe(RSVP_NAME_MAX)
    expect(numberVar("RSVP_NOTE_MAX")).toBe(NOTE_MAX)
    expect(numberVar("RSVP_GUESTS_MAX")).toBe(GUESTS_MAX)
  })

  it("điểm đón xe chung khớp nhau", () => {
    const ids = [...script.matchAll(/^\s+'([a-z-]+)': '/gm)].map((m) => m[1])
    expect(ids.sort()).toEqual(weddingConfig.rsvp.form.pickupOptions.map((option) => option.id).sort())
  })

  it("danh sách từ cấm khớp nhau", () => {
    expect([...listVar("PROFANITY")].sort()).toEqual([...PROFANITY_WORDS].sort())
  })

  it("khóa màu mặc định gửi lên Sheet nằm trong danh sách script chấp nhận", () => {
    expect(listVar("INK_KEYS")).toContain(DEFAULT_INK)
  })

  it("mọi mã lỗi script trả về đều được client xử lý (không rơi vào 'server' tạm thời)", () => {
    const codes = new Set([...script.matchAll(/error: '([a-z_]+)'/g)].map((m) => m[1]))
    const handled = new Set([
      "invalid",
      "name_required",
      "name_too_long",
      "message_too_short",
      "message_too_long",
      "note_too_long",
      "rate_limited",
      "too_fast",
      "server",
    ])
    for (const code of codes) expect(handled.has(code), `mã lỗi chưa được client xử lý: ${code}`).toBe(true)
  })
})
