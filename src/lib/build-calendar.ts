/** Lưới lịch một tháng, tuần bắt đầu từ thứ Hai (kiểu Việt Nam). `null` là ô trống đầu tháng. */
export function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstWeekdaySunday0 = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const leading = (firstWeekdaySunday0 + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
}
