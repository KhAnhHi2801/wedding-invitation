/**
 * Google Apps Script web app: lưu và đọc LỜI CHÚC (kèm loài hoa khách chọn) và XÁC NHẬN THAM DỰ (RSVP) trên Google Sheet.
 * Hướng dẫn cài đặt: docs/wishes-setup.md (cần runtime V8, mặc định của project mới).
 *
 * Script gắn với Sheet (Extensions > Apps Script), nên không cần ghi Sheet ID vào code.
 *
 * Tab "Wishes": id | createdAt | name | message | status | flower | ink
 *   flower = id loài hoa khách chọn (một trong FLOWER_IDS) hoặc để TRỐNG (lời chúc thêm tay: giao diện tự chọn hoa).
 *   ink    = màu chữ khách chọn (một trong INK_KEYS) hoặc để TRỐNG: dùng màu mặc định.
 *   status = "visible" hoặc để TRỐNG: hiện công khai; mọi giá trị khác (vd. "hidden"): không hiện.
 *   Kiểm duyệt = đổi status của dòng đó ngay trên Sheet. Đừng xóa hoặc sắp xếp lại dòng: phân trang dùng số dòng làm con trỏ.
 *
 * Tab "RSVP" (riêng tư, KHÔNG có API nào đọc ra): createdAt | name | attending | guests | note | guest | transport | pickup
 *   attending = "Có" hoặc "Không"; guests = số người (0 khi không đến); guest = tên trong link mời (?to=...);
 *   transport = "Xe cá nhân" | "Xe chung" (rỗng khi không đến); pickup = địa chỉ điểm đón (chỉ nhà gái đi xe chung, còn lại rỗng).
 *
 * Hợp đồng với website (src/lib/wishes-api.ts): POST text/plain, body JSON.
 *   RSVP:  { kind:"rsvp", name, attending:"yes"|"no", guests, transport:"own"|"shared", pickup, note, guest, website, token, elapsedMs }
 *   Lời chúc: { name, message, flower, ink, website, token, elapsedMs, requestId }
 *   Trả { ok:true } hoặc { ok:false, error:"invalid"|"name_required"|"name_too_long"|"message_too_short"|"message_too_long"
 *                                          |"note_too_long"|"rate_limited"|"too_fast"|"server" }
 *   GET ?limit=50&before=<con trỏ>: { ok:true, items:[{id,createdAt,name,message,flower,ink}], nextCursor }
 */

var SHEET_NAME = 'Wishes';
var HEADERS = ['id', 'createdAt', 'name', 'message', 'status', 'flower', 'ink'];
// Khớp `id` trong src/config/flower-wishes.ts: thêm/bớt loài hoa thì sửa cả hai nơi.
var FLOWER_IDS = [
  'baby-breath',
  'peony',
  'daisy',
  'tulip',
  'sunflower',
  'lavender',
  'rose',
  'calla-lily',
  'lotus',
  'cherry-blossom',
  'orchid',
  'carnation',
  'hydrangea',
  'magnolia',
  'cosmos',
];
var INK_KEYS = ['brown', 'navy', 'forest', 'wine', 'plum', 'teal', 'earth', 'rose', 'charcoal', 'olive']; // khớp src/lib/wish-style.ts (cùng thứ tự)
var RSVP_SHEET = 'RSVP';
var RSVP_HEADERS = ['createdAt', 'name', 'attending', 'guests', 'note', 'guest', 'transport', 'pickup'];

var NAME_MAX = 40;
var MESSAGE_MIN = 2;
var MESSAGE_MAX = 1000; // khớp MESSAGE_MAX trong src/lib/wish-validation.ts; đủ cho một lời chúc cưới và giữ mỗi trang dữ liệu dưới giới hạn cache 100KB
var RSVP_NAME_MAX = 80; // khớp NAME_MAX của src/lib/rsvp-validation.ts
var RSVP_NOTE_MAX = 300;
var RSVP_GUEST_MAX = 80;
var RSVP_GUESTS_MAX = 10;
// Điểm đón xe chung của nhà gái. Khớp `pickupOptions` (id) trong src/config/wedding-config.ts.
var PICKUP_POINTS = {
  'dien-bien-phu': 'Số 5 đường Điện Biên Phủ, phường Điện Biên, quận Ba Đình, Hà Nội',
  'to-huu': 'Số 58 Tố Hữu, phường Đại Mỗ, quận Nam Từ Liêm, Hà Nội',
};
var MIN_FILL_MS = 3000; // khách điền form nhanh hơn mức này (hoặc không gửi elapsedMs) bị coi là bot
var RATE_LIMIT = 3; // số lời chúc tối đa mỗi mã trình duyệt...
var RATE_WINDOW_S = 600; // ...trong khoảng thời gian này (giây)
var RSVP_RATE_LIMIT = 5; // số xác nhận tối đa mỗi mã trình duyệt trong cùng khoảng
var DAILY_CAP = 500; // trần số lời chúc nhận mỗi ngày (toàn bộ)
var RSVP_DAILY_CAP = 300; // trần số xác nhận nhận mỗi ngày
var PAGE_MAX = 200;
var DEFAULT_LIMIT = 50;
var CACHE_TTL_S = 60;
var REQUEST_TTL_S = 600; // nhớ kết quả của một requestId để gửi lại không bị ghi trùng
var GENERATION_TTL_S = 21600; // tối đa của CacheService (6 giờ)
var TIME_ZONE = 'Asia/Ho_Chi_Minh';

// Bản sao của PROFANITY_WORDS trong src/lib/wish-validation.ts. Sửa danh sách thì sửa cả hai nơi.
var PROFANITY = [
  'đm', 'đmm', 'đcm', 'đcmm', 'dm', 'dmm', 'dcm', 'dcmm', 'vcl', 'vkl',
  'lồn', 'cặc', 'địt', 'đụ', 'đéo', 'đĩ', 'fuck', 'shit', 'bitch', 'buồi',
];

// ---------- chuẩn hóa và kiểm tra ----------

function clean_(raw) {
  // Gộp khoảng trắng (gồm xuống dòng) trước khi xóa ký tự vô hình, để "A\nB" thành "A B".
  return String(raw == null ? '' : raw)
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .trim();
}

function length_(text) {
  return Array.from(text).length;
}

function isProfane_(text) {
  var words =
    ' ' +
    text
      .normalize('NFC')
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .join(' ') +
    ' ';
  return PROFANITY.some(function (word) {
    return words.indexOf(' ' + word + ' ') !== -1;
  });
}

/** Trả về {ok:true,name,message,profane} hoặc {ok:false,error}. Từ chưa phù hợp không bị từ chối, chỉ bị ẩn. */
function validateWish_(name, message) {
  var n = clean_(name);
  var m = clean_(message);
  if (!n) return { ok: false, error: 'name_required' };
  if (length_(n) > NAME_MAX) return { ok: false, error: 'name_too_long' };
  if (length_(m) < MESSAGE_MIN) return { ok: false, error: 'message_too_short' };
  if (length_(m) > MESSAGE_MAX) return { ok: false, error: 'message_too_long' };
  return { ok: true, name: n, message: m, profane: isProfane_(n) || isProfane_(m) };
}

/** Dòng hiện công khai khi status là "visible" hoặc để trống (không phân biệt hoa thường, bỏ khoảng trắng thừa) */
function isVisible_(status) {
  var s = String(status == null ? '' : status).trim().toLowerCase();
  return s === '' || s === 'visible';
}

/** Lựa chọn hợp lệ trong danh sách cho phép, hoặc chuỗi rỗng: giá trị lạ (gửi thẳng vào endpoint) không bao giờ được ghi vào Sheet. */
function cleanChoice_(raw, allowed) {
  var t = String(raw == null ? '' : raw).trim().toLowerCase();
  return allowed.indexOf(t) !== -1 ? t : '';
}

// ---------- chống công thức trong ô Sheet ----------

/**
 * Giá trị bắt đầu bằng = + - @ có thể bị Sheets hiểu là công thức khi ghi bằng setValues. Thêm một dấu cách
 * ở đầu: ô bắt đầu bằng dấu cách không bao giờ là công thức, dù định dạng ô thế nào. Dấu cách này được gỡ lại
 * khi đọc (unsanitizeCell_), và chuỗi đã được clean_ nên không bao giờ bắt đầu bằng dấu cách thật.
 */
function sanitizeCell_(text) {
  return /^[=+\-@]/.test(text) ? ' ' + text : text;
}

function unsanitizeCell_(cell) {
  var text = String(cell);
  return /^ [=+\-@]/.test(text) ? text.slice(1) : text;
}

// ---------- tiện ích ----------

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function jsonText_(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() < HEADERS.length) {
    // Sheet tạo từ bản script cũ (thiếu cột): ghi lại hàng tiêu đề đầy đủ, dữ liệu cũ giữ nguyên
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function getRsvpSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RSVP_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(RSVP_SHEET);
    sheet.appendRow(RSVP_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Khóa cache kèm "thế hệ": tăng thế hệ khi có lời chúc mới là vô hiệu hóa mọi trang đã cache, bất kể limit. */
function cacheKey_(cache, limit, before) {
  return 'w:' + (cache.get('gen') || '0') + ':' + limit + ':' + before;
}

function bumpGeneration_(cache) {
  var next = (parseInt(cache.get('gen'), 10) || 0) + 1;
  safePut_(cache, 'gen', String(next), GENERATION_TTL_S);
}

/** CacheService từ chối giá trị > 100KB; cache chỉ là tối ưu nên lỗi ở đây không được làm hỏng yêu cầu. */
function safePut_(cache, key, value, ttl) {
  try {
    cache.put(key, value, ttl);
  } catch (err) {
    // bỏ qua
  }
}

// ---------- đọc ----------

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    var limit = Math.min(Math.max(parseInt(p.limit, 10) || DEFAULT_LIMIT, 1), PAGE_MAX);
    var before = parseInt(p.before, 10) || 0; // con trỏ = số dòng; 0 = từ dòng mới nhất

    var cache = CacheService.getScriptCache();
    var key = cacheKey_(cache, limit, before);
    var cached = cache.get(key);
    if (cached) return jsonText_(cached);

    var sheet = getSheet_();
    var lastRow = sheet.getLastRow();
    var items = [];
    var nextCursor = null;

    if (lastRow >= 2) {
      var rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues(); // rows[i] là dòng i + 2
      var row = before > 1 ? Math.min(before - 1, lastRow) : lastRow;
      for (; row >= 2 && items.length < limit; row--) {
        var r = rows[row - 2];
        if (isVisible_(r[4])) {
          items.push({
            id: String(r[0]),
            createdAt: String(r[1]),
            name: unsanitizeCell_(r[2]),
            message: unsanitizeCell_(r[3]),
            flower: cleanChoice_(r[5], FLOWER_IDS),
            ink: cleanChoice_(r[6], INK_KEYS),
          });
        }
      }
      // Vòng lặp chỉ dừng khi hết dòng (row < 2) hoặc đã đủ `limit`. Còn dòng phía trước (row >= 2) nghĩa là
      // đã đủ `limit`: trả con trỏ cho trang cũ hơn.
      if (row >= 2) nextCursor = String(row + 1);
    }

    var body = JSON.stringify({ ok: true, items: items, nextCursor: nextCursor });
    safePut_(cache, key, body, CACHE_TTL_S);
    return jsonText_(body);
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  }
}

// ---------- ghi ----------

function parseBody_(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '');
    return data && typeof data === 'object' ? data : null;
  } catch (err) {
    return null;
  }
}

/** Thiếu elapsedMs cũng bị coi là quá nhanh, để bot không né được bằng cách bỏ trường này. */
function isTooFast_(body) {
  return typeof body.elapsedMs !== 'number' || body.elapsedMs < MIN_FILL_MS;
}

/**
 * Ghi một dòng xác nhận tham dự. Khách có thể gửi lại để đổi câu trả lời, nên dòng nào cũng được giữ
 * (dòng mới nhất của cùng một người là câu trả lời cuối).
 */
function handleRsvp_(body, lock) {
  var name = clean_(body.name);
  if (!name) return json_({ ok: false, error: 'name_required' });
  if (length_(name) > RSVP_NAME_MAX) return json_({ ok: false, error: 'invalid' });

  var attending = body.attending === 'yes' ? 'Có' : body.attending === 'no' ? 'Không' : '';
  if (!attending) return json_({ ok: false, error: 'invalid' });

  var guests = 0;
  if (attending === 'Có') {
    guests = Number(body.guests);
    if (!isFinite(guests) || Math.floor(guests) !== guests || guests < 1 || guests > RSVP_GUESTS_MAX) {
      return json_({ ok: false, error: 'invalid' });
    }
  }

  var transport = '';
  if (attending === 'Có') {
    transport = body.transport === 'own' ? 'Xe cá nhân' : body.transport === 'shared' ? 'Xe chung' : '';
    if (!transport) return json_({ ok: false, error: 'invalid' });
  }

  // Nhà trai không có điểm đón nên để trống; có gửi thì phải là điểm đón hợp lệ
  var pickup = '';
  if (transport === 'Xe chung' && body.pickup) {
    if (!Object.prototype.hasOwnProperty.call(PICKUP_POINTS, body.pickup)) return json_({ ok: false, error: 'invalid' });
    pickup = PICKUP_POINTS[body.pickup];
  }

  var note = clean_(body.note);
  if (length_(note) > RSVP_NOTE_MAX) return json_({ ok: false, error: 'note_too_long' });
  var guest = clean_(body.guest).slice(0, RSVP_GUEST_MAX);

  if (isTooFast_(body)) return json_({ ok: false, error: 'too_fast' });
  var token = String(body.token || '').slice(0, 64);
  if (!token) return json_({ ok: false, error: 'invalid' });

  lock.waitLock(10000);
  var cache = CacheService.getScriptCache();
  var rateKey = 'rsvp:' + token;
  var used = parseInt(cache.get(rateKey), 10) || 0;
  if (used >= RSVP_RATE_LIMIT) return json_({ ok: false, error: 'rate_limited' });

  var props = PropertiesService.getScriptProperties();
  var dayKey = 'rsvpday:' + Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd');
  var today = parseInt(props.getProperty(dayKey), 10) || 0;
  if (today >= RSVP_DAILY_CAP) return json_({ ok: false, error: 'rate_limited' });

  var sheet = getRsvpSheet_();
  var row = sheet.getLastRow() + 1;
  // Cột văn bản: định dạng thuần (@) + sanitizeCell_ là hai lớp chống công thức. Cột số người ghi riêng dạng số
  // để cộng tổng được.
  sheet.getRange(row, 1, 1, RSVP_HEADERS.length).setNumberFormat('@');
  sheet.getRange(row, 1, 1, RSVP_HEADERS.length).setValues([[
    Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm:ss'),
    sanitizeCell_(name),
    attending,
    '',
    sanitizeCell_(note),
    sanitizeCell_(guest),
    transport,
    sanitizeCell_(pickup),
  ]]);
  sheet.getRange(row, 4).setNumberFormat('0').setValue(guests);

  safePut_(cache, rateKey, String(used + 1), RATE_WINDOW_S);
  props.setProperty(dayKey, String(today + 1));
  return json_({ ok: true });
}

function handleWish_(body, lock) {
  var v = validateWish_(body.name, body.message);
  if (!v.ok) return json_({ ok: false, error: v.error });

  if (isTooFast_(body)) return json_({ ok: false, error: 'too_fast' });

  var token = String(body.token || '').slice(0, 64);
  if (!token) return json_({ ok: false, error: 'invalid' });
  var requestId = String(body.requestId || '').slice(0, 64);

  lock.waitLock(10000);

  var cache = CacheService.getScriptCache();

  // Gửi lại cùng một requestId (vd. lần trước quá thời gian chờ nhưng thực ra đã ghi): trả kết quả cũ, không ghi trùng.
  if (requestId) {
    var prior = cache.get('req:' + requestId);
    if (prior) return jsonText_(prior);
  }

  // Giới hạn theo mã trình duyệt: chỉ giảm spam ngẫu nhiên, mã này giả được nên không phải bảo mật.
  var rateKey = 'rl:' + token;
  var used = parseInt(cache.get(rateKey), 10) || 0;
  if (used >= RATE_LIMIT) return json_({ ok: false, error: 'rate_limited' });

  // Trần số lời chúc mỗi ngày cho toàn bộ trang.
  var props = PropertiesService.getScriptProperties();
  var dayKey = 'day:' + Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd');
  var today = parseInt(props.getProperty(dayKey), 10) || 0;
  if (today >= DAILY_CAP) return json_({ ok: false, error: 'rate_limited' });

  var id = Utilities.getUuid();
  var status = v.profane ? 'hidden' : 'visible';
  var sheet = getSheet_();
  var row = sheet.getLastRow() + 1;
  // Định dạng văn bản thuần (@) và sanitizeCell_: hai lớp chống công thức như "=SUM(1,1)".
  var range = sheet.getRange(row, 1, 1, HEADERS.length);
  range.setNumberFormat('@');
  range.setValues([[
    id,
    new Date().toISOString(),
    sanitizeCell_(v.name),
    sanitizeCell_(v.message),
    status,
    cleanChoice_(body.flower, FLOWER_IDS),
    cleanChoice_(body.ink, INK_KEYS),
  ]]);

  safePut_(cache, rateKey, String(used + 1), RATE_WINDOW_S);
  props.setProperty(dayKey, String(today + 1));
  bumpGeneration_(cache); // mọi trang đã cache đều lấy lại dữ liệu mới

  var result = JSON.stringify({ ok: true, id: id, status: status });
  if (requestId) safePut_(cache, 'req:' + requestId, result, REQUEST_TTL_S);
  return jsonText_(result);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = parseBody_(e);
    if (!body) return json_({ ok: false, error: 'invalid' });

    // Ô bẫy bot: giả vờ thành công để bot không biết bị chặn, nhưng không ghi gì.
    if (body.website) return json_({ ok: true, id: '', status: 'hidden' });

    if (body.kind === 'rsvp') return handleRsvp_(body, lock);
    return handleWish_(body, lock);
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
