import { weddingConfig } from "../config/wedding-config"
import type { Person } from "../config/wedding-config"
import { Photo } from "./photo"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./about.css"

interface AboutPersonProps {
  person: Person
  label: string
  /** Cô dâu: ảnh dọc bên phải, thẻ bên trái; chú rể ngược lại */
  side: "bride" | "groom"
}

const PERSON_REVEAL: Record<"bride" | "groom", readonly RevealRule[]> = {
  bride: [
    { selector: ".about__heading", preset: "fadeUp" },
    { selector: ".about__card", preset: "slideLeft" },
    { selector: ".about__photo", preset: "slideRight", delay: 120 },
    { selector: ".about__frame, .about__wide", preset: "fadeIn", delay: 200 },
    { selector: ".about__label", preset: "fadeIn", delay: 400 },
  ],
  groom: [
    { selector: ".about__heading", preset: "fadeUp" },
    { selector: ".about__photo", preset: "slideLeft" },
    { selector: ".about__card", preset: "slideRight", delay: 120 },
    { selector: ".about__frame, .about__wide", preset: "fadeIn", delay: 200 },
    { selector: ".about__label", preset: "fadeIn", delay: 400 },
  ],
}

/**
 * Một người trong "About us", bố cục theo trang mẫu: tiêu đề, ảnh dọc đè lên thẻ thông tin, ảnh ngang có khung viền
 * lệch bên dưới và nhãn dọc (Bride/Groom). Cô dâu và chú rể đối xứng nhau. Mọi cỡ tính theo bề rộng khung (cqw).
 */
function AboutPerson({ person, label, side }: AboutPersonProps) {
  const { about } = weddingConfig
  const ref = useReveal<HTMLElement>(PERSON_REVEAL[side])
  return (
    <article className={`about__person about__person--${side}`} ref={ref}>
      <h2 className="about__heading ornament">{about.heading}</h2>
      <Photo
        name={person.photo}
        alt={person.fullName}
        sizes="(min-width: 768px) 26rem, 60vw"
        className="about__photo"
      />
      <div className="about__card">
        <h3 className="about__name">{person.fullName}</h3>
        <p className="about__detail">{person.birthDate}</p>
        <p className="about__detail">{person.hometown}</p>
      </div>
      <span className="about__frame" aria-hidden="true" />
      <Photo name={person.widePhoto} alt="" sizes="(min-width: 768px) 32rem, 74vw" className="about__wide" />
      <p className="about__label vertical" aria-hidden="true">
        {label}
      </p>
    </article>
  )
}

export function About() {
  const { about, couple } = weddingConfig
  return (
    <section className="section about">
      <AboutPerson person={couple.bride} label={about.brideLabel} side="bride" />
      <AboutPerson person={couple.groom} label={about.groomLabel} side="groom" />
    </section>
  )
}
