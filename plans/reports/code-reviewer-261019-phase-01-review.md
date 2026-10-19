# Code Review: Phase 1 (setup, font, config)

## Scope
package.json, tsconfig*, vite.config.ts, index.html, .gitignore, .env.example, src/main.tsx, src/App.tsx, src/config/wedding-config.ts, src/styles/{tokens,fonts,global}.css, src/lib/{device-tier,gsap,images}.ts, src/generated/image-manifest.json, scripts/{optimize-images,make-placeholder-audio}.mjs, public/audio/bg-music.wav.

## Checks run
- `tsc -b`: pass. TS 6.0.3 has `strict` on by default (I checked with a test file: implicit any and null were rejected), so leaving `strict` out of tsconfig.app.json is fine.
- `oxlint src scripts`: 0 issues.
- `vite build` (written to the scratchpad): JS 226.03 KB raw / **71.78 KB gzip**, CSS 1.60 KB gzip, 28 font files (7 faces x latin+vietnamese x woff2/woff). GSAP is not in this number yet because nothing imports `src/lib/gsap.ts`.
- Image sizes: total for hero+photos is 1.8 MB (under 3 MB). **photo-01.webp is 292,452 B = 286 KB, over the 250 KB limit.**
- Loose hex colors: only `wedding-config.ts:88` themeColor (allowed).
- WAV header: correct (RIFF size 36+N, PCM, mono, 11025 Hz, byteRate 11025, blockAlign 1, 8-bit, data N=88200). Loop has no click because the cos swell is 0 at both ends.

## Acceptance criteria
| # | Result |
|---|---|
| 1 dev/fonts | PASS (only latin+vietnamese imported; both subsets together cover Đ/ễ/ơ/ư) |
| 2 no loose hex | PASS |
| 3 images <=250KB | **FAIL**: public/photos/photo-01.webp is 286 KB |
| 4 ?lite=1 | PASS (main.tsx:9 runs before render) |
| 5 content in config | PARTIAL: index.html:6-11 hard-codes title/description/theme-color, copying `meta` |
| 6 JS <=150KB gzip | PASS today (72 KB); see the budget notes |
| 7 contracts | PARTIAL: see image keys, base path, mapsUrl, ogImage, bank BIN |

## Critical
1. **scripts/optimize-images.mjs:58-59 re-encodes the image after the size budget is checked.** `sharp(full.buffer).toFile(x.webp)` decodes the checked buffer and encodes it again at sharp's default quality (80). So the file on disk is not the buffer that was measured. Measured on photo-01: the q50 buffer is 215,602 B, but after re-encoding it becomes 248,454 B. This causes the photo-01 failure, adds a second round of quality loss to every image, and makes the size printed in the log wrong. Fix: `await writeFile(path.join(outDir, `${base}.webp`), full.buffer)` (same for small), and read metadata from the buffer as now. Also, when the loop reaches MIN_QUALITY and the image is still too big, it stays silent. Make it `process.exitCode = 1` or log a warning, so the budget is enforced.

## Important
2. **index.html:6-11 copies `meta` from the config by hand.** Changing the names in wedding-config.ts will not update the title, OG tags or theme-color. Inject them with a small `transformIndexHtml` plugin in vite.config.ts that imports the config, or treat index.html as the source and remove `meta` from the config. One source only.
3. **`ogImage: "/hero/couple-640.webp"` (wedding-config.ts:87) will not work as an OG image.** OG needs an absolute URL, and Zalo/Facebook support for WebP is unreliable. Phase 6 plans `public/og.jpg`. Add `meta.siteUrl` and build `og:image` = siteUrl + "/og.jpg".
4. **Absolute "/" paths everywhere** (images.ts:26-27, `music.src`, `ogImage`). These break if the site is deployed under a sub-path (GitHub Pages project site). Prefix with `import.meta.env.BASE_URL`, or record in the plan that the site is always served from the root.
5. **Image keys are plain `string`, and `imageSet` throws during render** (images.ts:24, used from config fields `photo`, `photos[]`, `background`). One typo in the config means a white screen in production, because there is no error boundary. Type the keys: `export type ImageKey = keyof typeof manifest` and use `ImageKey` in `Person.photo`, `BankAccount.photo`, `marryMe.photos`, etc. Then `tsc` catches typos.
6. **The gift QR contract has no bank BIN** (BankAccount, wedding-config.ts:32-39). A QR that banking apps can scan (VietQR/NAPAS) needs a BIN (MB Bank = 970422), not the display name "MB Bank". Add `bankBin: string` now, so phase 4 does not change the config type. Note: both sample account numbers are the same "012345678" placeholder.
7. **mapsUrl is a second source and has already drifted** (wedding-config.ts:122-123). Decoded, `mapsUrl` leaves out "Ô Chợ Dừa", which `mapsQuery` includes. Phase 2 also needs an embed URL. Build both from `mapsQuery` with `encodeURIComponent` in a helper, and delete `mapsUrl`.

## Minor
8. vite.config.ts has no `build.rollupOptions` chunking, although the plan step 9 asks for it. Budget today: React 72 KB gzip, plus about 45 KB once gsap+ScrollTrigger are imported eagerly from lib/gsap.ts, which gets close to 150 KB. page-flip, qrcode and flower-bloom must stay behind `React.lazy` (phase 5 plans this). ScrollTrigger is used across the main page, so importing it eagerly is acceptable. Watch the margin.
9. public/ ships `bride-groom-dancing.gif` (945 KB) and `.DS_Store` into the built site. The gif breaks "every image in public/ <=250KB" from the phase 1 success criteria. Convert it to WebP/MP4 or move it out. Add `.DS_Store` cleanup.
10. index.html has no font preload. The plan asks to preload only the hero font. Vite hashes the asset names, so a plugin or manual `<link rel=preload>` is needed. The Pinyon Script vietnamese+latin woff2 files are the candidates.
11. global.css:63: `touch-action: none` on `html.is-locked` also blocks pinch-zoom on the intro. The plan says not to lock zoom. Use `overflow: hidden` only, or `touch-action: pinch-zoom`.
12. global.css:24: `overflow-x: hidden` on body can interfere with `position: sticky` and ScrollTrigger pinning. Prefer `overflow-x: clip`.
13. global.css:66-77: the reduced-motion rule only affects CSS. GSAP and rAF animations ignore it, so later phases must check `shouldReduceEffects()` / `gsap.matchMedia()`. This is noted for phase 5 only.
14. device-tier.ts:18: iPadOS 13+ reports a "Macintosh" user agent, so it gets past the iPad exclusion and may be marked lite. Add `|| (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)`. It is a faithful port of preview-wedding, so this is optional.
15. Config values that must be kept in sync with `startsAt` by hand: `hero.year` "NĂM 2026", `saveTheDate.monthLabel` "Dec", `lunarText`. Build year and month from `startsAt`, or add a comment saying to change them together.
16. optimize-images.mjs:52 only reads `*.webp` sources (JPG/PNG are skipped silently) and never removes outputs whose source was deleted. EXIF/GPS is stripped (sharp's default), which is good for privacy.
17. `.env` itself is not ignored (only `*.local`). `VITE_*` values are compiled into the public JS anyway, so do not put secrets there. The Apps Script URL is public by design.
18. Plan says `public/audio/bg-music.mp3`, but the code uses `.wav` (88 KB). Fine, but update the plan text. The phase 3 player should use `preload="none"`.

## Security
No secrets. `.env.local` is covered by both `*.local` and an explicit entry. No `dangerouslySetInnerHTML` and no eval.

## Recommended order
1 (re-run `npm run images`), 5, 2, 7, 6, 3/4, then the rest.
