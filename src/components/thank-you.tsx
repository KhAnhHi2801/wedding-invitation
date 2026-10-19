import { weddingConfig } from "../config/wedding-config"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { assetUrl } from "../lib/asset-url"
import "./thank-you.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".thanks__animation", preset: "fadeIn" },
  { selector: ".thanks__text", preset: "write", delay: 300 },
]

export function ThankYou() {
  const { thankYou } = weddingConfig
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="section thanks" ref={ref}>
      {/* Người giảm chuyển động nhận ảnh tĩnh thay cho WebP động */}
      <picture className="thanks__animation">
        <source media="(prefers-reduced-motion: reduce)" srcSet={assetUrl(thankYou.still)} />
        <img src={assetUrl(thankYou.animation)} alt={thankYou.alt} width={360} height={360} loading="lazy" decoding="async" />
      </picture>
      <p className="thanks__text">{thankYou.text}</p>
    </section>
  )
}
