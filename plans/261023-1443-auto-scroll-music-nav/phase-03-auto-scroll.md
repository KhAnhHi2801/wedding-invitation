---
phase: 3
title: "Tự cuộn nhẹ"
status: completed
priority: P2
effort: "1.5h"
dependencies: [2]
---

# Phase 3: Tự cuộn nhẹ

## Overview
Sau khi mở phong bì, trang tự trôi xuống chậm như các thiệp cưới online; khách chạm/lăn/gõ phím là dừng, và có nút bật lại trong nav.

## Requirements
- Functional: bắt đầu ~1.5s sau `opened`; tốc độ ~45 px/s; dừng khi khách thao tác, khi modal mở, khi tab ẩn, khi tới cuối trang.
- Non-functional: mượt (rAF, không bật `scroll-behavior: smooth` toàn cục); `prefers-reduced-motion` thì không tự chạy; không giật trên iOS (tích lũy vị trí số thực).

## Architecture
- `src/lib/auto-scroll.ts`: store giống `music.ts` (`start/stop/toggle/subscribe/getState`, hook `useAutoScrollState`).
- Vòng rAF: `pos += speed * dt`; `window.scrollTo(0, pos)`; trước mỗi bước so `window.scrollY` với giá trị đã đặt, lệch >2px nghĩa là khách tự cuộn → `stop()`.
- Lắng nghe `wheel`, `touchstart`, `pointerdown`, `keydown` (passive) → `stop()`.
- Tạm dừng khi `html.is-locked` (modal/phong bì) hoặc `document.hidden`; dừng ở cuối trang (`scrollY + innerHeight >= scrollHeight - 2`).
- Nút trong `SiteNav`: icon play/pause + `aria-pressed`, nhãn từ `ui.autoScrollLabel`.
- `App.tsx`: sau `opened`, `setTimeout(autoScroll.start, delayMs)` (bỏ nếu reduced-motion), dọn timer khi unmount.

## Related Code Files
- Create: `src/lib/auto-scroll.ts`, `src/lib/auto-scroll.test.ts`
- Modify: `src/App.tsx`, `src/components/site-nav.tsx` + `.css`, `src/components/icons/ui-icons.tsx` (icon cuộn), `src/config/wedding-config.ts` (`ui.autoScrollLabel`, `autoScroll: { speed, delayMs }`)

## Implementation Steps
1. Viết `auto-scroll.ts`, tốc độ lấy từ config.
2. Test đơn vị (vitest, rAF giả + stub `scrollTo`): bước đúng tốc độ, dừng khi `scrollY` lệch, dừng ở cuối, không tự chạy khi reduced-motion.
3. Gắn vào `App.tsx` và nút nav.
4. Kiểm tra tay: phối hợp với reveal/parallax không giật; nhảy bằng nav thì dừng tự cuộn (theo câu hỏi mở số 1).
5. Chạy `tsc -b` và `vitest`.

## Success Criteria
- [x] Trang tự trôi mượt ~45 px/s sau 1.5s, dừng ngay khi chạm/lăn/phím.
- [x] Nút nav bật lại được; `aria-pressed` đúng.
- [x] Mở modal RSVP/lời chúc thì không cuộn nền.
- [x] Unit test pass.

## Risk Assessment
- Safari làm tròn `scrollTo` sub-pixel: dùng vị trí tích lũy nên trung bình đúng. Dấu hiệu hỏng: trang đứng yên → tăng tốc độ hoặc cộng dồn theo đơn vị nguyên.
- Phát hiện "khách tự cuộn" bằng lệch `scrollY` có thể báo nhầm khi chiều cao nội dung đổi (ảnh lazy). Nếu hay dừng nhầm, nới ngưỡng hoặc chỉ dựa vào sự kiện wheel/touch.
