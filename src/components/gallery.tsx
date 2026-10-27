import { useEffect, useState, type MouseEvent } from "react"
import { weddingConfig } from "../config/wedding-config"
import { lockScroll } from "../lib/scroll-lock"
import { Photo } from "./photo"
import { useParallax, type ParallaxItem } from "../hooks/use-parallax"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./gallery.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".gallery__title", preset: "fadeIn" },
  { selector: ".gallery__photo", preset: "fadeUp", stagger: 120 },
  { selector: ".gallery__side", preset: "fadeIn", delay: 300 },
  { selector: ".gallery__caption", preset: "fadeUp" },
]

const PARALLAX: readonly ParallaxItem[] = [{ selector: ".gallery__bg", amount: 6 }]

interface Zoomed {
  src: string
  srcSet: string
  alt: string
}

export function Gallery() {
  const { gallery, couple } = weddingConfig
  const [first, second, third] = gallery.photos
  const alt = `${couple.bride.name} ${couple.connector} ${couple.groom.name}`
  const ref = useReveal<HTMLElement>(REVEAL)
  useParallax(ref, PARALLAX)
  const [zoomed, setZoomed] = useState<Zoomed | null>(null)

  // Chạm ảnh trong khối để xem lớn; một handler ở khối cha thay vì gắn riêng từng ảnh
  const openPhoto = (event: MouseEvent<HTMLDivElement>) => {
    const img = event.target
    if (!(img instanceof HTMLImageElement)) return
    setZoomed({ src: img.currentSrc || img.src, srcSet: img.srcset, alt: img.alt })
  }

  // Đang xem lớn: khóa cuộn, Esc để đóng
  useEffect(() => {
    if (!zoomed) return
    const unlock = lockScroll()
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setZoomed(null)
    window.addEventListener("keydown", onKey)
    return () => {
      unlock()
      window.removeEventListener("keydown", onKey)
    }
  }, [zoomed])

  return (
    <section className="gallery" id="gallery" ref={ref}>
      <div className="gallery__stage">
        <Photo name={gallery.background} alt="" sizes="100vw" className="gallery__bg" />
        <div className="gallery__veil" aria-hidden="true" />
        <p className="gallery__side gallery__side--left vertical" aria-hidden="true">
          {gallery.verticalLeft}
        </p>
        <p className="gallery__side gallery__side--right vertical" aria-hidden="true">
          {gallery.verticalRight}
        </p>
        <p className="gallery__title">{gallery.title}</p>
        <div className="gallery__stack" onClick={openPhoto}>
          <Photo name={first} alt={alt} sizes="(min-width: 768px) 28rem, 70vw" className="gallery__photo" />
          <Photo name={second} alt="" sizes="(min-width: 768px) 28rem, 70vw" className="gallery__photo" />
          <Photo name={third} alt="" sizes="(min-width: 768px) 28rem, 70vw" className="gallery__photo" />
        </div>
      </div>
      <p className="gallery__caption reading">{gallery.caption}</p>
      {zoomed && (
        <div className="gallery__lightbox" role="dialog" aria-modal="true" aria-label={zoomed.alt || gallery.title} onClick={() => setZoomed(null)}>
          <div className="gallery__lightbox-frame">
            <img className="gallery__lightbox-img" src={zoomed.src} srcSet={zoomed.srcSet} sizes="100vw" alt={zoomed.alt} />
            <button type="button" className="gallery__lightbox-close" aria-label="Đóng" onClick={() => setZoomed(null)}>
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
