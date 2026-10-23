/**
 * Ảnh dưới màn hình để `loading="lazy"` cho nhẹ lần tải đầu, nhưng trên mạng chậm ảnh chưa kịp về khi khách cuộn tới
 * (nhất là lúc trang tự cuộn). Sau khi trang tải xong thì đổi hết sang tải ngay: trình duyệt tự xếp theo thứ tự trong trang,
 * và việc này diễn ra trong lúc khách còn xem phong bì.
 */
export function loadAllImagesNow() {
  document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = "eager"
  })
}

export function loadAllImagesAfterPageLoad() {
  if (document.readyState === "complete") loadAllImagesNow()
  else window.addEventListener("load", loadAllImagesNow, { once: true })
}
