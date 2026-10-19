/**
 * Chuỗi VietQR (chuẩn EMVCo/NAPAS 247) cho chuyển khoản tới một số tài khoản, không kèm số tiền.
 * Ứng dụng ngân hàng quét được mã này để mở sẵn màn hình chuyển khoản.
 * Cấu trúc: tag 38 (thông tin đơn vị thụ hưởng) gồm GUID NAPAS, BIN ngân hàng + số tài khoản, dịch vụ QRIBFTTA.
 */

const tlv = (id: string, value: string): string => `${id}${String(value.length).padStart(2, "0")}${value}`

/** CRC-16/CCITT-FALSE (đa thức 0x1021, khởi tạo 0xFFFF) tính trên toàn bộ chuỗi tới hết "6304". */
export function crc16(input: string): string {
  let crc = 0xffff
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

export function buildVietQr(bankBin: string, accountNumber: string): string {
  if (!/^\d{6}$/.test(bankBin)) throw new Error(`BIN ngân hàng phải gồm 6 chữ số: "${bankBin}"`)
  if (!/^[0-9A-Za-z]{1,19}$/.test(accountNumber)) throw new Error(`Số tài khoản không hợp lệ: "${accountNumber}"`)

  const beneficiary = tlv("00", bankBin) + tlv("01", accountNumber)
  const body =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("38", tlv("00", "A000000727") + tlv("01", beneficiary) + tlv("02", "QRIBFTTA")) +
    tlv("53", "704") +
    tlv("58", "VN") +
    "6304"
  return body + crc16(body)
}
