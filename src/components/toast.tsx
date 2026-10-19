import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ToastContext } from "../lib/toast-context"
import "./toast.css"

const VISIBLE_MS = 3500

interface ToastState {
  text: string
  /** Tăng mỗi lần hiện để cùng một nội dung vẫn được đọc lại */
  serial: number
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ text: "", serial: 0 })
  const timer = useRef<number | undefined>(undefined)
  const box = useRef<HTMLDivElement>(null)

  const show = useCallback((text: string) => {
    window.clearTimeout(timer.current)
    setToast((current) => ({ text, serial: current.serial + 1 }))
    timer.current = window.setTimeout(() => setToast((current) => ({ ...current, text: "" })), VISIBLE_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // popover="manual" đưa thông báo lên lớp trên cùng của trình duyệt, nên vẫn thấy khi một <dialog> modal đang mở
  useEffect(() => {
    const element = box.current
    if (!element?.showPopover) return
    if (toast.text) {
      if (!element.matches(":popover-open")) element.showPopover()
    } else if (element.matches(":popover-open")) {
      element.hidePopover()
    }
  }, [toast.text])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div ref={box} className="toast" popover="manual" role="status" aria-live="polite" data-visible={toast.text !== ""}>
        <span key={toast.serial}>{toast.text}</span>
      </div>
    </ToastContext.Provider>
  )
}
