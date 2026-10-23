import { weddingConfig } from "../config/wedding-config"
import { gardenOverlay } from "../lib/garden-overlay"
import { music, useMusicState } from "../lib/music"
import { ChairIcon } from "./icons/shapes"
import { ChatIcon, MusicOffIcon, MusicOnIcon } from "./icons/ui-icons"
import { WishTicker } from "./wish-ticker"
import "./floating-actions.css"

interface FloatingActionsProps {
  onOpenRsvp: () => void
}

/**
 * Các nút nổi phía dưới: chỉ chứa HÀNH ĐỘNG (gieo lời chúc, xác nhận tham dự, bật tắt nhạc). Việc đi tới các phần
 * của thiệp thuộc về thanh điều hướng phía trên (SiteNav). Nằm ngoài <main> để luôn bấm được; chỉ hiện sau khi thiệp đã mở.
 */
export function FloatingActions({ onOpenRsvp }: FloatingActionsProps) {
  const { ui } = weddingConfig
  const musicState = useMusicState()

  return (
    <>
      <WishTicker />

      <button type="button" className="fab fab__pill" onClick={gardenOverlay.open}>
        <ChatIcon />
        <span>{ui.fabWish}</span>
      </button>

      <div className="fab__group">
        {musicState !== "unavailable" && (
          <button
            type="button"
            className="fab fab__round"
            aria-label={ui.musicLabel}
            aria-pressed={musicState === "playing"}
            onClick={music.toggle}
          >
            {musicState === "playing" ? <MusicOnIcon /> : <MusicOffIcon />}
          </button>
        )}
        <button type="button" className="fab fab__rsvp" aria-label={ui.fabRsvp} onClick={onOpenRsvp}>
          <ChairIcon />
          <span>{ui.fabRsvpShort}</span>
        </button>
      </div>
    </>
  )
}
