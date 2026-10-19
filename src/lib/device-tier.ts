/**
 * Phát hiện máy yếu để dựng hiệu ứng nhẹ hơn ngay từ đầu (class `lite` trên <html>).
 * Tiêu chí: màn cảm ứng VÀ (RAM ≤ 4 GB hoặc ≤ 4 nhân CPU), không tính iPhone/iPad
 * (Safari không báo RAM và báo ít nhân dù GPU mạnh). `deviceMemory` chỉ có trên Chrome/Android.
 * Thêm `?lite=1` / `?lite=0` vào link để ép bật/tắt khi cần thử.
 */

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

/** iPadOS 13+ báo mình là Mac nên phải nhận diện thêm qua cảm ứng đa điểm. */
function isApplePhoneOrTablet(): boolean {
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return true
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
}

export function detectLowEnd(): boolean {
  const forced = new URLSearchParams(window.location.search).get("lite")
  if (forced === "1") return true
  if (forced === "0") return false

  if (!window.matchMedia("(pointer: coarse)").matches) return false
  if (isApplePhoneOrTablet()) return false

  const memory = (navigator as NavigatorWithMemory).deviceMemory
  const cores = navigator.hardwareConcurrency
  return (memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4)
}

/** Bật class `lite` trên <html> khi là máy yếu; trả về kết quả để nơi khác dùng. */
export function applyDeviceTier(): boolean {
  const lite = detectLowEnd()
  document.documentElement.classList.toggle("lite", lite)
  return lite
}

export const prefersReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Hiệu ứng nặng nên bỏ khi máy yếu hoặc người dùng muốn giảm chuyển động. */
export const shouldReduceEffects = (): boolean =>
  document.documentElement.classList.contains("lite") || prefersReducedMotion()
