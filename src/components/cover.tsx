import { weddingConfig } from "../config/wedding-config"
import { useCountdown } from "../hooks/use-countdown"
import { getEventParts } from "../lib/event-date"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { Photo } from "./photo"
import "./cover.css"

/** Tách riêng để mỗi giây chỉ 4 ô số render lại, không kéo cả trang theo. */
function CountdownBoxes({ targetMs, units }: { targetMs: number; units: readonly string[] }) {
  const { days, hours, minutes, seconds } = useCountdown(targetMs)
  const values = [days, hours, minutes, seconds]
  return (
    <ul className="cover__count">
      {values.map((value, i) => (
        <li className="cover__unit" key={units[i]}>
          <span className="cover__number">{value}</span>
          <span className="cover__unit-label">{units[i]}</span>
        </li>
      ))}
    </ul>
  )
}

const REVEAL: readonly RevealRule[] = [
  { selector: ".cover__photo", preset: "fadeIn" },
  { selector: ".cover__count", preset: "fadeUp", delay: 250 },
]

export function Cover() {
  const { hero, couple, event, ui } = weddingConfig
  const { startsAtMs } = getEventParts(event.startsAt)
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="cover" ref={ref}>
      <Photo
        name={hero.coverPhoto}
        alt={`${couple.bride.name} ${couple.connector} ${couple.groom.name}`}
        sizes="100vw"
        className="cover__photo"
      />
      <CountdownBoxes targetMs={startsAtMs} units={ui.countdownUnits} />
    </section>
  )
}
