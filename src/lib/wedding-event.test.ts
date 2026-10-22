import { describe, expect, it } from "vitest"
import type { WeddingConfig } from "../config/wedding-config"
import { resolveWeddingEvent } from "./wedding-event"

const groomEvent = { startsAt: "2026-12-24T10:30:00+07:00", lunarText: "L", venue: "V-trai", address: "A", mapsQuery: "Q" }
const groomTimeline = [{ time: "08:00", label: "Rước", icon: "car" as const }]
const brideEvent = { ...groomEvent, venue: "V-gai", startsAt: "2026-12-20T10:00:00+07:00" }
const brideTimeline = [{ time: "07:00", label: "Đón", icon: "toast" as const }]
const config = {
  sideParam: "from",
  defaultSide: "groom",
  sides: {
    groom: { ...groomEvent, timeline: groomTimeline },
    bride: { ...brideEvent, timeline: brideTimeline },
  },
} as unknown as WeddingConfig

describe("resolveWeddingEvent", () => {
  it("không có from: dùng bên mặc định nhưng không gán bên", () => {
    expect(resolveWeddingEvent(config, "?to=Nam")).toEqual({ side: null, event: groomEvent, timeline: groomTimeline })
  })

  it("from không hợp lệ: dùng bên mặc định thay vì lỗi", () => {
    expect(resolveWeddingEvent(config, "?from=hacker").side).toBeNull()
    expect(resolveWeddingEvent(config, "?from=").event).toEqual(groomEvent)
  })

  it("nhà trai: dùng thông tin và lịch trình nhà trai", () => {
    const r = resolveWeddingEvent(config, "?from=groom")
    expect(r.side).toBe("groom")
    expect(r.event).toEqual(groomEvent)
    expect(r.timeline).toBe(groomTimeline)
  })

  it("nhà gái: dùng thông tin và lịch trình nhà gái", () => {
    const r = resolveWeddingEvent(config, "?to=Lan&from=bride")
    expect(r.side).toBe("bride")
    expect(r.event).toEqual(brideEvent)
    expect(r.timeline).toBe(brideTimeline)
  })

  it("không phân biệt hoa thường và khoảng trắng", () => {
    expect(resolveWeddingEvent(config, "?from=%20Bride%20").side).toBe("bride")
  })

  it("bên mặc định đổi được: defaultSide là nhà gái thì link không có from lấy nhà gái", () => {
    const brideDefault = { ...config, defaultSide: "bride" } as WeddingConfig
    expect(resolveWeddingEvent(brideDefault, "").event.venue).toBe("V-gai")
  })
})
