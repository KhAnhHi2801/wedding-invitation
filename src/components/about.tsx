import { weddingConfig } from "../config/wedding-config"
import type { Person } from "../config/wedding-config"
import { Photo } from "./photo"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./about.css"

interface AboutPersonProps {
  person: Person
  label: string
  /** Cô dâu: thẻ bên trái, ảnh bên phải; chú rể ngược lại */
  side: "bride" | "groom"
}

const PERSON_REVEAL: Record<"bride" | "groom", readonly RevealRule[]> = {
  bride: [
    { selector: ".about__card", preset: "slideLeft" },
    { selector: ".about__photo", preset: "slideRight", delay: 120 },
    { selector: ".about__label", preset: "fadeIn", delay: 400 },
  ],
  groom: [
    { selector: ".about__photo", preset: "slideLeft" },
    { selector: ".about__card", preset: "slideRight", delay: 120 },
    { selector: ".about__label", preset: "fadeIn", delay: 400 },
  ],
}

const HEADING_REVEAL: readonly RevealRule[] = [{ selector: ".about__heading", preset: "fadeUp" }]

function AboutPerson({ person, label, side }: AboutPersonProps) {
  const ref = useReveal<HTMLElement>(PERSON_REVEAL[side])
  return (
    <article className={`about__person about__person--${side}`} ref={ref}>
      <div className="about__card">
        <h3 className="about__name">{person.fullName}</h3>
        <p className="about__detail">{person.birthDate}</p>
        <p className="about__detail">{person.hometown}</p>
      </div>
      <Photo
        name={person.photo}
        alt={person.fullName}
        sizes="(min-width: 768px) 22rem, 62vw"
        className="about__photo"
      />
      <p className="about__label vertical" aria-hidden="true">
        {label}
      </p>
    </article>
  )
}

export function About() {
  const { about, couple } = weddingConfig
  const ref = useReveal<HTMLElement>(HEADING_REVEAL)
  return (
    <section className="section about" ref={ref}>
      <div className="container">
        <h2 className="about__heading">{about.heading}</h2>
        <AboutPerson person={couple.bride} label={about.brideLabel} side="bride" />
        <AboutPerson person={couple.groom} label={about.groomLabel} side="groom" />
      </div>
    </section>
  )
}
