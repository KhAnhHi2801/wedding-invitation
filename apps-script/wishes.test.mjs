/**
 * Chạy `wishes.gs` thật trong Node với bản giả của SpreadsheetApp, CacheService, LockService, PropertiesService...
 * Không thay được lần thử trên Google (xem docs/wishes-setup.md, mục "Kiểm tra sau khi deploy"), nhưng bắt được lỗi logic
 * trước khi dán script lên.
 */
import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { beforeEach, describe, expect, it } from "vitest"

const source = readFileSync(new URL("./wishes.gs", import.meta.url), "utf8")

function makeSheet(name) {
  const rows = []
  const formats = new Map()
  const api = {
    name,
    rows,
    formats,
    frozen: 0,
    appendRow: (row) => rows.push(row),
    setFrozenRows(n) {
      api.frozen = n
    },
    getLastRow: () => rows.length,
    getLastColumn: () => Math.max(0, ...rows.map((r) => r.length)),
    getRange(row, col, numRows = 1, numCols = 1) {
      const range = {
        getValues: () => Array.from({ length: numRows }, (_, i) => Array.from({ length: numCols }, (_, j) => rows[row - 1 + i]?.[col - 1 + j] ?? "")),
        setValues(values) {
          values.forEach((vals, i) => {
            rows[row - 1 + i] = rows[row - 1 + i] ?? []
            vals.forEach((v, j) => {
              rows[row - 1 + i][col - 1 + j] = v
            })
          })
          return range
        },
        setValue(value) {
          rows[row - 1] = rows[row - 1] ?? []
          rows[row - 1][col - 1] = value
          return range
        },
        setNumberFormat(format) {
          for (let j = 0; j < numCols; j++) formats.set(`${row}:${col + j}`, format)
          return range
        },
      }
      return range
    },
  }
  return api
}

function load() {
  const sheets = new Map()
  const cache = new Map()
  const props = new Map()
  const globals = {
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => sheets.get(n) ?? null,
        insertSheet: (n) => {
          const sheet = makeSheet(n)
          sheets.set(n, sheet)
          return sheet
        },
      }),
    },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => void cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, hasLock: () => true, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props.get(k) ?? null, setProperty: (k, v) => void props.set(k, v) }) },
    Utilities: {
      getUuid: () => randomUUID(),
      formatDate: (date, _tz, fmt) => date.toISOString().slice(0, fmt.includes("HH") ? 19 : 10).replace("T", " "),
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({ text, setMimeType() { return this } }),
    },
  }
  const factory = new Function(...Object.keys(globals), `${source}\nreturn { doGet, doPost, sanitizeCell_, unsanitizeCell_, isProfane_ }`)
  return { script: factory(...Object.values(globals)), sheets }
}

let script
let sheets
const post = (body) => JSON.parse(script.doPost({ postData: { contents: typeof body === "string" ? body : JSON.stringify(body) } }).text)
const get = (parameter = {}) => JSON.parse(script.doGet({ parameter }).text)

const wish = (extra = {}) => ({ name: "Lan", message: "Chúc hai bạn hạnh phúc", flower: "peony", ink: "wine", website: "", token: "t1", elapsedMs: 5000, requestId: randomUUID(), ...extra })
const rsvp = (extra = {}) => ({ kind: "rsvp", name: "Minh", attending: "yes", guests: 2, note: "", guest: "Anh Nam", website: "", token: "r1", elapsedMs: 5000, ...extra })

beforeEach(() => {
  ;({ script, sheets } = load())
})

describe("đọc lời chúc", () => {
  it("lần đầu chưa có gì: danh sách rỗng và tự tạo tab Wishes có tiêu đề", () => {
    expect(get()).toEqual({ ok: true, items: [], nextCursor: null })
    expect(sheets.get("Wishes").rows[0]).toEqual(["id", "createdAt", "name", "message", "status", "flower", "ink"])
  })

  it("mới nhất trước, kèm loài hoa và màu chữ", () => {
    post(wish({ name: "A", flower: "rose" }))
    post(wish({ name: "B", flower: "lotus", ink: "navy" }))
    const { items } = get()
    expect(items.map((i) => i.name)).toEqual(["B", "A"])
    expect(items[0]).toMatchObject({ flower: "lotus", ink: "navy" })
  })

  it("phân trang bằng con trỏ, không trùng và không sót", () => {
    for (const n of ["1", "2", "3", "4", "5"]) post(wish({ name: n, token: `t${n}` }))
    const first = get({ limit: "2" })
    expect(first.items.map((i) => i.name)).toEqual(["5", "4"])
    expect(first.nextCursor).not.toBeNull()
    const second = get({ limit: "2", before: first.nextCursor })
    expect(second.items.map((i) => i.name)).toEqual(["3", "2"])
    const third = get({ limit: "2", before: second.nextCursor })
    expect(third.items.map((i) => i.name)).toEqual(["1"])
    expect(third.nextCursor).toBeNull()
  })

  it("dòng thêm tay có status trống vẫn hiện; status khác 'visible' thì ẩn", () => {
    post(wish({ name: "Hien" }))
    const sheet = sheets.get("Wishes")
    sheet.rows.push(["x1", "2026-01-01", "TayTrong", "ok", "", "", ""])
    sheet.rows.push(["x2", "2026-01-02", "TayAn", "ok", "hidden", "", ""])
    expect(get().items.map((i) => i.name).sort()).toEqual(["Hien", "TayTrong"])
  })
})

describe("ghi lời chúc", () => {
  it("lời chúc hợp lệ được ghi và trả ok", () => {
    const res = post(wish())
    expect(res).toMatchObject({ ok: true, status: "visible" })
    expect(sheets.get("Wishes").rows).toHaveLength(2)
  })

  it("loài hoa lạ không được ghi vào Sheet", () => {
    post(wish({ flower: "<script>", ink: "rainbow" }))
    const row = sheets.get("Wishes").rows[1]
    expect(row[5]).toBe("")
    expect(row[6]).toBe("")
  })

  it("chống công thức: =SUM(1,1) được ghi có dấu cách đầu và đọc lại đúng nguyên văn", () => {
    post(wish({ name: "=SUM(1,1)", message: "+cmd|' /C calc'!A0" }))
    const row = sheets.get("Wishes").rows[1]
    expect(row[2]).toBe(" =SUM(1,1)")
    expect(row[3].startsWith(" +")).toBe(true)
    expect(sheets.get("Wishes").formats.get("2:3")).toBe("@")
    expect(get().items[0]).toMatchObject({ name: "=SUM(1,1)", message: "+cmd|' /C calc'!A0" })
  })

  it("từ thô tục: vẫn trả ok nhưng ẩn khỏi danh sách công khai", () => {
    const res = post(wish({ message: "đm hay quá" }))
    expect(res).toMatchObject({ ok: true, status: "hidden" })
    expect(get().items).toEqual([])
  })

  it("điền quá nhanh hoặc thiếu elapsedMs bị từ chối", () => {
    expect(post(wish({ elapsedMs: 1000 })).error).toBe("too_fast")
    const noElapsed = wish()
    delete noElapsed.elapsedMs
    expect(post(noElapsed).error).toBe("too_fast")
  })

  it("ô bẫy bot có nội dung: giả vờ thành công nhưng không ghi gì", () => {
    expect(post(wish({ website: "http://spam" })).ok).toBe(true)
    expect(sheets.get("Wishes")).toBeUndefined()
  })

  it("giới hạn 3 lời chúc mỗi mã trình duyệt", () => {
    for (let i = 0; i < 3; i++) expect(post(wish({ token: "same" })).ok).toBe(true)
    expect(post(wish({ token: "same" })).error).toBe("rate_limited")
    expect(post(wish({ token: "other" })).ok).toBe(true)
  })

  it("gửi lại cùng requestId không ghi trùng", () => {
    const body = wish({ requestId: "dup-1" })
    const a = post(body)
    const b = post(body)
    expect(b.id).toBe(a.id)
    expect(sheets.get("Wishes").rows).toHaveLength(2)
  })

  it("giới hạn độ dài lời chúc: 1000 ký tự được, 1001 bị từ chối", () => {
    expect(post(wish({ message: "a".repeat(1000), token: "len-a" })).ok).toBe(true)
    expect(post(wish({ message: "a".repeat(1001), token: "len-b" })).error).toBe("message_too_long")
  })

  it("kiểm tra nội dung: thiếu tên, tên quá dài, lời chúc quá ngắn", () => {
    expect(post(wish({ name: "  " })).error).toBe("name_required")
    expect(post(wish({ name: "a".repeat(41) })).error).toBe("name_too_long")
    expect(post(wish({ message: "a" })).error).toBe("message_too_short")
  })

  it("JSON hỏng hoặc không phải object", () => {
    expect(post("không phải json").error).toBe("invalid")
    expect(post("123").error).toBe("invalid")
  })
})

describe("xác nhận tham dự (RSVP)", () => {
  it("đến: ghi 'Có', số người dạng số, tên khách theo link", () => {
    expect(post(rsvp({ guests: 3, note: "Ăn chay giúp mình" })).ok).toBe(true)
    const sheet = sheets.get("RSVP")
    expect(sheet.rows[0]).toEqual(["createdAt", "name", "attending", "guests", "note", "guest"])
    const row = sheet.rows[1]
    expect(row.slice(1)).toEqual(["Minh", "Có", 3, "Ăn chay giúp mình", "Anh Nam"])
    expect(sheet.formats.get("2:4")).toBe("0")
  })

  it("không đến: ghi 'Không' và 0 người, bỏ qua số người gửi lên", () => {
    expect(post(rsvp({ attending: "no", guests: 5 })).ok).toBe(true)
    expect(sheets.get("RSVP").rows[1].slice(2, 4)).toEqual(["Không", 0])
  })

  it("từ chối giá trị sai", () => {
    expect(post(rsvp({ attending: "si" })).error).toBe("invalid")
    expect(post(rsvp({ guests: 0 })).error).toBe("invalid")
    expect(post(rsvp({ guests: 11 })).error).toBe("invalid")
    expect(post(rsvp({ guests: 1.5 })).error).toBe("invalid")
    expect(post(rsvp({ name: " " })).error).toBe("name_required")
    expect(post(rsvp({ name: "a".repeat(81) })).error).toBe("invalid")
    expect(post(rsvp({ note: "a".repeat(301) })).error).toBe("note_too_long")
    expect(sheets.get("RSVP")).toBeUndefined()
  })

  it("điền quá nhanh bị từ chối; ô bẫy bot giả vờ thành công", () => {
    expect(post(rsvp({ elapsedMs: 500 })).error).toBe("too_fast")
    expect(post(rsvp({ website: "x" })).ok).toBe(true)
    expect(sheets.get("RSVP")).toBeUndefined()
  })

  it("chống công thức ở tên và lời nhắn", () => {
    post(rsvp({ name: "=HYPERLINK(1)", note: "@evil" }))
    const row = sheets.get("RSVP").rows[1]
    expect(row[1]).toBe(" =HYPERLINK(1)")
    expect(row[4]).toBe(" @evil")
  })

  it("giới hạn 5 lần mỗi mã trình duyệt (khách được gửi lại để đổi câu trả lời)", () => {
    for (let i = 0; i < 5; i++) expect(post(rsvp({ token: "same" })).ok).toBe(true)
    expect(post(rsvp({ token: "same" })).error).toBe("rate_limited")
    expect(sheets.get("RSVP").rows).toHaveLength(6)
  })

  it("không có API nào đọc RSVP ra: GET chỉ trả lời chúc", () => {
    post(rsvp({ name: "BiMat" }))
    expect(JSON.stringify(get())).not.toContain("BiMat")
  })
})
