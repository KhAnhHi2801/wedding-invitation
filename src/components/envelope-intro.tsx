import { useRef, useState } from "react"
import { weddingConfig } from "../config/wedding-config"
import { getEventParts } from "../lib/event-date"
import { getGuestName } from "../lib/guest"
import { prefersReducedMotion } from "../lib/device-tier"
import { gsap, useGSAP } from "../lib/gsap"
import { DoubleHappiness } from "./icons/double-happiness"
import { HeartIcon } from "./icons/shapes"
import { WaxSeal } from "./icons/wax-seal"
import { Photo } from "./photo"
import "./envelope-intro.css"

interface EnvelopeIntroProps {
  /** Gọi NGAY trong lúc khách chạm (đồng bộ), cần cho việc bật nhạc: iOS chỉ cho phát trong chính handler thao tác */
  onOpenStart?: () => void
  /** Gọi khi phong bì đã mở xong, để trang mở khóa cuộn */
  onOpened: () => void
}

const HEARTS = [0, 1, 2]

export function EnvelopeIntro({ onOpenStart, onOpened }: EnvelopeIntroProps) {
  const { hero, couple, ui } = weddingConfig
  const rootRef = useRef<HTMLElement>(null)
  const [state, setState] = useState<"closed" | "opening" | "open">("closed")
  const year = getEventParts(weddingConfig.event.startsAt).year
  const guest = getGuestName(weddingConfig.guestParam, hero.guestFallback)

  const { contextSafe } = useGSAP({ scope: rootRef })

  const open = contextSafe(() => {
    if (state !== "closed") return
    setState("opening")
    onOpenStart?.()

    const finish = () => {
      setState("open")
      onOpened()
    }

    const q = gsap.utils.selector(rootRef)
    if (prefersReducedMotion()) {
      gsap.set(q(".envelope__flap"), { rotateX: -180, zIndex: 1 })
      gsap.set(q(".envelope__card"), { yPercent: -38, zIndex: 3 })
      gsap.set([q(".envelope__seal"), q(".intro__hint")], { autoAlpha: 0 })
      finish()
      return
    }

    // Trên máy yếu chỉ giữ 1 trái tim cho nhẹ
    const hearts = q(".intro__heart").filter((node) => getComputedStyle(node).display !== "none")

    gsap
      .timeline({ onComplete: finish })
      .to(q(".intro__hint"), { autoAlpha: 0, duration: 0.25 }, 0)
      .to(q(".envelope__seal"), { scale: 0.55, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0)
      .to(q(".envelope__flap"), { rotateX: -180, duration: 0.7, ease: "power2.inOut" }, 0.2)
      .set(q(".envelope__flap"), { zIndex: 1 }, 0.55)
      .set(q(".envelope__card"), { zIndex: 3 }, 0.55)
      .to(q(".envelope__card"), { yPercent: -38, duration: 0.8, ease: "power3.out" }, 0.8)
      .fromTo(
        hearts,
        { y: 0, x: 0, autoAlpha: 0, scale: 0.5 },
        {
          y: (i: number) => -150 - i * 45,
          x: (i: number) => [-70, 10, 80][i] ?? 0,
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          stagger: 0.14,
          ease: "power2.out",
        },
        0.95,
      )
      .to(hearts, { autoAlpha: 0, duration: 0.5, stagger: 0.1 }, 1.9)
  })

  return (
    <section className="intro" ref={rootRef} aria-label={hero.title} data-state={state}>
      <header className="intro__head">
        <p className="intro__eyebrow">{hero.eyebrow}</p>
        <h1 className="intro__title">{hero.title}</h1>
        <p className="intro__names">
          <span className="intro__name">{couple.bride.name}</span>
          <span className="intro__amp" aria-hidden="true">
            {couple.connector}
          </span>
          <span className="intro__name">{couple.groom.name}</span>
        </p>
        <DoubleHappiness className="intro__logo" />
      </header>

      <div className="intro__stage">
        <div className="envelope">
          <div className="envelope__back" />
          <div className="envelope__card">
            <Photo
              name={hero.photo}
              alt={`${couple.bride.name} ${couple.connector} ${couple.groom.name}`}
              sizes="(min-width: 640px) 30rem, 80vw"
              priority
            />
          </div>
          <div className="envelope__pocket envelope__pocket--left" />
          <div className="envelope__pocket envelope__pocket--right" />
          <div className="envelope__pocket envelope__pocket--bottom" />
          <div className="envelope__label">
            <span className="envelope__year">
              {hero.yearPrefix} {year}
            </span>
            <span className="envelope__invite">{hero.inviteLine}</span>
            <span className="envelope__guest">{guest}</span>
          </div>
          <div className="envelope__flap" />
          <button
            type="button"
            className="envelope__seal"
            onClick={open}
            disabled={state !== "closed"}
            aria-label={`${ui.openEnvelope}: ${hero.sealHint}`}
          >
            <WaxSeal />
          </button>
        </div>
        <div className="intro__shadow" aria-hidden="true" />
        <p className="intro__hint" aria-hidden="true">
          {hero.sealHint}
        </p>
        {HEARTS.map((id) => (
          <HeartIcon key={id} className="intro__heart" />
        ))}
      </div>
    </section>
  )
}
