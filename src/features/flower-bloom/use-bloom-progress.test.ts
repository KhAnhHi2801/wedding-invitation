import { describe, expect, it } from "vitest"
import { stageFromProgress } from "./use-bloom-progress"

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
