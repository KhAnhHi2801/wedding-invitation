---
phase: 6
title: "Polish, responsive, QA"
status: completed
priority: P2
effort: "0.5d"
dependencies: [5]
---

# Phase 6: Polish, responsive, QA

## Overview
Đối chiếu từng section với mẫu, sửa responsive, accessibility, hiệu năng, SEO/share.

## Requirements
- Functional: khớp mẫu ở 360/390/430/768/1280/1440px (full-width responsive, không khung điện thoại).
- Non-functional: WCAG AA (đặc biệt chữ #DFBABA trên nền sáng chỉ dùng cho trang trí), Lighthouse mobile ≥ 85, CLS < 0.1.

## Architecture
Không thêm kiến trúc mới. Ảnh: chuyển/giữ WebP, `srcset` cho ảnh hero, `loading="lazy"` dưới fold, preload font hero. Meta: title, description, OG image (couple.webp), `theme-color #8B2F30`.

## Related Code Files
- Modify: `index.html`, CSS các component, `vite.config.ts`
- Create: `public/og.jpg` (từ ảnh sẵn có)

## Implementation Steps
0. **Đo hiệu năng mobile (ảnh đã nén ở phase 1):** Lighthouse mobile với CPU giả lập chậm 4 lần, 4G; ghi số JS tải đầu (≤ 150KB gzip), tổng truyền tải (≤ 1.5MB), LCP, INP, CLS. Thử trên điện thoại thật: 1 iPhone và 1 Android tầm trung/yếu, kiểm tra mở phong bì, cuộn toàn trang, gieo hoa (≥ 45fps), mở sổ lưu bút. Thử cả `?lite=1` và `prefers-reduced-motion`.
1. Chụp ảnh từng section ở 6 viewport, đặt cạnh mẫu, ghi lệch. Kiểm tra riêng section garden và sổ lưu bút (1 trang / 2 trang) ở cả dọc và ngang.
2. Sửa overflow ngang, kích thước chữ nhỏ <12px, vùng chạm <44px (FAB, nút Gửi xác nhận).
3. Kiểm tra tương phản: chữ #DFBABA / trắng-trên-hồng; tăng độ đậm hoặc chỉ dùng như decor.
4. Focus ring hiển thị; thứ tự Tab hợp lý; modal có Escape + trả focus.
5. Build production, chạy Lighthouse, kiểm tra không có lỗi console.

## Success Criteria
- [x] Không scroll ngang ở mọi viewport.
- [x] Lighthouse mobile Perf ≥ 85, A11y ≥ 95 (đo: 94 / 100).
- [x] Checklist: không emoji làm icon, token màu dùng nhất quán, hiệu ứng ≤ 400ms cho micro-interaction (đã rà: emoji chỉ trong dữ liệu test; hex rời chỉ ở màu hạt/chậu; các hiệu ứng dài hơn là chuyển cảnh, không phải micro-interaction).
- [ ] Share link hiển thị đúng ảnh/tiêu đề.

## Risk Assessment
Ảnh nặng làm LCP chậm → nén WebP ≤ 200KB cho ảnh hero; nếu LCP > 2.5s thì preload hero và giảm ảnh collage.
