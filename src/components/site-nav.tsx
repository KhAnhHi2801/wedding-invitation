import { useEffect, useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { autoScroll, useAutoScrolling } from "../lib/auto-scroll"
import { music, useMusicState } from "../lib/music"
import { scrollToSection } from "../lib/scroll-to-section"
import { MusicOffIcon, MusicOnIcon, ScrollIcon, ScrollPauseIcon } from "./icons/ui-icons"
import "./site-nav.css"

/**
 * Thanh điều hướng cố định phía trên: nhảy tới từng phần của thiệp, kèm nút nhạc và nút tự cuộn.
 * Nằm ngoài <main> để luôn bấm được; chỉ dựng sau khi thiệp đã mở.
 */
export function SiteNav() {
  const { ui } = weddingConfig
  const musicState = useMusicState()
  const scrolling = useAutoScrolling()
  const [current, setCurrent] = useState(ui.nav[0].id)
  const listRef = useRef<HTMLUListElement>(null)

  // Phần đang xem: section nào chiếm vạch giữa màn hình (vùng quan sát hẹp quanh 40% chiều cao từ trên xuống)
  useEffect(() => {
    const targets = ui.nav.map((item) => document.getElementById(item.id)).filter((node): node is HTMLElement => !!node)
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting)
        if (hit) setCurrent(hit.target.id)
      },
      { rootMargin: "-40% 0px -55% 0px" },
    )
    targets.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [ui.nav])

  // Thanh hẹp (mobile) cuộn ngang: giữ mục đang xem trong tầm nhìn
  useEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>('[aria-current="location"]')
    const list = listRef.current
    if (!link || !list) return
    list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.clientWidth) / 2, behavior: "smooth" })
  }, [current])

  return (
    <nav className="sitenav" aria-label={ui.navLabel}>
      <ul className="sitenav__list" ref={listRef}>
        {ui.nav.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="sitenav__link"
              aria-current={current === item.id ? "location" : undefined}
              onClick={() => {
                // Khách chủ động nhảy mục: tự cuộn dừng hẳn như mọi thao tác khác
                autoScroll.stop()
                scrollToSection(item.id)
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="sitenav__tools">
        <button
          type="button"
          className="sitenav__tool"
          {...{ [autoScroll.keepAttr]: "" }}
          aria-label={ui.autoScrollLabel}
          aria-pressed={scrolling}
          onClick={autoScroll.toggle}
        >
          {scrolling ? <ScrollPauseIcon /> : <ScrollIcon />}
        </button>
        {musicState !== "unavailable" && (
          <button
            type="button"
            className="sitenav__tool"
            aria-label={ui.musicLabel}
            aria-pressed={musicState === "playing"}
            onClick={music.toggle}
          >
            {musicState === "playing" ? <MusicOnIcon /> : <MusicOffIcon />}
          </button>
        )}
      </div>
    </nav>
  )
}
