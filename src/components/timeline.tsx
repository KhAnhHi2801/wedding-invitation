import type { ComponentType, SVGProps } from "react"
import { getWeddingEvent } from "../lib/wedding-event"
import type { TimelineItem } from "../config/wedding-config"
import { CameraIcon, CarIcon, HeartIcon, ToastIcon } from "./icons/shapes"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { FloatingHearts } from "./floating-hearts"
import "./timeline.css"

const ICONS: Record<TimelineItem["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  car: CarIcon,
  camera: CameraIcon,
  toast: ToastIcon,
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
            const Icon = ICONS[item.icon]
            return (
              <li className="timeline__row" key={item.time}>
                <Icon className="timeline__icon" />
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
