# Hoa nở đúng từng loài (hoạt ảnh gieo hạt trong mini-game)

Trạng thái: CHỜ BẠN XÁC NHẬN BẮT ĐẦU CODE. Chưa sửa code (chỉ có hai file thử tạm `bloom-lab.html`, `src/bloom-lab.tsx`, sẽ xóa khi xong).

## 1. Kết quả mong muốn

Mỗi loài trong 15 loài nở **đúng cách của loài đó**: đúng hình dạng cánh và số lớp, đúng thứ tự các bộ phận mở, nhịp riêng của loài, mượt từ nụ tới hoa nở, màu cùng bảng màu dịu với ảnh màu nước. Mini-game (nhấn giữ gieo hạt, các bước, dữ liệu) giữ nguyên.

Ngoài phạm vi: phần "Lời chúc", dữ liệu lời chúc, nhấn giữ gieo hạt, âm thanh.

## 2. Hiện trạng đã đo (bằng trang thử, 15 loài × 6 mốc)

- `duration` riêng của từng loài có trong `config/flower-botanical.ts` nhưng **không được dùng**: `use-bloom-progress.ts` dùng chung 5,2 giây và mốc giai đoạn chung (0,12 / 0,48 / 0,62 / 0,95).
- 9 loài sai hình rõ khi nở xong (baby, mẫu đơn, cúc, hồng, rum, lan, mộc lan, cẩm chướng, cẩm tú cầu); 2 loài tạm (tulip, sen); 4 loài khá (hướng dương, anh đào, oải hương, cosmos).
- Bảng màu lệch ảnh: hồng đậm, xanh lam, tím tươi, thay vì hồng phấn dịu.
- Hoa nhỏ so với cây, tô phẳng một lớp, không viền, không nhiều lớp cánh.
- Dựng mỗi khung nhanh (trung bình 0,2 đến 3ms trên máy tính), nên hiệu năng không phải vấn đề chính. Chưa đo trên điện thoại thật.

## 3. Cách mỗi loài nở (tra cứu) và hoạt ảnh sẽ làm

Mức tin cậy: **A** = có nguồn khoa học hoặc tài liệu chuyên ngành; **B** = nguồn làm vườn và bằng sáng chế, nhất quán nhưng không chính thức; **C** = nguồn mỏng, bổ sung từ hiểu biết thực vật học và ảnh mẫu của bạn, cần bạn xem lại.

| Loài | Trình tự nở (căn cứ) | Hoạt ảnh sẽ làm | Tin cậy |
|---|---|---|---|
| **Hồng** | 7 giai đoạn: nụ phồng, nụ hồng, cánh vươn dài, cánh bung, nở đầy, cánh phẳng, rụng. Cánh ngoài tách ra trước để lộ cánh trong; tâm xoắn ốc chặt, cánh càng ra ngoài càng lớn và lỏng | Nụ xoắn ốc chặt; cánh ngoài bung trước, từng vòng cánh trong theo sau, tâm xoắn ốc mở sau cùng | A |
| **Mẫu đơn** | Nụ cầu to, cánh "bảo vệ" ngoài mở trước, bóng cánh giữa lỏng dần rồi bung thành nhiều lớp bồng | Nụ tròn đặc; vài cánh ngoài lớn tách ra, quả cầu cánh giữa nới lỏng, tâm nở sau; cánh có mép gợn | B |
| **Cúc họa mi** | Cánh trắng ban đầu gần dựng đứng, sau đó ngả ra ngang; các hoa nhỏ ở tâm nở từ mép ngoài vào trong, tâm đổi màu vàng khi chín | Nụ chóp nhỏ; cánh dài từ ôm sát tâm xòe thẳng ra ngang so le; tâm vàng nhô, chấm hoa tâm lan từ ngoài vào | B |
| **Hướng dương** | Nụ hướng về mặt trời, hết giai đoạn nụ thì cuống cứng lại; đĩa tâm xếp xoắn ốc theo góc vàng; khi nở, các hoa ở tâm nở theo vòng đồng tâm từ ngoài vào trong | Nụ xanh có lá bắc; cánh vàng bung theo vòng; đĩa tâm nâu nở theo vòng đồng tâm từ ngoài vào, chấm xếp xoắn ốc | A |
| **Tulip** | Nụ thon, cánh ngoài hé dần để lộ màu bên trong; nở khá nhanh trong khoảng một đến hai ngày | Nụ thon khép kín; ba cánh ngoài hé trước, ba cánh trong theo sau; cốc rộng dần, mép hơi cong ra | B |
| **Rum** | Mo (lá bắc biến dạng) cuộn ôm chặt bông nhị, xòe dần thành phễu rồi giữ nguyên; nhị đực nằm trên, nhị cái ở dưới, thấy rõ nhị sau khi mo mở | Mo cuộn hình chóp; xòe dần, mép trên cuộn ra; nhị vàng dựng lên khi mo mở | B |
| **Sen** | Nụ đứng; các ngày đầu cánh mở rồi khép lại theo chu kỳ ngày đêm; đến ngày thứ 4 mở hẳn, hoa to dần (khoảng 22 đến 27cm), cánh bắt đầu rụng | Nụ nhọn; lớp cánh ngoài mở trước, từng lớp cánh trong theo sau, đài sen vàng lộ ra; có nhịp "hé rồi nở" nhẹ | A |
| **Lan hồ điệp** | Đài ngoài bao nụ; khi nở cuống xoắn để môi hoa xuống dưới; từ nụ tới nở đầy khoảng 3 đến 7 ngày | Nụ tròn; 3 đài mở trước, hai cánh lớn tròn xòe hai bên, môi đỏ lộ sau cùng và xoay xuống dưới | B |
| **Anh đào** | Nụ xanh, đầu nụ ửng hồng, nụ dài ra, giai đoạn "phồng trắng" cánh bắt đầu bung, nở rộ, rồi cánh rơi | Nụ xanh trên cành, ửng hồng, phồng, 5 cánh bung, nhị lộ, cuối cùng cánh nhẹ rơi | A |
| **Baby** | Chùm phân nhánh hai (dichasium) hàng trăm hoa; hoa nở dần trong thời gian dài, hoa mới nở liên tục (không rõ hướng mở) | Cành tỏa từng tầng; nụ tròn nhỏ hé thành hoa năm cánh, nở xen kẽ so le; thêm nhiều hoa theo tiến trình | C |
| **Oải hương** | Hoa trên bông nở có thứ tự: hai hoa đầu cuối mở trước, rồi lên các vòng hoa; thương mại: từ dưới lên trên, kéo dài nhiều tuần | Bông tím từ nụ xanh nhạt, các vòng hoa chuyển màu và hé cánh từ dưới lên trên | A (hướng chính) |
| **Cẩm chướng** | Đài hợp thành ống, trùm nụ; đầu đài tách trước, rồi cánh nhú ra khỏi đài; mở do cánh giãn nở; mép cánh xẻ răng chỉ thấy khi nở đầy | Nụ trong đài xanh; đầu đài tách, cánh nhăn nhú ra, bung thành bóng nhiều lớp, mép xẻ răng | B |
| **Cẩm tú cầu** | Nụ hoa xanh; màu hiện từ mép cánh đài vào trong; cánh đài to dần, chồng lên nhau; hoa già trở lại màu xanh | Bóng chùm xanh; từng hoa nhỏ đổi màu từ mép, to dần và chồng lên nhau | B (màu), C (trình tự) |
| **Mộc lan** | Nụ phủ lông tơ, vảy nụ rơi; mở thành cốc (cánh đứng), rồi cánh ngoài xòe ngang còn cánh trong dựng, kiểu "cốc đặt trên đĩa"; cánh ngoài tàn trước | Nụ lông mịn; vảy nụ tách; cánh ngoài xòe ngang trước, cánh trong còn dựng thành cốc | A |
| **Cosmos** | Nụ xanh tách ra; cánh hé, mở phẳng; cánh có mép như bị cắt răng cưa; sau nở là nụ quả xanh | Nụ xanh; vết tách; cánh xòe phẳng, đầu cánh có răng; tâm vàng lộ ra | C |

Căn cứ chính (nguồn đã dùng):
- Hồng: [Annals of Botany, 7 giai đoạn](https://pmc.ncbi.nlm.nih.gov/articles/PMC2803376/figure/fig1), [The Life of a Rose Bloom](https://bramanswanderings.com/2015/06/11/the-life-of-a-rose-bloom/)
- Cúc, hướng dương: mô tả bằng sáng chế cúc họa mi, [Helianthus (Wikipedia)](https://en.wikipedia.org/wiki/Helianthus), [Why sunflowers are extraordinary timekeepers](https://www.thenakedscientists.com/node/201223)
- Sen: [Copenhagen Science Museum, Lotus time-lapse](https://sciencemuseerne.dk/en/botanisk-have/planternes-hemmelige-liv/the-lotus-plant-blooms), [Univ. Oslo NHM](https://nhm.uio.no/english/about/news/archive/2017/0704-lotus-flowering.html)
- Oải hương: [BMC Plant Biology, thứ tự nở](https://link.springer.com/article/10.1186/s12870-019-1908-6)
- Anh đào: [Fairfax Gardening](https://fairfaxgardening.org/predict-cherry-blossoms/), [LiveScience](https://livescience.com/31913-cherry-blossom-blooming-stages.html)
- Mộc lan: [Stanford trees: Magnolia](https://trees.stanford.edu/ENCYC/MAGcam.htm)
- Lan, cẩm chướng, cẩm tú cầu: bằng sáng chế giống cây và [Phalaenopsis anatomy](https://microscopy-uk.org.uk/mag/artnov07/bj-orchid.html)
- Mẫu đơn, rum, baby, cosmos: nguồn làm vườn rời rạc, kèm ảnh mẫu của bạn

Lưu ý: kết quả tra cứu mỏng cho rum, baby, cosmos, cẩm tú cầu; các hoạt ảnh của bốn loài này phần lớn dựa vào cấu tạo thực vật học và ảnh mẫu, cần bạn duyệt khi xem thử.

## 4. Thiết kế kỹ thuật

1. **Nhịp riêng từng loài:** dùng `duration` có sẵn, nén tổng về khoảng 5 đến 6 giây giữ tỉ lệ giữa các giai đoạn; thay các mốc 0,12 / 0,48 / 0,62 / 0,95 bằng mốc theo từng loài (ánh xạ thời gian sang tiến trình chuẩn từng đoạn một).
2. **Bộ dựng cánh dùng chung:** mỗi bông hoa là nhiều **nhóm cánh** (số cánh, hình cánh, bán kính, góc đóng và góc mở, độ trễ, thời lượng, gradient, viền mảnh). Mỗi nhóm có độ mở riêng theo tiến trình (có làm mượt), nên mỗi loài chỉ là một "kịch bản" khai báo, không phải viết hàng trăm dòng thủ công.
3. **Hình đặc thù:** xoắn ốc (hồng), vòng đồng tâm (hướng dương, cúc), mo cuộn và nhị (rum), xoay môi (lan), hoa nhỏ nở xen (baby, anh đào, oải hương, cẩm tú cầu), vảy nụ (mộc lan).
4. **Màu:** chỉnh bảng màu từng loài về hồng phấn dịu theo ảnh màu nước; thêm hai tông (sáng, tối) cho gradient.
5. **Giữ nguyên:** chậu, hạt, mầm, thân và lá có điều chỉnh nhẹ (gradient mềm); nhấn giữ, các bước, chuông nở, quầng sáng.
6. **Mượt:** thêm nội suy giữa các khung 30fps khi máy đủ nhanh; máy yếu giữ như hiện nay. Kiểm không giật ở các mốc chuyển giữa nụ và hoa.

## 5. Các bước (mỗi bước kiểm xong mới sang bước sau, báo ảnh chụp)

1. **Nền tảng:** nhịp riêng, bộ dựng cánh, bảng màu mới, trang thử nhiều mốc (mỗi loài một dãy khung trong đoạn nở) để duyệt.
2. **Nhóm cánh phẳng tròn:** cúc, cosmos, hướng dương, anh đào (kiểm mẫu đầu tiên với bạn).
3. **Nhóm cốc và lớp cánh:** tulip, hồng, mẫu đơn, sen, mộc lan, cẩm chướng.
4. **Nhóm đặc biệt:** rum, lan, cẩm tú cầu, baby, oải hương.
5. **Thẻ chọn loài và hoa xem trước** dùng hình tĩnh khớp loài (dùng ảnh màu nước đã có).
6. **Dọn dẹp:** xóa trang thử tạm, kiểm thử toàn bộ, đo trên điện thoại.

## 6. Tiêu chí nghiệm thu

| # | Tiêu chí | Cách kiểm |
|---|---|---|
| 1 | Hoa nở xong của từng loài nhận ra được đúng loài so với ảnh màu nước | Ảnh chụp 15 loài cạnh ảnh mẫu |
| 2 | Trình tự mở đúng bảng ở mục 3 (ví dụ: hồng cánh ngoài trước tâm xoắn sau; hướng dương vòng ngoài vào trong; oải hương dưới lên trên; rum mo xòe rồi nhị dựng) | Dãy 8 đến 10 khung trong đoạn nở của từng loài |
| 3 | Nhịp nở khác nhau theo loài, tổng 5 đến 6 giây | Đo thời gian từng loài |
| 4 | Không nhảy hình đột ngột khi chuyển nụ sang hoa | Dãy khung mịn (mỗi 0,02 tiến trình) quanh đoạn chuyển |
| 5 | Mượt trên điện thoại (không tụt dưới ~30fps) | Đo thời gian dựng khung, thử máy thật |
| 6 | Máy yếu và giảm chuyển động vẫn đúng: hoa hiện ngay đúng loài | Bật giảm chuyển động |
| 7 | Gieo hạt giữ nguyên: nhấn giữ 700ms, các bước, chuông, quầng sáng, nút bỏ qua | Chạy lại luồng |
| 8 | `tsc`, vitest, lint, build đạt (ngoài lỗi cũ `envelope-intro.tsx`) | Chạy lệnh |

## 7. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Khối lượng lớn: 15 loài, mỗi loài nhiều lượt chụp và chỉnh | Cao | Làm theo nhóm, duyệt nhóm 2 trước khi làm tiếp |
| Rum, lan, mẫu đơn khó vẽ đúng bằng SVG | Cao | Báo thẳng nếu chưa đạt; có thể giữ ảnh màu nước làm đầu hoa cho riêng loài đó |
| Nguồn tra cứu mỏng cho 4 loài | Trung bình | Dựa cấu tạo thực vật học và ảnh mẫu, bạn duyệt |
| Hoạt ảnh nặng hơn trên máy yếu | Trung bình | Nhóm cánh dùng thuộc tính biến đổi, tránh bộ lọc; máy yếu giảm số cánh |
| Làm đổi nhịp mini-game | Thấp | Tổng thời lượng giữ 5 đến 6 giây |

## 8. Câu hỏi còn mở

1. Nếu loài nào vẽ SVG vẫn chưa đạt (rum, lan, mẫu đơn), bạn chấp nhận dùng ảnh màu nước làm đầu hoa cho riêng loài đó không?
2. Tổng thời lượng nở: 5 đến 6 giây có ổn không, hay muốn lâu hơn để xem rõ từng giai đoạn?
3. Bạn muốn thấy kết quả theo thứ tự nhóm ở mục 5, hay làm hết rồi xem một lần?
