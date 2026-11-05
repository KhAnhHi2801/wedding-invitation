import { getNamedGuest } from "./guest"

/**
 * Link sang trang game kèm tên khách (cùng tên tham số với thiệp, ví dụ `?to=Anh%20Nam`) để game chào đúng người.
 * Link thiệp không có tên khách thì giữ nguyên URL gốc, không thêm tham số rỗng. Tham số cũ của URL gốc được giữ lại.
 */
export function gameLink(url: string, param: string, guest = getNamedGuest(param)): string {
  if (!guest) return url
  try {
    const target = new URL(url)
    target.searchParams.set(param, guest)
    return target.toString()
  } catch {
    // URL cấu hình sai thì vẫn trả nguyên văn, không làm hỏng cả thiệp
    return url
  }
}
