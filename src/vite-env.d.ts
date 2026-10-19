/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ web app Google Apps Script nhận lời chúc và xác nhận tham dự (xem docs/wishes-setup.md) */
  readonly VITE_WISHES_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
