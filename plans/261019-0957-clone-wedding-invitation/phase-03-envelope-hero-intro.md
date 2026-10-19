---
phase: 3
title: "Envelope hero intro"
status: completed
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 3: Envelope hero intro

> Hoàn thành 2026-10-19. Đã kiểm chứng trên trình duyệt: khóa cuộn trước khi mở, bấm dấu sáp và Enter đều mở được, `?to=` chứa HTML chỉ hiện dạng chữ, không tràn ngang ở 389px. Thứ tự lớp: nền < nắp < tam giác bên < ảnh < tam giác đáy < chữ (ảnh nằm trên hai tam giác bên giống mẫu). Chưa thử: iPhone thật (nắp 3D), `prefers-reduced-motion`, máy yếu `?lite=1`; cảnh báo oxlint `react/refs` ở `useGSAP({ scope: rootRef })` là false positive (đây là API chính thức của `@gsap/react`).

## Lệch so với kế hoạch gốc (đã chấp nhận)
Chưa làm: bước cuối "phong bì trượt khỏi màn hình" (phong bì ở lại như mẫu), nắp 2D thay thế cho máy yếu (`lite` hiện giữ 1 tim). Đã bổ sung theo review: `<main inert>` tới khi mở, tiêu điểm chuyển sang `<main>` sau khi mở, viền focus của dấu sáp màu giấy, tên khách 1 dòng cắt `…`, preload ảnh phong bì.

## Overview
Màn mở đầu: tiêu đề + tên + logo song hỷ, phong bì đỏ có dấu sáp; bấm dấu sáp chạy timeline mở thiệp rồi mở khóa scroll.

## Requirements
- Functional: trước khi mở `overflow:hidden` trên body; sau khi mở cuộn bình thường; hỗ trợ tên khách qua query `?to=` (hiển thị "Quý Khách" mặc định).
- Non-functional: animation chỉ dùng transform/opacity; 60fps; có nút/phím (Enter/Space) mở cho bàn phím; reduced-motion → mở tức thì.

## Architecture
Phong bì = 3 lớp CSS: thân (#A33B3B có texture nhẹ), 2 nắp tam giác bên/dưới (`clip-path`), nắp trên (#7F2527) xoay `rotateX(-180deg)` với `transform-origin: top`; ảnh đôi nằm giữa thân và nắp trước, trượt `translateY` lên. Dấu sáp = SVG/PNG tự vẽ (không dùng asset mẫu).
Timeline GSAP (~2.2s, chạy trong `useGSAP` với scope là ref của phong bì): seal pulse+fade (0.3s) → nắp lật (0.7s, ease power2.inOut) → ảnh trượt lên + scale (0.8s) → 3 trái tim đỏ bay lên, lệch pha, fade (1.2s) → phong bì trượt xuống/khỏi viewport, hiện "Chạm để mở thiệp" gợi ý ban đầu bằng pulse.
Nội dung phía trên: "WEDDING INVITATION" (Arial 23px, tracking 9px), "THIỆP MỜI CƯỚI" (38px, tracking 2px, #834343), tên script 63px + "&", logo song hỷ SVG đỏ.

## Related Code Files
- Create: `src/components/envelope-intro.tsx`, `envelope-intro.css`, `src/components/icons/double-happiness.tsx`, `wax-seal.tsx`
- Modify: `src/App.tsx` (gate nội dung chính sau khi mở)

## Implementation Steps
1. Dựng tĩnh phong bì đúng tỉ lệ (ảnh chụp mẫu: rộng ~86% khung, nắp ~45% chiều cao).
2. Viết timeline GSAP, `paused`, play khi click/Enter.
3. Khóa/mở scroll (class trên `html`), scrollTo(0) khi mở.
4. Đọc `?to=` → tên khách ở cuối phong bì ("NĂM 2026 / TRÂN TRỌNG KÍNH MỜI / Quý Khách"); escape text, không dùng innerHTML.
5. Reduced-motion: set trạng thái cuối ngay.
6. Hiệu năng: ảnh đôi trong phong bì chính là ảnh hero đã nén, preload; nắp 3D (`rotateX`) thử trên iPhone thật, nếu giật thì chuyển 2D (`scaleY`) hoặc dùng luôn 2D khi `html.lite`; tim bay tối đa 3, bỏ trên `lite`; `will-change` chỉ bật trong lúc chạy timeline, gỡ khi xong.

## Success Criteria
- [x] Quay màn hình so với mẫu: thứ tự và nhịp tương đương.
- [x] Không layout shift khi mở; Tab focus vào seal, Enter mở được.
- [x] Tên khách từ `?to=` hiển thị an toàn (thử chuỗi có `<script>`).

## Risk Assessment
Hiệu ứng 3D nắp bị giật trên iOS Safari → thử `will-change: transform`, `backface-visibility`; nếu vẫn giật, thay bằng 2D scaleY. Tín hiệu: <50fps trên thiết bị thật.
