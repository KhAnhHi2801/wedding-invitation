import { describe, expect, it } from "vitest"
import { weddingConfig } from "../config/wedding-config"
import { charCount, validateRsvp, type RsvpValues } from "./rsvp-validation"

const errors = weddingConfig.rsvp.form.errors
const valid: RsvpValues = { name: "Nguyễn Văn A", attending: "yes", guests: "2", transport: "shared", note: "" }

describe("validateRsvp", () => {
  it("form hợp lệ không có lỗi", () => {
    expect(validateRsvp(valid, errors)).toEqual({})
  })

  it("bắt buộc có tên (khoảng trắng không tính)", () => {
    expect(validateRsvp({ ...valid, name: "   " }, errors).name).toBe(errors.name)
  })

  it("bắt buộc chọn có đến hay không", () => {
    expect(validateRsvp({ ...valid, attending: "" }, errors).attending).toBe(errors.attending)
  })

  it("số người từ 1 đến 10 và là số nguyên", () => {
    for (const guests of ["0", "11", "1.5", "abc", ""]) {
      expect(validateRsvp({ ...valid, guests }, errors).guests).toBe(errors.guests)
    }
    expect(validateRsvp({ ...valid, guests: "10" }, errors).guests).toBeUndefined()
  })

  it("đến thì bắt buộc chọn xe, không đến thì bỏ qua", () => {
    expect(validateRsvp({ ...valid, transport: "" }, errors).transport).toBe(errors.transport)
    expect(validateRsvp({ ...valid, attending: "no", transport: "" }, errors).transport).toBeUndefined()
  })

  it("lời nhắn tối đa 300 ký tự, emoji tính là 1 ký tự", () => {
    expect(validateRsvp({ ...valid, note: "a".repeat(300) }, errors).note).toBeUndefined()
    expect(validateRsvp({ ...valid, note: "a".repeat(301) }, errors).note).toBe(errors.note)
    expect(validateRsvp({ ...valid, note: "😀".repeat(300) }, errors).note).toBeUndefined()
  })

  it("đếm y hệt script: emoji ghép tính theo từng emoji (ZWJ vô hình bị bỏ), ký tự vô hình không tính", () => {
    expect(charCount("👨‍👩‍👧‍👦")).toBe(4)
    expect(charCount("a\u200Bb\u0007c")).toBe(3)
    expect(charCount("  hai   chữ  ")).toBe("hai chữ".length)
    expect(validateRsvp({ ...valid, note: "👨‍👩‍👧‍👦".repeat(75) }, errors).note).toBeUndefined()
    expect(validateRsvp({ ...valid, note: "👨‍👩‍👧‍👦".repeat(76) }, errors).note).toBe(errors.note)
  })

  it("chữ có dấu tổ hợp (NFD) tính như dạng dựng sẵn", () => {
    const nfd = "Việt".normalize("NFD")
    expect(charCount(nfd)).toBe(4)
    expect(validateRsvp({ ...valid, name: nfd.repeat(20) }, errors).name).toBeUndefined()
    expect(validateRsvp({ ...valid, name: nfd.repeat(21) }, errors).name).toBe(errors.name)
  })
})
