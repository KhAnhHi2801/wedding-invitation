import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react"
import "./sow-hold-button.css"

/** Thời gian phải giữ ngón tay để hạt được gieo (ms). Đủ lâu để là một hành động có chủ ý, đủ ngắn để không sốt ruột. */
const HOLD_MS = 700

interface SowHoldButtonProps {
  label: string
  hint: string
  /** Nhãn cho người dùng bàn phím/trình đọc màn hình: họ gieo ngay bằng một lần bấm, không cần giữ */
  keyboardLabel: string
  onComplete: () => void
}

/**
 * Nút "chạm giữ để gieo": vòng sáng đầy dần trong HOLD_MS, đầy thì gieo hạt; nhả sớm thì vòng lùi về.
 * Bàn phím và trình đọc màn hình không giữ được ngón tay nên một lần bấm (click không có con trỏ) gieo ngay.
 */
export function SowHoldButton({ label, hint, keyboardLabel, onComplete }: SowHoldButtonProps) {
  const [holding, setHolding] = useState(false)
  const timer = useRef(0)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const start = (event: PointerEvent<HTMLButtonElement>) => {
    // Chuột chỉ nhận nút trái
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setHolding(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setHolding(false)
      // Rung nhẹ khi hạt được gieo (nơi nào hỗ trợ)
      navigator.vibrate?.(12)
      completeRef.current()
    }, HOLD_MS)
  }

  const cancel = () => {
    window.clearTimeout(timer.current)
    setHolding(false)
  }

  // detail === 0: click sinh ra từ bàn phím (Enter/Space) hoặc trình đọc màn hình, không phải chạm
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) completeRef.current()
  }

  return (
    <div className="sow-hold">
      <button
        type="button"
        className={`sow-hold__button${holding ? " is-holding" : ""}`}
        aria-label={keyboardLabel}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onContextMenu={(event) => event.preventDefault()}
        onClick={onClick}
      >
        <svg className="sow-hold__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="sow-hold__track" cx="50" cy="50" r="44" />
          <circle className="sow-hold__fill" cx="50" cy="50" r="44" />
        </svg>
        <svg className="sow-hold__seed" viewBox="-12 -14 24 28" aria-hidden="true">
          <ellipse cx="0" cy="0" rx="7" ry="9.5" fill="#4E3626" stroke="#6B4B35" strokeWidth="1.2" transform="rotate(-15)" />
          <path d="M -1 -7 C 2 -2, 2 3, 0 7" stroke="#8A674D" strokeWidth="1" fill="none" />
          <circle cx="-2" cy="-3" r="1.5" fill="#C49B76" opacity="0.6" />
        </svg>
      </button>
      <p className="sow-hold__label" aria-hidden="true">
        {label}
      </p>
      <p className="sow-hold__hint" aria-hidden="true">
        {hint}
      </p>
    </div>
  )
}
