import { useEffect, useState } from "react"
import { useInView } from "../hooks/use-in-view"
import { buildVietQr } from "../lib/viet-qr"

interface GiftQrProps {
  bankBin: string
  accountNumber: string
  alt: string
  className?: string
}

/**
 * Mã VietQR của một tài khoản. Thư viện `qrcode` chỉ được nạp (chunk riêng) khi khối này lần đầu lọt vào màn hình.
 */
export function GiftQr({ bankBin, accountNumber, alt, className }: GiftQrProps) {
  const [ref, seen] = useInView<HTMLDivElement>({ once: true, rootMargin: "300px" })
  const [src, setSrc] = useState("")

  useEffect(() => {
    if (!seen) return
    let cancelled = false
    import("qrcode")
      .then((qr) => qr.toDataURL(buildVietQr(bankBin, accountNumber), { errorCorrectionLevel: "M", margin: 1, width: 360 }))
      .then((url) => {
        if (!cancelled) setSrc(url)
      })
      .catch(() => {
        // Không dựng được mã: giữ nguyên số tài khoản và nút sao chép
      })
    return () => {
      cancelled = true
    }
  }, [seen, bankBin, accountNumber])

  return (
    <div ref={ref} className={className}>
      {src && <img src={src} alt={alt} width={140} height={140} />}
    </div>
  )
}
