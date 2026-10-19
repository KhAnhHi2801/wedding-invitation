import { memo, type CSSProperties } from "react"
import { weddingConfig } from "../config/wedding-config"
import { entryFor, hashText } from "../lib/flower-entries"
import type { PublicWish } from "../lib/wishes-api"
import { FlowerMiniPreview } from "../features/flower-bloom/FlowerMiniPreview"

/** Số hoa tối đa vẽ trong vườn: nhiều hơn chỉ làm nặng trang, các lời chúc còn lại đã có trong sổ lưu bút. */
const MAX_FLOWERS = 40

interface GardenFieldProps {
  wishes: readonly PublicWish[]
  /** Lời chúc vừa gửi (chưa có id) được nở ra với hiệu ứng */
  highlightOwn: boolean
}

const fill = (template: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template)

/**
 * Khu vườn chung: mỗi lời chúc là một bông hoa nhỏ (ảnh thu nhỏ SVG), vị trí lệch nhẹ cố định theo nội dung nên không
 * nhảy khi tải lại. Chỉ vẽ MAX_FLOWERS bông mới nhất.
 */
export const GardenField = memo(function GardenField({ wishes, highlightOwn }: GardenFieldProps) {
  const { garden } = weddingConfig
  const shown = wishes.slice(0, MAX_FLOWERS)
  const hidden = wishes.length - shown.length

  if (shown.length === 0) return <p className="garden__empty">{garden.gardenEmpty}</p>

  return (
    <>
      <ul className="garden__field">
        {shown.map((wish) => {
          const seed = `${wish.name}|${wish.message}`
          const hash = hashText(seed)
          const entry = entryFor(wish.flower, seed)
          const style = {
            "--dx": `${((hash >>> 3) % 17) - 8}px`,
            "--dy": `${((hash >>> 9) % 13) - 6}px`,
            "--rot": `${((hash >>> 14) % 15) - 7}deg`,
            "--scale": (0.92 + ((hash >>> 19) % 17) / 100).toFixed(2),
          } as CSSProperties
          const own = highlightOwn && wish.id === ""
          return (
            <li
              key={`${wish.id}|${seed}`}
              className={`garden__bloom${own ? " is-new" : ""}`}
              style={style}
              title={wish.name}
              aria-label={fill(garden.flowerOf, { name: wish.name || garden.anonymous })}
            >
              <FlowerMiniPreview flower={entry.def} />
            </li>
          )
        })}
      </ul>
      {hidden > 0 && <p className="garden__more">{fill(garden.moreFlowers, { count: hidden })}</p>}
    </>
  )
})
