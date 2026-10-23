/** Cuộn tới section (chừa chỗ cho thanh nav nhờ `scroll-margin-top` trong css) và chuyển tiêu điểm bàn phím theo, để Tab tiếp tục từ đó. */
export function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ block: "start" })
  target.tabIndex = -1
  target.focus({ preventScroll: true })
}
