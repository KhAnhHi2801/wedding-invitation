/**
 * Màu chữ khách chọn cho lời chúc. `key` là giá trị lưu ở cột `ink` của Sheet (apps-script/wishes.gs có danh sách khóa
 * giống hệt, sửa thì sửa cả hai nơi). Đều đậm, tương phản trên 7:1 với giấy kem của sổ lưu bút để luôn đọc được.
 * Màu đầu tiên là mặc định.
 */
export interface Ink {
  key: string
  label: string
  color: string
}

export const INKS: readonly Ink[] = [
  { key: "brown", label: "Nâu mực", color: "#3b2a22" },
  { key: "navy", label: "Xanh mực", color: "#1f3a5f" },
  { key: "forest", label: "Xanh rêu", color: "#2f5d3a" },
  { key: "wine", label: "Đỏ rượu vang", color: "#8a2a3b" },
  { key: "plum", label: "Tím mận", color: "#5b3a7a" },
  { key: "teal", label: "Xanh ngọc", color: "#14606b" },
]

/** Màu chữ của khóa đã lưu; undefined nếu lời chúc cũ không có hoặc khóa lạ (dùng màu mặc định của sổ). */
export const inkColor = (key: string): string | undefined => INKS.find((ink) => ink.key === key)?.color
