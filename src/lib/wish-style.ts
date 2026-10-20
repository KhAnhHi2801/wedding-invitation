/**
 * Màu chữ khách chọn cho lời chúc. `key` là giá trị lưu ở cột `ink` của Sheet (apps-script/wishes.gs có danh sách khóa
 * giống hệt, sửa thì sửa cả hai nơi). Đều đậm, tương phản trên 7:1 với giấy kem của phần "Lời chúc" để luôn đọc được.
 * Màu đầu tiên là mặc định. Tên hiển thị của từng màu nằm ở `garden.inkNames` trong wedding-config.ts.
 */
export interface Ink {
  key: string;
  color: string;
}

export const INKS: readonly Ink[] = [
  { key: "brown", color: "#49332F" }, // Nâu cacao
  { key: "navy", color: "#294365" }, // Xanh navy
  { key: "forest", color: "#355B45" }, // Xanh lá thông
  { key: "wine", color: "#913746" }, // Đỏ vang
  { key: "plum", color: "#694477" }, // Tím mận
  { key: "teal", color: "#17666A" }, // Xanh teal
  { key: "earth", color: "#80513D" }, // Nâu đất
  { key: "rose", color: "#A34E65" }, // Hồng mận trầm
  { key: "charcoal", color: "#48464A" }, // Xám than
  { key: "olive", color: "#62663A" }, // Xanh olive đậm
];

/** Màu chữ của khóa đã lưu; undefined nếu lời chúc cũ không có hoặc khóa lạ (dùng màu mặc định của sổ). */
export const inkColor = (key: string): string | undefined =>
  INKS.find((ink) => ink.key === key)?.color;
