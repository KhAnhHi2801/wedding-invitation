import { weddingConfig } from "../config/wedding-config"
import { getWeddingEvent } from "../lib/wedding-event"
import { mapsEmbed } from "../lib/maps"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./map-card.css"

const REVEAL: readonly RevealRule[] = [{ selector: ".map__card", preset: "fadeUp" }]

/** Bản đồ Google thật nhúng sẵn như trang mẫu; iframe lazy nên chỉ tải khi gần lọt vào màn hình. */
export function MapCard() {
  const { ui } = weddingConfig
  const { event } = getWeddingEvent()
  const ref = useReveal<HTMLElement>(REVEAL)

  return (
    <section className="section map" ref={ref}>
      <div className="map__inner">
        <div className="map__card">
          <iframe
            className="map__frame"
            title={ui.mapTitle}
            src={mapsEmbed(event.mapsQuery)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
