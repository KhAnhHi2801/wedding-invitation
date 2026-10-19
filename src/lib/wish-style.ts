/**
 * Màu chữ khách chọn cho lời chúc. `key` là giá trị lưu ở cột `ink` của Sheet (apps-script/wishes.gs có danh sách khóa
 * giống hệt, sửa thì sửa cả hai nơi). Đều đậm, tương phản trên 7:1 với giấy kem của sổ lưu bút để luôn đọc được.
 * Màu đầu tiên là mặc định. Tên hiển thị của từng màu nằm ở `garden.inkNames` trong wedding-config.ts.
 */
export interface Ink {
  key: string
  color: string
}

export const INKS: readonly Ink[] = [
  { key: "brown", color: "#3b2a22" },
  { key: "navy", color: "#1f3a5f" },
  { key: "forest", color: "#2f5d3a" },
  { key: "wine", color: "#8a2a3b" },
  { key: "plum", color: "#5b3a7a" },
  { key: "teal", color: "#14606b" },
]

/** Màu chữ của khóa đã lưu; undefined nếu lời chúc cũ không có hoặc khóa lạ (dùng màu mặc định của sổ). */
export const inkColor = (key: string): string | undefined => INKS.find((ink) => ink.key === key)?.color
