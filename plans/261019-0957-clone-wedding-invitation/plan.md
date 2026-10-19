---
title: "Clone thiệp cưới Mai Anh & Quốc Huy (ngaychungdoi canvas-template)"
description: "Dựng lại thiệp cưới online dạng phong bì + scroll story, đủ nội dung, hiệu ứng, typography; thêm mini-game gieo hoa và sổ lưu bút lưu Google Sheet."
status: completed
priority: P1
effort: "~5d"
tags: [wedding, landing, animation, react, vite, gsap, page-flip, google-sheet]
created: 2026-10-19
---

# Clone thiệp cưới online

Nguồn tham chiếu: https://ngaychungdoi.com/mau-thiep/canvas-template/b6qlri30ug21 (đã duyệt toàn bộ trang bằng trình duyệt, mobile-width ~733px).
Dự án anh em để lấy logic lời chúc: `../preview-wedding` (Vite + vanilla JS + GSAP + page-flip, Google Apps Script).

## Outcome
Trang web tĩnh responsive full-width: màn phong bì có dấu sáp, bấm để mở, cuộn qua ~15 section có hiệu ứng reveal; cuối trang có "khu vườn" mini-game gieo hoa gửi lời chúc, lời chúc lưu Google Sheet và hiển thị trong sổ lưu bút lật trang. Mọi nội dung đổi được ở các file config riêng.

## Non-goals
- Không copy file font/ảnh/asset từ server mẫu (bản quyền). Font Google tự host, ảnh trong `public/`.
- Không có editor ("bút chì") và nhãn "Made with Ngày Chung Đôi".
- Không dùng Three.js.
- Không dựng backend riêng: Google Apps Script + Sheet là backend.

## Decisions (đã chốt)
| # | Quyết định | Ghi chú |
|---|-----------|---------|
| 1 | Font Google, có subset tiếng Việt, hợp tone kem + đỏ rượu | Đã kiểm tra từng font bằng Google Fonts CSS API. Bảng bên dưới |
| 2 | Giữ nội dung mẫu, tách config riêng | `src/config/wedding-config.ts` (thiệp) + `src/config/flower-wishes.ts` (hoa, chuyển từ `flowerWishes.ts` ở gốc dự án) |
| 3 | Lời chúc lưu Google Sheet, hiển thị sổ lưu bút | Tái dùng `wishes.gs`, `api.js`, `guestbook.js`, `wish-*.js` của `../preview-wedding` |
| 4 | Full-width responsive, nhạc nền tạm | `music.src` trong config, file placeholder tạm, code chịu được khi thiếu file |
| 5 | Hiệu ứng nở hoa dùng bộ SVG của `public/gieo-một-lời-chúc` | 15 renderer thực vật tiến trình 0→1 + âm thanh Web Audio; ảnh `public/flowers/` không còn dùng cho game. Xem phase 5 |
| 6 | Stack: **React + Vite + TypeScript + GSAP + page-flip** | Giữ React theo yêu cầu. `preview-wedding` là vanilla nên code tái dùng được chia hai loại: logic thuần (`wishes-api`, `wish-validation`, `wish-style`, `wishes.gs`) copy gần như nguyên; phần DOM (`guestbook.js` dựa trên page-flip) giữ nguyên dạng module, mount vào React qua ref + `useEffect` |
| 7 | Ưu tiên hiệu năng điện thoại | Ngân sách: JS đầu ≤ 150KB gzip, truyền tải ≤ 1.5MB, LCP < 2.5s 4G, INP < 200ms, mini-game ≥ 45fps; chế độ `lite` cho máy yếu (phase 1, 3, 4, 5, 6) |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Setup, font, config](./phase-01-start.md) | Done |
| 2 | [Content sections](./phase-02-content-sections.md) | Done |
| 3 | [Envelope hero intro](./phase-03-envelope-hero-intro.md) | Done |
| 4 | [Scroll effects & interactions](./phase-04-scroll-effects-interactions.md) | Done |
| 5 | [Garden mini-game, Sheet, guestbook](./phase-05-garden-wishes-guestbook.md) | Done |
| 6 | [Polish, responsive, QA](./phase-06-polish-responsive-qa.md) | Done |

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6. Phase 2 và 3 song song được sau phase 1. Phase 5 cần phase 1 (config, API) và phần layout của phase 2.

## Inventory trang mẫu (thứ tự từ trên xuống)

| # | Section | Nội dung | Hiệu ứng chính |
|---|---------|----------|----------------|
| 0 | Envelope intro | WEDDING INVITATION, THIỆP MỜI CƯỚI, Mai Anh & Quốc Huy, logo song hỷ đỏ, phong bì đỏ + dấu sáp, "Chạm để mở thiệp", "NĂM 2026 / TRÂN TRỌNG KÍNH MỜI / Quý Khách" | Chạm dấu sáp: nắp lật, ảnh đôi trượt lên, tim đỏ bay; khóa scroll tới khi mở |
| 1 | Cover photo + countdown | Ảnh full-width, 4 ô đếm ngược ngày/giờ/phút/giây | Ảnh fade-in, countdown live |
| 2 | Invitation | "INVITATION" letter-spaced + đoạn lời mời | Fade/slide-up từng dòng |
| 3 | Lễ Thành Hôn | Chữ dọc "Lễ Thành Hôn" + đường kẻ đỏ; tên Phạm Quốc Huy / & / Nguyễn Mai Anh so le; Nhà Trai / Nhà Gái | Tên trượt vào từ 2 phía, đường kẻ vẽ dần |
| 4 | Thông tin tiệc | "TRÂN TRỌNG KÍNH MỜI Quý Khách", "TIỆC MỪNG LỄ THÀNH HÔN", "VÀO LÚC 10:30 THỨ NĂM", THÁNG 12 / **24** / NĂM 2026, "(Tức ngày 17 tháng 11 năm Bính Ngọ)", TRỐNG ĐỒNG PALACE + địa chỉ | Hai đường kẻ mở từ giữa, số 24 scale-in |
| 5 | Bản đồ | Card Google Maps + nút "Mở trong Maps" | Fade-in |
| 6 | Marry me / Yes I do | "SWEET WEDDING"; "MARRY ME?" chồng collage 3 ảnh; "YES! I DO!" nền hồng; tim hồng nổi | Chữ outline, parallax collage, tim bay |
| 7 | About us: Bride | Script "About us", card viền hồng: Nguyễn Mai Anh, 12/05/2000, TP. Điện Biên, ảnh, chữ dọc "Bride" | Card + ảnh reveal xen kẽ |
| 8 | About us: Groom | Phạm Quốc Huy, 05/08/1995, TP. Hà Nội, ảnh, chữ dọc "Groom" | như trên, mirror |
| 9 | Save the date | "Save the date", "2026 / Dec" dọc, ảnh đôi + khung viền lệch, lịch tháng 12/2026 highlight 24 | Khung offset, ngày 24 highlight |
| 10 | Timeline | 08:00 Lễ Rước Dâu, 09:30 Chụp hình lưu niệm, 10:30 Khai tiệc; icon + tim hồng, trục dọc | Từng mốc fade-in |
| 11 | Gallery | "I love you forever" / "Nice to meet you" script dọc; collage ảnh chồng lớp; "Mình rất muốn được chụp chung…" | Parallax chồng lớp |
| 12 | R.S.V.P. | Vòm hồng: "Xác nhận tham dự", nút "Gửi xác nhận" | Arch scale-up |
| 13 | Gửi quà mừng | 2 pill: Cô dâu/Chú rể + MB Bank : 012345678 + QR; avatar tròn viền đứt | Pill trượt xen kẽ |
| **14** | **Our Little Garden (MỚI)** | Chọn hoa → gieo hạt → hoa nở → viết lời chúc → hoa vào khu vườn chung; nút mở sổ lưu bút | Hạt rơi, thân mọc, hoa nở, vườn hoa lung linh |
| **15** | **Sổ lưu bút (MỚI)** | Sổ lật trang (page-flip), mỗi lời chúc kèm hoa khách đã chọn | Lật trang |
| 16 | Thank you | Hoạt họa cô dâu chú rể + "Thank you" script đỏ | Chữ vẽ nét |
| FAB | Cố định | "Gửi lời chúc…" (cuộn tới section 14), nút quà, nút RSVP, nút nhạc | Bỏ nhãn quảng cáo |

## Typography (đo từ trang mẫu, thay bằng font Google đã kiểm tra subset `vietnamese`)

| Vai trò | Mẫu dùng | Cỡ / màu | Font thay thế | Ghi chú |
|---------|----------|----------|---------------|---------|
| Tên hero (Mai Anh, Quốc Huy) | EdwardianScript | 63px, #834343 | **Pinyon Script** | script trang trọng, gần Edwardian nhất, có Việt |
| Tên / ngày sinh / Lễ Thành Hôn | HoaTay1 | 35–54px, #8B2F30 / #3B3232 | **Allura** | viết tay mềm, có Việt |
| "About us", "Thank you", chữ dọc script | Carlytte / The Artisan | 70px, #8B2F30 | **The Nautigal** | chữ ký, mẫu cũng đang tải font này |
| Tiêu đề display, "Nhà Trai", số 24, "&" | Belinda Avenue | 28–125px | **Cormorant Garamond** 500–700 | serif thanh, có Việt |
| "Save the date" | Playfair Display | 51px | **Playfair Display** | giống hệt |
| Thân bài | Quicksand | 22–26px / 500 | **Quicksand** | giống hệt |
| Nhãn letter-spaced (WEDDING INVITATION, SWEET WEDDING) | Arial | 23–38px, tracking 9–16px | Arial / Helvetica stack | giữ nguyên |

Đã loại: Instrument Serif (không có subset Việt), Parisienne, Mrs Saint Delafield, Sacramento (thiếu dấu Việt). Cài bằng `@fontsource/*` (self-host, subset latin + vietnamese), không phụ thuộc CDN.

Palette: nền #FCFCFC; đỏ rượu #8B2F30 / #834343; hồng phấn #DFBABA; hồng arch #E0B9BE; xám #3B3232; phong bì ~#A33B3B (nắp #7F2527).

## Review đề xuất mini-game của ChatGPT

Giữ nguyên luồng (chọn hoa → gieo → nảy mầm → viết lời chúc → hoa vào vườn). Điều chỉnh để khớp dữ liệu thật:

1. **Số hoa: 15, không phải 6.** `flowerWishes.ts` và prototype `public/gieo-một-lời-chúc/src/data/flowers.ts` đều có 15 loài với id trùng khớp (baby-breath, peony, daisy, tulip, sunflower, lavender, rose, calla-lily, lotus, cherry-blossom, orchid, carnation, hydrangea, magnolia, cosmos), ghép theo `id`.
2. **15 lựa chọn quá nhiều cho một lưới.** Dùng carousel scroll-snap: ảnh thu nhỏ SVG (`FlowerMiniPreview` của prototype), tên + chủ đề, nút "Gieo hoa này" (hai bước, tránh chọn nhầm).
3. **Dữ liệu thật giàu hơn bản ChatGPT.** Mỗi hoa có `message`, `prompts[]`, `wishes[]` (7 lời mẫu), `replies[]`. Dùng: `message` hiện khi hạt nảy mầm; `prompts` luân phiên làm placeholder; `wishes` chọn ngẫu nhiên điền sẵn (nút "Đổi gợi ý", khách sửa tự do); `replies` ngẫu nhiên làm lời cảm ơn sau khi gửi.
4. **Phải lưu loài hoa vào Sheet.** Thêm cột `flower` vào tab `Wishes` (validate theo danh sách id, giống cách `icon`/`ink` đang làm). Lời chúc cũ không có cột này: chọn hoa theo hash của `id`.
5. **Hiệu ứng nở hoa lấy từ prototype `public/gieo-một-lời-chúc`**, không dùng ảnh JPEG. Prototype vẽ 15 loài bằng SVG, mỗi loài mọc từ hạt qua nảy mầm, thân, lá từng đốt, nụ, cánh bung nở, rồi đung đưa; có âm thanh Web Audio tự tổng hợp. Copy engine và renderer, viết lại khung UI bằng CSS của site (không kéo Tailwind). Ảnh `public/flowers/` thôi dùng cho game. Chi phí: ~2200 dòng SVG render theo từng frame, phase 5 có kế hoạch đo FPS và phương án dự phòng.
6. **Vườn chung có trần.** Sheet đọc tối đa 400 lời chúc; vườn chỉ vẽ ~40 hoa mới nhất, vị trí cố định theo hash(id) để không nhảy khi tải lại, thêm dòng "+N bông hoa khác". Sổ lưu bút giữ đủ nội dung.
7. **Lời chúc bị ẩn vẫn nở hoa cục bộ.** Script đánh `hidden` khi có từ thô tục nhưng vẫn trả `ok`; khách vẫn thấy hoa của mình, người khác thì không. Giữ nguyên hành vi này.
8. **A11y:** carousel là `radiogroup`, `prefers-reduced-motion` bỏ qua animation mọc (hoa hiện luôn), lời cảm ơn trong `aria-live="polite"`.

## Success Criteria
- [ ] Đủ 16 section + 4 nút cố định, văn bản khớp mẫu từng chữ.
- [ ] Mở phong bì: chuỗi animation giống mẫu; trước khi mở không cuộn được.
- [ ] Mỗi section có hiệu ứng reveal; tôn trọng `prefers-reduced-motion`.
- [ ] Font đúng dấu tiếng Việt toàn trang (không fallback glyph).
- [ ] Responsive 360px đến 1440px+, không scroll ngang; không còn khung điện thoại cố định.
- [ ] Gieo hoa → gửi → lời chúc vào Sheet → hoa xuất hiện trong vườn và sổ lưu bút sau khi tải lại.
- [ ] Toàn bộ nội dung thiệp nằm trong `wedding-config.ts`, nội dung hoa trong `flower-wishes.ts`; đổi config là đổi trang, không sửa component.
- [ ] Lighthouse mobile (CPU 4x chậm) Performance ≥ 85, CLS < 0.1; ngân sách ở Decisions #7 đạt; thử trên iPhone và Android tầm trung.

## Open Questions
1. **Bạn cần tự tạo Google Sheet + deploy Apps Script mới** cho đám cưới này (dán `apps-script/wishes.gs` của plan, làm theo `docs/wishes-setup.md`), rồi đặt `VITE_WISHES_ENDPOINT` vào `.env.local`. Dùng chung Sheet của `preview-wedding` được về kỹ thuật nhưng lời chúc hai đám cưới sẽ lẫn nhau. Mặc định plan: Sheet riêng. Chưa có URL thì UI chạy chế độ offline (hoa vẫn nở, lời chúc nằm trong hàng đợi trình duyệt).
2. RSVP có ghi chung vào cùng Apps Script (tab `RSVP`, đã có sẵn trong `wishes.gs`) không? Mặc định plan: có.
3. Nhạc nền: sau này bạn gửi file thật; hiện dùng placeholder tạm trong `public/audio/`.
