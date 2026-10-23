import { useEffect, useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { scrollToSection } from "../lib/scroll-to-section"
import { autoScroll } from "../lib/auto-scroll"
import { CloseIcon, MenuIcon } from "./icons/ui-icons"
import "./site-nav.css"

/** "Ngọc Khánh" -> "Khánh": tên gọi ngắn để làm dấu nhận diện trên thanh */
const givenName = (name: string) => name.split(" ").at(-1) ?? name

/**
 * Thanh điều hướng cố định phía trên: CHỈ dùng để đi tới các phần của thiệp (các hành động như gieo lời chúc,
 * xác nhận tham dự, bật tắt nhạc nằm ở nút nổi phía dưới). Màn rộng hiện các mục thành hàng; màn hẹp gom vào nút Menu.
 * Nằm ngoài <main> để luôn bấm được; chỉ dựng sau khi thiệp đã mở.
 */
export function SiteNav() {
  const { ui, couple } = weddingConfig
  const [current, setCurrent] = useState(ui.nav[0].id)
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

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

  // Menu mở: Escape hoặc bấm ra ngoài thì đóng (Escape trả tiêu điểm về nút Menu)
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [menuOpen])

  const go = (id: string) => {
    // Khách chủ động nhảy mục: tự cuộn dừng hẳn như mọi thao tác khác
    autoScroll.stop()
    setMenuOpen(false)
    scrollToSection(id)
  }

  return (
    <nav className="sitenav" aria-label={ui.navLabel} ref={rootRef}>
      <a className="sitenav__brand" href="#cover" onClick={(event) => { event.preventDefault(); go("cover") }}>
        {givenName(couple.bride.name)} <span aria-hidden="true">{couple.connector}</span> {givenName(couple.groom.name)}
      </a>

      <button
        type="button"
        ref={toggleRef}
        className="sitenav__menu"
        aria-expanded={menuOpen}
        aria-controls="sitenav-list"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
        <span>{ui.menuLabel}</span>
      </button>

      <ul className="sitenav__list" id="sitenav-list" data-open={menuOpen}>
        {ui.nav.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="sitenav__link"
              aria-current={current === item.id ? "location" : undefined}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
