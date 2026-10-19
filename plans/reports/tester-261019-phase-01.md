# Tester Report: Phase 01 (setup, fonts, config, image optimization)

Scope: verification only. No project source modified. No unit test framework exists, so no test suite ran. Diff-aware mode N/A (not a git repo).

## 1. Typecheck and lint
- `npx tsc -b`: exit 0, no errors.
- `npx oxlint src scripts`: exit 0, 0 warnings, 0 errors.

## 2. Production build (`npx vite build`)
- Exit 0, 22 modules, built in 344ms.
- JS: `index-C7vekI0m.js` 226.03 kB raw, **71.78 kB gzip**. Budget 150 KB gzip: PASS.
- CSS: `index-B9pt7Meb.css` 5.64 kB raw, **1.60 kB gzip**.
- HTML: `index.html` 0.87 kB, 0.43 kB gzip.
- Fonts emitted: 28 files (6 families: quicksand, playfair-display, cormorant-garamond, allura, the-nautigal, pinyon-script; each in vietnamese and latin subsets, woff2 and woff). Largest 39.04 kB (pinyon-script latin woff2), smallest 5.26 kB.

## 3. Image budget (<= 250 KB per file)
Manifest `src/generated/image-manifest.json`: 9 keys (`hero/couple`, `photos/photo-01` to `photo-08`). Matches the 9 base files on disk. `smallWidth` 640 matches all 9 `-640` variants.

Dimensions (sips) vs manifest, all 9 base files: MATCH.
- couple 1600x2399; photo-01..06, 08 1200x1800 (photo-02 is 1200x1799, manifest matches); photo-07 1200x800.
- `-640` variants: 640x960 (hero and photos 01-06, 08), photo-07-640 640x427. All consistent with aspect ratio.

Sizes (bytes):
- Hero: couple.webp 206,168; couple-640.webp 54,520. Subtotal 260,688.
- Photos base: 01 292,452 | 02 89,272 | 03 80,246 | 04 83,736 | 05 73,428 | 06 235,432 | 07 154,790 | 08 147,710.
- Photos -640: 01 110,774 | 02 38,296 | 03 35,474 | 04 33,914 | 05 29,560 | 06 96,840 | 07 55,490 | 08 55,492.
- Photos subtotal 1,612,906. Grand total 1,873,594 bytes (~1.79 MiB, 18 files).

**FAIL: `public/photos/photo-01.webp` = 292,452 bytes, over 250 KB** (exceeds both 250,000 and 256,000). All other files pass. Its `-640` variant (110,774) passes.

## 4. Audio `public/audio/bg-music.wav` (88,244 bytes)
- RIFF/WAVE: PASS. RIFF size field 88,236 + 8 = 88,244 = file size.
- fmt: PCM (format 1), mono (1 ch), 11025 Hz, byte rate 11025, block align 1, 8 bits. PASS.
- data chunk: size 88,200 + 44-byte header = 88,244. PASS.

## 5. Not run
`scripts/optimize-images.mjs` not rerun (per instructions).

## 6. Preview server
- Started `npx vite preview --port 4173 --strictPort` (PID 7916, verified via lsof and ps as my process).
- `GET /`: 200 OK, text/html, no-cache. Serves the app HTML with `/assets/index-C7vekI0m.js`.
- `GET /hero/couple.webp`: 200 OK, image/webp, Content-Length 206168.
- `GET /audio/bg-music.wav`: 200 OK, audio/wav, Content-Length 88244.
- Stopped with SIGTERM. Exit 143 is the expected signal. Port 4173 confirmed free.

## 7. Config
- `.gitignore` contains `.env.local` and `source-images/`. PASS.
- `.env.example` contains only `VITE_WISHES_ENDPOINT=` (empty). No secret, no URL. PASS.

## Critical issues
1. `public/photos/photo-01.webp` (292,452 B) exceeds the 250 KB image budget. Fix: re-encode with lower quality or smaller dimensions via the optimize script, then re-run this check. Not done here (instructed not to rerun the script).

## Environment notes
- A PreToolUse hook (`scout-block.cjs`) blocked shell reads of `dist/`. I did not change `.ckignore`. Build output came from the `vite build` log instead.

## Recommendations
1. Re-encode photo-01 under 250 KB, then re-verify.
2. Add a lightweight automated check for the image budget, manifest, and WAV header so this does not depend on manual `ls`/`sips` runs.
3. Add a test runner when a later phase introduces logic (no unit tests exist yet).

## Next steps
1. Fix photo-01 size (P1).
2. Re-run `npx vite build` and the image budget check after the fix.

Status: DONE_WITH_CONCERNS
Summary: tsc and oxlint clean; build JS 71.78 kB gzip (budget 150 KB) and CSS 1.60 kB gzip; preview server serves HTML, hero, and wav with 200s and was stopped cleanly. One failure: photo-01.webp is 292,452 B, over the 250 KB budget.
Concerns/Blockers: photo-01.webp over budget. Unresolved: none beyond the budget unit (250,000 vs 256,000 B). photo-01 fails under both.
