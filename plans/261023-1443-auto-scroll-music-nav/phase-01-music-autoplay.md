---
phase: 1
title: "Nhạc tự phát khi mở thiệp + tắt khi gieo hạt"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Nhạc tự phát khi mở thiệp

## Overview
Dùng file trong `public/musics` làm nhạc nền và bật `autoplay`, để nhạc phát ngay trong cú chạm mở phong bì.

## Requirements
- Functional: chạm phong bì → nhạc phát (vòng lặp, volume 0.35); nút nhạc phản ánh đúng trạng thái.
- Functional: khi khách bấm gieo hạt, nhạc fade-out và dừng; hoa nở xong (bước `writing`) nhạc fade-in phát lại. Đóng lớp phủ giữa chừng cũng phát lại. Chỉ phát lại nếu trước đó đang phát (khách tự tắt thì giữ tắt). Nếu khách bấm nút nhạc trong lúc đang duck thì tôn trọng lựa chọn đó.
- Non-functional: vẫn không tải file trước khi chạm (`preload: none`); tên file không dấu cách.

## Architecture
`music.ts` thêm cặp `duck()` / `release()`: `duck` ghi `resumeAfterDuck = (state === "playing")`, fade volume về 0 rồi `audio.pause()` mà KHÔNG đổi sang trạng thái `paused` công khai; `release` chỉ phát lại khi cờ bật và khách chưa tự bấm. Trạng thái `ducked` cần tách khỏi sự kiện `pause` hiện có (listener `pause` đang đặt state = paused). Cũng nối với `visibilitychange` để không phát lại khi tab ẩn.
`garden-overlay.tsx` thêm một `useEffect([step, open])`: `step` thuộc `sowing|growing|blooming` → `music.duck()`; ngược lại → `music.release()`; cleanup khi unmount cũng `release()`. Chế độ reduced-motion nhảy thẳng sang `writing` nên nhạc không bị tắt lâu.
Phần còn lại không đổi `src/lib/music.ts`. `EnvelopeIntro.open` gọi `onOpenStart` đồng bộ → `App.handleOpenStart` → `music.play()` nếu `music.autoplay`.

## Related Code Files
- Modify: `src/lib/music.ts` (duck/release + fade), `src/components/garden-overlay.tsx` (effect theo `step`), `src/lib/music.test.ts` (mới), `src/config/wedding-config.ts` (`music: { src: "musics/romantic.mp3", autoplay: true, ... }`, sửa comment "PLACEHOLDER")
- Rename: `public/musics/paulyudin-romantic-romantic-music-493488 copy.mp3` → `public/musics/romantic.mp3`
- Delete: `public/audio/bg-music.wav` (user đã đồng ý)

## Implementation Steps
1. Rename file mp3 bỏ dấu cách/"copy".
2. Đổi `src`, bật `autoplay` trong config; cập nhật comment.
3. Kiểm tra `assetUrl("musics/romantic.mp3")` ra đường dẫn đúng khi có `base`.
4. Thêm `duck/release` vào `music.ts`, gắn effect vào `garden-overlay.tsx`; unit test: duck khi playing rồi release → play; duck khi paused rồi release → vẫn paused; khách bấm toggle giữa chừng.
5. Test tay: bấm phong bì, nhạc phát; chuyển tab rồi quay lại nhạc tiếp tục; file hỏng thì nút nhạc ẩn.

## Success Criteria
- [x] Nhạc phát tức thì sau khi bấm phong bì, không lỗi console.
- [x] Network chỉ tải mp3 sau lần chạm đầu.
- [x] iOS Safari phát được (kiểm trên máy thật).
- [x] Gieo hạt: nhạc tắt mượt, hoa nở xong nhạc tự phát lại; đóng giữa chừng cũng phát lại; khách đã tắt nhạc thì không tự bật.

## Risk Assessment
- `play()` lúc release không còn nằm trong cú chạm của khách: iOS có thể từ chối. Giảm thiểu: không gọi `audio.pause()`/giải phóng phần tử, chỉ hạ volume về 0 rồi pause cùng element đã được mở khóa; nếu vẫn bị chặn, nút nhạc hiện "paused" để khách bấm lại. Dấu hiệu hỏng: iOS không phát lại sau khi nở hoa → chỉ hạ volume về 0 và để audio chạy tiếp thay vì pause.
- Chrome desktop có thể chặn nếu `play()` không nằm trong handler: đã nằm trong handler đồng bộ, nên rủi ro thấp. Dấu hiệu hỏng: nút nhạc ở trạng thái "paused" ngay sau khi mở → kiểm tra `onOpenStart` có bị gọi sau `await`.
- 4 MB trên 4G tải ~1–2s: chấp nhận; nếu chậm, cân nhắc nén xuống 96 kbps.
