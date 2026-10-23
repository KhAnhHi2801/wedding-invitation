---
title: "Tự cuộn nhẹ, nhạc tự phát khi mở thiệp, thanh nav cố định"
description: "Ba cải tiến trải nghiệm cho thiệp cưới: auto-scroll chậm sau khi mở phong bì, nhạc phát ngay khi bấm mở, thanh điều hướng cố định để nhảy section."
status: completed
priority: P2
effort: "4h"
tags: [ux, audio, navigation]
created: 2026-10-23
---

# Tự cuộn nhẹ, nhạc tự phát, nav cố định

## Overview

Ba yêu cầu của user, độc lập về file nhưng chung điểm chạm là lúc mở phong bì (`App.tsx`) và nút nhạc cố định.

## Outcome / Non-goals

- Outcome: khách bấm phong bì → nhạc phát từ `public/musics`, trang tự trôi chậm xuống; có thanh nav cố định để nhảy section; chạm/lăn/gõ phím là dừng tự cuộn ngay.
- Non-goals: không đổi nội dung/bố cục section, không thêm thư viện, không thêm playlist.

## Hiện trạng (đã scout)

- `src/lib/music.ts` đã có store nhạc + `music.play()` gọi trong `handleOpenStart` (`App.tsx:36`) nhưng `weddingConfig.music.autoplay = false` và `src` còn là placeholder `audio/bg-music.wav`.
- File mới: `public/musics/paulyudin-romantic-romantic-music-493488 copy.mp3` (4 MB, tên có dấu cách, chưa track git).
- Nút nhạc `fab__music` đang cố định góc trên phải; pill "Gieo lời chúc" + 2 nút tròn chiếm đáy màn hình → nav phải đặt ở TOP.
- Chỉ 3 section có id (`gift`, `rsvp`, `guestbook`). `scrollToSection` ở `floating-actions.tsx` dùng `scrollIntoView`.
- `lockScroll` (`html.is-locked`) dùng chung cho phong bì và modal → dùng làm tín hiệu tạm dừng tự cuộn.
- `z-index`: fab 40, modal 100, intro 1000.

## Quyết định thiết kế

| Vấn đề | Chọn | Lý do |
|---|---|---|
| Vị trí nav | Thanh cố định phía trên, cao ~2.75rem, nền giấy mờ | Đáy đã có pill + nút tròn |
| Nút nhạc | Chuyển vào cuối thanh nav (bỏ `fab__music` riêng) | Tránh chồng nhau góc trên phải |
| Nút tự cuộn | Cạnh nút nhạc trong nav (play/pause) | Khách có cách bật lại sau khi dừng |
| Mục nav | Trang chủ, Sự kiện, Câu chuyện, Hành trình, Album, Lời chúc | 6 mục, nhãn ngắn, vừa 390px dạng cuộn ngang nhỏ nếu cần |
| Tốc độ tự cuộn | ~45 px/s, bắt đầu 1.5s sau khi mở | "Nhẹ", đủ đọc nội dung |
| Dừng khi | wheel/touchstart/pointerdown/keydown, hoặc `scrollY` lệch vị trí đã đặt >2px, modal mở, tab ẩn, tới cuối trang | Không giành quyền điều khiển của khách |
| reduced-motion | Tắt tự cuộn mặc định (nút vẫn bật được) | Truy cập |
| Nhạc khi gieo hạt | `music.duck()` / `music.release()`: fade ~400ms, nhớ trạng thái đang phát; nút nhạc không đổi trạng thái | Không ghi đè việc khách tự tắt |
| Nhạc | `autoplay: true` + `src` mới; không rename logic `music.ts` | Logic play trong handler chạm đã đúng cho iOS |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Nhạc tự phát khi mở thiệp + tắt khi gieo hạt](./phase-01-music-autoplay.md) | Completed |
| 2 | [Thanh nav cố định](./phase-02-fixed-nav.md) | Completed |
| 3 | [Tự cuộn nhẹ](./phase-03-auto-scroll.md) | Completed |

Phase 3 phụ thuộc phase 2 (nút bật/tắt đặt trong nav). Phase 1 độc lập.

## Success Criteria

- [x] Bấm phong bì: nhạc phát ngay, không cần bấm nút nhạc (Chrome desktop + iOS Safari).
- [x] Nav cố định hiện sau khi mở, bấm mục nào cuộn tới đúng section, mục hiện tại được tô.
- [x] Trang tự trôi chậm; chạm/lăn/phím dừng ngay; nút nav bật lại được.
- [x] Không chồng nút ở 390px và 1280px; `tsc -b` + `vitest` sạch.

## Quyết định đã chốt (user)

1. Tự cuộn dừng hẳn sau thao tác của khách; bật lại bằng nút trong nav.
2. Xóa `public/audio/bg-music.wav` (placeholder).
3. Nhãn nav: giữ 6 mục như bảng trên (user không phản đối).
4. Mới: khi khách gieo hạt (bước sowing → growing → blooming trong `garden-overlay.tsx`) thì tạm tắt nhạc nền để nghe âm thanh nảy mầm/nở hoa; hoa nở xong (sang bước writing) hoặc đóng lớp phủ giữa chừng thì nhạc phát lại, chỉ khi trước đó đang phát.

## Unresolved Questions

None.
