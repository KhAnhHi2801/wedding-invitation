/**
 * Nén ảnh thiệp: đọc bản gốc ở `source-images/`, ghi bản nhẹ vào `public/`.
 * - hero: tối đa 1600px chiều rộng; ảnh thường: 1200px; mỗi ảnh có thêm bản 640px cho `srcset`.
 * - WebP, giảm chất lượng dần cho tới khi ≤ MAX_BYTES (hoặc chạm sàn MIN_QUALITY).
 * - Hoạt họa: `source-images/animations/*.gif` -> WebP động (+ ảnh tĩnh `-still.webp` cho người dùng giảm chuyển động).
 * - Tạo `public/og.jpg` (1200x630) từ ảnh hero cho thẻ chia sẻ (og:image cần JPEG/PNG tuyệt đối).
 * - Báo lỗi (thoát mã 1) nếu còn ảnh vượt ngân sách ngay cả ở chất lượng thấp nhất.
 * - Ghi `src/generated/image-manifest.json` (kích thước từng ảnh) để dựng `srcset`, `width`, `height` mà không bị dịch bố cục.
 * Chạy: `npm run images`
 */
import { mkdir, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.resolve(import.meta.dirname, "..")
const MAX_BYTES = 250 * 1024
const START_QUALITY = 80
const MIN_QUALITY = 50

const JOBS = [
  { dir: "hero", width: 1600 },
  { dir: "photos", width: 1200 },
]
const SMALL_WIDTH = 640
const ANIMATION_WIDTH = 360

async function encode(file, width, quality) {
  return sharp(file, { failOn: "none" })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer()
}

/** Giảm chất lượng từng bước 4 cho tới khi vừa ngân sách dung lượng. */
async function encodeWithinBudget(file, width) {
  let quality = START_QUALITY
  let buffer = await encode(file, width, quality)
  while (buffer.length > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 4
    buffer = await encode(file, width, quality)
  }
  return { buffer, quality }
}

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`

async function main() {
  let before = 0
  let after = 0
  const manifest = {}
  const overBudget = []
  for (const { dir, width } of JOBS) {
    const srcDir = path.join(ROOT, "source-images", dir)
    const outDir = path.join(ROOT, "public", dir)
    await mkdir(outDir, { recursive: true })
    for (const name of (await readdir(srcDir)).filter((n) => n.endsWith(".webp")).sort()) {
      const src = path.join(srcDir, name)
      const base = name.replace(/\.webp$/, "")
      const original = (await stat(src)).size
      const full = await encodeWithinBudget(src, width)
      const small = await encodeWithinBudget(src, SMALL_WIDTH)
      // Ghi thẳng buffer đã nén: sharp(buffer).toFile() sẽ mã hóa lại WebP và phá ngân sách dung lượng.
      await writeFile(path.join(outDir, `${base}.webp`), full.buffer)
      await writeFile(path.join(outDir, `${base}-${SMALL_WIDTH}.webp`), small.buffer)
      const fullMeta = await sharp(full.buffer).metadata()
      const smallMeta = await sharp(small.buffer).metadata()
      manifest[`${dir}/${base}`] = {
        width: fullMeta.width,
        height: fullMeta.height,
        smallWidth: smallMeta.width,
      }
      for (const [label, result] of [[name, full], [`${base}-${SMALL_WIDTH}.webp`, small]]) {
        if (result.buffer.length > MAX_BYTES) overBudget.push(`${dir}/${label} (${kb(result.buffer.length)})`)
      }
      before += original
      after += full.buffer.length + small.buffer.length
      console.log(
        `${dir}/${name}: ${kb(original)} -> ${kb(full.buffer.length)} (q${full.quality}) + ${kb(small.buffer.length)} (${SMALL_WIDTH}px)`,
      )
    }
  }
  const animDir = path.join(ROOT, "source-images", "animations")
  for (const name of (await readdir(animDir).catch(() => [])).filter((n) => n.endsWith(".gif")).sort()) {
    const base = name.replace(/\.gif$/, "")
    const src = path.join(animDir, name)
    let quality = 75
    let animated = await sharp(src, { animated: true }).resize({ width: ANIMATION_WIDTH }).webp({ quality, effort: 5, loop: 0 }).toBuffer()
    while (animated.length > MAX_BYTES && quality > MIN_QUALITY) {
      quality -= 5
      animated = await sharp(src, { animated: true }).resize({ width: ANIMATION_WIDTH }).webp({ quality, effort: 5, loop: 0 }).toBuffer()
    }
    const still = await sharp(src).resize({ width: ANIMATION_WIDTH }).webp({ quality: 80 }).toBuffer()
    await writeFile(path.join(ROOT, "public", `${base}.webp`), animated)
    await writeFile(path.join(ROOT, "public", `${base}-still.webp`), still)
    if (animated.length > MAX_BYTES) overBudget.push(`${base}.webp (${kb(animated.length)})`)
    console.log(`animations/${name}: ${kb((await stat(src)).size)} -> ${kb(animated.length)} (q${quality}) + still ${kb(still.length)}`)
  }
  await sharp(path.join(ROOT, "source-images", "hero", "couple.webp"))
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(ROOT, "public", "og.jpg"))
  const manifestDir = path.join(ROOT, "src", "generated")
  await mkdir(manifestDir, { recursive: true })
  await writeFile(path.join(manifestDir, "image-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Tổng: ${kb(before)} -> ${kb(after)}`)
  if (overBudget.length) {
    console.error(`VƯỢT NGÂN SÁCH ${kb(MAX_BYTES)}: ${overBudget.join(", ")}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
