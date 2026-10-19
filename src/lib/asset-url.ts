/** Đường dẫn tới file trong `public/`, tôn trọng `base` của Vite nên chạy được cả khi site nằm ở thư mục con. */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`
