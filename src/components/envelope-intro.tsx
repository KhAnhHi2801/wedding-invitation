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
        </div>
      </section>
    </div>
  );
}
