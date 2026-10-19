import { Fragment } from "react"
import { weddingConfig } from "../config/wedding-config"
import type { Family } from "../config/wedding-config"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./ceremony.css"

function FamilyBlock({ family, side }: { family: Family; side: "groom" | "bride" }) {
  return (
    <div className={`ceremony__family ceremony__family--${side}`}>
      <h3 className="ceremony__family-name">{family.label}</h3>
      <p className="ceremony__parent">{family.father}</p>
      <p className="ceremony__parent">{family.mother}</p>
      <p className="ceremony__place">{family.place}</p>
    </div>
  )
}

const REVEAL: readonly RevealRule[] = [
  { selector: ".ceremony__rule", preset: "lineY" },
  { selector: ".ceremony__word", preset: "fadeIn", delay: 200, stagger: 120 },
  { selector: ".ceremony__name--groom", preset: "slideLeft" },
  { selector: ".ceremony__amp", preset: "fadeIn", delay: 200 },
  { selector: ".ceremony__name--bride", preset: "slideRight", delay: 150 },
  { selector: ".ceremony__family", preset: "fadeUp", stagger: 150 },
]

export function Ceremony() {
  const { ceremony, couple } = weddingConfig
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="section ceremony" ref={ref}>
      <div className="container">
        <div className="ceremony__top">
          <h2 className="ceremony__title">
            <span className="ceremony__rule ceremony__rule--solid" aria-hidden="true" />
            {ceremony.titleLines.map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                {i > 0 && " "}
                <span className="ceremony__word">{word}</span>
              </Fragment>
            ))}
            <span className="ceremony__rule ceremony__rule--faint" aria-hidden="true" />
          </h2>
          <div className="ceremony__names">
            <p className="ceremony__name ceremony__name--groom">{couple.groom.fullName}</p>
            <p className="ceremony__amp" aria-hidden="true">
              {couple.connector}
            </p>
            <p className="ceremony__name ceremony__name--bride">{couple.bride.fullName}</p>
          </div>
        </div>

        <div className="ceremony__families">
          <FamilyBlock family={ceremony.groomFamily} side="groom" />
          <FamilyBlock family={ceremony.brideFamily} side="bride" />
        </div>
      </div>
    </section>
  )
}
