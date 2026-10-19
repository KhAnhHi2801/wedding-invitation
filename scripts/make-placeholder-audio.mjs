/**
 * Tạo file nhạc nền TẠM (WAV mono 8-bit, vòng lặp ~8 giây, âm sine rất nhẹ) để nút nhạc có thứ phát.
 * Khi có nhạc thật: đặt file vào `public/audio/` và đổi `music.src` trong `src/config/wedding-config.ts`.
 * Chạy: `npm run placeholder-audio`
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const SAMPLE_RATE = 11025
const SECONDS = 8
// Hợp âm Đô trưởng thưa (C4, E4, G4); chu kỳ chia hết nên vòng lặp không bị click.
const NOTES = [261.63, 329.63, 392.0]

const total = SAMPLE_RATE * SECONDS
const data = Buffer.alloc(total)
for (let i = 0; i < total; i++) {
  const t = i / SAMPLE_RATE
  const swell = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / total)
  let sample = 0
  for (const f of NOTES) sample += Math.sin(2 * Math.PI * f * t)
  data[i] = 128 + Math.round((sample / NOTES.length) * 18 * swell)
}

const header = Buffer.alloc(44)
header.write("RIFF", 0)
header.writeUInt32LE(36 + total, 4)
header.write("WAVEfmt ", 8)
header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20)
header.writeUInt16LE(1, 22)
header.writeUInt32LE(SAMPLE_RATE, 24)
header.writeUInt32LE(SAMPLE_RATE, 28)
header.writeUInt16LE(1, 32)
header.writeUInt16LE(8, 34)
header.write("data", 36)
header.writeUInt32LE(total, 40)

const out = path.resolve(import.meta.dirname, "..", "public", "audio", "bg-music.wav")
await mkdir(path.dirname(out), { recursive: true })
await writeFile(out, Buffer.concat([header, data]))
console.log(`Đã tạo ${out} (${Math.round((44 + total) / 1024)}KB). Đây là file TẠM.`)
