import type { SVGProps } from "react"

/** Dấu sáp niêm phong: viền lượn sóng màu đồng và nhành lá dập nổi ở giữa (trang trí). */
export function WaxSeal(props: SVGProps<SVGSVGElement>) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2
    const radius = i % 2 === 0 ? 47 : 43
    return `${(50 + Math.cos(angle) * radius).toFixed(2)},${(50 + Math.sin(angle) * radius).toFixed(2)}`
  }).join(" ")

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <polygon points={points} fill="var(--seal)" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <g fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 72V34" />
        <path d="M50 62c-8 0-12-5-12-11 7 0 12 4 12 11z" />
        <path d="M50 54c8 0 12-5 12-11-7 0-12 4-12 11z" />
        <path d="M50 46c-6 0-9-4-9-8 5 0 9 3 9 8z" />
        <path d="M50 38c5 0 8-3 8-7-4 0-8 3-8 7z" />
      </g>
    </svg>
  )
}
