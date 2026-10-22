import { create } from "zustand"
import { fetchWishes, type PublicWish } from "./wishes-api"

/**
 * Kho lời chúc dùng chung cho mini-game gieo hoa và phần "Lời chúc": một lần tải từ Google Sheet (bắt đầu ngay khi vào trang,
 * xem `main.tsx`), cộng các lời chúc khách vừa gửi trong phiên (hiện ngay, kể cả khi Sheet chưa lưu kịp hoặc chưa nối).
 * Lời chúc của chính khách bị ẩn bởi kiểm duyệt vẫn hiện trên máy khách đó, người khác không thấy.
 */
interface WishesState {
  /** Mới nhất trước, đã gộp và bỏ trùng */
  wishes: readonly PublicWish[]
  loading: boolean
  loaded: boolean
}

export const useWishes = create<WishesState>(() => ({ wishes: [], loading: false, loaded: false }))

let remote: readonly PublicWish[] = []
let mine: readonly PublicWish[] = []

const keyOf = (wish: PublicWish): string => `${wish.name}\u0000${wish.message}`

/** Gộp lời từ Sheet với lời của khách vừa gửi rồi đẩy vào kho. */
function publish(patch: Partial<Pick<WishesState, "loading" | "loaded">> = {}) {
  const seen = new Set(remote.map(keyOf))
  // Lời chúc của khách đã có trên Sheet thì dùng bản từ Sheet
  const own = mine.filter((wish) => !seen.has(keyOf(wish)))
  useWishes.setState({ ...patch, wishes: [...own, ...remote] })
}

/** Tải lời chúc từ Sheet một lần (gọi nhiều lần cũng chỉ tải một lần); `force` để tải lại. */
export async function loadWishes(force = false): Promise<void> {
  const { loading, loaded } = useWishes.getState()
  if (loading || (loaded && !force)) return
  publish({ loading: true })
  try {
    // Hiện ngay từng trang khi về, không chờ đọc hết (Apps Script có thể mất vài giây mỗi lượt)
    remote = await fetchWishes((partial) => {
      remote = partial
      publish()
    })
  } finally {
    publish({ loading: false, loaded: true })
  }
}

/** Thêm ngay lời chúc khách vừa gửi vào kho (chưa cần chờ Sheet). */
export function addOwnWish(wish: Omit<PublicWish, "id">): void {
  mine = [{ ...wish, id: "" }, ...mine]
  publish()
}
