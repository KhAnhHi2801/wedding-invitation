import { weddingConfig } from "../config/wedding-config"
import { Photo } from "./photo"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./invitation.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".invitation__title, .invitation__line", preset: "fadeUp", stagger: 90 },
]

export function Invitation() {
  const { invitation, gallery } = weddingConfig
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="section invitation" ref={ref}>
      <Photo name={gallery.background} alt="" sizes="100vw" className="invitation__bg" />
      <div className="invitation__veil" aria-hidden="true" />
      <div className="reading invitation__body">
        <h2 className="invitation__title label">{invitation.heading}</h2>
        {invitation.lines.map((line, i) => (
          <p key={i} className="invitation__line">
            {line}
          </p>
        ))}
      </div>
    </section>
  )
}
