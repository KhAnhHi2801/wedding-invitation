/** Thay `{key}` trong mẫu chữ bằng giá trị tương ứng; khóa không có thì giữ nguyên. */
export function fillText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
