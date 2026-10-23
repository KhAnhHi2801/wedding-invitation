import { weddingConfig } from "../config/wedding-config"
import { gardenOverlay } from "../lib/garden-overlay"
import { scrollToSection } from "../lib/scroll-to-section"
import { ChairIcon } from "./icons/shapes"
import { ChatIcon, GiftIcon } from "./icons/ui-icons"
import "./floating-actions.css"

interface FloatingActionsProps {
  onOpenRsvp: () => void
}

/**
 * Các nút cố định: lời chúc (mở lớp phủ gieo hoa), quà mừng và xác nhận tham dự (nút nhạc nằm trên thanh nav).
 * Nằm ngoài <main> để luôn bấm được; chỉ hiện sau khi thiệp đã mở (App quyết định lúc dựng).
 */
export function FloatingActions({ onOpenRsvp }: FloatingActionsProps) {
  const { ui } = weddingConfig

  return (
    <>
      <button type="button" className="fab fab__pill" onClick={gardenOverlay.open}>
        <ChatIcon />
        <span>{ui.fabWish}</span>
      </button>

      <div className="fab__group">
        <button type="button" className="fab fab__round" aria-label={ui.fabGift} onClick={() => scrollToSection("gift")}>
          <GiftIcon />
        </button>
        <button type="button" className="fab fab__round" aria-label={ui.fabRsvp} onClick={onOpenRsvp}>
          <ChairIcon />
        </button>
      </div>
    </>
  )
}
