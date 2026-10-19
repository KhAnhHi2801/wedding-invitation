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

export const CarIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M8 40V32l6-12h30l8 12v8" />
    <path {...line} d="M6 40h52M14 20l-4 12M44 20l4 12M12 32h40" />
    <circle {...line} cx="18" cy="44" r="5" />
    <circle {...line} cx="46" cy="44" r="5" />
    <path {...line} d="M24 12c4-4 12-4 16 0" />
  </svg>
)

export const CameraIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M10 22h10l4-7h16l4 7h10v28H10z" />
    <circle {...line} cx="32" cy="36" r="9" />
    <circle {...line} cx="32" cy="36" r="3.5" />
    <path {...line} d="M46 28h4" />
  </svg>
)

export const ToastIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M12 10h18l-2 16a7 7 0 0 1-14 0zM21 33v18M15 51h12" />
    <path {...line} d="M34 10h18l-2 16a7 7 0 0 1-14 0zM43 33v18M37 51h12" />
    <path {...line} d="M30 5l-2 4M34 5l2 4M32 3v5" />
  </svg>
)

export const ChairIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M22 8h20l2 24H20zM18 32h28M22 32v22M42 32v22M20 44h24" />
  </svg>
)
