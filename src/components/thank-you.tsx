import { weddingConfig } from "../config/wedding-config"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { assetUrl } from "../lib/asset-url"
import { getGuestName } from "../lib/guest"
import { fillText } from "../lib/wish-list"
import "./thank-you.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".thanks__animation", preset: "fadeIn" },
  { selector: ".thanks__text", preset: "write", delay: 300 },
  { selector: ".thanks__note", preset: "fadeUp", delay: 600 },
]

export function ThankYou() {
  const { thankYou, guestParam } = weddingConfig
  const guest = getGuestName(guestParam, thankYou.noteGuestFallback)
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="section thanks" id="thanks" ref={ref}>
      {/* Người giảm chuyển động nhận ảnh tĩnh thay cho WebP động */}
      <picture className="thanks__animation">
        <source media="(prefers-reduced-motion: reduce)" srcSet={assetUrl(thankYou.still)} />
        <img src={assetUrl(thankYou.animation)} alt={thankYou.alt} width={360} height={360} loading="lazy" decoding="async" />
      </picture>
      <p className="thanks__text">{thankYou.text}</p>
      <p className="thanks__note">{fillText(thankYou.note, { name: guest })}</p>
    </section>
  )
}
