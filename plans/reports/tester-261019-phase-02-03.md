# QA report: Phase 2 (static sections) + Phase 3 (envelope intro)

Date: 2026-10-19. Scope: verification only, no project source changed. No test framework in repo, so checks are command-based scripts.

## 1. Typecheck and lint
- `npx tsc -b`: exit 0, no output.
- `npx oxlint src scripts vite.config.ts`: exit 0. Only warning is the expected one: `src/components/envelope-intro.tsx:29:28 warning react(refs)` (false positive). No other warnings or errors.

## 2. Production build (outDir = scratchpad/test-out)
- `vite build`: 66 modules, built in 388ms, no warnings in output.
- JS: `index-DQZxeYy3.js` 314.82 kB raw, **104.03 kB gzip** (budget 150 kB, OK). GSAP bundled.
- CSS: `index-BKRkRG2L.css` 22.40 kB raw, 5.29 kB gzip.
- Fonts: 36 woff/woff2 files emitted (latin + vietnamese subsets, not counted in JS/CSS budget).
- Built `index.html` from config: `theme-color` = `#8B2F30`, `description` and `og:description` = config description, `<title>` and `og:title` = "Thiệp cưới Mai Anh &amp; Quốc Huy". Injected correctly.
- `og:url` and `og:image` absent. Expected: `meta.siteUrl` is `""` in config, so share tags are dropped by design.
- `class="is-locked"` present on `<html>`.

## 3. Pure-logic checks (scratchpad/logic-check.mjs, esbuild-transpiled modules)
Run under `TZ=Asia/Ho_Chi_Minh`, `TZ=America/Los_Angeles`, `TZ=UTC`. Result: **ALL PASS in all 3 zones** (20 checks each).
- `getEventParts("2026-12-24T10:30:00+07:00")`: day 24, month 12, year 2026, timeLabel "10:30", weekdayUpper "THỨ NĂM", monthShortEn "Dec". OK.
- Edge `2026-12-24T00:30:00+07:00`: stays Dec 24, "00:30", THỨ NĂM. OK.
- `2026-12-23T23:30:00Z` maps to Dec 24 06:30 VN. OK.
- Invalid date string throws Vietnamese error. OK.
- `buildMonthGrid(2026,12)`: length 32, 1 leading null, day 1 at index 1, last cell 31. OK.
- `buildMonthGrid(2028,2)` (Feb 1 2028 = Tuesday, leap): 1 leading null + 29 days. OK.
- Monday-start month (June 2026): no leading null. OK.
- Sunday-start month (March 2026): 6 leading nulls. OK.
- Feb 2026 (Sunday start): 6 leading + 28. OK.
- Feb 2100 (non-leap) = 28 days; Jan 2000 = 31 days. OK.
- All 12 months of 2026: day count matches, leading nulls within 0..6. OK.
- Correction during run: first Feb 2028 expectation was mine and wrong (2 leading), fixed to 1 after confirming weekday via `Date.UTC` (Tue = 2). Code was right.

`useCountdown` (src/hooks/use-countdown.ts): `compute` not exported, so not executed. Code review only: total seconds clamped at 0, days/hours/minutes/seconds decomposition correct, interval cleared on unmount, re-subscribes on `targetMs` change. Reasoning only, not run.

## 4. Static content
- Hard-coded names, places, dates, lunar text, bank data in `src/components` (grep: Mai Anh, Quốc Huy, Phạm, Nguyễn, Hà Nội, TRỐNG, Trống, Ô Chợ, Điện Biên, Bính Ngọ, Lý Văn, 2026, 2000, 1995, 12/05, 05/08, family names, 970422, 012345678, Lễ, Thành Hôn): **0 matches**.
- Image keys in config (9): `hero/couple`, `photos/photo-01` to `photo-08`. All present in `src/generated/image-manifest.json`. Each has `public/<key>.webp` and `public/<key>-640.webp`: all 18 files OK.
- Non-image assets: `public/audio/bg-music.wav`, `public/bride-groom-dancing.gif`, `public/og.jpg`: all exist.

## 5. Hex colors
- Hex literals (`#xxx`/`#xxxxxx`) in `src/**/*.{css,tsx,ts}` excluding `src/styles/tokens.css` and `src/config/wedding-config.ts`: **0 matches**.
- `tokens.css` holds 14 hex definitions (expected).

## 6. Preview server
- Started `vite preview --outDir <scratch test-out> --port 4173 --strictPort` in background (PID 14192). Port 4173 was free before.
- `curl -s /`: returns the built HTML with injected meta and title.
- `curl -sI /photos/photo-01.webp`: 200 OK, image/webp, 255804 bytes.
- `curl -sI /bride-groom-dancing.gif`: 200 OK, image/gif, 967661 bytes.
- Stopped PID 14192 with SIGTERM (task reported exit 143, which is that signal). Port 4173 confirmed free.
- Vite dev server on 5173 (PID 9645) was not touched and is still listening.

## Test results overview
- Automated suites: none in repo. Checks run: 3 typecheck/lint/build, 60 logic assertions (20 x 3 TZ), 18 file checks, 3 grep scans, 3 HTTP checks.
- Pass: all. Fail: 0 after one self-authored expectation fix (see section 3).
- Skipped: `useCountdown` runtime test (not exported); no browser/visual/e2e run; no coverage tool; no performance or flakiness runs (no test harness).

## Concerns
1. `src/config/wedding-config.ts:6` says contents of the mini-game live in `flower-wishes.ts`. The actual file is `flowerWishes.ts` at the project root, outside `src/`. Nothing in `src/` imports it (grep: 0 imports). Either the file is orphaned or the doc comment is stale. Not blocking for Phase 2/3, but it needs resolving.
2. No automated test coverage for `use-countdown.ts`, the envelope open/close flow, or the calendar UI. Logic is covered only by my one-off script, which lives in scratchpad and is not committed. Recommend adding a small test runner (e.g. vitest) for `event-date.ts` and `build-calendar.ts`.
3. `envelope-intro.tsx:29` oxlint `react(refs)` warning is a known false positive per the brief. Still, it is a ref read during render; worth a glance in review even if it does not break behavior.
4. og:image/og:url are omitted until `meta.siteUrl` is filled in. Expected per config comments, but remember to set it before deploy.

Status: DONE_WITH_CONCERNS
Summary: Typecheck, lint (only the expected refs warning), build (JS 104.03 kB gzip, under 150 kB budget), timezone-independent date logic, calendar edge cases, static content and asset checks, and preview HTTP checks all pass. No automated test suite exists, so countdown and UI behavior are unverified at runtime.
Concerns/Blockers: orphan `flowerWishes.ts` vs doc reference to `flower-wishes.ts`; no test harness; og share tags empty until siteUrl set.

Unresolved questions:
- Is `flowerWishes.ts` at the project root meant to move into `src/` (and be imported), or is it dead content?
