/**
 * Sao chép văn bản vào clipboard. Có phương án dự phòng cho trình duyệt nhúng (Zalo, Messenger trên iOS) vốn hay từ chối
 * Clipboard API: iOS chỉ chọn được văn bản trong ô nhập KHÔNG readonly và cần `setSelectionRange`.
 * Trả về false nếu cả hai cách đều thất bại để giao diện báo cho khách.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement("textarea")
    area.value = text
    // 16px để iOS không tự phóng to; nằm ngoài tầm nhìn nhưng vẫn "thấy được" với trình duyệt
    area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px"
    document.body.appendChild(area)
    area.focus({ preventScroll: true })
    area.select()
    area.setSelectionRange(0, text.length)
    try {
      return document.execCommand("copy")
    } catch {
      return false
    } finally {
      area.remove()
    }
  }
}
