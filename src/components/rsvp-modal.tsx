import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { weddingConfig } from "../config/wedding-config";
import { getGuestName, getNamedGuest } from "../lib/guest";
import { lockScroll } from "../lib/scroll-lock";
import {
  validateRsvp,
  GUESTS_MAX,
  NAME_MAX,
  NOTE_MAX,
  type RsvpErrors,
  type RsvpField,
  type RsvpValues,
} from "../lib/rsvp-validation";
import { useToast } from "../lib/toast-context";
import { submitRsvp } from "../lib/wishes-api";
import { CloseIcon } from "./icons/ui-icons";
import "./rsvp-modal.css";

interface RsvpModalProps {
  open: boolean;
  onClose: () => void;
}

/** Form mới; link có tên khách (?to=) thì điền sẵn ô tên, khách vẫn sửa được */
const emptyValues = (): RsvpValues => ({
  name: getNamedGuest(weddingConfig.guestParam),
  attending: "",
  guests: "1",
  transport: "",
  note: "",
});
const GUEST_OPTIONS = Array.from({ length: GUESTS_MAX }, (_, i) => i + 1);

/** Phần chỉ hiện theo lựa chọn trước đó: co giãn chiều cao mượt thay vì làm hộp thoại nhảy; ẩn thì không focus/đọc được */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className="rsvp-modal__collapse" data-open={open} inert={!open}>
      <div className="rsvp-modal__collapse-inner">{children}</div>
    </div>
  );
}

export function RsvpModal({ open, onClose }: RsvpModalProps) {
  const { rsvp, guestParam, hero } = weddingConfig;
  const text = rsvp.form;
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Chỉ coi là bấm ra ngoài khi cả nhấn xuống và nhả ra đều ở vùng nền (kéo bôi đen từ ô nhập ra ngoài không được đóng form)
  const pressedOnBackdrop = useRef(false);
  const toast = useToast();
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;
  const nameFieldId = id("name");

  const [values, setValues] = useState<RsvpValues>(emptyValues);
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<RsvpErrors>({});

  // Mở/đóng bằng <dialog> gốc: tự khóa tiêu điểm trong hộp thoại, đóng bằng Escape, nền phía sau không bấm được
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.getElementById(nameFieldId)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, nameFieldId]);

  useEffect(() => (open ? lockScroll() : undefined), [open]);

  const update = <K extends keyof RsvpValues>(key: K, value: RsvpValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validateRsvp(values, text.errors);
    setErrors(found);
    const firstInvalid = (
      ["name", "attending", "guests", "transport", "note"] as RsvpField[]
    ).find((field) => found[field]);
    if (firstInvalid) {
      document
        .getElementById(
          id(
            firstInvalid === "attending"
              ? "attending-yes"
              : firstInvalid === "transport"
                ? "transport-own"
                : firstInvalid,
          ),
        )
        ?.focus();
      return;
    }

    // Gửi ngầm lên Sheet (có hàng đợi tự gửi lại): đóng form ngay, cảm ơn bằng thông báo ngắn, lần mở sau là form mới
    const declined = values.attending === "no";
    submitRsvp({
      name: values.name.trim(),
      attending: declined ? "no" : "yes",
      // Từ chối thì không ghi số người đi cùng và phương tiện
      guests: declined ? 0 : Number(values.guests),
      transport: declined ? "" : values.transport,
      note: values.note.trim(),
      guest: getGuestName(guestParam, hero.guestFallback),
      website: trap,
    });
    toast(declined ? text.thanksNo : text.thanksYes);
    setValues(emptyValues());
    setTrap("");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="rsvp-modal"
      aria-labelledby={id("title")}
      onClose={onClose}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedOnBackdrop.current && event.target === event.currentTarget)
          onClose();
        pressedOnBackdrop.current = false;
      }}
    >
      <div className="rsvp-modal__panel">
        <button
          type="button"
          className="rsvp-modal__close"
          onClick={onClose}
          aria-label={text.close}
        >
          <CloseIcon />
        </button>

        <form className="rsvp-modal__form" onSubmit={onSubmit} noValidate>
          <header className="rsvp-modal__header">
            <h2 id={id("title")} className="rsvp-modal__title">
              {text.title}
            </h2>
          </header>

          <div className="rsvp-modal__body">
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
                <p
                  id={id("name-error")}
                  className="rsvp-modal__error"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <fieldset
              className="rsvp-modal__field rsvp-modal__choices"
              aria-describedby={
                errors.attending ? id("attending-error") : undefined
              }
            >
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
                <p
                  id={id("attending-error")}
                  className="rsvp-modal__error"
                  role="alert"
                >
                  {errors.attending}
                </p>
              )}
            </fieldset>

            <Collapse open={values.attending !== "no"}>
              <div className="rsvp-modal__field">
                <label htmlFor={id("guests")}>{text.guestsLabel}</label>
                <select
                  id={id("guests")}
                  value={values.guests}
                  aria-invalid={errors.guests ? true : undefined}
                  aria-describedby={
                    errors.guests ? id("guests-error") : undefined
                  }
                  onChange={(event) => update("guests", event.target.value)}
                >
                  {GUEST_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                {errors.guests && (
                  <p
                    id={id("guests-error")}
                    className="rsvp-modal__error"
                    role="alert"
                  >
                    {errors.guests}
                  </p>
                )}
              </div>
              <fieldset
                className="rsvp-modal__field rsvp-modal__choices"
                aria-describedby={
                  errors.transport ? id("transport-error") : undefined
                }
              >
                <legend>{text.transportLabel}</legend>
                <label className="rsvp-modal__choice">
                  <input
                    id={id("transport-own")}
                    type="radio"
                    name={id("transport")}
                    checked={values.transport === "own"}
                    onChange={() => update("transport", "own")}
                  />
                  <span>{text.transportOwn}</span>
                </label>
                <label className="rsvp-modal__choice">
                  <input
                    id={id("transport-shared")}
                    type="radio"
                    name={id("transport")}
                    checked={values.transport === "shared"}
                    onChange={() => update("transport", "shared")}
                  />
                  <span>{text.transportShared}</span>
                </label>
                {errors.transport && (
                  <p
                    id={id("transport-error")}
                    className="rsvp-modal__error"
                    role="alert"
                  >
                    {errors.transport}
                  </p>
                )}
              </fieldset>
            </Collapse>

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
                <p
                  id={id("note-error")}
                  className="rsvp-modal__error"
                  role="alert"
                >
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
          </div>

          <div className="rsvp-modal__footer">
            <button type="submit" className="rsvp-modal__submit">
              {text.submit}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
