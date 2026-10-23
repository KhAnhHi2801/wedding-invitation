import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

/** Icon giao diện 24x24 nét mảnh, màu theo `currentColor` (trang trí, luôn kèm nhãn văn bản hoặc aria-label ở nút). */
const base = { "aria-hidden": true, focusable: false, fill: "none", viewBox: "0 0 24 24" } as const
const line = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const

export const ChatIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M4 5h16v11H9l-5 4z" />
    <path {...line} d="M8 9.5h8M8 12.5h5" />
  </svg>
)

export const GiftIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M4 9h16v4H4zM5 13h14v7H5zM12 9v11" />
    <path {...line} d="M12 9c-1.5-4-5-4-5-1.6C7 9 12 9 12 9zM12 9c1.5-4 5-4 5-1.6C17 9 12 9 12 9z" />
  </svg>
)

export const MusicOnIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M9 17V6l10-2v11" />
    <circle {...line} cx="6.5" cy="17.5" r="2.5" />
    <circle {...line} cx="16.5" cy="15.5" r="2.5" />
  </svg>
)

export const MusicOffIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M9 17V6l10-2v11" />
    <circle {...line} cx="6.5" cy="17.5" r="2.5" />
    <circle {...line} cx="16.5" cy="15.5" r="2.5" />
    <path {...line} d="M3 3l18 18" />
  </svg>
)

export const CloseIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const CopyIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect {...line} x="9" y="9" width="11" height="11" rx="2" />
    <path {...line} d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M14.5 6l-6 6 6 6" />
  </svg>
)

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M9.5 6l6 6-6 6" />
  </svg>
)

/** Mũi tên xuống: tự cuộn trang đang tắt */
export const ScrollIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M12 4v13M6.5 12L12 17.5 17.5 12" />
    <path {...line} d="M7 21h10" />
  </svg>
)

/** Tạm dừng: tự cuộn trang đang chạy */
export const ScrollPauseIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path {...line} d="M9 5v14M15 5v14" />
  </svg>
)
