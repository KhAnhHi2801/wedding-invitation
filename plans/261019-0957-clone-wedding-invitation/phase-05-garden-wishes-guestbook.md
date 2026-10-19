---
phase: 5
title: "Garden mini-game, Sheet, guestbook"
status: pending
priority: P1
effort: "2d"
dependencies: [1, 2]
---

# Phase 5: Garden mini-game, Sheet, guestbook

> **Đã làm trước (2026-10-19, theo yêu cầu vì phase 4 cần backend RSVP):** `apps-script/wishes.gs` (RSVP + lời chúc kèm cột `flower`/`ink`, đọc có phân trang, chống công thức, bẫy bot, giới hạn tốc độ, chống ghi trùng), `apps-script/wishes.test.mjs` (21 test chạy script thật với bản giả của Sheet/Cache/Lock, đã thử phá script để chắc test bắt được lỗi) và `docs/wishes-setup.md`. Còn lại trong phase này: client lời chúc trong `src/lib/wishes-api.ts` (`submitWish`, `fetchWishes`, hàng đợi + thử lại) theo đúng hợp đồng ở đầu `wishes.gs`, mini-game, sổ lưu bút. Danh sách `FLOWER_IDS` của script đã khớp 15 id của `flowerWishes.ts`.

## Overview
Section "Our Little Garden": khách chọn hoa, gieo hạt, hoa nở theo hiệu ứng thực vật của prototype `public/gieo-một-lời-chúc`, viết lời chúc, gửi lên Google Sheet; hoa vào vườn chung; sổ lưu bút lật trang hiển thị lời chúc. Logic lời chúc tái dùng từ `../preview-wedding`.

## Requirements
- Functional: luồng 4 bước (chọn hoa, gieo hạt, viết lời chúc, hoa vào vườn); hiệu ứng nở hoa dùng đúng bộ SVG 15 loài của prototype; gửi ngầm có hàng đợi, thử lại, chống trùng; vườn + sổ đọc lại từ Sheet.
- Non-functional: không endpoint thì UI vẫn chạy (offline queue); `prefers-reduced-motion` thì hoa hiện thẳng trạng thái nở; chỉ 1 hoa chạy animation tại một thời điểm.

## Nguồn hiệu ứng: prototype `public/gieo-một-lời-chúc`
Prototype (React 19 + Vite + Tailwind v4, sinh từ AI Studio) đã có sẵn:

| Phần | File | Dùng thế nào |
|------|------|--------------|
| Engine + 15 renderer SVG (tiến trình 0→1: hạt, nảy mầm, thân và lá từng đốt, nụ, cánh bung nở, đung đưa) | `components/flowers/BotanicalFlowerEngine.tsx`, `FlowerSpeciesRenderers.tsx` (2155 dòng), `BotanicalPathLeaf.tsx` | **Copy nguyên** vào `src/features/flower-bloom/`, không sửa logic hình học |
| Ảnh thu nhỏ SVG từng loài | `FlowerMiniPreview.tsx` | Dùng cho carousel chọn hoa và vườn chung |
| Dữ liệu thực vật (palette, ý nghĩa, thời lượng giai đoạn) | `data/flowers.ts`, `types/flower.ts` | Đổi tên `flower-botanical.ts`; ghép với `flower-wishes.ts` theo `id` (15 id trùng khớp) |
| Âm thanh hạt rơi, mầm, chuông nở (Web Audio tổng hợp, không file) | `utils/audio.ts` | Copy nguyên; tắt khi người dùng tắt âm toàn trang |
| Vòng lặp tiến trình | `App.tsx` (`handleSow`: 5.2s, ngưỡng giai đoạn 0.12 / 0.48 / 0.62 / 0.95) | Tách thành hook `useBloomProgress`, thêm reduced-motion và dọn `requestAnimationFrame` |
| Keyframe `gentleBreeze`, `leafFlutter`, `petalSway`, `pollenFloat`, `seedThrob` | `index.css` | Copy vào `flower-bloom.css` (không kéo cả Tailwind) |

### Hiệu năng mobile: prototype đã làm gì, còn thiếu gì
Đối chiếu code hiện tại của prototype (đã cập nhật lúc 12:28):

| Đã tối ưu trong prototype (giữ nguyên khi copy) | Còn thiếu (làm trong phase này) |
|---|---|
| `memo` cho `BotanicalFlowerEngine`, `BotanicalPathLeaf`, `FlowerMiniPreview`, `FlowerSelector` | Vòng nở vẫn `setState` ở mỗi frame (~60/giây) ngay trong `App`: kéo cả thẻ thông tin, thanh tiến trình, nút bấm render lại. `memo` chỉ giúp lá đã nở xong, không giúp phần đang chuyển động |
| Lá bỏ `clipPath`, dùng biến đổi từ nút gốc | Không throttle: chưa giới hạn 30fps |
| `useCallback` cho handler | Không có nhánh `prefers-reduced-motion` ở phần JS (chỉ CSS rút ngắn animation; progress vẫn chạy 5.2s) |
| `blur-2xl sm:blur-3xl` (nhẹ hơn trên mobile) | Quầng sáng vẫn dùng `filter: blur` trên một lớp lớn; modal còn `backdrop-blur-xs` |
| `will-change`, `translateZ(0)` trên khung SVG | `will-change: transform` bật vĩnh viễn trên SVG ~420px và trên mỗi hạt phấn; hoạt ảnh `animate-breeze` chạy vô hạn trên thẻ `<g>` bên trong SVG (không được GPU tổng hợp, mỗi frame vẽ lại cả bông hoa) |
| Không có | Không có phân hạng máy yếu (`detectLowEnd`), không dừng khi ra khỏi màn hình |

Việc làm thêm (theo thứ tự, dừng khi đạt ngưỡng ≥ 45fps trên Android tầm trung):
1. Tách vòng nở vào component riêng (`BloomStage`) giữ progress bằng `useRef` + một `useState` đã làm tròn; chỉ engine và thanh tiến trình cập nhật.
2. Throttle 30fps (bỏ qua frame nếu cách lần cập nhật < 33ms).
3. Thay quầng `blur` bằng `radial-gradient` tĩnh; bỏ `backdrop-blur` (khung UI viết lại nên không phát sinh).
4. Chuyển `animate-breeze` từ thẻ `<g>` sang `div` bọc ngoài (HTML transform được tổng hợp trên GPU); dừng sau ~10s hoặc khi ra khỏi màn hình (`IntersectionObserver`); chỉ bật `will-change` trong lúc nở, gỡ khi xong; bỏ `will-change` trên hạt phấn.
5. Phân hạng máy bằng `detectLowEnd()` (port từ `preview-wedding/src/three/device-tier.js`, `?lite=1` để thử): máy yếu hoặc reduced-motion thì nở rút ngắn ~2s hoặc hiện hoa nở sẵn, bỏ hạt phấn.
6. Nếu vẫn dưới ngưỡng: "nướng" mỗi loài thành chuỗi khung WebP/sprite (+100–200KB mỗi loài, chỉ cho máy yếu).

**Không dùng:** `@google/genai`, `express`, `dotenv`, `GEMINI_API_KEY`, `standaloneHtmlGenerator.ts`, `motion`, `lucide-react` (đều không cần), `App.tsx`/`WishForm`/`WishGardenModal` làm khung giao diện (viết lại bằng CSS của site và nối Sheet). Prototype dùng Tailwind; dự án chính không thêm Tailwind để khỏi xung đột style với phần thiệp, nên 3 khung UI được viết lại bằng CSS thuần.

Hệ quả: ảnh `public/flowers/*.jpeg` **không còn dùng** cho mini-game (không cần tách nền, không cần script tối ưu ảnh hoa). Giữ hoặc xóa tùy bạn.

## Architecture
Tái dùng từ `../preview-wedding` (copy rồi chỉnh):

| Nguồn | Đích | Chỉnh |
|-------|------|-------|
| `apps-script/wishes.gs` | `apps-script/wishes.gs` | Thêm cột `flower` (HEADERS, validate theo `FLOWER_IDS` khớp 15 id, trả trong `doGet`) |
| `docs/wishes-setup.md` | `docs/wishes-setup.md` | Sửa theo cột mới, nhấn mạnh dùng Sheet riêng |
| `src/api.js` | `src/lib/wishes-api.ts` | `submitWish({name,message,flower,ink})`, `fetchWishes()` trả thêm `flower`; giữ hàng đợi, retry, `elapsedMs` |
| `src/ui/wish-validation.js` | `src/lib/wish-validation.ts` | Giữ giới hạn, từ cấm, câu lỗi |
| `src/ui/wish-style.js` | `src/lib/wish-style.ts` | Giữ `INKS`; bỏ `ICONS` (thay bằng hoa) |
| `src/ui/arch/guestbook.js` + css | `src/lib/guestbook-book.ts` (page-flip, giữ imperative) + `src/components/guestbook.tsx` (ref + `useEffect`, dọn bằng `destroy`) | Đổi `config.js` thành `wedding-config.ts`; biểu tượng mỗi lời chúc = `FlowerMiniPreview` theo cột `flower` |

Luồng UI (`src/components/garden.tsx`, `useReducer`: choose, planting, writing, bloomed):
1. **Chọn hoa**: carousel scroll-snap 15 `FlowerMiniPreview` + tên + `theme`; nút "Gieo hoa này".
2. **Gieo hạt**: `useBloomProgress` chạy 5.2s qua `BotanicalFlowerEngine`; hiện `message` của hoa khi nảy mầm; nút "Xem hoa nở ngay" (như prototype) để bỏ qua.
3. **Viết lời chúc**: tên (≤40), lời chúc điền sẵn từ `wishes[]` ngẫu nhiên + "Đổi gợi ý", placeholder luân phiên `prompts`, chọn màu chữ, trường bẫy `website`.
4. **Vào vườn**: gửi ngầm, hoa của khách xuất hiện ngay trong vườn, hiện `replies` ngẫu nhiên (`aria-live`).

Vườn chung: nền kem + đất, vị trí hoa = hash(id) → (x, y, scale), tối đa ~40 hoa mới nhất dạng `FlowerMiniPreview`, "+N bông hoa khác". Sổ lưu bút: nút "Mở sổ lưu bút" → `createGuestbook` (page-flip, 1 trang trên điện thoại dọc, 2 trang trên màn rộng).

## Related Code Files
- Create: `src/features/flower-bloom/{BotanicalFlowerEngine,FlowerSpeciesRenderers,BotanicalPathLeaf,FlowerMiniPreview}.tsx`, `flower-bloom.css`, `src/features/flower-bloom/audio.ts`, `src/config/flower-botanical.ts`, `src/types/flower.ts`, `src/hooks/use-bloom-progress.ts`, `src/components/garden.tsx`, `garden.css`, `src/components/guestbook.tsx`, `guestbook.css`, `src/lib/{wishes-api,wish-validation,wish-style,guestbook-book}.ts`, `apps-script/wishes.gs`, `docs/wishes-setup.md`, `.env.example`
- Modify: `src/config/flower-wishes.ts` (chuyển từ `flowerWishes.ts` gốc, thêm kiểu), `src/App.tsx` (thêm section), `package.json` (`page-flip`)
- Delete: `flowerWishes.ts` ở gốc (đã chuyển), thư mục `public/gieo-một-lời-chúc/` sau khi copy xong (nằm trong `public/` nên Vite sẽ đóng gói nguyên vào bản build, kèm `package.json` và mã nguồn)

## Implementation Steps
1. Copy các file engine/renderer/leaf/mini-preview/audio/types/data từ prototype sang `src/features/flower-bloom/` và `src/config/`; sửa import path; chạy `tsc --noEmit`.
2. Ghép `flower-botanical.ts` với `flower-wishes.ts` theo `id`; kiểm tra đủ 15 id ở cả hai nơi (đã đối chiếu: trùng khớp).
3. Viết `use-bloom-progress.ts` (rAF, ngưỡng giai đoạn như prototype, dọn khi unmount) và `BloomStage` theo 6 bước tối ưu ở mục "Hiệu năng mobile" (cô lập state, throttle 30fps, quầng gradient tĩnh, breeze trên `div`, `detectLowEnd`, reduced-motion). Đo FPS trước và sau từng bước, ghi số vào báo cáo.
3b. Lazy-load: toàn bộ `src/features/flower-bloom`, `page-flip`, `qrcode` nằm trong chunk riêng (`React.lazy`), chỉ tải khi section vào gần màn hình; `fetchWishes` chỉ chạy lúc đó.
4. Dựng `garden.tsx` + CSS theo palette site (đỏ rượu / hồng phấn); khung sân khấu hoa giữ nền kem của prototype.
5. Sửa `wishes.gs` thêm cột `flower`; viết `docs/wishes-setup.md`; `.env.example`.
6. Port `wishes-api.ts`, `wish-validation.ts`, `wish-style.ts`; ghi chú hằng số cần đồng bộ với `wishes.gs`.
7. Port `guestbook-book.ts` + `guestbook.tsx`.
8. Gắn section 14 + 15, FAB "Gửi lời chúc…"; xóa `public/gieo-một-lời-chúc/` và `flowerWishes.ts` gốc.
9. Kiểm tra bằng curl theo `docs/wishes-setup.md` (kể cả ca `=SUM(1,1)`) sau khi bạn deploy Apps Script.

## Success Criteria
- [ ] Hiệu ứng nở hoa của cả 15 loài giống prototype (so ảnh chụp tại 0%, 30%, 55%, 100%).
- [ ] Chọn hoa → gieo → viết → gửi → thấy hoa trong vườn; tải lại vẫn còn (khi có endpoint).
- [ ] Không endpoint: không lỗi console, hoa vẫn nở, lời chúc nằm trong hàng đợi.
- [ ] Ngắt mạng khi gửi: gửi lại khi có mạng, không ghi trùng.
- [ ] Lời chúc có từ cấm: không hiện công khai, khách vẫn thấy hoa của mình.
- [ ] Sổ lật được bằng kéo và nút; 1 / 2 trang đúng theo màn hình.
- [ ] Animation mượt trên điện thoại tầm trung (≥ 45fps khi nở); `prefers-reduced-motion` hiện hoa nở sẵn.
- [ ] Build production không còn thư mục prototype trong `dist/`.

## Risk Assessment
- Render lại ~2200 dòng SVG theo từng frame có thể giật trên máy yếu (prototype đã `memo` một phần nhưng chưa xử lý vòng `setState` mỗi frame) → tín hiệu: < 45fps hoặc long task > 50ms khi nở; phản ứng: đi tiếp thang 6 bước ở mục "Hiệu năng mobile"; mức thấp nhất là hiện hoa nở sẵn cho máy yếu. Chưa có số đo thực tế: đo ở bước đầu của phase này.
- Vườn chung vẽ nhiều SVG → tín hiệu: chậm lúc cuộn tới section; phản ứng: giảm số hoa xuống ~20, hoặc dựng mỗi loài một lần bằng `<symbol>` + `<use>`.
- Bản prototype dùng bộ phiên bản rất mới (React 19, Vite 8, TypeScript 7) → tín hiệu: `tsc --noEmit` lỗi; phản ứng: dùng phiên bản của template `react-ts` hiện hành, chỉnh kiểu tại chỗ.
- Chưa có Sheet khi cook → phase vẫn hoàn thành ở chế độ offline; nối endpoint là việc thủ công của bạn.
