import { getWeddingEvent } from "../lib/wedding-event"
import type { TimelineItem } from "../config/wedding-config"
import { HeartIcon } from "./icons/shapes"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { FloatingHearts } from "./floating-hearts"
import "./timeline.css"

/** Hoạt hình cho từng mốc (nền trắng, hòa vào nền giấy bằng multiply trong ô `.timeline__icon` ở timeline.css) */
const GIFS: Record<TimelineItem["icon"], string> = {
  car: "/gifs/wedding-car.gif",
  camera: "/gifs/couple.gif",
  toast: "/gifs/cocktails.gif",
  church: "/gifs/church.gif",
  gift: "/gifs/invitation-card.gif",
  rings: "/gifs/couple.gif",
}

const REVEAL: readonly RevealRule[] = [
  { selector: ".timeline__axis", preset: "lineY" },
  { selector: ".timeline__row", preset: "fadeUp", stagger: 120 },
]

export function Timeline() {
  const { timeline } = getWeddingEvent()
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="section timeline" ref={ref}>
      <FloatingHearts />
      <div className="container">
        <div className="timeline__list">
          <span className="timeline__axis" aria-hidden="true" />
          <ol className="timeline__rows">
          {timeline.map((item) => {
            return (
              <li className="timeline__row" key={item.time}>
                <span className="timeline__icon">
                  <img src={GIFS[item.icon]} alt="" width={504} height={504} loading="lazy" />
                </span>
                <HeartIcon className="timeline__heart" />
                <p className="timeline__text">
                  <span className="timeline__time">{item.time}</span>
                  <span className="timeline__label">: {item.label}</span>
                </p>
              </li>
            )
          })}
          </ol>
        </div>
      </div>
    </section>
  )
}
