import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { weddingConfig } from "../config/wedding-config"
import { gardenOverlay } from "../lib/garden-overlay"
import { getGuestName, getNamedGuest } from "../lib/guest"
import { lockScroll } from "../lib/scroll-lock"
import { validateRsvp, GUESTS_MAX, NAME_MAX, NOTE_MAX, type RsvpErrors, type RsvpField, type RsvpValues } from "../lib/rsvp-validation"
import { ApiError, sendRsvp } from "../lib/wishes-api"
import { CloseIcon } from "./icons/ui-icons"
import "./rsvp-modal.css"

interface RsvpModalProps {
  open: boolean
  onClose: () => void
}

type Status = "idle" | "sending" | "done"

/** Form mới; link có tên khách (?to=) thì điền sẵn ô tên, khách vẫn sửa được */
const emptyValues = (): RsvpValues => ({
  name: getNamedGuest(weddingConfig.guestParam),
  attending: "",
  guests: "1",
  note: "",
})
const GUEST_OPTIONS = Array.from({ length: GUESTS_MAX }, (_, i) => i + 1)

export function RsvpModal({ open, onClose }: RsvpModalProps) {
  const { rsvp, guestParam, hero } = weddingConfig
  const text = rsvp.form
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // Chỉ coi là bấm ra ngoài khi cả nhấn xuống và nhả ra đều ở vùng nền (kéo bôi đen từ ô nhập ra ngoài không được đóng form)
  const pressedOnBackdrop = useRef(false)
  const uid = useId()
  const id = (field: string) => `${uid}-${field}`
  const nameFieldId = id("name")

  const [values, setValues] = useState<RsvpValues>(emptyValues)
  const [trap, setTrap] = useState("")
  const [errors, setErrors] = useState<RsvpErrors>({})
  const [serverError, setServerError] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  // Mở/đóng bằng <dialog> gốc: tự khóa tiêu điểm trong hộp thoại, đóng bằng Escape, nền phía sau không bấm được
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      document.getElementById(nameFieldId)?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, nameFieldId])

  useEffect(() => (open ? lockScroll() : undefined), [open])

  // Đóng sau khi đã gửi xong thì lần mở sau là một form mới
  const handleClose = () => {
    if (status === "done") {
      setValues(emptyValues())
      setStatus("idle")
    }
    onClose()
  }

  useEffect(() => {
    if (status === "done") closeRef.current?.focus()
  }, [status])

  const update = <K extends keyof RsvpValues>(key: K, value: RsvpValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const messageFor = (error: unknown): string => {
    if (!(error instanceof ApiError)) return text.errors.generic
    switch (error.code) {
      case "unavailable":
        return text.errors.unavailable
      case "offline":
        return text.errors.offline
      case "rate_limited":
        return text.errors.rateLimited
      case "too_fast":
        return text.errors.tooFast
      default:
        return text.errors.generic
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === "sending") return

    const found = validateRsvp(values, text.errors)
    setErrors(found)
    setServerError("")
    const firstInvalid = (["name", "attending", "guests", "note"] as RsvpField[]).find((field) => found[field])
    if (firstInvalid) {
      document.getElementById(id(firstInvalid === "attending" ? "attending-yes" : firstInvalid))?.focus()
      return
    }

    setStatus("sending")
    try {
      await sendRsvp({
        name: values.name.trim(),
        attending: values.attending === "no" ? "no" : "yes",
        // Từ chối thì không ghi số người đi cùng
        guests: values.attending === "no" ? 0 : Number(values.guests),
        note: values.note.trim(),
        guest: getGuestName(guestParam, hero.guestFallback),
        website: trap,
      })
      setStatus("done")
    } catch (error) {
      setStatus("idle")
      setServerError(messageFor(error))
    }
  }

  const sending = status === "sending"

  return (
    <dialog
      ref={dialogRef}
      className="rsvp-modal"
      aria-labelledby={id("title")}
      onClose={handleClose}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (pressedOnBackdrop.current && event.target === event.currentTarget) handleClose()
        pressedOnBackdrop.current = false
      }}
    >
      <div className="rsvp-modal__panel">
        <button ref={closeRef} type="button" className="rsvp-modal__close" onClick={handleClose} aria-label={text.close}>
          <CloseIcon />
        </button>

        {status === "done" ? (
          <div className="rsvp-modal__done" role="status">
            <h2 id={id("title")} className="rsvp-modal__title">
              {text.successTitle}
            </h2>
            <p>{values.attending === "no" ? text.successNo : text.successYes}</p>
            <p>{text.successWish}</p>
            <button
              type="button"
              className="rsvp-modal__submit"
              onClick={() => {
                handleClose()
                gardenOverlay.open()
              }}
            >
              {text.wishButton}
            </button>
            <button type="button" className="rsvp-modal__later" onClick={handleClose}>
              {text.close}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h2 id={id("title")} className="rsvp-modal__title">
              {text.title}
            </h2>

            <div className="rsvp-modal__field">
              <label htmlFor={id("name")}>{text.nameLabel}</label>
              <input
                id={id("name")}
                type="text"
                value={values.name}
                maxLength={NAME_MAX * 2}
                autoComplete="name"
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? id("name-error") : undefined}
                onChange={(event) => update("name", event.target.value)}
              />
              {errors.name && (
                <p id={id("name-error")} className="rsvp-modal__error" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <fieldset className="rsvp-modal__field rsvp-modal__choices" aria-describedby={errors.attending ? id("attending-error") : undefined}>
              <legend>{text.attendingLabel}</legend>
              <label className="rsvp-modal__choice">
                <input
                  id={id("attending-yes")}
                  type="radio"
                  name={id("attending")}
                  checked={values.attending === "yes"}
                  onChange={() => update("attending", "yes")}
                />
                <span>{text.yes}</span>
              </label>
              <label className="rsvp-modal__choice">
                <input
                  id={id("attending-no")}
                  type="radio"
                  name={id("attending")}
                  checked={values.attending === "no"}
                  onChange={() => update("attending", "no")}
                />
                <span>{text.no}</span>
              </label>
              {errors.attending && (
                <p id={id("attending-error")} className="rsvp-modal__error" role="alert">
                  {errors.attending}
                </p>
              )}
            </fieldset>

            {values.attending !== "no" && (
              <div className="rsvp-modal__field">
                <label htmlFor={id("guests")}>{text.guestsLabel}</label>
                <select
                  id={id("guests")}
                  value={values.guests}
                  aria-invalid={errors.guests ? true : undefined}
                  aria-describedby={errors.guests ? id("guests-error") : undefined}
                  onChange={(event) => update("guests", event.target.value)}
                >
                  {GUEST_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                {errors.guests && (
                  <p id={id("guests-error")} className="rsvp-modal__error" role="alert">
                    {errors.guests}
                  </p>
                )}
              </div>
            )}

            <div className="rsvp-modal__field">
              <label htmlFor={id("note")}>{text.noteLabel}</label>
              <textarea
                id={id("note")}
                rows={3}
                value={values.note}
                maxLength={NOTE_MAX * 2}
                aria-invalid={errors.note ? true : undefined}
                aria-describedby={errors.note ? id("note-error") : undefined}
                onChange={(event) => update("note", event.target.value)}
              />
              {errors.note && (
                <p id={id("note-error")} className="rsvp-modal__error" role="alert">
                  {errors.note}
                </p>
              )}
            </div>

            {/* Ô bẫy bot: người thật không thấy và không điền */}
            <input
              className="rsvp-modal__trap"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={trap}
              onChange={(event) => setTrap(event.target.value)}
            />

            {serverError && (
              <p className="rsvp-modal__error rsvp-modal__error--form" role="alert">
                {serverError}
              </p>
            )}

            <button type="submit" className="rsvp-modal__submit" disabled={sending}>
              {sending ? text.sending : text.submit}
            </button>
          </form>
        )}
      </div>
    </dialog>
  )
}
