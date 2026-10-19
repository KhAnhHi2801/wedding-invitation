import type { RsvpFormText } from "../config/wedding-config"

export const NAME_MAX = 80
export const GUESTS_MIN = 1
export const GUESTS_MAX = 10
export const NOTE_MAX = 300

export interface RsvpValues {
  name: string
  attending: "yes" | "no" | ""
  guests: string
  note: string
}

export type RsvpField = "name" | "attending" | "guests" | "note"
export type RsvpErrors = Partial<Record<RsvpField, string>>

/**
 * Đếm độ dài Y HỆT cách `clean_` + `length_` của apps-script/wishes.gs: chuẩn hóa NFC, gộp khoảng trắng, bỏ ký tự điều khiển
 * và ký tự định dạng vô hình (ví dụ ZWJ trong emoji ghép), rồi đếm theo code point. Phía khách phải không lỏng hơn phía script,
 * nếu không một lời chúc qua được form sẽ bị script từ chối.
 */
export const charCount = (text: string): number =>
  Array.from(
    text
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .replace(/[\p{Cc}\p{Cf}]/gu, "")
      .trim(),
  ).length

/** Kiểm tra form xác nhận tham dự ở phía khách; script trên Google cũng kiểm lại độc lập. */
export function validateRsvp(values: RsvpValues, errors: RsvpFormText["errors"]): RsvpErrors {
  const result: RsvpErrors = {}
  const name = values.name.trim()
  if (name.length === 0 || charCount(name) > NAME_MAX) result.name = errors.name
  if (values.attending === "") result.attending = errors.attending
  const guests = Number(values.guests)
  if (!Number.isInteger(guests) || guests < GUESTS_MIN || guests > GUESTS_MAX) result.guests = errors.guests
  if (charCount(values.note.trim()) > NOTE_MAX) result.note = errors.note
  return result
}
