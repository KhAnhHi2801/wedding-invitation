import { weddingConfig } from "../config/wedding-config"
import { ChairIcon } from "./icons/shapes"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./rsvp.css"

interface RsvpProps {
  onOpen: () => void
}

const REVEAL: readonly RevealRule[] = [{ selector: ".rsvp__arch", preset: "scaleUp" }]

export function Rsvp({ onOpen }: RsvpProps) {
  const { rsvp } = weddingConfig
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="rsvp" id="rsvp" ref={ref}>
      <div className="rsvp__arch">
        <p className="rsvp__eyebrow">{rsvp.eyebrow}</p>
        <h2 className="rsvp__title">{rsvp.title}</h2>
        <p className="rsvp__text">{rsvp.description}</p>
        <button type="button" className="rsvp__button" onClick={onOpen}>
          <ChairIcon className="rsvp__icon" />
          {rsvp.button}
        </button>
      </div>
    </section>
  )
}
