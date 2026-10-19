/**
 * Khóa cuộn trang có đếm số chủ khóa: phong bì, modal RSVP... cùng dùng được mà không nhả nhầm khóa của nhau.
 * Trả về hàm nhả; chỉ khi chủ khóa cuối cùng nhả thì class `is-locked` mới được gỡ.
 */
let holders = 0

export function lockScroll(): () => void {
  holders += 1
  document.documentElement.classList.add("is-locked")
  let released = false
  return () => {
    if (released) return
    released = true
    holders = Math.max(0, holders - 1)
    if (holders === 0) document.documentElement.classList.remove("is-locked")
  }
}
