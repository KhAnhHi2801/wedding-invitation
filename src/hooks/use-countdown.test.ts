import { describe, expect, it } from "vitest"
import { computeCountdown } from "./use-countdown"

const target = Date.parse("2026-12-24T10:30:00+07:00")

describe("computeCountdown", () => {
  it("tách đúng ngày, giờ, phút, giây", () => {
    const now = target - ((66 * 24 + 0) * 3600 + 36 * 60 + 13) * 1000
    expect(computeCountdown(target, now)).toEqual({ days: 66, hours: 0, minutes: 36, seconds: 13 })
  })

  it("còn đúng 1 giây", () => {
    expect(computeCountdown(target, target - 1000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 })
  })

  it("dừng ở 0 đúng giờ cưới và sau giờ cưới", () => {
    const zero = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    expect(computeCountdown(target, target)).toEqual(zero)
    expect(computeCountdown(target, target + 86_400_000)).toEqual(zero)
  })

  it("làm tròn xuống phần giây lẻ", () => {
    expect(computeCountdown(target, target - 1999).seconds).toBe(1)
  })
})
