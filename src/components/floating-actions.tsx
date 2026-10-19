import { weddingConfig } from "../config/wedding-config"
import { gardenOverlay } from "../lib/garden-overlay"
import { music, useMusicState } from "../lib/music"
import { ChairIcon } from "./icons/shapes"
import { ChatIcon, GiftIcon, MusicOffIcon, MusicOnIcon } from "./icons/ui-icons"
import "./floating-actions.css"

interface FloatingActionsProps {
  onOpenRsvp: () => void
}

/** Cuộn tới section và chuyển tiêu điểm bàn phím theo, để Tab tiếp tục từ đó. */
function scrollToSection(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ block: "start" })
  target.tabIndex = -1
  target.focus({ preventScroll: true })
}

/**
 * Các nút cố định: lời chúc (mở lớp phủ gieo hoa), quà mừng, xác nhận tham dự và nhạc nền.
 * Nằm ngoài <main> để luôn bấm được; chỉ hiện sau khi thiệp đã mở (App quyết định lúc dựng).
 */
export function FloatingActions({ onOpenRsvp }: FloatingActionsProps) {
  const { ui } = weddingConfig
  const musicState = useMusicState()

  return (
    <>
      {musicState !== "unavailable" && (
        <button
          type="button"
          className="fab fab__round fab__music"
          aria-label={ui.musicLabel}
          aria-pressed={musicState === "playing"}
          onClick={music.toggle}
        >
          {musicState === "playing" ? <MusicOnIcon /> : <MusicOffIcon />}
        </button>
      )}

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
