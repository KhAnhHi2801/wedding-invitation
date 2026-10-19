---
phase: 1
title: "Setup, font, config"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Setup, font, config

> Hoàn thành 2026-10-19. Thêm so với kế hoạch gốc (theo review): kiểu `ImageKey` cho khóa ảnh, `src/lib/asset-url.ts` (tôn trọng `BASE_URL`), `src/lib/maps.ts` (link/iframe bản đồ cùng dựng từ `mapsQuery`), plugin Vite inject title/meta từ config, `public/og.jpg`, trường `bankBin` cho QR VietQR, `meta.siteUrl`; bỏ trường trùng lặp (`hero.year`, `saveTheDate.monthLabel`, `event.mapsUrl`) vì suy ra từ `event.startsAt`/`mapsQuery`.

## Overview
Khởi tạo Vite + React + TypeScript, nạp font có dấu tiếng Việt, định nghĩa token và hai file config để bạn đổi nội dung sau.

## Requirements
- Functional: dev server chạy; font Việt đúng; toàn bộ nội dung nằm trong config, component không chứa chuỗi cứng.
- Non-functional: font self-host `font-display: swap`, chỉ preload font hero; token là CSS variables; cùng Vite, GSAP, page-flip với `../preview-wedding` để tái dùng code.

## Architecture
```
src/
  config/wedding-config.ts   # TOÀN BỘ nội dung thiệp: tên, ngày, địa điểm, nhà trai/gái, timeline, bank, ảnh, nhạc
  config/flower-wishes.ts    # 15 loài hoa (chuyển từ flowerWishes.ts ở gốc dự án, xem phase 5)
  styles/tokens.css          # màu, font stack, spacing, easing, z-index
  styles/global.css
  components/                # 1 component React (.tsx)/section
  hooks/                     # use-reveal.ts, use-countdown.ts
  lib/                       # gsap.ts, countdown.ts, calendar.ts, wishes-api.ts, ...
public/ (đã có: hero/couple.webp, photos/photo-01..08.webp, flowers/*)
public/audio/bg-music.wav    # PLACEHOLDER tạm (npm run placeholder-audio; không có ffmpeg nên dùng WAV), thay file thật sau
.env.example, .env.local     # VITE_WISHES_ENDPOINT (.env.local không commit)
```

`wedding-config.ts` (kiểu có type, đổi giá trị là đổi trang):
`couple {bride, groom (tên, ngày sinh, quê, ảnh)}`, `event {date ISO + múi giờ +07:00, lunarText, venue, address, mapsUrl}`, `families {groom, bride}`, `timeline[]`, `invitationText`, `gift {bride, groom: bank, accountNumber}`, `photos`, `music {src, autoplay: false}`, `guestParam: "to"`.

Dependency: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `gsap`, `@gsap/react`, `page-flip`, `@fontsource/pinyon-script`, `@fontsource/allura`, `@fontsource/the-nautigal`, `@fontsource/cormorant-garamond`, `@fontsource/playfair-display`, `@fontsource/quicksand`, `qrcode`.

Font (đã kiểm tra có subset `vietnamese`): Pinyon Script (tên hero), Allura (tên/ngày viết tay), The Nautigal (chữ ký), Cormorant Garamond (display), Playfair Display, Quicksand (thân bài). Chỉ import subset `latin` + `vietnamese`. Nhãn letter-spaced dùng Arial/Helvetica như mẫu.

Token: `--ink:#3B3232 --wine:#8B2F30 --wine-2:#834343 --blush:#DFBABA --rose:#E0B9BE --paper:#FCFCFC`; thang chữ 12/14/16/22/26/34/54/70/125 (dùng `clamp()` theo vw); easing `cubic-bezier(.22,1,.36,1)`.

## Related Code Files
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/config/wedding-config.ts`, `src/styles/tokens.css`, `src/styles/global.css`, `src/lib/gsap.ts`, `.gitignore`, `.env.example`, `public/audio/bg-music.mp3`
- Modify: none
- Delete: none

## Implementation Steps
1. `npm create vite@latest . -- --template react-ts`, cài dependency ở trên.
2. Import font từ `@fontsource`; render thử chuỗi "Nguyễn Quốc Huy Điện Biên Lễ Thành Hôn Bính Ngọ" bằng từng font, xác nhận không rơi fallback glyph.
3. Viết `wedding-config.ts` với dữ liệu mẫu (theo Inventory ở plan.md), gồm kiểu TypeScript.
4. Tạo file nhạc placeholder tạm bằng `ffmpeg` (âm sine rất nhỏ, vài giây, loop) và ghi rõ trong config: `// TEMPORARY placeholder, thay bằng nhạc thật`. Nếu không có `ffmpeg`, tạo file rỗng hợp lệ và để player bỏ qua khi lỗi tải.
5. `viewport` meta chuẩn (không khóa zoom), nền `--paper`, layout full-width (không khung điện thoại), nội dung dùng `clamp()` và container max-width lớn cho desktop.
6. `.gitignore`: `node_modules`, `dist`, `.env.local`.
7. **Tối ưu ảnh ngay từ đầu** (ảnh gốc ~45MB: `couple.webp` ~7MB, `photo-01..08` 3–9MB): `scripts/optimize-images.mjs` (sharp) xuất ảnh hero ≤ 1600px, ảnh thường ≤ 1200px, WebP chất lượng ~78, mỗi ảnh hai cỡ để dùng `srcset`, mục tiêu ≤ 250KB/ảnh; giữ file gốc ngoài `public/`. Chỉ ảnh hero tải ưu tiên (`fetchpriority="high"`), phần còn lại `loading="lazy"`, `decoding="async"`, có `width`/`height`.
8. `src/lib/device-tier.ts`: port `detectLowEnd()` từ `../preview-wedding/src/three/device-tier.js` (cảm ứng và RAM ≤ 4GB hoặc ≤ 4 nhân, không tính iPhone; `?lite=1` / `?lite=0` để ép khi thử). Mọi hiệu ứng nặng ở các phase sau đọc từ đây (class `lite` trên `html`).
9. Ngân sách mobile, kiểm tra ở mỗi phase: JS tải đầu ≤ 150KB gzip, tổng truyền tải lần đầu ≤ 1.5MB, LCP < 2.5s trên 4G giả lập, INP < 200ms, CLS < 0.1. Cấu hình `build.rollupOptions` tách chunk cho phần cuối trang.

## Success Criteria
- [x] `npm run dev` hiển thị trang trống với đúng font/màu.
- [x] Chuỗi test tiếng Việt không rơi fallback glyph ở mọi font.
- [x] Không còn hex rời rạc trong component (chỉ dùng token).
- [x] Đổi một giá trị trong `wedding-config.ts` thì trang cập nhật (đã thử với tên cô dâu).
- [x] Mọi ảnh trong `public/hero` và `public/photos` ≤ 250KB; tổng < 3MB. (Ngoại lệ có chủ đích: `public/bride-groom-dancing.gif` ~945KB do bạn thêm cho "Thank you", xử lý ở phase 4; `public/flowers/` không dùng, phase 5 dọn.)
- [x] `?lite=1` bật class `lite` trên `html`.

## Risk Assessment
Font thay thế lệch phong cách → tín hiệu: so ảnh chụp cạnh nhau thấy tên hero khác rõ; phản ứng: thử Alex Brush hoặc Great Vibes (cũng có subset Việt) thay Pinyon Script, hoặc xin file font gốc.
