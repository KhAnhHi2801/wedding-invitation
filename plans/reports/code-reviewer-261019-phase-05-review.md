# Phase 5 review: garden mini-game, wishes API, guestbook

Scope: flower-bloom feature, wishes-api/store/validation/style, flower-entries, guestbook-book.js, garden/guestbook components + CSS, App.tsx, apps-script/wishes.gs + test, docs/wishes-setup.md, tsconfig.app.json. Static review only (no endpoint access, no dev server).

## Checks run
- `tsc -b`: clean. `oxlint src`: only the known envelope-intro.tsx:31 warning.
- `vitest run`: 9 files / 60 tests pass (includes apps-script/wishes.test.mjs; it imports vitest, so `node --test` on it fails by design).
- Build to scratch: main `index` 341.85 KB / **113.33 KB gzip**; lazy: `garden-content` 13.10 KB gz, `guestbook` (page-flip) 15.31 KB gz, shared `wish-validation` chunk (flower data + mini preview) 13.54 KB gz, `browser` (qrcode) 8.86 KB gz. Grep confirms no flower renderer or page-flip code in main. Prototype folder is not in the output.
- `public/flowers/`: 16 files, 1.2 MB, copied verbatim into the build, referenced by nothing. Delete it, or move it out of `public/`.

## Critical
None found.

## Important

1. **Permanent server rejections poison the wish queue** (`src/lib/wishes-api.ts:77-80,121,159-167`). The server returns `name_too_long`, `message_too_short`, `message_too_long` (wishes.gs:109-111). The client maps any unknown code to `"server"`, and `"server"` is retryable. The entry is then retried forever: at 90s intervals while the page is open, and again on every later visit. Because the queue is processed in order, every wish behind it is blocked too. This is reachable. The client counts graphemes (`charCount`, Intl.Segmenter). The server counts code points after removing `\p{Cf}`. A 38-character name plus a flag emoji is 39 graphemes on the client and 41 code points on the server. Fix: map the `*_too_*` / `name_required` codes to permanent `invalid`. Also align the counting (either both use code points after NFC, Cf-strip and whitespace collapse, or the server uses graphemes). Optionally cap `server` retries.
2. **Profanity handling contradicts the plan and the docs** (`src/lib/wish-validation.ts:43`, `docs/wishes-setup.md:76`). The client blocks the wish with `errors.profanity`. The success criterion and the docs say it should be accepted, stored as hidden, and still visible to the sender. The server's hidden path is only reachable by calling the API directly. This is a product decision: either drop the client block (the server already hides it), or keep it and fix the docs and the plan criterion.
3. **Bloom stage keeps repainting the full flower after it blooms** (`bloom.css:39-48`, `BotanicalFlowerEngine.tsx:102-147`).
   - The pollen `<circle>`s animate a transform inside the same SVG as the flower. SVG child animation is not composited, so the whole flower layer repaints every frame, indefinitely, on non-lite devices. That cancels the gain from moving the sway onto the HTML div.
   - The sway is `infinite` and keeps `will-change: transform` permanently. The plan's step 4 (stop after about 10s or when offscreen, will-change only while blooming) is not implemented.
   - Both effects keep running through the writing and done steps, while the guest scrolls to the page-flip book.
   - Fix: move the pollen to its own HTML or SVG layer above the flower (or limit it to N iterations), stop the sway after about 10s, and pause both with useInView.
4. **Guestbook keyboard handler listens on the whole window** (`src/lib/guestbook-book.js:577-590`). Whenever the book is "active" (in view plus 200px):
   - While the book is shut, Enter or Space pressed anywhere reopens it. That includes Space used to scroll the page and Enter on the garden's submit button.
   - The arrow keys flip pages no matter where focus is.
   - Modifier keys are not checked, so Alt+ArrowLeft navigates the browser back and also flips a page.
   - Fix: return early unless `host.contains(document.activeElement)` (or focus is on body), and bail on `e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented`.
5. **Guestbook rebuilds on every resize** (`guestbook-book.js:592-601`). The `is-typing` guard checks a class that nothing in `src` ever sets. On mobile, the URL bar showing or hiding and the virtual keyboard opening (the garden textarea sits right above the book) both fire `resize`. `bookSize()` reads `innerHeight`, so each of these triggers a full re-paginate and page-flip rebuild of up to 400 wishes while the guest scrolls or types. Fix: compute `bookSize()` and rebuild only when width, height or portrait actually changed (ignore height-only changes smaller than about 120px), and remove the dead `is-typing` check.
6. **Bloom sounds ignore the site's mute** (`features/flower-bloom/audio.ts:21`). The plan requires the seed, sprout and chime sounds to be off when the guest has muted the site. `soundManager.toggle` is never called and there is no link to `lib/music.ts`, so the sounds play even when the site music is paused.
7. **`MESSAGE_MAX = 30000` on a public "Anyone" endpoint** (`wishes.gs:50`, `wish-validation.ts:12`, `wishes-api.ts:197-198`). The cap is 500 wishes per day and the token is spoofable. With 30 KB messages, one page of 50 is about 1.5 MB, so `safePut_` silently fails (CacheService limit is 100 KB) and every GET reads the whole sheet. Guests would download up to 400 × 30 KB, and the book paginates all of it. The limit was carried over from the source project, so it is a user decision. Options: lower it to about 1–2k characters on both sides, or keep it and accept the risk.
8. **Flower carousel radios likely do not scroll into view with the keyboard** (`garden.css:134`, medium confidence). `.garden__card` has no `position: relative`. The `.sr-only` radio is absolutely positioned, so its containing block is `.container`, which sits outside the `overflow-x: auto` scroller. Focusing a radio with the arrow keys then does not scroll the carousel to the checked card. Fix: add `position: relative` to `.garden__card`. Verify in a browser.
9. **Tests miss the riskiest logic.**
   - The `wishes-api` queue has no tests: retryable vs permanent errors, no network and no timers when the endpoint is empty, persistence, requestId, retry schedule. It is a pure module that is easy to test with a fetch mock and fake timers.
   - There is no sync test for `PROFANITY` / `PROFANITY_WORDS`, `INK_KEYS` / `INKS`, or `NAME_MAX` / `MESSAGE_MIN` / `MESSAGE_MAX` between wishes.gs and src. A `FLOWER_IDS` test exists and the same regex approach works for these.
   - `use-bloom-progress.test.ts` only covers the pure `stageFromProgress`.
   - `paginate` and `wrapLines` in guestbook-book.js are untested.

## Minor
- `wishes-api.ts:159-175`: `flushPending` iterates over a snapshot. A wish submitted while a flush is in flight is skipped by the early return and stays queued until the next `online` event or reload. Loop until `pending()` is empty.
- `wishes-api.ts:62-66` vs `115,183`: the stored `elapsedMs` is overwritten by `post()`, so the field is dead and its comment is wrong. It works in practice only because the startup flush waits 4s.
- `wishes-api.ts:137-146`: a non-empty `memoryPending` shadows localStorage, so two open tabs overwrite each other's queued entries (lost update).
- `wishes-api.ts:1-7`: the header contract still describes only RSVP.
- `garden-field.tsx:35-38`: `hash >> n` on an unsigned hash becomes negative for about half the hashes, so `--dx` ranges from -24 to 8px and flowers lean left. Use `>>>`. Same pattern in `guestbook-book.js:228` (tilt).
- `guestbook.tsx:79,86-94` plus `guestbook-book.js:614-635`: the book is built 2–3 times on mount or submit (first `setWishes`, the effect's `setWishes`, then `reveal` → `build`).
- `guestbook-book.js:626-629`: `reveal()` while inactive (the usual case, since the guest is in the garden) only sets `dirty`. The jump to `pageOfNew` is never applied on the later `setActive(true)`.
- `guestbook-book.js:538-575`: `dispose()` does not remove the button and holder listeners. Under StrictMode in dev, handlers are doubled. Use one `AbortController` signal for every listener.
- `guestbook-book.js:495`: `startPage: currentPage` reuses an index after a cropped ↔ spread switch, but the two layouts use different index layouts (cropped has blank pages interleaved), so it lands on the wrong page.
- `guestbook-book.js:64,73-74,192`: stale comments (back-to-top button, an orphan comment about a removed constant, "hộp quẻ").
- `tsconfig.app.json`: `allowJs` without `checkJs` leaves guestbook-book.js unchecked (`texts: any`), so a missing `GuestbookText` key would not be caught. Add `// @ts-check` to the file.
- Config-driven text (criterion 7): the `INKS` labels are hard-coded Vietnamese in `lib/wish-style.ts:13-18`. `garden.sending` and `garden.openGuestbook` are unused config keys. guestbook-book.js contains no UI text (only decorative SVG); name and message are always set via `textContent`; `flowerSvg` and `inkColor` only resolve whitelisted values.
- `BotanicalPathLeaf.tsx:50`: sets `willChange: transform` on every SVG `<g>`. It has no benefit, and contradicts the engine comment "no permanent will-change".
- a11y:
  - On the growing step, focus moves to the panel, but the skip button sits earlier in the DOM (showcase), so keyboard users have to Shift+Tab to reach it.
  - The `role="status"` containers are inserted together with their text, so some screen readers will not announce them. Keep a persistent live region.
  - The focused panel has no accessible name.
- `hooks/use-in-view.ts:17`: without IntersectionObserver the garden and guestbook never load. Fall back to `setInView(true)`.
- `wishes.gs:210`: `doGet` can call `insertSheet` without the lock, racing a concurrent first `doPost` (worst case one `server` error). The daily Properties keys accumulate forever (negligible).
- Placeholders (48rem / 34rem) are approximate. Any layout shift happens offscreen because of the 600px rootMargin, so it is acceptable.

## Acceptance criteria status
1. Flow: OK. Choose → sow (5.2s full, 2s on `html.lite`, finishes immediately under reduced motion) → write (random prefilled wish, "Đổi gợi ý" avoids repeating, ink radios) → done (random reply, `addOwnWish` shows the flower immediately). Divergence: profanity is blocked (#2).
2. Perf: OK for progress isolated in BloomPlayer, the 33ms throttle, rAF cancelled on unmount, gradient glow, sway on an HTML div, two SVG layers, pollen and sway off on lite/reduced motion, lazy chunks, wishes loaded once via the shared store, IntersectionObserver disconnects. Gaps: #3 and #5.
3. Queue: OK for localStorage persistence, delays of 3/10/30/90s, no network and no timers without an endpoint, requestId, elapsedMs. Bug: #1. The flower id list matches (tested). Ink keys and limits match today (not tested). The two profanity lists are identical today (not tested).
4. Apps Script: formula protection uses two layers (`@` number format plus a space prefix, removed on read). The lock is held across the read-check-append. The rate-limit check comes after the requestId replay check. The cursor logic is correct. RSVP is not readable through any GET. Hidden rows are excluded. Errors never expose internals. Risks: #7 and the minor items.
5. guestbook-book.js: ctx is reset in `dispose`, `{page}/{total}` are filled, cropped mode works, and the probe/shrink loop is capped at 3. No leftover globals or Spanish strings. HTML is built safely. Keyboard: #4.
6. a11y: native radios, labels, `role=alert` plus `aria-describedby`, focus moves to the first invalid field, targets are ≥ 44px (ink 2.75rem, buttons ≥ 2.75rem, nav 44px), reduced-motion paths exist. Measured contrast: theme text on paper about 4.8, `.garden__more` on the tinted background 5.11, guestbook `--muted` on paper 4.56 (just passes AA), `--wine-2` on the tinted background 6.56. Gaps: #8 and the minor a11y items.
7. Text from config: mostly OK (INKS labels excepted).
8. Layout: `.section { overflow-x: clip }` contains the guestbook's 2× wide stage and the carousel. The FAB reads `#garden`, which always exists (the GardenSection shell). OK.
9. Tests: see #9. The existing wishes.gs and wishes-store tests are meaningful.
10. Phase 6: delete `public/flowers` (1.2 MB). Measure the guestbook rebuild cost with about 400 wishes. Main bundle is 113 KB gzip.

Status: DONE_WITH_CONCERNS
Summary: Phase 5 is mostly correct, has clean chunking, and passes tsc, lint, tests and build. Two problems should be fixed before shipping: the wish queue can get stuck forever on a permanent server rejection, and the guestbook takes keystrokes from the whole page and rebuilds on every resize.
Concerns/Blockers: #1 queue poisoning (unknown error codes treated as retryable, client and server count length differently); #2 profanity behavior needs a user decision; #3 pollen/sway repaint and missing stop; #4 global keydown; #5 resize rebuild with dead `is-typing` guard; #6 sounds ignore the site mute; #7 MESSAGE_MAX 30000 on a public endpoint (user decision); #8 carousel keyboard scroll (verify in browser); #9 no tests for the wishes-api queue or the constant-sync checks.
