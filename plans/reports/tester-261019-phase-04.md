# Phase 4 QA report (verification only, no project source changed)

## 1. Typecheck / lint / unit tests
- `npx tsc -b`: exit 0, no errors.
- `npx oxlint src scripts vite.config.ts`: 0 errors, 1 warning = expected `react(refs)` at `src/components/envelope-intro.tsx:31`. No other warnings.
- `npx vitest run`: 4 files, 20 tests, all pass. Same result with `TZ=America/Los_Angeles` and `TZ=UTC`.

## 2. Production build (scratch: `.../scratchpad/test4-out`)
Built 118 modules, no warnings.

| Asset | Raw | Gzip (vite) |
|---|---|---|
| assets/index-BvdmgB2E.js (main) | 334.86 kB | 110.73 kB (budget 150 kB: PASS) |
| assets/ScrollTrigger-BoM0pWIV.js (lazy) | 42.74 kB | 17.54 kB |
| assets/browser-B9dlc0Op.js (qrcode, lazy) | 23.46 kB | 8.85 kB |
| assets/index-DogwH57B.css | 28.62 kB | 6.60 kB |

- ScrollTrigger is a separate chunk. Main references it only through dynamic `import()`.
- qrcode is a separate chunk. Its code is in `browser-*.js` (qrcode error-correction tables and `toDataURL`). Main loads it through dynamic `import("qrcode")` in `gift-qr.tsx`. Not a static import.
- Fonts emitted as separate woff/woff2 assets, 5 to 39 kB each.
- Built `index.html`:
  - `<link rel="preload" as="image" fetchpriority="high" imagesrcset="/hero/couple-640.webp 640w, /hero/couple.webp 1600w" imagesizes="(min-width: 640px) 30rem, 80vw" />` present.
  - `theme-color`, description, og:title, og:description, og:type present.
  - og:image / og:url omitted (`siteUrl` empty). Matches config comment.
  - `<html class="is-locked">` present.

## 3. Scratch logic tests (`.../scratchpad/qa/qa-logic.mjs`, node 26 direct .ts import)
Result: 40 pass, 0 fail.
- (b) viet-qr: payload `00020101021138530010A0000007270123000697042201090123456780208QRIBFTTA53037045802VN6304AB10`.
  - CRC tail `AB10` equals an independent table-driven CRC-16/CCITT-FALSE. Sanity value for "123456789" = 29B1.
  - Top-level TLVs parse to exact end: 00, 01, 38, 53, 58, 63.
  - Tag 38: 00=A000000727, 01 = {00=970422, 01=012345678}, 02=QRIBFTTA. Consumed exactly.
  - Bad BIN (5 digits) and 20-char account rejected.
- (c) rsvp-validation:
  - Name 80 ASCII valid, 81 invalid. Name 80 with surrounding spaces valid (trimmed). Whitespace-only name invalid.
  - Guests "10" valid. "11", "0", "", "1.5" invalid.
  - Note whitespace-only valid. Note 300 valid, 301 invalid.
  - NFD "ệ" x80 valid, x81 invalid. NFD x300 note valid.
- (a) guest.ts (window stubbed): `Anh%20Nam` ok, empty/space-only fallback, control chars to space, NFD normalized, 40-char cap.
- (d) scroll-lock.ts: DOM-dependent, NOT executed. Reasoned only. Ref-count logic looks right. `is-locked` removed only when count hits 0. Release fn idempotent via `released` flag.

## 4. Static checks
(a) Hard-coded user-visible text in `src/App.tsx` and `src/components/*.tsx`: none found. Non-ASCII literals are only comments plus decorative glyph `囍` in `icons/double-happiness.tsx`. Caveat: grep covers non-ASCII text only, so ASCII-only English literals were not exhaustively reviewed.

(b) Hex colors: only `#8B2F30` in `config/wedding-config.ts` (themeColor). None outside `styles/tokens.css` and config. `rgba()` literals exist in component CSS and SVG (`floating-actions.css`, `rsvp-modal.css`, `envelope-intro.css`, `gift.css`, `icons/wax-seal.tsx`). Shadows and overlays, not brand colors. Minor token-hygiene note only.

(c) Config media:
- `bride-groom-dancing.webp`: 254,154 bytes, VP8X animation flag set. Limit 256,000: PASS, margin about 1.8 kB.
- `bride-groom-dancing-still.webp`: 15,686 bytes, static. Exists.
- `audio/bg-music.wav`: 88,244 bytes. Exists. Placeholder per config (8-bit mono 11025 Hz).

(d) `public/`: no `.gif`, no `.DS_Store`.

(e) `data-reveal` presets: 10 used (fadeIn, fadeUp, slideLeft, slideRight, scaleIn, scaleUp, lineY, wipeToLeft, wipeToRight, write). All have CSS in `styles/reveal.css`. No CSS preset unused. 42 selector class tokens across all REVEAL rules, 0 mismatches vs component JSX. Check is a substring match, not element-tree match.

## 5. Preview server
- Started `vite preview --outDir test4-out --port 4173 --strictPort` (PID 19450). Port was free before.
- `curl -sI`: `/bride-groom-dancing.webp` 200 (254154 B, image/webp). `/bride-groom-dancing-still.webp` 200 (15686 B). `/audio/bg-music.wav` 200 (88244 B, audio/wav). `/hero/couple.webp` 200 (222540 B).
- Root HTML served, same preload and script tags as build output.
- Stopped PID 19450 (SIGTERM, exit 143). Port 4173 free.
- Dev server on 5173 (PID 17889) untouched.

## Concerns
1. **Nested project leaks into prod build.** `public/gieo-một-lời-chúc/` (separate app: `src/`, `package.json`, `vite.config.ts`, `.env.example`, README) is copied verbatim into `dist` output: 22 files. Not a secret (`.env.example` holds placeholder `GEMINI_API_KEY` only), but unrelated source is published. Recommend moving it out of `public/`. Not changed here (verification only).
2. **`guest.ts` splits surrogate pairs.** `.slice(0, 40)` on UTF-16 can end on a lone high surrogate. Probe: 39 ASCII + emoji gives length 40 with lone surrogate. Renders as replacement char, no XSS (React escapes). Fix: slice by code points (`Array.from(...).slice(0, 40).join("")`).
3. **RSVP length counts code points, not visible chars.** `rsvp-validation.ts` comment says emoji not counted as 2. Probe: family ZWJ emoji = 5 code points, so 80 visible family emoji are rejected. Plain NFD letters without precomposed form (`q` + U+0303) x80 also rejected (160 code points). Consider `Intl.Segmenter` (grapheme) if "visible char" is the intent. Spec ambiguity, not a test failure.
4. **Coverage not measured.** Did not run `vitest --coverage`. Untested modules: `guest.ts`, `scroll-lock.ts`, `gift-qr.tsx`, `wishes-api.ts`, all components. Only 4 test files exist (use-countdown, date-calendar, rsvp-validation, viet-qr). RSVP modal submit flow, gift QR lazy load, and reduced-motion paths have no tests.
5. **Animated WebP near budget.** 254,154 B vs 256,000 B limit. Any re-export will likely break it.
6. **Preload uses root-absolute URLs.** Built HTML has `/hero/couple*.webp` and `/assets/*`. `vite.config` sets no `base`. `wedding-config.ts` comment claims paths work when site is in a subfolder. Subfolder deploy would likely break unless `base` is set. Not verified beyond build output.
7. **Music is placeholder** (`audio/bg-music.wav`, 8-bit 11025 Hz, per config comment). Confirm replacement before release.

## Unresolved questions
- Is the `public/gieo-một-lời-chúc/` folder meant to ship? If not, remove it from `public/`.
- Is "visible char" meant as grapheme count (affects concern 3)?
- Is subfolder deployment a requirement (affects concern 6)?

Status: DONE_WITH_CONCERNS
Summary: Typecheck, lint (only expected warning), 20/20 tests in 3 TZs, build (main 110.7 kB gz, ScrollTrigger and qrcode lazy), and preview all pass. Concerns: unrelated nested app shipped in public/, two small validation/edge bugs, no coverage run.
Concerns/Blockers: see Concerns list above (1 to 7).
