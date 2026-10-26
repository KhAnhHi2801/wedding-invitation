const MAX_LENGTH = 40

/**
 * Tên khách từ query (ví dụ `?to=Anh%20Nam`). Dấu gạch dưới coi như khoảng trắng. Gộp khoảng trắng, bỏ ký tự điều khiển, giới hạn độ dài.
 * Chỉ dùng làm văn bản (React tự escape), không bao giờ chèn như HTML.
 */
export function getGuestName(param: string, fallback: string): string {
  return getNamedGuest(param) || fallback
}

/** Như `getGuestName` nhưng trả chuỗi rỗng khi link không có tên khách (để phân biệt với tên mặc định). */
export function getNamedGuest(param: string): string {
  const raw = new URLSearchParams(window.location.search).get(param) ?? ""
  return Array.from(
    raw
    .normalize("NFC")
    // Dấu gạch dưới thay khoảng trắng để link không bị đứt khi gửi qua chat (?to=Anh_Nam)
    .replace(/_/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim(),
  )
    .slice(0, MAX_LENGTH)
    .join("")
}
