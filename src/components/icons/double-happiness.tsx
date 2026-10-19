import type { SVGProps } from "react"

const PETALS = Array.from({ length: 20 }, (_, i) => i * 18)

/**
 * Huy hiệu song hỷ: viền hoa văn tròn và chữ 囍 ở giữa (vẽ bằng font chữ Hán của hệ thống,
 * hầu hết thiết bị đều có sẵn). Trang trí nên ẩn khỏi trình đọc màn hình.
 */
export function DoubleHappiness(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <g fill="var(--wine)">
        {PETALS.map((angle) => (
          <circle key={angle} cx="50" cy="6.5" r="4" transform={`rotate(${angle} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--wine)" strokeWidth="2" />
      <circle cx="50" cy="50" r="34" fill="var(--paper)" stroke="var(--rose)" strokeWidth="5" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="var(--wine)" strokeWidth="1.2" strokeDasharray="2 3" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="38"
        fontWeight="700"
        fill="var(--wine)"
        fontFamily='"PingFang TC","Noto Serif CJK TC","Noto Sans CJK TC","Microsoft JhengHei","Hiragino Sans GB",serif'
      >
        囍
      </text>
    </svg>
  )
}
