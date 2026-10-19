import { useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { getWeddingEvent } from "../lib/wedding-event"
import { mapsEmbed, mapsLink } from "../lib/maps"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import "./map-card.css"

/**
 * Bản đồ dạng "facade": ban đầu chỉ là thẻ tĩnh, iframe Google Maps (khá nặng) chỉ tải khi khách bấm.
 */
const REVEAL: readonly RevealRule[] = [{ selector: ".map__card", preset: "fadeUp" }]

export function MapCard() {
  const { ui } = weddingConfig
  const { event } = getWeddingEvent()
  const [shown, setShown] = useState(false)
  const ref = useReveal<HTMLElement>(REVEAL)

  return (
    <section className="section map" ref={ref}>
      <div className="reading">
        <div className="map__card">
          {shown ? (
            <iframe
              className="map__frame"
              title={ui.mapTitle}
              src={mapsEmbed(event.mapsQuery)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="map__facade">
              <p className="map__venue">{event.venue}</p>
              <p className="map__address">{event.address}</p>
              <button type="button" className="map__button map__button--ghost" onClick={() => setShown(true)}>
                {ui.mapShow}
              </button>
            </div>
          )}
        </div>
        <a className="map__button" href={mapsLink(event.mapsQuery)} target="_blank" rel="noopener noreferrer">
          {ui.mapOpen}
        </a>
      </div>
    </section>
  )
}
