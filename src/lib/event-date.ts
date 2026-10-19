/** Ngày giờ sự kiện tách ra từ `event.startsAt`, luôn tính theo giờ Việt Nam bất kể múi giờ của người xem. */

const TIME_ZONE = "Asia/Ho_Chi_Minh"

export interface EventParts {
  /** Mốc thời gian (ms) để đếm ngược */
  startsAtMs: number
  day: number
  month: number
  year: number
  /** "10:30" */
  timeLabel: string
  /** "THỨ NĂM" */
  weekdayUpper: string
  /** "Dec" */
  monthShortEn: string
}

export function getEventParts(startsAt: string): EventParts {
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) throw new Error(`event.startsAt không hợp lệ: "${startsAt}"`)

  const numeric = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)
  const pick = (type: string) => numeric.find((part) => part.type === type)?.value ?? "0"

  const weekday = new Intl.DateTimeFormat("vi-VN", { timeZone: TIME_ZONE, weekday: "long" }).format(date)
  const monthShortEn = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, month: "short" }).format(date)

  return {
    startsAtMs: date.getTime(),
    day: Number(pick("day")),
    month: Number(pick("month")),
    year: Number(pick("year")),
    timeLabel: `${pick("hour")}:${pick("minute")}`,
    weekdayUpper: weekday.toLocaleUpperCase("vi-VN"),
    monthShortEn,
  }
}
