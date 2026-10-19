import { weddingConfig } from "../config/wedding-config"
import { getEventParts } from "../lib/event-date"
import { getGuestName } from "../lib/guest"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./event-info.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".event__welcome, .event__guest", preset: "fadeUp", stagger: 100 },
  { selector: ".event__title, .event__time", preset: "fadeUp", stagger: 100 },
  { selector: ".event__side--month", preset: "wipeToLeft" },
  { selector: ".event__side--year", preset: "wipeToRight" },
  { selector: ".event__day", preset: "scaleIn", delay: 150 },
  { selector: ".event__lunar, .event__venue-label, .event__venue, .event__address", preset: "fadeUp", stagger: 90 },
]

export function EventInfo() {
  const { party, event, hero, guestParam } = weddingConfig
  const parts = getEventParts(event.startsAt)
  const guest = getGuestName(guestParam, hero.guestFallback)
  const ref = useReveal<HTMLElement>(REVEAL)

  return (
    <section className="section event" ref={ref}>
      <div className="reading event__body">
        <p className="event__welcome">{party.welcome}</p>
        <p className="event__guest">{guest}</p>

        <h2 className="event__title">{party.title}</h2>
        <p className="event__time">
          {party.timePrefix} {parts.timeLabel} {parts.weekdayUpper}
        </p>

        <div className="event__date">
          <p className="event__side event__side--month">
            {party.monthPrefix} {parts.month}
          </p>
          <p className="event__day">{parts.day}</p>
          <p className="event__side event__side--year">
            {hero.yearPrefix} {parts.year}
          </p>
        </div>

        <p className="event__lunar">{event.lunarText}</p>

        <p className="event__venue-label">{party.venueLabel}</p>
        <p className="event__venue">{event.venue}</p>
        <p className="event__address">{event.address}</p>
      </div>
    </section>
  )
}
