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
const rsvp = (extra = {}) => ({ kind: "rsvp", name: "Minh", attending: "yes", guests: 2, transport: "own", note: "", guest: "Anh Nam", website: "", token: "r1", elapsedMs: 5000, ...extra })

const player = (extra = {}) => ({ kind: "player", name: "Lan", outfit: "Áo dài đỏ", guest: "Anh Nam", website: "", token: "p1", ...extra })

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

const RSVP_TAB = "Form Responses 1" // tab dùng chung với Google Form

describe("xác nhận tham dự (RSVP)", () => {
  it("đến: ghi theo bố cục của Form (A-F) kèm G-H, số người dạng số, ngày giờ thật", () => {
    expect(post(rsvp({ guests: 3, note: "Ăn chay giúp mình" })).ok).toBe(true)
    const sheet = sheets.get(RSVP_TAB)
    expect(sheet.rows[0]).toEqual([
      "Timestamp",
      "Họ và tên của bạn",
      "Xác nhận tham dự",
      "Bạn có muốn đăng ký xe đưa đón đến địa điểm tổ chức không?",
      "💌 Ghi chú / Lời nhắn gửi",
      "Số người đi cùng",
      "Phương tiện",
      "Tên trong link mời",
    ])
    const row = sheet.rows[1]
    expect(row[0]).toBeInstanceOf(Date)
    expect(row.slice(1)).toEqual(["Minh", "Có, mình sẽ đến chung vui cùng hai bạn \u2764\uFE0F", "Không, mình sẽ tự di chuyển", "Ăn chay giúp mình", 3, "Xe cá nhân", "Anh Nam"])
    expect(sheet.formats.get("2:6")).toBe("0")
    expect(sheet.formats.get("2:2")).toBe("@")
  })

  it("đi xe chung: câu trả lời cột D khớp đáp án của Form", () => {
    post(rsvp({ transport: "shared" }))
    const row = sheets.get(RSVP_TAB).rows[1]
    expect(row[3]).toBe("Có, mình muốn đi cùng xe chung")
    expect(row[6]).toBe("Xe chung")
  })

  it("không đến: ghi đáp án 'Rất tiếc' của Form, cột D là đáp án 'không tham gia được', 0 người, bỏ qua số người gửi lên", () => {
    expect(post(rsvp({ attending: "no", guests: 5, transport: "" })).ok).toBe(true)
    const row = sheets.get(RSVP_TAB).rows[1]
    expect(row[2]).toBe("Rất tiếc, mình không thể tham dự \uD83D\uDE14")
    expect(row[3]).toBe("Mình bận nên không tham gia được ruii, chúc hạnh phúc hai bạn nhaa")
    expect(row[5]).toBe(0)
    expect(row[6]).toBe("")
  })

  it("tab do Form tạo sẵn (A-F): chỉ bổ sung tiêu đề G-H, giữ nguyên tiêu đề của Form và dòng đã có", () => {
    const formSheet = makeSheet(RSVP_TAB)
    formSheet.appendRow(["Timestamp", "Họ và tên của bạn", "Xác nhận tham dự", "Câu hỏi xe", "Ghi chú", "Số người đi cùng"])
    formSheet.appendRow(["11/16/2026 10:42:49", "Khánh", "Có, mình sẽ đến", "Có, mình muốn đi cùng xe chung", "Hiii", 2])
    sheets.set(RSVP_TAB, formSheet)
    expect(post(rsvp()).ok).toBe(true)
    expect(formSheet.rows[0]).toEqual(["Timestamp", "Họ và tên của bạn", "Xác nhận tham dự", "Câu hỏi xe", "Ghi chú", "Số người đi cùng", "Phương tiện", "Tên trong link mời"])
    expect(formSheet.rows[1][1]).toBe("Khánh")
    expect(formSheet.rows[2][1]).toBe("Minh")
  })

  it("từ chối giá trị sai", () => {
    expect(post(rsvp({ attending: "si" })).error).toBe("invalid")
    expect(post(rsvp({ transport: "" })).error).toBe("invalid")
    expect(post(rsvp({ transport: "taxi" })).error).toBe("invalid")
    expect(post(rsvp({ guests: 0 })).error).toBe("invalid")
    expect(post(rsvp({ guests: 11 })).error).toBe("invalid")
    expect(post(rsvp({ guests: 1.5 })).error).toBe("invalid")
    expect(post(rsvp({ name: " " })).error).toBe("name_required")
    expect(post(rsvp({ name: "a".repeat(81) })).error).toBe("invalid")
    expect(post(rsvp({ note: "a".repeat(301) })).error).toBe("note_too_long")
    expect(sheets.get(RSVP_TAB)).toBeUndefined()
  })

  it("điền quá nhanh bị từ chối; ô bẫy bot giả vờ thành công", () => {
    expect(post(rsvp({ elapsedMs: 500 })).error).toBe("too_fast")
    expect(post(rsvp({ website: "x" })).ok).toBe(true)
    expect(sheets.get(RSVP_TAB)).toBeUndefined()
  })

  it("chống công thức ở tên và lời nhắn", () => {
    post(rsvp({ name: "=HYPERLINK(1)", note: "@evil" }))
    const row = sheets.get(RSVP_TAB).rows[1]
    expect(row[1]).toBe(" =HYPERLINK(1)")
    expect(row[4]).toBe(" @evil")
  })

  it("giới hạn 5 lần mỗi mã trình duyệt (khách được gửi lại để đổi câu trả lời)", () => {
    for (let i = 0; i < 5; i++) expect(post(rsvp({ token: "same" })).ok).toBe(true)
    expect(post(rsvp({ token: "same" })).error).toBe("rate_limited")
    expect(sheets.get(RSVP_TAB).rows).toHaveLength(6)
  })

  it("không có API nào đọc RSVP ra: GET chỉ trả lời chúc", () => {
    post(rsvp({ name: "BiMat" }))
    expect(JSON.stringify(get())).not.toContain("BiMat")
  })
})

describe("người chơi vào dự tiệc (game)", () => {
  it("ghi tên, trang phục, tên theo link vào tab Players; không cần elapsedMs", () => {
    expect(post(player())).toEqual({ ok: true })
    const rows = sheets.get("Players").rows
    expect(rows[0]).toEqual(["createdAt", "name", "outfit", "guest"])
    expect(rows[1].slice(1)).toEqual(["Lan", "Áo dài đỏ", "Anh Nam"])
  })

  it("thiếu tên hoặc thiếu token bị từ chối, không ghi dòng nào", () => {
    expect(post(player({ name: "  " }))).toEqual({ ok: false, error: "name_required" })
    expect(post(player({ token: "" }))).toEqual({ ok: false, error: "invalid" })
    expect(sheets.get("Players")?.rows.length ?? 1).toBe(1)
  })

  it("chống công thức; ô bẫy bot giả vờ thành công nhưng không ghi", () => {
    post(player({ name: "=HYPERLINK(1)", outfit: "+x", guest: "@y" }))
    expect(sheets.get("Players").rows[1].slice(1)).toEqual([" =HYPERLINK(1)", " +x", " @y"])
    expect(post(player({ website: "spam", token: "p2" })).ok).toBe(true)
    expect(sheets.get("Players").rows).toHaveLength(2)
  })

  it("giới hạn 10 lượt mỗi mã trình duyệt; không đọc được ra từ GET", () => {
    for (let i = 0; i < 10; i++) expect(post(player()).ok).toBe(true)
    expect(post(player())).toEqual({ ok: false, error: "rate_limited" })
    expect(get().items).toEqual([])
  })
})
