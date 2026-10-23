import { weddingConfig } from "../config/wedding-config";
import { useReveal, type RevealRule } from "../hooks/use-reveal";
import { buildMonthGrid } from "../lib/build-calendar";
import { getEventParts } from "../lib/event-date";
import { getWeddingEvent } from "../lib/wedding-event";
import { FloatingHearts } from "./floating-hearts";
import { Photo } from "./photo";
import "./save-the-date.css";

const REVEAL: readonly RevealRule[] = [
  { selector: ".save__heading", preset: "fadeUp" },
  { selector: ".save__frame", preset: "slideLeft", delay: 100 },
  { selector: ".save__photo", preset: "fadeIn" },
  { selector: ".save__stamp", preset: "fadeIn", delay: 350 },
  { selector: ".save__calendar", preset: "fadeUp" },
];

export function SaveTheDate() {
  const { saveTheDate, ui, couple, party } = weddingConfig;
  const { event } = getWeddingEvent();
  const parts = getEventParts(event.startsAt);
  const grid = buildMonthGrid(parts.year, parts.month);
  const weeks = Math.ceil(grid.length / 7);
  // Độn cho đủ hàng 7 ô để hàng cuối không bị lệch
  const cells = [
    ...grid,
    ...Array.from({ length: weeks * 7 - grid.length }, () => null),
  ];
  const ref = useReveal<HTMLElement>(REVEAL);

  return (
    <section className="section save" ref={ref}>
      <FloatingHearts />
      <div className="container">
        <h2 className="save__heading ornament">{saveTheDate.heading}</h2>

        <div className="save__photo-wrap">
          <span className="save__frame" aria-hidden="true" />
          <Photo
            name={saveTheDate.photo}
            alt={`${couple.bride.name} ${couple.connector} ${couple.groom.name}`}
            sizes="(min-width: 768px) 40rem, 90vw"
            className="save__photo"
          />
          <p className="save__stamp vertical">
            {parts.year} / {parts.month}
          </p>
          <table className="save__calendar">
            <caption className="sr-only">
              {party.monthPrefix} {parts.month} {parts.year}
            </caption>
            <thead className="sr-only">
              <tr>
                {ui.weekdays.map((day) => (
                  <th key={day} scope="col">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: weeks }, (_, week) => (
                <tr key={week}>
                  {cells.slice(week * 7, week * 7 + 7).map((day, i) => (
                    <td key={i}>
                      {day !== null && (
                        <span
                          className={
                            day === parts.day
                              ? "save__day save__day--event"
                              : "save__day"
                          }
                        >
                          {day}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
