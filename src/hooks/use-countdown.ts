import { useEffect, useState } from "react"

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Tách riêng để kiểm thử: mốc đích và thời điểm hiện tại đều truyền vào. */
export const computeCountdown = (targetMs: number, nowMs: number = Date.now()): Countdown => {
  const total = Math.max(0, Math.floor((targetMs - nowMs) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

/** Đếm ngược tới `targetMs`, cập nhật mỗi giây và dừng ở 0 sau giờ cưới. */
export function useCountdown(targetMs: number): Countdown {
  const [value, setValue] = useState(() => computeCountdown(targetMs))

  useEffect(() => {
    const tick = () => {
      const next = computeCountdown(targetMs)
      setValue(next)
      // Sau giờ cưới đã về 0: dừng hẳn, không render lại mỗi giây
      if (next.days + next.hours + next.minutes + next.seconds === 0) window.clearInterval(id)
    }
    const id = window.setInterval(tick, 1000)
    tick()
    return () => window.clearInterval(id)
  }, [targetMs])

  return value
}
