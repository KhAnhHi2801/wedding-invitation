import { describe, expect, it } from "vitest"
import { buildVietQr, crc16 } from "./viet-qr"

describe("crc16", () => {
  it("khớp giá trị chuẩn CRC-16/CCITT-FALSE của '123456789'", () => {
    expect(crc16("123456789")).toBe("29B1")
  })
})

describe("buildVietQr", () => {
  it("dựng đúng cấu trúc và CRC khớp phần thân", () => {
    const qr = buildVietQr("970422", "012345678")
    expect(qr.startsWith("000201010211")).toBe(true)
    expect(qr).toContain("0010A000000727")
    expect(qr).toContain("QRIBFTTA")
    expect(qr).toContain("5303704")
    expect(qr).toContain("5802VN")
    const body = qr.slice(0, -4)
    expect(body.endsWith("6304")).toBe(true)
    expect(qr.slice(-4)).toBe(crc16(body))
  })

  it("độ dài tag 38 khớp nội dung", () => {
    const qr = buildVietQr("970422", "012345678")
    const start = qr.indexOf("38")
    const length = Number(qr.slice(start + 2, start + 4))
    const content = qr.slice(start + 4, start + 4 + length)
    expect(content.startsWith("0010A000000727")).toBe(true)
    expect(content.endsWith("0208QRIBFTTA")).toBe(true)
  })

  it("từ chối BIN hoặc số tài khoản sai định dạng", () => {
    expect(() => buildVietQr("97042", "1")).toThrow()
    expect(() => buildVietQr("970422", "12 34")).toThrow()
  })
})
