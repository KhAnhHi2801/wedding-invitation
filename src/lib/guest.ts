const MAX_LENGTH = 40

/**
 * Tên khách từ query (ví dụ `?to=Anh%20Nam`). Gộp khoảng trắng, bỏ ký tự điều khiển, giới hạn độ dài.
 * Chỉ dùng làm văn bản (React tự escape), không bao giờ chèn như HTML.
 */
export function getGuestName(param: string, fallback: string): string {
  const raw = new URLSearchParams(window.location.search).get(param) ?? ""
  const cleaned = Array.from(
    raw
    .normalize("NFC")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim(),
  )
    .slice(0, MAX_LENGTH)
    .join("")
  return cleaned || fallback
}
