import type { GardenText } from "../config/wedding-config"
import { charCount } from "./rsvp-validation"

/**
 * Quy tắc cho lời chúc ở phía khách. NAME_MAX, MESSAGE_MIN, MESSAGE_MAX và danh sách từ cấm có bản sao trong
 * apps-script/wishes.gs (so khớp theo TỪ NGUYÊN, không phải chuỗi con): sửa thì sửa cả hai nơi.
 * Đây chỉ là lớp lọc đầu; kiểm duyệt cuối cùng là đổi cột `status` thành `hidden` ngay trên Google Sheet.
 */
export const NAME_MAX = 40
export const MESSAGE_MIN = 2
/** Khớp `MESSAGE_MAX` của script. 1000 ký tự là dư cho một lời chúc cưới, và giữ mỗi trang dữ liệu dưới giới hạn cache 100KB của Apps Script */
export const MESSAGE_MAX = 1000

export const PROFANITY_WORDS = [
  "đm", "đmm", "đcm", "đcmm", "dm", "dmm", "dcm", "dcmm", "vcl", "vkl",
  "lồn", "cặc", "địt", "đụ", "đéo", "đĩ", "fuck", "shit", "bitch", "buồi",
]

/** Tách thành các từ chữ/số rồi nối bằng dấu cách, để so khớp theo từ nguyên */
const toWordString = (text: string): string =>
  ` ${text.normalize("NFC").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean).join(" ")} `

export const containsProfanity = (text: string): boolean => {
  const words = toWordString(text)
  return PROFANITY_WORDS.some((word) => words.includes(` ${word} `))
}

export interface WishFields {
  name: string
  message: string
}

export type WishErrors = Partial<Record<"name" | "message", string>>

export function validateWish(fields: WishFields, errors: GardenText["errors"]): WishErrors {
  const result: WishErrors = {}
  const name = fields.name.trim()
  const message = fields.message.trim()
  if (name.length === 0) result.name = errors.nameRequired
  else if (charCount(name) > NAME_MAX) result.name = errors.nameTooLong
  if (charCount(message) < MESSAGE_MIN) result.message = errors.messageTooShort
  else if (charCount(message) > MESSAGE_MAX) result.message = errors.messageTooLong
  else if (containsProfanity(name) || containsProfanity(message)) result.message = errors.profanity
  return result
}
