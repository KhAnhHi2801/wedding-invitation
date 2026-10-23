import { weddingConfig } from "../config/wedding-config"
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

export function Gallery() {
  const { gallery, couple } = weddingConfig
  const [first, second, third] = gallery.photos
  const alt = `${couple.bride.name} ${couple.connector} ${couple.groom.name}`
  const ref = useReveal<HTMLElement>(REVEAL)
  useParallax(ref, PARALLAX)

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
        <div className="gallery__stack">
          <Photo name={first} alt={alt} sizes="(min-width: 768px) 28rem, 70vw" className="gallery__photo" />
          <Photo name={second} alt="" sizes="(min-width: 768px) 28rem, 70vw" className="gallery__photo" />
          <Photo name={third} alt="" sizes="(min-width: 768px) 28rem, 70vw" className="gallery__photo" />
        </div>
      </div>
      <p className="gallery__caption reading">{gallery.caption}</p>
    </section>
  )
}
