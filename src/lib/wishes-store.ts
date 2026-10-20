import { useSyncExternalStore } from "react"
import { fetchWishes, type PublicWish } from "./wishes-api"

/**
 * Kho lời chúc dùng chung cho mini-game gieo hoa và phần "Lời chúc": một lần tải từ Google Sheet, cộng các lời chúc khách vừa gửi trong
 * phiên (hiện ngay, kể cả khi Sheet chưa lưu kịp hoặc chưa nối). Lời chúc của chính khách bị ẩn bởi kiểm duyệt vẫn hiện
 * trên máy khách đó, người khác không thấy.
 */
interface WishesState {
  /** Mới nhất trước, đã gộp và bỏ trùng */
  wishes: readonly PublicWish[]
  loading: boolean
  loaded: boolean
}

let remote: readonly PublicWish[] = []
let mine: readonly PublicWish[] = []
let state: WishesState = { wishes: [], loading: false, loaded: false }
const listeners = new Set<() => void>()

const keyOf = (wish: PublicWish): string => `${wish.name}\u0000${wish.message}`

function publish(patch: Partial<Pick<WishesState, "loading" | "loaded">> = {}) {
  const seen = new Set(remote.map(keyOf))
  // Lời chúc của khách đã có trên Sheet thì dùng bản từ Sheet
  const own = mine.filter((wish) => !seen.has(keyOf(wish)))
  state = { ...state, ...patch, wishes: [...own, ...remote] }
  listeners.forEach((listener) => listener())
}

/** Tải lời chúc từ Sheet một lần (gọi nhiều lần cũng chỉ tải một lần); `force` để tải lại. */
export async function loadWishes(force = false): Promise<void> {
  if (state.loading || (state.loaded && !force)) return
  publish({ loading: true })
  try {
    remote = await fetchWishes()
  } finally {
    publish({ loading: false, loaded: true })
  }
}

/** Thêm ngay lời chúc khách vừa gửi vào kho (chưa cần chờ Sheet). */
export function addOwnWish(wish: Omit<PublicWish, "id">): void {
  mine = [{ ...wish, id: "" }, ...mine]
  publish()
}

export const wishesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: (): WishesState => state,
}

export const useWishes = (): WishesState => useSyncExternalStore(wishesStore.subscribe, wishesStore.getSnapshot)
