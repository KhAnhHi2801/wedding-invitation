import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

/** Icon trang trí (aria-hidden), tô màu bằng `currentColor`. */
const base = { "aria-hidden": true, focusable: false, fill: "none", viewBox: "0 0 64 64" } as const
const line = { stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const

export const HeartIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 24 24" {...props}>
    <path
      d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.3 3.2 5 6.4 5c2 0 3.6 1.1 5.6 3.2C14 6.1 15.6 5 17.6 5c3.2 0 5.2 3.3 3.9 6.8C19.5 16.4 12 21 12 21z"
      fill="currentColor"
    />
  </svg>
)

/*
 * Ba hình minh họa màu của timeline (xe hoa, hai tay ôm tim, hai ly sâm panh), tự vẽ lại theo bố cục của trang mẫu.
 * Dùng màu cố định (không theo currentColor) vì là tranh trang trí, không phải icon giao diện.
 */
const art = { "aria-hidden": true, focusable: false, viewBox: "0 0 64 40" } as const

export const CarIcon = (props: IconProps) => (
  <svg {...art} {...props}>
    <path d="M4 27c0-4 2-7 6-8l12-2 8-8h14l6 9 6 1c4 1 6 3 6 8v4H4z" fill="#f2a3b6" />
    <path d="M31 10l-6 7h16l-4-7z" fill="#fbdde4" />
    <path d="M4 31h56v2H4z" fill="#e58aa0" />
    <circle cx="18" cy="33" r="6" fill="#5b4a4a" />
    <circle cx="18" cy="33" r="2.4" fill="#fff" />
    <circle cx="48" cy="33" r="6" fill="#5b4a4a" />
    <circle cx="48" cy="33" r="2.4" fill="#fff" />
    <circle cx="60" cy="25" r="2" fill="#f7d56a" />
  </svg>
)

export const CameraIcon = (props: IconProps) => (
  <svg {...art} {...props}>
    <path d="M3 31c2-9 11-15 19-13l9 4-4 11-17 5z" fill="#f7cfae" stroke="#e8ad84" strokeWidth="1" />
    <path d="M61 31c-2-9-11-15-19-13l-9 4 4 11 17 5z" fill="#f7cfae" stroke="#e8ad84" strokeWidth="1" />
    <path d="M32 27C23 21 20 17 20 13a6.5 6.5 0 0 1 12-3 6.5 6.5 0 0 1 12 3c0 4-3 8-12 14z" fill="#ef5f7f" />
  </svg>
)

export const ToastIcon = (props: IconProps) => (
  <svg {...art} {...props}>
    <path d="M11 3h13l-2 14a4.5 4.5 0 0 1-9 0z" fill="#fbd6b0" stroke="#e8ad84" strokeWidth="1" />
    <path d="M17.5 21v13M11.5 36h12" stroke="#e8ad84" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M40 3h13l-2 14a4.5 4.5 0 0 1-9 0z" fill="#fbd6b0" stroke="#e8ad84" strokeWidth="1" />
    <path d="M46.5 21v13M40.5 36h12" stroke="#e8ad84" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M17.5 26l-4-2v5zM17.5 26l4-2v5z" fill="#7fb3e6" />
    <path d="M46.5 26l-4-2v5zM46.5 26l4-2v5z" fill="#f08ca4" />
  </svg>
)

export const ChairIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M22 8h20l2 24H20zM18 32h28M22 32v22M42 32v22M20 44h24" />
  </svg>
)
