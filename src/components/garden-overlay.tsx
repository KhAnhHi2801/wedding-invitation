import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { weddingConfig } from "../config/wedding-config";
import {
  BloomPlayer,
  type BloomMode,
} from "../features/flower-bloom/BloomPlayer";
import { FlowerArt } from "./flower-art";
import { prefersReducedMotion } from "../lib/device-tier";
import { FLOWER_ENTRIES } from "../lib/flower-entries";
import { gardenOverlay } from "../lib/garden-overlay";
import { getGuestName } from "../lib/guest";
import { lockScroll } from "../lib/scroll-lock";
import { DEFAULT_INK } from "../lib/wish-style";
import {
  MESSAGE_MAX,
  NAME_MAX,
  validateWish,
  type WishErrors,
} from "../lib/wish-validation";
import { submitWish } from "../lib/wishes-api";
import { addOwnWish } from "../lib/wishes-store";
import "./garden-overlay.css";
import { CloseIcon } from "./icons/ui-icons";
import { SowHoldButton } from "./sow-hold-button";
import { SowSeedDrop } from "./sow-seed-drop";

type Step = "choose" | "sowing" | "growing" | "blooming" | "writing" | "done";
/** Trong bước gieo: hoa xem trước mờ đi, rồi chậu trống và hạt rơi */
type SowPhase = "fading" | "dropping";

/** Thời gian hoa xem trước mờ đi trước khi hạt rơi (ms) */
const FADE_MS = 260;

const pickRandom = <T,>(items: readonly T[], not?: T): T => {
  const pool =
    items.length > 1 && not !== undefined
      ? items.filter((item) => item !== not)
      : items;
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Tên khách có sẵn trong link mời (`?to=`) thì điền sẵn vào ô tên; không có thì để trống. */
function initialName(): string {
  const { guestParam, hero } = weddingConfig;
  const guest = getGuestName(guestParam, "");
  return guest === hero.guestFallback ? "" : guest;
}

/** Cuộn tới lời chúc của khách trong phần "Lời chúc" (lời mới nhất đứng đầu); chưa dựng thì cuộn tới đầu phần. */
function scrollToWishes() {
  const section = document.getElementById("guestbook");
  (section?.querySelector(".wish-gallery__feature") ?? section)?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
  });
}

interface GardenOverlayProps {
  open: boolean;
}

/**
 * Lớp phủ toàn màn hình của mini-game "Gieo một lời chúc": chọn hoa, nhấn giữ để gieo hạt vào chậu, xem hoa nở, viết lời
 * chúc, rồi xuống phần "Lời chúc" xem lời chúc của mình. Mỗi lúc chỉ hiện một bước. Lời chúc gửi ngầm lên Google Sheet
 * (hàng đợi + thử lại), lời chúc của khách hiện ngay trong phần "Lời chúc" không chờ máy chủ.
 */
export default function GardenOverlay({ open }: GardenOverlayProps) {
  const { garden } = weddingConfig;
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sowTimer = useRef(0);
  const firstStep = useRef(true);
  // Chỉ coi là bấm ra ngoài khi cả nhấn xuống và nhả ra đều ở vùng nền (kéo bôi đen từ ô nhập ra ngoài không được đóng)
  const pressedOnBackdrop = useRef(false);

  const [selectedId, setSelectedId] = useState(FLOWER_ENTRIES[0].def.id);
  const [step, setStep] = useState<Step>("choose");
  const [sowPhase, setSowPhase] = useState<SowPhase>("fading");
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [errors, setErrors] = useState<WishErrors>({});
  const [reply, setReply] = useState("");
  // Lời chúc vừa gửi, để hiện mẩu giấy xem trước ở bước hoàn thành
  const [sent, setSent] = useState<{
    name: string;
    message: string;
  } | null>(null);

  const entry =
    FLOWER_ENTRIES.find((item) => item.def.id === selectedId) ??
    FLOWER_ENTRIES[0];

  // <dialog> gốc: tự khóa tiêu điểm trong hộp thoại, đóng bằng Escape, nền phía sau không bấm được
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => (open ? lockScroll() : undefined), [open]);

  useEffect(() => () => window.clearTimeout(sowTimer.current), []);

  // Đổi bước thì đưa tiêu điểm vào thân hộp thoại để người dùng bàn phím và trình đọc màn hình theo kịp
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    bodyRef.current?.focus({ preventScroll: true });
  }, [step]);

  const reset = () => {
    window.clearTimeout(sowTimer.current);
    setMessage("");
    setErrors({});
    setStep("choose");
  };

  // Đóng giữa chừng: đang gieo/mọc hoặc đã xong thì lần mở sau bắt đầu lại; đang viết dở thì giữ nguyên lời viết
  const handleClose = () => {
    gardenOverlay.close();
    if (
      step === "sowing" ||
      step === "growing" ||
      step === "blooming" ||
      step === "done"
    )
      reset();
  };

  const sow = () => {
    if (step !== "choose") return;
    setErrors({});
    setSowPhase("fading");
    setStep("sowing");
    window.clearTimeout(sowTimer.current);
    sowTimer.current = window.setTimeout(
      () => setSowPhase("dropping"),
      prefersReducedMotion() ? 0 : FADE_MS,
    );
  };

  const handleLanded = useCallback(() => {
    setStep((current) => (current === "sowing" ? "growing" : current));
  }, []);

  const handleGrown = useCallback(() => {
    setStep((current) =>
      current === "growing"
        ? prefersReducedMotion()
          ? "writing"
          : "blooming"
        : current,
    );
    setMessage(pickRandom(entry.wish.wishes));
    setPlaceholder(pickRandom(entry.wish.prompts));
  }, [entry]);

  const handleGlowComplete = useCallback(() => {
    setStep((current) => (current === "blooming" ? "writing" : current));
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateWish({ name, message }, garden.errors);
    setErrors(found);
    if (found.name) return void document.getElementById(id("name"))?.focus();
    if (found.message)
      return void document.getElementById(id("message"))?.focus();

    const wish = {
      name: name.trim(),
      message: message.trim(),
      flower: entry.def.id,
      ink: DEFAULT_INK,
    };
    submitWish(wish);
    addOwnWish(wish);
    setSent({ name: wish.name, message: wish.message });
    setReply(pickRandom(entry.wish.replies));
    setStep("done");
  };

  const seeWishes = () => {
    gardenOverlay.close();
    // Chờ hộp thoại đóng xong và nhả khóa cuộn rồi mới cuộn
    window.setTimeout(scrollToWishes, 80);
  };

  const bloomMode: BloomMode =
    step === "choose"
      ? "idle"
      : step === "sowing"
        ? sowPhase === "fading"
          ? "idle"
          : "bare"
        : step === "growing"
          ? "growing"
          : "bloomed";

  const title =
    step === "choose"
      ? garden.chooseTitle
      : step === "writing"
        ? garden.writeTitle
        : step === "done"
          ? garden.doneTitle
          : garden.title;

  return (
    <dialog
      ref={dialogRef}
      className="gov"
      aria-label={title}
      onClose={handleClose}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedOnBackdrop.current && event.target === event.currentTarget)
          handleClose();
        pressedOnBackdrop.current = false;
      }}
    >
      <div className="gov__panel" data-step={step}>
        <header className="gov__head">
          {/* <h2 className="gov__title" id={id("title")}>
            {title}
          </h2> */}
          <button
            type="button"
            className="gov__close"
            onClick={handleClose}
            aria-label={garden.close}
          >
            <CloseIcon />
          </button>
        </header>

        <div
          className={`gov__stage${step === "sowing" && sowPhase === "fading" ? " is-fading" : ""}`}
        >
          <BloomPlayer
            flower={entry.def}
            mode={bloomMode}
            onGrown={handleGrown}
            onGlowComplete={handleGlowComplete}
            skipLabel={garden.skipGrowing}
          >
            {step === "sowing" && sowPhase === "dropping" && (
              <SowSeedDrop run onLanded={handleLanded} />
            )}
          </BloomPlayer>
        </div>

        <div
          className="gov__body"
          ref={bodyRef}
          tabIndex={-1}
          role="region"
          aria-label={title}
        >
          {step === "choose" && (
            <>
              <p className="gov__flower-name">{entry.wish.name}</p>
              <p className="gov__flower-theme">{entry.wish.theme}</p>
              <div
                className="gov__carousel"
                role="radiogroup"
                aria-label={garden.carouselLabel}
              >
                {FLOWER_ENTRIES.map((item) => (
                  <label className="gov__card" key={item.def.id}>
                    <input
                      type="radio"
                      name={id("flower")}
                      className="sr-only"
                      checked={item.def.id === selectedId}
                      onChange={(event) => {
                        setSelectedId(item.def.id);
                        // Chọn bằng bàn phím: cuộn thẻ vừa chọn vào giữa danh sách
                        event.currentTarget.closest("label")?.scrollIntoView({
                          inline: "center",
                          block: "nearest",
                        });
                      }}
                    />
                    <span className="gov__card-icon">
                      <FlowerArt id={item.def.id} seed={item.def.id} sizes="96px" />
                    </span>
                    <span className="gov__card-name">{item.wish.name}</span>
                  </label>
                ))}
              </div>
              <SowHoldButton
                label={garden.hold}
                hint={garden.holdHint}
                keyboardLabel={garden.holdKeyboard}
                onComplete={sow}
              />
            </>
          )}

          {step === "sowing" && (
            <p className="gov__status" role="status">
              {garden.sowing}
            </p>
          )}

          {/* {(step === "growing" || step === "blooming") && (
            <p className="gov__status" role="status">
              {garden.growing}
            </p>
          )} */}

          {step === "writing" && (
            <form onSubmit={onSubmit} noValidate>
              <p className="gov__flower-message">" {entry.wish.message} "</p>

              <div className="gov__field-row">
                <label htmlFor={id("name")}>{garden.nameLabel}</label>
                <input
                  id={id("name")}
                  type="text"
                  value={name}
                  autoComplete="name"
                  maxLength={NAME_MAX * 2}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? id("name-error") : undefined}
                  onChange={(event) => {
                    setName(event.target.value);
                    setErrors((current) => ({ ...current, name: undefined }));
                  }}
                />
                {errors.name && (
                  <p id={id("name-error")} className="gov__error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="gov__field-row">
                <label htmlFor={id("message")}>{garden.messageLabel}</label>
                <textarea
                  id={id("message")}
                  rows={5}
                  value={message}
                  placeholder={placeholder}
                  maxLength={MESSAGE_MAX}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={
                    errors.message ? id("message-error") : undefined
                  }
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      message: undefined,
                    }));
                  }}
                />
                {errors.message && (
                  <p
                    id={id("message-error")}
                    className="gov__error"
                    role="alert"
                  >
                    {errors.message}
                  </p>
                )}
                <button type="button" className="gov__link" onClick={reset}>
                  {garden.suggestAnother}
                </button>
              </div>


              <button type="submit" className="gov__button">
                {garden.send}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="gov__done" role="status">
              <p className="gov__reply">{reply}</p>
              {sent && (
                <figure
                  className="gov__note"
                >
                  <span className="gov__note-flower">
                    <FlowerArt id={entry.def.id} seed={entry.def.id} sizes="120px" />
                  </span>
                  <figcaption className="gov__note-name">
                    {sent.name}
                  </figcaption>
                  <p className="gov__note-text">{sent.message}</p>
                </figure>
              )}
              <p className="gov__note-caption">{garden.noteCaption}</p>
              <div className="gov__actions">
                <button type="button" className="gov__button" onClick={seeWishes}>
                  {garden.seeWishes}
                </button>
                <button
                  type="button"
                  className="gov__button gov__button--ghost"
                  onClick={reset}
                >
                  {garden.plantAnother}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
