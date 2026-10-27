import { useEffect, useId, useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import type { BankAccount } from "../config/wedding-config"
import { copyText } from "../lib/copy-text"
import { getNamedGuest } from "../lib/guest"
import { lockScroll } from "../lib/scroll-lock"
import { fillText } from "../lib/wish-list"
import { GiftBox, type GiftBoxState } from "./gift-box"
import { GiftQr } from "./gift-qr"
import { Photo } from "./photo"
import { CloseIcon, CopyIcon } from "./icons/ui-icons"

/** Nhóm 4 số một cho dễ đọc, dễ đối chiếu: "19036592558012" thành "1903 6592 5580 12" (chỉ để hiển thị, sao chép vẫn là số liền) */
const groupDigits = (accountNumber: string) => accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")

interface GiftSheetProps {
  account: BankAccount
  /** box: hộp mừng có phong bì rơi vào khe; duo: chỉ chân dung */
  variant: "box" | "duo"
  onClose: () => void
}

/**
 * Ngăn kéo của một hộp mừng (`<dialog>` gốc: khóa tiêu điểm, Esc đóng). Phong bì nhô lên khi mở; khách sao chép số tài
 * khoản thì phong bì rơi vào hộp, cánh hoa bung ra và hiện lời cảm ơn. Web không biết khách đã chuyển tiền hay chưa,
 * nên lời cảm ơn chỉ gắn với hành động sao chép.
 */
export function GiftSheet({ account, variant, onClose }: GiftSheetProps) {
  const { gift, guestParam } = weddingConfig
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Chỉ coi là bấm ra ngoài khi cả nhấn xuống và nhả ra đều ở vùng nền
  const pressedOnBackdrop = useRef(false)
  const [stage, setStage] = useState<GiftBoxState>("closed")
  const [message, setMessage] = useState("")
  const guest = getNamedGuest(guestParam)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>(".gift-sheet__copy")?.focus({ preventScroll: true })
    const release = lockScroll()
    // Một nhịp sau khi dựng mới đổi sang "open" để phong bì có chuyển động nhô lên
    const frame = window.requestAnimationFrame(() => setStage("open"))
    return () => {
      window.cancelAnimationFrame(frame)
      release()
      if (dialog.open) dialog.close()
    }
  }, [])

  const copy = async () => {
    if (await copyText(account.accountNumber)) {
      setStage("drop")
      setMessage(guest ? fillText(gift.thanksNamed, { name: guest }) : gift.thanks)
    } else {
      setMessage(gift.copyFailed)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="gift-sheet"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && pressedOnBackdrop.current) onClose()
      }}
    >
      <div className="gift-sheet__panel">
        <button type="button" className="gift-sheet__x" aria-label={gift.close} onClick={onClose}>
          <CloseIcon />
        </button>
        {variant === "box" ? (
          <GiftBox state={stage} className="gift-sheet__box" />
        ) : (
          <span className="gift-sheet__portrait" data-state={stage}>
            <Photo name={account.photo} alt="" sizes="6rem" />
          </span>
        )}
        <h2 className="gift-sheet__holder" id={titleId} translate="no">
          <span className="sr-only">
            {variant === "box" ? gift.boxLabel : gift.sendLabel} {account.role}:{" "}
          </span>
          {account.holder}
        </h2>
        <p className="gift-sheet__bank">{account.bank}</p>
        <GiftQr
          className="gift-sheet__qr"
          bankBin={account.bankBin}
          accountNumber={account.accountNumber}
          alt={`${gift.qrAlt} ${account.holder}`}
        />
        <p className="gift-sheet__hint">{gift.qrHint}</p>
        <p className="gift-sheet__number">{groupDigits(account.accountNumber)}</p>
        <button
          type="button"
          className="gift-sheet__copy"
          data-done={stage === "drop"}
          aria-label={`${gift.copyLabel} ${account.holder}`}
          onClick={copy}
        >
          <CopyIcon />
          <span>{stage === "drop" ? gift.copiedShort : gift.copyShort}</span>
        </button>
        <p className="gift-sheet__thanks" role="status">
          {message}
        </p>
      </div>
    </dialog>
  )
}
