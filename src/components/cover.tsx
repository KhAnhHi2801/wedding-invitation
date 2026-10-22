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
  { selector: ".cover__photo", preset: "fadeIn", delay: 200 },
  { selector: ".cover__count", preset: "fadeUp", delay: 250 },
  { selector: ".cover__title, .cover__line", preset: "fadeUp", delay: 400, stagger: 90 },
]

export function Cover() {
  const { hero, couple, ui, invitation } = weddingConfig
  // Đếm ngược tới lễ đầu tiên, chung cho cả hai bên (giờ tiệc của từng bên nằm ở phần "Tiệc mừng")
  const { startsAtMs } = getEventParts(weddingConfig.countdownTo)
  const ref = useReveal<HTMLElement>(REVEAL)
  return (
    <section className="cover" ref={ref}>
      <Photo
        name={hero.coverPhoto}
        alt={`${couple.bride.name} ${couple.connector} ${couple.groom.name}`}
        sizes="100vw"
        priority="low"
        className="cover__photo"
      />
      <CountdownBoxes targetMs={startsAtMs} units={ui.countdownUnits} />
      {/* Lời mời nằm ngay trên ảnh bìa, cùng một khung như bản gốc, không tách thành section riêng */}
      <div className="cover__panel reading">
        <h2 className="cover__title label">{invitation.heading}</h2>
        {invitation.lines.map((line, i) => (
          <p key={i} className="cover__line">
            {line}
          </p>
        ))}
      </div>
    </section>
  )
}
