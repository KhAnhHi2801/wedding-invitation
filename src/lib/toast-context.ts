import { createContext, useContext } from "react"

export type ShowToast = (message: string) => void

export const ToastContext = createContext<ShowToast>(() => {})

/** Hiện thông báo ngắn ở cuối màn hình (tự tắt sau vài giây). */
export const useToast = (): ShowToast => useContext(ToastContext)
