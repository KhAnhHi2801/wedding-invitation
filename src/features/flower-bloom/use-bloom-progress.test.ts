import { describe, expect, it } from "vitest"
import { FLOWER_DEFINITIONS } from "../../config/flower-botanical"
import { bloomDurationMs, progressFromTime, stageFromProgress } from "./use-bloom-progress"

describe("stageFromProgress", () => {
  it("khớp ngưỡng giai đoạn của prototype", () => {
    expect(stageFromProgress(0)).toBe("seed")
    expect(stageFromProgress(0.05)).toBe("germination")
    expect(stageFromProgress(0.12)).toBe("growth")
    expect(stageFromProgress(0.47)).toBe("growth")
    expect(stageFromProgress(0.48)).toBe("bud")
    expect(stageFromProgress(0.62)).toBe("bloom")
    expect(stageFromProgress(0.94)).toBe("bloom")
    expect(stageFromProgress(0.95)).toBe("completed")
    expect(stageFromProgress(1)).toBe("completed")
  })
})

describe("nhịp nở riêng từng loài", () => {
  it("không có số liệu loài thì tiến trình đi thẳng theo thời gian", () => {
    expect(progressFromTime(0.37)).toBeCloseTo(0.37)
  })

  it("mọi loài: bắt đầu từ 0, kết thúc ở 1 và chỉ tăng", () => {
    for (const { id, duration } of FLOWER_DEFINITIONS) {
      expect(progressFromTime(0, duration), id).toBe(0)
      expect(progressFromTime(1, duration), id).toBeCloseTo(1)
      let prev = -1
      for (let i = 0; i <= 100; i++) {
        const p = progressFromTime(i / 100, duration)
        expect(p, `${id} @${i}`).toBeGreaterThanOrEqual(prev)
        prev = p
      }
    }
  })

  it("giai đoạn nở dài hơn thì nở chậm hơn (tiến trình tăng ít hơn trong cùng một khoảng thời gian cuối)", () => {
    const slow = { seed: 900, germination: 1400, growth: 2200, bud: 1300, bloom: 4800 }
    const fast = { seed: 900, germination: 1400, growth: 2200, bud: 1300, bloom: 1200 }
    const lastTenth = (d: typeof slow) => progressFromTime(1, d) - progressFromTime(0.9, d)
    expect(lastTenth(slow)).toBeLessThan(lastTenth(fast))
  })

  it("thời gian mọc nằm trong khoảng 4,2 đến 6,4 giây và thay đổi theo loài", () => {
    const times = FLOWER_DEFINITIONS.map((f) => bloomDurationMs(f.duration))
    for (const ms of times) {
      expect(ms).toBeGreaterThanOrEqual(4200)
      expect(ms).toBeLessThanOrEqual(6400)
    }
    expect(new Set(times.map(Math.round)).size).toBeGreaterThan(3)
  })
})
