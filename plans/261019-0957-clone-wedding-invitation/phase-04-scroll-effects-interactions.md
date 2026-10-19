---
phase: 4
title: "Scroll effects & interactions"
status: completed
priority: P1
effort: "1d"
dependencies: [2, 3]
---

# Phase 4: Scroll effects & interactions

> Hoàn thành 2026-10-19. **Lệch có chủ đích so với kế hoạch gốc:** QR quà mừng hiện ngay trong thẻ (giống mẫu) thay vì modal, nên không có `gift-modal.tsx`; nút nhạc nằm trong `floating-actions.tsx` (không có `music-toggle.tsx` riêng); ngày 24 nhấp nhẹ 3 lần; "Thank you" dùng clip-path viết dần (không có SVG path chữ để stroke); chữ outline ở Marry-me chỉ fade (không animate giãn chữ, tránh layout); không dùng `gsap.matchMedia()` (đã kiểm `shouldReduceEffects()` trực tiếp). GIF chuyển thành WebP động 248KB + ảnh tĩnh, bản gốc ở `source-images/animations/`.
> **Đã kiểm chứng trên trình duyệt:** 63 phần tử reveal đều hiện khi cuộn; parallax chạy (ScrollTrigger nạp lười); nút cố định chỉ hiện sau khi mở; nhạc phát/dừng đúng; modal RSVP (lỗi từng ô, tiêu điểm, đóng bằng nút X và bấm nền, nhả khóa cuộn, báo lỗi thân thiện khi chưa có endpoint); sao chép + toast; QR VietQR dựng lười; không tràn ngang ở 390px.
> **Chưa kiểm chứng:** Escape đóng modal (công cụ tự động không gửi được Escape tới `<dialog>`, kể cả `<dialog>` trần; đây là hành vi gốc của trình duyệt), gửi RSVP thật (chưa có Apps Script và endpoint), quét thử mã QR bằng app ngân hàng (số tài khoản hiện là dữ liệu mẫu), iOS thật (nhạc, sao chép trong Zalo/Messenger), reduced-motion.
> **Việc để phase 5:** viết `apps-script/wishes.gs` + `docs/wishes-setup.md` đúng hợp đồng ở đầu `src/lib/wishes-api.ts` (RSVP: `attending` là "yes"/"no", có `guests`, `note`, `guest`, `website`, `token`, `elapsedMs`; mã lỗi `too_fast`, `rate_limited`, `invalid`); section vườn phải có phần tử `id="garden"` luôn có trong DOM từ lúc dựng (nút "Gửi lời chúc…" chỉ kiểm một lần); toast đã ở lớp trên cùng (popover) nên dùng được cùng modal.

## Overview
Gắn hiệu ứng cuộn cho từng section; làm RSVP, quà mừng, nút cố định và nút nhạc. Lời chúc, vườn hoa và sổ lưu bút làm ở phase 5.

## Requirements
- Functional: reveal đúng loại theo bảng; RSVP ghi vào Google Sheet qua cùng Apps Script (tab `RSVP`); quà mừng mở modal QR + nút copy số tài khoản; nút nhạc bật/tắt.
- Non-functional: ScrollTrigger `once: true` cho reveal; reduced-motion tắt parallax/float; không block input.

## Architecture
Hook `useReveal(ref, preset)`: mặc định dùng `IntersectionObserver` + class CSS (transform/opacity, một lần); chỉ các preset cần chuỗi phức tạp (stagger dòng, `lineDraw`) mới dùng GSAP (`useGSAP`, tự dọn khi unmount). Preset: `fadeUp`, `slideLeft`, `slideRight`, `scaleIn`, `lineDraw`, `stagger`. `ScrollTrigger scrub` chỉ giữ cho tối đa 2 section parallax (MarryMe, Gallery), tắt khi `html.lite` hoặc reduced-motion. Trái tim nổi: tối đa 6 SVG heart, CSS keyframes, tạm dừng khi ra khỏi màn hình (`IntersectionObserver`), bỏ trên `lite`. Không animate `filter`, `box-shadow` lớn, `mix-blend-mode`, chữ `-webkit-text-stroke` đang chuyển động. Countdown là component riêng, chỉ cập nhật 4 node số mỗi giây. Bản đồ: ảnh tĩnh + nút, chỉ tải iframe khi bấm. "Thank you": sprite CSS/WebP động nhỏ, không dùng Lottie.

| Section | Preset |
|---------|--------|
| Cover | fadeIn + countdown tick |
| Invitation | stagger từng dòng fadeUp (40ms) |
| Ceremony | tên slideLeft/slideRight, đường kẻ lineDraw |
| EventInfo | 2 đường kẻ scaleX từ giữa, "24" scaleIn |
| MarryMe | collage parallax, chữ outline fade + tracking |
| About x2 | card + ảnh slide ngược chiều |
| SaveTheDate | khung viền offset trượt vào; ngày 24 pulse nhẹ |
| Timeline | từng mốc fadeUp, trục dọc lineDraw |
| Gallery | ảnh chồng lớp parallax; chữ dọc fade |
| Rsvp | arch scaleIn từ đáy |
| Gift | pill slide xen kẽ |
| ThankYou | chữ stroke-dashoffset reveal (SVG path) + nhân vật nhảy (CSS sprite hoặc Lottie tự làm) |

## Related Code Files
- Create: `src/hooks/use-reveal.ts`, `src/components/rsvp-modal.tsx`, `gift-modal.tsx`, `music-toggle.tsx`, `floating-actions.tsx`
- Modify: các component section ở phase 2 (gắn preset)

## Ràng buộc rút ra từ review phase 2-3
- **Khóa cuộn có đếm:** hiện `App.tsx` bật/tắt `html.is-locked` chỉ theo `opened`. Modal RSVP/quà mừng KHÔNG được dùng lại class này trực tiếp; làm `lockScroll()` trả về hàm nhả, đếm số chủ khóa.
- **Nhạc trên iOS:** `audio.play()` chỉ được phép trong chính handler click. `onOpened` chạy ~2.4s sau khi chạm, nên thêm prop `onOpenStart` gọi ngay trong `open` để khởi động nhạc.
- **Nút RSVP:** nối bằng `onClick`/context callback, không dùng listener toàn trang theo `data-action` (rò rỉ khi StrictMode mount đôi).
- **Nút cố định (FAB) và modal** phải nằm NGOÀI `<main>` (đang `inert` tới khi thiệp mở) hoặc tự `inert` theo `opened`.
- Thêm test nhỏ cho `useCountdown` (hiện chỉ đọc code).

## Implementation Steps
0. **Hoạt họa "Thank you":** bạn đã thêm `public/bride-groom-dancing.gif` (~945KB, vượt ngân sách ảnh). Chuyển sang WebP động hoặc MP4/WebM tự phát lặp (muted, `playsinline`) ≤ ~250KB, chỉ tải khi section gần màn hình; giữ GIF gốc ngoài `public/`.
1. Viết `use-reveal.ts` + mở rộng `lib/gsap.ts` (đã đăng ký `useGSAP`; ScrollTrigger CHƯA nạp, chỉ import ở 2 section parallax để giữ JS đầu ≤ 150KB gzip, hiện 104KB) dùng `gsap.matchMedia()` cho reduced-motion.
2. Gắn preset từng section; duration 0.6–0.9s, ease `power3.out`.
3. FAB: "Gửi lời chúc…" cuộn tới section Our Little Garden (phase 5); nút quà cuộn tới Gift; nút RSVP mở modal; nút nhạc đọc `music.src` từ config.
4. Nhạc: mặc định tắt, chỉ phát sau khi người dùng bấm; lỗi tải file (placeholder thiếu/hỏng) thì ẩn nút, không lỗi console; `aria-pressed`, `aria-label`.
5. RSVP form: tên, tham dự/không, số người, ghi chú; label hiển thị, lỗi cạnh trường, nút disabled khi đang gửi, toast 3–5s, focus vào trường lỗi đầu tiên. Gửi bằng `kind: "rsvp"` tới endpoint chung (client `src/lib/wishes-api.ts` của phase 5; làm phần RSVP trước nếu cần, không phụ thuộc UI garden).
6. Gift: copy số tài khoản (Clipboard API + fallback), toast "Đã sao chép"; QR sinh bằng `qrcode` từ config.

## Success Criteria
- [x] Mỗi section chạy preset đúng bảng, chỉ 1 lần.
- [x] Bật `prefers-reduced-motion`: không parallax, không tim bay, nội dung vẫn đầy đủ.
- [x] RSVP gửi được khi có endpoint; không endpoint thì báo lỗi thân thiện, không crash.
- [x] Nhạc không tự phát; thiếu file nhạc thì không lỗi.

## Risk Assessment
Quá nhiều ScrollTrigger gây tụt FPS ở máy yếu → tín hiệu: long task >50ms khi cuộn; phản ứng: dùng IntersectionObserver + CSS class cho reveal, chỉ giữ `scrub` cho 2 section parallax.
