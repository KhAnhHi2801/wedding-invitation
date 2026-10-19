import { useSyncExternalStore } from "react"

/**
 * Trạng thái mở/đóng của lớp phủ gieo hoa. Nằm ở một kho nhỏ để mọi nơi mở được mà không truyền props:
 * thẻ mời ở section vườn, nút "Gửi lời chúc…" nổi, và nút "Gửi lời chúc" ở trang cuối sổ lưu bút.
 */
let isOpen = false
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

export const gardenOverlay = {
  open() {
    if (isOpen) return
    isOpen = true
    emit()
  },
  close() {
    if (!isOpen) return
    isOpen = false
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): boolean => isOpen,
}

export const useGardenOverlayOpen = (): boolean => useSyncExternalStore(gardenOverlay.subscribe, gardenOverlay.getSnapshot)
