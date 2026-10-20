# Thay sổ lưu bút bằng phần "Lời chúc" (ảnh hoa + danh sách + chi tiết)

Trạng thái: ĐÃ DỰNG xong giao diện và gỡ sổ cũ; CHƯA nghiệm thu thẩm mỹ (chờ ảnh botanical được duyệt). Chưa commit.

## 1. Kết quả mong muốn

Thay sổ lật trang 3D (`guestbook*.tsx/css`, `lib/guestbook-book.js`, `page-flip`) bằng một section "Lời chúc" gọn, hợp tone, tối ưu cho điện thoại:

1. Ảnh botanical chủ đạo (ảnh tạo riêng, không dựng bằng SVG), tiêu đề, một lời chúc tiêu biểu, nút "Xem lời chúc".
2. Danh sách lời chúc mở ngay trong trang, 4 lời một lần, nút "Xem thêm (N)".
3. Chi tiết một lời chúc mở thành lớp riêng: hoa khách chọn, tên, lời đầy đủ, màu mực, nút Đóng.
4. Khách gieo hoa xong thì lời chúc mới nằm đầu danh sách và hiện làm lời tiêu biểu.

## 2. Ràng buộc và ngoài phạm vi

Giữ nguyên:
- Toàn bộ luồng gieo hạt: chọn hoa, nhấn giữ (`sow-hold-button`, 700ms), hạt rơi, nảy mầm, nở hoa, tên, lời chúc, màu mực, màn gửi xong.
- Dữ liệu: `PublicWish {id,name,message,flower,ink}`, `wishes-store`, `wishes-api`, Google Sheet (`apps-script/wishes.gs`), kho tối đa 400 lời.
- Mỗi lời chúc hiển thị đúng loài hoa khách chọn (10 loài). Ảnh chủ đạo chỉ để làm đẹp phần đầu, không thay hoa cá nhân.

Không làm:
- Không hiển thị ngày tháng, không thêm trường thời gian vào Sheet (nếu cần, là yêu cầu dữ liệu riêng).
- Không làm bó hoa "đầy dần" theo số lời chúc.
- Không thêm thanh đầu trang (hamburger, nhạc) như mockup. Dùng tên cô dâu chú rể trong config, không dùng tên trong mockup.
- Không đổi cơ chế gieo hạt, không đổi section khác, không đổi màu/token toàn trang.

## 3. Hiện trạng đã đọc (căn cứ cho kế hoạch)

| Mục | Hiện trạng |
|---|---|
| Vị trí | `App.tsx:62` `<GuestbookSection />` sau `<Gift />`; `id="guestbook"` |
| Lớp vỏ | `guestbook-section.tsx`: tải lời chúc khi gần vào màn (`loadWishes`), lazy-load `guestbook.tsx`, nút "Gieo một lời chúc" gọi `gardenOverlay.open` |
| Sổ cũ | `guestbook.tsx` (133 dòng) + `lib/guestbook-book.js` (652) + `guestbook.css` (670) + dependency `page-flip` |
| Dữ liệu | `useWishes()` trả `wishes` mới nhất trước, lời của khách (`id === ""`) luôn đứng đầu |
| Hoa | `FlowerMiniPreview` (SVG nhỏ theo `flower.id`), `entryFor(id, seed)` có dự phòng khi id lạ; `BloomPlayer` cho hoa nở lớn |
| Màu mực | `lib/wish-style.ts`: 10 màu, đều trên 7:1 với giấy kem |
| Sau khi gửi | `garden-overlay.tsx` `seeBook()` đóng lớp phủ rồi cuộn tới `#guestbook`; sổ tự lật tới lời của khách |
| Ảnh | `lib/images.ts` + `image-manifest.json`; `npm run images` đọc `source-images/<dir>/`, ghi WebP + bản 640 vào `public/`; ngân sách hiện 250KB/ảnh, giữ kênh alpha qua `sharp` |
| Khóa cuộn | `lib/scroll-lock.ts` (class `is-locked`, `overflow:hidden`) giữ vị trí cuộn, có đếm chủ khóa |
| Nút Back | Không có xử lý `history`/`popstate` ở đâu trong `src` (cả lớp phủ gieo hoa cũng không) |
| Tham chiếu ngoài | Chỉ `garden-overlay.tsx` dùng `#guestbook`; test hiện không nhắc "guestbook" |

## 4. Thiết kế

### 4.1 Bố cục khối đầu (kiểm ở 360, 375, 390 px)

Điểm nhấn là **ảnh botanical lớn**, không phải thẻ lời chúc. Từ trên xuống: tiêu đề script "Lời chúc" (`--wine`, `--font-signature`), dòng phụ, ảnh botanical (chiếm phần lớn khối), lời tiêu biểu trình bày bằng chữ (trích dẫn script, tên, hoa nhỏ; **không có khung thẻ**), nút "Xem lời chúc (N)", rồi nút "Gieo một lời chúc".

Thứ tự ưu tiên: thẩm mỹ > dễ đọc > thao tác rõ > chiều cao. Mục tiêu tối ưu: thấy phần lớn khối đầu trong một màn hình 390×780, **không** phải điều kiện bắt buộc; không ép nhỏ ảnh hay chữ để đạt. Ảnh dùng `aspect-ratio` theo kích thước thật để không dịch bố cục, kể cả khi ảnh tải lỗi (khung giữ chỗ vẫn đúng tỉ lệ, không hiện icon vỡ).

Trạng thái rỗng: không có lời nào thì ẩn lời tiêu biểu, hiện câu mời "Hãy là người gieo bông hoa đầu tiên" (chữ thật, không dữ liệu giả).

### 4.2 Danh sách (mở trong trang, lớp nội dung phụ)

- Bấm "Xem lời chúc" thì danh sách xổ ra ngay dưới, không mở lớp phủ. Trình bày bằng typography, **không phải chồng thẻ đồng dạng**: mỗi dòng gồm hoa nhỏ, tên (font tay), 2 dòng đầu lời chúc theo màu mực, ngăn cách bằng đường kẻ mảnh; không bóng đổ, không viền dày, không hoa trang trí thêm.
- 4 lời một lần; "Xem thêm (N)" tải thêm 4 lời. Tối đa 400 lời (theo kho hiện tại), dựng theo lượt nên không cần ảo hóa.
- Cả dòng là vùng bấm (không bắt khách chạm vào hoa nhỏ): `<button>` thật, cao tối thiểu 44px.
- Lời của khách vừa gửi: đứng đầu, đánh dấu bằng đường kẻ `--wine` bên trái, không thêm hiệu ứng nảy.

### 4.3 Chi tiết

- `<dialog>` gốc (cùng cách làm `garden-overlay`): khóa tiêu điểm, Esc đóng, nền không bấm được.
- Nội dung: hoa lớn đúng loài, tên, lời đầy đủ (cuộn trong lớp khi dài tới 1000 ký tự), tên màu mực kèm chấm màu, nút "Đóng". Tên loài hoa hiển thị lấy từ `flowerWishes`.
- **Nút Back của điện thoại:** mở lớp thì đẩy đúng một mục lịch sử (`pushState`); `popstate` đóng lớp; đóng bằng nút/Esc thì `history.back()` khi mục đó còn trên đỉnh. Chỉ một mục mỗi lần mở, mở lại nhanh không đẩy trùng; Back chỉ đóng lớp đang mở, không rời website. Không làm cơ chế lịch sử phức tạp hơn thế.
- **Vị trí cuộn:** `lockScroll()` chỉ khóa `overflow`, vị trí cuộn của trang được giữ; sau khi đóng, tiêu điểm trả về đúng thẻ vừa mở.

### 4.4 Ảnh botanical

- Một ảnh chủ đạo cho trạng thái chung (không đổi theo khách). Tạo riêng, nền trong suốt, tone kem-hồng phấn-xanh rêu, hợp bảng màu `--paper/--rose/--wine`.
- **Không chặn tiến độ:** vùng ảnh luôn giữ đúng tỉ lệ đã định, nền kem, không hiện icon ảnh lỗi, cả khi ảnh chưa có hoặc tải lỗi, để bố cục không nhảy. Không đưa ảnh tạm vào production. Ảnh cuối phải được duyệt trước khi nghiệm thu thẩm mỹ.
- **Cần bạn cung cấp file gốc** (mình không tạo được ảnh bằng công cụ hiện có). Yêu cầu:
  - PNG hoặc WebP có nền trong suốt, bố cục dọc, rộng tối thiểu 1200px, chủ thể ở giữa, chừa lề cho cánh hoa tỏa.
  - Đặt vào `source-images/hero/` hoặc một thư mục riêng; chạy `npm run images` để ra bản 1200 và 640 + manifest.
  - Mục tiêu dung lượng: bản 640 ≤ 100KB, bản 1200 ≤ 250KB (ngân sách hiện có của script). Thử AVIF chỉ khi WebP vượt ngân sách và pipeline hỗ trợ; không đổi pipeline nếu không cần.
- Hiển thị bằng `Photo` hiện có (srcset, width/height, lazy), `alt` rỗng vì chỉ trang trí.

## 5. Các bước (nối tiếp, mỗi bước kiểm xong mới sang bước sau)

1. **Ảnh (song song, không chặn).** Dựng khung giữ chỗ; khi nhận ảnh cuối thì chạy `npm run images`, đo dung lượng thật, xem thử ở 3 nền (kem, trắng, hồng nhạt) để chắc viền ảnh sạch.
2. **Dữ liệu và helper thuần.** Tách hàm chọn lời tiêu biểu (lời đầu của `wishes`) và chia lượt hiển thị (4 lời, `hasMore`, số còn lại) ra `src/lib/wish-list.ts`, viết test vitest.
3. **Khối đầu.** Viết `wish-gallery.tsx/css` (tiêu đề, ảnh, lời tiêu biểu, nút xem, nút gieo). Giữ `id="guestbook"` để cuộn tới đúng chỗ. Kiểm 360/375/390.
4. **Danh sách inline.** Thẻ, "Xem thêm", lời của khách nổi bật, trạng thái rỗng và đang tải.
5. **Chi tiết.** `<dialog>`, lịch sử trình duyệt cho nút Back, trả tiêu điểm, giữ vị trí cuộn.
6. **Nối với mini-game.** `seeBook()` đổi thành cuộn tới danh sách và làm nổi lời mới; sửa chữ `garden.seeBook`, `garden.ctaHint`, `garden.noteCaption` cho đúng hình thức mới (không còn "sổ").
7. **Gỡ sổ cũ.** Xóa `guestbook.tsx`, `guestbook.css`, `lib/guestbook-book.js`, kiểu/chữ `guestbook` thừa trong `wedding-config.ts`, dependency `page-flip` trong `package.json`/lockfile. Chỉ xóa sau khi bước 3 tới 6 chạy ổn.
8. **Kiểm toàn bộ** theo mục 7, rồi báo kết quả. Không commit nếu chưa được yêu cầu.

## 6. Các file dự kiến sửa

- Mới: `src/components/wish-gallery.tsx`, `wish-gallery.css`, `wish-detail.tsx`, `wish-detail.css`, `src/lib/wish-list.ts` (+ test), ảnh nguồn và bản đã nén trong `public/`.
- Sửa: `src/App.tsx` (thay `GuestbookSection`), `src/components/garden-overlay.tsx` (`seeBook`, scroll target), `src/config/wedding-config.ts` (khối `guestbook` và vài chữ `garden`), `src/generated/image-manifest.json` (do script sinh), `package.json` + lockfile (bỏ `page-flip`).
- Xóa: `guestbook-section.tsx/css`, `guestbook.tsx/css`, `lib/guestbook-book.js`.
- Không đụng: `sow-*`, `garden-overlay.css`, `wishes-*`, `apps-script/`, các section khác.

## 7. Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm |
|---|---|---|
| 1 | Ở 360, 375, 390 px khối đầu đẹp, đọc rõ, thao tác rõ; thấy phần lớn khối trong một màn hình 780px là mục tiêu tối ưu, không bắt buộc. Thử cả tên 40 ký tự và lời dài | Ảnh chụp iframe đúng bề rộng, đo rect |
| 2 | Không cuộn ngang, không dịch bố cục khi ảnh và hoa tải xong (CLS gần 0), kể cả khi ảnh tải lỗi | Đo `scrollWidth`; so vị trí trước/sau tải; chặn file ảnh |
| 3 | Mỗi thẻ và chi tiết hiện đúng loài hoa khách chọn, đúng màu mực; id hoa lạ vẫn có hoa dự phòng | Thử đủ 10 loài và một id lạ |
| 4 | Lời 1000 ký tự không làm vỡ thẻ (thẻ cắt 2 dòng) và chi tiết cuộn được | Thử với lời 1000 ký tự thật, tên 40 ký tự |
| 5 | Lời của khách vừa gửi đứng đầu danh sách, nổi bật, và hiện làm lời tiêu biểu ngay không chờ Sheet. Kho `wishes-store` dùng chung giữa mini-game và gallery; kiểm cả khi gửi thất bại (hàng đợi thử lại, lời vẫn hiện trên máy khách) và khi tải lại dữ liệu từ Sheet (không bị trùng, không mất) | Chạy luồng gieo hoa với `script.google.com` bị chặn/giả lỗi (không gửi thật); xem lại `wishes-store.test.ts` |
| 6 | Nút Back điện thoại đóng chi tiết, không rời trang; sau đóng, vị trí cuộn và tiêu điểm về đúng thẻ. Qua nhiều chu kỳ: mở, đóng bằng nút, mở lại, Back; mở, Back, mở lại; không sinh mục lịch sử trùng | Thử `history.back()`, Esc, nút Đóng theo các chuỗi trên, đếm `history.length` |
| 7 | Bàn phím: Tab, Enter, Esc dùng được; tiêu điểm nhìn thấy; trình đọc màn hình đọc được thẻ, hộp thoại có tên | Kiểm thủ công + đọc cây truy cập |
| 8 | Chữ ≥ 12px, chữ chính ≥ 14px; mọi màu mực trên nền thẻ ≥ 4.5:1; chữ phụ trên nền be ≥ 4.5:1 | Tính tỉ lệ tương phản cho 10 màu và các chữ phụ |
| 9 | Chạm ≥ 44px cho thẻ, nút, nút đóng | Đo rect |
| 10 | Reduced-motion: không còn hoa nảy, không hiệu ứng trượt | Bật `prefers-reduced-motion` |
| 11 | Ảnh botanical bản 640 ≤ 100KB (hoặc ghi lý do nếu vượt); toàn trang không nặng thêm đáng kể sau khi bỏ `page-flip` | Đo dung lượng; so kích thước bundle trước/sau |
| 12 | Gieo hạt vẫn nguyên: nhấn giữ 700ms, nhả sớm thì lùi, bàn phím gieo ngay, các bước giữ như cũ | Chạy lại toàn bộ luồng |
| 13 | `tsc -b`, `vitest run`, lint sạch (chỉ còn cảnh báo cũ ở `envelope-intro.tsx:29`) | Chạy lệnh |
| 14 | Desktop 1440 và 320px không vỡ | Chụp và đo |
| 15 | Không báo xong chỉ vì `tsc`/lint/vitest xanh. Phải có ảnh chụp thực tế ở bề rộng điện thoại và đánh giá bằng mắt: ảnh botanical đủ đẹp, hoa SVG nhỏ không lệch phong cách, phần đầu không giống trang danh sách bình luận. Nếu chưa đạt thì báo là chưa đạt | Ảnh chụp 360/375/390 gửi bạn xem |

## 8. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Giao diện thành "danh sách bình luận được trang trí" | Cao | Điểm nhấn là ảnh botanical, lời tiêu biểu bằng chữ không khung, danh sách bằng typography và đường kẻ mảnh, không thêm hiệu ứng trang trí |
| Ảnh chưa có / không đạt (nền không trong suốt, viền loang, quá nặng) | Cao | Vùng ảnh luôn giữ tỉ lệ, nền kem, không icon lỗi; nghiệm thu thẩm mỹ chỉ sau khi ảnh cuối được duyệt |
| Khối đầu quá cao, đẩy lời chúc và nút xuống sâu | Trung bình | Kiểm 360/375/390; không ép nhỏ ảnh hoặc chữ chỉ để vừa một màn hình |
| Nút Back thoát hẳn trang | Trung bình | `pushState`/`popstate` có kiểm, chỉ một mục lịch sử mỗi lần mở |
| Chồng lớp phủ: gieo hoa + chi tiết cùng lúc | Trung bình | Chi tiết chỉ mở từ danh sách; mở gieo hoa thì đóng chi tiết |
| Lời dài, tên dài, ký tự lạ | Trung bình | Cắt dòng bằng CSS, `overflow-wrap:anywhere`, thử ca xấu |
| 400 lời làm trang nặng | Thấp | Dựng 4 thẻ mỗi lượt |
| Người dùng cũ còn lời chúc không có `flower`/`ink` | Thấp | `entryFor` và `inkColor` đã có dự phòng, giữ nguyên |
| Gỡ `page-flip` làm lỗi build ở chỗ khác | Thấp | Gỡ ở bước 7, chạy build và test ngay |
| Hoa SVG nhỏ nhìn thô cạnh ảnh botanical sang | Trung bình | Thẻ nhỏ có nền giấy riêng, kích thước hoa vừa đủ; chi tiết dùng hoa lớn hơn. Đánh giá bằng mắt ở bước 3, báo bạn nếu lệch phong cách |

## 9. Quyết định đã chốt

1. Ảnh botanical tạo riêng, được duyệt trước khi nghiệm thu thẩm mỹ (không chặn code).
2. Hoa lớn trong chi tiết để tĩnh (`FlowerMiniPreview` phóng to); chỉ đổi sang `BloomPlayer` nếu hình tĩnh không đủ đẹp.
3. Dòng phụ viết riêng, không nhắc sổ: "Có những điều dịu dàng được gửi đi, rồi ở lại thật lâu trong khu vườn của chúng mình."
4. Danh sách giữ như mục 4.2; không làm bó hoa đầy dần ở phiên bản này.

Việc cần làm cho 3 điểm bổ sung: vùng ảnh giữ tỉ lệ khi lỗi (4.4), kiểm Back nhiều chu kỳ (tiêu chí 6), xác minh cập nhật lời mới và trường hợp gửi lỗi/tải lại (tiêu chí 5).

Việc dọn nếu bắt đầu code: các chữ `wishGallery` đã thêm trong `wedding-config.ts` còn dòng phụ cũ, sẽ đổi theo câu ở mục 3; `src/lib/wish-list.ts` và test đã có sẵn.
