import { describe, expect, it } from "vitest"
import { buildMonthGrid } from "./build-calendar"
import { getEventParts } from "./event-date"

describe("getEventParts", () => {
  it("tách đúng ngày giờ theo giờ Việt Nam", () => {
    const parts = getEventParts("2026-12-24T10:30:00+07:00")
    expect([parts.day, parts.month, parts.year, parts.timeLabel, parts.weekdayUpper, parts.monthShortEn]).toEqual([
      24,
      12,
      2026,
      "10:30",
      "THỨ NĂM",
      "Dec",
    ])
  })

  it("ca nửa đêm không bị lùi sang ngày hôm trước", () => {
    const parts = getEventParts("2026-12-24T00:30:00+07:00")
    expect([parts.day, parts.timeLabel, parts.weekdayUpper]).toEqual([24, "00:30", "THỨ NĂM"])
  })

  it("báo lỗi rõ ràng khi chuỗi ngày sai", () => {
    expect(() => getEventParts("không phải ngày")).toThrow(/startsAt/)
  })
})

describe("buildMonthGrid (tuần bắt đầu thứ Hai)", () => {
  it("tháng 12/2026 bắt đầu thứ Ba: 1 ô trống rồi 31 ngày", () => {
    const grid = buildMonthGrid(2026, 12)
    expect(grid.length).toBe(32)
    expect(grid[0]).toBeNull()
    expect(grid[1]).toBe(1)
    expect(grid.indexOf(24)).toBe(24)
  })

  it("tháng bắt đầu thứ Hai không có ô trống đầu", () => {
    expect(buildMonthGrid(2026, 6)[0]).toBe(1)
  })

  it("tháng bắt đầu Chủ nhật có 6 ô trống đầu", () => {
    expect(buildMonthGrid(2026, 2).findIndex((cell) => cell === 1)).toBe(6)
  })

  it("tháng 2 năm nhuận có 29 ngày", () => {
    expect(buildMonthGrid(2028, 2).filter((cell) => cell !== null).length).toBe(29)
  })
})
