/** Số lời chúc hiện trong trang khi mở danh sách (xem đủ thì mở lớp "Xem tất cả"). */
export const WISH_PREVIEW = 4

/** Số lời dựng thêm mỗi lần cuộn tới cuối trong lớp "Xem tất cả". */
export const WISH_LIST_STEP = 20

/** Số lời đang hiện sau khi dựng thêm một lượt, không vượt quá tổng. */
export function nextShown(shown: number, total: number, step: number = WISH_LIST_STEP): number {
  return Math.min(total, shown + step)
}

/** Thay `{key}` trong mẫu chữ bằng giá trị tương ứng; khóa không có thì giữ nguyên. */
export function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
