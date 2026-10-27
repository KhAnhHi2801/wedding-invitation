import { useRef, useState } from "react";
import { weddingConfig } from "../config/wedding-config";
import { assetUrl } from "../lib/asset-url";
import { prefersReducedMotion } from "../lib/device-tier";
import { gsap, useGSAP } from "../lib/gsap";
import { getNamedGuest } from "../lib/guest";
import { fillText } from "../lib/wish-list";
import "./envelope-intro.css";
import { DoubleHappiness } from "./icons/double-happiness";
import { HeartIcon } from "./icons/shapes";
import { Photo } from "./photo";

interface EnvelopeIntroProps {
  /** Gọi NGAY trong lúc khách chạm (đồng bộ), cần cho việc bật nhạc: iOS chỉ cho phát trong chính handler thao tác */
  onOpenStart?: () => void;
  /** Gọi sau khi phong bì mở và phần intro đã mờ đi, để trang mở khóa cuộn */
  onOpened: () => void;
}

const HEARTS = [0, 1, 2];

/** Cánh hoa bung khi mở: màu, cỡ và góc cố định để mỗi lần mở đều đẹp như nhau */
const PETALS = [
  { tone: "var(--blush)", scale: 1, angle: -150 },
  { tone: "var(--rose)", scale: 1.3, angle: -118 },
  { tone: "var(--pink-soft)", scale: 0.8, angle: -92 },
  { tone: "var(--blush)", scale: 1.1, angle: -64 },
  { tone: "var(--rose)", scale: 0.9, angle: -35 },
  { tone: "var(--pink-soft)", scale: 1.2, angle: -170 },
  { tone: "var(--blush)", scale: 0.85, angle: -105 },
  { tone: "var(--rose)", scale: 1, angle: -78 },
  { tone: "var(--pink-soft)", scale: 1.15, angle: -20 },
  { tone: "var(--blush)", scale: 0.9, angle: -135 },
];

export function EnvelopeIntro({ onOpenStart, onOpened }: EnvelopeIntroProps) {
  const { hero, couple, guestParam } = weddingConfig;
  const guest = getNamedGuest(guestParam);
  const rootRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<
    "closed" | "opening" | "fading" | "hidden"
  >("closed");

  const { contextSafe } = useGSAP({ scope: rootRef });

  const open = contextSafe(() => {
    if (state !== "closed") return;
    setState("opening");
    onOpenStart?.();

    const finish = () => {
      setState("hidden");
      onOpened();
    };

    const q = gsap.utils.selector(rootRef);
    if (prefersReducedMotion()) {
      gsap.set(q(".envelope__flap"), { rotateX: -180, zIndex: 0 });
      gsap.set(q(".envelope__card"), { yPercent: -52 });
      finish();
      return;
    }

    // Trên máy yếu chỉ giữ 1 trái tim cho nhẹ
    const hearts = q(".intro__heart").filter(
      (node) => getComputedStyle(node).display !== "none",
    );

    // Nhịp theo trang mẫu: nắp lật 1.2s, thư (ảnh) trượt lên sau 0.6s trong ~1s; ấn sáp và dòng gợi ý vẫn nằm yên
    gsap
      .timeline()
      .to(
        q(".envelope__flap"),
        { rotateX: -180, duration: 1.2, ease: "power1.out" },
        0,
      )
      // Nắp đã lật lên thì nằm sau thẻ; thẻ luôn nằm dưới mặt trước phong bì nên ảnh trượt lên từ trong túi, không đè lên
      .set(q(".envelope__flap"), { zIndex: 0 }, 0.6)
      .to(
        q(".envelope__card"),
        { yPercent: -52, duration: 1, ease: "power1.out" },
        0.6,
      )
      .call(() => setState("fading"), [], 1.8)
      .call(finish, [], 2.6);

    // Cánh hoa bung từ trong phong bì: bay ra theo góc, xoay và rơi nhẹ rồi mờ dần
    const spread = Math.min(window.innerWidth * 0.45, 260);
    q(".intro__petal")
      .filter((node) => getComputedStyle(node).display !== "none")
      .forEach((petal, i) => {
        const rad = (PETALS[i].angle * Math.PI) / 180;
        const dist = spread * (0.6 + (i % 4) * 0.22);
        gsap
          .timeline({ delay: 0.9 + i * 0.07 })
          .fromTo(
            petal,
            { x: 0, y: 0, scale: 0.3, rotate: 0, autoAlpha: 0 },
            {
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              scale: PETALS[i].scale,
              rotate: (i % 2 ? 1 : -1) * (90 + i * 25),
              autoAlpha: 0.95,
              duration: 1.4,
              ease: "power2.out",
            },
            0,
          )
          .to(
            petal,
            { y: `+=${60 + i * 8}`, autoAlpha: 0, duration: 1.6, ease: "sine.in" },
            1.2,
          );
      });

    // Trái tim bay chậm lên rồi mờ dần, lắc nhẹ hai bên (4s, 5s, 7s như mẫu)
    const rise = Math.min(600, window.innerHeight * 0.7);
    hearts.forEach((heart, i) => {
      const life = [4, 5, 7][i] ?? 5;
      gsap
        .timeline({ delay: 1.2 + i * 0.2 })
        .fromTo(
          heart,
          { y: 0, scale: 0.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power1.out" },
          0,
        )
        .to(heart, { y: -rise, duration: life, ease: "none" }, 0)
        .to(
          heart,
          { autoAlpha: 0, duration: life * 0.5, ease: "power1.in" },
          life * 0.5,
        )
        .to(
          heart,
          {
            x: i % 2 ? 24 : -24,
            duration: 2,
            ease: "sine.inOut",
            repeat: Math.ceil(life / 2),
            yoyo: true,
          },
          0,
        );
    });
  });

  if (state === "hidden") return null;

  return (
    <div className="intro-wrap">
      <section
        className="intro"
        ref={rootRef}
        aria-label={hero.title}
        data-state={state}
      >
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
          {guest && <p className="intro__guest">{fillText(hero.guestEnvelopeLine, { name: guest })}</p>}
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
            <div className="envelope__flap" />
            <button
              type="button"
              className="envelope__seal"
              aria-label={weddingConfig.ui.openEnvelope}
              onClick={open}
              disabled={state !== "closed"}
            >
              <img src={assetUrl("hero/wax-seal.webp")} alt="" />
            </button>
          </div>
          <div className="intro__shadow" aria-hidden="true" />
          {HEARTS.map((id) => (
            <HeartIcon key={id} className="intro__heart" />
          ))}
          {PETALS.map((petal, i) => (
            <svg key={i} className="intro__petal" viewBox="0 0 24 24" aria-hidden="true" style={{ color: petal.tone }}>
              <path d="M12 2c4.500 3.800 7 8 7 12a7 7 0 0 1-14 0c0-4 2.500-8.200 7-12z" fill="currentColor" />
            </svg>
          ))}
        </div>
      </section>
    </div>
  );
}
