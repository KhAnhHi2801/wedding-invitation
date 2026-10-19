import { describe, expect, it } from "vitest"
import type { WeddingConfig } from "../config/wedding-config"
import { resolveWeddingEvent } from "./wedding-event"

const base = { startsAt: "2026-12-24T10:30:00+07:00", lunarText: "L", venue: "V", address: "A", mapsQuery: "Q" }
const timeline = [{ time: "08:00", label: "Rước", icon: "car" as const }]
const config = {
  sideParam: "from",
  event: base,
  timeline,
  sides: {
    groom: {},
    bride: { venue: "V-gái", startsAt: "2026-12-20T10:00:00+07:00", timeline: [{ time: "07:00", label: "Đón", icon: "toast" as const }] },
  },
} as unknown as WeddingConfig

describe("resolveWeddingEvent", () => {
  it("không có from: dùng mặc định", () => {
    expect(resolveWeddingEvent(config, "?to=Nam")).toEqual({ side: null, event: base, timeline })
  })

  it("from không hợp lệ: dùng mặc định thay vì lỗi", () => {
    expect(resolveWeddingEvent(config, "?from=hacker").side).toBeNull()
    expect(resolveWeddingEvent(config, "?from=").event).toBe(base)
  })

  it("nhà trai không ghi riêng gì: giữ nguyên mặc định nhưng biết bên", () => {
    const r = resolveWeddingEvent(config, "?from=groom")
    expect(r.side).toBe("groom")
    expect(r.event).toEqual(base)
    expect(r.timeline).toBe(timeline)
  })

  it("nhà gái: ghi đè trường riêng, trường còn lại lấy mặc định, lịch trình riêng", () => {
    const r = resolveWeddingEvent(config, "?to=Lan&from=bride")
    expect(r.side).toBe("bride")
    expect(r.event).toEqual({ ...base, venue: "V-gái", startsAt: "2026-12-20T10:00:00+07:00" })
    expect(r.timeline[0].time).toBe("07:00")
  })

  it("không phân biệt hoa thường và khoảng trắng", () => {
    expect(resolveWeddingEvent(config, "?from=%20Bride%20").side).toBe("bride")
  })

  it("nhà gái không ghi lịch trình riêng: dùng lịch mặc định", () => {
    const noTimeline = { ...config, sides: { ...config.sides, bride: { venue: "X" } } } as WeddingConfig
    expect(resolveWeddingEvent(noTimeline, "?from=bride").timeline).toBe(timeline)
  })
})
