import { Fragment } from "react"
import { weddingConfig } from "../config/wedding-config"
import { Photo } from "./photo"
import { useParallax, type ParallaxItem } from "../hooks/use-parallax"
import { useReveal, type RevealRule } from "../hooks/use-reveal"
import { FloatingHearts } from "./floating-hearts"
import "./marry-me.css"

const REVEAL: readonly RevealRule[] = [
  { selector: ".marry__eyebrow", preset: "fadeUp" },
  { selector: ".marry__block", preset: "scaleIn" },
  { selector: ".marry__frame", preset: "fadeIn", delay: 100 },
  { selector: ".marry__photo", preset: "fadeIn", delay: 150, stagger: 150 },
  { selector: ".marry__text", preset: "fadeIn", delay: 350, stagger: 200 },
  { selector: ".marry__heart", preset: "fadeIn", delay: 600, stagger: 150 },
]

const PARALLAX: readonly ParallaxItem[] = [
  { selector: ".marry__photo--a", amount: 4 },
  { selector: ".marry__photo--b", amount: -6 },
]

/** Trái tim hồng chuyển màu, dùng hai lần ở khối hồng cạnh chữ "YES !" */
function PinkHeart({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 22" aria-hidden="true">
      <defs>
        <linearGradient id="marry-heart-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f58a9a" />
          <stop offset="1" stopColor="#f7c0c8" />
        </linearGradient>
      </defs>
      <path
        d="M12 21C4 15.4 1 11.7 1 7.6 1 4.3 3.5 2 6.6 2c2.1 0 4 1 5.4 3.1C13.4 3 15.3 2 17.4 2 20.5 2 23 4.3 23 7.6c0 4.1-3 7.8-11 13.4z"
        fill="url(#marry-heart-fill)"
      />
    </svg>
  )
}

/**
 * "MARRY ME?" theo bố cục trang mẫu: hai ảnh đè lên nhau trên khối hồng phía phải, chữ MARRY ME? phủ lên ảnh,
 * YES ! I DO ! màu trắng có bóng đỏ rượu nằm trong khối hồng. Mọi kích thước tính theo bề rộng khung (cqw) để cả
 * bố cục co giãn đúng tỷ lệ ở mọi màn hình.
 */
export function MarryMe() {
  const { marryMe, couple } = weddingConfig
  const [a, b] = marryMe.photos
  const alt = `${couple.bride.name} ${couple.connector} ${couple.groom.name}`
  const ref = useReveal<HTMLElement>(REVEAL)
  useParallax(ref, PARALLAX)

  return (
    <section className="section marry" ref={ref}>
      <FloatingHearts />
      <p className="marry__eyebrow label">{marryMe.eyebrow}</p>
      <div className="marry__stage">
        <div className="marry__block" aria-hidden="true" />
        <div className="marry__frame" aria-hidden="true" />
        <Photo name={a} alt={alt} sizes="(min-width: 768px) 28rem, 64vw" className="marry__photo marry__photo--a" />
        <Photo name={b} alt="" sizes="(min-width: 768px) 26rem, 60vw" className="marry__photo marry__photo--b" />
        <PinkHeart className="marry__heart marry__heart--big" />
        <PinkHeart className="marry__heart marry__heart--small" />
        <p className="marry__text marry__text--question">
          {marryMe.question.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 && " "}
              <span>{word}</span>
            </Fragment>
          ))}
        </p>
        <p className="marry__text marry__text--answer">
          {marryMe.answer.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 && " "}
              {/* "YES !" thành "YES!": dấu câu đứng sát chữ như mẫu */}
              <span>{word.replace(/\s+([!?])/g, "$1")}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  )
}
