import { useSyncExternalStore } from "react"

/** Bông hoa vừa gieo xong cần bay vào sổ: vị trí xuất phát trên màn hình (viewport) và loài hoa. */
export interface BookFlight {
  from: DOMRect
  flower: string
}

/**
 * Cầu nối giữa lớp phủ gieo hoa và cuốn sổ ở phần "Lời chúc": lớp phủ ghi yêu cầu bay, cuốn sổ nhận và chạy hiệu ứng
 * sau khi đã cuộn tới. Một kho nhỏ để hai nơi không phải truyền props qua App.
 */
let pending: BookFlight | null = null
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

export const bookFlight = {
  request(flight: BookFlight) {
    pending = flight
    emit()
  },
  clear() {
    if (!pending) return
    pending = null
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): BookFlight | null => pending,
}

export const usePendingBookFlight = (): BookFlight | null => useSyncExternalStore(bookFlight.subscribe, bookFlight.getSnapshot)
