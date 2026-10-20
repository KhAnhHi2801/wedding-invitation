# Cài đặt lời chúc và xác nhận tham dự (Google Sheet + Apps Script)

Lời chúc (kèm loài hoa khách chọn) và xác nhận tham dự (RSVP) lưu trong **một Google Sheet của bạn**:

- Tab `Wishes`: `id | createdAt | name | message | status | flower | ink`. Hiển thị trong phần "Lời chúc" của trang.
- Tab `RSVP`: `createdAt | name | attending | guests | note | guest`. Chỉ bạn xem được, website không có cách nào đọc tab này ra.

Cả hai tab tự được tạo ở lần ghi đầu tiên. Một đoạn Apps Script (`apps-script/wishes.gs`) làm cổng ghi/đọc.
Website chỉ biết URL của cổng này, không có quyền gì khác với Sheet.

## 1. Tạo Sheet và dán script

1. Tạo một Google Sheet **mới** (tên tùy ý, ví dụ "Thiệp cưới Mai Anh & Quốc Huy"). Giữ riêng tư, không cần chia sẻ.
   Nên dùng Sheet riêng cho đám cưới này để lời chúc không lẫn với dự án khác.
2. Menu **Extensions > Apps Script**.
3. Xóa nội dung mặc định, dán **toàn bộ** nội dung file `apps-script/wishes.gs`, bấm **Save** (biểu tượng đĩa).
4. Script cần runtime **V8** (mặc định của project mới). Nếu project cũ: **Project Settings > Enable Chrome V8 runtime**.

## 2. Deploy thành web app

1. **Deploy > New deployment > chọn loại Web app**.
2. **Execute as: Me** (chủ Sheet). **Who has access: Anyone**.
3. Bấm **Deploy**, cấp quyền khi Google hỏi (script cần truy cập đúng Sheet này). Nếu màn hình cảnh báo "Google hasn't verified this app": **Advanced > Go to ... (unsafe)**. Đây là script của chính bạn.
4. Sao chép **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).

### Khi sửa `wishes.gs` về sau

Dán lại bản mới rồi: **Deploy > Manage deployments > Edit (biểu tượng bút) > Version: New version > Deploy**.
URL giữ nguyên. Chỉ bấm Save mà không tạo version mới thì web app vẫn chạy bản cũ.

## 3. Nối vào website

Tạo file `.env.local` ở thư mục gốc dự án (file này nằm trong `.gitignore`, không bị commit):

```
VITE_WISHES_ENDPOINT=https://script.google.com/macros/s/.../exec
```

Chạy lại `npm run dev`. Khi build để deploy, đặt biến `VITE_WISHES_ENDPOINT` trong cài đặt biến môi trường của nơi host.
Để trống thì website vẫn chạy: RSVP báo "chức năng chưa sẵn sàng", lời chúc nằm chờ gửi trong trình duyệt của khách.

## 4. Kiểm tra sau khi deploy

Gán URL vào biến `URL` rồi chạy từng lệnh:

```bash
URL="https://script.google.com/macros/s/.../exec"

# Đọc (kết quả ban đầu: {"ok":true,"items":[],"nextCursor":null}) và tự tạo tab Wishes
curl -sL "$URL?limit=5"

# Ghi một lời chúc (elapsedMs phải >= 3000; requestId gửi lại cùng mã thì không bị ghi trùng)
curl -sL "$URL" -H "Content-Type: text/plain" \
  -d '{"name":"Thử nghiệm","message":"Chúc hai bạn hạnh phúc","flower":"peony","ink":"wine","token":"curl-test","elapsedMs":5000,"website":"","requestId":"curl-1"}'

# Ghi một xác nhận tham dự (tab RSVP tự được tạo)
curl -sL "$URL" -H "Content-Type: text/plain" \
  -d '{"kind":"rsvp","name":"Thử nghiệm","attending":"yes","guests":2,"note":"","guest":"","website":"","token":"curl-rsvp","elapsedMs":5000}'
```

Dùng `-L` vì Apps Script chuyển hướng (302) sang địa chỉ trả kết quả. **Không thêm `-X POST`**: với `-d`, curl đã gửi POST và tự đổi sang GET khi theo chuyển hướng; ép `-X POST` làm lần theo chuyển hướng cũng là POST và trả về trang lỗi dù dữ liệu đã được ghi (dễ ghi trùng khi thử lại).

### Kiểm tra chống công thức (bắt buộc)

Gửi thử một lời chúc có `"name":"=SUM(1,1)"`. Trong Sheet, ô tên phải hiện chữ `=SUM(1,1)` (có một dấu cách đứng trước, không phải số 2), và `GET` trả về đúng `=SUM(1,1)`. Đây là bước bắt buộc sau khi deploy vì hành vi thật của Sheets không thể kiểm tra ở máy phát triển.

### Sau đó thử bằng website

Mở website với `?to=Tên khách`, mở thiệp, bấm nút xác nhận tham dự và gửi: một dòng mới phải xuất hiện ở tab `RSVP`.
Xóa các dòng thử nghiệm trong Sheet trước khi gửi thiệp thật (xóa dòng ở tab `Wishes` an toàn khi **chưa có lời chúc thật**; sau đó đừng xóa hay sắp xếp lại dòng nữa, xem phần kiểm duyệt).

## Kiểm duyệt

- Đổi cột `status` của dòng thành `hidden` để ẩn lời chúc khỏi website. Đổi lại `visible` (hoặc để trống) để hiện.
- Dòng thêm tay vào Sheet mà để trống cột `status` vẫn hiện công khai.
- Từ thô tục: form trên website từ chối lịch sự ngay (khách sửa rồi gửi lại). Nếu có lời lọt qua (gửi thẳng vào địa chỉ web app, hoặc viết lách luật), script ghi dòng đó với `status = hidden` nên người khác không thấy.
- Độ dài: tên tối đa 40 ký tự, lời chúc từ 2 đến 1000 ký tự. Website và script đếm giống hệt nhau (bỏ ký tự vô hình, đếm theo code point); khi sửa giới hạn, sửa cả `src/lib/wish-validation.ts` và `wishes.gs`. Có test (`npm test`) bắt trường hợp chỉ sửa một nơi.
- **Đừng xóa hoặc sắp xếp lại dòng** ở tab `Wishes`: phân trang dùng số dòng làm con trỏ. Muốn ẩn thì đổi `status`.
- Dữ liệu hiển thị được lưu cache tối đa 60 giây, nên đổi `status` có thể mất tới một phút mới có hiệu lực.

## Bảo vệ đã có sẵn

| Lớp | Tác dụng |
|-----|----------|
| Ô bẫy `website` | Bot điền ô ẩn thì được báo "thành công" giả, không ghi gì |
| `elapsedMs >= 3000` | Điền form nhanh hơn 3 giây kể từ lúc mở trang bị từ chối (`too_fast`) |
| Giới hạn theo mã trình duyệt | Tối đa 3 lời chúc và 5 xác nhận mỗi 10 phút cho mỗi trình duyệt. Chỉ giảm spam ngẫu nhiên, mã này giả được nên không phải bảo mật |
| Trần theo ngày | Tối đa 500 lời chúc và 300 xác nhận mỗi ngày cho toàn trang |
| Chống công thức | Dấu cách đầu + định dạng văn bản thuần cho ô bắt đầu bằng `= + - @` |
| Danh sách loài hoa | `flower` lạ bị bỏ, không bao giờ ghi giá trị tùy ý vào Sheet |
| Giới hạn 1000 ký tự | Giữ mỗi trang dữ liệu đọc ra dưới giới hạn cache 100KB của Apps Script |
| Chống ghi trùng | Cùng `requestId` gửi lại thì trả kết quả cũ |

Vì web app mở cho "Anyone", bất kỳ ai có URL đều gọi được. Các lớp trên giảm spam, nhưng đừng coi đây là hệ thống chống tấn công; dữ liệu nhạy cảm không nên đặt trong Sheet này.

## Thêm hoặc bớt loài hoa

Danh sách `FLOWER_IDS` đầu `wishes.gs` phải khớp các `id` trong `src/config/flower-wishes.ts`. Sửa một nơi thì sửa cả hai, rồi tạo version mới cho web app.

## Gặp lỗi?

| Triệu chứng | Nguyên nhân thường gặp |
|-------------|------------------------|
| Website báo "chức năng chưa sẵn sàng" | Chưa có `.env.local` hoặc chưa chạy lại `npm run dev` sau khi thêm |
| `curl` trả về trang HTML đăng nhập Google | Chưa chọn **Who has access: Anyone**, hoặc dùng URL của bản test (`/dev`) thay vì bản deploy (`/exec`) |
| Sửa script rồi mà hành vi cũ | Chưa tạo **New version** khi Deploy |
| `{"ok":false,"error":"too_fast"}` khi thử bằng curl | `elapsedMs` phải >= 3000 |
| `{"ok":false,"error":"rate_limited"}` | Gửi quá nhiều từ cùng `token`; đổi `token` khác để thử |
| Lời chúc không hiện ngay | Cache 60 giây, hoặc `status` đang là `hidden` |
