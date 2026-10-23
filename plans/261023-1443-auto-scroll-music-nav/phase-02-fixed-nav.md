---
phase: 2
title: "Thanh nav cố định"
status: completed
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 2: Thanh nav cố định

## Overview
Thanh điều hướng cố định phía trên, hiện sau khi mở thiệp: nhảy tới section, tô mục hiện tại, chứa nút nhạc (và nút tự cuộn ở phase 3).

## Requirements
- Functional: 6 mục nhảy tới section; mục đang xem được tô (`aria-current="location"`); focus chuyển theo như `scrollToSection` hiện có.
- Non-functional: cao ~2.75rem, đúng safe-area, không chồng pill/nút tròn ở đáy; hợp màu paper/ink của site; 390px không tràn ngang; vùng chạm cao ≥44px.

## Architecture
- `src/components/site-nav.tsx` + `site-nav.css`: `<nav aria-label>` với danh sách mục lấy từ `weddingConfig.ui.nav` (nhãn + id).
- Mục đang xem: `IntersectionObserver` (rootMargin `-40% 0 -55% 0`) trên các section theo id.
- Cuộn tới mục: tách `scrollToSection` ở `floating-actions.tsx` ra `src/lib/scroll-to-section.ts` dùng chung; `scroll-margin-top` bằng chiều cao nav (token `--nav-h` trong `tokens.css`).
- Nút nhạc chuyển từ `floating-actions.tsx` vào cuối nav; xóa css `fab__music`.

## Related Code Files
- Create: `src/components/site-nav.tsx`, `src/components/site-nav.css`, `src/lib/scroll-to-section.ts`
- Modify: `src/App.tsx` (render `<SiteNav />` cạnh `FloatingActions` khi `opened`), `src/components/floating-actions.tsx` + `.css` (bỏ nút nhạc, dùng helper), `src/styles/tokens.css` (`--nav-h`, `--z-nav` = 45), `src/config/wedding-config.ts` (`ui.nav`), thêm `id` cho: `cover`, `ceremony`, `event` (khối `.pair`), `story`, `timeline`, `gallery` trong component hoặc `App.tsx`.

## Implementation Steps
1. Thêm `id` cho các section/khối; kiểm tra không trùng.
2. Thêm `ui.nav` vào type `WeddingConfig` và dữ liệu: Trang chủ, Sự kiện, Câu chuyện, Hành trình, Album, Lời chúc.
3. Viết helper `scroll-to-section`, đổi `floating-actions` dùng helper.
4. Viết `SiteNav` + css (nền `--paper` mờ + `backdrop-filter`, chữ `--font-ui`, mục active có gạch chân), nút nhạc dùng `useMusicState`.
5. `scroll-margin-top: var(--nav-h)` cho các section đích.
6. Gắn vào `App.tsx`; nav nằm ngoài `<main>` nên không bị `inert`; kiểm tra thứ tự Tab.
7. Responsive: ≥48rem căn giữa, khoảng cách rộng; <48rem nhãn 12–13px, cho cuộn ngang trong thanh nếu thiếu chỗ.
8. Test bằng Chrome ở 390px và 1280px, chụp màn hình.

## Success Criteria
- [x] Mỗi mục cuộn đúng section, không bị nav che tiêu đề.
- [x] Mục active đổi theo vị trí cuộn.
- [x] Nút nhạc hoạt động từ nav; góc trên phải không còn nút cũ.
- [x] Không chồng với FAB đáy; modal (z 100) phủ lên nav.

## Risk Assessment
- Hero full-bleed: nav mờ có thể khó đọc trên ảnh. Dấu hiệu: tương phản <4.5:1 trên hero → dùng nền paper đặc 85% thay vì trong suốt.
- `scrollIntoView` kèm reveal/parallax GSAP có thể lệch vị trí; nếu lệch, tính `getBoundingClientRect().top + scrollY - navH` rồi `scrollTo`.
