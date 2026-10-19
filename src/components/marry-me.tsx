import { Fragment } from "react"
import { weddingConfig } from "../config/wedding-config"
import { Photo } from "./photo"
import { useParallax, type ParallaxItem } from "../hooks/use-parallax"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { FloatingHearts } from "./floating-hearts"
import "./marry-me.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".marry__eyebrow", preset: "fadeUp" },
  { selector: ".marry__block", preset: "scaleIn" },
  { selector: ".marry__photo", preset: "fadeIn", delay: 150, stagger: 150 },
  { selector: ".marry__text", preset: "fadeIn", delay: 350, stagger: 200 },
]

const PARALLAX: readonly ParallaxItem[] = [
  { selector: ".marry__photo--a", amount: 4 },
  { selector: ".marry__photo--b", amount: -6 },
  { selector: ".marry__photo--c", amount: 9 },
]

export function MarryMe() {
  const { marryMe, couple } = weddingConfig
  const [a, b, c] = marryMe.photos
  const alt = `${couple.bride.name} ${couple.connector} ${couple.groom.name}`
  const ref = useReveal<HTMLElement>(REVEAL)
  useParallax(ref, PARALLAX)

  return (
    <section className="section marry" ref={ref}>
      <FloatingHearts />
      <p className="marry__eyebrow label">{marryMe.eyebrow}</p>
      <div className="marry__stage">
        <div className="marry__block" aria-hidden="true" />
        <Photo name={a} alt={alt} sizes="(min-width: 768px) 28rem, 60vw" className="marry__photo marry__photo--a" />
        <Photo name={b} alt="" sizes="(min-width: 768px) 22rem, 46vw" className="marry__photo marry__photo--b" />
        <Photo name={c} alt="" sizes="(min-width: 768px) 16rem, 34vw" className="marry__photo marry__photo--c" />
        <p className="marry__text marry__text--question">
          {marryMe.question.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 && " "}
              <span>{word}</span>
            </Fragment>
          ))}
        </p>
        <p className="marry__text marry__text--answer">
          {marryMe.answer.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 && " "}
              <span>{word}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  )
}
