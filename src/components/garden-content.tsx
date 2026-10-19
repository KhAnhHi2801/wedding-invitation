import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react"
import { weddingConfig } from "../config/wedding-config"
import { BloomPlayer, type BloomMode } from "../features/flower-bloom/BloomPlayer"
import { FlowerMiniPreview } from "../features/flower-bloom/FlowerMiniPreview"
import { FLOWER_ENTRIES } from "../lib/flower-entries"
import { getGuestName } from "../lib/guest"
import { addOwnWish, loadWishes, useWishes } from "../lib/wishes-store"
import { submitWish } from "../lib/wishes-api"
import { INKS } from "../lib/wish-style"
import { validateWish, MESSAGE_MAX, NAME_MAX, type WishErrors } from "../lib/wish-validation"
import { GardenField } from "./garden-field"

type Step = "choose" | "growing" | "writing" | "done"

const pickRandom = <T,>(items: readonly T[], not?: T): T => {
  const pool = items.length > 1 && not !== undefined ? items.filter((item) => item !== not) : items
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Tên khách có sẵn trong link mời (`?to=`) thì điền sẵn vào ô tên; không có thì để trống. */
function initialName(): string {
  const { guestParam, hero } = weddingConfig
  const guest = getGuestName(guestParam, "")
  return guest === hero.guestFallback ? "" : guest
}

/**
 * Mini-game gieo một lời chúc: chọn loài hoa, gieo hạt xem hoa mọc, viết lời chúc, hoa nở trong khu vườn chung.
 * Lời chúc gửi ngầm lên Google Sheet (hàng đợi + thử lại), hoa của khách hiện ngay không chờ máy chủ.
 */
export default function GardenContent() {
  const { garden, guestbook } = weddingConfig
  const uid = useId()
  const id = (suffix: string) => `${uid}-${suffix}`

  const { wishes } = useWishes()
  const [selectedId, setSelectedId] = useState(FLOWER_ENTRIES[0].def.id)
  const [step, setStep] = useState<Step>("choose")
  const [name, setName] = useState(initialName)
  const [message, setMessage] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [ink, setInk] = useState(INKS[0].key)
  const [errors, setErrors] = useState<WishErrors>({})
  const [reply, setReply] = useState("")
  const [sentOwn, setSentOwn] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  const entry = FLOWER_ENTRIES.find((item) => item.def.id === selectedId) ?? FLOWER_ENTRIES[0]

  useEffect(() => {
    void loadWishes()
  }, [])

  // Đổi bước thì đưa tiêu điểm vào bảng điều khiển để người dùng bàn phím và trình đọc màn hình theo kịp
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    panelRef.current?.focus({ preventScroll: true })
  }, [step])

  const handleGrown = useCallback(() => {
    setStep((current) => (current === "growing" ? "writing" : current))
    setMessage(pickRandom(entry.wish.wishes))
    setPlaceholder(pickRandom(entry.wish.prompts))
  }, [entry])

  const sow = () => {
    setErrors({})
    setStep("growing")
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const found = validateWish({ name, message }, garden.errors)
    setErrors(found)
    if (found.name) return void document.getElementById(id("name"))?.focus()
    if (found.message) return void document.getElementById(id("message"))?.focus()

    const wish = { name: name.trim(), message: message.trim(), flower: entry.def.id, ink }
    submitWish(wish)
    addOwnWish(wish)
    setSentOwn(true)
    setReply(pickRandom(entry.wish.replies))
    setStep("done")
  }

  const plantAnother = () => {
    setMessage("")
    setStep("choose")
  }

  const mode: BloomMode = step === "choose" ? "idle" : step === "growing" ? "growing" : "bloomed"

  return (
    <div className="container garden__inner">
      <header className="garden__head">
        <p className="garden__eyebrow label">{garden.eyebrow}</p>
        <h2 className="garden__title">{garden.title}</h2>
        <p className="garden__subtitle">{garden.subtitle}</p>
      </header>

      <div className="garden__stage">
        <div className="garden__showcase">
          <BloomPlayer flower={entry.def} mode={mode} onGrown={handleGrown} skipLabel={garden.skip} />
          <p className="garden__flower-name">{entry.wish.name}</p>
          <p className="garden__flower-theme">{entry.wish.theme}</p>
          {step !== "choose" && <p className="garden__flower-message">{entry.wish.message}</p>}
        </div>

        <div className="garden__panel" ref={panelRef} tabIndex={-1}>
          {step === "choose" && (
            <>
              <div className="garden__carousel" role="radiogroup" aria-label={garden.carouselLabel}>
                {FLOWER_ENTRIES.map((item) => (
                  <label className="garden__card" key={item.def.id}>
                    <input
                      type="radio"
                      name={id("flower")}
                      className="sr-only"
                      checked={item.def.id === selectedId}
                      onChange={() => setSelectedId(item.def.id)}
                    />
                    <span className="garden__card-icon">
                      <FlowerMiniPreview flower={item.def} />
                    </span>
                    <span className="garden__card-name">{item.wish.name}</span>
                  </label>
                ))}
              </div>
              <button type="button" className="garden__button" onClick={sow}>
                {garden.plant}
              </button>
            </>
          )}

          {step === "growing" && (
            <p className="garden__status" role="status">
              {garden.growing}
            </p>
          )}

          {step === "writing" && (
            <form onSubmit={onSubmit} noValidate>
              <h3 className="garden__panel-title">{garden.writeTitle}</h3>

              <div className="garden__field-row">
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
                    setName(event.target.value)
                    setErrors((current) => ({ ...current, name: undefined }))
                  }}
                />
                {errors.name && (
                  <p id={id("name-error")} className="garden__error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="garden__field-row">
                <label htmlFor={id("message")}>{garden.messageLabel}</label>
                <textarea
                  id={id("message")}
                  rows={5}
                  value={message}
                  placeholder={placeholder}
                  maxLength={MESSAGE_MAX}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? id("message-error") : undefined}
                  onChange={(event) => {
                    setMessage(event.target.value)
                    setErrors((current) => ({ ...current, message: undefined }))
                  }}
                />
                {errors.message && (
                  <p id={id("message-error")} className="garden__error" role="alert">
                    {errors.message}
                  </p>
                )}
                <button
                  type="button"
                  className="garden__link"
                  onClick={() => setMessage((current) => pickRandom(entry.wish.wishes, current))}
                >
                  {garden.suggestAnother}
                </button>
              </div>

              <fieldset className="garden__inks">
                <legend>{garden.inkLabel}</legend>
                {INKS.map((item) => (
                  <label key={item.key} className="garden__ink" title={item.label}>
                    <input
                      type="radio"
                      name={id("ink")}
                      className="sr-only"
                      checked={ink === item.key}
                      onChange={() => setInk(item.key)}
                    />
                    <span className="garden__ink-dot" style={{ backgroundColor: item.color }} />
                    <span className="sr-only">{item.label}</span>
                  </label>
                ))}
              </fieldset>

              <button type="submit" className="garden__button">
                {garden.send}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="garden__done" role="status">
              <h3 className="garden__panel-title">{garden.doneTitle}</h3>
              <p className="garden__reply">{reply}</p>
              <div className="garden__actions">
                <button type="button" className="garden__button" onClick={plantAnother}>
                  {garden.plantAnother}
                </button>
                <a className="garden__button garden__button--ghost" href="#guestbook">
                  {guestbook.label}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="garden__community" aria-labelledby={id("community")}>
        <h3 className="garden__community-title" id={id("community")}>
          {garden.gardenTitle}
        </h3>
        <GardenField wishes={wishes} highlightOwn={sentOwn} />
      </section>
    </div>
  )
}
