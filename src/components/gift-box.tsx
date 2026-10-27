import { useId } from "react"
import { DoubleHappiness } from "./icons/double-happiness"

/** closed: phong bì ló ra một chút ở khe; open: phong bì nhô cao; drop: phong bì trượt hẳn vào hòm, cánh hoa bung ra */
export type GiftBoxState = "closed" | "open" | "drop"

const PETALS = [
  { dx: "-3.2rem", dy: "-3.6rem", turn: "-140deg" },
  { dx: "3.4rem", dy: "-3.2rem", turn: "150deg" },
  { dx: "-4.4rem", dy: "-1.2rem", turn: "-90deg" },
  { dx: "4.6rem", dy: "-1.4rem", turn: "110deg" },
  { dx: "-1.6rem", dy: "-4.6rem", turn: "-60deg" },
  { dx: "1.8rem", dy: "-4.8rem", turn: "70deg" },
]

interface GiftBoxProps {
  state: GiftBoxState
  className?: string
}

/**
 * Hộp mừng cưới hồng phấn có khe bỏ phong bì và huy hiệu song hỷ trên dải ruy băng đỏ. Phong bì đỏ chỉ hiện phần phía
 * trên khe (cắt bằng clipPath) nên "chui" vào hộp khi hạ xuống. Chuyển động do CSS điều khiển qua `data-state` (gift.css).
 * Ảnh trang trí: ẩn khỏi trình đọc màn hình.
 */
export function GiftBox({ state, className }: GiftBoxProps) {
  // useId có dấu ":" không dùng được trong url(#...)
  const clipId = `gbox-clip-${useId().replace(/:/g, "")}`
  return (
    <div className={className ? `gbox ${className}` : "gbox"} data-state={state} aria-hidden="true">
      <svg viewBox="0 0 120 120" focusable="false">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="120" height="52" />
          </clipPath>
        </defs>
        <ellipse cx="60" cy="113" rx="44" ry="5" fill="color-mix(in srgb, var(--wine) 16%, transparent)" />

        {/* Mặt trước hộp và dải ruy băng */}
        <rect x="12" y="56" width="96" height="54" rx="7" fill="#f4d6d8" stroke="var(--champagne)" strokeWidth="1.5" />
        <rect x="52" y="56" width="16" height="54" fill="var(--wine)" opacity="0.92" />
        <path d="M12 76h96" stroke="var(--champagne)" strokeWidth="1" opacity="0.7" />

        {/* Mặt trên có khe */}
        <path d="M24 44h72l12 12H12z" fill="#eec4c8" stroke="var(--champagne)" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="32" y="49" width="56" height="5" rx="2.5" fill="#5b2a2b" />

        {/* Phong bì ló ra khỏi khe, cắt phần nằm dưới khe */}
        <g clipPath={`url(#${clipId})`}>
          <g className="gbox__envelope">
            <rect x="38" y="14" width="44" height="34" rx="3" fill="var(--envelope)" stroke="var(--envelope-flap)" strokeWidth="1" />
            <path d="M38 17l22 16 22-16" fill="none" stroke="var(--envelope-light)" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="60" cy="33" r="5.5" fill="var(--champagne)" />
            <path d="M60 36c-3-2-3.6-3.6-2.2-4.6 1-.7 1.9-.2 2.2.5.3-.7 1.2-1.2 2.2-.5 1.400 1 .8 2.600-2.200 4.600z" fill="var(--wine)" />
          </g>
        </g>

        {/* Huy hiệu song hỷ trên dải ruy băng */}
        <DoubleHappiness x="45" y="72" width="30" height="30" />
      </svg>
      <span className="gbox__petals">
        {PETALS.map((petal, i) => (
          <svg
            key={i}
            className="gbox__petal"
            viewBox="0 0 24 24"
            style={{ "--dx": petal.dx, "--dy": petal.dy, "--turn": petal.turn } as React.CSSProperties}
          >
            <path d="M12 2c4.500 3.800 7 8 7 12a7 7 0 0 1-14 0c0-4 2.500-8.200 7-12z" fill="var(--pink-soft)" />
          </svg>
        ))}
      </span>
    </div>
  )
}
