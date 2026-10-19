---
phase: 2
title: "Content sections"
status: completed
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Content sections

> Hoàn thành 2026-10-19 (13 section tĩnh + helper). Lệch có chủ đích so với mẫu: lịch tháng 12 có tiêu đề thứ và ô trống đầu tháng (mẫu chỉ liệt kê 1–31); ngày sinh chú rể sửa "05/08/ 1995" thành "05/08/1995"; QR quà mừng và modal RSVP để phase 4; thêm nhãn giao diện vào `config.ui`. Chưa kiểm chứng: countdown chạm 0 (chỉ đọc code, có `Math.max(0, …)`), đánh giá độc lập bằng `code-reviewer`/`tester` (agent bị dừng vì giới hạn tuần của tài khoản, cần chạy lại).

## Overview
Dựng tĩnh (chưa animation) toàn bộ section 1–14 với đúng văn bản, bố cục, màu, font theo Inventory.

## Requirements
- Functional: mọi chuỗi khớp mẫu; countdown live tới 24/12/2026 10:30 (giờ VN, UTC+7); lịch tháng 12/2026 tính bằng code, highlight ngày 24.
- Non-functional: semantic HTML (`section`, heading tuần tự), alt text ảnh, ảnh có width/height, lazy-load dưới fold.

## Architecture
Mỗi section = 1 component React (`.tsx`, function component), nhận dữ liệu từ `src/config/wedding-config.ts`, không chứa chuỗi cứng. Bố cục full-width responsive: mobile-first (360px), CSS grid + `clamp()`/`vw` theo tỉ lệ mẫu (~733px), desktop mở rộng bằng container max-width lớn, nội dung chữ giữ độ rộng đọc được (≤ 75 ký tự/dòng), không có khung điện thoại cố định.
Component: `Cover+Countdown`, `Invitation`, `Ceremony`, `EventInfo`, `MapCard`, `MarryMe`, `AboutBride`, `AboutGroom`, `SaveTheDate+Calendar`, `Timeline`, `Gallery`, `Rsvp`, `Gift`, `ThankYou`, `FloatingActions`.

## Related Code Files
- Create: `src/components/*.tsx` (+ `.css` cùng tên), `src/hooks/use-countdown.ts`, `src/lib/build-calendar.ts`
- Modify: `src/App.tsx`, `src/config/wedding-config.ts`
- Delete: none

## Implementation Steps
1. Cover: ảnh `hero/couple.webp` full-width + 4 ô countdown (nền #8B2F30 ~70% opacity, chữ trắng 20px).
2. Invitation: letter-spacing 11px, đoạn văn Quicksand 22px/500 căn giữa.
3. Ceremony: chữ dọc `writing-mode: vertical-rl` hoặc stack 3 dòng "Lễ/Thành/Hôn"; tên so le; Nhà Trai/Nhà Gái 2 cột.
4. EventInfo: số "24" 125px giữa 2 đường kẻ ngang; "THÁNG 12" trái, "NĂM 2026" phải; địa điểm.
5. MapCard: iframe Google Maps embed (địa chỉ Trống Đồng Palace) + nút "Mở trong Maps" (link ngoài, `rel=noopener`).
6. MarryMe: 3 ảnh collage chồng, chữ "MARRY ME?" / "YES! I DO!" có outline (`-webkit-text-stroke`).
7. About Bride/Groom: card viền hồng 2px + ảnh; chữ dọc Bride/Groom (#DFBABA, tracking 7px); mirror.
8. SaveTheDate: ảnh đôi + khung viền lệch + nhãn "2026 / Dec" dọc; lịch 7 cột.
9. Timeline: trục dọc, 3 mốc, icon SVG (xe hoa, nơ, ly) thay cho emoji, trái tim hồng.
10. Gallery chồng lớp + chữ dọc script; Rsvp arch (`border-radius: 50% 50% 0 0 / 30% 30% 0 0`); Gift: 2 pill (#EDEDED) + avatar tròn viền dashed + QR; ThankYou.

## Success Criteria
- [x] So sánh ảnh chụp từng section với mẫu: bố cục, màu, font cùng nhịp.
- [x] Text diff với nội dung mẫu = 0 khác biệt (trừ chủ ý thay đổi).
- [x] Countdown đếm đúng, dừng ở 0 sau giờ cưới.

## Risk Assessment
Bố cục absolute dễ vỡ ở màn khác → dùng đơn vị tỉ lệ + kiểm tra 360/390/430/768px ở Phase 5. QR cần tự sinh (thư viện `qrcode`) từ chuỗi tài khoản; không nhúng QR của mẫu.
